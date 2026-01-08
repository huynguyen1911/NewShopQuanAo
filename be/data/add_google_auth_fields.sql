-- =====================================================
-- SQL Migration: Thêm hỗ trợ đăng nhập Google OAuth
-- Chạy file này sau khi đã có database clothes-web-shop
-- =====================================================

USE `clothes-web-shop`;

-- Thêm cột google_id vào bảng Users để lưu Google Account ID
ALTER TABLE `users` 
ADD COLUMN `google_id` VARCHAR(255) NULL AFTER `password`;

-- Tạo index cho google_id để tìm kiếm nhanh hơn
CREATE INDEX `idx_users_google_id` ON `users` (`google_id`);

-- Thêm cột avatar vào bảng Customer_Infos để lưu ảnh đại diện từ Google
ALTER TABLE `customer_infos`
ADD COLUMN `avatar` VARCHAR(500) NULL AFTER `address`;

-- =====================================================
-- HOÀN TẤT! Giờ hệ thống đã hỗ trợ đăng nhập Google
-- =====================================================
