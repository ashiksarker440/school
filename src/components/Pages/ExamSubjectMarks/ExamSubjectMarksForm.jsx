import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const EMPTY_FORM = {
    exam_id: "",
    class_id: "",
    subject_id: "",
    full_marks: "",
    pass_marks: "",
    exam_date: "",
};

function Field({ label, children }) {
    return (
        <div className="row mb-3">
            <label className="col-sm-4 col-form-label">{label}</label>
            <div className="col-sm-8">{children}</div>
        </div>
    );
}

export default function ExamSubjectMarksForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY_FORM);
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(Boolean(id));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const [examResponse, optionsResponse, recordResponse] = await Promise.all([
                    axios.get("Exam/index.php"),
                    axios.get("ExamSubjectMarks/options.php"),
                    id ? axios.get(`ExamSubjectMarks/single.php?id=${encodeURIComponent(id)}`) : Promise.resolve(null),
                ]);
                if (!active) return;
                if (!examResponse.data.status) {
                    setError(examResponse.data.message || "Could not load exams.");
                } else {
                    setExams(examResponse.data.data || []);
                }
                if (!optionsResponse.data.status) {
                    setError(optionsResponse.data.message || "Could not load classes and subjects.");
                } else {
                    setClasses(optionsResponse.data.data?.classes || []);
                    setSubjects(optionsResponse.data.data?.subjects || []);
                }
                if (id) {
                    const record = recordResponse.data.data?.[0];
                    if (!record) {
                        setError(recordResponse.data.message || "Record not found.");
                    } else {
                        setForm({
                            exam_id: String(record.exam_id ?? ""),
                            class_id: String(record.class_id ?? ""),
                            subject_id: String(record.subject_id ?? ""),
                            full_marks: String(record.full_marks ?? ""),
                            pass_marks: String(record.pass_marks ?? ""),
                            exam_date: record.exam_date || "",
                        });
                    }
                }
            } catch (requestError) {
                console.error("Error loading exam subject marks form:", requestError);
                if (active) {
                    setError(requestError.response?.data?.message || "Could not load form data.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => {
            active = false;
        };
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        if (Number(form.pass_marks) > Number(form.full_marks)) {
            setError("Pass marks cannot be greater than full marks.");
            return;
        }

        setSaving(true);
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => formData.set(key, value));
        try {
            const url = id
                ? `ExamSubjectMarks/update.php?id=${encodeURIComponent(id)}`
                : "ExamSubjectMarks/create.php";
            const response = await axios.post(url, formData);
            if (response.data.status) {
                navigate("/exam-subject-marks");
            } else {
                setError(response.data.message || "Record could not be saved.");
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Server error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="row">
                    <div className="col-lg-8">
                        <div className="card shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">{id ? "Edit Exam Subject Marks" : "Add Exam Subject Marks"}</h5>
                            </div>
                            <div className="card-body">
                                {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
                                {loading ? (
                                    <div className="text-center py-4">Loading...</div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <Field label="Exam">
                                            <select
                                                className="form-select"
                                                name="exam_id"
                                                value={form.exam_id}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select exam</option>
                                                {form.exam_id && !exams.some((exam) => String(exam.id) === form.exam_id) && (
                                                    <option value={form.exam_id}>Exam #{form.exam_id}</option>
                                                )}
                                                {exams.map((exam) => (
                                                    <option key={exam.id} value={exam.id}>
                                                        {exam.exam_name} (#{exam.id})
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                        <Field label="Class">
                                            <select className="form-select" name="class_id"
                                                value={form.class_id} onChange={handleChange} required>
                                                <option value="">Select class</option>
                                                {form.class_id && !classes.some((item) => String(item.id) === form.class_id) && (
                                                    <option value={form.class_id}>Class #{form.class_id} (unavailable)</option>
                                                )}
                                                {classes.map((item) => (
                                                    <option key={item.id} value={item.id}>{item.name}</option>
                                                ))}
                                            </select>
                                        </Field>
                                        <Field label="Subject">
                                            <select className="form-select" name="subject_id"
                                                value={form.subject_id} onChange={handleChange} required>
                                                <option value="">Select subject</option>
                                                {form.subject_id && !subjects.some((item) => String(item.id) === form.subject_id) && (
                                                    <option value={form.subject_id}>Subject #{form.subject_id} (unavailable)</option>
                                                )}
                                                {subjects.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name}{item.code ? ` (${item.code})` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                        <Field label="Full Marks">
                                            <input className="form-control" type="number" name="full_marks" min="0.01"
                                                step="any" value={form.full_marks} onChange={handleChange} required />
                                        </Field>
                                        <Field label="Pass Marks">
                                            <input className="form-control" type="number" name="pass_marks" min="0"
                                                step="any" value={form.pass_marks} onChange={handleChange} required />
                                        </Field>
                                        <Field label="Exam Date">
                                            <input className="form-control" type="date" name="exam_date"
                                                value={form.exam_date} onChange={handleChange} required />
                                        </Field>
                                        <div className="d-flex justify-content-end gap-2">
                                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                                {saving ? "Saving..." : id ? "Update" : "Create"}
                                            </button>
                                            <Link className="btn btn-outline-secondary" to="/exam-subject-marks">Cancel</Link>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
