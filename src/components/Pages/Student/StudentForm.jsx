import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const emptyForm = {
    admission_number: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    class_id: "",
    section_id: "",
    roll_no: "",
    guardian_name: "",
    guardian_relation: "",
    guardian_phone: "",
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

export default function StudentForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(emptyForm);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [sessionName, setSessionName] = useState("");
    const [selectedfile, setSelectedFile] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        const loadFormData = async () => {
            try {
                setLoading(true);
                const [optionsResponse, studentResponse] = await Promise.all([
                    axios.get("Student/options.php"),
                    id ? axios.get(`Student/single.php?id=${id}`) : Promise.resolve(null),
                ]);
                if (!optionsResponse.data?.status) {
                    throw new Error(optionsResponse.data?.message || "Class and section options could not be loaded.");
                }
                if (id && !studentResponse.data?.status) {
                    throw new Error(studentResponse.data?.message || "Student data could not be loaded.");
                }

                if (active) {
                    setClasses(optionsResponse.data.data?.classes || []);
                    setSessionName(optionsResponse.data.data?.session?.name || "");
                    if (id) {
                        const row = studentResponse.data.data?.[0];
                        if (!row) throw new Error("Student record was not found.");
                        setForm({
                            ...emptyForm,
                            ...row,
                            admission_number: row.admission_number || "",
                            name: row.name || "",
                            email: row.email || "",
                            phone: row.phone || "",
                            class_id: row.enrollment_class_id ? String(row.enrollment_class_id) : "",
                            section_id: row.enrollment_section_id ? String(row.enrollment_section_id) : "",
                            guardian_name: row.guardian_name || "",
                            guardian_relation: row.guardian_relation || "",
                            guardian_phone: row.guardian_phone || "",
                            address: row.address || "",
                            photo: row.photo || "",
                            roll_no: row.roll_no || "",
                            password: "",
                        });
                    }
                }
            } catch (err) {
                console.error("Error loading student form:", err);
                if (active) {
                    setError(err.response?.data?.message || err.message || "Failed to load student form.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };
        loadFormData();
        return () => {
            active = false;
        };
    }, [id]);

    useEffect(() => {
        let active = true;
        if (!form.class_id) {
            setSections([]);
            return () => {
                active = false;
            };
        }

        const loadSections = async () => {
            try {
                const response = await axios.get("Student/options.php", {
                    params: { class_id: form.class_id },
                });
                if (!response.data?.status) {
                    throw new Error(response.data?.message || "Section options could not be loaded.");
                }
                if (active) setSections(response.data.data?.sections || []);
            } catch (err) {
                console.error("Error loading student sections:", err);
                if (active) {
                    setError(err.response?.data?.message || err.message || "Failed to load sections.");
                }
            }
        };
        loadSections();
        return () => {
            active = false;
        };
    }, [form.class_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "class_id" ? { section_id: "" } : {}),
        }));
    };

    /* handel image/file */
    const handelFile = (e) => {
        setSelectedFile(e.target.files)
    }

    const resetForm = () => {
        setForm(emptyForm);
        setSelectedFile([]);
        setError("");
        if (id) navigate("/student");
    };



    // Add / Edit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        const formData = new FormData(e.target);
        /* handel image/file */
        for (let i = 0; i < selectedfile.length; i++) {
            formData.append('files[]', selectedfile[i])
        }
        // const data = Object.fromEntries(formData.entries());
        const url = id ? `Student/update.php?id=${id}` : "Student/create.php";
        try {
            const response = await axios.post(url, formData);
            if (!response.data?.status) {
                setError(response.data?.message || "Student could not be saved.");
                return;
            }
            navigate("/student");
        } catch (err) {
            setError(err.response?.data?.message || "Server error. Please try again.");
        } finally {
            setSaving(false);
        }
    };




    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="row g-4 mb-4">
                    {/* ===== Add / Edit Form ===== */}
                    <div className="col-lg-10">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">{id ? "Edit Student" : "Add Student"}</h5>
                            </div>
                            <div className="card-body">
                                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                                {sessionName && (
                                    <div className="alert alert-info">Enrollment session: {sessionName}</div>
                                )}
                                {loading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading student form...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <Field label="Admission Number">
                                            <input type="text" className="form-control" name="admission_number"
                                                placeholder="Admission Number" value={form.admission_number}
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

                                        <Field label="Phone">
                                            <input type="tel" className="form-control" name="phone"
                                                placeholder="phone" value={form.phone} onChange={handleChange} />
                                        </Field>

                                        <Field label="Password">
                                            <input type="password" className="form-control" name="password"
                                                placeholder="Password" value={form.password}
                                                onChange={handleChange} required={!id} />
                                        </Field>

                                        <Field label="Class">
                                            <select className="form-select" name="class_id"
                                                value={form.class_id} onChange={handleChange} required>
                                                <option value="">Select Class</option>
                                                {classes.map((item) => (
                                                    <option key={item.id} value={item.id}>{item.name}</option>
                                                ))}
                                            </select>
                                        </Field>

                                        <Field label="Section">
                                            <select className="form-select" name="section_id"
                                                value={form.section_id} onChange={handleChange}
                                                disabled={!form.class_id} required>
                                                <option value="">Select Section</option>
                                                {sections.map((item) => (
                                                    <option key={item.id} value={item.id}>{item.name}</option>
                                                ))}
                                            </select>
                                        </Field>
                                        <Field label="Roll No">
                                            <input type="number" className="form-control" name="roll_no"
                                                value={form.roll_no} onChange={handleChange}
                                                placeholder="Enter Roll No" min="1" required />
                                        </Field>

                                        <h6 className="border-bottom pb-2 mt-4 mb-3">Guardian Information</h6>

                                        <Field label="Guardian Name">
                                            <input type="text" className="form-control" name="guardian_name"
                                                placeholder="Guardian Name" value={form.guardian_name}
                                                onChange={handleChange} />
                                        </Field>

                                        <Field label="Relation">
                                            <select className="form-select" name="guardian_relation"
                                                value={form.guardian_relation} onChange={handleChange}>
                                                <option value="">Select Relation</option>
                                                <option value="Father">Father</option>
                                                <option value="Mother">Mother</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </Field>

                                        <Field label="Guardian phone">
                                            <input type="tel" className="form-control" name="guardian_phone"
                                                placeholder="Guardian phone" value={form.guardian_phone}
                                                onChange={handleChange} />
                                        </Field>

                                        <Field label="Address">
                                            <textarea className="form-control" rows="2" name="address"
                                                placeholder="Address" value={form.address}
                                                onChange={handleChange} />
                                        </Field>

                                        <Field label="Student Photo">
                                            <input type="file" className="form-control" accept="image/*"
                                                onChange={handelFile} />
                                            {form.photo && (
                                                <img src={`${import.meta.env.VITE_API_URL}${form.photo}`} alt="Preview" className="mt-2 rounded border"
                                                    style={{ width: 90, height: 90, objectFit: "cover" }} />
                                            )}
                                        </Field>

                                        <div className="d-flex justify-content-end gap-2">
                                            <button type="submit" className="btn btn-primary">
                                                {saving ? "Saving..." : id ? "Update" : "Submit"}
                                            </button>
                                            <button type="button" className="btn btn-outline-secondary" onClick={resetForm}
                                                disabled={saving}>
                                                {id ? "Cancel" : "Reset"}
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
