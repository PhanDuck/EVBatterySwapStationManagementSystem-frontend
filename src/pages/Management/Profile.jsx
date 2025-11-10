// src/pages/Profile/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { getCurrentUser } from "../../config/auth";

  export default function Profile() {
  const user = getCurrentUser();
  const userId = user?.id;

 const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    username: "",
    password: "",
    role: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await api.get(`/current`);
        setFormData({
          fullName: res.data.fullName || "",
          email: res.data.email || "",
          phoneNumber: res.data.phoneNumber || "",
          username: res.data.username || "",
          password: "",
          role: res.data.role || "",
          status: res.data.status || "",
        });
      } catch (error) {
        
        console.error("Lỗi tải thông tin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/users/${userId}`, formData);
      setMessage("✅ Cập nhật thành công!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setMessage("❌ Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Đang tải hồ sơ...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
          Profile Settings
        </h2>

        {/* <div className="flex items-center flex-col mb-10">
          <div className="relative">
            <img
              src="/default-avatar.png"
              alt="avatar"
              className="w-24 h-24 rounded-full border-4 border-green-500 object-cover"
            />
            <label
              htmlFor="avatarUpload"
              className="absolute bottom-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full cursor-pointer shadow-md hover:bg-green-600"
            >
              Upload
            </label>
            <input
              type="file"
              id="avatarUpload"
              className="hidden"
              accept="image/*"
            />
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Cập nhật ảnh đại diện của bạn
          </p>
        </div> */}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                placeholder="Nhập họ tên"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập
              </label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                placeholder="Username"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                placeholder="example@gmail.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới (tùy chọn)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò
              </label>
              <input
                name="role"
                value={formData.role}
                readOnly
                className="w-full border border-gray-200 bg-gray-100 text-gray-600 rounded-xl p-2.5 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <input
                name="status"
                value={formData.status}
                readOnly
                className="w-full border border-gray-200 bg-gray-100 text-gray-600 rounded-xl p-2.5 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="text-center font-medium text-green-600">
              {message}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md disabled:opacity-60 transition"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};





