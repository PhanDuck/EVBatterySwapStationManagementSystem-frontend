import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Form, Input, Button, message } from "antd";
import api from "../../config/axios";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Lấy token từ URL
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
  setLoading(true);
  try {
    await api.post(
      "/update-password",
      { password: values.password },
      { headers: { Authorization: `Bearer ${token}` } } // hoặc body: {token, password}
    );
    message.success("Cập nhật mật khẩu thành công!");
  } catch (err) {
    message.error("Token không hợp lệ hoặc đã hết hạn!");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card title="Đặt lại mật khẩu" className="w-96">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Mật khẩu mới"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Mật khẩu xác nhận không khớp!");
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            disabled={!token}
          >
            Đặt lại mật khẩu
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;
