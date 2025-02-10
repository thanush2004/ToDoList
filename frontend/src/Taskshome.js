import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./style.css";
import Addtask from "./Addtask";
import Filteruser from "./Filteruser";

function Taskshome() {
  const location = useLocation();
  const navigate = useNavigate();
  const USERNAME = location.state?.username || "Guest";

  const [vis, setVis] = useState(false);
  const [taskdata, setTaskdata] = useState({
    tasks: [],
    completed: [],
    deleted: [],
    id: null,
    chat_no: [],
  });
  const [disp, setDisp] = useState(true);
  const [buttonclick, setButtonclick] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/gettasks?user_name=${USERNAME}`
      );
      if (response.ok) {
        const exdata = await response.json();
        setTaskdata({
          tasks: Array.isArray(exdata.tasks.tasks) ? exdata.tasks.tasks : [],
          completed: Array.isArray(exdata.tasks.completed)
            ? exdata.tasks.completed
            : [],
          deleted: Array.isArray(exdata.tasks.deleted)
            ? exdata.tasks.deleted
            : [],
          id: exdata.tasks.id || null,
          chat_no: Array.isArray(exdata.tasks.chat_no)
            ? exdata.tasks.chat_no
            : [],
        });
      } else {
        console.error("Failed to fetch tasks. Status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateTaskData = (newTask) => {
    setTaskdata((prevTasks) => {
      if (!Array.isArray(prevTasks.tasks)) {
        console.error("Tasks is not an array");
        return prevTasks;
      }
      return {
        ...prevTasks,
        tasks: [...prevTasks.tasks, newTask],
        completed: [...prevTasks.completed, false],
      };
    });
  };

  async function Update(id, chatno) {
    const newTask = prompt("Enter the task to update:");
    if (!newTask) return;
    console.log(id, chatno);

    try {
      const response = await fetch("http://localhost:5000/updatetask", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, newTask, chat_no: chatno }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setTaskdata((prevState) => {
          const updatedTasks = prevState.tasks.map((task, index) =>
            prevState.chat_no[index] === chatno ? newTask : task
          );

          return {
            ...prevState,
            tasks: updatedTasks,
          };
        });
      } else {
        console.error("Failed to update task. Status:", response.status);
      }
    } catch (error) {
      console.error("Error updating task:", error.message);
    }
  }

  async function Completetask(id, chatid) {
    try {
      const response = await fetch("http://localhost:5000/completed", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ USERID: id, CHATID: chatid }),
      });

      if (!response.ok) {
        throw new Error(`Error updating task. Status: ${response.status}`);
      }

      const updatedData = await response.json();

      // Updating state with toggle functionality
      setTaskdata((prevTasks) => {
        if (!Array.isArray(prevTasks.completed)) {
          console.error("Completed is not an array");
          return prevTasks;
        }

        const index = prevTasks.chat_no.findIndex((chat) => chat === chatid);
        if (index === -1) return prevTasks;

        const updatedCompleted = [...prevTasks.completed];
        updatedCompleted[index] = !updatedCompleted[index];

        return {
          ...prevTasks,
          completed: updatedCompleted,
        };
      });

      alert("Task completion status updated");
    } catch (error) {
      console.error("Error updating task:", error.message);
      alert(`Error updating task: ${error.message}`);
    }
  }

  async function Delete(id, chatno) {
    console.log(id, chatno);
    try {
      const response = await fetch(
        `http://localhost:5000/deletetask?id=${id}&chatno=${chatno}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        const updatedData = await response.json();

        setTaskdata((prevState) => {
          const filteredTasks = prevState.tasks.filter(
            (_, index) => prevState.chat_no[index] !== chatno
          );
          const filteredCompleted = prevState.completed.filter(
            (_, index) => prevState.chat_no[index] !== chatno
          );
          const filteredDeleted = prevState.deleted.filter(
            (_, index) => prevState.chat_no[index] !== chatno
          );
          const filteredChatNo = prevState.chat_no.filter(
            (no) => no !== chatno
          );

          return {
            ...prevState,
            tasks: filteredTasks,
            completed: filteredCompleted,
            deleted: filteredDeleted,
            chat_no: filteredChatNo,
          };
        });

        alert("Deleted successfully");
      } else {
        console.error("Failed to delete task. Status:", response.status);
        alert("Failed to delete task.");
      }
    } catch (error) {
      console.error("Error deleting task:", error.message);
      alert("Error deleting task. Rolling back changes.");
    }
  }

  const renderTaskList = () => {
    if (
      !Array.isArray(taskdata.tasks) ||
      !Array.isArray(taskdata.chat_no) ||
      !Array.isArray(taskdata.deleted) ||
      !Array.isArray(taskdata.completed)
    ) {
      return <p>No tasks found</p>;
    }

    const combinedTasks = taskdata.tasks.map((task, index) => ({
      task,
      chat_no: taskdata.chat_no[index],
      completed: taskdata.completed[index],
      deleted: taskdata.deleted[index],
    }));

    const visibleTasks = combinedTasks.filter((item) => !item.deleted);

    if (visibleTasks.length === 0) {
      return <p>No tasks found</p>;
    }

    return (
      <ul>
        {visibleTasks.map(({ task, chat_no, completed }) => {
          const taskText = typeof task === "string" ? task : task?.task;

          if (!taskText) return null;

          return (
            <li key={chat_no} className="tasklists">
              <span className={completed ? "linethrough" : ""}>{taskText}</span>
              <div>
                <button
                  onClick={() => Update(taskdata.id, chat_no)}
                  className="update"
                >
                  Update
                </button>
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={() => Completetask(taskdata.id, chat_no)}
                  className="checkbox"
                />
                <button
                  onClick={() => Delete(taskdata.id, chat_no)}
                  className="delete"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="body">
      <div className="title">
        <div className="user">USER: {USERNAME}</div>
        <button className="logout" onClick={() => navigate("/")}>
          Logout
        </button>
      </div>
      <div className="container">
        <div className="left">
          <h2>Task List</h2>
        </div>
        <div>
          <button className="right" onClick={() => setVis(!vis)}>
            {vis ? "Hide Add Task" : "Add Task"}
          </button>
        </div>
        {vis && (
          <Addtask
            updateTaskData={updateTaskData}
            setVis={setVis}
            loginuser={USERNAME}
          />
        )}
      </div>
      <div>
        <button
          onClick={() => {
            setButtonclick(!buttonclick);
            setDisp(!disp);
          }}
          className="filterbutton"
        >
          {buttonclick ? "Close" : "Filter"}
        </button>
        {buttonclick && (
          <Filteruser setButtonclick={setButtonclick} setDisp={setDisp} />
        )}
      </div>
      <div>{disp && renderTaskList()}</div>
    </div>
  );
}

export default Taskshome;
