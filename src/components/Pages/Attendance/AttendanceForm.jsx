import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

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
    student_id: "",
    admission_no: "",
    roll_no: "",
    name: "",
    class_section: "",
    status: "Present",
};

// 1 / "present" => Present, 2 / "late" => Late, baki sob => Absent
const normalizeStatus = (s) => {
    const v = String(s ?? "").toLowerCase();
    if (v === "1" || v === "present") return "Present";
    if (v === "2" || v === "late") return "Late";
    return "Absent";
};

// Student API-r response jemon-i hok, class_section ber kore ney
const getClassSection = (s) =>
    s.class_section || [s.class_name, s.section_name].filter(Boolean).join(" - ");

// Component-er BAIRE rakha hoyeche, tai type korle input focus harabe na
function Field({ label, children, hint }) {
    return (
        <div className="row mb-3">
            <label className="col-sm-4 col-form-label">{label}</label>
            <div className="col-sm-8">
                {children}
                {hint && <div className="form-text">{hint}</div>}
            </div>
        </div>
    );
}

function BulkAttendanceForm() {
    const [date, setDate] = useState(todayStr());
    const [classId, setClassId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await axios.get("Attendance/bulk.php");
                if (!response.data?.status) {
                    throw new Error(response.data?.message || "Class list could not be loaded.");
                }
                setClasses(response.data.data?.classes || []);
            } catch (err) {
                console.error("Error fetching attendance classes:", err);
                setError(err.response?.data?.message || err.message || "Failed to load classes.");
            } finally {
                setLoadingClasses(false);
            }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        let active = true;
        if (!classId) return () => {
            active = false;
        };

        const fetchSections = async () => {
            try {
                const response = await axios.get("Attendance/bulk.php", {
                    params: { class_id: classId },
                });
                if (!response.data?.status) {
                    throw new Error(response.data?.message || "Section list could not be loaded.");
                }
                if (active) setSections(response.data.data?.sections || []);
            } catch (err) {
                console.error("Error fetching attendance sections:", err);
                if (active) {
                    setError(err.response?.data?.message || err.message || "Failed to load sections.");
                }
            }
        };
        fetchSections();
        return () => {
            active = false;
        };
    }, [classId]);

    useEffect(() => {
        if (!date || !classId || !sectionId) return;

        let active = true;
        const fetchStudents = async () => {
            try {
                setLoadingStudents(true);
                setError("");
                const response = await axios.get("Attendance/bulk.php", {
                    params: { date, class_id: classId, section_id: sectionId },
                });
                if (!response.data?.status) {
                    throw new Error(response.data?.message || "Student list could not be loaded.");
                }
                if (active) {
                    const rows = response.data.data?.students || [];
                    setStudents(rows.map((student) => ({
                        ...student,
                        status: student.status === null || student.status === ""
                            ? "Present"
                            : normalizeStatus(student.status),
                    })));
                }
            } catch (err) {
                console.error("Error fetching attendance students:", err);
                if (active) {
                    setError(err.response?.data?.message || err.message || "Failed to load students.");
                }
            } finally {
                if (active) setLoadingStudents(false);
            }
        };
        fetchStudents();
        return () => {
            active = false;
        };
    }, [date, classId, sectionId]);

    const handleDateChange = (value) => {
        setDate(value);
        setStudents([]);
        setLoadingStudents(false);
        setMessage("");
        setError("");
    };

    const handleClassChange = (value) => {
        setClassId(value);
        setSectionId("");
        setSections([]);
        setStudents([]);
        setLoadingStudents(false);
        setMessage("");
        setError("");
    };

    const handleSectionChange = (value) => {
        setSectionId(value);
        setStudents([]);
        setLoadingStudents(false);
        setMessage("");
        setError("");
    };

    const handleStatusChange = (studentId, status) => {
        setStudents((current) => current.map((student) =>
            String(student.student_id) === String(studentId)
                ? { ...student, status }
                : student
        ));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        setSaving(true);

        const formData = new FormData();
        formData.set("date", date);
        formData.set("class_id", classId);
        formData.set("section_id", sectionId);
        formData.set("records", JSON.stringify(students.map((student) => ({
            student_id: student.student_id,
            status: student.status === "Present" ? 1 : student.status === "Late" ? 2 : 0,
        }))));

        try {
            const response = await axios.post("Attendance/bulk.php", formData);
            if (!response.data?.status) {
                setError(response.data?.message || "Attendance could not be saved.");
                return;
            }
            setMessage(response.data.message || "Attendance saved successfully.");
            navigate("/attendance");
        } catch (err) {
            setError(err.response?.data?.message || "Server error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Bulk Attendance</h5>
                    </div>
                    <div className="card-body">
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                        {message && <div className="alert alert-success" role="status">{message}</div>}

                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label" htmlFor="attendance-date">Date</label>
                                <input
                                    id="attendance-date"
                                    type="date"
                                    className="form-control"
                                    value={date}
                                    onChange={(event) => handleDateChange(event.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label" htmlFor="attendance-class">Class</label>
                                <select
                                    id="attendance-class"
                                    className="form-select"
                                    value={classId}
                                    onChange={(event) => handleClassChange(event.target.value)}
                                    disabled={loadingClasses}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((item) => (
                                        <option key={item.class_id} value={item.class_id}>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label" htmlFor="attendance-section">Section</label>
                                <select
                                    id="attendance-section"
                                    className="form-select"
                                    value={sectionId}
                                    onChange={(event) => handleSectionChange(event.target.value)}
                                    disabled={!classId || sections.length === 0}
                                    required
                                >
                                    <option value="">Select Section</option>
                                    {sections.map((item) => (
                                        <option key={item.section_id} value={item.section_id}>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loadingStudents ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading students...</span>
                                </div>
                                <p className="mt-2 mb-0">Loading students...</p>
                            </div>
                        ) : classId && sectionId && (
                            <form onSubmit={handleSubmit}>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Roll No</th>
                                                <th>Admission Number</th>
                                                <th>Student Name</th>
                                                <th style={{ minWidth: "170px" }}>Attendance Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="text-center text-muted py-4">
                                                        No active students found for this class and section.
                                                    </td>
                                                </tr>
                                            ) : students.map((student) => (
                                                <tr key={student.student_id}>
                                                    <td>{student.roll_no || "-"}</td>
                                                    <td>{student.admission_number || "-"}</td>
                                                    <td>{student.name}</td>
                                                    <td>
                                                        <select
                                                            className="form-select"
                                                            value={student.status}
                                                            onChange={(event) => handleStatusChange(
                                                                student.student_id,
                                                                event.target.value
                                                            )}
                                                            aria-label={`Attendance status for ${student.name}`}
                                                        >
                                                            {Object.keys(STATUS).map((status) => (
                                                                <option key={status} value={status}>{status}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">Students: {students.length}</span>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving || students.length === 0}
                                    >
                                        {saving ? "Saving..." : "Save Attendance"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function SingleAttendanceForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(emptyForm);
    const [students, setStudents] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Student list load (auto-fill-er jonno)
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get("Student/index.php");
                const data = response?.data?.data;
                setStudents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching students:", err);
                setError("Student list load hoyni. Please check your API.");
            }
        };
        fetchStudents();
    }, []);

    // Edit korle ager data load hobe
    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const response = await axios.get("Attendance/single.php?id=" + id);
                const data = response?.data?.data;
                const row = Array.isArray(data) ? data[0] : data;

                if (!row) {
                    setError("Attendance record paoa jayni.");
                    return;
                }

                setForm({
                    date: row.date ? String(row.date).slice(0, 10) : todayStr(),
                    student_id: row.student_id || "",
                    admission_no: row.admission_no || "",
                    roll_no: row.roll_no || "",
                    name: row.name || "",
                    class_section: row.class_section || "",
                    status: normalizeStatus(row.status),
                });
            } catch (err) {
                console.error("Error fetching attendance:", err);
                setError("Failed to load attendance. Please check your API.");
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // Admission No likhle / bachle baki sob auto fill
    const handleAdmissionChange = (e) => {
        const value = e.target.value;
        const student = students.find(
            (s) => String(s.admission_no).toLowerCase() === value.trim().toLowerCase()
        );

        if (student) {
            setForm((prev) => ({
                ...prev,
                student_id: student.id,
                admission_no: student.admission_no,
                roll_no: student.roll_no || "",
                name: student.name || "",
                class_section: getClassSection(student),
            }));
        } else {
            // match na hole auto field gulo khali
            setForm((prev) => ({
                ...prev,
                student_id: "",
                admission_no: value,
                roll_no: "",
                name: "",
                class_section: "",
            }));
        }
    };

    const resetForm = () => {
        setError("");
        setForm(emptyForm);
    };

    // Add / Edit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.student_id) {
            setError("Valid Admission Number select korun, tahole student auto ashbe.");
            return;
        }

        setSaving(true);

        const formData = new FormData();
        formData.set("date", form.date);
        formData.set("student_id", form.student_id);
        formData.set("admission_no", form.admission_no);
        formData.set("roll_no", form.roll_no);
        formData.set("name", form.name);
        formData.set("class_section", form.class_section);
        formData.set("status", form.status);

        const url = id ? "Attendance/update.php?id=" + id : "Attendance/create.php";

        try {
            const response = await axios.post(url, formData);
            if (response.data.status) {
                navigate("/attendance");
            } else {
                setError(response.data.message || "Attendance save hoyni");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Server error. Abar chesta korun.");
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
                                {error && <div className="alert alert-danger">{error}</div>}

                                <form onSubmit={handleSubmit}>
                                    <Field label="Date">
                                        <input type="date" className="form-control" name="date"
                                            value={form.date} onChange={handleChange} required />
                                    </Field>

                                    <Field
                                        label="Admission Number"
                                        hint="Admission number likhun ba list theke bachun, baki sob auto ashbe."
                                    >
                                        <input type="text" className="form-control" name="admission_no"
                                            list="admission-list" placeholder="Admission Number"
                                            value={form.admission_no} onChange={handleAdmissionChange}
                                            required />
                                        <datalist id="admission-list">
                                            {students.map((s) => (
                                                <option key={s.id} value={s.admission_no}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </datalist>
                                    </Field>

                                    <Field label="Roll No">
                                        <input type="text" className="form-control bg-light" name="roll_no"
                                            placeholder="Auto" value={form.roll_no} readOnly />
                                    </Field>

                                    <Field label="Student Name">
                                        <input type="text" className="form-control bg-light" name="name"
                                            placeholder="Auto" value={form.name} readOnly />
                                    </Field>

                                    <Field label="Class & Section">
                                        <input type="text" className="form-control bg-light" name="class_section"
                                            placeholder="Auto" value={form.class_section} readOnly />
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
                                        {id ? (
                                            <Link to="/attendance" className="btn btn-outline-secondary">
                                                Cancel
                                            </Link>
                                        ) : (
                                            <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                                                Reset
                                            </button>
                                        )}
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

export default function AttendanceForm() {
    const { id } = useParams();
    return id ? <SingleAttendanceForm /> : <BulkAttendanceForm />;
}