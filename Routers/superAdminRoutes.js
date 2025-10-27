import express from "express";
import { getAllUsers, getAllStudents, deleteUser } from "../Controllers/superAdminController.js";

const superAdminRouter = express.Router();

superAdminRouter.get("/users", getAllUsers);
superAdminRouter.get("/students", getAllStudents);
superAdminRouter.delete("/users/:id", deleteUser);

export default superAdminRouter;
