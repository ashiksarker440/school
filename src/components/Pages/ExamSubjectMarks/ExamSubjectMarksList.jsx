import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB");
};

export default function ExamSubjectMarksList() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    const fetchRecords = async () => {
        try {
            const response = await axios.get("ExamSubjectMarks/index.php");
            if (!response.data.status) {
                return { records: [], error: response.data.message || "Could not load exam subject marks." };
            }
            return { records: response.data.data || [], error: "" };
        } catch (requestError) {
            console.error("Error fetching exam subject marks:", requestError);
            return {
                records: [],
                error: requestError.response?.data?.message || "Could not load exam subject marks.",
            };
        }
    };

    useEffect(() => {
        let active = true;
        fetchRecords().then((result) => {
            if (!active) return;
            setRecords(result.records);
            setError(result.error);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this exam subject marks record?")) return;

        setError("");
        try {
            const response = await axios.delete(`ExamSubjectMarks/delete.php?id=${encodeURIComponent(id)}`);
            if (!response.data.status) {
                setError(response.data.message || "Record could not be deleted.");
                return;
            }
            const result = await fetchRecords();
            setRecords(result.records);
            setError(result.error);
        } catch (requestError) {
            console.error("Error deleting exam subject marks:", requestError);
            setError(requestError.response?.data?.message || "Record could not be deleted.");
        }
    };

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return records;
        return records.filter((record) =>
            [
                record.id,
                record.exam_id,
                record.class_id,
                record.class_name,
                record.subject_id,
                record.subject_name,
                record.exam_name,
            ].join(" ").toLowerCase().includes(query)
        );
    }, [records, search]);

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">Exam Subject Marks</h4>
                    <NavLink className="btn btn-primary" to="./create">Add new</NavLink>
                </div>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Search by exam, class, subject, or ID..."
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                            </div>
                            <div className="col-md-6 text-md-end text-muted align-self-center">
                                {filtered.length} record{filtered.length === 1 ? "" : "s"}
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Exam</th>
                                        <th>Class</th>
                                        <th>Subject</th>
                                        <th>Full Marks</th>
                                        <th>Pass Marks</th>
                                        <th>Exam Date</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="8" className="text-center py-4">Loading...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan="8" className="text-center text-muted py-4">No records found.</td></tr>
                                    ) : filtered.map((record) => (
                                        <tr key={record.id}>
                                            <td>{record.id}</td>
                                            <td>{record.exam_name ? `${record.exam_name} (#${record.exam_id})` : record.exam_id}</td>
                                            <td>{record.class_name || `Class #${record.class_id}`}</td>
                                            <td>{record.subject_name || `Subject #${record.subject_id}`}</td>
                                            <td>{record.full_marks}</td>
                                            <td>{record.pass_marks}</td>
                                            <td className="text-nowrap">{formatDate(record.exam_date)}</td>
                                            <td className="text-end text-nowrap">
                                                <Link className="btn btn-sm btn-info me-1" to={`/exam-subject-marks/${record.id}`}>View</Link>
                                                <Link className="btn btn-sm btn-warning me-1" to={`/exam-subject-marks/edit/${record.id}`}>Edit</Link>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(record.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
