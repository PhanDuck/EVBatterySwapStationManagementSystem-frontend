// jsx
// phối hợp JS & HTML 1 cách dễ dàng

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./components/dashboard";
import { ToastContainer } from "react-toastify";
import RegisterPage from "./pages/Register";
import Home from "./pages/Home/home";
import LoginPage from "./pages/Login/login";
import AboutPage from "./pages/About";
import PackagesPage from "./pages/Packages";
import SupportPage from "./pages/Support";
import StationsNearbyPage from "./pages/StationsNearby";
import StationBookingPage from "./pages/StationBooking";

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
      path: "/about",
      element: <AboutPage />,
    },
    {
      path: "/packages",
      element: <PackagesPage />,
    },
    {
      path: "/support",
      element: <SupportPage />,
    },
    {
      path: "/stations/nearby",
      element: <StationsNearbyPage />,
    },
    {
      path: "/stations/booking",
      element: <StationBookingPage />,
    },
    {
      path: "/login",
      element: <LoginPage/>,
    },
    {
      path: "/admin",
      element: <Dashboard />,
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
