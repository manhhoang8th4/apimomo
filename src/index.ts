import { Elysia, t } from "elysia";
import EmailUtil from "./EmailUtil";

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
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
