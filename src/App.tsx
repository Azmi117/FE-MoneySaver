import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import PendingApprovals from "./pages/PendingApprovals";
import SplitBills from "./pages/SplitBills";
import Profile from "./pages/Profile";
import Workspaces from "./pages/Workspaces";

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman yang butuh Sidebar dan Bottom Nav Global */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/workspaces" element={<Layout><Workspaces /></Layout>} />
        <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
        <Route path="/pending-approvals" element={<Layout><PendingApprovals /></Layout>} />
        <Route path="/split-bills" element={<Layout><SplitBills /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />

        {/* Redirect default path */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;