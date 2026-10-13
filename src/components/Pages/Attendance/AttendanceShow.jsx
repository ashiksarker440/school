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

export default function AttendanceShow() {
    const [viewAttendance, setViewAttendance] = useState(null);
    const [loading, setLoading] = useState(true);

    let { id } = useParams();

    const fetchData = async () => {
        try {
            const response = await axios.get("Attendance/single.php?id=" + id);
            const data = await response.data;
            setViewAttendance(data.data[0] || null);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="row">
                    {/* ===== Attendance Details ===== */}
                    <div className="col-lg-12">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Attendance Details</h5>
                                <div className="d-flex gap-2">
                                    <button type="button" className="btn btn-sm btn-light" onClick={() => window.print()}>
                                        Print
                                    </button>
                                    <Link className="btn btn-sm btn-outline-light" to="/attendance">Back</Link>
                                </div>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <p className="text-muted mb-0">Loading...</p>
                                ) : !viewAttendance ? (
                                    <p className="text-muted mb-0">Attendance record paoa jayni.</p>
                                ) : (
                                    <div>
                                        <h5 className="mb-3">{viewAttendance.name}</h5>
                                        <p className="mb-1"><strong>Date:</strong> {formatDate(viewAttendance.date)}</p>
                                        <p className="mb-1"><strong>Admission No:</strong> {viewAttendance.admission_no}</p>
                                        <p className="mb-1"><strong>Class & Section:</strong> {viewAttendance.class_section || "-"}</p>
                                        <p className="mb-0">
                                            <strong>Status:</strong>{" "}
                                            <span className={`badge ${STATUS_BADGE[viewAttendance.status] || "bg-secondary"}`}>
                                                {viewAttendance.status || "Not Marked"}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
