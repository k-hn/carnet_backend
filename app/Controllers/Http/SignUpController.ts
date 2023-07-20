import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";
import SignUpValidator from "App/Validators/SignUpValidator";
import { v4 as uuidv4 } from "uuid";
import VerifyEmail from "App/Mailers/VerifyEmail";
import EmailVerificationToken from "App/Models/EmailVerificationToken";
import { DateTime } from "luxon";

export default class SignUpController {

  public async index({ request, response }: HttpContextContract) {
    const payload = await request.validate(SignUpValidator);

    // Create user creation and email verification transaction
    const user = await Database.transaction(async (trx) => {
      // Create user record
      const user = await User.create(payload, { client: trx });

      // Create email verification record
      await user.related("emailVerificationToken").create({
        verificationToken: uuidv4(),
      });

      return user;
    });

    await new VerifyEmail(user).sendLater();

    return response.created(user.serializeAttributes());
  }

  public async verifyEmail({ request, response }: HttpContextContract) {
    const token = request.param("token");

    const verificationToken = await EmailVerificationToken.findByOrFail("verificationToken", token);

    // If already verified, return response
    if (verificationToken.isVerified && verificationToken.verifiedAt !== null) {
      return response.ok({ verified: true });
    }
    await verificationToken.merge({
      isVerified: true,
      verifiedAt: DateTime.now()
    }).save();

    return response.ok({ verified: true });
  }

  public async resendVerficationEmail({ request, response }: HttpContextContract) {
    const email = request.param("email");

    const user = await User.findByOrFail("email", email);
    await user.load("emailVerificationToken");

    if (user.emailVerificationToken.isVerified) {
      return response.ok({
        message: "email address already verified"
      })
    } else {
      await new VerifyEmail(user).sendLater();

      return response.ok({
        message: "verification email resent"
      });
    }
  }
}
