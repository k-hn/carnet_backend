import Mail from "@ioc:Adonis/Addons/Mail";
import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import EmailVerificationToken from "App/Models/EmailVerificationToken";
import UserFactory from "Database/factories/UserFactory";
import { v4 as uuidv4 } from "uuid";

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

test.group("SignUp: Email verification", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("verification using existing tokens succeeds", async ({ client }) => {
    const user = await UserFactory.with("emailVerificationToken").create();
    const verificationToken = user.emailVerificationToken.verificationToken;

    const response = await client
      .get(`/api/v1/verify/${verificationToken}`)

    response.assertStatus(200)
    response.assertBody({
      verified: true
    })
  })

  test("verification using non-existent token fails", async ({ client }) => {
    const badUUID = uuidv4();
    await UserFactory.with("emailVerificationToken").createMany(5);

    const response = await client
      .get(`/api/v1/verify/${badUUID}`);

    response.assertStatus(404);
  })

  test("verifying already verified token succeeds", async ({ client }) => {
    const user = await UserFactory.with(
      "emailVerificationToken",
      1,
      (token) => token.apply("verified")
    ).create();

    const response = await client
      .get(`api/v1/verify/${user.emailVerificationToken.verificationToken}`)

    response.assertStatus(200)
    response.assertBody({
      verified: true
    })
  })

  test("verification mail re-sent when email not verified", async ({ assert, client }) => {
    const mailer = Mail.fake();

    const user = await UserFactory.with("emailVerificationToken", 1).create();

    const response = await client
      .get(`/api/v1/resend-verification-email/${user.email}`)

    response.assertStatus(200);
    response.assertBody({
      message: "verification email resent"
    })

    assert.isTrue(
      mailer.exists((mail) => {
        return mail.subject == "Welcome Onboard the Carnet Train!";
      })
    );

    Mail.restore();
  })

  test("verification mail not re-sent when email is already verified", async ({ assert, client }) => {
    const mailer = Mail.fake();

    const user = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .create();

    const response = await client
      .get(`/api/v1/resend-verification-email/${user.email}`)

    response.assertStatus(200);

    response.assertBody({
      message: "email address already verified"
    })

    assert.isFalse(
      mailer.exists((mail) => {
        return mail.subject == "Welcome Onboard the Carnet Train!";
      })
    );

    Mail.restore();
  })
})