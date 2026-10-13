import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const CLASSES = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
const SECTIONS = ["A", "B", "C", "D"];
const STATUS = {
    Present: "success",
    Absent: "danger",
    Late: "warning",
};

const todayStr = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
};

const emptyForm = {
    date: todayStr(),
    admission_no: "",
    name: "",
    class_id: "",
    section: "",
    status: "Present",
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

export default function AttendanceForm() {
    let { id } = useParams();

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // Edit korle ager data load hobe
    const fetchData = async () => {
        try {
            const response = await axios.get('Attendance/single.php?id=' + id);
            const row = response.data.data[0];

            // "Class 1 - A" ke class ar section-e bhag kora
            const [classPart, sectionPart] = (row.class_section || "").split(" - ");

            setForm({
                date: row.date,
                admission_no: row.admission_no,
                name: row.name,
                class_id: classPart || "",
                section: sectionPart || "",
                status: row.status || "Present",
            });
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => setForm(emptyForm);

    // Add / Edit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData(e.target);
        // PHP file-e class ar section ek column-e (class_section) jay
        formData.set('class_section', `${form.class_id} - ${form.section}`);

        const url = id ? 'Attendance/update.php?id=' + id : 'Attendance/create.php';

        try {
            const response = await axios.post(url, formData);
            if (response.data.status) {
                window.location.href = '/attendance';
            } else {
                alert(response.data.message || 'Attendance save hoyni');
            }
        } catch (error) {
            alert('Server error. Abar chesta korun.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="row g-4 mb-4">
                    <div className="col-lg-10">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">{id ? "Edit Attendance" : "Add Attendance"}</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <Field label="Date">
                                        <input type="date" className="form-control" name="date"
                                            value={form.date} onChange={handleChange} required />
                                    </Field>

                                    <Field label="Admission Number">
                                        <input type="text" className="form-control" name="admission_no"
                                            placeholder="Admission Number" value={form.admission_no}
                                            onChange={handleChange} required />
                                    </Field>

                                    <Field label="Student Name">
                                        <input type="text" className="form-control" name="name"
                                            placeholder="Full Name" value={form.name}
                                            onChange={handleChange} required />
                                    </Field>

                                    <Field label="Class">
                                        <select className="form-select" name="class_id"
                                            value={form.class_id} onChange={handleChange} required>
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

                                    <Field label="Status">
                                        <div className="btn-group" role="group">
                                            {Object.keys(STATUS).map((st) => (
                                                <span key={st}>
                                                    <input type="radio" className="btn-check" name="status"
                                                        id={`status-${st}`} value={st}
                                                        checked={form.status === st}
                                                        onChange={handleChange} />
                                                    <label className={`btn btn-outline-${STATUS[st]}`}
                                                        htmlFor={`status-${st}`}>{st}</label>
                                                </span>
                                            ))}
                                        </div>
                                    </Field>

                                    <div className="d-flex justify-content-end gap-2">
                                        <button type="submit" className="btn btn-primary" disabled={saving}>
                                            {saving ? "Saving..." : id ? "Update" : "Submit"}
                                        </button>
                                        <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                                            {id ? "Cancel" : "Reset"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
