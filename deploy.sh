#!/bin/bash

echo "--- BAT DAU DEPLOY ---"

# 1. Di chuyển vào thư mục chứa code (đề phòng đang đứng sai chỗ)
cd /root/source-code-web

# 2. Lấy code mới nhất từ GitHub
echo "Dang pull code..."
git pull origin main

# 3. Cài đặt thư viện mới (nếu có)
echo "Dang cai npm..."
npm install

# 4. Build ra file tĩnh (tạo thư mục dist)
echo "Dang Build..."
npm run build

# 5. Xóa code cũ ở thư mục Nginx đi cho sạch (Bàn ăn cũ)
echo "Xoa code cu o Nginx..."
rm -rf /var/www/html/*

# 6. Copy code mới vừa build sang thư mục Nginx (Bưng món mới ra bàn)
echo "Copy build sang Nginx..."
cp -r dist/* /var/www/html/

# 7. Reload Nginx để cập nhật
echo "Reload Nginx..."
systemctl reload nginx

echo "--- DEPLOY THANH CONG! ---"