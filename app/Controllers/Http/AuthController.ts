import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ResetPassword from "App/Mailers/ResetPassword";
import PasswordResetToken from "App/Models/PasswordResetToken";
import User from "App/Models/User";
import AuthValidator from "App/Validators/AuthValidator";
import ForgotPasswordValidator from "App/Validators/ForgotPasswordValidator";
import ResetPasswordValidator from "App/Validators/ResetPasswordValidator";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    // Validate post body and authenticate
    const { email, password } = await request.validate(AuthValidator);
    const token = await auth.use("api").attempt(email, password, {
      expiresIn: "1 days",
    });

    return response.ok(token.toJSON());
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use("api").revoke();

    return response.ok({ revoked: true });
  }

  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email } = await request.validate(ForgotPasswordValidator);
    const user = await User.findByOrFail("email", email);

    // Create forgot password token
    await user.related("passwordResetToken")
      .updateOrCreate({}, {
        resetToken: uuidv4(),
        expiresAt: DateTime.now().plus({ minutes: 15 })
      })

    // Send reset password email
    await new ResetPassword(user).sendLater();

    return response.ok({
      message: "reset password email sent",
    });
  }

  public async resetPassword({ request, response }: HttpContextContract) {
    const token = request.param("token");
    const { password } = await request.validate(ResetPasswordValidator);

    const passwordResetToken = await PasswordResetToken.findByOrFail("resetToken", token);

    // If token is expired, fail
    if (passwordResetToken.expiresAt.diffNow().toMillis() < 0) {
      return response.badRequest();
    }
    else {
      const user = await passwordResetToken.related("user").query().firstOrFail();
      await user.merge({ password }).save();
    }


    return response.noContent()
  }
}
