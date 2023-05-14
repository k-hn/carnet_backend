import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import NoteValidator from "App/Validators/NoteValidator";

export default class NotesController {
  public async create({ auth, request, response }: HttpContextContract) {
    const user = auth.user!;
    const newNotePayload = await request.validate(NoteValidator);

    const note = await user.related("notes").create(newNotePayload);

    return response.created(note);
  }

  public async index({ auth, request, response }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = request.input("limit", 10);

    const user = auth.user!;
    const notes = await user.related("notes").query().paginate(page, limit);

    return response.ok(notes);
  }

  public async show({ auth, request, response }: HttpContextContract) {
    const user = auth.user!;
    const id = request.param("id");

    const note = await user.related("notes").query().where("id", id).firstOrFail();

    return response.ok(note);
  }

  public async update({ auth, request, response }: HttpContextContract) {
    const user = auth.user!;
    const updatedNotePayload = await request.validate(NoteValidator);
    const id = request.param("id");

    const note = await user.related("notes").query().where("id", id).firstOrFail();
    const updatedNote = await note.merge(updatedNotePayload).save();

    return response.ok(updatedNote);
  }

  public async destroy({ auth, request, response }: HttpContextContract) {
    const user = auth.user!;
    const id = await request.param("id");

    const note = await user.related("notes").query().where("id", id).firstOrFail();

    await note.delete();
    return response.noContent();
  }
}
