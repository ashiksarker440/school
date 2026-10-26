import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(String(value).replace(" ", "T"));
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-GB");
};

export default function ExamList() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    const fetchData = async () => {
        try {
            const response = await axios.get("Exam/index.php");
            if (!response.data.status) {
                return { exams: [], error: response.data.message || "Could not load exams." };
            }
            return { exams: response.data.data || [], error: "" };
        } catch (requestError) {
            console.error("Error fetching exams:", requestError);
            return { exams: [], error: requestError.response?.data?.message || "Could not load exams." };
        }
    };

    useEffect(() => {
        let active = true;
        fetchData().then((data) => {
            if (!active) return;
            setExams(data.exams);
            setError(data.error);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this exam?")) return;

        setError("");
        try {
            const response = await axios.delete(`Exam/delete.php?id=${encodeURIComponent(id)}`);
            if (!response.data.status) {
                setError(response.data.message || "Exam could not be deleted.");
                return;
            }
            const data = await fetchData();
            setExams(data.exams);
            setError(data.error);
        } catch (requestError) {
            console.error("Error deleting exam:", requestError);
            setError(requestError.response?.data?.message || "Exam could not be deleted.");
        }
    };

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return exams;
        return exams.filter((exam) =>
            [exam.id, exam.exam_name, exam.type].join(" ").toLowerCase().includes(query)
        );
    }, [exams, search]);

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">Exam List</h4>
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
                                    placeholder="Search by ID, exam name, or type..."
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                            </div>
                            <div className="col-md-6 text-md-end text-muted align-self-center">
                                {filtered.length} exam{filtered.length === 1 ? "" : "s"}
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Exam Name</th>
                                        <th>Type</th>
                                        <th>Created At</th>
                                        <th>Deleted At</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center text-muted py-4">No exams found.</td></tr>
                                    ) : filtered.map((exam) => (
                                        <tr key={exam.id}>
                                            <td>{exam.id}</td>
                                            <td>{exam.exam_name}</td>
                                            <td>{exam.type || "-"}</td>
                                            <td className="text-nowrap">{formatDateTime(exam.created_at)}</td>
                                            <td className="text-nowrap">{formatDateTime(exam.deleted_at)}</td>
                                            <td className="text-end text-nowrap">
                                                <Link className="btn btn-sm btn-info me-1" to={`/exam/${exam.id}`}>View</Link>
                                                <Link className="btn btn-sm btn-warning me-1" to={`/exam/edit/${exam.id}`}>Edit</Link>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(exam.id)}
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
