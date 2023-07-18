import User from "App/Models/User";
import Factory from "@ioc:Adonis/Lucid/Factory";
import NoteFactory from "./NoteFactory";
import EmailVerificationTokenFactory from "./EmailVerificationTokenFactory";
import PasswordResetTokenFactory from "./PasswordResetTokenFactory";

export default Factory.define(User, ({ faker }) => {
  return {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
})
  .relation("notes", () => NoteFactory)
  .relation("emailVerificationToken", () => EmailVerificationTokenFactory)
  .relation("passwordResetToken", () => PasswordResetTokenFactory)
  .build();
