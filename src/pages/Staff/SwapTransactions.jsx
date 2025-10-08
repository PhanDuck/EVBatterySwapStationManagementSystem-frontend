import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Modal } from "antd";
import { toast } from "react-toastify";

const SwapTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [stationFilter, setStationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stations, setStations] = useState([]);

  const API_BASE = "https://68d29b4bcc7017eec54491b4.mockapi.io";

  const loadStations = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/station`, { params: { page: 1, limit: 100 } });
      setStations(res.data || []);
    } catch {
      setStations([]);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/swap`, { params: { page: 1, limit: 1000 } });
      const rows = res.data || [];
      setTransactions(rows);
      setTotal(rows.length);
    } catch {
      setTransactions([]);
      setTotal(0);
      toast.error("Không thể tải dữ liệu giao dịch");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, stationFilter, page, pageSize]);

  useEffect(() => {
    fetchData();
    loadStations();
  }, [fetchData, loadStations]);

  const statuses = useMemo(() => [
    "Pending", "InProgress", "Completed", "Cancelled", "Failed"
  ], []);

  const handleUpdateStatus = async (transactionId, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/swap/${transactionId}`, { status: newStatus })
        .catch(async () => {
          await axios.put(`${API_BASE}/swap/${transactionId}`, { status: newStatus });
        });
      toast.success("Cập nhật trạng thái thành công");
      fetchData();
    } catch {
      console.error("Failed to update status", { transactionId, newStatus });
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  // Sorting controls
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");

  // Derived rows after local filtering + sorting
  const displayedTransactions = useMemo(() => {
    let rows = [...transactions];
    
    if (statusFilter) {
      rows = rows.filter(r => String(r.status || r.Status || "") === statusFilter);
    }
    if (stationFilter) {
      rows = rows.filter(r => String(r.stationId || r.StationID || "").includes(stationFilter));
    }

    const key = (row) => {
      if (sortField === "id") return Number(row.id || row.SwapID || 0);
      if (sortField === "status") return String(row.status || row.Status || "");
      if (sortField === "stationId") return Number(row.stationId || row.StationID || 0);
      if (sortField === "timestamp") return new Date(row.timestamp || row.Timestamp || 0);
      return 0;
    };
    
    rows.sort((a, b) => {
      const va = key(a);
      const vb = key(b);
      const diff = va > vb ? 1 : va < vb ? -1 : 0;
      return sortOrder === "asc" ? diff : -diff;
    });
    
    return rows;
  }, [transactions, statusFilter, stationFilter, sortField, sortOrder]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Quản lý giao dịch đổi pin</h2>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            <input
              value={stationFilter}
              onChange={(e) => { setStationFilter(e.target.value); setPage(1); }}
              placeholder="Lọc theo Station ID"
              className="border p-2 rounded"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border p-2 rounded"
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="id">Sắp xếp theo: ID</option>
              <option value="status">Sắp xếp theo: Status</option>
              <option value="stationId">Sắp xếp theo: Station ID</option>
              <option value="timestamp">Sắp xếp theo: Thời gian</option>
            </select>
            <button
              className="border px-3 py-2 rounded"
              onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
              title="Tăng dần / Giảm dần"
            >{sortOrder === "asc" ? "Tăng dần" : "Giảm dần"}</button>
            <button 
              className="border px-3 py-2 rounded" 
              onClick={() => { setStatusFilter(""); setStationFilter(""); setPage(1); }}
            >
              Xóa lọc
            </button>
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Swap ID</th>
                <th className="text-left p-2">User ID</th>
                <th className="text-left p-2">Station ID</th>
                <th className="text-left p-2">Battery ID (Old)</th>
                <th className="text-left p-2">Battery ID (New)</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Timestamp</th>
                <th className="text-left p-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayedTransactions.map((row) => (
                <tr key={row.id || row.SwapID} className="border-b">
                  <td className="p-2">{row.id || row.SwapID}</td>
                  <td className="p-2">{row.userId || row.UserID}</td>
                  <td className="p-2">{row.stationId || row.StationID}</td>
                  <td className="p-2">{row.oldBatteryId || row.OldBatteryID}</td>
                  <td className="p-2">{row.newBatteryId || row.NewBatteryID}</td>
                  <td className="p-2">{row.status || row.Status}</td>
                  <td className="p-2">
                    {row.timestamp || row.Timestamp ? 
                      new Date(row.timestamp || row.Timestamp).toLocaleString('vi-VN') : 
                      'N/A'
                    }
                  </td>
                  <td className="p-2">
                    <select
                      defaultValue={row.status || row.Status}
                      onChange={(e) => handleUpdateStatus(row.id || row.SwapID, e.target.value)}
                      className="border p-1 rounded"
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={8}>Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-3 text-sm">
            <div>Tổng: {total}</div>
            <div className="flex items-center gap-2">
              <button 
                disabled={page <= 1} 
                className="border px-2 py-1 rounded disabled:opacity-50" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Trước
              </button>
              <div>Trang {page}</div>
              <button 
                className="border px-2 py-1 rounded" 
                onClick={() => setPage(p => p + 1)}
              >
                Sau
              </button>
              <select 
                value={pageSize} 
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} 
                className="border p-1 rounded"
              >
                {[10,20,50].map(n => <option key={n} value={n}>{n}/trang</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapTransactions;


