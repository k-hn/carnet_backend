import { BaseMailer, MessageContract } from "@ioc:Adonis/Addons/Mail";
import User from "App/Models/User";
import Env from "@ioc:Adonis/Core/Env";

export default class VerifyEmail extends BaseMailer {
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
   * "VerifyEmail.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  public async prepare(message: MessageContract) {
    await this.user.load("emailVerificationToken");
    const frontendUrl = Env.get("FE_URL");
    const userEmailDetails = {
      username: this.user.username,
      url: `${frontendUrl}/verify/${this.user.emailVerificationToken.verificationToken}`,
    };

    message
      .from("no-reply@carnet.com", "Carnet")
      .to(this.user.email)
      .subject("Welcome Onboard the Carnet Train!")
      .htmlView("emails/welcome", { userDetails: userEmailDetails });
  }
}
