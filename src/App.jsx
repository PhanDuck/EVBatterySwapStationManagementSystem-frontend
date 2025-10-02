// jsx
// phối hợp JS & HTML 1 cách dễ dàng

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./components/dashboard";
import ManageBike from "./pages/bike";
import ManageCategory from "./pages/category";
import { ToastContainer } from "react-toastify";
import RegisterPage from "./pages/Register";
import Home from "./pages/Home/home";
import LoginPage from "./pages/Login/login";
import VehiclePage from "./pages/Vehicle";
import AccountPage from "./pages/Account";
import BatteryPage from "./pages/Battery";
import StationPage from "./pages/Station";
import PackagePage from "./pages/Package";
import TransactionsPage from "./pages/Transactions";
import SubscriptionsPage from "./pages/Subscriptions";
import SupportPage from "./pages/Support";
import ResponsePage from "./pages/Response";

// 1. Component
// là 1 cái function
// trả về 1 cái giao diện

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <LoginPage/>,
    },
    {
      path: "/admin",
      element: <Dashboard />,
      children: [
         {
          path: "Account",
          element: <AccountPage />,
        },
        {
          path: "Battery",
          element: <BatteryPage />,
        },
        {
          path: "Station",
          element: <StationPage />,
        },
        {
          path: "Vehicle",
          element: <VehiclePage />,
        },
        {
          path: "Package",
          element: <PackagePage />,
        },
        {
          path: "Transactions",
          element: <TransactionsPage />,
        },
        {
          path: "Subscriptions",
          element: <SubscriptionsPage />,
        },
        {
          path: "Support",
          element: <SupportPage />,
        },
        {
          path: "Response",
          element: <ResponsePage />,
        },
      ],
    },
    
    {
      path: "/register",
      element: <RegisterPage />,
    },
  ]);

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
