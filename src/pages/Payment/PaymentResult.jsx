import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../config/auth";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
console.log(searchParams);
  const orderId = searchParams.get("orderId");
  const errorCode = searchParams.get("errorCode");
  const amount = searchParams.get("amount");
  const orderInfo = searchParams.get("orderInfo").split(":")[1]?.trim();
  const timestamp = new Date(Number(searchParams.get("responseTime")));
  const userEmail = (getCurrentUser().email);
  console.log(userEmail);
 

  const isSuccess = errorCode === "0";

  return (
    <div className="p-8 text-center">
      {isSuccess ? (
        <>
          <h2 className="text-green-600 text-2xl font-bold">
            🎉 Thanh toán thành công!
          </h2>
          <p>Mã đơn hàng: {orderId}</p>
          <button className="mt-4 btn" onClick={() => navigate("/")}>
            Về trang chủ
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8 border border-gray-200">
              {/* Icon + Amount + Status */}
              <div className="text-center mb-4">
                <div className="text-5xl text-blue-700 mb-2">❗</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">-{Number(amount).toLocaleString("vi-VN")}đ</h2>
                <p className="text-blue-600 font-semibold text-lg">Thanh toán thất bại</p>
              </div>
              <hr className="my-4" />
              {/* Transaction ID */}
              <div className="text-center text-gray-700 text-sm mb-3 border-b border-gray-200 pb-3">
                <p className="font-medium">Mã giao dịch</p>
                <p className="text-gray-900 font-semibold">{orderId}</p>
              </div>
              {/* Payment Info */}
              <div className="space-y-1 text-sm text-gray-700 border-b border-gray-200 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Nguồn tiền:</span>
                  <span className="text-right">Ví điện tử MoMo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Phí quản lý:</span>
                  <span className="text-right">0đ</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Thời gian:</span>
                  <span className="text-right">{timestamp.toLocaleString("vi-VN")}</span>
                </div>
              </div>
              {/* Order Info */}
              <div className="pt-3">
                <h3 className="mt-5 mb-2 text-center font-semibold text-gray-800">Thông tin đơn hàng</h3>
              </div>
              <div className="space-y-1 text-sm text-gray-700 border-b border-gray-200 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Tên Gói:</span>
                  <span className="text-right">{orderInfo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Số lượng:</span>
                  <span className="text-right">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Mệnh giá gói:</span>
                  <span className="text-right">{Number(amount).toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Email nhận thẻ:</span>
                  <span className="text-right">dangminh0806@gmail.com</span>
                </div>
              </div>
              {/* Support Info */}
              <h3 className="mt-5 mb-2 text-center font-semibold text-gray-800">Liên hệ hỗ trợ</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Hỗ trợ khách hàng:</span>
                  <span className="text-right">hotro@napthengay.vn</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Hotline:</span>
                  <a href="tel:0776395737" className="text-blue-600 hover:underline text-right">0776 395 737 - 034 510 2760</a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Mã hỗ trợ:</span>
                  <span className="text-right">158241903</span>
                </div>
              </div>
              {/* Home Button */}
              <div className="text-center mt-6">
                <button className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 border text-gray-800 font-medium" onClick={() => navigate("/")}>VỀ TRANG CHỦ</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
