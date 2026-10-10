import { useState, useMemo, useEffect } from "react";
import {
    DEMO_STUDENTS,
    SCHOOL_NAME,
    FULL_MARKS,
    GRADE_TABLE,
    FilterBar,
    useResultStore,
    calcResult,
    markKey,
    buildRanks,
} from "./ResultForm";

// Ekta student-er Result Sheet (Marksheet)
function ResultSheet({ student, examType, result, rank }) {
    const year = new Date().getFullYear();

    return (
        <div className="result-sheet border border-2 rounded p-4 mb-4 bg-white">
            <div className="text-center mb-3">
                <h3 className="mb-0">{SCHOOL_NAME}</h3>
                <h5 className="mb-0">Result Sheet</h5>
                <div className="text-muted">{examType} Examination - {year}</div>
            </div>

            <div className="row mb-3">
                <div className="col-6"><strong>Name:</strong> {student.name}</div>
                <div className="col-6"><strong>Admission No:</strong> {student.admissionNumber}</div>
                <div className="col-6"><strong>Class:</strong> {student.classId}</div>
                <div className="col-6"><strong>Section:</strong> {student.section}</div>
            </div>

            {!result.complete ? (
                <div className="alert alert-warning">Ei student-er result ekhono enter kora hoyni.</div>
            ) : (
                <>
                    <table className="table table-bordered text-center align-middle">
                        <thead className="table-light">
                            <tr>
                                <th className="text-start">Subject</th>
                                <th>Full Marks</th>
                                <th>Obtained</th>
                                <th>Grade</th>
                                <th>Grade Point</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.subjects.map((s) => (
                                <tr key={s.subject}>
                                    <td className="text-start">{s.subject}</td>
                                    <td>{FULL_MARKS}</td>
                                    <td className={s.pass ? "" : "text-danger fw-bold"}>{s.marks}</td>
                                    <td>{s.grade}</td>
                                    <td>{s.gp.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="fw-bold">
                                <td className="text-start">Total</td>
                                <td>{result.subjects.length * FULL_MARKS}</td>
                                <td>{result.total}</td>
                                <td colSpan="2">{result.percentage.toFixed(1)}%</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="row text-center mb-3">
                        <div className="col-3"><div className="border rounded p-2"><div className="small text-muted">GPA</div><div className="fs-4 fw-bold">{result.gpa}</div></div></div>
                        <div className="col-3"><div className="border rounded p-2"><div className="small text-muted">Grade</div><div className="fs-4 fw-bold">{result.grade}</div></div></div>
                        <div className="col-3">
                            <div className="border rounded p-2">
                                <div className="small text-muted">Result</div>
                                <div className={`fs-4 fw-bold ${result.passed ? "text-success" : "text-danger"}`}>{result.passed ? "PASS" : "FAIL"}</div>
                            </div>
                        </div>
                        <div className="col-3"><div className="border rounded p-2"><div className="small text-muted">Merit Position</div><div className="fs-4 fw-bold">{rank || "-"}</div></div></div>
                    </div>

                    {!result.passed && (
                        <p className="text-danger">Failed in: {result.failedSubjects.join(", ")}</p>
                    )}

                    <div className="small text-muted mb-4">
                        Grading: {GRADE_TABLE.map((g) => `${g.range} = ${g.grade} (${g.gp.toFixed(2)})`).join(" | ")}
                    </div>
                </>
            )}

            <div className="row text-center mt-5 pt-3">
                <div className="col-4"><div className="border-top pt-1">Class Teacher</div></div>
                <div className="col-4"><div className="border-top pt-1">Guardian</div></div>
                <div className="col-4"><div className="border-top pt-1">Principal</div></div>
            </div>
        </div>
    );
}

/* =====================================================================
   SHOW: Printable Result Sheet (ekjon ba pura class)
   ===================================================================== */
export default function ResultShow({ students = DEMO_STUDENTS }) {
    const { marks, viewing } = useResultStore();

    const [examType, setExamType] = useState("1st Term");
    const [classId, setClassId] = useState("Class 1");
    const [section, setSection] = useState("A");
    const [studentId, setStudentId] = useState("");
    const [printAll, setPrintAll] = useState(false);

    // List theke "View Sheet" click korle ekhane student select hoye jabe
    useEffect(() => {
        if (viewing) {
            setExamType(viewing.examType);
            setClassId(viewing.classId);
            setSection(viewing.section);
            setStudentId(String(viewing.studentId));
            setPrintAll(false);
        }
    }, [viewing]);

    const classStudents = useMemo(
        () => students.filter((s) => s.classId === classId && s.section === section),
        [students, classId, section]
    );

    const ranks = useMemo(() => buildRanks(classStudents, marks, examType), [classStudents, marks, examType]);

    const current = classStudents.find((s) => String(s.id) === studentId) || classStudents[0];
    const sheets = printAll ? classStudents : current ? [current] : [];

    return (
        <div className="container-fluid py-4">
            {/* Print korar somoy sheet-er baire ja ache ta lukiye jabe, ar prottek sheet alada page-e */}
            <style>{`
                @media print {
                    .result-sheet { page-break-after: always; border: none !important; }
                    .result-sheet:last-child { page-break-after: auto; }
                }
            `}</style>

            <div className="card shadow-sm mb-4 d-print-none">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Printable Result Sheet</h5>
                    <button type="button" className="btn btn-sm btn-light" onClick={() => window.print()}
                        disabled={sheets.length === 0}>
                        Print
                    </button>
                </div>
                <div className="card-body">
                    <FilterBar examType={examType} classId={classId} section={section}
                        onExamType={setExamType} onClass={setClassId} onSection={setSection} />

                    <div className="row g-3 align-items-end">
                        <div className="col-sm-6 col-md-4">
                            <label className="form-label">Student</label>
                            <select className="form-select" value={current ? String(current.id) : ""}
                                disabled={printAll}
                                onChange={(e) => setStudentId(e.target.value)}>
                                {classStudents.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.admissionNumber})</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-sm-6 col-md-4">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="printAll"
                                    checked={printAll} onChange={(e) => setPrintAll(e.target.checked)} />
                                <label className="form-check-label" htmlFor="printAll">
                                    Pura class-er sob student-er sheet
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {sheets.length === 0 ? (
                <p className="text-muted">Ei class/section-e kono student nei.</p>
            ) : (
                sheets.map((s) => (
                    <ResultSheet key={s.id} student={s} examType={examType}
                        result={calcResult(marks[markKey(examType, s.id)])} rank={ranks[s.id]} />
                ))
            )}
        </div>
    );
}
