import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const CLASSES = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
const SUBJECTS = ["Bangla", "English", "Mathematics", "Science", "Social Science", "Religion", "ICT", "Physics", "Chemistry", "Biology"];
const EXAM_TYPES = ["Class Test", "Monthly Test", "1st Term", "Half Yearly", "2nd Term", "Annual / Final", "Model Test"];

const emptyForm = {
    exam_name: "",
    type: "",
    class_id: "",
    subject: "",
    date: "",
    time: "",
    marks: "",
    status: "1",
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

export default function ExamForm() {
    let { id } = useParams();

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // Edit korle ager data load hobe
    const fetchData = async () => {
        try {
            const response = await axios.get('Exam/single.php?id=' + id);
            const row = response.data.data[0];

            setForm({
                exam_name: row.exam_name || "",
                type: row.type || "",
                class_id: row.class_id || "",
                subject: row.subject || "",
                date: row.date || "",
                time: row.time ? row.time.slice(0, 5) : "", // "10:00:00" -> "10:00"
                marks: row.marks ?? "",
                status: String(row.status ?? 1),
            });
        } catch (error) {
            console.error('Error fetching exam:', error);
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
        const url = id ? 'Exam/update.php?id=' + id : 'Exam/create.php';

        try {
            const response = await axios.post(url, formData);
            if (response.data.status) {
                window.location.href = '/exam';
            } else {
                alert(response.data.message || 'Exam save hoyni');
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
                                <h5 className="mb-0">{id ? "Edit Exam" : "Add Exam"}</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <Field label="Exam Name">
                                        <input type="text" className="form-control" name="exam_name"
                                            placeholder="e.g. Bangla 1st Term" value={form.exam_name}
                                            onChange={handleChange} required />
                                    </Field>

                                    <Field label="Exam Type">
                                        <select className="form-select" name="type" value={form.type}
                                            onChange={handleChange} required>
                                            <option value="">Select Exam Type</option>
                                            {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </Field>

                                    <Field label="Class">
                                        <select className="form-select" name="class_id" value={form.class_id}
                                            onChange={handleChange} required>
                                            <option value="">Select Class</option>
                                            {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </Field>

                                    <Field label="Subject">
                                        <select className="form-select" name="subject" value={form.subject}
                                            onChange={handleChange} required>
                                            <option value="">Select Subject</option>
                                            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </Field>

                                    <Field label="Date">
                                        <input type="date" className="form-control" name="date"
                                            value={form.date} onChange={handleChange} required />
                                    </Field>

                                    <Field label="Time">
                                        <input type="time" className="form-control" name="time"
                                            value={form.time} onChange={handleChange} required />
                                    </Field>

                                    <Field label="Marks">
                                        <input type="number" min="1" className="form-control" name="marks"
                                            placeholder="Total Marks" value={form.marks}
                                            onChange={handleChange} required />
                                    </Field>

                                    <Field label="Status">
                                        <select className="form-select" name="status" value={form.status}
                                            onChange={handleChange}>
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
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
