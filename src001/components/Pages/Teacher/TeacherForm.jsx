import { useState, useMemo } from "react";
import { useParams } from "react-router";
import axios from "../../../Lib/axios";

const SUBJECTS = ["Bangla", "English", "Mathematics", "Science", "Social Science", "Religion", "ICT", "Physics", "Chemistry", "Biology"];
const QUALIFICATIONS = ["HSC", "Bachelor (B.A / B.Sc / B.Com)", "B.Ed", "Masters (M.A / M.Sc / M.Com)", "M.Ed", "PhD"];

const emptyForm = {
    name: "",
    email: "",
    phone: "",
    password: "",
    qualification: "",
    subject: "",
    salary: "",
    joining_date: "",
    address: "",
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

export default function TeacherManagement() {
    const [teachers, setTeachers] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [viewTeacher, setViewTeacher] = useState(null);

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
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        fetch('http://localhost/school_management/Teacher/create.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                // Optionally, you can redirect the user to another page or show a success message here
                window.location.href = '/teacher';
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

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
            [t.name, t.subject, t.qualification, t.phone, t.email]
                .join(" ")
                .toLowerCase()
                .includes(q)
        );
    }, [teachers, search]);

    const formatSalary = (v) => (v === "" || v == null ? "-" : `৳ ${Number(v).toLocaleString()}`);
    const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

    return (
        <div className="container-fluid py-4">
            <div className="row g-4 mb-4">
                {/* ===== Add / Edit Form ===== */}
                <div className="col-lg-12">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">{editingId ? "Edit Teacher" : "Add Teacher"}</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <Field label="Teacher Name">
                                    <input type="text" className="form-control" name="name"
                                        placeholder="Full Name" value={form.name}
                                        onChange={handleChange} required />
                                </Field>

                                <Field label="Email">
                                    <input type="email" className="form-control" name="email"
                                        placeholder="Email" value={form.email}
                                        onChange={handleChange} required />
                                </Field>

                                <Field label="phone">
                                    <input type="tel" className="form-control" name="phone"
                                        placeholder="phone" value={form.phone} onChange={handleChange} />
                                </Field>

                                <Field label="Password">
                                    <input type="password" className="form-control" name="password"
                                        placeholder="Password" value={form.password}
                                        onChange={handleChange} required={!editingId} />
                                </Field>

                                <Field label="Qualification">
                                    <select className="form-select" name="qualification"
                                        value={form.qualification} onChange={handleChange} required>
                                        <option value="">Select Qualification</option>
                                        {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                                    </select>
                                </Field>

                                <Field label="Subject">
                                    <select className="form-select" name="subject"
                                        value={form.subject} onChange={handleChange} required>
                                        <option value="">Select Subject</option>
                                        {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </Field>

                                <Field label="Salary">
                                    <div className="input-group">
                                        <span className="input-group-text">৳</span>
                                        <input type="number" min="0" className="form-control" name="salary"
                                            placeholder="Monthly Salary" value={form.salary}
                                            onChange={handleChange} required />
                                    </div>
                                </Field>

                                <Field label="Joining Date">
                                    <input type="date" className="form-control" name="joining_date"
                                        value={form.joining_date} onChange={handleChange} required />
                                </Field>

                                <Field label="Address">
                                    <textarea className="form-control" rows="2" name="address"
                                        placeholder="Address" value={form.address}
                                        onChange={handleChange} />
                                </Field>

                                <Field label="Teacher Photo">
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


            </div>

        </div>
    );
}
