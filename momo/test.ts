import axios from "axios";

async function testMomoPayment() {
  const apiUrl = "http://localhost:3000/api/momo"; // Địa chỉ API của bạn
  const paymentData = {
    amount: 10000, // Số tiền thanh toán
    orderInfo: "Thanh toán cho sản phẩm A", // Thông tin đơn hàng
    returnUrl: "https://your-return-url.com", // URL để quay lại sau khi thanh toán
    notifyUrl: "https://your-notify-url.com", // URL để nhận thông báo
  };

  try {
    const response = await axios.post(apiUrl, paymentData);
    console.log("Phản hồi từ MoMo:", response.data);
  } catch (error) {
    console.error("Lỗi khi gọi API MoMo:", error);
  }
}

// Chạy hàm testMomoPayment
testMomoPayment();
