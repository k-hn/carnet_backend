import User from "App/Models/User";
import Factory from "@ioc:Adonis/Lucid/Factory";
import NoteFactory from "./NoteFactory";

export default Factory.define(User, ({ faker }) => {
  return {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
})
  .relation("notes", () => NoteFactory)
  .build();
