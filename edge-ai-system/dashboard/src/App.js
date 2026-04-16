import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import "../src/index.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <Routes>
          <Route path="/"      element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          {/* Extend: /nodes, /rl can be added here */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}