import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthValidator from 'App/Validators/AuthValidator'

export default class AuthController {
    public async login({ auth, request, response }: HttpContextContract) {
        // Validate post body and authenticate
        const { email, password } = await request.validate(AuthValidator)
        const token = await auth
            .use("api")
            .attempt(email, password, {
                expiresIn: '1 days'
            })

        return response.ok(token.toJSON())
    }

    public async logout({ auth, response }: HttpContextContract) {
        // todo
        await auth.use("api").revoke()

        return response.ok({ revoked: true })
    }
}
