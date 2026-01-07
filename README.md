# NHỮNG CHỨC NĂNG CHÍNH
- ### Trang portal
  - Quản lý danh mục sản phẩm
  - Quản lý màu sắc sản phẩm
  - Quản lý size sản phẩm
  - Quản lý sản phẩm
  - Quản lý biến thể sản phẩm 
  - Quản lý đơn hàng
- ### Trang landing
  - Tìm kiếm sản phẩm theo danh mục
  - Xem chi tiết sản phẩm
  - Giỏ hàng
  - Xem lịch sử đơn hàng
  - Xem chi tiết đơn hàng
  - Đánh giá sản phẩm
  - **Thanh toán VNPay**
  - **Đăng nhập bằng Google**
- ### Chung
  - Authentication với JWT Access Token và tự động gia hạn bằng Cookie Refresh Token khi Access Token hết hạn
  - Validate với React Hook Form
  - Caching với Tanstack Query

# HƯỚNG DẪN CÀI ĐẶT

## Bước 1: Clone project
```bash
git clone <repository-url>
cd nodejs-clothes-web-shop-master
```

## Bước 2: Tạo Database MySQL
1. Mở MySQL Workbench hoặc phpMyAdmin
2. Tạo database mới:
```sql
CREATE DATABASE `clothes-web-shop`;
```
3. Import file SQL:
```bash
mysql -u root -p clothes-web-shop < be/data/clothes-web-shop.sql
```
4. Chạy các migration:
```bash
mysql -u root -p clothes-web-shop < be/data/add_payment_fields.sql
mysql -u root -p clothes-web-shop < be/data/add_google_auth_fields.sql
```

## Bước 3: Cấu hình Backend
1. Copy file `.env.example` thành `.env`:
```bash
cd be
cp .env.example .env
```
2. Cập nhật file `be/.env` với thông tin của bạn:
```env
DATABASE_PASSWORD=your_mysql_password
VNP_TMN_CODE=your_vnpay_tmn_code
VNP_HASH_SECRET=your_vnpay_hash_secret
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## Bước 4: Cấu hình Frontend
Cập nhật file `fe-landing/.env`:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## Bước 5: Cài đặt và chạy
```bash
# Backend
cd be
npm install
npm start

# Frontend Landing (terminal mới)
cd fe-landing
npm install
npm run dev

# Frontend Portal (terminal mới)
cd fe-portal
npm install
npm run dev
```

## Lấy Google Client ID
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Tạo OAuth 2.0 Client ID
3. Thêm `http://localhost:3001` vào Authorized JavaScript origins

## Lấy VNPay Credentials
1. Đăng ký tại [VNPay Sandbox](https://sandbox.vnpayment.vn/devreg/)
2. Lấy TMN_CODE và HASH_SECRET

# CÔNG NGHỆ SỬ DỤNG
- Frontend: NextJS, Zustand, Ant Design, React Hook Form, Tanstack Query, Bootstrap
- Backend: NodeJS (ExpressJS), Sequelize
- DBMS: MySQL

# GIAO DIỆN TRANG LANDING
## 1. Trang chủ
![Home_Page](README/Home_Page.gif)

## 2. Trang danh sách sản phẩm
![Product_Collection](README/Product_Collection.gif)

## 3. Trang chi tiết sản phẩm
![Product_Detail](README/Product_Detail.gif)

## 4. Trang giỏ hàng
![Cart_Page](README/Cart_Page.gif)

## 5. Trang thông tin khách hàng
![Info_Customer](README/Info_Customer.png)

## 6. Trang lịch sử đơn hàng
![Order_List](README/Order_List.gif)

## 7. Trang chi tiết đơn hàng
![Order_Detail](README/Order_Detail.gif)

# GIAO DIỆN TRANG PORTAL
## 1. Trang quản lý danh mục
![Category_Management](README/Category_Management.gif)

## 2. Trang quản lý sản phẩm
![Product_Management](README/Product_Management.gif)

## 3. Trang thêm sản phẩm
![Create_Product](README/Create_Product.gif)

## 4. Trang quản lý đơn hàng
![Order_Management](README/Order_Management.gif)

## 5. Trang chi tiết đơn hàng
![Admin_Order_Detail](README/Admin_Order_Detail.png)

# THIẾT KẾ DỮ LIỆU - SƠ ĐỒ THỰC THỂ QUAN HỆ
![ERD](README/ERD.png)
