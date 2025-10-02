import { useState } from "react";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaGithub,
} from "react-icons/fa";

import bgImage from "../../assets/img/loginBg.png";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
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
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Login successful", formData);
      } catch (error) {
        setErrors({ submit: "Login failed. Please try again." });
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
      <img src={bgImage} alt="img" className="absolute inset-0 z-0 w-full h-full object-cover" />
      
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-white/20 relative z-10 mx-4">
        <div>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FaLock className="text-white text-2xl" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-3 text-gray-600 font-medium">
              Sign in to your account
            </p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="relative group">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none rounded-xl relative block w-full pl-12 pr-4 py-3 border-2 ${
                    errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 focus:bg-white`}
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center mr-2">!</span>
                  {errors.email}
                </p>
              )}
            </div>

            <div className="relative group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`appearance-none rounded-xl relative block w-full pl-12 pr-12 py-3 border-2 ${
                    errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                  } placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50 focus:bg-white`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center mr-2">!</span>
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
                className="ml-3 block text-sm font-medium text-gray-700"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </a>
            </div>
          </div>

          {errors.submit && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <div className="flex items-center">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-sm flex items-center justify-center mr-3">!</span>
                <p className="text-sm text-red-700 font-medium">{errors.submit}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isLoading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                )}
              </span>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
              >
                <FaGoogle className="mr-2 h-5 w-5 text-red-500" />
                Google
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
              >
                <FaGithub className="mr-2 h-5 w-5 text-gray-900" />
                GitHub
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
