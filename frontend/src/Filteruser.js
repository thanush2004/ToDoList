import { useState } from "react";

function Filteruser({ setButtonclick, setDisp }) {
  const [filter, setFilter] = useState("");
  const [filterdata, setFilterdata] = useState([]);
  const [notaskmsg, setNotaskmsg] = useState(false);

  async function getspecific(filter) {
    try {
      if (!filter.trim()) {
        alert("Please enter a username to filter.");
        return;
      }
      const response = await fetch(
        `http://localhost:5000/specifictask?username=${filter}`
      );
      if (response.ok) {
        const data = await response.json();
        setFilterdata(data.tasks || []);
        console.log("Filtered tasks:", data.tasks);
      } else {
        alert("Failed to filter tasks. Status: ");
      }
    } catch (error) {
      console.error("Error fetching specific user tasks:");
    }
  }

  const displayfiltertasks = () => {
    return filterdata.length > 0
      ? filterdata.map((task) => (
          <li key={`${task.id}-${task.chat_no}`} className="filtertask">
            <span className={task.cno === 1 ? "linethrough" : ""}>
              {task.task}
            </span>
          </li>
        ))
      : notaskmsg && <p>No tasks found for this user</p>;
  };

  return (
    <div className="filterbox">
      <input
        placeholder="Enter username to filter"
        onChange={(e) => setFilter(e.target.value)}
        value={filter}
        type="text"
        className="filterinput"
      />
      <button
        className="filter"
        onClick={() => {
          getspecific(filter);
          setNotaskmsg(true);
        }}
      >
        FIND
      </button>
      <button
        className="close"
        onClick={() => {
          setButtonclick(false);
          setDisp(true);
        }}
      >
        Close
      </button>
      <ul>{displayfiltertasks()}</ul>
    </div>
  );
}

export default Filteruser;
