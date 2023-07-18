import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import UserFactory from "Database/factories/UserFactory";
import Route from "@ioc:Adonis/Core/Route";
import Mail from "@ioc:Adonis/Addons/Mail";

test.group("Auth: Users login", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("login succeeds for valid user details", async ({ client }) => {
    const user = await UserFactory
      .merge({ password: "passwordpassword" })
      .create();

    const loginPayload = {
      email: user.email,
      password: "passwordpassword"
    }

    const response = await client
      .post(Route.makeUrl("api.v1.login"))
      .json(loginPayload)

    response.assertStatus(200)
  })

  test("login fails for invalid user details", async ({ client }) => {
    const user = await UserFactory.create();

    const loginPayload = {
      email: user.email,
      password: "someWrongPassword",
    };

    const response = await client.post(Route.makeUrl("api.v1.login")).json(loginPayload);

    response.assertStatus(400);
  });

  test("logout succeeds for logged in user", async ({ client }) => {
    const user = await UserFactory.create();

    const response = await client.get(Route.makeUrl("api.v1.logout")).loginAs(user);

    response.assertStatus(200);
  });
});


test.group("Auth: Forgot Password", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  })

  test("forgot password request succeeds for existing user and mail sent", async ({ assert, client }) => {
    const user = await UserFactory.create();
    const mailer = Mail.fake();
    const payload = {
      email: user.email
    }

    const response = await client
      .post("/api/v1/forgot-password")
      .json(payload)

    response.assertStatus(200);
    response.assertBody({
      message: "reset password email sent"
    })

    assert.isTrue(
      mailer.exists((mail) => {
        return mail.subject == "Password Reset";
      })
    );

    Mail.restore();
  })

  test("forgot password request fails for non-existent user", async ({ client }) => {
    const email = "randomUser@mail.com";

    const response = await client
      .post("/api/v1/forgot-password")
      .json({ email })

    response.assertStatus(404);
  })

  test("reset password succeeds for correct input", async ({ client }) => {
    const user = await UserFactory.with("passwordResetToken").create();
    const token = await user.related("passwordResetToken").query().firstOrFail();

    const payload = {
      password: "newPassword",
      password_confirmation: "newPassword"
    }

    const response = await client
      .post(`/api/v1/reset-password/${token.resetToken}`)
      .json(payload)

    response.assertStatus(204)
  })

  test("reset password fails for expired token", async ({ client }) => {
    const user = await UserFactory
      .with("passwordResetToken", 1,
        (token) => token.apply("expired")
      ).create();
    const token = await user.related("passwordResetToken").query().firstOrFail();

    const payload = {
      password: "newPassword",
      password_confirmation: "newPassword"
    }

    const response = await client
      .post(`/api/v1/reset-password/${token.resetToken}`)
      .json(payload)

    response.assertStatus(400)
  })

})