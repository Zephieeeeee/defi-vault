import React from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { DepositWithdraw } from "./pages/DepositWithdraw";
import { BorrowRepay } from "./pages/BorrowRepay";
import { StakeClaim } from "./pages/StakeClaim";
import { Admin } from "./pages/Admin";
import { Markets } from "./pages/Markets";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deposit" element={<DepositWithdraw />} />
        <Route path="/borrow" element={<BorrowRepay />} />
        <Route path="/stake" element={<StakeClaim />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/markets" element={<Markets />} />
      </Routes>
    </Layout>
  );
}

