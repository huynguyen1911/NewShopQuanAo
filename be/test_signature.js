require('dotenv').config();
const crypto = require('crypto');

// Test data giống y hệt log từ server
const vnp_Params = {
  vnp_Amount: '19900000',
  vnp_Command: 'pay',
  vnp_CreateDate: '20260104142051',
  vnp_CurrCode: 'VND',
  vnp_ExpireDate: '20260104143551',
  vnp_IpAddr: '127.0.0.1',
  vnp_Locale: 'vn',
  vnp_OrderInfo: 'Thanh toan don hang 78183770374281',
  vnp_OrderType: 'other',
  vnp_ReturnUrl: 'https://toolless-mallie-unbenignly.ngrok-free.dev/payment/vnpay-return',
  vnp_TmnCode: 'C2CENT1Y',
  vnp_TxnRef: '78183770374281',
  vnp_Version: '2.1.0'
};

const secretKey = process.env.VNP_HASH_SECRET.trim();

console.log('=== TEST 1: Encode value only (current code) ===');
let signData1 = Object.keys(vnp_Params)
    .map(key => {
        const encodedValue = encodeURIComponent(vnp_Params[key]);
        return `${key}=${encodedValue}`;
    })
    .join('&');
console.log('signData:', signData1);
let hmac1 = crypto.createHmac("sha512", secretKey);
let hash1 = hmac1.update(Buffer.from(signData1, 'utf-8')).digest("hex");
console.log('Hash:', hash1);

console.log('\n=== TEST 2: No encoding (raw) ===');
let signData2 = Object.keys(vnp_Params)
    .map(key => `${key}=${vnp_Params[key]}`)
    .join('&');
console.log('signData:', signData2);
let hmac2 = crypto.createHmac("sha512", secretKey);
let hash2 = hmac2.update(Buffer.from(signData2, 'utf-8')).digest("hex");
console.log('Hash:', hash2);

console.log('\n=== TEST 3: Encode both key and value ===');
let signData3 = Object.keys(vnp_Params)
    .map(key => {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(vnp_Params[key]);
        return `${encodedKey}=${encodedValue}`;
    })
    .join('&');
console.log('signData:', signData3);
let hmac3 = crypto.createHmac("sha512", secretKey);
let hash3 = hmac3.update(Buffer.from(signData3, 'utf-8')).digest("hex");
console.log('Hash:', hash3);

console.log('\n=== Secret Key Info ===');
console.log('Length:', secretKey.length);
console.log('Value:', secretKey);
console.log('Hex:', Buffer.from(secretKey).toString('hex'));
