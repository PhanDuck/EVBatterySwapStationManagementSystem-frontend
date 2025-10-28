import React from "react";
import Navbar from "../components/navbar/NavBar";
import Footer from "../components/Footer/Footer";
import { Outlet } from "react-router-dom";

function HomeLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header cố định ở trên */}
      <Navbar />

      {/* Phần nội dung chiếm hết phần còn lại */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer cố định ở dưới */}
      <Footer />
    </div>
  );
}

export default HomeLayout;
