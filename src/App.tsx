import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import PendingApprovals from "./pages/PendingApprovals";
import SplitBills from "./pages/SplitBills";
import Profile from "./pages/Profile";
import Workspaces from "./pages/Workspaces";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ResetPassword from "./pages/auth/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/verify-otp" element={<VerifyOTP/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        {/* Halaman yang butuh Sidebar dan Bottom Nav Global */}
        <Route element={<ProtectedRoute/>}>
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/workspaces" element={<Layout><Workspaces /></Layout>} />
          <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
          <Route path="/pending-approvals" element={<Layout><PendingApprovals /></Layout>} />
          <Route path="/split-bills" element={<Layout><SplitBills /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
        </Route>

        {/* Redirect default path */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;