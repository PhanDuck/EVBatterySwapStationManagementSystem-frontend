import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { getToken } from "../../config/auth";
import { Await, useNavigate, Link } from "react-router-dom";
import { showToast } from "../../Utils/toastHandler";
import { Modal, Checkbox, Button } from "antd";
import {
  CheckCircleOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
        showToast("error", "Không tạo được liên kết thanh toán!");
      }
    } catch (err) {
      console.error("Error:", err);
      showToast("error", "Lỗi khi tạo thanh toán MoMo!");
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
      // Mở modal thay vì gọi trực tiếp
      setSelectedPackageId(packageId);
      setAgreedToTerms(false);
      setIsModalVisible(true);
    }
  };

  const handleAgreeAndProceed = () => {
    if (!agreedToTerms) {
      showToast("warning", "Vui lòng đồng ý với chính sách!");
      return;
    }
    setIsModalVisible(false);
    handlePayMoMo(selectedPackageId);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedPackageId(null);
    setAgreedToTerms(false);
  };

  const handleViewPolicy = () => {
    window.open("/policy", "_blank");
  };

  return (
    <div>
      {/* Modal Chính Sách - Tối Giản */}
      <Modal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        centered
        bodyStyle={{ padding: "30px" }}
        closable={true}
      >
        <div>
          {/* Title */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "8px",
              color: "#000",
            }}
          >
            Xác nhận điều khoản dịch vụ
          </h2>
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>
            Vui lòng đọc và đồng ý với chính sách trước khi tiếp tục thanh toán
          </p>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              backgroundColor: "#e0e0e0",
              marginBottom: "24px",
            }}
          ></div>

          {/* Content */}
          <div style={{ marginBottom: "24px" }}>
            <p
              style={{
                color: "#333",
                fontSize: "14px",
                lineHeight: "1.8",
                marginBottom: "16px",
              }}
            >
              Bằng cách đăng ký gói dịch vụ, bạn đồng ý tuân thủ tất cả các điều khoản và chính sách của EV Battery Swap.
            </p>

            <div
              style={{
                backgroundColor: "#f9f9f9",
                padding: "16px",
                borderRadius: "6px",
                marginBottom: "16px",
              }}
            >
              <p
                style={{
                  color: "#333",
                  fontSize: "13px",
                  lineHeight: "1.8",
                  margin: "0",
                }}
              >
                • Pin là tài sản của công ty, bạn chỉ có quyền sử dụng
                <br />
                • Bạn chịu trách nhiệm bảo quản pin theo hướng dẫn
                <br />
                • Thanh toán qua MoMo, gói kích hoạt sau thanh toán
                <br />
                • Không hoàn tiền sau khi thanh toán
              </p>
            </div>

            <button
              onClick={handleViewPolicy}
              style={{
                background: "none",
                border: "none",
                color: "#0066cc",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "14px",
                padding: "0",
                fontWeight: "500",
              }}
            >
              Xem chi tiết chính sách →
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              backgroundColor: "#e0e0e0",
              marginBottom: "24px",
            }}
          ></div>

          {/* Checkbox */}
          <div style={{ marginBottom: "24px" }}>
            <Checkbox
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            >
              <span style={{ color: "#333", fontSize: "14px" }}>
                Tôi đã đọc và đồng ý với các điều khoản trên
              </span>
            </Checkbox>
          </div>

          {/* Buttons */}
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
          >
            <Button
              onClick={handleModalCancel}
              style={{
                height: "36px",
                fontSize: "14px",
                fontWeight: "500",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAgreeAndProceed}
              disabled={!agreedToTerms}
              style={{
                height: "36px",
                fontSize: "14px",
                fontWeight: "500",
                backgroundColor: agreedToTerms ? "#000" : "#e0e0e0",
                borderColor: agreedToTerms ? "#000" : "#e0e0e0",
                color: "white",
                borderRadius: "4px",
              }}
            >
              Tiếp tục thanh toán
            </Button>
          </div>
        </div>
      </Modal>

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
