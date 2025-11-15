# QUY TẮC VÀ LOGIC NGHIỆP VỤ HỆ THỐNG QUẢN LÝ TRẠM ĐỔI PIN XE ĐIỆN

## MỤC LỤC
1. [Quản lý Người Dùng & Xác Thực](#1-quản-lý-người-dùng--xác-thực)
2. [Quản lý Xe & Phê Duyệt](#2-quản-lý-xe--phê-duyệt)
3. [Quản lý Gói Dịch Vụ](#3-quản-lý-gói-dịch-vụ)
4. [Đặt Chỗ Đổi Pin](#4-đặt-chỗ-đổi-pin)
5. [Giao Dịch Đổi Pin](#5-giao-dịch-đổi-pin)
6. [Quản lý Pin](#6-quản-lý-pin)
7. [Nâng Cấp & Gia Hạn Gói](#7-nâng-cấp--gia-hạn-gói)
8. [Email & Thông Báo](#8-email--thông-báo)
9. [Quản lý Trạm](#9-quản-lý-trạm)
10. [Phân Công Nhân Viên](#10-phân-công-nhân-viên)
11. [Hỗ Trợ Khách Hàng](#11-hỗ-trợ-khách-hàng)
12. [Quản lý Pin (CRUD)](#12-quản-lý-pin-battery)
13. [Thanh Toán MoMo](#13-thanh-toán-momo)
14. [Quản lý Gói Dịch Vụ (CRUD)](#14-quản-lý-gói-dịch-vụ-service-package)
15. [Dashboard & Thống Kê](#15-dashboard--thống-kê-admin)
16. [Quyền Hạn Theo Vai Trò](#16-quyền-hạn-theo-vai-trò-role-based-access)
17. [Quản lý Loại Pin](#17-quản-lý-loại-pin-battery-type)
18. [Quản lý Kho Pin](#18-quản-lý-kho-pin-station-inventory)
19. [Quy Tắc Quan Trọng](#19-các-quy-tắc-quan-trọng-critical-rules)
20. [Tham Khảo Nhanh](#20-tham-khảo-nhanh-cheat-sheet)
21. [Contact & Support](#21-contact--support)

---

## 1. QUẢN LÝ NGƯỜI DÙNG & XÁC THỰC

### 1.1. ĐĂNG KÝ TÀI KHOẢN (Register)
**Endpoint:** `POST /api/register`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **CAPTCHA bắt buộc** | Phải verify CAPTCHA token từ Google reCAPTCHA trước khi tạo tài khoản |
| 2 | **Email duy nhất** | Email không được trùng với bất kỳ tài khoản nào trong hệ thống |
| 3 | **Số điện thoại duy nhất** | Số điện thoại phải tuân theo format Việt Nam: `(03|05|07|08|09)[0-9]{8}` và không được trùng |
| 4 | **Vai trò mặc định** | Tài khoản mới tự động được gán role = `DRIVER` |
| 5 | **Trạng thái mặc định** | Tài khoản mới tự động có status = `ACTIVE` |
| 6 | **Mã hóa mật khẩu** | Mật khẩu được mã hóa bằng BCrypt trước khi lưu database |

**Lỗi có thể xảy ra:**
- `AuthenticationException`: CAPTCHA không hợp lệ
- `IllegalArgumentException`: Email hoặc số điện thoại đã tồn tại

---

### 1.2. ĐĂNG NHẬP (Login)
**Endpoint:** `POST /api/login`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Xác thực số điện thoại** | Sử dụng số điện thoại làm username để đăng nhập |
| 2 | **Kiểm tra mật khẩu** | So sánh mật khẩu đã mã hóa với BCrypt |
| 3 | **Tạo JWT Token** | Sau khi xác thực thành công, tạo JWT token cho session |
| 4 | **Trả về thông tin user** | Response chứa: id, fullName, email, phoneNumber, dateOfBirth, gender, role, status, **token** |

---

### 1.3. CẬP NHẬT PROFILE
**Endpoint:** `PUT /api/profile`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ user hiện tại** | Chỉ được cập nhật profile của chính mình |
| 2 | **Email không trùng** | Nếu thay đổi email, phải kiểm tra email mới không trùng với user khác |
| 3 | **Validate độ tuổi** | Nếu cập nhật dateOfBirth, tuổi phải từ **16-100 tuổi** |
| 4 | **Field optional** | Các field null sẽ không được cập nhật (giữ nguyên giá trị cũ) |
| 5 | **Cho phép gender = null** | Nếu frontend gửi gender = "" (empty string), tự động chuyển thành null |

**Validation tuổi:**
```java
int age = Period.between(request.getDateOfBirth(), LocalDate.now()).getYears();
if (age < 15 || age > 100) {
    throw new IllegalArgumentException("Tuổi phải từ 16 đến 100 tuổi!");
}
```

---

### 1.4. ĐỔI MẬT KHẨU
**Endpoint:** `POST /api/change-password`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Xác thực mật khẩu cũ** | Phải nhập đúng mật khẩu cũ mới được đổi |
| 2 | **Mật khẩu mới ≠ mật khẩu cũ** | Mật khẩu mới không được trùng với mật khẩu cũ |
| 3 | **Xác nhận mật khẩu** | newPassword phải khớp với confirmPassword |
| 4 | **Mã hóa mật khẩu mới** | Mật khẩu mới được mã hóa bằng BCrypt |

---

### 1.5. QUÊN MẬT KHẨU
**Endpoint:** `POST /api/reset-password?email={email}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Kiểm tra email tồn tại** | Email phải có trong hệ thống |
| 2 | **Tạo token reset** | Token có hiệu lực **15 phút** |
| 3 | **Gửi email chứa link** | Link reset: `http://evbatteryswapsystem.com/reset-password?token={token}` |
| 4 | **Không yêu cầu đăng nhập** | API public, không cần JWT token |

---

## 2. QUẢN LÝ XE & PHÊ DUYỆT

### 2.1. ĐĂNG KÝ XE (Driver)
**Endpoint:** `POST /api/vehicle` (multipart/form-data)

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ DRIVER** | Chỉ user có role = `DRIVER` mới được đăng ký xe |
| 2 | **VIN duy nhất** | VIN không được trùng với xe khác (chỉ check xe ACTIVE & PENDING) |
| 3 | **Biển số duy nhất** | PlateNumber không được trùng với xe khác (chỉ check xe ACTIVE & PENDING) |
| 4 | **Tối đa 2 xe ACTIVE** | 1 driver chỉ được có tối đa 2 xe ở trạng thái ACTIVE |
| 5 | **Tối đa 1 xe PENDING** | Nếu đang có xe PENDING, không được đăng ký xe mới cho đến khi được duyệt/từ chối |
| 6 | **Upload ảnh giấy đăng ký** | Bắt buộc upload file ảnh (registrationImage) |
| 7 | **Trạng thái ban đầu** | Xe mới tạo có status = `PENDING` (chờ admin duyệt) |
| 8 | **Loại pin phải tồn tại** | batteryTypeId phải hợp lệ |
| 9 | **Gửi email cho Admin** | Sau khi tạo xe, tự động gửi email thông báo cho tất cả Admin |

**Lỗi có thể xảy ra:**
- `AuthenticationException`: Không phải DRIVER
- `IllegalArgumentException`: VIN hoặc biển số trùng
- `IllegalStateException`: Đã đủ 2 xe ACTIVE hoặc đang có xe PENDING

---

### 2.2. PHÊ DUYỆT XE (Admin/Staff)
**Endpoint:** `POST /api/vehicle/{id}/approve`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin/Staff** | Chỉ user có role = `ADMIN` hoặc `STAFF` mới được phê duyệt |
| 2 | **Xe phải PENDING** | Chỉ phê duyệt xe ở trạng thái PENDING |
| 3 | **Driver không quá 2 xe** | Kiểm tra driver không có quá 2 xe ACTIVE trước khi duyệt |
| 4 | **Bắt buộc gắn pin** | Phải chỉ định batteryId để gắn pin ban đầu cho xe |
| 5 | **Pin phải từ KHO** | Pin phải có status = `AVAILABLE`, `currentStation = NULL` và có trong `StationInventory` |
| 6 | **Loại pin khớp với xe** | batteryType của pin phải khớp với batteryType của xe |
| 7 | **Cập nhật trạng thái pin** | Pin chuyển sang status = `IN_USE`, currentStation = NULL |
| 8 | **Xóa pin khỏi kho** | Xóa record pin trong `StationInventory` (pin đã lên xe) |
| 9 | **Xe chuyển ACTIVE** | status xe = `ACTIVE` |
| 10 | **Gửi email cho Driver** | Thông báo xe đã được phê duyệt |

**Quy trình:**
```
1. Kiểm tra xe PENDING
2. Kiểm tra driver chưa quá 2 xe ACTIVE
3. Validate pin từ kho (AVAILABLE + currentStation = NULL + trong StationInventory)
4. Kiểm tra loại pin khớp
5. Gắn pin vào xe (vehicle.currentBattery = battery)
6. Pin: status = IN_USE, currentStation = NULL
7. Xóa pin khỏi StationInventory
8. Xe: status = ACTIVE
9. Gửi email thông báo
```

---

### 2.3. TỪ CHỐI XE (Admin/Staff)
**Endpoint:** `POST /api/vehicle/{id}/reject`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin/Staff** | Chỉ user có role = `ADMIN` hoặc `STAFF` |
| 2 | **Xe phải PENDING** | Chỉ từ chối xe ở trạng thái PENDING |
| 3 | **Chuyển INACTIVE** | status xe = `INACTIVE` |
| 4 | **Ghi nhận người từ chối** | deletedBy = currentUser, deletedAt = now() |
| 5 | **Gửi email cho Driver** | Thông báo xe bị từ chối kèm lý do (rejectionReason) |

---

### 2.4. XÓA XE (Soft Delete - Admin/Staff)
**Endpoint:** `DELETE /api/vehicle/{id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin/Staff** | Chỉ user có role = `ADMIN` hoặc `STAFF` |
| 2 | **Không xóa xe đã INACTIVE** | Nếu xe đã bị xóa (INACTIVE), không cho xóa lại |
| 3 | **Không xóa xe có booking active** | Kiểm tra xe không có booking CONFIRMED (đang chờ đổi pin) |
| 4 | **Xử lý pin hiện tại** | Pin từ xe bị xóa chuyển sang status = `MAINTENANCE`, currentStation = NULL |
| 5 | **Thêm pin vào kho bảo trì** | Thêm/cập nhật pin trong `StationInventory` với status = MAINTENANCE |
| 6 | **Gỡ pin khỏi xe** | vehicle.currentBattery = NULL |
| 7 | **Soft delete** | status = `INACTIVE`, deletedAt = now(), deletedBy = currentUser |

**Lý do chuyển pin sang MAINTENANCE thay vì AVAILABLE:**
- Pin từ xe bị xóa cần kiểm tra/bảo dưỡng trước khi đưa vào lưu thông

---

### 2.5. CẬP NHẬT XE (Driver)
**Endpoint:** `PUT /api/vehicle/my-vehicles/{id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ xe của mình** | Driver chỉ được update xe thuộc sở hữu của mình |
| 2 | **Chỉ update model & batteryType** | Không được thay đổi VIN, PlateNumber, registrationImage |
| 3 | **Field optional** | Nếu field = null hoặc empty, giữ nguyên giá trị cũ |

---

## 3. QUẢN LÝ GÓI DỊCH VỤ

### 3.1. MUA GÓI DỊCH VỤ (Sau Thanh Toán MoMo)
**Endpoint:** Internal - `createSubscriptionAfterPayment(packageId, driverId)`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Kiểm tra gói ACTIVE hiện tại** | Tìm gói đang ACTIVE của driver (startDate ≤ today ≤ endDate) |
| 2 | **Không được còn lượt đổi** | Nếu gói ACTIVE còn remainingSwaps > 0 → **KHÔNG CHO MUA** |
| 3 | **Hết hạn gói cũ nếu hết lượt** | Nếu gói ACTIVE nhưng remainingSwaps = 0 → chuyển status = `EXPIRED` |
| 4 | **Tạo gói mới** | startDate = hôm nay, endDate = startDate + duration |
| 5 | **Lượt đổi FULL** | remainingSwaps = maxSwaps (100% lượt đổi) |
| 6 | **Trạng thái ACTIVE** | status = `ACTIVE` |

**Logic:**
```java
if (existingSub.getRemainingSwaps() > 0) {
    throw new Exception("Gói hiện tại vẫn còn lượt! Không cho mua gói mới.");
}

// Nếu remainingSwaps = 0
existingSub.setStatus(EXPIRED);

// Tạo gói mới
newSub.setRemainingSwaps(package.getMaxSwaps());
newSub.setStatus(ACTIVE);
```

---

### 3.2. XEM GÓI CỦA TÔI (Driver)
**Endpoint:** `GET /api/driver-subscription/my-subscriptions`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ DRIVER** | role phải = `DRIVER` |
| 2 | **Lấy tất cả gói** | Trả về tất cả subscription (ACTIVE, EXPIRED, CANCELLED) |
| 3 | **Populate names** | Tự động fill driverName và packageName |

---

### 3.3. XÓA GÓI (Admin)
**Endpoint:** `DELETE /api/driver-subscription/{id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ ADMIN** | role phải = `ADMIN` |
| 2 | **Soft delete** | Chuyển status = `CANCELLED` (không xóa khỏi database) |
| 3 | **Gửi email cho Driver** | Thông báo gói bị hủy kèm lý do |

---

## 4. ĐẶT CHỖ ĐỔI PIN (BOOKING)

### 4.1. TẠO BOOKING (Driver)
**Endpoint:** `POST /api/booking`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Bắt buộc có gói ACTIVE** | Phải có subscription ACTIVE mới được booking |
| 2 | **Kiểm tra còn lượt đổi** | remainingSwaps > 0 |
| 3 | **Tối đa 10 booking/ngày** | 1 driver chỉ được tạo tối đa 10 booking trong 1 ngày |
| 4 | **Xe phải thuộc driver** | vehicleId phải thuộc sở hữu của driver hiện tại |
| 5 | **Xe phải ACTIVE** | vehicle.status = `ACTIVE` (xe đã được duyệt) |
| 6 | **1 xe chỉ 1 booking active** | Xe không được có booking khác đang ở trạng thái PENDING/CONFIRMED |
| 7 | **Trạm hỗ trợ loại pin** | station.batteryType phải khớp với vehicle.batteryType |
| 8 | **Tự động set thời gian** | bookingTime = 3 giờ sau thời điểm hiện tại |
| 9 | **Tìm pin phù hợp** | Pin phải: AVAILABLE, chargeLevel ≥ 95%, stateOfHealth ≥ 70%, cùng loại với xe |
| 10 | **Ưu tiên pin tốt nhất** | Sort theo: health cao nhất → charge cao nhất |
| 11 | **Đặt trước pin** | Pin: status = `PENDING`, reservedForBooking = booking |
| 12 | **Thời gian hết hạn reservation** | reservationExpiry = bookingTime + 30 phút |
| 13 | **Tự động CONFIRMED** | status = `CONFIRMED` (không cần admin duyệt nữa) |
| 14 | **Tạo confirmationCode** | Mã 6 ký tự random để driver quét tại trạm |
| 15 | **Gửi email xác nhận** | Email chứa confirmationCode, thông tin trạm, thời gian |

**Lỗi có thể xảy ra:**
- `AuthenticationException`: Chưa mua gói, gói hết lượt, xe đã có booking active
- `NotFoundException`: Không có pin đủ điều kiện

**Logic tìm pin:**
```java
List<Battery> batteries = batteryRepository.findByStatus(AVAILABLE)
    .stream()
    .filter(b -> b.getBatteryType().equals(vehicle.getBatteryType()))
    .filter(b -> b.getCurrentStation().equals(station))
    .filter(b -> b.getChargeLevel() >= 95 && b.getStateOfHealth() >= 70)
    .sorted((b1, b2) -> {
        int healthCompare = b2.getStateOfHealth().compareTo(b1.getStateOfHealth());
        if (healthCompare != 0) return healthCompare;
        return b2.getChargeLevel().compareTo(b1.getChargeLevel());
    })
    .toList();

Battery reservedBattery = batteries.get(0); // Lấy pin tốt nhất
```

---

### 4.2. HỦY BOOKING (Driver)
**Endpoint:** `DELETE /api/booking/my-bookings/{id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ booking của mình** | Chỉ được hủy booking thuộc về driver hiện tại |
| 2 | **Không hủy COMPLETED** | Booking đã hoàn thành không được hủy |
| 3 | **Không hủy CANCELLED** | Booking đã hủy rồi không hủy lại |
| 4 | **Chỉ hủy trước 1 tiếng** | Chỉ được hủy nếu còn ≥ 60 phút trước bookingTime |
| 5 | **Giải phóng pin** | Nếu booking CONFIRMED và có reservedBattery → chuyển pin về AVAILABLE, xóa reservation |
| 6 | **Chuyển CANCELLED** | status = `CANCELLED`, cancellationReason = lý do |
| 7 | **Gửi email thông báo** | Email thông báo booking đã hủy |

**Lỗi có thể xảy ra:**
- `AuthenticationException`: Quá gần giờ hẹn (< 60 phút), hoặc booking đã complete/cancel

**Logic kiểm tra thời gian:**
```java
LocalDateTime now = LocalDateTime.now();
long minutesUntilBooking = ChronoUnit.MINUTES.between(now, booking.getBookingTime());

if (minutesUntilBooking < 60) {
    throw new AuthenticationException(
        "Chỉ được hủy booking trước 1 tiếng. " +
        "Thời gian còn lại: " + minutesUntilBooking + " phút"
    );
}
```

---

### 4.3. TỰ ĐỘNG HỦY BOOKING HẾT HẠN (Scheduler)
**Service:** `BookingExpirationScheduler` - Chạy mỗi 5 phút

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Tìm booking quá hạn** | status = CONFIRMED và bookingTime + 30 phút < now |
| 2 | **Chuyển CANCELLED** | status = `CANCELLED`, cancellationReason = "Hết hạn - không đến" |
| 3 | **Giải phóng pin** | Pin về AVAILABLE, xóa reservedForBooking |
| 4 | **TRỪ LƯỢT SWAP** | subscription.remainingSwaps -= 1 (phạt không đến) |
| 5 | **Check subscription hết lượt** | Nếu remainingSwaps = 0 → status = `EXPIRED` |
| 6 | **Gửi email thông báo** | Email thông báo booking hủy và bị trừ lượt |

**Logic trừ lượt:**
```java
if (subscription.getRemainingSwaps() > 0) {
    subscription.setRemainingSwaps(subscription.getRemainingSwaps() - 1);
    
    if (subscription.getRemainingSwaps() == 0) {
        subscription.setStatus(EXPIRED);
    }
}
```

---

## 5. GIAO DỊCH ĐỔI PIN (SWAP TRANSACTION)

### 5.1. XEM PIN CŨ (Trước khi đổi)
**Endpoint:** `GET /api/swap-transaction/old-battery/{confirmationCode}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Validate confirmationCode** | Phải tồn tại booking với mã này |
| 2 | **Booking phải CONFIRMED** | status = `CONFIRMED` |
| 3 | **Chưa được swap** | Chưa có SwapTransaction nào liên kết với booking này |
| 4 | **Lấy pin từ xe** | oldBattery = vehicle.currentBattery |
| 5 | **Trả về thông tin pin cũ** | model, chargeLevel, stateOfHealth |

---

### 5.2. XEM PIN MỚI (Chuẩn bị lắp)
**Endpoint:** `GET /api/swap-transaction/new-battery/{confirmationCode}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Validate confirmationCode** | Booking phải CONFIRMED |
| 2 | **Chưa được swap** | Chưa có SwapTransaction |
| 3 | **Lấy pin đã reserve** | Pin có status = PENDING và reservedForBooking = booking |
| 4 | **Trả về thông tin pin mới** | model, chargeLevel, stateOfHealth |

---

### 5.3. THỰC HIỆN ĐỔI PIN (Driver tự swap bằng confirmationCode)
**Endpoint:** `POST /api/swap-transaction/swap-by-code/{confirmationCode}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Tìm booking** | Tìm booking theo confirmationCode |
| 2 | **Lấy driver từ booking** | Không cần authentication (API public) |
| 3 | **Validate booking status** | - COMPLETED → Đã dùng rồi<br>- CANCELLED → Đã hủy<br>- Chỉ cho phép CONFIRMED |
| 4 | **Kiểm tra chưa swap** | Chưa có SwapTransaction nào cho booking này |
| 5 | **Validate subscription ACTIVE** | Driver phải có gói ACTIVE |
| 6 | **Kiểm tra còn lượt** | remainingSwaps > 0 |
| 7 | **Validate loại pin** | station.batteryType = vehicle.batteryType |
| 8 | **Lấy pin đã reserve** | Pin PENDING + reservedForBooking = booking |
| 9 | **Tạo SwapTransaction** | driver, vehicle, station, staff = NULL (vì tự động) |
| 10 | **Lưu snapshot pin** | Lưu thông tin pin cũ & mới tại thời điểm swap |
| 11 | **Set COMPLETED ngay** | status = `COMPLETED`, cost = 0 (đã trả qua subscription) |
| 12 | **Hoàn tất giao dịch** | Gọi `handleTransactionCompletion()` |

**handleTransactionCompletion() - Logic xử lý sau swap:**

| STT | Bước | Chi tiết |
|-----|------|----------|
| 1 | **Xử lý pin cũ** | Pin cũ từ xe → status = `AVAILABLE`, currentStation = station, xóa reservedForBooking |
| 2 | **Xử lý pin mới** | Pin mới → status = `IN_USE`, lắp lên xe (vehicle.currentBattery), xóa reservedForBooking |
| 3 | **Trừ lượt swap** | subscription.remainingSwaps -= 1 |
| 4 | **Cập nhật booking** | status = `COMPLETED`, xóa confirmationCode (để tái sử dụng) |
| 5 | **Kiểm tra subscription hết lượt** | Nếu remainingSwaps = 0 → subscription.status = `EXPIRED` |
| 6 | **Gửi email thành công** | Email chứa thông tin pin cũ/mới, lượt còn lại |

**Lỗi có thể xảy ra:**
- `NotFoundException`: Không tìm thấy booking/pin
- `AuthenticationException`: 
  - Mã đã sử dụng
  - Booking đã hủy/chưa confirm
  - Chưa có gói ACTIVE
  - Hết lượt swap
  - Loại pin không khớp

---

## 6. QUẢN LÝ PIN

### 6.1. TRẠNG THÁI PIN (Battery Status)

| Status | Mô tả | Vị trí |
|--------|-------|--------|
| `AVAILABLE` | Pin sẵn sàng tại trạm, có thể đặt trước | Tại trạm (currentStation ≠ NULL) |
| `IN_USE` | Pin đang được lắp trên xe | Trên xe (vehicle.currentBattery) |
| `PENDING` | Pin đã được đặt trước cho booking | Tại trạm (reservedForBooking ≠ NULL) |
| `MAINTENANCE` | Pin đang bảo trì, không khả dụng | Kho hoặc trạm |
| `RETIRED` | Pin đã hết tuổi thọ, ngừng sử dụng | Kho |

---

### 6.2. LOGIC XỬ LÝ PIN KHI ĐỔI

**Pin CŨ (từ xe):**
```java
oldBattery.setStatus(AVAILABLE);
oldBattery.setCurrentStation(station); // Về trạm
oldBattery.setReservedForBooking(null);
vehicle.setCurrentBattery(null); // Gỡ khỏi xe
```

**Pin MỚI (lắp lên xe):**
```java
newBattery.setStatus(IN_USE);
newBattery.setCurrentStation(null); // Rời trạm
newBattery.setReservedForBooking(null);
vehicle.setCurrentBattery(newBattery); // Lắp lên xe
```

---

### 6.3. ĐIỀU KIỆN PIN HỢP LỆ ĐỂ BOOKING

| Điều kiện | Giá trị |
|-----------|---------|
| Status | `AVAILABLE` |
| ChargeLevel | ≥ 95% |
| StateOfHealth | ≥ 70% |
| BatteryType | Khớp với vehicle.batteryType |
| CurrentStation | = station trong booking |
| ReservedForBooking | NULL (chưa ai đặt) |

---

## 7. NÂNG CẤP & GIA HẠN GÓI

### 7.1. NÂNG CẤP GÓI (Upgrade - Mô hình Telco)
**Endpoint:** `POST /api/driver-subscription/calculate-upgrade?newPackageId={id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ DRIVER** | role = `DRIVER` |
| 2 | **Phải có gói ACTIVE** | Tìm subscription ACTIVE hiện tại |
| 3 | **Gói mới phải cao hơn** | newPackage.price > currentPackage.price HOẶC newPackage.maxSwaps > currentPackage.maxSwaps |
| 4 | **HỦY gói cũ hoàn toàn** | oldSubscription.status = `EXPIRED`, mất hết lượt còn lại |
| 5 | **KÍCH HOẠT gói mới FULL** | newSubscription.remainingSwaps = newPackage.maxSwaps (100%) |
| 6 | **THANH TOÁN FULL giá** | paymentRequired = newPackage.price |
| 7 | **KHÔNG hoàn tiền** | refundValue = 0 |
| 8 | **KHÔNG bonus** | Chỉ nhận đúng maxSwaps của gói mới |

**Logic thanh toán (Mô hình Telco - Đơn giản nhất):**
```java
// HỦY gói cũ
oldSub.setStatus(EXPIRED);
oldSub.setEndDate(LocalDate.now());

// Tạo gói mới FULL 100%
newSub.setRemainingSwaps(newPackage.getMaxSwaps());
newSub.setStatus(ACTIVE);
newSub.setStartDate(LocalDate.now());
newSub.setEndDate(LocalDate.now().plusDays(newPackage.getDuration()));

// THANH TOÁN = GIÁ FULL GÓI MỚI
paymentRequired = newPackage.getPrice();
```

---

### 7.2. GIA HẠN GÓI (Renewal - Chỉ cùng gói)
**Endpoint:** `POST /api/driver-subscription/calculate-renewal?renewalPackageId={id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ DRIVER** | role = `DRIVER` |
| 2 | **Lấy gói gần nhất** | Lấy subscription có ID lớn nhất (gói được tạo sau cùng) |
| 3 | **Gói không bị CANCELLED** | Nếu gói gần nhất đã CANCELLED → không cho gia hạn |
| 4 | **Chỉ gia hạn CÙNG GÓI** | renewalPackageId phải = currentPackage.id |
| 5 | **CASE 1: Gia hạn sớm** | Gói chưa hết hạn (endDate ≥ today) |
| 6 | **- Stack lượt swap** | totalSwaps = remainingSwaps + renewalPackage.maxSwaps |
| 7 | **- Stack thời gian** | newEndDate = currentEndDate + renewalPackage.duration |
| 8 | **- Giảm giá 5%** | earlyDiscount = 5% (khuyến khích renew sớm) |
| 9 | **CASE 2: Gia hạn trễ** | Gói đã hết hạn (endDate < today) |
| 10 | **- Reset lượt swap** | totalSwaps = renewalPackage.maxSwaps (mất lượt cũ) |
| 11 | **- Reset thời gian** | newEndDate = today + renewalPackage.duration |
| 12 | **- Không giảm giá** | earlyDiscount = 0 |

**Logic gia hạn sớm:**
```java
if (!isExpired) {
    // Gia hạn SỚM
    totalSwaps = remainingSwaps + renewalPackage.getMaxSwaps();
    newEndDate = currentSub.getEndDate().plusDays(renewalPackage.getDuration());
    earlyDiscount = originalPrice * 0.05; // Giảm 5%
    finalPrice = originalPrice - earlyDiscount;
} else {
    // Gia hạn TRỄ
    totalSwaps = renewalPackage.getMaxSwaps();
    newEndDate = today.plusDays(renewalPackage.getDuration());
    finalPrice = originalPrice; // Không giảm
}
```

**Xử lý sau thanh toán:**
```java
// Đánh dấu gói cũ hết hạn
oldSub.setStatus(EXPIRED);

// Tạo gói mới
newSub.setRemainingSwaps(totalSwaps); // Có cộng dồn nếu renew sớm
newSub.setStartDate(LocalDate.now());
newSub.setEndDate(newEndDate);
newSub.setStatus(ACTIVE);
```

---

## 8. EMAIL & THÔNG BÁO

### 8.1. DANH SÁCH EMAIL TỰ ĐỘNG

| Sự kiện | Template | Người nhận | Nội dung |
|---------|----------|------------|----------|
| Đăng ký xe mới | `vehicle-request-admin.html` | Tất cả Admin | Thông báo có xe mới chờ duyệt |
| Xe được duyệt | `vehicle-approved-driver.html` | Driver | Xe đã ACTIVE, sẵn sàng booking |
| Xe bị từ chối | `vehicle-rejected-driver.html` | Driver | Lý do từ chối xe |
| Tạo booking | `booking-confirmation.html` | Driver | Mã xác nhận, thông tin trạm, thời gian |
| Booking được confirm | `booking-confirmed.html` | Driver | Pin đã được đặt trước |
| Hủy booking | `booking-cancellation.html` | Driver | Lý do hủy, có trả lại lượt không |
| Booking hết hạn | `booking-out-of-stock.html` | Driver | Không đến đúng giờ, bị trừ lượt |
| Swap thành công | `swap-success-email.html` | Driver | Thông tin pin cũ/mới, lượt còn lại |
| Gói bị xóa bởi Admin | `subscription-deleted-email.html` | Driver | Lý do hủy gói |
| Ticket được tạo | `ticket-created-staff.html` | Staff hoặc Admin | Thông báo ticket mới (nếu không có staff → gửi admin) |
| Staff trả lời ticket | `ticket-response-driver.html` | Driver | Câu trả lời từ staff |

---

### 8.2. ĐIỀU KIỆN GỬI EMAIL

**Nguyên tắc:**
- Tất cả email đều sử dụng try-catch để tránh ảnh hưởng luồng chính
- Nếu gửi email thất bại, chỉ log error, không throw exception
- Email template sử dụng Thymeleaf

**Ví dụ:**
```java
try {
    emailService.sendBookingConfirmation(booking);
} catch (Exception e) {
    log.error("Failed to send email: {}", e.getMessage());
    // KHÔNG throw exception
}
```

---

## 9. QUẢN LÝ TRẠM (STATION)

### 9.1. TẠO TRẠM (Admin/Staff)
**Endpoint:** `POST /api/station`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin/Staff** | role = `ADMIN` hoặc `STAFF` |
| 2 | **Tên trạm duy nhất** | Không được trùng tên với trạm khác |
| 3 | **Battery type hợp lệ** | batteryTypeId phải tồn tại |
| 4 | **Thông tin bắt buộc** | name, location, capacity, batteryType |
| 5 | **Thông tin vị trí** | city, district, latitude, longitude (optional nhưng nên có) |
| 6 | **Trạng thái mặc định** | status = `ACTIVE` |

---

### 9.2. XEM TRẠM (Public)
**Endpoint:** `GET /api/station`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Hoàn toàn public** | Không cần đăng nhập, ai cũng xem được |
| 2 | **Xem tất cả trạm** | Kể cả ACTIVE, MAINTENANCE, INACTIVE |
| 3 | **Lọc theo loại pin** | GET /api/station/by-battery-type/{batteryTypeId} |

---

### 9.3. CẬP NHẬT TRẠM (Admin/Staff)
**Endpoint:** `PUT /api/station/{id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin/Staff** | role = `ADMIN` hoặc `STAFF` |
| 2 | **Field optional** | Chỉ update field có giá trị mới (không null/empty) |
| 3 | **Tên không trùng** | Nếu đổi tên, kiểm tra không trùng với trạm khác |
| 4 | **Có thể đổi loại pin** | Cập nhật batteryTypeId nếu cần |

---

### 9.4. XÓA TRẠM (Soft Delete - Admin)
**Endpoint:** `DELETE /api/station/{id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin** | role = `ADMIN` |
| 2 | **Soft delete** | status = `INACTIVE` |
| 3 | **Không xóa nếu còn pin** | Kiểm tra không có pin AVAILABLE tại trạm |
| 4 | **Không xóa nếu có booking** | Kiểm tra không có booking CONFIRMED |

---

## 10. PHÂN CÔNG NHÂN VIÊN (STAFF ASSIGNMENT)

### 10.1. GÁN NHÂN VIÊN VÀO TRẠM (Admin)
**Endpoint:** `POST /api/staff-station-assignment`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin** | role = `ADMIN` |
| 2 | **Phải là STAFF** | User được gán phải có role = `STAFF` |
| 3 | **Không trùng lặp** | Nhân viên chưa được gán vào trạm này |
| 4 | **Tối đa 5 trạm/staff** | 1 nhân viên chỉ quản lý tối đa 5 trạm |
| 5 | **Tối đa 3 staff/trạm** | 1 trạm chỉ có tối đa 3 nhân viên |
| 6 | **Tự động populate** | staffName và stationName được tự động fill |

**Lỗi có thể xảy ra:**
- `IllegalArgumentException`: User không phải STAFF
- `IllegalStateException`: Staff đã đủ 5 trạm, hoặc trạm đã đủ 3 staff
- `IllegalStateException`: Staff đã được gán vào trạm này rồi

---

### 10.2. THU HỒI NHÂN VIÊN KHỎI TRẠM (Admin)
**Endpoint:** `DELETE /api/staff-station-assignment?staffId={id}&stationId={id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin** | role = `ADMIN` |
| 2 | **Kiểm tra assignment tồn tại** | Phải có bản ghi assignment |
| 3 | **Hard delete** | Xóa hoàn toàn khỏi database |

---

### 10.3. XEM TRẠM CỦA TÔI (Staff)
**Endpoint:** `GET /api/staff-station-assignment/my-stations`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Staff** | role = `STAFF` |
| 2 | **Xem trạm được gán** | Danh sách trạm mà staff hiện tại quản lý |

---

### 10.4. VALIDATE QUYỀN TRUY CẬP TRẠM
**Internal method:** `validateStationAccess(stationId)`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Admin toàn quyền** | Admin có quyền truy cập tất cả trạm |
| 2 | **Staff chỉ trạm được gán** | Staff chỉ truy cập trạm mình quản lý |
| 3 | **Driver không truy cập** | Driver không có quyền quản lý trạm |

---

## 11. HỖ TRỢ KHÁCH HÀNG (SUPPORT TICKET)

### 11.1. TẠO TICKET (Driver)
**Endpoint:** `POST /api/support-ticket`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Driver** | role = `DRIVER` |
| 2 | **Tối đa 3 ticket OPEN** | 1 driver chỉ được có tối đa 3 ticket đang mở |
| 3 | **Thông tin bắt buộc** | subject, description |
| 4 | **Station optional** | Có thể gắn ticket với trạm cụ thể |
| 5 | **Trạng thái mặc định** | status = `OPEN` |
| 6 | **Tự động gửi email** | Gửi cho staff của trạm (nếu có stationId), nếu không → gửi admin |

**Logic gửi email:**
```java
if (stationId != null) {
    // Tìm staff của trạm
    List<User> stationStaff = findStaffByStation(stationId);
    if (!stationStaff.isEmpty()) {
        sendToStaff(stationStaff);
    } else {
        sendToAdmin(); // Fallback nếu không có staff
    }
} else {
    // Không có station → gửi tất cả admin
    sendToAdmin();
}
```

---

### 11.2. TRẢ LỜI TICKET (Staff/Admin)
**Endpoint:** `POST /api/ticket-response`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Staff/Admin** | role = `STAFF` hoặc `ADMIN` |
| 2 | **Ticket phải OPEN** | Chỉ trả lời ticket đang mở |
| 3 | **Gửi email cho Driver** | Email chứa câu trả lời từ staff |
| 4 | **Ghi nhận staff** | ticketResponse.staff = currentUser |

---

### 11.3. ĐÓNG TICKET (Staff/Admin)
**Endpoint:** `PUT /api/support-ticket/{id}/close`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Staff/Admin** | role = `STAFF` hoặc `ADMIN` |
| 2 | **Chuyển RESOLVED** | status = `RESOLVED` |
| 3 | **Ghi nhận thời gian** | resolvedAt = now() |

---

### 11.4. XEM TICKET CỦA TÔI (Driver)
**Endpoint:** `GET /api/support-ticket/my-tickets`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Driver** | role = `DRIVER` |
| 2 | **Xem ticket của mình** | Tất cả ticket (OPEN, RESOLVED) |

---

### 11.5. XEM TẤT CẢ TICKET (Staff/Admin)
**Endpoint:** `GET /api/support-ticket`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Staff/Admin** | role = `STAFF` hoặc `ADMIN` |
| 2 | **Staff chỉ xem ticket trạm mình** | Nếu là Staff, chỉ xem ticket của trạm được gán |
| 3 | **Admin xem tất cả** | Admin xem tất cả ticket |

---

## 12. QUẢN LÝ PIN (BATTERY)

### 12.1. TẠO PIN (Admin/Staff)
**Endpoint:** `POST /api/battery`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin/Staff** | role = `ADMIN` hoặc `STAFF` |
| 2 | **Serial number duy nhất** | serialNumber không được trùng |
| 3 | **Battery type hợp lệ** | batteryTypeId phải tồn tại |
| 4 | **Thông tin bắt buộc** | serialNumber, model, batteryType |
| 5 | **Trạng thái mặc định** | status = `AVAILABLE` (nếu không chỉ định) |
| 6 | **Charge & Health** | chargeLevel (0-100%), stateOfHealth (0-100%) |
| 7 | **Current station** | Có thể gán pin vào trạm ngay khi tạo |

---

### 12.2. CẬP NHẬT PIN (Admin/Staff)
**Endpoint:** `PUT /api/battery/{id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin/Staff** | role = `ADMIN` hoặc `STAFF` |
| 2 | **Field optional** | Chỉ update field có giá trị mới |
| 3 | **Không đổi serial nếu IN_USE** | Pin đang lắp trên xe không đổi serial |
| 4 | **Cập nhật charge/health** | Có thể update chargeLevel, stateOfHealth |
| 5 | **Đổi trạng thái** | Có thể chuyển AVAILABLE ↔ MAINTENANCE ↔ RETIRED |

---

### 12.3. XÓA PIN (Soft Delete - Admin)
**Endpoint:** `DELETE /api/battery/{id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin** | role = `ADMIN` |
| 2 | **Không xóa pin IN_USE** | Pin đang lắp trên xe không được xóa |
| 3 | **Không xóa pin PENDING** | Pin đã đặt trước không được xóa |
| 4 | **Chuyển RETIRED** | status = `RETIRED` |

---

### 12.4. XEM PIN THEO TRẠM
**Endpoint:** `GET /api/battery/by-station/{stationId}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Public** | Không cần đăng nhập |
| 2 | **Lọc theo trạm** | Chỉ pin có currentStation = stationId |
| 3 | **Hiển thị tất cả status** | AVAILABLE, PENDING, MAINTENANCE (không hiển thị IN_USE) |

---

## 13. THANH TOÁN MOMO

### 13.1. TẠO THANH TOÁN
**Endpoint:** `POST /api/payment/create`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Driver** | role = `DRIVER` |
| 2 | **Loại thanh toán** | `NEW_SUBSCRIPTION`, `UPGRADE_SUBSCRIPTION`, `RENEW_SUBSCRIPTION` |
| 3 | **Tạo orderId unique** | orderId = driverId + timestamp + random |
| 4 | **Gọi MoMo API** | Tạo payment request đến MoMo |
| 5 | **Lưu Payment** | status = `PENDING`, lưu orderId, amount |
| 6 | **Trả về payUrl** | URL redirect đến MoMo payment gateway |

---

### 13.2. XỬ LÝ CALLBACK TỪ MOMO
**Endpoint:** `POST /api/payment/momo-ipn` (Internal - MoMo gọi)

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Verify signature** | Kiểm tra chữ ký từ MoMo |
| 2 | **Tìm payment** | Tìm payment theo orderId |
| 3 | **Kiểm tra trạng thái** | Nếu payment đã SUCCESS → ignore (tránh duplicate) |
| 4 | **Cập nhật payment** | status = `SUCCESS` hoặc `FAILED` |
| 5 | **Xử lý theo loại** | - NEW_SUBSCRIPTION → tạo subscription<br>- UPGRADE → upgrade subscription<br>- RENEW → renew subscription |
| 6 | **Ghi log** | Log đầy đủ callback từ MoMo |

**Logic xử lý:**
```java
if (resultCode == 0) { // Thành công
    payment.setStatus(SUCCESS);
    
    switch(paymentType) {
        case NEW_SUBSCRIPTION:
            subscriptionService.createSubscriptionAfterPayment(packageId, driverId);
            break;
        case UPGRADE_SUBSCRIPTION:
            subscriptionService.upgradeSubscriptionAfterPayment(packageId, driverId);
            break;
        case RENEW_SUBSCRIPTION:
            subscriptionService.renewSubscriptionAfterPayment(packageId, driverId);
            break;
    }
} else {
    payment.setStatus(FAILED);
}
```

---

### 13.3. XEM LỊCH SỬ THANH TOÁN

**Driver:** `GET /api/payment/my-payments` - Xem payment của mình
**Admin/Staff:** `GET /api/payment` - Xem tất cả payment

---

## 14. QUẢN LÝ GÓI DỊCH VỤ (SERVICE PACKAGE)

### 14.1. TẠO GÓI (Admin)
**Endpoint:** `POST /api/service-package`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin** | role = `ADMIN` |
| 2 | **Tối đa 12 gói** | Hệ thống chỉ cho phép tối đa 12 gói |
| 3 | **Tên duy nhất** | Tên gói không được trùng |
| 4 | **Thông tin bắt buộc** | name, description, price, duration, maxSwaps |
| 5 | **Validate số liệu** | price > 0, duration > 0, maxSwaps > 0 |

---

### 14.2. CẬP NHẬT GÓI (Admin)
**Endpoint:** `PUT /api/service-package/{id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin** | role = `ADMIN` |
| 2 | **Field optional** | Chỉ update field có giá trị mới |
| 3 | **Tên không trùng** | Nếu đổi tên, kiểm tra không trùng |

---

### 14.3. XÓA GÓI (Admin)
**Endpoint:** `DELETE /api/service-package/{id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin** | role = `ADMIN` |
| 2 | **Không xóa nếu đang dùng** | Kiểm tra không có subscription ACTIVE sử dụng gói này |
| 3 | **Soft delete** | Đánh dấu không khả dụng thay vì xóa |

---

### 14.4. XEM GÓI (Public)
**Endpoint:** `GET /api/service-package`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Hoàn toàn public** | Không cần đăng nhập |
| 2 | **Xem tất cả gói** | Trả về tất cả gói đang khả dụng |

---

## 15. DASHBOARD & THỐNG KÊ (Admin)

### 15.1. XEM DASHBOARD
**Endpoint:** `GET /api/dashboard`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin** | role = `ADMIN` |
| 2 | **Thống kê User** | Tổng user, driver, staff, admin, active user, user mới (ngày/tuần/tháng) |
| 3 | **Thống kê Booking** | Tổng booking, booking theo status, booking hôm nay/tuần/tháng |
| 4 | **Thống kê Swap** | Tổng swap, swap hôm nay/tuần/tháng, doanh thu |
| 5 | **Thống kê Station** | Tổng trạm, trạm active, trạng thái trạm |
| 6 | **Thống kê Battery** | Tổng pin, pin theo status, pin cần bảo trì |
| 7 | **Thống kê Subscription** | Gói active, gói expired, doanh thu từ gói |
| 8 | **Thống kê Vehicle** | Tổng xe, xe active/pending/inactive |

---

## 16. QUYỀN HẠN THEO VAI TRÒ (ROLE-BASED ACCESS)

### 9.1. DRIVER

| Chức năng | Endpoint | Quyền |
|-----------|----------|-------|
| Đăng ký xe | POST /api/vehicle | ✅ |
| Xem xe của tôi | GET /api/vehicle/my-vehicles | ✅ |
| Cập nhật xe của tôi | PUT /api/vehicle/my-vehicles/{id} | ✅ (chỉ model & batteryType) |
| Phê duyệt/từ chối xe | POST /api/vehicle/{id}/approve | ❌ |
| Xóa xe | DELETE /api/vehicle/{id} | ❌ |
| Tạo booking | POST /api/booking | ✅ |
| Xem booking của tôi | GET /api/booking/my-bookings | ✅ |
| Hủy booking của tôi | DELETE /api/booking/my-bookings/{id} | ✅ |
| Xem tất cả booking | GET /api/booking | ❌ |
| Xem gói của tôi | GET /api/driver-subscription/my-subscriptions | ✅ |
| Tính toán nâng cấp | POST /api/driver-subscription/calculate-upgrade | ✅ |
| Tính toán gia hạn | POST /api/driver-subscription/calculate-renewal | ✅ |
| Xóa gói | DELETE /api/driver-subscription/{id} | ❌ |
| Swap bằng code | POST /api/swap-transaction/swap-by-code/{code} | ✅ (public) |

---

### 9.2. STAFF

| Chức năng | Endpoint | Quyền |
|-----------|----------|-------|
| Xem tất cả xe | GET /api/vehicle | ✅ |
| Phê duyệt xe | POST /api/vehicle/{id}/approve | ✅ |
| Từ chối xe | POST /api/vehicle/{id}/reject | ✅ |
| Xóa xe | DELETE /api/vehicle/{id} | ✅ |
| Cập nhật xe (full) | PUT /api/vehicle/{id} | ✅ |
| Xem tất cả booking | GET /api/booking | ✅ |
| Xem tất cả swap transaction | GET /api/swap-transaction | ✅ |
| Xóa gói | DELETE /api/driver-subscription/{id} | ❌ |
| Quản lý support ticket | * | ✅ |

---

### 9.3. ADMIN

| Chức năng | Endpoint | Quyền |
|-----------|----------|-------|
| Tất cả quyền của STAFF | * | ✅ |
| Xem tất cả subscription | GET /api/driver-subscription | ✅ |
| Xóa subscription | DELETE /api/driver-subscription/{id} | ✅ |
| Quản lý user | CRUD /api/admin/users | ✅ |
| Xem dashboard | GET /api/dashboard | ✅ |
| Quản lý service package | CRUD /api/service-package | ✅ |
| Quản lý station | CRUD /api/station | ✅ |
| Quản lý battery | CRUD /api/battery | ✅ |
| Quản lý battery type | CRUD /api/battery-type | ✅ |

---

## 17. QUẢN LÝ LOẠI PIN (BATTERY TYPE)

### 17.1. TẠO LOẠI PIN (Admin)
**Endpoint:** `POST /api/battery-type`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin** | role = `ADMIN` |
| 2 | **Tên duy nhất** | Tên loại pin không được trùng |
| 3 | **Thông tin bắt buộc** | name, description |
| 4 | **Thông tin kỹ thuật** | voltage (V), capacity (Ah), weight (kg), dimensions (mm) - optional |

---

### 17.2. XEM LOẠI PIN (Public)
**Endpoint:** `GET /api/battery-type`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Hoàn toàn public** | Không cần đăng nhập |
| 2 | **Xem tất cả loại** | Trả về tất cả battery type |

---

### 17.3. CẬP NHẬT LOẠI PIN (Admin)
**Endpoint:** `PUT /api/battery-type/{id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin** | role = `ADMIN` |
| 2 | **Field optional** | Chỉ update field có giá trị mới |
| 3 | **Tên không trùng** | Nếu đổi tên, kiểm tra không trùng |

---

### 17.4. XÓA LOẠI PIN (Admin)
**Endpoint:** `DELETE /api/battery-type/{id}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin** | role = `ADMIN` |
| 2 | **Không xóa nếu đang dùng** | Kiểm tra không có pin hoặc trạm sử dụng loại này |
| 3 | **Hard delete** | Xóa hoàn toàn khỏi database (nếu không còn ràng buộc) |

---

## 18. QUẢN LÝ KHO PIN (STATION INVENTORY)

### 18.1. XEM TẤT CẢ PIN TRONG KHO
**Endpoint:** `GET /api/station-inventory/warehouse`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin/Staff** | role = `ADMIN` hoặc `STAFF` |
| 2 | **Pin trong kho** | Pin có `currentStation = NULL` và có record trong `StationInventory` |
| 3 | **Chi tiết đầy đủ** | ID, serialNumber, model, batteryType, charge, health, status, lastUpdate |
| 4 | **Thống kê tổng** | Tổng số pin trong kho |

---

### 18.2. XEM PIN CẦN BẢO TRÌ TRONG KHO
**Endpoint:** `GET /api/station-inventory/warehouse/maintenance-needed`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin/Staff** | role = `ADMIN` hoặc `STAFF` |
| 2 | **Điều kiện cần bảo trì** | - stateOfHealth < 70%<br>- status = MAINTENANCE<br>- currentStation = NULL (trong kho) |
| 3 | **Sắp xếp** | Ưu tiên pin có health thấp nhất |

---

### 18.3. XEM PIN KHẢ DỤNG THEO LOẠI
**Endpoint:** `GET /api/station-inventory/warehouse/available-by-type/{batteryTypeId}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin/Staff** | role = `ADMIN` hoặc `STAFF` |
| 2 | **Điều kiện** | - batteryType = batteryTypeId<br>- status = AVAILABLE<br>- currentStation = NULL (trong kho) |
| 3 | **Mục đích** | Tìm pin để gắn lên xe khi approve hoặc chuyển sang trạm |

---

### 18.4. CHUYỂN PIN TỪ KHO SANG TRẠM
**Endpoint:** `POST /api/station-inventory/move-to-station`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin/Staff** | role = `ADMIN` hoặc `STAFF` |
| 2 | **Staff chỉ chuyển đến trạm mình** | Staff chỉ chuyển pin đến trạm được gán |
| 3 | **Pin phải trong kho** | currentStation = NULL và có trong StationInventory |
| 4 | **Pin phải AVAILABLE** | status = `AVAILABLE` |
| 5 | **Loại pin khớp với trạm** | batteryType của pin = batteryType của station |
| 6 | **Cập nhật vị trí** | - battery.currentStation = station<br>- Xóa record trong StationInventory (pin rời kho) |

**Logic:**
```java
// Validate
if (battery.getCurrentStation() != null) {
    throw new Exception("Pin không ở trong kho");
}
if (battery.getStatus() != AVAILABLE) {
    throw new Exception("Pin không AVAILABLE");
}
if (!battery.getBatteryType().equals(station.getBatteryType())) {
    throw new Exception("Loại pin không khớp với trạm");
}

// Chuyển pin
battery.setCurrentStation(station);
stationInventoryRepository.deleteByBattery(battery); // Xóa khỏi kho
```

---

### 18.5. CHUYỂN PIN TỪ TRẠM VỀ KHO
**Endpoint:** `POST /api/station-inventory/move-to-warehouse`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin/Staff** | role = `ADMIN` hoặc `STAFF` |
| 2 | **Staff chỉ chuyển từ trạm mình** | Staff chỉ chuyển pin từ trạm được gán |
| 3 | **Pin phải ở trạm** | currentStation ≠ NULL |
| 4 | **Pin không được IN_USE** | status ≠ `IN_USE` (không lấy pin đang lắp trên xe) |
| 5 | **Pin không được PENDING** | status ≠ `PENDING` (không lấy pin đã đặt trước) |
| 6 | **Cập nhật vị trí** | - battery.currentStation = NULL<br>- Tạo record mới trong StationInventory |

**Logic:**
```java
// Validate
if (battery.getCurrentStation() == null) {
    throw new Exception("Pin đã ở trong kho");
}
if (battery.getStatus() == IN_USE) {
    throw new Exception("Không thể lấy pin đang lắp trên xe");
}
if (battery.getStatus() == PENDING) {
    throw new Exception("Không thể lấy pin đã đặt trước");
}

// Chuyển về kho
battery.setCurrentStation(null);

// Tạo record trong StationInventory
StationInventory inventory = new StationInventory();
inventory.setBattery(battery);
inventory.setStatus(battery.getStatus());
inventory.setLastUpdate(LocalDateTime.now());
stationInventoryRepository.save(inventory);
```

---

### 18.6. XEM PIN TẠI TRẠM CỤ THỂ
**Endpoint:** `GET /api/station-inventory/station/{stationId}`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Public** | Không cần đăng nhập (để driver xem) |
| 2 | **Lọc theo trạm** | Pin có currentStation = stationId |
| 3 | **Hiển thị status** | AVAILABLE (có thể booking), PENDING (đã đặt trước), MAINTENANCE |
| 4 | **Không hiển thị IN_USE** | Pin đang lắp trên xe không hiển thị |

---

### 18.7. THỐNG KÊ KHO
**Endpoint:** `GET /api/station-inventory/warehouse/statistics`

**Quy tắc nghiệp vụ:**

| STT | Quy tắc | Chi tiết |
|-----|---------|----------|
| 1 | **Chỉ Admin** | role = `ADMIN` |
| 2 | **Thống kê tổng quan** | - Tổng pin trong kho<br>- Pin AVAILABLE<br>- Pin MAINTENANCE<br>- Pin cần bảo trì (health < 70%)<br>- Pin sắp hết tuổi thọ (health < 50%) |
| 3 | **Thống kê theo loại pin** | Số lượng từng loại pin trong kho |

---

## 19. CÁC QUY TẮC QUAN TRỌNG (CRITICAL RULES)

### 19.1. KHÔNG BAO GIỜ ĐƯỢC PHÉP

| ❌ KHÔNG | Lý do |
|---------|-------|
| Xóa hard data | Luôn dùng soft delete (đổi status) |
| Cho driver mua gói khi còn lượt | Tránh lãng phí tiền |
| Cho 1 xe có >1 booking active | Tránh conflict |
| Cho booking khi xe chưa ACTIVE | Xe chưa được duyệt |
| Cho swap khi booking chưa CONFIRMED | Chưa có pin đặt trước |
| Dùng pin không đủ charge/health | Ảnh hưởng trải nghiệm |
| Gắn pin từ trạm lên xe khi approve | Chỉ được dùng pin từ KHO (currentStation = NULL) |
| Cho nâng cấp/gia hạn gói khác | Renew chỉ cho phép cùng gói |

---

### 19.2. LUÔN LUÔN PHẢI

| ✅ PHẢI | Lý do |
|---------|-------|
| Validate role trước mọi action | Bảo mật |
| Kiểm tra ownership (xe/booking của mình) | Phân quyền |
| Send email trong try-catch | Tránh crash app |
| Log mọi transaction quan trọng | Audit trail |
| Validate pin type trước khi swap | Tránh lắp nhầm |
| Trừ lượt swap khi no-show | Phạt không đến đúng hẹn |
| Xóa confirmationCode sau swap | Tránh tái sử dụng mã |
| Set pin về MAINTENANCE khi xe bị xóa | Cần kiểm tra trước khi dùng lại |
| Stack swaps khi renew sớm | Khuyến khích gia hạn sớm |
| Expire gói khi remainingSwaps = 0 | Tự động hết hạn |

---

## 20. THAM KHẢO NHANH (CHEAT SHEET)

### 20.1. STATUS FLOW

**Vehicle:**
```
PENDING (đăng ký) → ACTIVE (duyệt) ✅
PENDING (đăng ký) → INACTIVE (từ chối) ❌
ACTIVE → INACTIVE (xóa) ❌
```

**Booking:**
```
CONFIRMED (tạo) → COMPLETED (swap thành công) ✅
CONFIRMED → CANCELLED (driver hủy hoặc hết hạn) ❌
```

**Battery:**
```
AVAILABLE → PENDING (được đặt trước)
PENDING → IN_USE (lắp lên xe)
IN_USE → AVAILABLE (đổi pin, về trạm)
AVAILABLE → MAINTENANCE (xe bị xóa)
```

**DriverSubscription:**
```
ACTIVE (mua mới) → EXPIRED (hết hạn/hết lượt)
ACTIVE → CANCELLED (admin xóa)
EXPIRED → ACTIVE (mua gói mới/gia hạn)
```

---

### 20.2. VALIDATION CHECKLIST

**Trước khi BOOKING:**
- [ ] Có subscription ACTIVE?
- [ ] Còn lượt swap?
- [ ] Xe thuộc sở hữu driver?
- [ ] Xe đã ACTIVE?
- [ ] Xe chưa có booking active khác?
- [ ] Trạm hỗ trợ loại pin?
- [ ] Có pin đủ điều kiện?
- [ ] Chưa đạt limit 10 booking/ngày?

**Trước khi SWAP:**
- [ ] Booking CONFIRMED?
- [ ] Chưa có transaction nào?
- [ ] Có subscription ACTIVE?
- [ ] Còn lượt swap?
- [ ] Loại pin khớp?
- [ ] Có pin đã đặt trước?

**Trước khi APPROVE xe:**
- [ ] Xe PENDING?
- [ ] Driver chưa quá 2 xe ACTIVE?
- [ ] Pin từ KHO (currentStation = NULL)?
- [ ] Pin AVAILABLE?
- [ ] Pin trong StationInventory?
- [ ] Loại pin khớp?

---

## 21. CONTACT & SUPPORT

Nếu có thắc mắc về business rules, vui lòng liên hệ:
- **Backend Team Lead:** [Email/Slack]
- **Business Analyst:** [Email/Slack]
- **Documentation:** Xem thêm tại `README.md` và các file trong `docs/`

---

**Cập nhật lần cuối:** 12/11/2025
**Phiên bản:** 1.0
**Trạng thái:** Đầy đủ & Chi tiết
