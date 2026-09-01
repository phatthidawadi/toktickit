import { useState } from "react";
import { RequesterProvider } from "./context/RequesterContext.js";
import { Header } from "./components/Header.js";
import { RequesterSelectorScreen } from "./components/RequesterSelectorScreen.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";
import { MyTicketsView } from "./components/MyTicketsView.js";

function MainContent() {
  const [currentNav, setCurrentNav] = useState<"my-tickets" | "create-ticket">("my-tickets");

  return (
    <div style={{ backgroundColor: "#F5F7F6", minHeight: "100vh" }}>
      <Header currentNav={currentNav} onNavigate={(nav) => setCurrentNav(nav)} />
      <RequesterSelectorScreen />

      <main className="container py-4" style={{ maxWidth: 960 }}>
        {currentNav === "create-ticket" ? (
          <CreateTicketForm onCancel={() => setCurrentNav("my-tickets")} />
        ) : (
          <MyTicketsView onCreateClick={() => setCurrentNav("create-ticket")} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <RequesterProvider>
      <MainContent />
    </RequesterProvider>
  );
}
