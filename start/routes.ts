/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";
import Env from '@ioc:Adonis/Core/Env';

Route.group(() => {
  Route.group(() => {
    // Sign ups
    Route.post("/signup", "SignUpController.index").as("signup");
    Route.get("/verify/:token", "SignUpController.verifyEmail").as("verify_email");
    Route.get("/resend-verification-email/:email", "SignUpController.resendVerficationEmail").as("resend_verification_email");
    // Login
    Route.post("/login", "AuthController.login").as("login");
    Route.post("/forgot-password", "AuthController.forgotPassword").as("forgotPassword");
    Route.post("/reset-password/:token", "AuthController.resetPassword").as("resetPassword");
    // Logout
    Route.get("/logout", "AuthController.logout").as("logout");

    // Notes CRUD endpoints
    Route.group(() => {
      Route.post("/notes", "NotesController.create").as("notes_create");
      Route.get("/notes", "NotesController.index").as("notes_index");
      Route.get("/notes/:id", "NotesController.show").as("notes_show");
      Route.put("/notes/:id", "NotesController.update").as("notes_update");
      Route.delete("/notes/:id", "NotesController.destroy").as("notes_destroy");
    }).middleware("auth");

    // Swagger
    Route.get("/docs", async ({ view }) => {
      const specUrl = `/swagger.json`
      return view.render("swagger", { specUrl })
    }).as("swagger");
  })
    .prefix("v1")
    .as("v1");
})
  .prefix("/api")
  .as("api");
