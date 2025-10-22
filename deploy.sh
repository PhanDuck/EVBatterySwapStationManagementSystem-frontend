#!/bin/bash
set -e

# 1. Build ứng dụng (Tạo thư mục 'dist')
echo "Building app..."
npm run build

# 2. Deploy các tệp đã build lên server
# THAY THẾ 'your_key_name.pem' BẰNG TÊN FILE KHÓA CỦA BẠN
echo "Deploying files to server..."
scp -r -i ./swp-key.pem dist/* root@103.200.20.190:/var/www/html/

echo "Done!"