const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  userName: {
    type: String,
  },
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  userType: {
    type: String,
    default: "normal",
  },
});

const User = model("User", userSchema);

module.exports = User;
