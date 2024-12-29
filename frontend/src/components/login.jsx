import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";  // Import Link from react-router-dom
import axios from "../services/axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();  // Hook to handle navigation

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/login/", { username, password });
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      alert("Login successful!");

      // Redirect to the Add Expense page after login
      navigate("/add-expense");  // Change this to your add expense route
    } catch (error) {
      console.error("Error logging in:", error.response?.data || error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      
      {/* Link to Signup page */}
      <p>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </form>
  );
}

export default Login;
