// authRoutes.js
import express from "express";
import { verifyToken } from "../logic/middleware/auth.js";
import researcherRoutes from "./researchers.js";
import objectRoutes from "./objects.js";
import commandRoutes from "./commands.js";

const router = express.Router();

router.use("/researchers", verifyToken, researcherRoutes); //Letting the auth router know the researchers' router
router.use("/objects", verifyToken, objectRoutes); //Letting the auth router know the objects' router
router.use("/commands", verifyToken, commandRoutes); //Letting the auth router know the commands' router

export default router;
