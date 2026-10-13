import { useState, useMemo, useEffect } from "react";
import { NavLink, Link } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const STATUS_BADGE = {
    Present: "bg-success",
    Absent: "bg-danger",
    Late: "bg-warning text-dark",
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

export default function AttendanceList() {
    const [attendance, setAttendance] = useState([]);
    const [search, setSearch] = useState("");

    async function fetchData() {
        try {
            const response = await axios.get("Attendance/index.php");
            setAttendance(response.data.data || []);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this attendance?")) return;

        try {
            await axios.delete(`Attendance/delete.php?id=${id}`);
            await fetchData();
        } catch (error) {
            console.error("Error deleting attendance:", error);
        }
    };

    // Search
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return attendance;
        return attendance.filter((a) =>
            [a.date, a.admission_no, a.name, a.class_section, a.status]
                .join(" ")
                .toLowerCase()
                .includes(q)
        );
    }, [attendance, search]);


    return (
        <Layout>
            <div className="container-fluid py-4">
                {/* ===== Attendance List + Search ===== */}
                <div className="card shadow-sm">
                    <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <h5 className="mb-0">Attendance List</h5>
                        <NavLink className="btn btn-primary" to="./create">Add new</NavLink>
                        <input type="text" className="form-control w-auto" placeholder="Search attendance..."
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Admission No</th>
                                        <th>Name</th>
                                        <th>Class & Section</th>
                                        <th>Status</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted py-4">No attendance found.</td>
                                        </tr>
                                    ) : (
                                        filtered.map((a) => (
                                            <tr key={a.id}>
                                                <td>{formatDate(a.date)}</td>
                                                <td>{a.admission_no}</td>
                                                <td>{a.name}</td>
                                                <td>{a.class_section}</td>
                                                <td>
                                                    {
                                                        a.status == 1 ? (
                                                            <span className={`badge ${STATUS_BADGE['present'] || "bg-secondary"}`}>
                                                                {"present" || "Not Marked"}
                                                            </span>
                                                        ) : (
                                                            <span className={`badge ${STATUS_BADGE['absent'] || "bg-secondary"}`}>
                                                                {'Absent' || "Not Marked"}
                                                            </span>
                                                        )
                                                    }

                                                </td>
                                                <td className="text-end text-nowrap">
                                                    <Link className="btn btn-sm btn-info me-1" to={`/attendance/${a.id}`}>View</Link>
                                                    <Link className="btn btn-sm btn-warning me-1" to={`/attendance/edit/${a.id}`}>Edit</Link>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
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
