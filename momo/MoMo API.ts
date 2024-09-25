import { Elysia, t } from "elysia";
import MomoUtil from "./MomoUtil";

// Initialize the app
const app = new Elysia()
  .post(
    "/api/momo",
    async ({ body }) => {
      const momoUtil = new MomoUtil();

      const response = await momoUtil.createPayment({
        amount: body.amount,
        orderInfo: body.orderInfo,
        returnUrl: body.returnUrl,
        notifyUrl: body.notifyUrl,
      });

      return response; // Return the MoMo API response to the client
    },
    {
      body: t.Object({
        amount: t.Number(), // Payment amount
        orderInfo: t.String(), // Information about the order
        returnUrl: t.String(), // URL to return to after payment
        notifyUrl: t.String(), // URL for MoMo to notify about payment status
      }),
    }
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
