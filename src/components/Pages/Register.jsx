import { useState } from "react";
import { BrowserRouter, Link } from "react-router";
import axios from "axios";
import "./Register.css";

const API = "http://localhost/school_management_api/"; // PHP folder-er path

export default function Register() {
    const navigate = BrowserRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
        role: "student",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (form.password.length < 6) {
            return setError("Password kompokkhe 6 character hote hobe");
        }
        if (form.password !== form.confirm_password) {
            return setError("Password match korche na");
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API}/register.php`, form);
            if (res.data.status === "success") {
                setSuccess("Registration successful! Login page-e jachhen...");
                setTimeout(() => navigate("/login"), 1500);
            } else {
                setError(res.data.message || "Registration failed");
            }
        } catch (err) {
            setError("Server error. Abar chesta korun.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
            <div className="card shadow-sm" style={{ maxWidth: 460, width: "100%" }}>
                <div className="card-body p-4">
                    <h4 className="mb-1">New Account</h4>
                    <p className="text-muted mb-4">School Management-e register korun</p>

                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    {success && <div className="alert alert-success py-2">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Full name</label>
                            <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="row">
                            <div className="col-md-7 mb-3">
                                <label className="form-label">Email</label>
                                <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                            </div>
                            <div className="col-md-5 mb-3">
                                <label className="form-label">Phone</label>
                                <input name="phone" className="form-control" value={form.phone} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Role</label>
                            <select name="role" className="form-select" value={form.role} onChange={handleChange} >
                                <option value="student">Student / Parent</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Password</label>
                                <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Confirm password</label>
                                <input type="password" name="confirm_password" className="form-control" value={form.confirm_password} onChange={handleChange} required />
                            </div>
                        </div>
                        <button className="btn btn-primary w-100" disabled={loading}>
                            {loading ? "Registering..." : "Register"}
                        </button>
                    </form>

                    <p className="text-center mt-3 mb-0">
                        Account ache? <Link to="/login">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
