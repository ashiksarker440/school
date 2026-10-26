import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const EXAM_TYPES = ["Class Test", "Monthly Test", "1st Term", "Half Yearly", "2nd Term", "Annual / Final", "Model Test"];

function Field({ label, children }) {
    return (
        <div className="row mb-3">
            <label className="col-sm-4 col-form-label">{label}</label>
            <div className="col-sm-8">{children}</div>
        </div>
    );
}

export default function ExamForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [examName, setExamName] = useState("");
    const [type, setType] = useState("");
    const [loadedId, setLoadedId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const loading = Boolean(id) && loadedId !== id;

    useEffect(() => {
        if (!id) return undefined;

        let active = true;
        axios.get(`Exam/single.php?id=${encodeURIComponent(id)}`)
            .then((response) => {
                if (!active) return;
                setError("");
                const exam = response.data.data?.[0];
                if (!exam) {
                    setError(response.data.message || "Exam not found.");
                    return;
                }
                setExamName(exam.exam_name || "");
                setType(exam.type || "");
            })
            .catch((requestError) => {
                console.error("Error loading exam:", requestError);
                if (active) setError(requestError.response?.data?.message || "Could not load exam.");
            })
            .finally(() => {
                if (active) setLoadedId(id);
            });

        return () => {
            active = false;
        };
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSaving(true);

        const formData = new FormData();
        formData.set("exam_name", examName.trim());
        formData.set("type", type);

        try {
            const url = id ? `Exam/update.php?id=${encodeURIComponent(id)}` : "Exam/create.php";
            const response = await axios.post(url, formData);
            if (response.data.status) {
                navigate("/exam");
            } else {
                setError(response.data.message || "Exam could not be saved.");
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
                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="card shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">{id ? "Edit Exam" : "Add Exam"}</h5>
                            </div>
                            <div className="card-body">
                                {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
                                {loading ? (
                                    <div className="text-center py-4">Loading...</div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <Field label="Exam Name">
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="exam_name"
                                                value={examName}
                                                onChange={(event) => setExamName(event.target.value)}
                                                maxLength={255}
                                                required
                                            />
                                        </Field>
                                        <Field label="Exam Type">
                                            <select
                                                className="form-select"
                                                name="type"
                                                value={type}
                                                onChange={(event) => setType(event.target.value)}
                                                required
                                            >
                                                <option value="">Select Exam Type</option>
                                                {type && !EXAM_TYPES.includes(type) && <option value={type}>{type}</option>}
                                                {EXAM_TYPES.map((examType) => (
                                                    <option key={examType} value={examType}>{examType}</option>
                                                ))}
                                            </select>
                                        </Field>
                                        <div className="d-flex justify-content-end gap-2">
                                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                                {saving ? "Saving..." : id ? "Update" : "Submit"}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => navigate("/exam")}
                                                disabled={saving}
                                            >
                                                Cancel
                                            </button>
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
