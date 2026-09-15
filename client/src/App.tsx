import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { RequesterProvider } from "./context/RequesterContext.js";
import { Header } from "./components/Header.js";
import { RequesterSelectorScreen } from "./components/RequesterSelectorScreen.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";
import { MyTicketsView } from "./components/MyTicketsView.js";
import { TicketDetailView } from "./components/TicketDetailView.js";
import { StaffTicketQueue } from "./components/StaffTicketQueue.js";
import { StaffTicketDetail } from "./components/StaffTicketDetail.js";
import { UserManagement } from "./components/UserManagement.js";
import { Login } from "./components/Login.js";
import { ChangePassword } from "./components/ChangePassword.js";

function MainContent() {
  let authContext: any = null;
  try {
    authContext = useAuth();
  } catch (_e) {}

  const user = authContext?.user || null;
  const role = user?.role;

  const [currentNav, setCurrentNav] = useState<
    "my-tickets" | "create-ticket" | "ticket-detail" | "ticket-queue" | "staff-ticket-detail" | "user-management"
  >(role === "IT_STAFF" || role === "ADMINISTRATOR" ? "ticket-queue" : "my-tickets");

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  useEffect(() => {
    if (role === "IT_STAFF" || role === "ADMINISTRATOR") {
      setCurrentNav("ticket-queue");
    } else {
      setCurrentNav("my-tickets");
    }
  }, [role]);

  const handleSelectTicket = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    if (role === "IT_STAFF" || role === "ADMINISTRATOR") {
      setCurrentNav("staff-ticket-detail");
    } else {
      setCurrentNav("ticket-detail");
    }
  };

  return (
    <div style={{ backgroundColor: "#F5F7F6", minHeight: "100vh" }}>
      <Header
        currentNav={
          currentNav === "ticket-detail"
            ? "my-tickets"
            : currentNav === "staff-ticket-detail"
            ? "ticket-queue"
            : currentNav
        }
        onNavigate={(nav) => {
          setSelectedTicketId(null);
          setCurrentNav(nav);
        }}
      />
      <RequesterSelectorScreen />

      <main className="container py-4" style={{ maxWidth: 1100 }}>
        {currentNav === "create-ticket" && (
          <CreateTicketForm onCancel={() => setCurrentNav("my-tickets")} />
        )}
        {currentNav === "my-tickets" && (
          <MyTicketsView
            onCreateClick={() => setCurrentNav("create-ticket")}
            onTicketClick={handleSelectTicket}
          />
        )}
        {currentNav === "ticket-detail" && selectedTicketId && (
          <TicketDetailView
            ticketId={selectedTicketId}
            onBack={() => {
              setSelectedTicketId(null);
              setCurrentNav("my-tickets");
            }}
          />
        )}
        {currentNav === "ticket-queue" && (
          <StaffTicketQueue onTicketClick={handleSelectTicket} />
        )}
        {currentNav === "staff-ticket-detail" && selectedTicketId && (
          <StaffTicketDetail
            ticketId={selectedTicketId}
            onBack={() => {
              setSelectedTicketId(null);
              setCurrentNav("ticket-queue");
            }}
          />
        )}
        {currentNav === "user-management" && <UserManagement />}
      </main>
    </div>
  );
}

function AuthGate() {
  let authContext: any = null;
  try {
    authContext = useAuth();
  } catch (_e) {}

  let requesterContext: any = null;
  try {
    requesterContext = useRequester();
  } catch (_e) {}

  const user = authContext?.user || null;
  const loading = authContext?.loading ?? false;
  const refreshUser = authContext?.refreshUser;
  const selectedRequester = requesterContext?.selectedRequester;

  if (loading) {
    return (
      <div style={{ backgroundColor: "#F5F7F6", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#006B3C", fontWeight: 600 }}>Loading TokTickIT...</div>
      </div>
    );
  }

  if (!user) {
    if (selectedRequester) {
      return <MainContent />;
    }
    return (
      <>
        <Login onLoginSuccess={() => refreshUser?.()} />
        <RequesterSelectorScreen />
      </>
    );
  }

  if (user.mustChangePassword) {
    return <ChangePassword onPasswordChanged={() => refreshUser?.()} />;
  }

  return <MainContent />;
}

export default function App() {
  return (
    <AuthProvider>
      <RequesterProvider>
        <AuthGate />
      </RequesterProvider>
    </AuthProvider>
  );
}

