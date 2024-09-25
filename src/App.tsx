import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import MDEditor, { commands, EditorContext } from "@uiw/react-md-editor";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MarkdownEditor from "./Mark";

function App() {
  return (
    <Router>
      <div>
        {/* Навигационное меню
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav> */}

        {/* Определение маршрутов */}
        <Routes>
          <Route path="/" element={<MarkdownEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
