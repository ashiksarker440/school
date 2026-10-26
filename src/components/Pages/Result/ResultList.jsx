import { useState, useMemo, useEffect } from "react";
import { NavLink, Link } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

export default function ResultList() {
    const [results, setResults] = useState([]);
    const [search, setSearch] = useState("");

    async function fetchData() {
        try {
            const response = await axios.get("Result/index.php");
            setResults(response.data.data || []);
        } catch (error) {
            console.error("Error fetching results:", error);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this result?")) return;

        try {
            await axios.delete(`Result/delete.php?id=${id}`);
            await fetchData();
        } catch (error) {
            console.error("Error deleting result:", error);
        }
    };

    // Search
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return results;
        return results.filter((r) =>
            [r.admission_no, r.name, r.grade, r.result]
                .join(" ")
                .toLowerCase()
                .includes(q)
        );
    }, [results, search]);

    return (
        <Layout>
            <div className="container-fluid py-4">
                {/* ===== Result List + Search ===== */}
                <div className="card shadow-sm">
                    <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <h5 className="mb-0">Result List</h5>
                        <Link className="btn btn-success" to="/Result/sheet">Print Result Sheet</Link>
                        <NavLink className="btn btn-primary" to="./create">Add new</NavLink>
                        <input type="text" className="form-control w-auto" placeholder="Search result..."
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Admission No</th>
                                        <th>Name</th>
                                        <th className="text-center">Total</th>
                                        <th className="text-center">%</th>
                                        <th className="text-center">GPA</th>
                                        <th className="text-center">Grade</th>
                                        <th className="text-center">Result</th>
                                        <th className="text-center">Merit</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center text-muted py-4">No results found.</td>
                                        </tr>
                                    ) : (
                                        filtered.map((r) => (
                                            <tr key={r.id}>
                                                <td>{r.admission_no}</td>
                                                <td>{r.name}</td>
                                                <td className="text-center">{r.total}</td>
                                                <td className="text-center">
                                                    {r.percentage !== null && r.percentage !== "" ? `${Number(r.percentage).toFixed(1)}%` : "-"}
                                                </td>
                                                <td className="text-center fw-bold">{r.gpa}</td>
                                                <td className="text-center fw-bold">{r.grade}</td>
                                                <td className="text-center">
                                                    {r.result === "Pass" ? (
                                                        <span className="badge bg-success">Pass</span>
                                                    ) : (
                                                        <span className="badge bg-danger">Fail</span>
                                                    )}
                                                </td>
                                                <td className="text-center">{r.merit || "-"}</td>
                                                <td className="text-end text-nowrap">
                                                    <Link className="btn btn-sm btn-info me-1" to={`/result/${r.id}`}>View</Link>
                                                    <Link className="btn btn-sm btn-warning me-1" to={`/result/edit/${r.id}`}>Edit</Link>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>Delete</button>
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
