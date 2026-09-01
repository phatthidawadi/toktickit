import { useState } from "react";
import { RequesterProvider } from "./context/RequesterContext.js";
import { Header } from "./components/Header.js";
import { RequesterSelectorScreen } from "./components/RequesterSelectorScreen.js";
import { CreateTicketForm } from "./components/CreateTicketForm.js";
import { MyTicketsView } from "./components/MyTicketsView.js";
import { TicketDetailView } from "./components/TicketDetailView.js";

function MainContent() {
  const [currentNav, setCurrentNav] = useState<"my-tickets" | "create-ticket" | "ticket-detail">("my-tickets");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  const handleSelectTicket = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setCurrentNav("ticket-detail");
  };

  return (
    <div style={{ backgroundColor: "#F5F7F6", minHeight: "100vh" }}>
      <Header
        currentNav={currentNav === "ticket-detail" ? "my-tickets" : currentNav}
        onNavigate={(nav) => {
          setSelectedTicketId(null);
          setCurrentNav(nav);
        }}
      />
      <RequesterSelectorScreen />

      <main className="container py-4" style={{ maxWidth: 960 }}>
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
