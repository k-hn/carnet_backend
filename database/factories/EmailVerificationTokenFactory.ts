import EmailVerificationToken from 'App/Models/EmailVerificationToken'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { v4 as uuidv4 } from "uuid";
import { DateTime } from 'luxon';

export default Factory.define(EmailVerificationToken, () => {
  return {
    verificationToken: uuidv4(),
  }
})
  .state("verified", (emailVerificationToken) => {
    emailVerificationToken.isVerified = true;
    emailVerificationToken.verifiedAt = DateTime.now()
  })
  .build()
