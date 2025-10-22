import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../config/auth";
import { IoWarning } from "react-icons/io5";
import { FaCircleCheck } from "react-icons/fa6";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  console.log(searchParams);
  const orderId = searchParams.get("orderId");
  const errorCode = searchParams.get("resultCode");
  const amount = searchParams.get("amount");
  const orderInfo = searchParams.get("orderInfo").split(":")[1]?.trim();
  const timestamp = new Date(Number(searchParams.get("responseTime")));
  const userEmail = getCurrentUser().email;
  console.log(userEmail);

  const isSuccess = errorCode === "0";

  return (
    <div className="p-8 text-center">
      {isSuccess ? (
        <>
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8 border border-gray-200">
              {/* Icon + Amount + Status */}
              <div className="text-center mb-4">
                <div className="text-5xl text-green-500 mb-2 flex items-center justify-center">
                  <FaCircleCheck />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">
                  {Number(amount).toLocaleString("vi-VN")}đ
                </h2>
                <p className="text-green-500 font-semibold text-lg">
                  Thanh toán thành công
                </p>
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
                  <span className="font-medium w-32 text-left">
                    Nguồn tiền:
                  </span>
                  <span className="text-right">Ví điện tử MoMo</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Thời gian:</span>
                  <span className="text-right">
                    {timestamp.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
              {/* Order Info */}
              <div className="pt-3">
                <h3 className="mt-5 mb-2 text-center font-semibold text-gray-800">
                  Thông tin đơn hàng
                </h3>
              </div>
              <div className="space-y-1 text-sm text-gray-700 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Tên Gói:</span>
                  <span className="text-right">{orderInfo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Số lượng:</span>
                  <span className="text-right">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">
                    Mệnh giá gói:
                  </span>
                  <span className="text-right">
                    {Number(amount).toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">
                    Email đăng ký:
                  </span>
                  <span className="text-right">{userEmail}</span>
                </div>
                <hr className="my-4" />
              </div>

              {/* Home Button */}
              <div className="text-center mt-6 ">
                <button
                  className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 border text-gray-800 font-medium"
                  onClick={() => navigate("/driver/driver-subscription")}
                >
                  VỀ TRANG CHỦ
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8 border border-gray-200">
              {/* Icon + Amount + Status */}
              <div className="text-center mb-4">
                <div className="text-5xl text-yellow-500 mb-2 flex items-center justify-center">
                  <IoWarning />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">
                  -{Number(amount).toLocaleString("vi-VN")}đ
                </h2>
                <p className="text-yellow-500 font-semibold text-lg">
                  Thanh toán thất bại
                </p>
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
                  <span className="font-medium w-32 text-left">
                    Nguồn tiền:
                  </span>
                  <span className="text-right">Ví điện tử MoMo</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Thời gian:</span>
                  <span className="text-right">
                    {timestamp.toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>
              {/* Order Info */}
              <div className="pt-3">
                <h3 className="mt-5 mb-2 text-center font-semibold text-gray-800">
                  Thông tin đơn hàng
                </h3>
              </div>
              <div className="space-y-1 text-sm text-gray-700 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Tên Gói:</span>
                  <span className="text-right">{orderInfo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">Số lượng:</span>
                  <span className="text-right">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">
                    Mệnh giá gói:
                  </span>
                  <span className="text-right">
                    {Number(amount).toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium w-32 text-left">
                    Email đăng ký:
                  </span>
                  <span className="text-right">{userEmail}</span>
                </div>
                <hr className="my-4" />
              </div>

              {/* Home Button */}
              <div className="text-center mt-6 ">
                <button
                  className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 border text-gray-800 font-medium"
                  onClick={() => navigate("/driver/upgrade-plan")}
                >
                  VỀ TRANG CHỦ
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
