import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ForgotPassword from "./pages/auth/ForgotPassword"
import VerifyOTP from "./pages/auth/VerifyOTP"
import Dashboard from "./pages/Dashboard"
import Workspaces from "./pages/Workspaces"
import Transactions from "./pages/Transactions"
import SplitBills from "./pages/SplitBills"
import PendingApprovals from "./pages/PendingApprovals"


function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/verify-otp" element={<VerifyOTP/>}/>
          <Route path="/workspace" element={<Workspaces/>}/>
          <Route path="/transaction" element={<Transactions/>}/>
          <Route path="/split-bill" element={<SplitBills/>}/>
          <Route path="/pending-approvals" element={<PendingApprovals/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
