import { useEffect, useMemo, useState } from "react";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const EMPTY_FILTERS = {
    session_id: "",
    class_id: "",
    section_id: "",
    subject_id: "",
    exam_id: "",
};

function FilterField({ label, name, value, options, disabled, onChange }) {
    return (
        <div className="col-12 col-sm-6 col-xl">
            <label className="form-label" htmlFor={name}>{label}</label>
            <select
                id={name}
                name={name}
                className="form-select"
                value={value}
                disabled={disabled}
                onChange={onChange}
                required
            >
                <option value="">Select {label.toLowerCase()}</option>
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || fallback;

export default function StudentSubjectMarksPage() {
    const [options, setOptions] = useState({
        sessions: [],
        classes: [],
        sections: [],
        subjects: [],
        exams: [],
    });
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [students, setStudents] = useState([]);
    const [fullMarks, setFullMarks] = useState(null);
    const [passMarks, setPassMarks] = useState(null);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;
        axios.get("StudentSubjectMarks/options.php")
            .then((response) => {
                if (!response.data.status) {
                    throw new Error(response.data.message || "Could not load options.");
                }
                if (!active) return;
                const data = response.data.data || {};
                setOptions((previous) => ({ ...previous, ...data }));
                const currentSession = data.sessions?.find((session) => Number(session.is_current) === 1);
                if (currentSession) {
                    setFilters((previous) => ({ ...previous, session_id: String(currentSession.id) }));
                }
            })
            .catch((requestError) => {
                console.error("Error loading student subject marks options:", requestError);
                if (active) setError(getErrorMessage(requestError, requestError.message || "Could not load filter options."));
            })
            .finally(() => {
                if (active) setLoadingOptions(false);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        if (!filters.class_id) {
            return () => {
                active = false;
            };
        }

        axios.get(`StudentSubjectMarks/options.php?class_id=${encodeURIComponent(filters.class_id)}`)
            .then((response) => {
                if (!response.data.status) {
                    throw new Error(response.data.message || "Could not load sections.");
                }
                if (active) setOptions((previous) => ({ ...previous, sections: response.data.data?.sections || [] }));
            })
            .catch((requestError) => {
                console.error("Error loading sections:", requestError);
                if (active) setError(getErrorMessage(requestError, requestError.message || "Could not load sections."));
            });
        return () => {
            active = false;
        };
    }, [filters.class_id]);

    const changeFilter = (event) => {
        const { name, value } = event.target;
        setFilters((previous) => ({
            ...previous,
            [name]: value,
            ...(name === "class_id" ? { section_id: "" } : {}),
        }));
        if (name === "class_id") {
            setOptions((previous) => ({ ...previous, sections: [] }));
        }
        setStudents([]);
        setFullMarks(null);
        setPassMarks(null);
        setError("");
        setSuccess("");
    };

    const loadStudents = async (selectedFilters = filters) => {
        setError("");
        setSuccess("");
        setLoadingStudents(true);
        try {
            const response = await axios.get("StudentSubjectMarks/students.php", { params: selectedFilters });
            if (!response.data.status) {
                setError(response.data.message || "Could not load students.");
                return false;
            }
            const data = response.data.data;
            setStudents((data.students || []).map((student) => ({
                ...student,
                inputMarks: student.obtained_marks === null ? "" : String(student.obtained_marks),
            })));
            setFullMarks(Number(data.full_marks));
            setPassMarks(Number(data.pass_marks));
            return true;
        } catch (requestError) {
            console.error("Error loading student roster:", requestError);
            setError(getErrorMessage(requestError, "Could not load students."));
            return false;
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleGetStudents = (event) => {
        event.preventDefault();
        if (Object.values(filters).some((value) => !value)) {
            setError("Select an academic session, class, section, subject, and exam.");
            return;
        }
        loadStudents();
    };

    const updateMarks = (studentId, value) => {
        setStudents((previous) => previous.map((student) => (
            student.student_id === studentId ? { ...student, inputMarks: value } : student
        )));
        setError("");
        setSuccess("");
    };

    const handleReset = () => {
        setStudents((previous) => previous.map((student) => ({
            ...student,
            inputMarks: student.obtained_marks === null ? "" : String(student.obtained_marks),
        })));
        setError("");
        setSuccess("");
    };

    const handleSave = async () => {
        setError("");
        setSuccess("");
        for (const student of students) {
            if (student.inputMarks === "") continue;
            const value = Number(student.inputMarks);
            if (!Number.isFinite(value) || value < 0 || value > fullMarks) {
                setError(`Marks for ${student.name} must be between 0 and ${fullMarks}.`);
                return;
            }
        }

        const formData = new FormData();
        Object.entries(filters).forEach(([key, value]) => formData.set(key, value));
        formData.set("records", JSON.stringify(students.map((student) => ({
            student_id: student.student_id,
            obtained_marks: student.inputMarks,
        }))));

        setSaving(true);
        try {
            const response = await axios.post("StudentSubjectMarks/save.php", formData);
            if (!response.data.status) {
                setError(response.data.message || "Could not save marks.");
                return;
            }
            const result = response.data.data || {};
            await loadStudents();
            setSuccess(`${response.data.message} ${result.inserted || 0} added, ${result.updated || 0} updated, ${result.skipped || 0} blank rows skipped.`);
        } catch (requestError) {
            console.error("Error saving student marks:", requestError);
            setError(getErrorMessage(requestError, "Could not save marks."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (student) => {
        if (!student.mark_id || !window.confirm(`Delete saved marks for ${student.name}?`)) return;
        setError("");
        setSuccess("");
        setDeletingId(student.mark_id);
        try {
            const response = await axios.delete(`StudentSubjectMarks/delete.php?id=${encodeURIComponent(student.mark_id)}`);
            if (!response.data.status) {
                setError(response.data.message || "Could not delete marks.");
                return;
            }
            await loadStudents();
            setSuccess(`Saved marks for ${student.name} were deleted.`);
        } catch (requestError) {
            console.error("Error deleting student marks:", requestError);
            setError(getErrorMessage(requestError, "Could not delete marks."));
        } finally {
            setDeletingId(null);
        }
    };

    const classOptions = useMemo(() => options.classes.map((item) => ({ id: item.id, label: item.name })), [options.classes]);
    const sessionOptions = useMemo(() => options.sessions.map((item) => ({ id: item.id, label: item.name })), [options.sessions]);
    const sectionOptions = useMemo(() => options.sections.map((item) => ({ id: item.id, label: item.name })), [options.sections]);
    const subjectOptions = useMemo(() => options.subjects.map((item) => ({
        id: item.id,
        label: `${item.name}${item.code ? ` (${item.code})` : ""}`,
    })), [options.subjects]);
    const examOptions = useMemo(() => options.exams.map((item) => ({ id: item.id, label: item.exam_name })), [options.exams]);

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <h4 className="mb-0">Bulk Student Exam Marks</h4>
                </div>

                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {success && <div className="alert alert-success" role="status">{success}</div>}

                <div className="card shadow-sm mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">Select exam and class</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleGetStudents}>
                            <div className="row g-3 align-items-end">
                                <FilterField label="Academic session" name="session_id" value={filters.session_id}
                                    options={sessionOptions} disabled={loadingOptions} onChange={changeFilter} />
                                <FilterField label="Class" name="class_id" value={filters.class_id}
                                    options={classOptions} disabled={loadingOptions} onChange={changeFilter} />
                                <FilterField label="Section" name="section_id" value={filters.section_id}
                                    options={sectionOptions} disabled={!filters.class_id || loadingOptions} onChange={changeFilter} />
                                <FilterField label="Subject" name="subject_id" value={filters.subject_id}
                                    options={subjectOptions} disabled={loadingOptions} onChange={changeFilter} />
                                <FilterField label="Exam" name="exam_id" value={filters.exam_id}
                                    options={examOptions} disabled={loadingOptions} onChange={changeFilter} />
                                <div className="col-12">
                                    <button className="btn btn-primary" type="submit" disabled={loadingOptions || loadingStudents}>
                                        {loadingStudents ? "Loading students..." : "Get Students"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <div>
                            <h5 className="mb-1">Student marks</h5>
                            {fullMarks !== null && (
                                <div className="small text-muted">Full marks: {fullMarks} · Pass marks: {passMarks}</div>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <button type="button" className="btn btn-outline-secondary btn-sm"
                                onClick={handleReset} disabled={!students.length || saving}>
                                Reset changes
                            </button>
                            <button type="button" className="btn btn-success btn-sm"
                                onClick={handleSave} disabled={!students.length || saving || loadingStudents}>
                                {saving ? "Saving..." : "Save Marks"}
                            </button>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Student Name</th>
                                        <th>Full Marks</th>
                                        <th>Pass Marks</th>
                                        <th style={{ minWidth: "160px" }}>Obtained Marks</th>
                                        <th>Previous Marks</th>
                                        <th>Grade / GPA</th>
                                        <th>Result</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingStudents ? (
                                        <tr><td colSpan="9" className="text-center py-4">Loading students...</td></tr>
                                    ) : students.length === 0 ? (
                                        <tr><td colSpan="9" className="text-center text-muted py-4">
                                            Choose all filters and select Get Students to load the roster.
                                        </td></tr>
                                    ) : students.map((student) => (
                                        <tr key={student.student_id}>
                                            <td>{student.roll_no ?? "-"}</td>
                                            <td>{student.name}</td>
                                            <td>{fullMarks}</td>
                                            <td>{passMarks}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    min="0"
                                                    max={fullMarks}
                                                    step="0.01"
                                                    aria-label={`Obtained marks for ${student.name}`}
                                                    value={student.inputMarks}
                                                    onChange={(event) => updateMarks(student.student_id, event.target.value)}
                                                />
                                            </td>
                                            <td>{student.obtained_marks ?? "-"}</td>
                                            <td>{student.grade ? `${student.grade} / ${student.gpa_point}` : "-"}</td>
                                            <td>{student.mark_id ? (Number(student.is_pass) === 1 ? "Pass" : "Fail") : "-"}</td>
                                            <td className="text-end">
                                                {student.mark_id && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        disabled={deletingId === student.mark_id || saving}
                                                        onClick={() => handleDelete(student)}
                                                    >
                                                        {deletingId === student.mark_id ? "Deleting..." : "Delete"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
