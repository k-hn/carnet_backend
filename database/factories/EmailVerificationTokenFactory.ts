import EmailVerificationToken from 'App/Models/EmailVerificationToken'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { DateTime } from 'luxon';

export default Factory.define(EmailVerificationToken, ({ faker }) => {
  return {
    verificationToken: faker.string.uuid(),
  }
})
  .state("verified", (emailVerificationToken) => {
    emailVerificationToken.isVerified = true;
    emailVerificationToken.verifiedAt = DateTime.now()
  })
  .build()
