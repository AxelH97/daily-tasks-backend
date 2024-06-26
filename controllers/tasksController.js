import Task from "../models/task.js";
import User from "../models/user.js";
import moment from "moment";
/* export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createTask = async (req, res) => {
  const { userId } = req.params;
  const { title, completed } = req.body;

  try {
    const task = new Task({
      title,
      completed,
      user: userId,
    });

    const savedTask = await task.save();

    await User.findByIdAndUpdate(
      userId,
      { $push: { todos: savedTask._id } },
      { new: true }
    );

    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ error: `Error creating task: ${error.message}` });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await Task.findByIdAndDelete(id);
    res.json({ message: "Task deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        status: "completed",
      },
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res
      .status(200)
      .json({ message: "Task marked as complete", task: updatedTask });
  } catch (error) {
    res.status(500).json({ error: "Something is wrong" });
  }
};

export const completedTasksDate = async (req, res) => {
  try {
    const { date } = req.params;
    const completedTasks = await Task.find({
      status: "completed",
      createdAt: {
        $gte: new Date(`${date}T00:00:00.000Z`),
        $lt: new Date(`${date}T23:59:59.999Z`),
      },
    }).exec();
    res.status(200).json({ completedTasks });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
}; */

export const addTodo = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { title, category } = req.body;
    const newTodo = new Task({
      title,
      category,
      dueDate: moment().format("YYYY-MM-DD"),
    });
    await newTodo.save();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user?.todos.push(newTodo._id);
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
export const getCompletedTodosByDate = async (req, res) => {
  try {
    const date = req.params.date;
    const completedTodos = await Todo.find({
      status: "completed",
      createdAt: {
        $gte: new Date(`${date}T00:00:00.000Z`), // Start of the selected date
        $lt: new Date(`${date}T23:59:59.999Z`), // End of the selected date
      },
    }).exec();
    res.status(200).json({ completedTodos });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
export const getTodoCount = async (req, res) => {
  try {
    const totalCompletedTodos = await Todo.countDocuments({
      status: "completed",
    }).exec();
    const totalPendingTodos = await Todo.countDocuments({
      status: "pending",
    }).exec();
    res.status(200).json({ totalCompletedTodos, totalPendingTodos });
  } catch (error) {
    res.status(500).json({ error: "Network error" });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const todoId = req.params.todoId;

    // Finde und lösche das Todo
    const deletedTodo = await Task.findByIdAndDelete(todoId);
    if (!deletedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    // Finde den Benutzer und entferne das Todo aus seiner Todo-Liste
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
