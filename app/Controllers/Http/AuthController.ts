import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ResetPassword from "App/Mailers/ResetPassword";
import User from "App/Models/User";
import AuthValidator from "App/Validators/AuthValidator";
import ForgotPasswordValidator from "App/Validators/ForgotPasswordValidator";
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
    // todo
    await auth.use("api").revoke();

    return response.ok({ revoked: true });
  }

  // TODO: reset password
  public async forgotPassword({ request, response }: HttpContextContract) {
    const { email } = await request.validate(ForgotPasswordValidator);
    const user = await User.findByOrFail("email", email);

    // Create forgot password token
    user.related("passwordResetToken").create({
      resetToken: uuidv4()
    });

    // Send reset password email
    await new ResetPassword(user).sendLater();

    return response.ok({
      message: "reset password email sent"
    });
  }
}
