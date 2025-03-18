import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login.jsx";
import Chat from "./components/Chat.jsx";
import { AuthProvider } from "./context/authContext.jsx";
import AuthRedirect from "./components/AuthRedirect";

const App = () => {
  return (
    <AuthRedirect>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  </AuthRedirect>
  
  );
};

export default App;