import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { RequesterProvider } from "./context/RequesterContext.js";
import { Header } from "./components/Header.js";
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

function MainContent() {
  let authContext: any = null;
  try {
    authContext = useAuth();
  } catch (_e) {}

  const user = authContext?.user || null;
  const role = user?.role;

  const [currentNav, setCurrentNav] = useState<
    "dashboard" | "my-tickets" | "create-ticket" | "ticket-detail" | "ticket-queue" | "staff-ticket-detail" | "user-management"
  >("dashboard");

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentNav("dashboard");
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
          setCurrentNav(nav as any);
        }}
      />

      <main className="container py-4" style={{ maxWidth: 1100 }}>
        {/* Dashboard — default landing (FR-12) */}
        {currentNav === "dashboard" && role === "REQUESTER" && (
          <RequesterDashboard
            onNavigateToTickets={(_filter) => setCurrentNav("my-tickets")}
            onNavigateToTicketDetail={(id) => { setSelectedTicketId(id); setCurrentNav("ticket-detail"); }}
            onNavigateToCreate={() => setCurrentNav("create-ticket")}
          />
        )}
        {currentNav === "dashboard" && (role === "IT_STAFF" || role === "ADMINISTRATOR") && (
          <StaffDashboard
            onNavigateToQueue={(_filter) => setCurrentNav("ticket-queue")}
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

  const user = authContext?.user || null;
  const loading = authContext?.loading ?? false;
  const refreshUser = authContext?.refreshUser;

  if (loading) {
    return (
      <div style={{ backgroundColor: "#F5F7F6", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#006B3C", fontWeight: 600 }}>Loading TokTickIT...</div>
      </div>
    );
  }

  if (!user) {
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

