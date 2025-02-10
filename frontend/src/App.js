import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Login from "./login";
import Signup from "./Signup";
import Fop from "./Fop";
import Enterotp from "./Enterotp";
import Changepass from "./changepassword";
import Taskshome from "./Taskshome";

function App2() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Taskshome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/fop" element={<Fop />} />
        <Route path="/enterotp" element={<Enterotp />} />
        <Route path="/changepass" element={<Changepass />} />
      </Routes>
    </HashRouter>
  );
}

export default App2;
