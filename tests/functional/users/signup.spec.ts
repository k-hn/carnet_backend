import Mail from "@ioc:Adonis/Addons/Mail";
import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import EmailVerificationToken from "App/Models/EmailVerificationToken";
import UserFactory from "Database/factories/UserFactory";

test.group("Users signup", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("signup successful for valid payload", async ({ client }) => {
    const userPayload = {
      username: "someUUusername",
      email: "sdusername@mail.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword",
    };

    const response = await client.post("/api/v1/signup").json(userPayload);

    response.assertStatus(201);
  });

  test("email verification email sent on successful signup", async ({ assert, client }) => {
    const mailer = Mail.fake();

    const userPayload = {
      username: "someUUusername",
      email: "sdusername@mail.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword",
    };

    await client.post("/api/v1/signup").json(userPayload);

    assert.isTrue(
      mailer.exists((mail) => {
        return mail.subject == "Welcome Onboard the Carnet Train!";
      })
    );

    Mail.restore();
  });

  test("signup fails when password is less than 10 characters", async ({ client }) => {
    const userPayload = {
      username: "someUUusername",
      email: "sdusername@mail.com",
      password: "short",
      password_confirmation: "short",
    };

    const response = await client.post("/api/v1/signup").json(userPayload);

    response.assertStatus(422);
  });

  test("signup fails when passwords mismatch", async ({ client }) => {
    const userPayload = {
      username: "someUUusername",
      email: "sdusername@mail.com",
      password: "passwordpassword",
      password_confirmation: "mismatchedpassword",
    };

    const response = await client.post("/api/v1/signup").json(userPayload);

    response.assertStatus(422);
  });

  test("signup succeeds even if username and email fields require trimming", async ({ client }) => {
    const userPayload = {
      username: "   someUUusername    ",
      email: "  sdusername@mail.com  ",
      password: "passwordpassword",
      password_confirmation: "passwordpassword",
    };

    const response = await client.post("/api/v1/signup").json(userPayload);

    response.assertStatus(201);
    response.assertBodyContains({
      username: "someUUusername",
      email: "sdusername@mail.com",
    });
  });

  test("signup fails when email is not unique", async ({ client }) => {
    const existingUser = await UserFactory.create();
    const newUserPayload = {
      username: "someUsername",
      email: existingUser.email,
      password: "passwordpassword",
      password_confirmation: "passwordpassword",
    };

    const response = await client.post("/api/v1/signup").json(newUserPayload);

    response.assertStatus(422);
  });

  test("signup succeeds even if email requires normalizing to lowercase", async ({ client }) => {
    const userPayload = {
      username: "someUUusername",
      email: "ME@maIL.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword",
    };

    const response = await client.post("/api/v1/signup").json(userPayload);

    response.assertStatus(201);
    response.assertBodyContains({
      email: "me@mail.com",
    });
  });

  test("signup fails for invalid emails", async ({ client }) => {
    const userPayload = {
      username: "someUUusername",
      email: "sdusername.mail.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword",
    };

    const response = await client.post("/api/v1/signup").json(userPayload);

    response.assertStatus(422);
  });

  test("signup fails when username is not unique", async ({ client }) => {
    const existingUser = await UserFactory.create();
    const newUserPayload = {
      username: existingUser.username,
      email: "me@mail.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword",
    };

    const response = await client.post("/api/v1/signup").json(newUserPayload);

    response.assertStatus(422);
  });

  test("signup fails when username is less than 2 characters", async ({ client }) => {
    const userPayload = {
      username: "s",
      email: "sdusername@mail.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword",
    };

    const response = await client.post("/api/v1/signup").json(userPayload);

    response.assertStatus(422);
  });

  test("signup fails when username is more than 100 characters", async ({ client }) => {
    const userPayload = {
      username:
        "someUsernameUsernamesomeUsernameUsernamesomeUsernameUsernamesomeUsernameUsernamesomeUsernameUsernameq",
      email: "sdusername@mail.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword",
    };

    const response = await client.post("/api/v1/signup").json(userPayload);

    response.assertStatus(422);
  });

  test("email verification token saved when signup is successful", async ({ assert, client }) => {
    const userPayload = {
      username: "someUUusername",
      email: "sdusername@mail.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword",
    };

    const response = await client.post("/api/v1/signup").json(userPayload);

    const emailToken = await EmailVerificationToken.findByOrFail("userId", response.body().id);

    response.assertStatus(201);
    assert.isTrue(response.body().id === emailToken.userId);
  });
});
