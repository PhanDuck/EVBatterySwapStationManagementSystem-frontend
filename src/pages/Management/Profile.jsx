import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { getCurrentUser } from "../../config/auth";
import { showToast } from "../../Utils/toastHandler";

export default function Profile() {
  const user = getCurrentUser();
  const userId = user?.id;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    birthDate: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Trạng thái modal đổi mật khẩu
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  // 🟢 Lấy thông tin người dùng
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
          role: res.data.role || "",
          status: res.data.status || "",
          dateOfBirth: res.data.dateOfBirth || "",
          gender: res.data.gender || "",
        });
      } catch (error) {
        console.error("Lỗi tải thông tin:", error);
        showToast("error", error?.response?.data || "Không thể tải thông tin hồ sơ");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  // 🟢 Xử lý khi thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🟢 Lưu thay đổi thông tin hồ sơ
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/profile`, formData);

      // Cập nhật lại localStorage
      const current = JSON.parse(localStorage.getItem("currentUser")) || {};
      const updatedUser = { ...current, ...formData };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user-updated"));

      showToast("success", "Cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      showToast("error", error?.response?.data || "Lỗi khi cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  // 🟢 Đổi mật khẩu
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      showToast("error", "Vui lòng nhập đủ thông tin");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("error", "Mật khẩu xác nhận không khớp");
      return;
    }

    setPasswordSubmitting(true);
    try {
      await api.post("/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      showToast("success", "Đổi mật khẩu thành công");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error", error);
      showToast("error", error?.response?.data || "Không thể đổi mật khẩu");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-blue-500 font-medium">
        Đang tải hồ sơ...
      </div>
    );

  return (
    <div className="min-h-screen from-blue-50 to-blue-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-blue-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-blue-100 bg-blue-600 px-6 py-5">
          <h2 className="text-2xl font-semibold text-white">Profile Settings</h2>
          <p className="text-blue-100 text-sm mt-1">Cập nhật thông tin cá nhân của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
          {/* Full Name */}
          <div className="flex justify-between px-6 py-4 hover:bg-blue-50 transition">
            <span className="text-gray-600 font-medium w-1/3">Họ và tên</span>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ tên của bạn"
              className="w-2/3 bg-transparent border-none text-gray-800 focus:ring-0 outline-none"
            />
          </div>

          {/* Birth Date */}
          <div className="flex justify-between px-6 py-4 hover:bg-blue-50 transition">
            <span className="text-gray-600 font-medium w-1/3">Ngày sinh</span>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-2/3 bg-transparent border-none text-gray-800 focus:ring-0 outline-none"
            />
          </div>

          {/* Gender */}
          <div className="flex justify-between px-6 py-4 hover:bg-blue-50 transition">
            <span className="text-gray-600 font-medium w-1/3">Giới tính</span>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-2/3 bg-transparent border-none text-gray-800 focus:ring-0 outline-none"
            >
              <option value="OTHER">-- Chọn giới tính --</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>
          </div>

          {/* Email */}
          <div className="flex justify-between px-6 py-4 hover:bg-blue-50 transition">
            <span className="text-gray-600 font-medium w-1/3">Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="w-2/3 bg-transparent border-none text-gray-800 focus:ring-0 outline-none"
            />
          </div>

          {/* Phone */}
          <div className="flex justify-between px-6 py-4 hover:bg-blue-50 transition">
            <span className="text-gray-600 font-medium w-1/3">Số điện thoại</span>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              readOnly
              className="w-2/3 bg-transparent border-none text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Role */}
          <div className="flex justify-between px-6 py-4 hover:bg-blue-50 transition">
            <span className="text-gray-600 font-medium w-1/3">Vai trò</span>
            <input
              name="role"
              value={formData.role}
              readOnly
              className="w-2/3 bg-transparent border-none text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Change password trigger */}
          <div
            className="flex justify-between px-6 py-4 hover:bg-blue-50 transition cursor-pointer"
            onClick={() => setShowPasswordModal(true)}
          >
            <span className="text-gray-600 font-medium w-1/3">Mật khẩu mới</span>
            <span className="text-gray-800 w-2/3">••••••••</span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 px-6 py-5 bg-gray-50">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow disabled:opacity-60 transition"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>

        {/* Modal đổi mật khẩu */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black opacity-30"
              onClick={() => setShowPasswordModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-10">
              <h3 className="text-lg font-medium mb-4">Đổi mật khẩu</h3>

              {[
                { label: "Mật khẩu hiện tại", value: oldPassword, setter: setOldPassword },
                { label: "Mật khẩu mới", value: newPassword, setter: setNewPassword },
                { label: "Xác nhận mật khẩu", value: confirmPassword, setter: setConfirmPassword },
              ].map((f, i) => (
                <div key={i} className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">{f.label}</label>
                  <input
                    type="password"
                    value={f.value}
                    onChange={(e) => f.setter(e.target.value)}
                    className="w-full border border-gray-200 rounded-md p-2"
                  />
                </div>
              ))}

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="px-4 py-2 rounded-md border"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={passwordSubmitting}
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow disabled:opacity-60 transition"
                >
                  {passwordSubmitting ? "Đang xử lý..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
