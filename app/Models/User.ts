import { DateTime } from "luxon";
import Hash from "@ioc:Adonis/Core/Hash";
import {
  column,
  beforeSave,
  BaseModel,
  hasOne,
  HasOne,
  hasMany,
  HasMany,
} from "@ioc:Adonis/Lucid/Orm";
import EmailVerificationToken from "./EmailVerificationToken";
import PasswordResetToken from "./PasswordResetToken";
import Note from "./Note";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public username: string;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }

  @hasOne(() => EmailVerificationToken)
  public emailVerificationToken: HasOne<typeof EmailVerificationToken>;

  @hasOne(() => PasswordResetToken)
  public passwordResetToken: HasOne<typeof PasswordResetToken>;

  @hasMany(() => Note)
  public notes: HasMany<typeof Note>;
}
