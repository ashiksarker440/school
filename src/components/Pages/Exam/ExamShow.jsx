import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

// "14:30:00" -> "2:30 PM"
const formatTime = (t) => {
    if (!t) return "-";
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const todayStr = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
};

export default function ExamShow() {
    const [viewExam, setViewExam] = useState(null);
    const [loading, setLoading] = useState(true);

    let { id } = useParams();

    const fetchData = async () => {
        try {
            const response = await axios.get("Exam/single.php?id=" + id);
            const data = await response.data;
            setViewExam(data.data[0] || null);
        } catch (error) {
            console.error("Error fetching exam:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const daysLeft = viewExam
        ? Math.round((new Date(viewExam.date) - new Date(todayStr())) / 86400000)
        : 0;

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="row">
                    {/* ===== Exam Details ===== */}
                    <div className="col-lg-12">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Exam Details</h5>
                                <div className="d-flex gap-2">
                                    <button type="button" className="btn btn-sm btn-light" onClick={() => window.print()}>
                                        Print
                                    </button>
                                    <Link className="btn btn-sm btn-outline-light" to="/exam">Back</Link>
                                </div>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <p className="text-muted mb-0">Loading...</p>
                                ) : !viewExam ? (
                                    <p className="text-muted mb-0">Exam record paoa jayni.</p>
                                ) : (
                                    <div>
                                        <h5 className="mb-1">{viewExam.exam_name}</h5>
                                        <div className="mb-3">
                                            <span className="badge bg-primary me-1">{viewExam.type || "-"}</span>
                                            {viewExam.status == 1 ? (
                                                <span className="badge bg-success">Active</span>
                                            ) : (
                                                <span className="badge bg-secondary">Inactive</span>
                                            )}
                                        </div>
                                        <p className="mb-1"><strong>Class:</strong> {viewExam.class_id || "-"}</p>
                                        <p className="mb-1"><strong>Subject:</strong> {viewExam.subject || "-"}</p>
                                        <p className="mb-1"><strong>Date:</strong> {formatDate(viewExam.date)}</p>
                                        <p className="mb-1"><strong>Time:</strong> {formatTime(viewExam.time)}</p>
                                        <p className="mb-3"><strong>Marks:</strong> {viewExam.marks ?? "-"}</p>

                                        {daysLeft > 0 && (
                                            <div className="alert alert-info py-2 mb-0">Exam hote aro {daysLeft} din baki.</div>
                                        )}
                                        {daysLeft === 0 && (
                                            <div className="alert alert-warning py-2 mb-0">Exam Today!</div>
                                        )}
                                        {daysLeft < 0 && (
                                            <div className="alert alert-secondary py-2 mb-0">Exam shesh hoye geche.</div>
                                        )}
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
