import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../services/emailService.js";
import { v2 as cloudinary } from "cloudinary";


 const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error finding user", error });
  }
};


const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("todos");
    console.log(users);
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Fetching users failed, please try again later.",
    });
  }
};

const getAuthUser = async (req, res) => {
  try {
    const userID = req.userID;
    console.log("🚀 ~ getAuthUser ~ userID:", userID);
    const foundUser = await User.findById(userID);
    const user = foundUser.toObject();
    delete user.password;
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // const fileImg = await cloudinary.uploader.upload(req.file.path);
    // const { secure_url, public_id } = fileImg;
    const newUser = new User({
     // avatarImg: { url: secure_url, id: public_id },
      username,
      email,
      password: hashedPassword,
      tasks: [],
    });
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    await newUser.save();
    newUser.password = undefined;
    res.status(200).json({ message: "New User added! 🐒", newUser });
  } catch (error) {
    console.error("Error signing up:", error);
    res
      .status(500)
      .json({ message: "Error signing up. Please try again later." });
  }
  
};

const login = async (req, res) => {
  console.log("req.body:", req.body);
  const { email, password } = req.body;
  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res
        .status(404)
        .json({ message: "user email or password are falase!" });
    }
    const passwordsMatched = await bcrypt.compare(password, foundUser.password);
    if (!passwordsMatched) {
      return res
        .status(401)
        .json({ message: "user email or password are falase!" });
    }
    const user = foundUser.toObject();
    delete user.password;
    const payload = { userID: user._id };
    const accesstoken = jwt.sign(payload, process.env.SECRETKEY, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKENS, {
      expiresIn: "1d",
    });

    res
      .cookie("accesstoken", accesstoken, {
        httpOnly: true,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
      })
      .status(200)
      .json({
        message: "login successfully",
        user,
        role: user.role,
        refreshToken,
        accesstoken,
      });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: error.message });
  }
};

const generateResetToken = async () => {
  const token = bcrypt.hash(Math.random().toString(36).substring(2), 10);
  return token;
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log("user:", user);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const resetToken = await generateResetToken(user);
    console.log("resetToken:", resetToken);
    await sendPasswordResetEmail(user.email, user._id, resetToken);

    res
      .status(200)
      .json({ message: "An email for resetting the password has been sent." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ message: "Error resetting password. Please try again later." });
  }
};

const resetPassword = async (req, res) => {
  const { userId, token } = req.params;
  const { newPassword, confirmPassword } = req.body;
  console.log("userId:", userId);
  console.log("newpassword:", newPassword);
  console.log("confirmPassword:", confirmPassword);

  if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Passwords do not match or are empty." });
  }

  try {
    jwt.verify(token, process.env.SECRETKEY, async (err, decoded) => {
      if (err) {
        console.error("Error verifying token:", err);
        return res.status(401).json({ message: "Invalid or expired token." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      user.password = hashedPassword;
      await user.save();
      console.log("Password reset successfully.");
      return res.status(200).json({ message: "Password reset successfully." });
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({
      message: "Error resetting password. Please try again later.",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token").status(200).json({ message: "logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadAvatarImg = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cloudinary.uploader.upload(req.file.path);

    const { secure_url, public_id } = result;

    const userToUpdate = await User.findByIdAndUpdate(
      id,
      { avatarImg: { url: secure_url, id: public_id } },
      { new: true }
    );

    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found!" });
    }
    const updatedUser = userToUpdate.toObject();
    delete updatedUser.password;
    res.json({ message: "User updated", updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



 const getUserWithTasks = async (req, res) => {
  const { id } = req.params;
console.log("sfsf",req.params)
  try {
    const user = await User.findById(id).populate("todos");
    console.log(user)
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: `Error fetching user: ${error.message}` });
  }
};

export {
  getAuthUser,
  signup,
  login,
  forgotPassword,
  resetPassword,
  logout,
  uploadAvatarImg,
  getUsers,
  getUserById,getUserWithTasks
};
