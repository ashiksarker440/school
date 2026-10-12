import { useState, useMemo } from "react";

const CLASSES = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
const SECTIONS = ["A", "B", "C", "D"];

const emptyForm = {
    admissionNumber: "",
    name: "",
    email: "",
    mobile: "",
    password: "",
    classId: "",
    section: "",
    guardianName: "",
    guardianRelation: "",
    guardianMobile: "",
    guardianAddress: "",
    photo: "",
};

// Component-er BAIRE rakha hoyeche, tai type korle input focus harabe na
function Field({ label, children }) {
    return (
        <div className="row mb-3">
            <label className="col-sm-4 col-form-label">{label}</label>
            <div className="col-sm-8">{children}</div>
        </div>
    );
}

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [viewStudent, setViewStudent] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhoto = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setForm((prev) => ({ ...prev, photo: reader.result }));
        reader.readAsDataURL(file);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    // Add / Edit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            const updated = { ...form, id: editingId };
            setStudents((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
            if (viewStudent && viewStudent.id === editingId) setViewStudent(updated);
        } else {
            setStudents((prev) => [...prev, { ...form, id: Date.now() }]);
        }
        resetForm();
    };

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
            <div className="row g-4 mb-4">
                {/* ===== Add / Edit Form ===== */}
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">{editingId ? "Edit Student" : "Add Student"}</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <Field label="Admission Number">
                                    <input type="text" className="form-control" name="admissionNumber"
                                        placeholder="Admission Number" value={form.admissionNumber}
                                        onChange={handleChange} required />
                                </Field>

                                <Field label="Student Name">
                                    <input type="text" className="form-control" name="name"
                                        placeholder="Full Name" value={form.name}
                                        onChange={handleChange} required />
                                </Field>

                                <Field label="Email">
                                    <input type="email" className="form-control" name="email"
                                        placeholder="Email" value={form.email} onChange={handleChange} />
                                </Field>

                                <Field label="Mobile">
                                    <input type="tel" className="form-control" name="mobile"
                                        placeholder="Mobile" value={form.mobile} onChange={handleChange} />
                                </Field>

                                <Field label="Password">
                                    <input type="password" className="form-control" name="password"
                                        placeholder="Password" value={form.password}
                                        onChange={handleChange} required={!editingId} />
                                </Field>

                                <Field label="Class">
                                    <select className="form-select" name="classId"
                                        value={form.classId} onChange={handleChange} required>
                                        <option value="">Select Class</option>
                                        {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>

                                <Field label="Section">
                                    <select className="form-select" name="section"
                                        value={form.section} onChange={handleChange} required>
                                        <option value="">Select Section</option>
                                        {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </Field>

                                <h6 className="border-bottom pb-2 mt-4 mb-3">Guardian Information</h6>

                                <Field label="Guardian Name">
                                    <input type="text" className="form-control" name="guardianName"
                                        placeholder="Guardian Name" value={form.guardianName}
                                        onChange={handleChange} />
                                </Field>

                                <Field label="Relation">
                                    <select className="form-select" name="guardianRelation"
                                        value={form.guardianRelation} onChange={handleChange}>
                                        <option value="">Select Relation</option>
                                        <option value="Father">Father</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </Field>

                                <Field label="Guardian Mobile">
                                    <input type="tel" className="form-control" name="guardianMobile"
                                        placeholder="Guardian Mobile" value={form.guardianMobile}
                                        onChange={handleChange} />
                                </Field>

                                <Field label="Address">
                                    <textarea className="form-control" rows="2" name="guardianAddress"
                                        placeholder="Address" value={form.guardianAddress}
                                        onChange={handleChange} />
                                </Field>

                                <Field label="Student Photo">
                                    <input type="file" className="form-control" accept="image/*"
                                        onChange={handlePhoto} />
                                    {form.photo && (
                                        <img src={form.photo} alt="Preview" className="mt-2 rounded border"
                                            style={{ width: 90, height: 90, objectFit: "cover" }} />
                                    )}
                                </Field>

                                <div className="d-flex justify-content-end gap-2">
                                    <button type="submit" className="btn btn-primary">
                                        {editingId ? "Update" : "Submit"}
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                                        {editingId ? "Cancel" : "Reset"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ===== Student Profile ===== */}
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">Student Profile</h5>
                        </div>
                        <div className="card-body">
                            {!viewStudent ? (
                                <p className="text-muted mb-0">List theke "View" button-e click korle profile ekhane dekha jabe.</p>
                            ) : (
                                <div className="d-flex flex-wrap gap-3">
                                    {viewStudent.photo ? (
                                        <img src={viewStudent.photo} alt={viewStudent.name} className="rounded border"
                                            style={{ width: 120, height: 120, objectFit: "cover" }} />
                                    ) : (
                                        <div className="rounded border bg-light d-flex align-items-center justify-content-center text-muted"
                                            style={{ width: 120, height: 120 }}>No Photo</div>
                                    )}
                                    <div>
                                        <h5 className="mb-1">{viewStudent.name}</h5>
                                        <p className="mb-1"><strong>Admission No:</strong> {viewStudent.admissionNumber}</p>
                                        <p className="mb-1"><strong>Class & Section:</strong> {viewStudent.classId} - {viewStudent.section}</p>
                                        <p className="mb-1"><strong>Email:</strong> {viewStudent.email || "-"}</p>
                                        <p className="mb-1"><strong>Mobile:</strong> {viewStudent.mobile || "-"}</p>
                                        <hr className="my-2" />
                                        <p className="mb-1"><strong>Guardian:</strong> {viewStudent.guardianName || "-"} ({viewStudent.guardianRelation || "-"})</p>
                                        <p className="mb-1"><strong>Guardian Mobile:</strong> {viewStudent.guardianMobile || "-"}</p>
                                        <p className="mb-0"><strong>Address:</strong> {viewStudent.guardianAddress || "-"}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Student List + Search ===== */}
            <div className="card shadow-sm">
                <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <h5 className="mb-0">Student List</h5>
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
                                                    <img src={s.photo} alt={s.name} className="rounded-circle"
                                                        style={{ width: 40, height: 40, objectFit: "cover" }} />
                                                ) : "-"}
                                            </td>
                                            <td>{s.admissionNumber}</td>
                                            <td>{s.name}</td>
                                            <td>{s.classId} - {s.section}</td>
                                            <td>{s.guardianName || "-"}</td>
                                            <td>{s.mobile || "-"}</td>
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
