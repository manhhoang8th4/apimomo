import axios from "axios";
import crypto from "crypto";

// Định nghĩa kiểu cho request body của MoMo
interface MomoRequestBody {
  partnerCode: string;
  accessKey: string;
  requestId: string;
  orderId: string;
  orderInfo: string;
  amount: number;
  returnUrl: string;
  notifyUrl: string;
  requestType: string;
  extraData: string;
  signature?: string; // Thuộc tính signature sẽ được thêm sau
}

export class MomoUtil {
  private partnerCode: string;
  private accessKey: string;
  private secretKey: string;
  private endpoint: string;

  constructor() {
    this.partnerCode = process.env.MOMO_PARTNER_CODE || "YOUR_PARTNER_CODE";
    this.accessKey = process.env.MOMO_ACCESS_KEY || "YOUR_ACCESS_KEY";
    this.secretKey = process.env.MOMO_SECRET_KEY || "YOUR_SECRET_KEY";
    this.endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"; // Sử dụng URL sandbox của MoMo
  }

  // Hàm tạo yêu cầu thanh toán
  async createPayment(options: {
    amount: number;
    orderInfo: string;
    returnUrl: string;
    notifyUrl: string;
  }): Promise<any> {
    const requestId = this.generateRequestId();
    const orderId = this.generateOrderId();

    // Khởi tạo request body
    const requestBody: MomoRequestBody = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId: requestId,
      orderId: orderId,
      orderInfo: options.orderInfo,
      amount: options.amount,
      returnUrl: options.returnUrl,
      notifyUrl: options.notifyUrl,
      requestType: "captureWallet",
      extraData: "", // Thông tin thêm tùy chọn
    };

    // Tạo chữ ký cho yêu cầu
    const rawSignature = `accessKey=${this.accessKey}&amount=${options.amount}&extraData=${requestBody.extraData}&notifyUrl=${options.notifyUrl}&orderId=${orderId}&orderInfo=${options.orderInfo}&partnerCode=${this.partnerCode}&requestId=${requestId}&returnUrl=${options.returnUrl}&requestType=${requestBody.requestType}`;
    requestBody.signature = this.generateSignature(rawSignature); // Thêm thuộc tính signature

    try {
      const response = await axios.post(this.endpoint, requestBody);
      return response.data;
    } catch (error) {
      console.error("Error making MoMo API request:", error);
      throw error;
    }
  }

  // Hàm tạo requestId duy nhất (có thể dựa vào timestamp)
  private generateRequestId(): string {
    return `${this.partnerCode}-${Date.now()}`;
  }

  // Hàm tạo orderId duy nhất
  private generateOrderId(): string {
    return `${Date.now()}`;
  }

  // Hàm tạo chữ ký MoMo bằng HMAC SHA256
  private generateSignature(rawSignature: string): string {
    return crypto
      .createHmac("sha256", this.secretKey)
      .update(rawSignature)
      .digest("hex");
  }
}

export default MomoUtil;
