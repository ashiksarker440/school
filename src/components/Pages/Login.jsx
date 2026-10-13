import { useState } from "react";
import { Navigate, Link } from "react-router";
import axios from "axios";
import "./Login.css";

const API = "http://localhost/school_management_api"; // PHP folder-er path

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.target);

    try {
      const res = await axios.post(`${API}/login.php`, formData);

      if (res.data.status == true) {
        localStorage.setItem("user", JSON.stringify(res.data.data));
        localStorage.setItem("access_token", res.data.jwt);
        let role = res.data.role

        if (role === "admin") window.location.href = "/dashboard";
        else if (role === "teacher") window.location.href = "/dashboard";
        else window.location.href = "/student/dashboard";
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      setError("Server error. Abar chesta korun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow-sm" style={{ maxWidth: 420, width: "100%" }}>
        <div className="card-body p-4">
          <h4 className="mb-1">School Management</h4>
          <p className="text-muted mb-4">Account-e login korun</p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-control" required />
            </div>
            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-3 mb-0">
            Account nei? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
