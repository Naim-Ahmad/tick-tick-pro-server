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
    required: true,
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
});

const Task = model("Task", taskSchema);
