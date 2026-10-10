import { useState, useMemo, useEffect } from "react";
import { NavLink } from 'react-router'

export default function TeacherManagement() {
    const [teachers, setTeachers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [viewTeacher, setViewTeacher] = useState(null);

    function fetchData() {
        fetch('http://localhost/school_management/teacher/index.php')
            .then(response => response.json())
            .then(data => setTeachers(data.data))
            .catch(error => console.error('Error fetching teachers:', error));
    }

    useEffect(() => {
        fetchData();
    }
        , []);


    const handleEdit = (teacher) => {
        setForm(teacher);
        setEditingId(teacher.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Delete
    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this teacher?")) return;
        setTeachers((prev) => prev.filter((t) => t.id !== id));
        if (editingId === id) resetForm();
        if (viewTeacher && viewTeacher.id === id) setViewTeacher(null);
    };

    // Search
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return teachers;
        return teachers.filter((t) =>
            [t.name, t.subject, t.qualification, t.mobile, t.email]
                .join(" ")
                .toLowerCase()
                .includes(q)
        );
    }, [teachers, search]);


    return (
        <div className="container-fluid py-4">
            <div className="row g-4 mb-4">


                {/* ===== Teacher List + Search ===== */}
                <div className="card shadow-sm">
                    <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <h5 className="mb-0">Teacher List</h5>
                        <NavLink className="btn btn-primary" to="./create">Add new</NavLink>
                        <input type="text" className="form-control w-auto" placeholder="Search teacher..."
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Photo</th>
                                        <th>Name</th>
                                        <th>Subject</th>
                                        <th>Qualification</th>
                                        <th>Joining Date</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted py-4">No teachers found.</td>
                                        </tr>
                                    ) : (
                                        filtered.map((t) => (
                                            <tr key={t.id}>
                                                <td>
                                                {t.photo ? (
                                                    <img src={`${import.meta.env.VITE_API_URL}${t.photo}`} alt={t.name} className="rounded-circle"
                                                        style={{ width: 40, height: 40, objectFit: "cover" }} />
                                                ) : "-"}
                                            </td>
                                                <td>{t.name}</td>
                                                <td>{t.main_subject}</td>
                                                <td>{t.qualification}</td>
                                                <td>{t.joining_date}</td>
                                                <td>{t.guardian_phone}</td>
                                                <td className="text-end text-nowrap">
                                                    <button className="btn btn-sm btn-info me-1" onClick={() => setViewTeacher(t)}>View</button>
                                                    <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(t)}>Edit</button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)}>Delete</button>
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
        </div>
    );

}




