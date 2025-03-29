import crypto from "crypto";
import { error } from "elysia";
import { ObjectId } from "mongodb";

interface OrderInfo {
  userId: string;
  message: string;
}

export class PaymentService {
  async createMoMoPayment(
    amount: string,
    orderInfo: OrderInfo,
    options: {
      redirectUrl?: string;
      ipnUrl?: string;
      lang?: string;
    } = {}
  ): Promise<string> {
    const orderId = new ObjectId().toString();
    const requestId = new ObjectId().toString();

    const {
      redirectUrl = "nigger.com",
      ipnUrl = "nigger.com/call-back",
      lang = "vi",
    } = options;

    const requestBody = this.createMoMoRequestBody({
      amount,
      orderId,
      requestId,
      redirectUrl,
      ipnUrl,
      orderInfo: orderInfo.message,
      lang,
    });

    console.log(orderId);

    const payUrl = await this.sendMoMoRequest(requestBody);
    return payUrl;
  }

  private createMoMoRequestBody(params: {
    amount: string;
    orderId: string;
    requestId: string;
    redirectUrl: string;
    ipnUrl: string;
    orderInfo: string;
    lang: string;
  }): any {
    const { amount, orderId, requestId, redirectUrl, ipnUrl, orderInfo, lang } =
      params;
    const requestType = "captureWallet";
    const extraData = "";
    const storeName = "Thư viện";

    const rawSignature = this.createRawSignature({
      accessKey: process.env.MOMO_ACCESS_KEY || "",
      amount,
      ipnUrl,
      orderId,
      orderInfo,
      partnerCode: process.env.MOMO_PARTNER_CODE || "",
      redirectUrl,
      requestId,
      requestType,
      extraData,
    });

    const signature = this.createSignature(rawSignature);

    return {
      partnerCode: process.env.MOMO_PARTNER_CODE || "",
      accessKey: process.env.MOMO_ACCESS_KEY || "",
      requestId,
      storeName,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      signature,
      lang,
      extraData,
    };
  }

  public createRawSignature(params: Record<string, string>): string {
    return Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
  }

  public createSignature(rawSignature: string): string {
    return crypto
      .createHmac("sha256", process.env.MOMO_SECRET_KEY || "")
      .update(rawSignature)
      .digest("hex");
  }

  private async sendMoMoRequest(data: any): Promise<string> {
    const response = await fetch(
      "https://test-payment.momo.vn/v2/gateway/api" + "/create",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    const responseData = await response.json();
    console.log(responseData);

    if (responseData.payUrl) {
      return responseData.payUrl;
    }
    throw new Error("Failed to create MoMo payment");
  }
}
