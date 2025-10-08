import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "antd"; // Sử dụng Modal từ Ant Design
import { toast } from "react-toastify";
// Import api instance đã cấu hình sẵn (giả định file này tồn tại và được export default)
import api from "../../config/axios"; 

const InventoryManagement = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // State liên quan đến việc chuyển pin đến Station
  const [selectedBatteryId, setSelectedBatteryId] = useState(null);
  const [stationSelectionByBattery, setStationSelectionByBattery] = useState({});
  const [stationModalOpen, setStationModalOpen] = useState(false);
  const [stations, setStations] = useState([]);

  // --------------------------------------------------------------------------
  // HÀM TẢI DỮ LIỆU CÁC TRẠM (STATIONS)
  // Endpoint: GET /station (Giả định trả về mảng { id, name, address, ... })
  // --------------------------------------------------------------------------
  const loadStations = useCallback(async () => {
    try {
      // Dùng api instance đã import
      const res = await api.get(`/station`); 
      // Giả định API trả về một mảng trạm trực tiếp hoặc res.data.data
      setStations(res.data?.data || res.data || []); 
    } catch(err) {
      console.error("Lỗi khi tải danh sách Station:", err);
      setStations([]);
    }
  }, []);

  // --------------------------------------------------------------------------
  // HÀM TẢI DỮ LIỆU TỒN KHO (BATTERIES)
  // Endpoint: GET /battery
  // --------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: pageSize,
        status: statusFilter,
      };
      
      // Tạm thời lấy hết dữ liệu (như cách MockAPI trước đó)
      const fullRes = await api.get(`/battery`); 
      const fullRows = fullRes.data?.data || fullRes.data || [];
      
      setItems(fullRows);
      setTotal(fullRows.length); 

    } catch(err) {
      console.error("Lỗi khi tải dữ liệu tồn kho:", err);
      setItems([]);
      setTotal(0);
      toast.error("Không thể tải dữ liệu tồn kho");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, modelFilter, capacityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --------------------------------------------------------------------------
  // API 1: CẬP NHẬT TRẠNG THÁI PIN (Đổi trạng thái)
  // Endpoint DỰ ĐOÁN: PATCH /battery/{batteryId}/status
  // --------------------------------------------------------------------------
  const handleUpdateStatus = async (batteryId, newStatus) => {
    try {
      // GỌI API: Cập nhật trạng thái
      await api.patch(`/battery/${batteryId}/status`, { status: newStatus });
      
      toast.success("Cập nhật trạng thái thành công");
      fetchData(); // Tải lại dữ liệu sau khi cập nhật
      // Dispatch event nếu các component khác cần lắng nghe sự thay đổi
      window.dispatchEvent(new Event("inventory:updated")); 
    } catch(err) {
      console.error("Failed to update status", { batteryId, newStatus, error: err });
      toast.error("Cập nhật trạng thái thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  // --------------------------------------------------------------------------
  // API 2: CẬP NHẬT VỊ TRÍ PIN (Chuyển trạm)
  // Endpoint DỰ ĐOÁN: POST /battery/{batteryId}/transfer
  // --------------------------------------------------------------------------
  const handleTransferBattery = async (batteryId, stationId) => {
    if (!stationId) {
      toast.warn("Vui lòng chọn StationID.");
      return;
    }
    
    try {
      // GỌI API: Thực hiện chuyển pin đến trạm mới
      await api.post(`/battery/${batteryId}/transfer`, { stationId: stationId });

      toast.success(`Đã chuyển pin ${batteryId} đến Station ${stationId} thành công!`);
      setStationModalOpen(false); // Đóng modal

      // Xóa selection sau khi chuyển thành công
      setStationSelectionByBattery((prev) => {
        const newState = { ...prev };
        delete newState[batteryId];
        return newState;
      });

      fetchData(); // Tải lại dữ liệu sau khi chuyển
    } catch (err) {
      console.error("Lỗi khi chuyển pin:", err);
      toast.error("Chuyển pin thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    // Chỉ tải Stations khi Modal mở và chưa có data Stations
    if (stationModalOpen && (!stations || stations.length === 0)) {
      loadStations();
    }
  }, [stationModalOpen, stations, loadStations]);

  const statuses = useMemo(() => [
    "Available","Charging","Reserved","Maintenance","InUse","Faulty"
  ], []);

  // Sorting controls
  const [sortField, setSortField] = useState("batteryId");
  const [sortMode, setSortMode] = useState("alpha"); // alpha | numeric
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc

  // Derived rows after local filtering + sorting
  const displayedItems = useMemo(() => {
    let rows = [...items];
    if (modelFilter) {
      const q = modelFilter.toLowerCase();
      rows = rows.filter(r => String(r.model || r.Model || "").toLowerCase().includes(q));
    }
    if (statusFilter) {
      rows = rows.filter(r => String(r.status || r.Status || "") === statusFilter);
    }
    if (capacityFilter !== "") {
      const capNum = Number(capacityFilter);
      if (!Number.isNaN(capNum)) {
        rows = rows.filter(r => Number(r.capacity || r.Capacity || 0) >= capNum);
      }
    }

    const key = (row) => {
      // Ưu tiên các tên trường theo API Swagger: id, model, capacity, status, stateOfHealth
      if (sortField === "batteryId") return Number(row.id || row.batteryId || row.BatteryID || 0);
      if (sortField === "model") return String(row.model || row.Model || "");
      if (sortField === "capacity") return Number(row.capacity || row.Capacity || 0);
      if (sortField === "status") return String(row.status || row.Status || "");
      return 0;
    };
    
    // Logic sắp xếp (giữ nguyên)
    rows.sort((a, b) => {
      const va = key(a);
      const vb = key(b);
      if (sortMode === "numeric") {
        const na = Number(va);
        const nb = Number(vb);
        const diff = (na - nb);
        return sortOrder === "asc" ? diff : -diff;
      }
      const diff = String(va).localeCompare(String(vb));
      return sortOrder === "asc" ? diff : -diff;
    });
    
    // PHÂN TRANG CỤC BỘ (Vì backend có thể chưa hỗ trợ phân trang)
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setTotal(rows.length); // Cập nhật lại tổng số sau khi lọc
    return rows.slice(startIndex, endIndex);

  }, [items, modelFilter, statusFilter, capacityFilter, sortField, sortMode, sortOrder, page, pageSize]);

  // Lấy ID pin đang được chọn trong Modal
  const currentSelectedBatteryId = useMemo(() => selectedBatteryId, [selectedBatteryId]);
  const currentSelectedStationId = useMemo(() => stationSelectionByBattery[currentSelectedBatteryId], [stationSelectionByBattery, currentSelectedBatteryId]);

  // Hàm tiện ích để lấy ID chuẩn của pin
  const getBatteryId = (row) => row.id || row.batteryId || row.BatteryID;

  return (
    <>
    <div className="p-4 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Quản lý tồn kho pin</h2>
      
      {loading && items.length === 0 ? (
        <div className="text-center py-10 text-lg text-blue-500">
            <svg className="animate-spin h-5 w-5 mr-3 inline text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tải dữ liệu tồn kho...
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Controls: Filters & Sorting */}
          <div className="flex flex-wrap gap-3 mb-4 items-center p-3 bg-gray-50 rounded-lg border">
            <input
              value={modelFilter}
              onChange={(e) => { setModelFilter(e.target.value); setPage(1); }}
              placeholder="Lọc theo model"
              className="border p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
            <input
              type="number"
              value={capacityFilter}
              onChange={(e) => { setCapacityFilter(e.target.value); setPage(1); }}
              placeholder="Lọc theo capacity (>=)"
              className="border p-2 rounded-lg w-44 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border p-2 rounded-lg appearance-none bg-white focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            
            <div className="flex items-center gap-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="border p-2 rounded-lg appearance-none bg-white transition duration-150"
                >
                  <option value="batteryId">Sắp xếp theo: ID</option>
                  <option value="model">Sắp xếp theo: Model</option>
                  <option value="capacity">Sắp xếp theo: Capacity</option>
                  <option value="status">Sắp xếp theo: Status</option>
                </select>
                <button
                  className="border px-3 py-2 rounded-lg text-sm bg-white hover:bg-gray-100 transition duration-150 shadow-sm"
                  onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
                  title="Tăng dần / Giảm dần"
                >
                  {sortOrder === "asc" ? "Tăng dần (↑)" : "Giảm dần (↓)"}
                </button>
            </div>
            
            <button 
                className="border px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition duration-150 shadow-sm ml-auto" 
                onClick={() => { setModelFilter(""); setCapacityFilter(""); setStatusFilter(""); setPage(1); }}
            >
                Xóa lọc
            </button>
          </div>

          {/* Table */}
          <table className="min-w-full text-sm bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-blue-600 text-white shadow-sm">
                <th className="text-left p-3 rounded-tl-lg">BatteryID</th>
                <th className="text-left p-3">Model</th>
                <th className="text-left p-3">Capacity (kWh)</th>
                <th className="text-left p-3">SOH (%)</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3 rounded-tr-lg">Thao tác</th> 
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((row, index) => {
                const batteryId = getBatteryId(row); // Lấy ID chuẩn
                return (
                <tr 
                  key={batteryId || index} 
                  className={`border-b hover:bg-gray-50 transition duration-100 ${index % 2 === 0 ? '' : 'bg-gray-50'}`}
                >
                  {/* Sử dụng ID chuẩn */}
                  <td className="p-3 font-medium text-gray-700">{batteryId}</td>
                  <td className="p-3">{row.model || row.Model}</td>
                  <td className="p-3 text-center">{row.capacity || row.Capacity}</td>
                  <td className="p-3 text-center font-semibold text-green-600">{row.stateOfHealth || row.StateOfHealth || row.soh || 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        (row.status || row.Status) === 'Available' ? 'bg-green-100 text-green-700' :
                        (row.status || row.Status) === 'Charging' ? 'bg-yellow-100 text-yellow-700 animate-pulse' :
                        (row.status || row.Status) === 'Faulty' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                        {row.status || row.Status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      {/* Dropdown chọn trạng thái pin để gọi API Đổi Trạng Thái */}
                      <select
                        value={row.status || row.Status}
                        onChange={(e) => handleUpdateStatus(batteryId, e.target.value)}
                        className="border p-1 rounded-lg text-sm bg-white hover:border-blue-400 transition"
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      
                      {/* Button mở Modal để gọi API Chuyển Trạm */}
                      <button
                        onClick={() => { setSelectedBatteryId(batteryId); setStationModalOpen(true); }}
                        className="p-1 rounded-lg text-sm bg-blue-500 text-white hover:bg-blue-600 transition duration-150 shadow-md flex items-center gap-1"
                      >
                        {/* Icon Transfer/Move */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M18 18l-6 6-6-6"/></svg>
                        Transfer
                      </button>
                    </div>
                  </td>
                </tr>
              );})}
              {items.length === 0 && (
                <tr>
                  <td className="p-5 text-center text-gray-500" colSpan={6}>
                    {loading ? "Đang tải..." : "Không có dữ liệu tồn kho nào được tìm thấy."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination and Total Count */}
          <div className="flex items-center justify-between mt-4 text-sm p-2 bg-gray-50 rounded-lg border">
            <div>Tổng số pin đang hiển thị (sau lọc): **{total}**</div>
            <div className="flex items-center gap-3">
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="border p-1.5 rounded-lg text-sm appearance-none bg-white shadow-sm">
                {[10,20,50].map(n => <option key={n} value={n}>{n} mục/trang</option>)}
              </select>
              
              <button disabled={page <= 1} className="border px-3 py-1 rounded-lg disabled:opacity-50 bg-white hover:bg-gray-100 transition shadow-sm" onClick={() => setPage(p => Math.max(1, p - 1))}>
                &larr; Trang Trước
              </button>
              <div className="font-semibold text-gray-700">Trang {page}</div>
              <button 
                // Điều kiện giả định: Nếu số lượng item hiện tại ít hơn pageSize, thì không còn trang nào nữa
                disabled={displayedItems.length < pageSize && displayedItems.length > 0} 
                className="border px-3 py-1 rounded-lg disabled:opacity-50 bg-white hover:bg-gray-100 transition shadow-sm" 
                onClick={() => setPage(p => p + 1)}
              >
                Trang Sau &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
    {/* Modal Chọn Station */}
    <Modal
      title={
        <span className="text-xl font-bold text-blue-600">
            Chuyển Pin {currentSelectedBatteryId} đến Station
        </span>
      }
      open={stationModalOpen}
      onCancel={() => setStationModalOpen(false)}
      footer={[
        <button key="back" className="border px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition" onClick={() => setStationModalOpen(false)}>
          Hủy
        </button>,
        <button 
          key="submit" 
          className="ml-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 shadow-md" 
          onClick={() => handleTransferBattery(currentSelectedBatteryId, currentSelectedStationId)}
          disabled={!currentSelectedStationId}
        >
          Xác nhận chuyển
        </button>
      ]}
    >
      <div className="space-y-3 mt-4 max-h-80 overflow-y-auto p-2 border rounded-lg">
        {(stations || []).map((s) => (
          <button
            key={s.id}
            className={`border rounded-lg px-4 py-2 w-full text-left transition duration-150 flex justify-between items-center ${String(s.id) === String(currentSelectedStationId) ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200 font-semibold' : 'bg-white hover:bg-gray-50'}`}
            onClick={() => setStationSelectionByBattery((prev) => ({ ...prev, [currentSelectedBatteryId]: s.id }))}
          >
            <span className="text-gray-800">Station ID: {s.id}</span>
            <span className="text-sm text-gray-500">
                {s.name || s.address}
            </span>
          </button>
        ))}
        {(!stations || stations.length === 0) && (
          <div className="text-center py-4 text-sm text-gray-500">Không có station nào để chuyển đến</div>
        )}
      </div>
      <p className="mt-4 text-sm text-gray-600 italic">
          Đang chọn Station ID: <span className="font-bold text-blue-700">{currentSelectedStationId || "Chưa chọn"}</span>
      </p>
    </Modal>
    </>
  );
};

export default InventoryManagement;


