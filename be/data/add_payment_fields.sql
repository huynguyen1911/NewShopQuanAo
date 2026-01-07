-- Thêm cột payment_method và payment_status vào bảng Orders
-- Chạy script này để cập nhật database

ALTER TABLE `Orders` 
ADD COLUMN `payment_method` VARCHAR(50) DEFAULT 'COD' AFTER `total_order_value`,
ADD COLUMN `payment_status` VARCHAR(50) DEFAULT 'PENDING' AFTER `payment_method`;

-- Cập nhật các đơn hàng cũ
UPDATE `Orders` SET `payment_method` = 'COD', `payment_status` = 'PAID' WHERE `payment_method` IS NULL;
