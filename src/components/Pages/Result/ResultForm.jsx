import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const GRADES = ["A+", "A", "A-", "B", "C", "D", "F"];

const emptyForm = {
    admission_no: "",
    name: "",
    total: "",
    percentage: "",
    gpa: "",
    grade: "",
    result: "Pass",
    merit: "",
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

export default function ResultForm() {
    let { id } = useParams();

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // Edit korle ager data load hobe
    const fetchData = async () => {
        try {
            const response = await axios.get('Result/single.php?id=' + id);
            const row = response.data.data[0];

            setForm({
                admission_no: row.admission_no || "",
                name: row.name || "",
                total: row.total ?? "",
                percentage: row.percentage ?? "",
                gpa: row.gpa ?? "",
                grade: row.grade || "",
                result: row.result || "Pass",
                merit: row.merit ?? "",
            });
        } catch (error) {
            console.error('Error fetching result:', error);
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
        const url = id ? 'Result/update.php?id=' + id : 'Result/create.php';

        try {
            const response = await axios.post(url, formData);
            if (response.data.status) {
                window.location.href = '/result';
            } else {
                alert(response.data.message || 'Result save hoyni');
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
                                <h5 className="mb-0">{id ? "Edit Result" : "Add Result"}</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
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

                                    <Field label="Total Marks">
                                        <input type="number" min="0" step="0.01" className="form-control" name="total"
                                            placeholder="Total" value={form.total}
                                            onChange={handleChange} required />
                                    </Field>

                                    <Field label="Percentage (%)">
                                        <input type="number" min="0" max="100" step="0.01" className="form-control"
                                            name="percentage" placeholder="Percentage" value={form.percentage}
                                            onChange={handleChange} required />
                                    </Field>

                                    <Field label="GPA">
                                        <input type="number" min="0" max="5" step="0.01" className="form-control"
                                            name="gpa" placeholder="e.g. 4.50" value={form.gpa}
                                            onChange={handleChange} required />
                                    </Field>

                                    <Field label="Grade">
                                        <select className="form-select" name="grade" value={form.grade}
                                            onChange={handleChange} required>
                                            <option value="">Select Grade</option>
                                            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </Field>

                                    <Field label="Result">
                                        <select className="form-select" name="result" value={form.result}
                                            onChange={handleChange} required>
                                            <option value="Pass">Pass</option>
                                            <option value="Fail">Fail</option>
                                        </select>
                                    </Field>

                                    <Field label="Merit Position">
                                        <input type="number" min="1" className="form-control" name="merit"
                                            placeholder="e.g. 1" value={form.merit}
                                            onChange={handleChange} />
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
