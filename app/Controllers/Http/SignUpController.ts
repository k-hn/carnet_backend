import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import SignUpValidator from 'App/Validators/SignUpValidator'

export default class SignUpController {
    public async index({ request, response }: HttpContextContract) {

        const payload = await request.validate(SignUpValidator)
        const user = await User.create(payload)
        return response.created(user)
    }
}
