import React, { createContext, useContext, useState, useEffect } from "react";
import { Requester } from "../api.js";
import { useAuth } from "./AuthContext.js";

interface RequesterContextType {
  selectedRequester: Requester | null;
  setSelectedRequester: (requester: Requester | null) => void;
  isSelectorOpen: boolean;
  setIsSelectorOpen: (open: boolean) => void;
}

const STORAGE_KEY = "toktickit_selected_requester";

const RequesterContext = createContext<RequesterContextType | undefined>(undefined);

export const RequesterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  let authContext: any = null;
  try {
    authContext = useAuth();
  } catch (_e) {}

  const user = authContext?.user;

  const [selectedRequester, setSelectedRequesterState] = useState<Requester | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(!selectedRequester);

  const setSelectedRequester = (requester: Requester | null) => {
    setSelectedRequesterState(requester);
    if (requester) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requester));
      setIsSelectorOpen(false);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setIsSelectorOpen(true);
    }
  };

  useEffect(() => {
    if (user) {
      if (!selectedRequester || selectedRequester.id !== user.id) {
        setSelectedRequester({
          id: user.id,
          name: user.name,
          email: user.email,
          department: user.department || "General",
          isActive: user.isActive ?? true,
        });
      }
    }
  }, [user]);

  return (
    <RequesterContext.Provider
      value={{
        selectedRequester,
        setSelectedRequester,
        isSelectorOpen,
        setIsSelectorOpen,
      }}
    >
      {children}
    </RequesterContext.Provider>
  );
};

export const useRequester = (): RequesterContextType => {
  const context = useContext(RequesterContext);
  if (!context) {
    throw new Error("useRequester must be used within a RequesterProvider");
  }
  return context;
};
