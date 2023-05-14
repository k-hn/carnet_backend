import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import UserFactory from "Database/factories/UserFactory";
import Route from "@ioc:Adonis/Core/Route";

test.group("Users login", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  // test("login succeeds for valid user details", async ({ client }) => {
  //   const user = await UserFactory
  //     .merge({ password: "passwordpassword" })
  //     .create();

  //   const loginPayload = {
  //     email: user.email,
  //     password: "passwordpassword"
  //   }

  //   const response = await client
  //     .post(Route.makeUrl("api.v1.login"))
  //     .json(loginPayload)

  //   response.assertStatus(200)
  // })

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
