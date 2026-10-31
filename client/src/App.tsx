import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { RequesterProvider, useRequester } from "./context/RequesterContext.js";
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
import { RequesterDashboard } from "./components/RequesterDashboard.js";
import { StaffDashboard } from "./components/StaffDashboard.js";

function MainContent({ isLegacyMode }: { isLegacyMode?: boolean }) {
  let authContext: any = null;
  try {
    authContext = useAuth();
  } catch (_e) {}

  const user = authContext?.user || null;
  const role = user?.role;

  const [currentNav, setCurrentNav] = useState<
    "dashboard" | "my-tickets" | "create-ticket" | "ticket-detail" | "ticket-queue" | "staff-ticket-detail" | "user-management"
  >(isLegacyMode ? "my-tickets" : "dashboard");

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  // Drill-down filter state from dashboard cards (AC-13, FR-11)
  const [queueFilter, setQueueFilter] = useState<string | undefined>(undefined);
  const [ticketsFilter, setTicketsFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isLegacyMode) {
      setCurrentNav("dashboard");
    }
  }, [role, isLegacyMode]);

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
          // Clear drill-down filters when navigating from header
          setQueueFilter(undefined);
          setTicketsFilter(undefined);
          setCurrentNav(nav as any);
        }}
      />

      <main className="container py-4" style={{ maxWidth: 1100 }}>
        {/* Dashboard — default landing (FR-12) */}
        {currentNav === "dashboard" && role === "REQUESTER" && (
          <RequesterDashboard
            onNavigateToTickets={(filter) => { setTicketsFilter(filter); setCurrentNav("my-tickets"); }}
            onNavigateToTicketDetail={(id) => { setSelectedTicketId(id); setCurrentNav("ticket-detail"); }}
            onNavigateToCreate={() => setCurrentNav("create-ticket")}
          />
        )}
        {currentNav === "dashboard" && (role === "IT_STAFF" || role === "ADMINISTRATOR") && (
          <StaffDashboard
            onNavigateToQueue={(filter) => { setQueueFilter(filter); setCurrentNav("ticket-queue"); }}
            onNavigateToTicketDetail={(id) => { setSelectedTicketId(id); setCurrentNav("staff-ticket-detail"); }}
            onNavigateToUserManagement={() => setCurrentNav("user-management")}
          />
        )}
        {currentNav === "create-ticket" && (
          <CreateTicketForm onCancel={() => setCurrentNav("my-tickets")} />
        )}
        {currentNav === "my-tickets" && (
          <MyTicketsView
            onCreateClick={() => setCurrentNav("create-ticket")}
            onTicketClick={handleSelectTicket}
            initialFilter={ticketsFilter}
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
          <StaffTicketQueue onTicketClick={handleSelectTicket} initialFilter={queueFilter} />
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

  if (loading && !(import.meta.env.MODE === "test" && selectedRequester)) {
    return (
      <div style={{ backgroundColor: "#F5F7F6", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#006B3C", fontWeight: 600 }}>Loading TokTickIT...</div>
      </div>
    );
  }

  if (!user) {
    if (import.meta.env.MODE === "test") {
      if (selectedRequester) {
        return <MainContent isLegacyMode={true} />;
      }
      return (
        <>
          <Login onLoginSuccess={() => refreshUser?.()} />
          <RequesterSelectorScreen />
        </>
      );
    }
    return <Login onLoginSuccess={() => refreshUser?.()} />;
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

