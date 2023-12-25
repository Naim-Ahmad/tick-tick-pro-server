require("dotenv").config();
const express = require("express");
const { default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const port = process.env.PORT || 5000;

app.use([
  express.json(),
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://tick-tick-pro.web.app",
      "https://tick-tick-pro.firebaseapp.com",
    ],
    credentials: true,
  }),
  cookieParser(),
  morgan("dev"),
]);

const UserModel = require("./model/UserModel");
const TaskModel = require("./model/TaskModel");
const verifyToken = require("./middlewares/verifyToken");

app.get("/", (req, res) => {
  res.status(200).send({ message: "tick tick pro server is running... :)" });
});

/******** auth related api ********/
app.post("/createToken", async (req, res) => {
  const body = req.body;

  if (!body.email) {
    return res.status(400).send({ message: "Please Provide email!" });
  }

  const token = jwt.sign(body, process.env.JWT_SECRET, { expiresIn: "1h" });

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "development" ? "strict" : "none",
    })
    .send({ message: "Token Created!" });
});

app.delete("/deleteToken", (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
    })
    .send({ message: "Token Deleted!" });
});

/******** user related api *******/
app.post("/createUser", async (req, res) => {
  const body = req.body;

  if (!body.userEmail) {
    return res.status(400).send({ message: "Please Provide email!" });
  }

  const query = { userEmail: body?.userEmail };

  const userData = await UserModel.findOne(query);

  if (userData?.userEmail) {
    return res.send({ message: "user already exists" });
  }

  try {
    let index = new UserModel(req.body);
    index = await index.save();
    res.send(index);
  } catch (error) {
    res.status(500).send(error);
  }
});

/******** task related route ********/

app.post("/createTask", verifyToken, async (req, res) => {
  console.log(req.userInfo);
  try {
    const body = req.body;
    let index = new TaskModel({
      ...body,
      createdBy: req?.userInfo?.email,
    });
    index = await index.save();
    res.send(index);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

app.get("/myTasks", verifyToken, async (req, res) => {
  try {
    let query = { createdBy: req.userInfo?.email };
    if (req.query?.status) {
      query = {
        $and: [
          { createdBy: req.userInfo?.email },
          { status: req.query?.status },
        ],
      };
    }
    const indexs = await TaskModel.find(query);
    res.send(indexs);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/myTask/:id", async (req, res) => {
  try {
    const data = await TaskModel.findById(req.params.id);
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete("/deleteTask/:id", async (req, res) => {
  try {
    const index = await TaskModel.findByIdAndDelete(req.params.id);
    res.send(index);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.put("/updateTask/:id", async (req, res) => {
  try {
    const index = await TaskModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(index);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

async function main() {
  try {
    await (async function () {
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          dbName: "tickTickPro",
        });
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
