import React, { useState } from "react";
import { Card, Form, Input, Button,} from "antd";
import api from "../../config/axios";
import BackgroundImage from "../../assets/img/backgroundaboutus.png";
import { showToast } from "../../Utils/toastHandler";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {

  try {
    setLoading(true);
    await api.post(`/reset-password?email=${values.email}`);
    showToast("success", "Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.");
  } catch (error) {
    
    showToast("error", error.response.data || "Đã xảy ra lỗi, vui lòng thử lại!");
  } finally {
    setLoading(false);
  }
};
  return (
    <div
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "120px 20px",
        textAlign: "center",
        color: "white",
        position: "relative", // Cần thiết để lớp phủ hoạt động
      }}
    >
      <div className="flex justify-center items-center min-h-screen">
        <Card
          title="Quên mật khẩu"
          className="w-full max-w-md shadow-lg rounded-2xl"
        >
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input placeholder="Nhập email bạn đã đăng ký" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="rounded-xl"
            >
              Gửi yêu cầu đặt lại mật khẩu
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
