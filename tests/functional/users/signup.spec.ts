import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import UserFactory from 'Database/factories/UserFactory'

test.group('Users signup', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test("signup successful for valid payload", async ({ client }) => {
    const userPayload = {
      username: "someUUusername",
      email: "sdusername@mail.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword"
    }

    const response = await client
      .post("/api/v1/signup")
      .json(userPayload)

    response.assertStatus(201);
  })

  test("signup fails when password is less than 10 characters", async ({ client }) => {
    const userPayload = {
      username: "someUUusername",
      email: "sdusername@mail.com",
      password: "short",
      password_confirmation: "short"
    }

    const response = await client
      .post("/api/v1/signup")
      .json(userPayload)

    response.assertStatus(422);
  })

  test("signup fails when passwords mismatch", async ({ client }) => {
    const userPayload = {
      username: "someUUusername",
      email: "sdusername@mail.com",
      password: "passwordpassword",
      password_confirmation: "mismatchedpassword"
    }

    const response = await client
      .post("/api/v1/signup")
      .json(userPayload)

    response.assertStatus(422);
  })

  test("signup succeeds even if username and email fields require trimming", async ({ client }) => {
    const userPayload = {
      username: "   someUUusername    ",
      email: "  sdusername@mail.com  ",
      password: "passwordpassword",
      password_confirmation: "passwordpassword"
    }

    const response = await client
      .post("/api/v1/signup")
      .json(userPayload)

    response.assertStatus(201)
    response.assertBodyContains({
      username: "someUUusername",
      email: "sdusername@mail.com"
    })
  })

  test("signup fails when email is not unique", async ({ client }) => {
    const existingUser = await UserFactory.create();
    const newUserPayload = {
      username: "someUsername",
      email: existingUser.email,
      password: "passwordpassword",
      password_confirmation: "passwordpassword"

    }

    const response = await client
      .post("/api/v1/signup")
      .json(newUserPayload)

    response.assertStatus(422);
  })

  test("signup succeeds even if email requires normalizing to lowercase", async ({ client }) => {
    const userPayload = {
      username: "someUUusername",
      email: "ME@maIL.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword"
    }

    const response = await client
      .post("/api/v1/signup")
      .json(userPayload)

    response.assertStatus(201);
    response.assertBodyContains({
      email: "me@mail.com",
    })
  })

  test("signup fails for invalid emails", async ({ client }) => {
    const userPayload = {
      username: "someUUusername",
      email: "sdusername.mail.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword"
    }

    const response = await client
      .post("/api/v1/signup")
      .json(userPayload)

    response.assertStatus(422);;
  })

  test("signup fails when username is not unique", async ({ client }) => {
    const existingUser = await UserFactory.create();
    const newUserPayload = {
      username: existingUser.username,
      email: "me@mail.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword"

    }

    const response = await client
      .post("/api/v1/signup")
      .json(newUserPayload)

    response.assertStatus(422);
  })

  test("signup fails when username is less than 2 characters", async ({ client }) => {
    const userPayload = {
      username: "s",
      email: "sdusername@mail.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword"
    }

    const response = await client
      .post("/api/v1/signup")
      .json(userPayload)

    response.assertStatus(422);
  })

  test("signup fails when username is more than 100 characters", async ({ client }) => {
    const userPayload = {
      username: "someUsernameUsernamesomeUsernameUsernamesomeUsernameUsernamesomeUsernameUsernamesomeUsernameUsernameq",
      email: "sdusername@mail.com",
      password: "passwordpassword",
      password_confirmation: "passwordpassword"
    }

    const response = await client
      .post("/api/v1/signup")
      .json(userPayload)

    response.assertStatus(422);
  })
})
