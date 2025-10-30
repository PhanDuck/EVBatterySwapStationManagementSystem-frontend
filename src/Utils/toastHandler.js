import { toast } from "react-toastify";

/**
 * Hiển thị thông báo toast.
 * @param {'success' | 'error' | 'warning' | 'info'} type
 * @param {string} message
 */
export const showToast = (type, message) => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "warning":
      toast.warning(message);
      break;
    default:
      toast.info(message);
      break;
  }
};
