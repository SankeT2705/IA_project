import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";

function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="app-shell">
      <Navbar setPage={setPage} currentPage={page} />
      {page === "dashboard" ? <Dashboard /> : <Tasks />}
    </div>
  );
}

export default App;