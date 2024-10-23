import mongoose from "mongoose";

const { Schema, model } = mongoose;

const todoSchema = new Schema({
  taskTitle: {
    type: String,
    required: true,
    trim: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const todoModel = model("Todo", todoSchema);
