const { Router } = require("express");
const fs = require("fs");
const TASKS_FILE = "Tasks.json";
const router = Router();

function writetasks(tasks) {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error("Error writing tasks file:", error);
    throw new Error("Could not write to tasks file");
  }
}

function readtasks() {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      console.warn("Tasks file not found. Returning an empty array.");
      return [];
    }
    const data = JSON.parse(fs.readFileSync(TASKS_FILE, "utf-8"));
    return data || "[]";
  } catch (error) {
    console.error("Error reading tasks file:", error.message);
    throw new Error("Could not read tasks file");
  }
}
router.get("/gettasks", (req, res) => {
  try {
    const tasks = readtasks();
    console.log(tasks);
    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error reading tasks:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/addtask", async (req, res) => {
  try {
    const { task, loginuser } = req.body;
    if (!task) return res.status(400).json({ error: "Missing task parameter" });

    const tasks = await readtasks();
    const newId =
      tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    tasks.push({ id: newId, task, cno: 0, username: loginuser || "Guest" });

    await writetasks(tasks);
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/updatetask", (req, res) => {
  try {
    const { id, newTask } = req.body;

    if (!id || !newTask) {
      return res.status(400).json({ error: "Missing id or newTask parameter" });
    }

    const tasks = readtasks();
    const taskIndex = tasks.findIndex((task) => task.id === parseInt(id, 10));

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    tasks[taskIndex].task = newTask;
    writetasks(tasks);

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/deletetask", (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing required 'id' parameter" });
  }
  try {
    const tasks = readtasks();
    const taskIndex = tasks.findIndex((task) => task.id === parseInt(id, 10));

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    tasks.splice(taskIndex, 1);
    writetasks(tasks);
    console.log("Task deleted successfully");
    return res.status(200).json({ tasks });
  } catch (err) {
    console.error("Error deleting task:", err.message);
    return res
      .status(500)
      .json({ error: "Internal server error while deleting task" });
  }
});

router.put("/completed", (req, res) => {
  let { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing 'id' parameter" });
  }

  try {
    let data = readtasks();
    id = parseInt(id, 10);

    const taskIndex = data.findIndex((u) => u.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    data[taskIndex].cno = 1;
    writetasks(data);

    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error while completing task" });
  }
});

module.exports = router;
