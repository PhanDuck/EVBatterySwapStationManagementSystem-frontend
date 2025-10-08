import { useState } from "react";
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

const RegisterPage = () => {
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
  const navigate = useNavigate();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  // Simple VN-friendly phone rule: starts with 0, 10–11 digits total
  const validatePhone = (phone) => /^0\d{9,10}$/.test(phone);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Phone must start with 0 and be 10–11 digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agree) {
      newErrors.agree = "You must accept the Terms";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Map exactly to Swagger: fullName, email, phoneNumber, passwordHash
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim(),
        passwordHash: formData.password,
      };
      await api.post("/register", payload);
      // Redirect to login after successful registration
      navigate("/login");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";
      setErrors({ submit: message });
    } finally {
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">It only takes a minute.</p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            {/* Full Name */}
            <div className="relative md:col-span-2 h-10">
              <label htmlFor="fullName" className="sr-only">
                Full Name
              </label>
              <FaUser className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Full name"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`appearance-none rounded-lg block w-full pl-10 pr-3 py-2 border ${
                  errors.fullName ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div className="relative md:col-span-2 h-10">
              <label htmlFor="phone" className="sr-only">
                Phone
              </label>
              <FaPhone className="absolute top-1/2 left-3 -translate-y-1/2 rotate-90 text-gray-400" />
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`appearance-none rounded-lg block w-full pl-10 pr-3 py-2 border ${
                  errors.phone ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div className="relative md:col-span-2 h-10">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <FaEnvelope className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                className={`appearance-none rounded-lg block w-full pl-10 pr-3 py-2 border ${
                  errors.email ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative md:col-span-1 h-9">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Password (min 8 chars)"
                value={formData.password}
                onChange={handleInputChange}
                className={`appearance-none rounded-lg block w-full pl-10 pr-10 py-2 border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative md:col-span-1 h-9">
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <FaLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`appearance-none rounded-lg block w-full pl-10 pr-10 py-2 border ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="flex flex-col items-start">
            <div className="flex items-start">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.agree}
                onChange={handleInputChange}
              />
              <label htmlFor="agree" className="ml-2 text-sm text-gray-700">
                I agree to the{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Terms & Privacy
                </a>
              </label>
            </div>

            {errors.agree && (
              <p className="text-sm text-red-600 mt-1">{errors.agree}</p>
            )}
          </div>

          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            style={{ color: "white" }}
          >
            <span style={{ color: "white" }}>
              {isLoading ? "Creating account..." : "Create account"}
            </span>
          </button>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
