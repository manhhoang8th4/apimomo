import { Elysia, t } from "elysia";
import EmailUtil from "./EmailUtil";
import { ObjectId } from "mongodb";
import { PaymentService } from "../momo/PaymentService";
import { VNPayService } from "../vnpay/VNPayService";

const app = new Elysia()
  .post(
    "/api",
    async ({ body }) => {
      const emailUtil = new EmailUtil();

      emailUtil.sendEmail({
        from: '"Meow" <meow@gmail.com>',
        to: "minhchi521@gmail.com",
        subject: body.subject,
        text: body.message,
      });
    },
    {
      body: t.Object({
        to: t.String(),
        subject: t.String(),
        message: t.String(),
      }),
    }
  )
  .post(
    "/api/momo",
    async ({ body }) => {
      const paymentService = new PaymentService();

      const payUrl = await paymentService.createMoMoPayment(
        body.amount.toString(),
        {
          userId: new ObjectId().toString(),
          message: body.orderInfo,
        },
        {
          redirectUrl: body.redirectUrl,
          ipnUrl: body.callbackUrl,
        }
      );

      if (payUrl) {
        return payUrl;
      } else {
        return "Error";
      }
    },
    {
      body: t.Object({
        amount: t.Number(), // Payment amount
        orderInfo: t.String(),
        redirectUrl: t.String(),
        callbackUrl: t.String(),
      }),
    }
  )
  .post(
    "/api/vnpay",
    async ({ body }) => {
      const vnpayService = new VNPayService();

      const payUrl = await vnpayService.createVNPayPayment(
        body.amount.toString(),
        {
          userId: new ObjectId().toString(),
          message: body.orderInfo,
        }
      );

      if (payUrl) {
        return payUrl;
      } else {
        return "Error";
      }
    },
    {
      body: t.Object({
        amount: t.Number(),
        orderInfo: t.String(),
      }),
    }
  )

  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
