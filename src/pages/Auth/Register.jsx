import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { showToast } from "../../Utils/toastHandler";

const RegisterPage = () => {
  // ... (Phần state và validation không thay đổi)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  const navigate = useNavigate();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^0\d{9,10}$/.test(phone);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim())
      newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!formData.email) newErrors.email = "Vui lòng nhập email";
    else if (!validateEmail(formData.email))
      newErrors.email = "Vui lòng nhập email hợp lệ";

    if (!formData.phone) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!validatePhone(formData.phone))
      newErrors.phone = "Vui lòng điền số điện thoại hợp lệ";

    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 8)
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Mật khẩu không khớp";

    if (!formData.agree)
      newErrors.agree = "Bạn phải chấp nhận Điều khoản & Chính sách";

    if (!captchaToken) {
      newErrors.captcha = "Vui lòng xác minh CAPTCHA trước khi đăng ký!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  // -------------------------------------------------------------
  // PHẦN GẮN API TẬP TRUNG TẠI HÀM NÀY
  // -------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Dừng nếu form không hợp lệ

    setIsLoading(true); // Bắt đầu loading

    try {
      // 1. Chuẩn bị Payload (Dữ liệu gửi lên API)
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim(),
        password: formData.password,
        role: "DRIVER", // Đảm bảo role này khớp với yêu cầu của API backend
        captchaToken: captchaToken, // Gửi token reCAPTCHA lên server để xác thực
      };

      // 2. Gọi API POST đến endpoint đăng ký
      // Giả sử API endpoint là /auth/register
      await api.post("/register", payload);

      // 3. Xử lý khi đăng ký thành công (HTTP 200/201)
      showToast("success", "Đăng ký tài khoản thành công! Vui lòng đăng nhập.");

      // Chuyển hướng người dùng sau 2 giây
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      // 4. Xử lý lỗi (Ví dụ: 400 Bad Request, 500 Internal Server Error)

      const msg = error.response?.data || "Đăng ký thất bại. Vui lòng thử lại.";

      showToast("error", msg); // Hiển thị thông báo lỗi bằng Antd
      setErrors({ submit: msg }); // Hiển thị lỗi chung bên dưới form (nếu cần)
    } finally {
      // 5. Kết thúc loading, bất kể thành công hay thất bại
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="max-w-lg w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg relative z-10 mx-4">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            Đăng Ký Tài Khoản
          </h2>
          <p className="mt-2 text-sm text-gray-600">Chỉ mất một phút.</p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="relative h-10">
            <FaUser className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              name="fullName"
              type="text"
              placeholder="Họ và tên"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`appearance-none rounded-lg block w-full pl-10 pr-3 py-2 border ${
                errors.fullName ? "border-red-300" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Phone */}
          <div className="relative h-10">
            <FaPhone className="absolute top-1/2 left-3 -translate-y-1/2 rotate-90 text-gray-400" />
            <input
              name="phone"
              type="tel"
              placeholder="Số điện thoại"
              value={formData.phone}
              onChange={handleInputChange}
              className={`appearance-none rounded-lg block w-full pl-10 pr-3 py-2 border ${
                errors.phone ? "border-red-300" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div className="relative h-10">
            <FaEnvelope className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              name="email"
              type="email"
              placeholder="Địa chỉ email"
              value={formData.email}
              onChange={handleInputChange}
              className={`appearance-none rounded-lg block w-full pl-10 pr-3 py-2 border ${
                errors.email ? "border-red-300" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative h-10">
            <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu (tối thiểu 8 ký tự)"
              value={formData.password}
              onChange={handleInputChange}
              className={`appearance-none rounded-lg block w-full pl-10 pr-10 py-2 border ${
                errors.password ? "border-red-300" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative h-10">
            <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`appearance-none rounded-lg block w-full pl-10 pr-10 py-2 border ${
                errors.confirmPassword ? "border-red-300" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-center mb-0 !important">
            <input
              name="agree"
              type="checkbox"
              checked={formData.agree}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Tôi đồng ý với{" "}
              <a
                href="/policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500 underline"
              >
                Điều khoản & Chính sách
              </a>
            </label>
          </div>
          {errors.agree && (
            <p className="text-sm text-red-600">{errors.agree}</p>
          )}

          {/* Google reCAPTCHA */}
          <div className="my-4">
            <ReCAPTCHA
              sitekey="6LccMAYsAAAAAMiEr_9BWJc8ssCkb9hw2sRSvaUr"
              onChange={(token) => {
                setCaptchaToken(token);
                if (token) {
                  setErrors((prev) => ({ ...prev, captcha: "" }));
                }
              }}
              onExpired={() => {
                setCaptchaToken(null);
                setErrors((prev) => ({
                  ...prev,
                  captcha: "Captcha đã hết hạn, vui lòng xác minh lại!",
                }));
              }}
            />
            {errors.captcha && (
              <p className="mt-1 text-sm text-red-600">{errors.captcha}</p>
            )}
          </div>

          <div className="my-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-blue-600  font-semibold hover:bg-blue-700 transition disabled:opacity-70"
            >
              <p className=" text-white">
                {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </p>
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <a
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Đăng nhập
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
