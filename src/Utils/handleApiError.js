import { showToast } from "./toastHandler";

let lastError = "";
let lastErrorTime = 0;

export default function handleApiError(error, context = "") {
  if (!error) {
    return showToast("error", "Đã xảy ra lỗi không xác định.");
  }

  const response = error.response;
  if (!response) {
    return showToast(
      "error",
      "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng của bạn."
    );
  }

  const status = response.status;
  const backendMessage = response.data?.message || response.data?.error || "";
  const message =
    backendMessage ||
    {
      400: `Dữ liệu không hợp lệ${context ? ` khi ${context}` : ""}.`,
      401: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      403: "Bạn không có quyền thực hiện hành động này.",
      404: "Không tìm thấy dữ liệu yêu cầu.",
      409: "Xung đột dữ liệu. Vui lòng thử lại.",
      422: "Dữ liệu nhập vào không hợp lệ.",
      500: "Lỗi hệ thống. Vui lòng thử lại sau.",
    }[status] ||
    "Đã xảy ra lỗi không mong muốn.";

  // ⚠️ Chống hiển thị trùng lặp
  const now = Date.now();
  if (message === lastError && now - lastErrorTime < 2000) {
    return; // Bỏ qua lỗi trùng trong vòng 2 giây
  }
  lastError = message;
  lastErrorTime = now;

  // Hiển thị toast phù hợp
  switch (status) {
    case 400:
    case 409:
    case 422:
      showToast("warning", message);
      break;

    case 401:
      showToast("warning", message);
      try {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
      } catch {
        // Ignore errors
      }
      break;

    case 403:
    case 404:
    case 500:
    default:
      showToast("error", message);
      break;
  }
}
