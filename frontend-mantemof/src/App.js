import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Tecnicos from "./pages/Tecnicos";

import Dashboard from "./pages/Dashboard";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tecnicos" element={<Tecnicos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;