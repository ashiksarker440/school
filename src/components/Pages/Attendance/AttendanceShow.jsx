import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const STATUS_BADGE = {
    Present: "bg-success",
    Absent: "bg-danger",
    Late: "bg-warning text-dark",
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

// status 1 / "present" => Present, 2 / "late" => Late, baki sob => Absent
const normalizeStatus = (s) => {
    const v = String(s ?? "").toLowerCase();
    if (v === "1" || v === "present") return "Present";
    if (v === "2" || v === "late") return "Late";
    return "Absent";
};

export default function AttendanceShow() {
    const { id } = useParams();

    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(`Attendance/single.php?id=${id}`);
                const data = response?.data?.data;

                // single.php array ba object jei format-e dik, duto-i cholbe
                const record = Array.isArray(data) ? data[0] : data;

                if (record) {
                    setAttendance(record);
                } else {
                    setError(response?.data?.message || "Attendance record paoa jayni.");
                }
            } catch (err) {
                console.error("Error fetching attendance:", err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load attendance details. Please check your API."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        } else {
            setError("Attendance ID is missing.");
            setLoading(false);
        }
    }, [id]);

    const status = attendance ? normalizeStatus(attendance.status) : "";

    const fields = attendance
        ? [
              { label: "Attendance ID", value: attendance.id },
              { label: "Date", value: formatDate(attendance.date) },
              { label: "Admission No", value: attendance.admission_no },
              { label: "Roll No", value: attendance.roll_no },
              { label: "Student Name", value: attendance.name },
              { label: "Class & Section", value: attendance.class_section },
          ]
        : [];

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="card shadow-sm">
                    {/* Header */}
                    <div className="card-header bg-white py-3">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <h5 className="mb-0">
                                <i className="bi bi-calendar-check me-2"></i>
                                Attendance Details
                            </h5>

                            <div className="d-flex gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => window.print()}
                                >
                                    <i className="bi bi-printer me-1"></i>
                                    Print
                                </button>

                                <Link to="/attendance" className="btn btn-outline-secondary">
                                    <i className="bi bi-arrow-left me-1"></i>
                                    Back to List
                                </Link>

                                {attendance && (
                                    <Link
                                        to={`/attendance/edit/${attendance.id}`}
                                        className="btn btn-warning"
                                    >
                                        <i className="bi bi-pencil-square me-1"></i>
                                        Edit
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 mb-0">Loading attendance details...</p>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                {error}
                            </div>
                        ) : attendance ? (
                            <>
                                <div className="row g-3">
                                    {fields.map((f) => (
                                        <div className="col-md-6" key={f.label}>
                                            <div className="border rounded p-3 h-100">
                                                <small className="text-muted">{f.label}</small>
                                                <h6 className="mt-2 mb-0">{f.value || "-"}</h6>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="col-md-6">
                                        <div className="border rounded p-3 h-100">
                                            <small className="text-muted">Attendance Status</small>
                                            <div className="mt-2">
                                                <span className={`badge ${STATUS_BADGE[status]}`}>
                                                    {status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <Link to="/attendance" className="btn btn-secondary">
                                        Close
                                    </Link>
                                    <Link
                                        to={`/attendance/edit/${attendance.id}`}
                                        className="btn btn-primary"
                                    >
                                        <i className="bi bi-pencil-square me-1"></i>
                                        Edit Attendance
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="alert alert-warning">
                                Attendance record not found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}