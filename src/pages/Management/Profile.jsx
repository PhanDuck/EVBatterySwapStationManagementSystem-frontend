// src/pages/Profile/ProfilePage.jsx
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

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
          birthDate: res.data.birthDate || "",
          gender: res.data.gender || "",
        });
      } catch (error) {
        console.error("Lỗi tải thông tin:", error);
        showToast("error", "Không thể tải thông tin hồ sơ");
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
      await api.put(`/profile`, formData);

      // ✅ Cập nhật localStorage
      const updatedUser = {
        ...JSON.parse(localStorage.getItem("currentUser")),
        ...formData,
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      // ✅ Phát sự kiện để các component khác (như sidebar) biết có thay đổi
      window.dispatchEvent(new Event("user-updated"));

      showToast("success", "Cập nhật thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      showToast("error", "Lỗi khi cập nhật hồ sơ");
    } finally {
      setSaving(false);
      window.location.reload();
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-blue-500 font-medium">
        Đang tải hồ sơ...
      </div>
    );

  return (
    <div className="min-h-screen  from-blue-50 to-blue-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-blue-200 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="border-b border-blue-100 bg-blue-600 px-6 py-5">
          <h2 className="text-2xl font-semibold text-white">
            Profile Settings
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Cập nhật thông tin cá nhân của bạn
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
          {/* Full Name */}
          <ProfileField
            label="Họ và tên"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nhập họ tên của bạn"
          />

          {/* Birthdate */}
          <ProfileField
            label="Ngày sinh"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            placeholder="dd/mm/yyyy"
          />

          {/* Gender */}
          <ProfileField
            label="Giới tính"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            placeholder="Nam / Nữ"
          />

          {/* Email */}
          <ProfileField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@gmail.com"
            type="email"
          />

          {/* Phone */}
          <ProfileField
            label="Số điện thoại"
            name="phoneNumber"
            value={formData.phoneNumber}
            readOnly
          />

          {/* Role */}
          <ProfileField
            label="Vai trò"
            name="role"
            value={formData.role}
            readOnly
          />

          {/* Password (open modal to change) */}
          <div
            className="flex justify-between px-6 py-4 hover:bg-blue-50 transition cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => setShowPasswordModal(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                setShowPasswordModal(true);
            }}
          >
            <span className="text-gray-600 font-medium w-1/3">
              Mật khẩu mới
            </span>
            <div className="w-2/3 flex items-center justify-between">
              <span className="text-gray-800">••••••••</span>
            </div>
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

        {/* Password change modal (simple tailwind modal) */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black opacity-30"
              onClick={() => setShowPasswordModal(false)}
            />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-10">
              <h3 className="text-lg font-medium mb-4">Đổi mật khẩu</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-md p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-md p-2"
                  />
                </div>
              </div>

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
                  onClick={async () => {
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
                    } catch (err) {
                      console.error("Change password error", err);
                      showToast(
                        "error",
                        err?.response?.data?.message || "Không thể đổi mật khẩu"
                      );
                    } finally {
                      setPasswordSubmitting(false);
                    }
                  }}
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

// 🔹 Sub-component Field
function ProfileField({
  label,
  name,
  value,
  onChange,
  placeholder,
  readOnly,
  type = "text",
}) {
  return (
    <div className="flex justify-between px-6 py-4 hover:bg-blue-50 transition">
      <span className="text-gray-600 font-medium w-1/3">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-2/3 bg-transparent border-none text-gray-800 focus:ring-0 outline-none ${
          readOnly ? "cursor-not-allowed text-gray-500" : ""
        }`}
      />
    </div>
  );
}
