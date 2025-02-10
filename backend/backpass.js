const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bodyparser = require("body-parser");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyparser.json());

const ADMINTASKS_FILE = "AdminTasks.json";
const CREDENTIALS_FILE = "credentials.json";
const USERS_FILE = "users.json";
const LOGINED_TASKS = "logined-tasks.json";

let otpstore = {};

function readFile(filepath) {
  try {
    if (!fs.existsSync(filepath)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(filepath, "utf-8"));
  } catch (error) {
    console.error(`Error reading file ${filepath}:`, error.message);
    throw new Error(`Could not read file: ${filepath}`);
  }
}

function writeFile(filepath, data) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing file ${filepath}:`, error.message);
    throw new Error(`Could not write file: ${filepath}`);
  }
}

// Route: Verify user
app.get("/verifying", async (req, res) => {
  const { username, password } = req.query;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  try {
    const entireDatabase = readFile(CREDENTIALS_FILE);
    const userFound = entireDatabase.find((u) => u.username === username);

    if (!userFound) {
      return res.status(401).json({ error: "Invalid username" });
    }
    console.log(password);
    const passwordMatch = await bcrypt.compare(password, userFound.password);
    console.log(passwordMatch); // showing false;
    if (passwordMatch) {
      return res
        .status(200)
        .json({ message: "Login successful", user: userFound });
    }

    return res.status(401).json({ error: "Invalid password" });
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(500).json({ error: "Server error while verifying credentials" });
  }
});

// Route: Add a new user

app.post("/addingUser", async (req, res) => {
  const { user, mail, pass } = req.body;

  if (!user || !mail || !pass) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const entireDatabase = readFile(USERS_FILE);
    const credentials = readFile(CREDENTIALS_FILE);

    const userExists = entireDatabase.some((u) => u.email === mail);

    if (userExists) {
      return res.status(400).json({ error: "This mail already exists" });
    }

    const usernameExists = entireDatabase.some((u) => u.username === user);

    if (usernameExists) {
      return res.status(400).json({ error: "This username already exists" });
    }

    const id =
      entireDatabase.length > 0
        ? entireDatabase[entireDatabase.length - 1].id + 1
        : 1;

    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUserDatabase = { id, username: user, email: mail };
    const newUserCredentials = {
      id,
      username: user,
      email: mail,
      password: hashedPassword,
    };

    entireDatabase.push(newUserDatabase);
    credentials.push(newUserCredentials);

    writeFile(USERS_FILE, entireDatabase);
    writeFile(CREDENTIALS_FILE, credentials);

    res.status(201).json({
      message: "User added successfully",
      user: newUserDatabase,
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Failed to add user" });
  }
});

// OTP generation function
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Route: Send OTP
app.post("/send-otp", (req, res) => {
  const { mail } = req.body;
  console.log(mail);

  if (!mail) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const credentials = readFile(CREDENTIALS_FILE);
    const userFound = credentials.find((user) => user.email === mail);

    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    otpstore[mail] = otp;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error("Email configuration missing");
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailContent = {
      from: process.env.EMAIL_USER,
      to: mail,
      subject: "Your OTP Code",
      text: `This is your OTP: ${otp}`,
    };

    transporter.sendMail(mailContent, (error) => {
      if (error) {
        console.error("Error sending mail:", error);
        return res.status(500).json({ message: "Failed to send OTP email" });
      }
      return res.status(200).json({ message: "OTP sent successfully" });
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Route: Verify OTP
app.post("/verify-otp", (req, res) => {
  const { mail, otp } = req.body;

  if (!mail || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  const storedOtp = otpstore[mail];
  if (!storedOtp) {
    return res
      .status(400)
      .json({ error: "OTP not sent to this email address" });
  }

  if (storedOtp === otp) {
    delete otpstore[mail];
    return res.status(200).json({ message: "OTP verified successfully" });
  }

  return res.status(400).json({ error: "Invalid OTP" });
});

app.post("/addtask", (req, res) => {
  const { task, username } = req.body;
  console.log(task, username);
  if (!task || !username) {
    return res.status(400).json({ error: "Task and username are required" });
  }

  try {
    const users = readFile(USERS_FILE);
    const userFound = users.find((u) => u.username === username);

    if (!userFound) {
      return res.status(404).json({ error: "User not found" });
    }
    const tasks = readFile(ADMINTASKS_FILE);
    const userTasks = tasks.filter((t) => t.id === userFound.id);
    console.log(userTasks);
    const newTaskId =
      userTasks.length > 0
        ? Math.max(...userTasks.map((t) => t.chat_no)) + 1
        : 1;
    const newTask = {
      id: userFound.id,
      task,
      chat_no: newTaskId,
      completed: false,
      deleted: false,
    };
    tasks.push(newTask);
    writeFile(ADMINTASKS_FILE, tasks);
    let addforuser = readFile(LOGINED_TASKS);
    let foundthatuser = addforuser.find((u) => u.id === userFound.id);
    if (foundthatuser) {
      foundthatuser.tasks.push(task);
      foundthatuser.chat_no.push(newTaskId);
      foundthatuser.deleted.push(false);
      foundthatuser.completed.push(false);
    } else {
      const addinguser = {
        id: userFound.id,
        tasks: [task],
        chat_no: [newTaskId],
        deleted: [false],
        completed: [false],
      };
      addforuser.push(addinguser);
    }

    writeFile(LOGINED_TASKS, addforuser);
    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
});

// Route: Get tasks for a user
app.get("/gettasks", (req, res) => {
  let { user_name } = req.query;
  try {
    const data = readFile(CREDENTIALS_FILE);
    let founddata = data.find((u) => u.username === user_name);
    const readdata = readFile(LOGINED_TASKS);
    let task = readdata.find((u) => u.id === founddata.id);
    res.status(200).json({ tasks: task });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});
app.delete("/deletetask", (req, res) => {
  let { id, chatno } = req.query;
  console.log(id, chatno);

  try {
    let data = readFile(LOGINED_TASKS);
    const userTasks = data.find((u) => u.id === parseInt(id));

    if (!userTasks) {
      return res.status(404).json({ error: "User not found" });
    }

    const taskIndex = userTasks.chat_no.findIndex(
      (taskChatNo) => taskChatNo === parseInt(chatno)
    );
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    userTasks.deleted[taskIndex] = true;
    writeFile(LOGINED_TASKS, data);
    let adminTasks = readFile(ADMINTASKS_FILE);
    const taskToDelete = adminTasks.find(
      (t) => t.id === parseInt(id) && t.chat_no === parseInt(chatno)
    );

    if (taskToDelete) {
      taskToDelete.deleted = true;
      writeFile(ADMINTASKS_FILE, adminTasks);
    }
    console.log("deleted");
    return res.status(200).json({ data });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Error deleting task" });
  }
});

app.put("/updatetask", (req, res) => {
  let { id, newTask, chat_no } = req.body;
  console.log(id, newTask, chat_no);

  try {
    let data = readFile(ADMINTASKS_FILE);
    const taskIndex = data.findIndex(
      (u) => u.id === id && u.chat_no === chat_no
    );
    data[taskIndex].task = newTask;
    writeFile(ADMINTASKS_FILE, data);

    let userdata = readFile(LOGINED_TASKS);
    let finduser = userdata.find((u) => u.id === id);
    finduser.tasks[chat_no - 1] = newTask;
    writeFile(LOGINED_TASKS, userdata);
    return res.status(200).json({ tasks: data });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Error updating task" });
  }
});

app.put("/completed", (req, res) => {
  const { USERID, CHATID } = req.body;

  try {
    const data = readFile(ADMINTASKS_FILE);

    let foundTask = data.find(
      (task) => task.id === USERID && task.chat_no === CHATID
    );

    if (!foundTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    if (foundTask.completed) {
      foundTask.completed = false;
    } else foundTask.completed = true;

    writeFile(ADMINTASKS_FILE, data);

    let readuser = readFile(LOGINED_TASKS);
    let found = readuser.find((u) => u.id === USERID);
    console.log(found);
    if (found.completed[CHATID - 1]) {
      found.completed[CHATID - 1] = false;
    } else found.completed[CHATID - 1] = true;
    writeFile(LOGINED_TASKS, readuser);
    res.status(200).json({ found });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ error: "Error marking task as completed" });
  }
});
app.get("/specifictask", (req, res) => {
  let { username } = req.query;
  console.log(username);

  try {
    let data = readFile(CREDENTIALS_FILE);
    let user = data.find((u) => u.username === username);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let alltasks = readFile(ADMINTASKS_FILE);
    let userTasks = alltasks.filter((task) => task.id === user.id);

    return res.status(200).json({ tasks: userTasks });
  } catch (error) {
    console.error("Error fetching specific tasks:", error);
    return res.status(500).json({ error: "Error fetching specific tasks" });
  }
});
app.get("/update", async (req, res) => {
  let { password, email } = req.query;
  console.log(password, email);
  try {
    let data = readFile(CREDENTIALS_FILE);
    let userfound = data.find((u) => u.email === email);
    const hashedPassword = await bcrypt.hash(password, 10);
    userfound.password = hashedPassword;
    writeFile(CREDENTIALS_FILE, data);
    return res.status(200).json("password updated succesfully");
  } catch (error) {
    return res.status(500).json("unable to update password");
  }
});
// Start the server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
