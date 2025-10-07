import React from "react";
import CrudTable from "./CrudTable";

const AdminDashboard = () => {
  return (
    <div className="space-y-10">
      <CrudTable
        title="Quản lý Trạm"
        resource="/admin/stations"
        idKey="stationId"
        columns={[
          { title: "ID", dataIndex: "stationId" },
          { title: "Tên", dataIndex: "name" },
          { title: "Vị trí", dataIndex: "location" },
          { title: "Sức chứa", dataIndex: "capacity" },
          { title: "Trạng thái", dataIndex: "status" },
        ]}
        formFields={[
          { name: "name", label: "Tên", rules: [{ required: true }] },
          { name: "location", label: "Vị trí" },
          { name: "capacity", label: "Sức chứa" },
          { name: "contactInfo", label: "Liên hệ" },
          { name: "status", label: "Trạng thái" },
        ]}
      />

      <CrudTable
        title="Quản lý Pin"
        resource="/admin/batteries"
        idKey="batteryId"
        columns={[
          { title: "ID", dataIndex: "batteryId" },
          { title: "Model", dataIndex: "model" },
          { title: "Dung lượng", dataIndex: "capacity" },
          { title: "SOH", dataIndex: "stateOfHealth" },
          { title: "Trạng thái", dataIndex: "status" },
        ]}
        formFields={[
          { name: "model", label: "Model", rules: [{ required: true }] },
          { name: "capacity", label: "Dung lượng" },
          { name: "stateOfHealth", label: "SOH" },
          { name: "status", label: "Trạng thái" },
        ]}
      />

      <CrudTable
        title="Gói dịch vụ"
        resource="/admin/packages"
        idKey="packageId"
        columns={[
          { title: "ID", dataIndex: "packageId" },
          { title: "Tên", dataIndex: "name" },
          { title: "Giá", dataIndex: "price" },
          { title: "Thời hạn (ngày)", dataIndex: "duration" },
          { title: "Số lượt", dataIndex: "maxSwaps" },
        ]}
        formFields={[
          { name: "name", label: "Tên", rules: [{ required: true }] },
          { name: "description", label: "Mô tả" },
          { name: "price", label: "Giá" },
          { name: "duration", label: "Thời hạn" },
          { name: "maxSwaps", label: "Số lượt" },
        ]}
      />
    </div>
  );
};

export default AdminDashboard;


