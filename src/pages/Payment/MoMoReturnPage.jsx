import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../config/axios";
import { Spin, Result, Button } from "antd";

export default function MoMoReturnPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const checkPayment = async () => {
      try {
        const res = await api.post("/payment/momo-ipn");
        if (res.data?.resultCode === 0) setStatus("success");
        else setStatus("fail");
      } catch {
        setStatus("fail");
      }
    };
    checkPayment();
  }, [searchParams]);

  if (status === "loading") return <Spin fullscreen />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {status === "success" ? (
        <Result
          status="success"
          title="Thanh toán thành công!"
          subTitle="Cảm ơn bạn đã sử dụng dịch vụ."
          extra={<Button type="primary" href="/">Về trang chủ</Button>}
        />
      ) : (
        <Result
          status="error"
          title="Thanh toán thất bại!"
          subTitle="Có lỗi xảy ra trong quá trình thanh toán."
          extra={<Button href="/">Thử lại</Button>}
        />
      )}
    </div>
  );
}
