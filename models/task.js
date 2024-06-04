import { Schema, model } from "mongoose";

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  category: {
    type: String,
    required: true,
  },
  dueDate: {
    type: String,
    required: true,
  },
  // user: {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  // },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = model("Task", taskSchema);

export default Task;
