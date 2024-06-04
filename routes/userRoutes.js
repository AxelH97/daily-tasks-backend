import express from "express";
import {
  validate,
  userValidator,
} from "../middleware/userValidator/user-Validator.js";
import {
  signup,
  login,
  getUsers,
  forgotPassword,
  resetPassword,
  logout,
  deleteUser,
  uploadAvatarImg,
  getAuthUser,
  getUserById,
  getUserWithTasks,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/userValidator/authenticate.js";
import { tokenValid } from "../middleware/userValidator/tokenValid.js";
import upload from "../upload-Image.js";

const userRouter = express.Router();
userRouter.get("/:id", getUserWithTasks);

//userRouter.get("/:id", getUserById);
userRouter.get("/:id/tasks", authenticate, getUserWithTasks);
userRouter.post("/signup", userValidator, validate, signup);
userRouter.post("/login", userValidator, validate, login);
userRouter.get("/", getUsers);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:userId/:token", resetPassword);
userRouter.post("/logout", logout);
userRouter.delete("/:id", deleteUser);
userRouter.get("/token-valid", tokenValid);
userRouter.post("/auth-user-data").get(authenticate, getAuthUser);

userRouter.put(
  "/upload-avatar/:userId",
  upload.single("image"),
  uploadAvatarImg
);

export default userRouter;
