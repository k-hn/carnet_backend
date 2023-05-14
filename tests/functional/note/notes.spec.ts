import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";
import Route from "@ioc:Adonis/Core/Route";
import UserFactory from "Database/factories/UserFactory";

test.group("Notes CRUD:guests", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  // Guest tests
  test("create note fails for guests", async ({ client }) => {
    const newNote = {
      title: "Earworms",
      content: "dem never see me coming",
    };

    const response = await client.post(Route.makeUrl("api.v1.notes_create")).json(newNote);

    response.assertStatus(401);
  });

  test("show specific user note fails for guests", async ({ client }) => {
    const user = await UserFactory.with("notes", 1).create();
    const note = user.notes[0];

    const response = await client.get(Route.makeUrl("api.v1.notes_show", { id: note.id }));

    response.assertStatus(401);
  });

  test("show all user notes fails for guests", async ({ client }) => {
    await UserFactory.with("notes", 10).create();

    const response = await client.get(Route.makeUrl("api.v1.notes_index"));

    response.assertStatus(401);
  });

  test("update not fails for guests", async ({ client }) => {
    const user = await UserFactory.with("notes", 1).create();
    const note = user.notes[0];

    const updatedNotePayload = {
      title: "Updated Title",
      content: note.content,
    };

    const response = await client
      .put(Route.makeUrl("api.v1.notes_update", { id: note.id }))
      .json(updatedNotePayload);

    response.assertStatus(401);
  });

  test("delete note fails for guests", async ({ client }) => {
    const user = await UserFactory.with("notes", 1).create();
    const note = user.notes[0];

    const response = await client.delete(Route.makeUrl("api.v1.notes_destroy", { id: note.id }));

    response.assertStatus(401);
  });
});

test.group("Notes CRUD:logged-in users", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  // Logged-in user tests
  test("create note by user succeeds for valid details", async ({ client }) => {
    const user = await UserFactory.create();
    const newNote = {
      title: "Earworms",
      content: "dem never see me coming",
    };

    const response = await client
      .post(Route.makeUrl("api.v1.notes_create"))
      .json(newNote)
      .loginAs(user);

    response.assertStatus(201);
  });

  test("create note by user fails for empty titles", async ({ client }) => {
    const user = await UserFactory.create();
    const newNotePayload = {
      title: "",
      content: "dem never see me coming",
    };

    const response = await client
      .post(Route.makeUrl("api.v1.notes_create"))
      .json(newNotePayload)
      .loginAs(user);

    response.assertStatus(422);
  });

  test("show specific user note by user succeeds", async ({ client }) => {
    const user = await UserFactory.with("notes", 1).create();
    const note = user.notes[0];

    const response = await client
      .get(Route.makeUrl("api.v1.notes_show", { id: note.id }))
      .loginAs(user);

    response.assertStatus(200);
  });

  test("show all user notes by user succeeds for user", async ({ client }) => {
    const user = await UserFactory.with("notes", 10).create();

    const response = await client.get(Route.makeUrl("api.v1.notes_index")).loginAs(user);

    response.assertStatus(200);
  });

  test("update note by user succeeds for valid details", async ({ client }) => {
    const user = await UserFactory.with("notes", 1).create();
    const note = user.notes[0];
    const updatedNotePayload = {
      title: "Earworms",
      content: "dem never see me coming",
    };

    const response = await client
      .put(Route.makeUrl("api.v1.notes_update", { id: note.id }))
      .json(updatedNotePayload)
      .loginAs(user);

    response.assertStatus(200);
  });

  test("update note by user fails for empty title", async ({ client }) => {
    const user = await UserFactory.with("notes", 1).create();
    const note = user.notes[0];
    const updatedNotePayload = {
      title: "",
      content: "dem never see me coming",
    };

    const response = await client
      .put(Route.makeUrl("api.v1.notes_update", { id: note.id }))
      .json(updatedNotePayload)
      .loginAs(user);

    response.assertStatus(422);
  });

  test("update note by user fails for non-existent notes", async ({ client }) => {
    const user = await UserFactory.create();
    const updatedNotePayload = {
      title: "Earworms",
      content: "dem never see me coming",
    };

    const response = await client
      .put(Route.makeUrl("api.v1.notes_update", { id: 100 }))
      .json(updatedNotePayload)
      .loginAs(user);

    response.assertStatus(404);
  });

  test("delete note by user succeeds for exisiting note", async ({ client }) => {
    const user = await UserFactory.with("notes", 1).create();
    const note = user.notes[0];

    const response = await client
      .delete(Route.makeUrl("api.v1.notes_destroy", { id: note.id }))
      .loginAs(user);

    response.assertStatus(204);
  });

  test("delete note by user fails for non-existent note", async ({ client }) => {
    const user = await UserFactory.with("notes", 1).create();

    const response = await client
      .delete(Route.makeUrl("api.v1.notes_destroy", { id: 5 }))
      .loginAs(user);

    response.assertStatus(404);
  });
});

// TODO: test pagination
test.group("Notes CRUD: Pagination", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("pagination defaults are obeyed", async ({ assert, client }) => {
    const user = await UserFactory.with("notes", 30).create();

    const response = await client.get(Route.makeUrl("api.v1.notes_index")).loginAs(user);

    response.assertStatus(200);
    assert.lengthOf(response.body().data, 10);
    response.assertBodyContains({
      meta: {
        per_page: 10,
        total: 30,
        current_page: 1,
      },
    });
  });

  test("pagination query strings are obeyed", async ({ assert, client }) => {
    const user = await UserFactory.with("notes", 30).create();

    const response = await client
      .get(
        Route.makeUrl("api.v1.notes_index", {
          qs: {
            page: 2,
            limit: 5,
          },
        })
      )
      .loginAs(user);

    assert.lengthOf(response.body().data, 5);
    response.assertBodyContains({
      meta: {
        per_page: 5,
        total: 30,
        current_page: 2,
      },
    });
  });
});
