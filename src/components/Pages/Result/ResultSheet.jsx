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

const toPercent = (value, total) => {
    const v = Number(value);
    const t = Number(total);
    if (!t || Number.isNaN(v)) return 0;
    return Math.min(100, Math.max(0, (v / t) * 100));
};

function Bar({ percent, low }) {
    return (
        <span className={`result-sheet-bar${low ? " is-low" : ""}`} aria-hidden="true">
            <i style={{ width: `${percent}%` }} />
        </span>
    );
}

function ResultSheetDocument({ result }) {
    const { student, subjects, grade_scales: gradeScales } = result;
    const verdictClass =
        student.overall_result === "Pass"
            ? "result-sheet-pass"
            : student.overall_result === "Fail"
                ? "result-sheet-fail"
                : "result-sheet-incomplete";

    return (
        <article className="result-sheet-print">
            <header className="result-sheet-header">
                <div className="result-sheet-header-main">
                    <div className="result-sheet-kicker">Academic transcript</div>
                    <h1>Examination Result Sheet</h1>
                    <div className="result-sheet-exam">{student.exam_name}</div>
                    <div className="result-sheet-session">Academic session: <strong>{student.session_name}</strong></div>
                </div>
                <div className="result-sheet-seal" aria-label="Overall GPA and grade">
                    <small>Overall GPA</small>
                    <span className="result-sheet-seal-gpa">
                        {student.overall_gpa === null ? "-" : Number(student.overall_gpa).toFixed(2)}
                    </span>
                    <span className="result-sheet-seal-grade">Grade {student.overall_grade || "-"}</span>
                </div>
            </header>

            <section className="result-sheet-student">
                <h2>Student's particulars</h2>
                <dl className="result-sheet-particulars">
                    <div className="result-sheet-wide"><dt>Student's name</dt><dd>{student.student_name}</dd></div>
                    <div><dt>Roll no.</dt><dd>{student.roll_no ?? "-"}</dd></div>
                    <div><dt>Admission no.</dt><dd>{student.admission_number || "-"}</dd></div>
                    <div><dt>Class</dt><dd>{student.class_name}</dd></div>
                    <div><dt>Section</dt><dd>{student.section_name}</dd></div>
                    <div className="result-sheet-wide"><dt>Examination</dt><dd>{student.exam_name}</dd></div>
                </dl>
            </section>

            <section className="result-sheet-subjects">
                <h2>Subject-wise marks and grade</h2>
                <div className="result-sheet-scroll">
                    <table className="result-sheet-table result-sheet-subject-table">
                        <thead>
                            <tr>
                                <th className="result-sheet-subject-number">Sl.</th>
                                <th className="result-sheet-subject-name">Subject</th>
                                <th>Full<br />marks</th>
                                <th>Pass<br />marks</th>
                                <th>Marks<br />obtained</th>
                                <th>Letter<br />grade</th>
                                <th>Grade<br />point</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject, index) => {
                                const hasMarks = subject.obtained_marks !== null;
                                const failed = subject.result_status === "Fail";
                                return (
                                    <tr key={subject.subject_id}>
                                        <td className="result-sheet-subject-number">{String(index + 1).padStart(2, "0")}</td>
                                        <td className="result-sheet-subject-name">
                                            <strong>{subject.subject_name}</strong>
                                            {subject.subject_code && <small>{subject.subject_code}</small>}
                                        </td>
                                        <td>{Number(subject.full_marks).toFixed(2)}</td>
                                        <td>{Number(subject.pass_marks).toFixed(2)}</td>
                                        <td className="result-sheet-marks-cell">
                                            <span className="result-sheet-marks">
                                                {hasMarks ? Number(subject.obtained_marks).toFixed(2) : "-"}
                                            </span>
                                            {hasMarks && (
                                                <Bar
                                                    percent={toPercent(subject.obtained_marks, subject.full_marks)}
                                                    low={Number(subject.obtained_marks) < Number(subject.pass_marks)}
                                                />
                                            )}
                                        </td>
                                        <td>{subject.grade ? <span className="result-sheet-pill">{subject.grade}</span> : "-"}</td>
                                        <td>{subject.gpa_point === null ? "-" : Number(subject.gpa_point).toFixed(2)}</td>
                                        <td className={failed ? "result-sheet-status-fail" : subject.result_status === "Pass" ? "result-sheet-status-pass" : ""}>
                                            {subject.result_status}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colSpan="2">Total marks</th>
                                <th>{Number(student.total_full_marks).toFixed(2)}</th>
                                <th>-</th>
                                <th>{Number(student.total_obtained).toFixed(2)}</th>
                                <th colSpan="3"></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </section>

            <div className="result-sheet-lower">
                <section className="result-sheet-grade-scale" aria-label="Grade scale">
                    <h2>Grading scale</h2>
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

                <section className="result-sheet-summary" aria-label="Result summary">
                    <div>
                        <div className="result-sheet-percent-label">
                            <span>Percentage</span>
                        </div>
                        <div className="result-sheet-percent-value">{Number(student.percentage).toFixed(2)}%</div>
                    </div>
                    <Bar percent={Math.min(100, Math.max(0, Number(student.percentage)))} />
                    <div className="result-sheet-verdict">
                        <span>Final result</span>
                        <strong className={`result-sheet-stamp ${verdictClass}`}>{student.overall_result}</strong>
                    </div>
                </section>
            </div>

            <footer className="result-sheet-signatures">
                <div><span>Class teacher</span></div>
                <div><span>Guardian</span></div>
                <div><span>Head of institution</span></div>
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
