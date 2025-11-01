import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { getToken } from "../../config/auth";
import { Await, useNavigate } from "react-router-dom";
import { message } from "antd";

function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const fetchPackages = async () => {
    let res = await api.get("/service-package");
    setPackages(res.data || []);
  };
  const handlePayMoMo = async (packageId) => {
    try {
      const redirectUrl = "http://evbatteryswapsystem.com/payment/result";

      // Gửi cả packageId và redirectUrl qua query params
      const res = await api.post(
        `/payment/momo/create?packageId=${packageId}&redirectUrl=${encodeURIComponent(
          redirectUrl
        )}`
      );

      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl; // Chuyển tới MoMo
      } else {
        message.error("Không tạo được liên kết thanh toán!");
      }
    } catch (err) {
      console.error("Error:", err);
      message.error("Lỗi khi tạo thanh toán MoMo!");
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSubmit = (packageId) => {
    // Xử lý đăng ký gói dịch vụ ở đây
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    } else {
      handlePayMoMo(packageId);
    }
  };

  return (
    <div>
      <div className="min w-full  flex items-center justify-center py-16 px-6 ">
        <div className="max-w-8xl w-7xl grid md:grid-cols-4 gap-8 ">
          {packages.slice(0, 12).map((plan, i) => (
            <div
              key={i}
              className={`relative bg-white rounded-4xl border border-gray-400 shadow-lg hover:shadow-xl 

              hover:ring-2 hover:ring-emerald-500 transition-all duration-300 ease-out p-10 
              flex flex-col items-center ${
                plan.popular ? "ring-2 ring-emerald-500" : ""
              }`}
            >
              {/* Tag "Phổ biến" hoặc "Giảm giá" */}
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  PHỔ BIẾN
                </div>
              )}
              {plan.discount && (
                <div className="absolute top-4 right-4 bg-cyan-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {plan.discount}
                </div>
              )}

              {/* Icon minh hoạ */}
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-full mb-8 flex items-center justify-center shadow-md">
                <span className="text-white text-3xl font-bold">⚡</span>
              </div>

              {/* Tiêu đề */}
              <h1 className="text-xl font-bold text-gray-800 tracking-wide uppercase">
                {plan.name}
              </h1>
              <p className="text-gray-500 text-center mt-3">{plan.desc}</p>
              <div className="flex-grow">
                {plan.description && (
                  <p className="text-gray-600 text-center mt-4">
                    {plan.description}
                  </p>
                )}
              </div>

              {/* Giá */}
              <div className="mt-8 mb-8 text-2xl font-extrabold text-emerald-600">
                {plan.price.toLocaleString("vi-VN")}₫
                <span className="text-base text-gray-600 font-medium">
                  {" "}
                  / {plan.duration} ngày
                </span>
              </div>

              {/* Nút */}
              <button
                className={` w-full py-3 rounded-full  flex items-center justify-center text-sm font-semibold transition-all duration-300 bg-gray-200 hover:bg-emerald-500 hover:text-white `}
                onClick={() => handleSubmit(plan.id)}
              >
                <p>Đăng Ký</p>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default PackagesPage;
