import { useState, useMemo, useEffect } from "react";
import { NavLink, Link } from "react-router";
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

export default function ExamList() {
    const [exams, setExams] = useState([]);
    const [search, setSearch] = useState("");

    async function fetchData() {
        try {
            const response = await axios.get("Exam/index.php");
            setExams(response.data.data || []);
        } catch (error) {
            console.error("Error fetching exams:", error);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this exam?")) return;

        try {
            await axios.delete(`Exam/delete.php?id=${id}`);
            await fetchData();
        } catch (error) {
            console.error("Error deleting exam:", error);
        }
    };

    // Search
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return exams;
        return exams.filter((e) =>
            [e.exam_name, e.type, e.class_id, e.subject, e.date]
                .join(" ")
                .toLowerCase()
                .includes(q)
        );
    }, [exams, search]);

    return (
        <Layout>
            <div className="container-fluid py-4">
                {/* ===== Exam List + Search ===== */}
                <div className="card shadow-sm">
                    <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <h5 className="mb-0">Exam List</h5>
                        <NavLink className="btn btn-primary" to="./create">Add new</NavLink>
                        <input type="text" className="form-control w-auto" placeholder="Search exam..."
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Exam Name</th>
                                        <th>Type</th>
                                        <th>Class</th>
                                        <th>Subject</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Marks</th>
                                        <th>Status</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center text-muted py-4">No exams found.</td>
                                        </tr>
                                    ) : (
                                        filtered.map((e) => (
                                            <tr key={e.id}>
                                                <td>{e.exam_name}</td>
                                                <td>{e.type}</td>
                                                <td>{e.class_id}</td>
                                                <td>{e.subject}</td>
                                                <td>{formatDate(e.date)}</td>
                                                <td className="text-nowrap">{formatTime(e.time)}</td>
                                                <td>{e.marks}</td>
                                                <td>
                                                    {e.status == 1 ? (
                                                        <span className="badge bg-success">Active</span>
                                                    ) : (
                                                        <span className="badge bg-secondary">Inactive</span>
                                                    )}
                                                </td>
                                                <td className="text-end text-nowrap">
                                                    <Link className="btn btn-sm btn-info me-1" to={`/exam/${e.id}`}>View</Link>
                                                    <Link className="btn btn-sm btn-warning me-1" to={`/exam/edit/${e.id}`}>Edit</Link>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
