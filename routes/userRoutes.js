import express from "express";
import {
  validate,
  userValidator,
} from "../middleware/userValidator/user-Validator.js";
import {
  signup,
  login,
  forgotPassword,
  logout,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/signup", userValidator, validate, signup);
userRouter.post("/login", userValidator, validate, login);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/logout", logout);

export default userRouter;
