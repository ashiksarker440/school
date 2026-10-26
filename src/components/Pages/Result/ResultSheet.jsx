import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";
import "./ResultSheet.css";

const EMPTY_FILTERS = {
    session_id: "",
    class_id: "",
    section_id: "",
    exam_id: "",
    student_id: "",
};

function SelectField({ id, label, value, options, disabled, onChange, optionLabel }) {
    return (
        <div className="col-12 col-sm-6 col-xl">
            <label className="form-label" htmlFor={id}>{label}</label>
            <select
                id={id}
                className="form-select"
                value={value}
                onChange={onChange}
                disabled={disabled}
                required
            >
                <option value="">Select {label.toLowerCase()}</option>
                {options.map((option) => (
                    <option key={option.id} value={option.id}>{optionLabel(option)}</option>
                ))}
            </select>
        </div>
    );
}

function getErrorMessage(error, fallback) {
    return error.response?.data?.message || fallback;
}

function ResultSheetDocument({ result }) {
    const { student, subjects, grade_scales: gradeScales } = result;
    const passed = student.overall_result === "Pass";

    return (
        <article className="result-sheet-print">
            <header className="result-sheet-header">
                <div className="result-sheet-header-main">
                    <div className="result-sheet-kicker">ACADEMIC TRANSCRIPT</div>
                    <h1>Examination Result Sheet</h1>
                    <div className="result-sheet-exam">{student.exam_name}</div>
                    <div className="result-sheet-session">Academic Session: <strong>{student.session_name}</strong></div>
                </div>
                <section className="result-sheet-grade-scale" aria-label="Grade scale">
                    <h2>Grading Scale</h2>
                    <table className="result-sheet-table result-sheet-grade-table">
                        <thead>
                            <tr>
                                <th>Marks (%)</th>
                                <th>Grade</th>
                                <th>GPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gradeScales.map((scale) => (
                                <tr key={scale.grade}>
                                    <td>{Number(scale.min_mark)}–{Number(scale.max_mark)}</td>
                                    <td><strong>{scale.grade}</strong></td>
                                    <td>{Number(scale.gpa_point).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </header>

            <section className="result-sheet-student">
                <h2>Student's Particulars</h2>
                <table className="result-sheet-table result-sheet-particulars-table">
                    <tbody>
                        <tr>
                            <th>Student's Name</th>
                            <td>{student.student_name}</td>
                            <th>Roll No.</th>
                            <td>{student.roll_no ?? "-"}</td>
                        </tr>
                        <tr>
                            <th>Admission No.</th>
                            <td>{student.admission_number || "-"}</td>
                            <th>Class</th>
                            <td>{student.class_name}</td>
                        </tr>
                        <tr>
                            <th>Section</th>
                            <td>{student.section_name}</td>
                            <th>Examination</th>
                            <td>{student.exam_name}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section className="result-sheet-subjects">
                <h2>Subject-wise Marks and Grade</h2>
                <table className="result-sheet-table result-sheet-subject-table">
                    <thead>
                        <tr>
                            <th className="result-sheet-subject-number">Sl.</th>
                            <th className="result-sheet-subject-name">Subject</th>
                            <th>Full<br />Marks</th>
                            <th>Pass<br />Marks</th>
                            <th>Marks<br />Obtained</th>
                            <th>Letter<br />Grade</th>
                            <th>Grade<br />Point</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((subject, index) => (
                            <tr key={subject.subject_id}>
                                <td className="result-sheet-subject-number">{String(index + 1).padStart(2, "0")}</td>
                                <td className="result-sheet-subject-name">
                                    <strong>{subject.subject_name}</strong>
                                    {subject.subject_code && <small>{subject.subject_code}</small>}
                                </td>
                                <td>{Number(subject.full_marks).toFixed(2)}</td>
                                <td>{Number(subject.pass_marks).toFixed(2)}</td>
                                <td className="result-sheet-marks">
                                    {subject.obtained_marks === null ? "-" : Number(subject.obtained_marks).toFixed(2)}
                                </td>
                                <td>{subject.grade || "-"}</td>
                                <td>{subject.gpa_point === null ? "-" : Number(subject.gpa_point).toFixed(2)}</td>
                                <td>{subject.result_status}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colSpan="2">Total Marks</th>
                            <th>{Number(student.total_full_marks).toFixed(2)}</th>
                            <th>-</th>
                            <th className="result-sheet-marks">{Number(student.total_obtained).toFixed(2)}</th>
                            <th colSpan="3"></th>
                        </tr>
                    </tfoot>
                </table>
            </section>

            <section className="result-sheet-summary">
                <div className="result-sheet-stat">
                    <span>Percentage</span>
                    <strong>{Number(student.percentage).toFixed(2)}%</strong>
                </div>
                <div className="result-sheet-stat">
                    <span>Overall GPA</span>
                    <strong>{student.overall_gpa === null ? "-" : Number(student.overall_gpa).toFixed(2)}</strong>
                </div>
                <div className="result-sheet-stat">
                    <span>Overall Grade</span>
                    <strong>{student.overall_grade || "-"}</strong>
                </div>
                <div className="result-sheet-stat result-sheet-final-status">
                    <span>Final Result</span>
                    <strong className={passed ? "result-sheet-pass" : student.overall_result === "Fail" ? "result-sheet-fail" : "result-sheet-incomplete"}>
                        {student.overall_result}
                    </strong>
                </div>
            </section>

            <footer className="result-sheet-signatures">
                <div><span>Class Teacher</span></div>
                <div><span>Guardian</span></div>
                <div><span>Head of Institution</span></div>
            </footer>
        </article>
    );
}

export default function ResultSheet() {
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [options, setOptions] = useState({
        sessions: [],
        classes: [],
        sections: [],
        students: [],
        exams: [],
    });
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingResult, setLoadingResult] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const studentRequestId = useRef(0);

    useEffect(() => {
        let active = true;
        axios.get("ResultSheet/options.php")
            .then((response) => {
                if (!response.data.status) {
                    throw new Error(response.data.message || "Could not load result sheet options.");
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
                console.error("Error loading result sheet options:", requestError);
                if (active) setError(getErrorMessage(requestError, requestError.message || "Could not load result sheet options."));
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
        if (!filters.class_id) return () => { active = false; };
        axios.get("ResultSheet/options.php", { params: { class_id: filters.class_id } })
            .then((response) => {
                if (!response.data.status) throw new Error(response.data.message || "Could not load sections.");
                if (active) setOptions((previous) => ({ ...previous, sections: response.data.data?.sections || [] }));
            })
            .catch((requestError) => {
                console.error("Error loading result sheet sections:", requestError);
                if (active) setError(getErrorMessage(requestError, requestError.message || "Could not load sections."));
            });
        return () => { active = false; };
    }, [filters.class_id]);

    const loadStudents = async (sessionId, classId, sectionId) => {
        const requestId = ++studentRequestId.current;
        setLoadingStudents(true);
        try {
            const response = await axios.get("ResultSheet/options.php", {
                params: { session_id: sessionId, class_id: classId, section_id: sectionId },
            });
            if (!response.data.status) {
                throw new Error(response.data.message || "Could not load students.");
            }
            if (requestId === studentRequestId.current) {
                setOptions((previous) => ({ ...previous, students: response.data.data?.students || [] }));
            }
        } catch (requestError) {
            console.error("Error loading result sheet students:", requestError);
            if (requestId === studentRequestId.current) {
                setOptions((previous) => ({ ...previous, students: [] }));
                setError(getErrorMessage(requestError, requestError.message || "Could not load students."));
            }
        } finally {
            if (requestId === studentRequestId.current) setLoadingStudents(false);
        }
    };

    const changeFilter = (name) => (event) => {
        const { value } = event.target;
        setFilters((previous) => ({
            ...previous,
            [name]: value,
            ...(name === "class_id" ? { section_id: "", student_id: "" } : {}),
            ...(name === "session_id" ? { section_id: "", student_id: "" } : {}),
            ...(name === "section_id" ? { student_id: "" } : {}),
        }));
        if (name === "class_id") setOptions((previous) => ({ ...previous, sections: [], students: [] }));
        if (["session_id", "section_id"].includes(name)) setOptions((previous) => ({ ...previous, students: [] }));
        if (["session_id", "class_id"].includes(name)) {
            studentRequestId.current++;
            setLoadingStudents(false);
        }
        if (name === "section_id" && value && filters.session_id && filters.class_id) {
            loadStudents(filters.session_id, filters.class_id, value);
        }
        setResult(null);
        setError("");
    };

    const showResult = async (event) => {
        event.preventDefault();
        if (Object.values(filters).some((value) => !value)) {
            setError("Select an academic session, class, section, exam, and student.");
            return;
        }
        setError("");
        setResult(null);
        setLoadingResult(true);
        try {
            const response = await axios.get("ResultSheet/show.php", { params: filters });
            if (!response.data.status) {
                setError(response.data.message || "Could not load this result sheet.");
                return;
            }
            setResult(response.data.data);
        } catch (requestError) {
            console.error("Error loading result sheet:", requestError);
            setError(getErrorMessage(requestError, "Could not load this result sheet."));
        } finally {
            setLoadingResult(false);
        }
    };

    return (
        <Layout>
            <div className="container-fluid py-4 result-sheet-page">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-3 d-print-none">
                    <h4 className="mb-0">Student Result Sheet</h4>
                    <Link className="btn btn-outline-secondary" to="/Result">Back to Results</Link>
                </div>

                <div className="card shadow-sm mb-4 d-print-none">
                    <div className="card-header"><h5 className="mb-0">Choose student and exam</h5></div>
                    <div className="card-body">
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                        <form onSubmit={showResult}>
                            <div className="row g-3 align-items-end">
                                <SelectField id="result-session" label="Academic session" value={filters.session_id}
                                    options={options.sessions} disabled={loadingOptions} onChange={changeFilter("session_id")}
                                    optionLabel={(item) => item.name} />
                                <SelectField id="result-class" label="Class" value={filters.class_id}
                                    options={options.classes} disabled={loadingOptions} onChange={changeFilter("class_id")}
                                    optionLabel={(item) => item.name} />
                                <SelectField id="result-section" label="Section" value={filters.section_id}
                                    options={options.sections} disabled={!filters.class_id || loadingOptions}
                                    onChange={changeFilter("section_id")} optionLabel={(item) => item.name} />
                                <SelectField id="result-exam" label="Exam" value={filters.exam_id}
                                    options={options.exams} disabled={loadingOptions} onChange={changeFilter("exam_id")}
                                    optionLabel={(item) => item.exam_name} />
                                <SelectField id="result-student" label="Student" value={filters.student_id}
                                    options={options.students} disabled={loadingOptions || loadingStudents}
                                    onChange={changeFilter("student_id")}
                                    optionLabel={(item) => `${item.name} — Roll ${item.roll_no ?? "-"}${item.admission_number ? ` (${item.admission_number})` : ""}`} />
                                <div className="col-12 d-flex gap-2">
                                    <button className="btn btn-primary" type="submit" disabled={loadingResult || loadingOptions}>
                                        {loadingResult ? "Loading result..." : "Show Result"}
                                    </button>
                                    {result && (
                                        <button className="btn btn-success" type="button" onClick={() => window.print()}>
                                            Print A4
                                        </button>
                                    )}
                                </div>
                            </div>
                            {loadingStudents && <div className="form-text mt-2">Loading enrolled students...</div>}
                        </form>
                    </div>
                </div>

                {result ? (
                    <ResultSheetDocument result={result} />
                ) : !loadingResult && (
                    <div className="alert alert-info d-print-none">
                        Select the filters above and choose <strong>Show Result</strong> to display a student result sheet.
                    </div>
                )}
            </div>
        </Layout>
    );
}
