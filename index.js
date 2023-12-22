require("dotenv").config();
const express = require("express");
const { default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

const UserModel = require("./model/UserModel");
const TaskModel = require("./model/TaskModel");
const verifyToken = require("./middlewares/verifyToken");

app.get("/", (req, res) => {
  res.status(200).send({ message: "tick tick pro server is running... :)" });
});

/******** auth related api ********/
app.post("/createToken", async (req, res) => {
  const body = req.body;
  const token = jwt.sign(body, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: false,
  });
});

/******** user related api *******/
app.post("/createUser", async (req, res) => {
  try {
    let index = new UserModel(req.body);
    index = await index.save();
    res.send(index);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/myTasks", verifyToken, async (req, res) => {
  try {
    const query = { createdBy: req.userInfo?.email };
    const indexs = await TaskModel.find(query);
    res.send(indexs);
  } catch (error) {
    res.status(500).send(error);
  }
});

async function main() {
  try {
    await (async function () {
      try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database Connected!");
      } catch (error) {
        console.log("Database Connection Error", error);
      }
    })();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
