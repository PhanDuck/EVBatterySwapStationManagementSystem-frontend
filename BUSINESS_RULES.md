# TỔNG QUAN BUSINESS RULES - HỆ THỐNG QUẢN LÝ TRẠM ĐỔI PIN XE ĐIỆN
## (Dành cho Frontend Developer & Product Owner)

---

## 📚 MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Authentication & User Management](#2-authentication--user-management)
3. [Vehicle Management](#3-vehicle-management)
4. [Service Package & Subscription](#4-service-package--subscription)
5. [Booking System](#5-booking-system)
6. [Swap Transaction](#6-swap-transaction)
7. [Battery Management](#7-battery-management)
8. [Station & Staff Management](#8-station--staff-management)
9. [Payment System](#9-payment-system)
10. [Support Ticket](#10-support-ticket)
11. [Notification System](#11-notification-system)
12. [Validation Rules Summary](#12-validation-rules-summary)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Concept

Hệ thống quản lý mạng lưới trạm đổi pin cho xe điện, cho phép:
- **Driver (Tài xế)**: Đăng ký xe, mua gói dịch vụ, đặt lịch và tự đổi pin
- **Staff (Nhân viên)**: Quản lý trạm, pin, hỗ trợ khách hàng
- **Admin (Quản trị)**: Quản lý toàn bộ hệ thống

### 1.2. Core Features

```
🚗 Vehicle Registration → 📦 Buy Service Package → 📅 Book Swap → 🔋 Self-Service Swap
```

### 1.3. User Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **DRIVER** | Tài xế sử dụng dịch vụ | Đăng ký xe, mua gói, booking, swap |
| **STAFF** | Nhân viên trạm | Quản lý pin, booking, tickets của trạm |
| **ADMIN** | Quản trị viên | Full access, duyệt xe, quản lý hệ thống |

---

## 2. AUTHENTICATION & USER MANAGEMENT

### 2.1. Registration

**Rules:**
- ✅ Email phải unique
- ✅ Username phải unique
- ✅ Password tối thiểu 6 ký tự (recommend: 8+)
- ✅ Role mặc định: `DRIVER`
- ✅ Yêu cầu Google reCAPTCHA v2 verification

**Required Fields:**
```json
{
  "email": "driver@example.com",
  "username": "driver123",
  "password": "SecurePass123",
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0901234567",
  "recaptchaToken": "03AGdBq2..."
}
```

### 2.2. Login

**Process:**
1. User nhập email + password
2. Backend verify credentials
3. Trả về JWT access token (valid 7 days)
4. Frontend lưu token và gửi kèm mỗi request

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 5,
    "email": "driver@example.com",
    "role": "DRIVER",
    "fullName": "Nguyễn Văn A"
  }
}
```

### 2.3. JWT Token

**Characteristics:**
- **Validity**: 7 days (604,800,000 ms)
- **Algorithm**: HMAC-SHA256
- **Payload**: Contains userId
- **Usage**: Header `Authorization: Bearer <token>`

**Token Expiry Handling:**
- Frontend phải check token expired
- Nếu expired → Redirect to login
- Recommend: Refresh token trước 1 ngày hết hạn

### 2.4. Password Reset

**Flow:**
1. User request reset password với email
2. Backend gửi email có reset token (valid 15 minutes)
3. User click link, nhập password mới
4. Token verified và password được cập nhật

**Important:**
- ⏰ Reset token chỉ valid 15 phút
- 🔒 Token chỉ dùng được 1 lần
- ❌ Token cũ invalid sau khi đổi password

---

## 3. VEHICLE MANAGEMENT

### 3.1. Vehicle Registration (Driver)

**Business Rules:**

#### Giới hạn số lượng:
- ✅ Tối đa **2 xe ACTIVE** (đang hoạt động)
- ✅ Tối đa **1 xe PENDING** (đang chờ duyệt)
- ❌ Không thể đăng ký xe thứ 3 khi đã có 2 xe ACTIVE
- ❌ Không thể đăng ký xe thứ 2 PENDING khi đã có 1 xe đang chờ

#### Validation:
- VIN: 17 ký tự, unique (chỉ check xe ACTIVE/PENDING)
- Biển số: Unique (chỉ check xe ACTIVE/PENDING)
- Ảnh giấy đăng ký: Required, max 10MB, format JPG/PNG/PDF
- Loại pin: Phải chọn từ danh sách có sẵn

**Required Fields:**
```json
{
  "vin": "1HGBH41JXMN109186",
  "plateNumber": "30A12345",
  "model": "VinFast VF8",
  "batteryTypeId": 1,
  "registrationImageFile": <File>
}
```

**Status Flow:**
```
PENDING (Mới tạo)
    ↓
    ├─→ ACTIVE (Admin duyệt + gắn pin)
    └─→ INACTIVE (Admin từ chối hoặc xóa)
```

**After Registration:**
- Status: `PENDING`
- Email gửi đến tất cả Admin
- Driver chờ duyệt (thường 1-24h)
- Xe PENDING không thể đặt lịch đổi pin

### 3.2. Vehicle Approval (Admin)

**Requirements:**
- ✅ Xe phải ở status `PENDING`
- ✅ Driver chưa có đủ 2 xe ACTIVE
- ✅ Phải chọn pin từ kho để gắn vào xe
- ✅ Pin phải khớp loại với xe

**Pin từ kho:**
- Status: `AVAILABLE`
- Location: Trong kho (không thuộc trạm nào)
- ChargeLevel: >= 80%
- StateOfHealth: >= 70%

**After Approval:**
- Xe: `PENDING` → `ACTIVE`
- Pin: Gắn vào xe, status `IN_USE`
- Email thông báo driver
- Driver có thể bắt đầu đặt lịch

### 3.3. Vehicle Rejection (Admin)

**Rules:**
- ✅ Xe phải ở status `PENDING`
- ✅ Phải ghi lý do từ chối

**After Rejection:**
- Xe: `PENDING` → `INACTIVE`
- Email thông báo driver kèm lý do
- Driver có thể đăng ký lại với thông tin đúng

### 3.4. Vehicle Deletion

**Rules:**
- ✅ Chỉ Admin/Staff mới xóa được
- ❌ KHÔNG xóa được nếu xe có booking đang chờ (CONFIRMED)
- ✅ Pin trên xe sẽ được trả về kho để kiểm tra

**After Deletion:**
- Xe: `ACTIVE/PENDING` → `INACTIVE` (soft delete)
- Pin: Về kho với status `MAINTENANCE`
- Driver có thể đăng ký xe mới

---

## 4. SERVICE PACKAGE & SUBSCRIPTION

### 4.1. Service Package Structure

**Package Example:**
```json
{
  "id": 1,
  "name": "Gói Cơ Bản",
  "duration": 30,        // Số ngày
  "maxSwaps": 20,        // Số lượt đổi pin
  "price": 400000        // VNĐ
}
```

**Common Packages:**
- 🥉 Gói Cơ Bản: 20 lượt / 30 ngày = 400,000đ
- 🥈 Gói Tiêu Chuẩn: 50 lượt / 30 ngày = 800,000đ
- 🥇 Gói VIP: 100 lượt / 30 ngày = 1,400,000đ

### 4.2. Purchase (Mua gói mới)

**When can purchase?**
- ✅ Chưa có gói nào
- ✅ Gói cũ đã HẾT LƯỢT (`remainingSwaps = 0`)
- ❌ KHÔNG được mua khi gói cũ còn lượt (phải dùng hết hoặc nâng cấp)

**After Purchase:**
```
Start Date: Hôm nay
End Date: Hôm nay + duration
Remaining Swaps: maxSwaps (FULL)
Status: ACTIVE
```

**Example:**
- Mua ngày 01/12: startDate = 01/12, endDate = 31/12
- Nhận full 20 lượt
- Có thể dùng từ 01/12 đến 31/12

### 4.3. Upgrade (Nâng cấp gói)

**When can upgrade?**
- ✅ Đang có gói ACTIVE
- ✅ Muốn chuyển sang gói đắt hơn hoặc nhiều lượt hơn

**How it works?**

**Công thức:**
```
Giá trị hoàn lại = (Lượt chưa dùng) × (Giá gói cũ ÷ Tổng lượt gói cũ)
Số tiền cần trả = Giá gói mới - Giá trị hoàn lại
```

**Example:**
```
Gói cũ: Gói Cơ Bản
- 20 lượt = 400,000đ
- Đã dùng: 5 lượt
- Còn lại: 15 lượt

Gói mới: Gói Tiêu Chuẩn
- 50 lượt = 800,000đ

Tính toán:
- Giá 1 lượt gói cũ = 400,000 ÷ 20 = 20,000đ
- Giá trị hoàn lại = 15 × 20,000 = 300,000đ
- Cần trả = 800,000 - 300,000 = 500,000đ
```

**After Upgrade:**
- Gói cũ: HỦY ngay (EXPIRED)
- Gói mới: Kích hoạt với FULL 50 lượt (không cộng 15 lượt cũ)
- Start date: Hôm nay
- End date: Hôm nay + 30 ngày

**UI Recommendation:**
```
Hiển thị cho user:
✓ Gói hiện tại: Gói Cơ Bản (còn 15 lượt)
✓ Gói muốn nâng cấp: Gói Tiêu Chuẩn
✓ Hoàn lại: 300,000đ (15 lượt × 20,000đ/lượt)
✓ Cần thanh toán: 500,000đ
✓ Nhận được: 50 lượt mới, dùng trong 30 ngày
```

### 4.4. Renewal (Gia hạn gói)

**Rules:**
- ✅ CHỈ gia hạn CÙNG GÓI đang dùng
- ❌ Muốn đổi gói khác → Dùng Upgrade

**Early Renewal (Gia hạn sớm - còn hạn):**

**Benefits:**
- 🎁 Cộng dồn lượt chưa dùng
- 🎁 Cộng dồn thời gian
- 🎁 Giảm 5% giá gói

**Example:**
```
Gói hiện tại: Gói Cơ Bản (20 lượt/30 ngày)
- Còn 8 lượt chưa dùng
- Còn 10 ngày chưa hết hạn

Gia hạn sớm:
- Giá gốc: 400,000đ
- Giảm 5%: -20,000đ
- Thanh toán: 380,000đ

Nhận được:
- Lượt swap: 8 (cũ) + 20 (mới) = 28 lượt
- Thời gian: 10 (còn lại) + 30 (mới) = 40 ngày
```

**Late Renewal (Gia hạn trễ - hết hạn):**

**Characteristics:**
- ❌ Mất lượt chưa dùng
- ❌ Không giảm giá
- Reset hoàn toàn

**Example:**
```
Gói đã hết hạn:
- Còn 5 lượt nhưng đã quá ngày hết hạn

Gia hạn trễ:
- Thanh toán: 400,000đ (full giá)
- Nhận được: 20 lượt mới (mất 5 lượt cũ)
- Thời gian: 30 ngày mới
```

**UI Recommendation:**
```
Nếu còn hạn:
✓ "Gia hạn ngay để nhận ưu đãi!"
✓ "Còn X ngày, Y lượt sẽ được giữ lại"
✓ "Giảm 5% khi gia hạn sớm"

Nếu hết hạn:
⚠ "Gói đã hết hạn. Gia hạn sẽ mất lượt chưa dùng"
⚠ "Không có ưu đãi giảm giá"
```

### 4.5. Subscription Status

**Status Types:**
- `ACTIVE` - Đang hoạt động, còn thời gian và lượt
- `EXPIRED` - Hết hạn (hết thời gian hoặc hết lượt)
- `CANCELLED` - Bị admin hủy

**Auto Expiry:**
- Hết lượt (`remainingSwaps = 0`) → `EXPIRED`
- Hết thời gian (`endDate < today`) → `EXPIRED`

---

## 5. BOOKING SYSTEM

### 5.1. Create Booking

**Prerequisites:**
- ✅ Phải có subscription ACTIVE
- ✅ Subscription còn ít nhất 1 lượt
- ✅ Xe phải ở status ACTIVE
- ✅ 1 xe chỉ được có 1 booking ACTIVE

**Automatic Behaviors:**

#### 1. Thời gian tự động:
```
Thời điểm đặt: 10:00
Giờ booking: 13:00 (TỰ ĐỘNG +3 tiếng)
```
- User KHÔNG chọn thời gian
- Hệ thống tự set 3 tiếng sau
- Đảm bảo đủ thời gian chuẩn bị

#### 2. Pin tự động reserve:
**Hệ thống tìm pin theo thứ tự:**
- Đúng trạm
- Đúng loại pin
- Status = AVAILABLE
- Pin >= 95%
- Sức khỏe >= 70%
- Ưu tiên: Sức khỏe cao nhất → Pin đầy nhất

**Pin được chọn:**
- Status: `AVAILABLE` → `PENDING`
- Locked cho booking này
- Không ai khác dùng được đến giờ booking

#### 3. Tự động CONFIRMED:
- Status: `CONFIRMED` ngay lập tức
- Không cần staff duyệt
- Generate confirmation code (10 ký tự)
- Code gửi qua email

#### 4. Trừ lượt ngay:
```
Subscription trước booking: 20 lượt
Sau khi tạo booking: 19 lượt (trừ ngay)
```
- Trừ ngay khi booking (không đợi swap)
- Tránh user book nhiều rồi hủy

**Limits:**
- Max 10 bookings per driver per day
- 1 xe = 1 booking active

**Response:**
```json
{
  "id": 15,
  "confirmationCode": "A7K9M3X2P1",
  "status": "CONFIRMED",
  "bookingTime": "2024-11-21T16:30:00",
  "createdAt": "2024-11-21T13:30:00",
  "vehicle": {...},
  "station": {...},
  "reservedBattery": {
    "id": 12,
    "chargeLevel": 98.5,
    "stateOfHealth": 95.0
  },
  "remainingSwaps": 19
}
```

**UI Flow:**
```
1. Driver chọn xe + trạm
2. Click "Đặt lịch"
3. Hiển thị:
   ✓ Xe: 30A12345
   ✓ Trạm: Trạm Quận 1
   ✓ Thời gian: 16:30 (3 tiếng sau)
   ✓ Pin dự kiến: 98% (sức khỏe 95%)
   ✓ Trừ 1 lượt (còn 19 lượt)
4. Confirm → Success
5. Lưu mã code để swap
```

### 5.2. Cancel Booking

**By Driver:**

**Rules:**
- ✅ Chỉ hủy được TRƯỚC **1 TIẾNG** (60 phút)
- ✅ Hoàn lại 1 lượt swap
- ✅ Pin được giải phóng

**Example:**
```
Booking lúc: 16:30
Có thể hủy đến: 15:30
Sau 15:30: Không hủy được, phải liên hệ staff
```

**After Cancel:**
- Booking status: `CANCELLED`
- Pin: `PENDING` → `AVAILABLE`
- Subscription: +1 lượt (hoàn lại)
- Confirmation code: Xóa

**By Staff/Admin:**

**Rules:**
- ✅ Hủy được BẤT KỲ LÚC NÀO
- ✅ Staff chỉ hủy booking của trạm mình
- ✅ Phải ghi lý do
- ✅ Hoàn lại lượt cho driver

**UI Messages:**
```
Còn > 1h:
✓ "Hủy booking" button enabled
✓ "Bạn sẽ được hoàn lại 1 lượt"

Còn < 1h:
✗ "Hủy booking" button disabled
⚠ "Quá gần giờ đặt. Vui lòng liên hệ staff qua ticket"
```

### 5.3. View Booking

**Driver:**
- Xem bookings của mình (tất cả status)

**Staff:**
- Xem bookings của trạm mình quản lý

**Admin:**
- Xem tất cả bookings

**Status Types:**
- `CONFIRMED` - Đã xác nhận, chờ đổi pin
- `COMPLETED` - Đã đổi pin xong
- `CANCELLED` - Đã hủy

---

## 6. SWAP TRANSACTION

### 6.1. Self-Service Swap

**Concept:**
- Driver tự đổi pin tại trạm
- Không cần staff hỗ trợ
- Dùng confirmation code để xác thực

**Flow:**

#### 1. Đến trạm đúng giờ:
```
Booking time: 16:30
Driver nên đến: 16:15 - 16:30
```

#### 2. Mở app, nhập mã:
```
Input: A7K9M3X2P1 (10 ký tự)
```

#### 3. Xem thông tin pin:
**GET Pin CŨ (đang trên xe):**
```json
{
  "batteryRole": "OLD",
  "batteryId": 8,
  "model": "BAT-050",
  "chargeLevel": 25.0,
  "stateOfHealth": 88.5
}
```

**GET Pin MỚI (chuẩn bị lắp):**
```json
{
  "batteryRole": "NEW",
  "batteryId": 12,
  "model": "BAT-075",
  "chargeLevel": 98.5,
  "stateOfHealth": 95.0
}
```

#### 4. Xác nhận swap:
```
POST /api/swap/by-code?code=A7K9M3X2P1
```

#### 5. Hệ thống xử lý:
- Gỡ pin cũ khỏi xe
- Lắp pin mới lên xe
- Pin cũ về trạm (status CHARGING hoặc MAINTENANCE)
- Pin mới status IN_USE
- Booking COMPLETED
- Subscription kiểm tra hết lượt → EXPIRED

#### 6. Email thông báo:
- Swap thành công
- Thông tin 2 pin
- Số lượt còn lại

**Important Notes:**
- ⚠️ Mã code chỉ dùng được 1 lần
- ⚠️ Không chia sẻ mã cho người khác
- ⚠️ Đến đúng giờ, đến sớm/trễ quá có thể không swap được

### 6.2. Battery Handling After Swap

**Pin MỚI (lắp lên xe):**
- Status: `PENDING` → `IN_USE`
- Location: Rời trạm, lên xe
- Vehicle: Cập nhật currentBattery

**Pin CŨ (gỡ từ xe):**
- Location: Về trạm
- Status check:
  - **Sức khỏe < 70%** → `MAINTENANCE` (cần bảo dưỡng)
  - **Sức khỏe >= 70% & pin chưa đầy** → `CHARGING` (đang sạc)
  - **Sức khỏe >= 70% & pin đã đầy** → `AVAILABLE` (sẵn sàng)

**UI Display:**
```
Lịch sử swap hiển thị:
✓ Pin cũ: 25% (Đem vào trạm)
✓ Pin mới: 98% (Lấy từ trạm)
✓ Trạm: Trạm Quận 1
✓ Thời gian: 21/11/2024 16:35
```

### 6.3. View Swap History

**By Driver:**
- Xem lịch sử swap của mình
- Xem lịch sử swap của từng xe

**By Staff/Admin:**
- Xem tất cả swap transactions

**Information Displayed:**
- Thời gian swap
- Trạm
- Xe (biển số, model)
- Pin cũ (model, %, sức khỏe)
- Pin mới (model, %, sức khỏe)
- Số lượt còn lại sau swap

---

## 7. BATTERY MANAGEMENT

### 7.1. Battery Status

**Status Flow:**
```
AVAILABLE (Sẵn sàng)
    ↓
PENDING (Đã reserve)
    ↓
IN_USE (Trên xe)
    ↓
CHARGING (Đang sạc)
    ↓
AVAILABLE hoặc MAINTENANCE
```

**Status Meanings:**
- `AVAILABLE` - Sẵn sàng, có thể booking
- `PENDING` - Đã được reserve, không ai khác dùng được
- `IN_USE` - Đang lắp trên xe
- `CHARGING` - Đang sạc tại trạm
- `MAINTENANCE` - Bảo dưỡng (health < 70%)
- `RETIRED` - Ngừng sử dụng vĩnh viễn

### 7.2. Battery Location

**3 vị trí:**

**1. Trong KHO:**
- currentStation = NULL
- Status = AVAILABLE
- Dùng để gắn vào xe mới duyệt

**2. Tại TRẠM:**
- currentStation = Station ID
- Status = AVAILABLE/CHARGING/MAINTENANCE
- Có thể booking

**3. Trên XE:**
- currentStation = NULL
- Status = IN_USE
- Không thể booking

### 7.3. Battery Health

**Key Metrics:**
- **ChargeLevel**: Mức pin (0-100%)
- **StateOfHealth**: Sức khỏe pin (0-100%)

**Health Thresholds:**
- >= 95%: Excellent
- 80-94%: Good
- 70-79%: Fair
- < 70%: Poor (cần bảo dưỡng)

**Health Degradation:**
- Sau mỗi lần swap, SOH giảm 0.1-0.5%
- Pin < 70% SOH → MAINTENANCE

### 7.4. Battery for Booking

**Requirements:**
- ✅ Đúng trạm
- ✅ Đúng loại pin
- ✅ Status = AVAILABLE
- ✅ ChargeLevel >= 95%
- ✅ StateOfHealth >= 70%

**Priority:**
1. Sức khỏe cao nhất
2. Pin đầy nhất

---

## 8. STATION & STAFF MANAGEMENT

### 8.1. Station Information

**Structure:**
```json
{
  "id": 3,
  "name": "Trạm Quận 1",
  "location": "123 Nguyễn Huệ, Q1, TP.HCM",
  "city": "TP.HCM",
  "district": "Quận 1",
  "contactInfo": "0901234567",
  "batteryType": {
    "id": 1,
    "name": "Lithium-Ion 75kWh"
  },
  "availableBatteries": 8,
  "status": "ACTIVE"
}
```

### 8.2. Staff Station Assignment

**Rules:**
- ✅ 1 staff có thể quản lý NHIỀU trạm
- ✅ 1 trạm có thể có NHIỀU staff
- ✅ Chỉ Admin mới assign

**Staff Permissions:**
- Xem/Cập nhật pin của trạm mình
- Xem/Hủy booking của trạm mình
- Xử lý tickets của trạm mình

**Authorization Check:**
```
Staff thao tác resource → Check resource.station IN staff.assignedStations
```

### 8.3. Compatible Stations

**For Booking:**
```
GET /api/bookings/compatible-stations?vehicleId=1
```

**Returns:**
- Trạm có cùng loại pin với xe
- Trạm có pin sẵn sàng (>= 1 pin AVAILABLE)
- Trạm đang ACTIVE

**UI Display:**
```
✓ Trạm Quận 1 (5.2km)
  📍 123 Nguyễn Huệ, Q1
  🔋 8 pin sẵn sàng
  ☎ 0901234567
  
✓ Trạm Quận 3 (8.7km)
  📍 456 Lê Văn Sỹ, Q3
  🔋 3 pin sẵn sàng
  ☎ 0909876543
```

---

## 9. PAYMENT SYSTEM

### 9.1. Payment Gateway

**Provider:** MoMo

**Environment:** Sandbox (Test)

**Payment Flow:**
```
1. User chọn gói/upgrade/renewal
2. Frontend → POST /api/momo/payment/{type}
3. Backend tạo payment request → MoMo
4. MoMo trả về payUrl
5. Frontend redirect user → MoMo payment page
6. User thanh toán trên MoMo app
7. MoMo callback → Backend
8. Backend xử lý logic (tạo subscription/upgrade/renewal)
9. Frontend hiển thị kết quả
```

### 9.2. Payment Types

**PURCHASE:**
```json
POST /api/momo/payment/purchase
{
  "packageId": 1,
  "driverId": 5
}
```
- Mua gói mới
- Amount = giá gói

**UPGRADE:**
```json
POST /api/momo/payment/upgrade
{
  "packageId": 2,
  "driverId": 5
}
```
- Nâng cấp gói
- Amount = giá gói mới - giá trị hoàn lại

**RENEWAL:**
```json
POST /api/momo/payment/renewal
{
  "packageId": 1,
  "driverId": 5
}
```
- Gia hạn gói
- Amount = giá gói (có giảm 5% nếu sớm)

### 9.3. Payment Status

**Success:**
```json
{
  "resultCode": 0,
  "message": "Thanh toán thành công"
}
```
- Backend tạo/cập nhật subscription
- Gửi email thông báo

**Failed:**
```json
{
  "resultCode": 1006,
  "message": "Giao dịch bị từ chối"
}
```
- Không tạo subscription
- User có thể thử lại

**Common Result Codes:**
- `0` - Success
- `1006` - Declined
- `1000` - Timeout
- `9000` - System error

### 9.4. Payment History

**Driver View:**
```
GET /api/payments/my
```

**Response:**
```json
[
  {
    "id": 8,
    "orderId": "ORDER_1732185600_5",
    "amount": 800000,
    "status": "SUCCESS",
    "paymentMethod": "MOMO",
    "transactionId": "MOMO_TXN_123456",
    "createdAt": "2024-11-21T10:00:00",
    "servicePackage": {
      "name": "Gói Tiêu Chuẩn"
    },
    "paymentType": "PURCHASE"
  }
]
```

---

## 10. SUPPORT TICKET

### 10.1. Create Ticket

**When to create?**
- ❓ Có câu hỏi về dịch vụ
- 🔧 Gặp sự cố kỹ thuật
- 🔋 Pin bị lỗi sau swap
- 📍 Trạm có vấn đề
- 💳 Vấn đề thanh toán

**Limits:**
- Max 3 tickets OPEN per driver

**Types:**

**1. Ticket có station (liên quan trạm):**
```json
{
  "subject": "Pin bị lỗi sau khi swap",
  "description": "Pin mới lắp vào xe báo lỗi...",
  "stationId": 3
}
```
- Gửi đến Staff của trạm đó
- Nếu không có staff → Gửi Admin

**2. Ticket không có station (vấn đề chung):**
```json
{
  "subject": "Không thể nâng cấp gói",
  "description": "Hệ thống báo lỗi khi nâng cấp...",
  "stationId": null
}
```
- Gửi trực tiếp đến Admin

### 10.2. Ticket Status

**Flow:**
```
OPEN (Mới tạo)
    ↓
IN_PROGRESS (Staff đang xử lý)
    ↓
RESOLVED (Đã giải quyết)
```

**Status Meanings:**
- `OPEN` - Mới tạo, chờ xử lý
- `IN_PROGRESS` - Staff đang xử lý
- `RESOLVED` - Đã giải quyết xong

### 10.3. Ticket Response

**Process:**
1. Driver tạo ticket
2. Email gửi đến Staff/Admin
3. Staff/Admin xem và trả lời
4. Driver nhận email thông báo có phản hồi
5. Driver xem response trong app

**UI Display:**
```
Ticket #12: Pin bị lỗi sau khi swap
Status: IN_PROGRESS
Created: 21/11/2024 17:00

Response từ Nhân Viên Trạm:
"Cảm ơn bạn đã phản hồi. Chúng tôi đang kiểm tra 
và sẽ liên hệ trong 30 phút."
21/11/2024 17:15
```

### 10.4. View Tickets

**Driver:**
- Xem tickets của mình

**Staff:**
- Xem tickets của trạm mình

**Admin:**
- Xem tất cả tickets

---

## 11. NOTIFICATION SYSTEM

### 11.1. Email Notifications

**Trigger Events:**

| Event | Recipient | Content |
|-------|-----------|---------|
| **Vehicle Registration** | Admin | Có xe mới cần duyệt |
| **Vehicle Approved** | Driver | Xe đã được duyệt, có pin |
| **Vehicle Rejected** | Driver | Xe bị từ chối + lý do |
| **Booking Confirmed** | Driver | Booking thành công + confirmation code |
| **Booking Cancelled** | Driver | Booking bị hủy + lý do |
| **Swap Success** | Driver | Swap thành công + thông tin pins |
| **Payment Success** | Driver | Thanh toán thành công |
| **Subscription Deleted** | Driver | Gói bị admin hủy + lý do |
| **Ticket Created** | Staff/Admin | Có ticket mới cần xử lý |
| **Ticket Response** | Driver | Staff đã trả lời ticket |

### 11.2. Email Templates

**Key Information:**

**Booking Confirmed:**
- Confirmation code (10 ký tự)
- Thời gian booking
- Địa chỉ trạm
- Thông tin xe (biển số riêng)
- Thông tin pin dự kiến
- Chính sách hủy (>1h trước)

**Vehicle Approved:**
- Thông tin xe
- Thông tin pin được gắn (% cao)
- Hướng dẫn bước tiếp theo

**Swap Success:**
- Pin cũ (% thấp)
- Pin mới (% cao - từ snapshot)
- Số lượt còn lại
- Link xem lịch sử

---

## 12. VALIDATION RULES SUMMARY

### 12.1. Vehicle

| Field | Rule |
|-------|------|
| VIN | 17 ký tự, unique (ACTIVE/PENDING) |
| PlateNumber | Unique (ACTIVE/PENDING) |
| RegistrationImage | Required, max 10MB, JPG/PNG/PDF |
| Max ACTIVE | 2 xe per driver |
| Max PENDING | 1 xe per driver |

### 12.2. Subscription

| Rule | Description |
|------|-------------|
| Purchase | Chỉ khi chưa có hoặc hết lượt |
| Upgrade | Gói mới phải đắt hơn/nhiều lượt hơn |
| Renewal | Chỉ gia hạn cùng gói |
| Max Active | 1 subscription ACTIVE per driver |

### 12.3. Booking

| Rule | Description |
|------|-------------|
| Prerequisite | Subscription ACTIVE + còn lượt |
| Time | Tự động +3h, không chọn được |
| Vehicle Limit | 1 booking ACTIVE per vehicle |
| Daily Limit | Max 10 bookings per day |
| Cancel By Driver | >1h trước giờ booking |
| Cancel By Staff | Bất kỳ lúc nào |

### 12.4. Swap

| Rule | Description |
|------|-------------|
| Code Usage | 1 lần duy nhất |
| Code Validity | Đến giờ booking |
| Battery Requirement | >= 95%, health >= 70% |
| Deduct Swaps | Đã trừ từ booking |

### 12.5. Battery

| Field | Rule |
|-------|------|
| ChargeLevel | 0-100% |
| StateOfHealth | 0-100%, >= 70% for booking |
| Status | 6 types (AVAILABLE, PENDING, IN_USE, ...) |
| Location | Kho/Trạm/Xe |

### 12.6. Support Ticket

| Rule | Description |
|------|-------------|
| Max Open | 3 tickets per driver |
| Routing | Station → Staff, None → Admin |
| Status | 3 types (OPEN, IN_PROGRESS, RESOLVED) |

### 12.7. Payment

| Rule | Description |
|------|-------------|
| Gateway | MoMo Sandbox |
| Types | PURCHASE, UPGRADE, RENEWAL |
| Verification | HMAC-SHA256 signature |
| Callback | Required for completion |

---

## 13. ERROR HANDLING

### 13.1. Common Error Messages

**Authentication:**
- `Chưa có gói dịch vụ!` → Mua gói trước
- `Gói đã hết lượt!` → Gia hạn/mua gói mới
- `Chỉ tài xế mới đăng ký xe!` → Sai role

**Vehicle:**
- `VIN đã tồn tại!` → Xe đã đăng ký
- `Đã đủ 2 xe hoạt động!` → Xóa xe không dùng
- `Có xe đang chờ duyệt!` → Đợi duyệt xe cũ
- `Xe chưa được phê duyệt!` → Xe PENDING

**Booking:**
- `Đã đạt giới hạn 10 lượt/ngày!` → Đợi ngày mai
- `Xe đã có booking!` → Hoàn tất/hủy booking cũ
- `Trạm hết pin!` → Chọn trạm khác
- `Quá gần giờ đặt!` → Liên hệ staff

**Subscription:**
- `Gói hiện tại còn lượt!` → Dùng hết hoặc nâng cấp
- `Gói mới phải đắt hơn!` → Không phải upgrade
- `Chỉ được gia hạn cùng gói!` → Dùng nâng cấp

**Swap:**
- `Không tìm thấy booking!` → Mã sai
- `Mã đã sử dụng!` → Không dùng lại được
- `Booking đã bị hủy!` → Tạo booking mới

**Ticket:**
- `Đã đạt giới hạn 3 ticket!` → Đợi ticket cũ xử lý

### 13.2. HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request thành công |
| 201 | Created | Tạo resource thành công |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Token invalid/expired |
| 403 | Forbidden | Không đủ quyền |
| 404 | Not Found | Resource không tồn tại |
| 409 | Conflict | Duplicate data |
| 500 | Server Error | Lỗi server |

---

## 14. UI/UX RECOMMENDATIONS

### 14.1. Dashboard (Driver)

**Display:**
```
👤 Nguyễn Văn A
📦 Gói Tiêu Chuẩn: 19/50 lượt
⏰ Hết hạn: 15/12/2024 (còn 24 ngày)

🚗 Xe của tôi: 2 xe
📅 Booking tiếp theo: 21/11 16:30
🔋 Lịch sử swap: 31 lần
```

### 14.2. Booking Page

**Steps:**
```
1. Chọn xe
   [30A12345 - VinFast VF8]

2. Chọn trạm
   [Trạm Quận 1 - 5.2km - 8 pin sẵn sàng]

3. Xác nhận
   ✓ Giờ đổi pin: 16:30 (3 tiếng sau)
   ✓ Trừ 1 lượt (còn 19 lượt)
   ✓ Pin dự kiến: 98%
   
[Đặt lịch ngay]
```

### 14.3. Subscription Page

**Current Subscription:**
```
📦 Gói Tiêu Chuẩn
💰 800,000đ / 30 ngày
🔋 19/50 lượt còn lại
📅 Hết hạn: 15/12/2024

[Nâng cấp] [Gia hạn]
```

**Upgrade Modal:**
```
Nâng cấp từ Gói Tiêu Chuẩn → Gói VIP

Gói hiện tại:
✓ 50 lượt = 800,000đ
✓ Đã dùng: 31 lượt
✓ Còn lại: 19 lượt

Hoàn lại: 304,000đ (19 lượt × 16,000đ)

Gói mới:
✓ 100 lượt = 1,400,000đ
✓ Thời hạn: 30 ngày

Thanh toán: 1,096,000đ

[Xác nhận nâng cấp]
```

### 14.4. Swap Page

**Enter Code:**
```
Nhập mã xác nhận:
[A7K9M3X2P1]

[Xem thông tin pin]
```

**Battery Info:**
```
Pin CŨ (gỡ từ xe):
🔋 BAT-050
📊 25% (Sức khỏe: 88%)

Pin MỚI (lắp vào xe):
🔋 BAT-075
📊 98% (Sức khỏe: 95%)

[Xác nhận đổi pin]
```

### 14.5. Notification Badge

```
🔔 (3)
- Booking 16:30 còn 2 giờ
- Gói dịch vụ hết hạn sau 3 ngày
- Ticket #12 đã được trả lời
```

---

## 15. TESTING SCENARIOS

### 15.1. Happy Path

**Complete Flow:**
1. ✅ Đăng ký tài khoản Driver
2. ✅ Đăng ký xe → Admin duyệt
3. ✅ Mua gói Tiêu Chuẩn → Thanh toán MoMo
4. ✅ Đặt lịch đổi pin tại Trạm Quận 1
5. ✅ Đến trạm, swap bằng mã code
6. ✅ Kiểm tra lịch sử swap
7. ✅ Gia hạn gói sớm → Cộng dồn lượt

### 15.2. Edge Cases

**Subscription:**
- Mua gói khi còn lượt → Error
- Upgrade sang gói rẻ hơn → Error
- Renewal gói khác → Error

**Booking:**
- Đặt lịch khi hết lượt → Error
- Đặt lịch xe thứ 2 khi xe 1 có booking → Success
- Hủy booking < 1h → Error
- Trạm hết pin → Error

**Swap:**
- Dùng mã 2 lần → Error
- Dùng mã đã hủy → Error
- Swap sai trạm → Error

**Vehicle:**
- Đăng ký xe thứ 3 → Error
- Đăng ký 2 xe PENDING → Error
- VIN trùng → Error

---

## 16. GLOSSARY

**Key Terms:**

- **VIN**: Vehicle Identification Number (17 ký tự)
- **SOH**: State of Health (sức khỏe pin, 0-100%)
- **SOC**: State of Charge (mức pin, 0-100%)
- **Swap**: Đổi pin
- **Booking**: Đặt lịch đổi pin
- **Confirmation Code**: Mã xác nhận để swap (10 ký tự)
- **Service Package**: Gói dịch vụ (lượt đổi pin + thời gian)
- **Subscription**: Gói đăng ký đang sử dụng
- **Station**: Trạm đổi pin
- **Warehouse**: Kho pin (không thuộc trạm nào)

---

## 17. QUICK REFERENCE

### For Frontend Developers:

**Authentication:**
- Login → Lưu JWT token
- Mọi request → Header: `Authorization: Bearer <token>`
- Token expired → Redirect login

**Key APIs:**
```
POST   /api/auth/register          - Đăng ký
POST   /api/auth/login             - Đăng nhập
GET    /api/vehicles/my            - Xe của tôi
POST   /api/bookings               - Tạo booking
POST   /api/swap/by-code           - Swap tự phục vụ
GET    /api/payments/my            - Lịch sử thanh toán
```

**States to Track:**
- User info & role
- Active subscription (lượt, ngày hết hạn)
- Active booking (nếu có)
- Vehicles (status, currentBattery)

**Real-time Updates:**
- Subscription remainingSwaps giảm khi booking
- Booking status change
- Vehicle status change

---

**Ngày cập nhật:** 21/11/2025  
**Dự án:** EVBatterySwapStationManagementSystem-backend  
**Mục đích:** Tài liệu cho Frontend & Product Team  
**Liên hệ:** support@evbs.com

🚀 **Chúc các bạn phát triển thành công!** 🚀
