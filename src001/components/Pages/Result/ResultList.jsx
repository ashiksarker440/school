import { useState, useMemo } from "react";
import {
    DEMO_STUDENTS,
    SUBJECTS,
    PASS_MARKS,
    GRADE_TABLE,
    FilterBar,
    ResultBadge,
    useResultStore,
    calcResult,
    markKey,
    buildRanks,
    viewResult,
} from "./ResultForm";

/* =====================================================================
   LIST: Student Result / Subject-wise Marks / Result Report
   onView (optional): "View Sheet" click korle onno page-e jawar jonno, jemon () => navigate("/result/show")
   ===================================================================== */
export default function ResultList({ students = DEMO_STUDENTS, onView }) {
    const { marks } = useResultStore();

    const [tab, setTab] = useState("student");
    const [examType, setExamType] = useState("1st Term");
    const [classId, setClassId] = useState("Class 1");
    const [section, setSection] = useState("A");

    const classStudents = useMemo(
        () => students.filter((s) => s.classId === classId && s.section === section),
        [students, classId, section]
    );

    const rows = useMemo(
        () => classStudents.map((s) => ({ student: s, result: calcResult(marks[markKey(examType, s.id)]) })),
        [classStudents, marks, examType]
    );

    const ranks = useMemo(() => buildRanks(classStudents, marks, examType), [classStudents, marks, examType]);

    // ----- Report numbers -----
    const complete = rows.filter((r) => r.result.complete);
    const passedRows = complete.filter((r) => r.result.passed);
    const failedRows = complete.filter((r) => !r.result.passed);
    const passRate = complete.length ? Math.round((passedRows.length / complete.length) * 100) : 0;
    const avgGpa = complete.length
        ? (complete.reduce((a, r) => a + Number(r.result.gpa), 0) / complete.length).toFixed(2)
        : "0.00";
    const topRows = [...passedRows].sort((a, b) => ranks[a.student.id] - ranks[b.student.id]).slice(0, 3);

    const gradeCounts = {};
    GRADE_TABLE.forEach((g) => (gradeCounts[g.grade] = 0));
    complete.forEach((r) => gradeCounts[r.result.grade]++);

    const subjectStats = SUBJECTS.map((sub) => {
        const values = rows
            .map((r) => r.result.subjects.find((s) => s.subject === sub).marks)
            .filter((m) => m !== null);
        return {
            sub,
            entered: values.length,
            highest: values.length ? Math.max(...values) : null,
            average: values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : null,
            passRate: values.length ? Math.round((values.filter((m) => m >= PASS_MARKS).length / values.length) * 100) : null,
        };
    });

    const handleView = (studentId) => {
        viewResult(examType, classId, section, studentId);
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (onView) onView(studentId);
    };

    const tabs = [
        { id: "student", label: "Student Result" },
        { id: "subject", label: "Subject-wise Marks" },
        { id: "report", label: "Result Report" },
    ];

    return (
        <div className="container-fluid py-4">
            <FilterBar examType={examType} classId={classId} section={section}
                onExamType={setExamType} onClass={setClassId} onSection={setSection} />

            <ul className="nav nav-tabs mb-3 d-print-none">
                {tabs.map((t) => (
                    <li className="nav-item" key={t.id}>
                        <button type="button" className={`nav-link ${tab === t.id ? "active" : ""}`}
                            onClick={() => setTab(t.id)}>
                            {t.label}
                        </button>
                    </li>
                ))}
            </ul>

            {/* ================= Student Result ================= */}
            {tab === "student" && (
                <div className="card shadow-sm">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">Student Result - {examType} ({classId} - {section})</h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Admission No</th>
                                        <th>Name</th>
                                        <th className="text-center">Total</th>
                                        <th className="text-center">%</th>
                                        <th className="text-center">GPA</th>
                                        <th className="text-center">Grade</th>
                                        <th className="text-center">Result</th>
                                        <th className="text-center">Merit</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr><td colSpan="9" className="text-center text-muted py-4">No students found.</td></tr>
                                    ) : (
                                        rows.map(({ student, result }) => (
                                            <tr key={student.id}>
                                                <td>{student.admissionNumber}</td>
                                                <td>{student.name}</td>
                                                <td className="text-center">{result.complete ? result.total : "-"}</td>
                                                <td className="text-center">{result.complete ? `${result.percentage.toFixed(1)}%` : "-"}</td>
                                                <td className="text-center fw-bold">{result.complete ? result.gpa : "-"}</td>
                                                <td className="text-center fw-bold">{result.complete ? result.grade : "-"}</td>
                                                <td className="text-center"><ResultBadge result={result} /></td>
                                                <td className="text-center">{ranks[student.id] || "-"}</td>
                                                <td className="text-end">
                                                    <button className="btn btn-sm btn-info" disabled={!result.complete}
                                                        onClick={() => handleView(student.id)}>View Sheet</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= Subject-wise Marks ================= */}
            {tab === "subject" && (
                <div className="card shadow-sm">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0">Subject-wise Marks - {examType} ({classId} - {section})</h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-bordered table-sm align-middle text-center mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-start">Name</th>
                                        {SUBJECTS.map((sub) => <th key={sub}>{sub}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr><td colSpan={SUBJECTS.length + 1} className="text-muted py-4">No students found.</td></tr>
                                    ) : (
                                        rows.map(({ student, result }) => (
                                            <tr key={student.id}>
                                                <td className="text-start text-nowrap">{student.name}</td>
                                                {result.subjects.map((s) => (
                                                    <td key={s.subject}>
                                                        {s.marks === null ? (
                                                            <span className="text-muted">-</span>
                                                        ) : (
                                                            <>
                                                                <span className={s.pass ? "" : "text-danger fw-bold"}>{s.marks}</span>{" "}
                                                                <small className="text-muted">({s.grade})</small>
                                                            </>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="table-light">
                                    <tr>
                                        <th className="text-start">Highest</th>
                                        {subjectStats.map((s) => <th key={s.sub}>{s.highest ?? "-"}</th>)}
                                    </tr>
                                    <tr>
                                        <th className="text-start">Average</th>
                                        {subjectStats.map((s) => <th key={s.sub}>{s.average ?? "-"}</th>)}
                                    </tr>
                                    <tr>
                                        <th className="text-start">Pass Rate</th>
                                        {subjectStats.map((s) => <th key={s.sub}>{s.passRate === null ? "-" : `${s.passRate}%`}</th>)}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= Result Report ================= */}
            {tab === "report" && (
                <div className="card shadow-sm">
                    <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Result Report - {examType} ({classId} - {section})</h5>
                        <button type="button" className="btn btn-sm btn-light d-print-none" onClick={() => window.print()}>Print</button>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-4 text-center">
                            <div className="col-6 col-md-2"><div className="border rounded p-2"><div className="text-muted small">Students</div><div className="fs-4 fw-bold">{complete.length}</div></div></div>
                            <div className="col-6 col-md-2"><div className="border rounded p-2"><div className="text-muted small">Passed</div><div className="fs-4 fw-bold text-success">{passedRows.length}</div></div></div>
                            <div className="col-6 col-md-2"><div className="border rounded p-2"><div className="text-muted small">Failed</div><div className="fs-4 fw-bold text-danger">{failedRows.length}</div></div></div>
                            <div className="col-6 col-md-3"><div className="border rounded p-2"><div className="text-muted small">Pass Rate</div><div className="fs-4 fw-bold">{passRate}%</div></div></div>
                            <div className="col-12 col-md-3"><div className="border rounded p-2"><div className="text-muted small">Average GPA</div><div className="fs-4 fw-bold">{avgGpa}</div></div></div>
                        </div>

                        {complete.length === 0 ? (
                            <p className="text-muted mb-0">Ei exam-er kono result enter kora hoyni.</p>
                        ) : (
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <h6>Grade Distribution</h6>
                                    <table className="table table-bordered table-sm text-center">
                                        <thead className="table-light">
                                            <tr><th>Grade</th><th>GPA</th><th>Marks</th><th>Students</th></tr>
                                        </thead>
                                        <tbody>
                                            {GRADE_TABLE.map((g) => (
                                                <tr key={g.grade}>
                                                    <td className="fw-bold">{g.grade}</td>
                                                    <td>{g.gp.toFixed(2)}</td>
                                                    <td>{g.range}</td>
                                                    <td>{gradeCounts[g.grade]}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="col-md-6">
                                    <h6>Top Performers</h6>
                                    <table className="table table-bordered table-sm">
                                        <thead className="table-light">
                                            <tr><th>Merit</th><th>Name</th><th>GPA</th><th>Total</th></tr>
                                        </thead>
                                        <tbody>
                                            {topRows.length === 0 ? (
                                                <tr><td colSpan="4" className="text-center text-muted">No passed students.</td></tr>
                                            ) : (
                                                topRows.map((r) => (
                                                    <tr key={r.student.id}>
                                                        <td>{ranks[r.student.id]}</td>
                                                        <td>{r.student.name}</td>
                                                        <td>{r.result.gpa}</td>
                                                        <td>{r.result.total}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>

                                    <h6 className="mt-3">Failed Students</h6>
                                    <table className="table table-bordered table-sm">
                                        <thead className="table-light">
                                            <tr><th>Name</th><th>Failed Subject(s)</th></tr>
                                        </thead>
                                        <tbody>
                                            {failedRows.length === 0 ? (
                                                <tr><td colSpan="2" className="text-center text-muted">Kew fail koreni 🎉</td></tr>
                                            ) : (
                                                failedRows.map((r) => (
                                                    <tr key={r.student.id}>
                                                        <td>{r.student.name}</td>
                                                        <td className="text-danger">{r.result.failedSubjects.join(", ")}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="col-12">
                                    <h6>Subject-wise Summary</h6>
                                    <table className="table table-bordered table-sm text-center">
                                        <thead className="table-light">
                                            <tr><th className="text-start">Subject</th><th>Highest</th><th>Average</th><th>Pass Rate</th></tr>
                                        </thead>
                                        <tbody>
                                            {subjectStats.map((s) => (
                                                <tr key={s.sub}>
                                                    <td className="text-start">{s.sub}</td>
                                                    <td>{s.highest ?? "-"}</td>
                                                    <td>{s.average ?? "-"}</td>
                                                    <td>{s.passRate === null ? "-" : `${s.passRate}%`}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
