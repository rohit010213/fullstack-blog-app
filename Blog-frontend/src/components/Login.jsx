import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "../css/Login.css";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const response = await axiosInstance.post("/users/login", {
        username,
        password,
      });

      console.log("Full Response:", response);
      console.log("Response Data:", response.data);

      if (response.data?.success) {
        const { accessToken } = response.data?.data || {};

        if (accessToken) {
          Cookies.set("accessToken", accessToken);
          toast.success("Login Successfully");
          navigate("/dashboard");
        } else {
          console.error("Login failed: No access token received");
          setError("Login failed: No access token received.");
          toast.error("Login failed: No access token received.");
        }
      } else {
        console.error("Login failed:", response.data?.message || "Unknown error");
        setError(response.data?.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || "Use correct Username and Password.");
      toast.error("Please use correct Username and Password");
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Login</button>
      </form>
      <button onClick={() => navigate("/register")} className="register-button">
        Register
      </button>
    </div>
  );
};

export default Login;
