import Task from "../models/task.js";
import User from "../models/user.js";
import moment from "moment";

export const addTodo =  async (req, res) => {
  try {
    const userId = req.params.userId;
    const { title, category, dueDate } = req.body; // Extract dueDate from req.body

    const newTodo = new Task({
      title,
      category,
      dueDate: moment(dueDate).format("YYYY-MM-DD"), // Use the dueDate from the request body
    });

    await newTodo.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.todos.push(newTodo._id);
    await user.save();

    return res
      .status(200)
      .json({ message: "Todo added successfully", todo: newTodo });
  } catch (error) {
    console.error("Error adding todo:", error);
    return res
      .status(500)
      .json({ message: "Todo not added", error: error.message });
  }
};
export const getUserTodos = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("todos");
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    res.status(200).json({ todos: user.todos });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
export const markTodoComplete = async (req, res) => {
  try {
    const todoId = req.params.todoId;
    const updatedTodo = await Task.findByIdAndUpdate(
      todoId,
      {
        status: "completed",
      },
      { new: true }
    );
    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res
      .status(200)
      .json({ message: "Todo marked as complete", todo: updatedTodo });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const updateTaskTime = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { elapsedTime },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCompletedTodosByDate = async (req, res) => {
  try {
    const date = req.params.date;
    const completedTodos = await Task.find({
      status: "completed",
      createdAt: {
        $gte: new Date(`${date}T00:00:00.000Z`),
        $lt: new Date(`${date}T23:59:59.999Z`),
      },
    }).exec();
    res.status(200).json({ completedTodos });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getTodoCount = async (req, res) => {
  try {
    const userId = req.params.userId;
    const totalCompletedTodos = await Task.countDocuments({
      status: "completed",
      userId: userId,
    }).exec();
    const totalPendingTodos = await Task.countDocuments({
      status: "pending",
      userId: userId,
    }).exec();
    res.status(200).json({ totalCompletedTodos, totalPendingTodos });
  } catch (error) {
    res.status(500).json({ error: "Network error" });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const todoId = req.params.todoId;

    const deletedTodo = await Task.findByIdAndDelete(todoId);
    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const user = await User.findOne({ todos: todoId });
    if (user) {
      user.todos.pull(todoId);
      await user.save();
    }

    return res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const editTodo = async (req, res) => {
  try {
    const todoId = req.params.todoId;
    const { title, category, dueDate } = req.body;
    const updatedTodo = await Task.findByIdAndUpdate(
      todoId,
      { title, category, dueDate },
      { new: true }
    );
    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    return res
      .status(200)
      .json({ message: "Todo updated successfully", todo: updatedTodo });
  } catch (error) {
    console.error("Error updating todo:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
