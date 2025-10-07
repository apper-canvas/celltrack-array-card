import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import Dashboard from "@/components/pages/Dashboard";
import Inventory from "@/components/pages/Inventory";
import SupplierOrders from "@/components/pages/SupplierOrders";
import POS from "@/components/pages/POS";
import Repairs from "@/components/pages/Repairs";
import Customers from "@/components/pages/Customers";
import Analytics from "@/components/pages/Analytics";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="pos" element={<POS />} />
          <Route path="repairs" element={<Repairs />} />
          <Route path="customers" element={<Customers />} />
<Route path="analytics" element={<Analytics />} />
          <Route path="supplier-orders" element={<SupplierOrders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;