import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import User from 'App/Models/User'
import SignUpValidator from 'App/Validators/SignUpValidator'
import { v4 as uuidv4 } from 'uuid';

export default class SignUpController {
    public async index({ request, response }: HttpContextContract) {
        const payload = await request.validate(SignUpValidator)

        // Create user creation and email verification transaction
        const user = await Database.transaction(async (trx) => {
            // Create user record
            const user = await User.create(payload, { client: trx })

            // Create email verification record
            await user.related("emailVerificationToken").create({
                verificationToken: uuidv4(),
            })

            return user;
        })

        return response.created(user)
    }
}
