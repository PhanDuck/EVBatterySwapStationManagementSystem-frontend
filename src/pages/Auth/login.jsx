import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { setToken, getCurrentRole } from "../../config/auth";
import {
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaGithub,
} from "react-icons/fa";

import bgImage from "../../assets/img/backgroundaboutus.png";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || getCurrentRole();

    if (token && role) {
      // ✅ Nếu đã đăng nhập thì chuyển hướng về đúng dashboard
      if (role === "Admin" || role === "ADMIN")
        navigate("/admin", { replace: true });
      else if (role === "Staff" || role === "STAFF")
        navigate("/staff", { replace: true });
      else if (role === "Driver" || role === "DRIVER")
        navigate("/driver", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?\d{8,13}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 5) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);

      try {
        //Call login API
        const res = await api.post("/login", {
          phone: formData.phoneNumber,
          password: formData.password,
        });

        const token =
          res?.data?.token ||
          res?.data?.accessToken ||
          res?.data?.jwt ||
          res?.data?.data ||
          res?.data;
        if (!token) throw new Error("Token not found in response");

        // Store token per rememberMe
        setToken(token, formData.rememberMe);

        // Lấy thông tin user từ response hoặc gọi API /Current
        let user = res?.data?.user || res?.data?.currentUser;

        // Nếu response không có user, thử gọi API /Current
        if (!user) {
          try {
            const me = await api.get("/current");
            if (me?.data) {
              user = me.data;
            }
          } catch {
              console.warn("⚠️ Không lấy được thông tin user hiện tại");
          }
        }

        // Lưu user vào localStorage
        if (user) {
          localStorage.setItem("currentUser", JSON.stringify(user));
        }

        // Role-based redirect (normalize to Admin/Staff/Driver)
        const role = getCurrentRole();
        if (role === "Staff") navigate("/staff");
        else if (role === "Admin") navigate("/admin");
        else if (role === "Driver") navigate("/driver");
        else navigate("/");
      } catch (error) {
        const message =
          error?.response?.data?.message || "Login failed. Please try again.";
        setErrors({ submit: message });
      } finally {
        setIsLoading(false);
      }
    }
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

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <img
        src={bgImage}
        alt="img"
        className="absolute inset-0 z-0 w-full h-full object-cover"
      />

      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-white/20 relative z-10 mx-4">
        <div>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FaLock className="text-white text-2xl" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Đăng Nhập</h2>
            <p className="mt-3 text-gray-600 font-medium">
              Đăng nhập vào tài khoản của bạn
            </p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="relative group">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Số điện thoại
              </label>
              <div className="relative">
                <FaPhone className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  required
                  className={`appearance-none rounded-xl relative block w-full pl-4 pr-4 py-3 border-2 ${
                    errors.phoneNumber
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 focus:bg-white`}
                  placeholder="Nhập số điện thoại"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center mr-2">
                    !
                  </span>
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div className="relative group">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật Khẩu
              </label>
              <div className="relative">
                <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`appearance-none rounded-xl relative block w-full pl-4 pr-12 py-3 border-2 ${
                    errors.password
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 focus:bg-white`}
                  placeholder="Nhập mật khẩu của bạn"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center mr-2">
                    !
                  </span>
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="rememberMe"
                type="checkbox"
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md shadow-sm"
                checked={formData.rememberMe}
                onChange={handleInputChange}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Duy trì đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          {errors.submit && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="flex items-center">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-sm flex items-center justify-center mr-3">
                  !
                </span>
                <p className="text-sm text-red-700 font-medium">
                  {errors.submit}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ color: "white" }}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isLoading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                )}
              </span>
              <span style={{ color: "white" }}>
                {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
              </span>
            </button>
          </div>
          <div className="flex  justify-center mt-4 space-x-2">
            <p className=" text-gray-600 text-center">Không có tài khoản?</p>

            <Link to="/register">
              <p className=" text-gray-600 text-center font-bold underline hover:text-blue-600">
                Đăng ký ngay
              </p>
            </Link>
          </div>
        </form>
        <div className="mt-4">
          <Link
            to="/"
            className="group relative w-full flex justify-center py-3 px-4 border-2 border-gray-300 text-sm font-semibold rounded-xl text-gray-800 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
