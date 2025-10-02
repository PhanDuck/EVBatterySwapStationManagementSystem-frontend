import { createRoot } from "react-dom/client";
import App from "./App";
import 'antd/dist/reset.css';
import "./index.css";




createRoot(document.getElementById("root")).render(<App />);

// document.getElementById('root')
// B1: tìm tới thẻ có tên là root
// B2: render

// chương trình sẽ chạy từ thằng main
