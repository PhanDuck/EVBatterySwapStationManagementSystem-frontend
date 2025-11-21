import { showToast } from "./toastHandler";

const handleApiRequest = async (callback, successMsg) => {
  try {
    const res = await callback();
    const msg = res.data?.message || successMsg || "Thao tác thành công!";
    showToast("success", msg);
    return res.data; // trả dữ liệu để component có thể dùng
  } catch (error) {
    const errMsg =
      error.response?.data?.message ||
      (typeof error.response?.data === "string"
        ? error.response.data
        : "Đã xảy ra lỗi, vui lòng thử lại!");

    showToast("error", errMsg);
    throw error; // ném lại lỗi nếu bạn muốn xử lý thêm bên ngoài
  }
};
export default handleApiRequest;
