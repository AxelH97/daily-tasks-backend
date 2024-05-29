// routes/tasks.js
import {
  toDoValidator,
  validate,
} from "../middleware/todoValidator/todos-Validator.js";
import express from "express";
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/tasksController.js";

const router = express.Router();

router.get("", getAllTasks);

router.post("", toDoValidator, validate, createTask);

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);

export default router;
