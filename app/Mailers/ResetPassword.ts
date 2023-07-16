import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User';
import Env from "@ioc:Adonis/Core/Env";

export default class ResetPassword extends BaseMailer {
  constructor(private user: User) {
    super();
  }
  /**
   * WANT TO USE A DIFFERENT MAILER?
   *
   * Uncomment the following line of code to use a different
   * mailer and chain the ".options" method to pass custom
   * options to the send method
   */
  // public mailer = this.mail.use()

  /**
   * The prepare method is invoked automatically when you run
   * "ResetPassword.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  public async prepare(message: MessageContract) {
    // Get token, add token to reset password link
    await this.user.load("passwordResetToken");
    const token = this.user.passwordResetToken.resetToken;
    const url = `${Env.get("FE_URL")}/reset-password/${token}`;
    const userEmailDetails = {
      username: this.user.email,
      url
    };

    message
      .from("no-reply@carnet.com", "Carnet")
      .to(this.user.email)
      .subject("Password Reset")
      .htmlView("emails/reset_password", { userDetails: userEmailDetails });
  }
}
