const { Router } = require("express");

const SessionsController = require("../controllers/SessionsController");
const sessionsController = new SessionsController();

const sessionRoutes = Router();

// *Rota da aplicação
sessionRoutes.post("/", sessionsController.create);

module.exports = sessionRoutes;
