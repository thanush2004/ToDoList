import { useState } from "react";

function Addtask({ updateTaskData, setVis, loginuser }) {
  const [newtask, setNewtask] = useState("");
  async function addnewtask() {
    if (newtask.trim()) {
      try {
        const response = await fetch("http://localhost:5000/addtask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            task: newtask,
            username: loginuser,
          }),
        });

        if (response.ok) {
          const { task } = await response.json();
          updateTaskData(task);
          setVis(false);
          alert("Task added successfully");
        } else {
          const error = await response.json();
          alert(error.error || "Failed to add the task. Please try again.");
        }
      } catch (error) {
        console.error("Error adding task:", error);
        alert("Unable to add new task. Please try again later.");
      }
    } else {
      alert("Please enter a valid task before adding.");
    }
  }

  return (
    <div className="box">
      <label className="labels">Enter new Task:</label>
      <input
        className="inputbox"
        type="text"
        placeholder="Enter task..."
        onChange={(e) => setNewtask(e.target.value)}
        value={newtask}
      />
      <button className="add-button" onClick={addnewtask}>
        Add
      </button>
    </div>
  );
}

export default Addtask;
