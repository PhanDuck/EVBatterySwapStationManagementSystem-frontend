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
          path: "bike",
          element: <ManageBike />, // Outlet
        },
        {
          path: "category",
          element: <ManageCategory />, // Outlet
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
