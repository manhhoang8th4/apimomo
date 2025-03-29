import crypto from "crypto";
import { ObjectId } from "mongodb";

interface OrderInfo {
  userId: string;
  message: string;
}

export class VNPayService {
  private readonly tmnCode: string;
  private readonly hashSecret: string;
  private readonly defaultReturnUrl: string;

  constructor() {
    this.tmnCode = process.env.VNP_TMN_CODE || "";
    this.hashSecret = process.env.VNP_HASH_SECRET || "";
    this.defaultReturnUrl = process.env.DEFAULT_RETURN_URL || "";

    if (!this.tmnCode || !this.hashSecret || !this.defaultReturnUrl) {
      throw new Error(
        "VNPay configuration is missing. Please check your environment variables."
      );
    }
  }

  async createVNPayPayment(
    amount: string,
    orderInfo: OrderInfo,
    options: {
      returnUrl?: string;
      language?: string;
    } = {}
  ): Promise<string> {
    const orderId = new ObjectId().toString();

    const { returnUrl = this.defaultReturnUrl, language = "vn" } = options;

    const requestBody = this.createVNPayRequestBody({
      amount,
      orderId,
      orderInfo: orderInfo.message,
      returnUrl,
      language,
    });

    console.log(orderId);

    const payUrl = this.buildVNPayUrl(requestBody);
    return payUrl;
  }

  private createVNPayRequestBody(params: {
    amount: string;
    orderId: string;
    orderInfo: string;
    returnUrl: string;
    language: string;
  }): Record<string, string> {
    const { amount, orderId, orderInfo, returnUrl, language } = params;

    const vnp_Amount = parseInt(amount) * 100;
    const createDate = new Date();
    const vnp_CreateDate = this.formatDate(createDate);
    const vnp_ExpireDate = this.formatDate(
      new Date(createDate.getTime() + 15 * 60000)
    );

    return {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: vnp_Amount.toString(),
      vnp_CreateDate,
      vnp_CurrCode: "VND",
      vnp_IpAddr: "127.0.0.1",
      vnp_Locale: language,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: "billpayment",
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: orderId,
      vnp_ExpireDate,
    };
  }

  private buildVNPayUrl(params: Record<string, string>): string {
    const baseUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const sortedParams = this.sortObject(params);

    const queryString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    const secureHash = this.createSignature(queryString);

    return `${baseUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
  }

  private sortObject(obj: Record<string, string>): Record<string, string> {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = obj[key];
        return result;
      }, {} as Record<string, string>);
  }

  private createSignature(data: string): string {
    return crypto
      .createHmac("sha512", this.hashSecret)
      .update(data)
      .digest("hex");
  }

  private formatDate(date: Date): string {
    return (
      date.toISOString().split("T")[0].replace(/-/g, "") +
      date.toTimeString().split(" ")[0].replace(/:/g, "")
    );
  }
}
