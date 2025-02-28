import React, { useState } from "react";
import "./Login.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Store last visited page before login
  const from = location.state?.from || "/";

  const handleSuccess = (data) => {
    // Store both user data and token
    localStorage.setItem("currentUser", JSON.stringify({
      ...data.user,
      token: data.token
    }));
    
    // Check for redirect URL
    const redirectUrl = localStorage.getItem("redirectAfterLogin");
    if (redirectUrl) {
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectUrl);
    } else {
      navigate("/");
    }

    toast.success("Login successful!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await newRequest.post("/auth/login", {
        username,
        password,
      });

      if (!res.data.token) {
        throw new Error("No authentication token received");
      }

      handleSuccess(res.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong!";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>Sign in</h1>
        <label>Username</label>
        <input
          name="username"
          type="text"
          placeholder="johndoe"
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>

        {error && <p className="error-message">{error}</p>}
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Login;
