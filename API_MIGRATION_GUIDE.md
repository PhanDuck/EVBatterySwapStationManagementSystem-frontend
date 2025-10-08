# Hướng dẫn chuyển đổi từ Mock API sang Real API

## Tổng quan
Hiện tại ứng dụng đang sử dụng Mock API từ `https://68d29b4bcc7017eec54491b4.mockapi.io`. 
Bạn muốn chuyển sang Real API tại: `http://103.200.20.190:8080/swagger-ui/index.html#/`

## Các bước thực hiện

### 1. Tạo file cấu hình API mới

Tạo file `src/config/realApi.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://103.200.20.190:8080';

const realApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token nếu cần
realApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi chung
realApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý token hết hạn
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default realApi;
```

### 2. Cập nhật InventoryManagement.jsx

Thay thế phần import và API calls:

```javascript
// Thay đổi import
import realApi from "../../config/realApi";

// Thay đổi API_BASE
const API_BASE = "http://103.200.20.190:8080";

// Cập nhật các API calls
const fetchData = useCallback(async () => {
  setLoading(true);
  try {
    // Thay đổi endpoint theo Swagger API
    const res = await realApi.get("/api/batteries", { 
      params: { 
        page: page - 1, // Real API thường dùng 0-based pagination
        size: pageSize,
        status: statusFilter || undefined,
        model: modelFilter || undefined,
        minCapacity: capacityFilter || undefined
      } 
    });
    const rows = res.data.content || res.data || []; // Tùy theo cấu trúc response
    setItems(rows);
    setTotal(res.data.totalElements || rows.length);
  } catch (error) {
    console.error("API Error:", error);
    setItems([]);
    setTotal(0);
    toast.error("Không thể tải dữ liệu tồn kho");
  } finally {
    setLoading(false);
  }
}, [statusFilter, modelFilter, capacityFilter, page, pageSize]);

const handleUpdateStatus = async (batteryId, newStatus) => {
  try {
    await realApi.put(`/api/batteries/${batteryId}/status`, { 
      status: newStatus 
    });
    toast.success("Cập nhật trạng thái thành công");
    fetchData();
    window.dispatchEvent(new Event("inventory:updated"));
  } catch (error) {
    console.error("Failed to update status", error);
    toast.error("Cập nhật trạng thái thất bại");
  }
};

const loadStations = useCallback(async () => {
  try {
    const res = await realApi.get("/api/stations", { 
      params: { page: 0, size: 100 } 
    });
    setStations(res.data.content || res.data || []);
  } catch (error) {
    console.error("Failed to load stations", error);
    setStations([]);
  }
}, []);
```

### 3. Cập nhật SwapTransactions.jsx

```javascript
// Thay đổi import
import realApi from "../../config/realApi";

// Cập nhật API calls
const fetchData = useCallback(async () => {
  setLoading(true);
  try {
    const res = await realApi.get("/api/swap-transactions", { 
      params: { 
        page: page - 1,
        size: pageSize,
        status: statusFilter || undefined,
        stationId: stationFilter || undefined
      } 
    });
    const rows = res.data.content || res.data || [];
    setTransactions(rows);
    setTotal(res.data.totalElements || rows.length);
  } catch (error) {
    console.error("API Error:", error);
    setTransactions([]);
    setTotal(0);
    toast.error("Không thể tải dữ liệu giao dịch");
  } finally {
    setLoading(false);
  }
}, [statusFilter, stationFilter, page, pageSize]);

const handleUpdateStatus = async (transactionId, newStatus) => {
  try {
    await realApi.put(`/api/swap-transactions/${transactionId}/status`, { 
      status: newStatus 
    });
    toast.success("Cập nhật trạng thái thành công");
    fetchData();
  } catch (error) {
    console.error("Failed to update status", error);
    toast.error("Cập nhật trạng thái thất bại");
  }
};
```

### 4. Mapping API Endpoints

Dựa trên Swagger UI, bạn cần mapping các endpoint:

| Chức năng | Mock API | Real API (dự kiến) |
|-----------|----------|-------------------|
| Danh sách pin | `/battery` | `/api/batteries` |
| Cập nhật trạng thái pin | `PATCH /battery/{id}` | `PUT /api/batteries/{id}/status` |
| Danh sách trạm | `/station` | `/api/stations` |
| Giao dịch đổi pin | `/swap` | `/api/swap-transactions` |
| Cập nhật trạng thái giao dịch | `PATCH /swap/{id}` | `PUT /api/swap-transactions/{id}/status` |

### 5. Xử lý Response Format

Real API có thể có cấu trúc response khác:

```javascript
// Mock API response
{
  "data": [...]
}

// Real API response (Spring Boot typical)
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 10,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false
}

// Hoặc đơn giản
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

### 6. Xử lý Authentication

```javascript
// Thêm vào các component cần thiết
const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
  const token = localStorage.getItem('authToken');
  setIsAuthenticated(!!token);
}, []);

// Kiểm tra authentication trước khi gọi API
if (!isAuthenticated) {
  toast.error("Vui lòng đăng nhập");
  return;
}
```

### 7. Error Handling

```javascript
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error || 'Có lỗi xảy ra';
    
    switch (status) {
      case 401:
        toast.error("Phiên đăng nhập đã hết hạn");
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        break;
      case 403:
        toast.error("Không có quyền truy cập");
        break;
      case 404:
        toast.error("Không tìm thấy dữ liệu");
        break;
      case 500:
        toast.error("Lỗi máy chủ");
        break;
      default:
        toast.error(message);
    }
  } else if (error.request) {
    // Network error
    toast.error("Không thể kết nối đến máy chủ");
  } else {
    toast.error("Có lỗi xảy ra");
  }
};
```

### 8. Testing và Debug

1. **Kiểm tra CORS**: Đảm bảo backend cho phép CORS từ frontend
2. **Network tab**: Sử dụng DevTools để kiểm tra requests/responses
3. **Console logs**: Thêm logging để debug
4. **Swagger UI**: Sử dụng để test API trực tiếp

### 9. Environment Variables

Tạo file `.env`:

```env
REACT_APP_API_BASE_URL=http://103.200.20.190:8080
REACT_APP_API_TIMEOUT=10000
```

Cập nhật config:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://103.200.20.190:8080';
```

## Lưu ý quan trọng

1. **Backup code hiện tại** trước khi thay đổi
2. **Test từng component** một cách riêng biệt
3. **Kiểm tra Swagger UI** để hiểu rõ API structure
4. **Xử lý loading states** và error handling
5. **Cập nhật documentation** sau khi migrate

## Checklist Migration

- [ ] Tạo file config API mới
- [ ] Cập nhật InventoryManagement component
- [ ] Cập nhật SwapTransactions component
- [ ] Test authentication flow
- [ ] Test CRUD operations
- [ ] Xử lý error cases
- [ ] Update documentation
- [ ] Deploy và test production
