import { useState, useMemo, useEffect } from "react";
import { NavLink } from 'react-router'
export default function StudentList() {
    const [students, setStudents] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [viewStudent, setViewStudent] = useState(null);

    function fetchData() {
        fetch('http://localhost/school_management/Student/index.php')
            .then(response => response.json())
            .then(data => setStudents(data.data))
            .catch(error => console.error('Error fetching student:', error));
    }

    useEffect(() => {
        fetchData();
    }
        , []);

    //Edit
    const handleEdit = (student) => {
        setForm(student);
        setEditingId(student.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Delete
    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        setStudents((prev) => prev.filter((s) => s.id !== id));
        if (editingId === id) resetForm();
        if (viewStudent && viewStudent.id === id) setViewStudent(null);
    };

    // Search
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return students;
        return students.filter((s) =>
            [s.name, s.admissionNumber, s.classId, s.section, s.guardianName, s.mobile]
                .join(" ")
                .toLowerCase()
                .includes(q)
        );
    }, [students, search]);

    return (
        <div className="container-fluid py-4">


            {/* ===== Student List + Search ===== */}
            <div className="card shadow-sm">
                <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <h5 className="mb-0">Student List</h5>
                    <NavLink className="btn btn-primary" to="./create">Add new</NavLink>
                    <input type="text" className="form-control w-auto" placeholder="Search student..."
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Photo</th>
                                    <th>Admission No</th>
                                    <th>Name</th>
                                    <th>Class & Section</th>
                                    <th>Guardian</th>
                                    <th>Mobile</th>
                                    <th className="text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">No students found.</td>
                                    </tr>
                                ) : (
                                    filtered.map((s) => (
                                        <tr key={s.id}>
                                            <td>
                                                {s.photo ? (
                                                    <img src={`${import.meta.env.VITE_API_URL}${s.photo}`} alt={s.name} className="rounded-circle"
                                                        style={{ width: 40, height: 40, objectFit: "cover" }} />
                                                ) : "-"}
                                            </td>
                                            <td>{s.admission_number}</td>
                                            <td>{s.name}</td>
                                            <td>{s.classId} - {s.section}</td>
                                            <td>{s.guardian_relation || "-"}</td>
                                            <td>{s.guardian_phone || "-"}</td>
                                            <td className="text-end text-nowrap">
                                                <button className="btn btn-sm btn-info me-1" onClick={() => setViewStudent(s)}>View</button>
                                                <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(s)}>Edit</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
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
    );
}
