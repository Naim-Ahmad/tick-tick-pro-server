const { Schema, model } = require("mongoose");

const taskSchema = new Schema({
  taskTitle: {
    type: String,
    required: true,
  },
  taskDescription: {
    type: String,
  },
  taskDeadLine: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ["low", "moderate", "heigh"],
    default: "low",
  },
  createdBy: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "todo",
    enum: ["todo", "ongoing", "completed"],
  },
});

const Task = model("Task", taskSchema);

module.exports = Task;
