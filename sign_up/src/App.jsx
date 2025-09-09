import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ResetPassword from "./components/ResetPassword";
import MainApp from "./components/MainApp"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />   {/* tumhari signup/login wala code */}
        <Route path="/password/resetpassword/:id" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}
