import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import Route from '@ioc:Adonis/Core/Route'
import NoteFactory from 'Database/factories/NoteFactory'
import UserFactory from 'Database/factories/UserFactory'

test.group('Notes notes', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test.group("guests", () => {
    test("create note fails for guests", async ({ client }) => {
      const newNote = {
        title: "Earworms",
        content: "dem never see me coming"
      }

      const response = await client
        .post(Route.makeUrl("api.v1.notes_create"))
        .json(newNote)

      response.assertStatus(403)
    })

    test("show specific user note fails for guests", async ({ client }) => {
      const user = await UserFactory.with("notes", 1).create()
      const note = user.notes[0]

      const response = await client
        .get(Route.makeUrl("api.v1.notes_show", { id: note.id }))

      response.assertStatus(403);
    })

    test("show all user notes fails for guests", async ({ client }) => {
      await UserFactory.with("notes", 10).create();

      const response = await client
        .get(Route.makeUrl("api.v1.notes_index"))

      response.assertStatus(403);
    })

    test("update not fails for guests", async ({ client }) => {
      const user = await UserFactory.with("notes", 1).create()
      const note = user.notes[0]

      const updatedNotePayload = {
        title: "Updated Title",
        content: note.content
      }

      const response = await client
        .put(Route.makeUrl("api.v1.notes_update", { id: note.id }))
        .json(updatedNotePayload)

      response.assertStatus(403);
    })

    test("delete note fails for guests", async ({ client }) => {
      const user = await UserFactory.with("notes", 1).create()
      const note = user.notes[0]

      const response = await client
        .delete(Route.makeUrl("api.v1.notes_delete", { id: note.id }))

      response.assertStatus(403);
    })
  })


  test.group("logged-in users", () => {
    test("create note succeeds for valid details", async ({ client }) => {
      const user = await UserFactory.create()
      const newNote = {
        title: "Earworms",
        content: "dem never see me coming"
      }

      const response = await client
        .post(Route.makeUrl("api.v1.notes_create"))
        .json(newNote)
        .loginAs(user)

      response.assertStatus(201)
    })

    test("create note fails for empty titles", async ({ client }) => {
      const user = await UserFactory.create()
      const newNotePayload = {
        title: "",
        content: "dem never see me coming"
      }

      const response = await client
        .post(Route.makeUrl("api.v1.notes_create"))
        .json(newNotePayload)
        .loginAs(user)

      response.assertStatus(422);
    })

    test("show specific user note succeeds for user", async ({ client }) => {
      const user = await UserFactory.with("notes", 1).create()
      const note = user.notes[0]

      const response = await client
        .get(Route.makeUrl("api.v1.notes_show", { id: note.id }))
        .loginAs(user)

      response.assertStatus(200)
    })

    test("show all user notes succeeds for user", async ({ client }) => {
      const user = await UserFactory.with("notes", 10).create()

      const response = await client
        .get(Route.makeUrl("api.v1.notes_index"))
        .loginAs(user)

      response.assertStatus(200)
    })

    test("update note succeeds for valid details", async ({ client }) => {
      const user = await UserFactory.with("notes", 1).create()
      const note = user.notes[0]
      const updatedNotePayload = {
        title: "Earworms",
        content: "dem never see me coming"
      }

      const response = await client
        .put(Route.makeUrl("api.v1.notes_update", { id: note.id }))
        .json(updatedNotePayload)
        .loginAs(user)

      response.assertStatus(200)
    })

    test("update note fails for empty title", async ({ client }) => {
      const user = await UserFactory.with("notes", 1).create()
      const note = user.notes[0];
      const updatedNotePayload = {
        title: "",
        content: "dem never see me coming"
      }

      const response = await client
        .put(Route.makeUrl("api.v1.notes_update", { id: note.id }))
        .json(updatedNotePayload)
        .loginAs(user)

      response.assertStatus(422);
    })

    test("update note fails for non-existent notes", async ({ client }) => {
      const user = await UserFactory.create()
      const updatedNotePayload = {
        title: "Earworms",
        content: "dem never see me coming"
      }

      const response = await client
        .put(Route.makeUrl("api.v1.notes_update", { id: 100 }))
        .json(updatedNotePayload)
        .loginAs(user)

      response.assertStatus(404)
    })

    test("delete note succeeds for exisiting note", async ({ client }) => {
      const user = await UserFactory.with("notes", 1).create()
      const note = user.notes[0];

      const response = await client
        .delete(Route.makeUrl("api.v1.notes_delete", { id: note.id }))
        .loginAs(user)

      response.assertStatus(200);
    })

    test("delete note fails for non-existent note", async ({ client }) => {
      const user = await UserFactory.with("notes", 1).create()

      const response = await client
        .delete(Route.makeUrl("api.v1.notes_delete", { id: 100 }))
        .loginAs(user)

      response.assertStatus(404)
    })
  })

})
