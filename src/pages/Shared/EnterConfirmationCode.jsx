import React, { useState } from "react";
import { Card, Input, Button, message } from "antd";
import axios from "axios";

const EnterConfirmationCode = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  
  const token = sessionStorage.getItem("authToken");

  const handleConfirm = async () => {
    if (!code || code.length !== 6) {
      return message.warning("⚠️ Vui lòng nhập đúng mã gồm 6 ký tự.");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `/api/swap-transaction/swap-by-code?confirmationCode=${code}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success("✅ Xác nhận thành công!");
      console.log("✅ Response API:", res.data);
    } catch (error) {
      console.error("❌ Lỗi API:", error);
      message.error(
        error?.response?.data?.message || "❌ Xác nhận không thành công!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Nhập mã xác nhận để Swap Pin"
      style={{ maxWidth: 400, margin: "0 auto" }}
    >
      <Input
        placeholder="Nhập mã gồm 6 ký tự"
        value={code}
        maxLength={6}
        onChange={(e) => setCode(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      <Button
        type="primary"
        block
        onClick={handleConfirm}
        loading={loading}
        disabled={!code}
      >
        Xác nhận Swap
      </Button>
    </Card>
  );
};

export default EnterConfirmationCode;
