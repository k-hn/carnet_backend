import PasswordResetTokenFactory from 'App/Models/PasswordResetToken'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { DateTime } from 'luxon'

export default Factory.define(PasswordResetTokenFactory, ({ faker }) => {
  return {
    resetToken: faker.string.uuid(),
    expiresAt: DateTime.now().plus({ minutes: 15 })
  }
})
  .state("expired", (token) => {
    token.createdAt = DateTime.now().minus({ minutes: 16 })
    token.expiresAt = DateTime.now().minus({ minutes: 1 })
  })
  .build()
