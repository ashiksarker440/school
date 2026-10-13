
import { useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import "./Register.css";

const API = "http://localhost/school_management_api";

export default function Register() {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const form = e.target;
        const formData = new FormData(form);

        const password = formData.get("password");
        const confirmPassword = formData.get("confirm_password");

        if (password !== confirmPassword) {
            setError("Password and Confirm Password do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(
                `${API}/register.php`,
                formData
            );

            if (res.data.status == true) {
                setSuccess(
                    res.data.message || "Registration successful!"
                );

                form.reset();
            } else {
                setError(
                    res.data.message || "Registration failed."
                );
            }
        } catch (err) {
            setError("Server error. Abar chesta korun.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container min-vh-100 d-flex align-items-center justify-content-center">
            <div
                className="card shadow-sm"
                style={{ maxWidth: 420, width: "100%" }}
            >
                <div className="card-body p-4">
                    <h4 className="mb-1">School Management</h4>

                    <p className="text-muted mb-4">
                        Create your account
                    </p>

                    {error && (
                        <div className="alert alert-danger py-2">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success py-2">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Enter password"
                                minLength={6}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                name="confirm_password"
                                className="form-control"
                                placeholder="Confirm password"
                                minLength={6}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                        >
                            {loading
                                ? "Registering..."
                                : "Register"}
                        </button>
                    </form>

                    <p className="text-center mt-3 mb-0">
                        Already have an account?{" "}
                        <Link to="/login">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
