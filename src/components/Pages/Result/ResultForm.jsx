import { useState, useMemo, useEffect, useSyncExternalStore } from "react";

/* =====================================================================
   SHARED PART (ResultList.jsx ar ResultShow.jsx ei file theke import kore)
   ===================================================================== */

export const SCHOOL_NAME = "Your School Name"; // <-- apnar school-er naam din (Result Sheet-e dekhabe)

export const CLASSES = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
export const SECTIONS = ["A", "B", "C", "D"];
export const SUBJECTS = ["Bangla", "English", "Mathematics", "Science", "Social Science", "Religion"];
export const EXAM_TYPES = ["Class Test", "Monthly Test", "1st Term", "Half Yearly", "2nd Term", "Annual / Final", "Model Test"];

export const FULL_MARKS = 100; // prottek subject-er full marks
export const PASS_MARKS = 33;  // prottek subject-er pass marks

// Bangladesh GPA system
export const GRADE_TABLE = [
    { min: 80, range: "80 - 100", grade: "A+", gp: 5.0 },
    { min: 70, range: "70 - 79", grade: "A", gp: 4.0 },
    { min: 60, range: "60 - 69", grade: "A-", gp: 3.5 },
    { min: 50, range: "50 - 59", grade: "B", gp: 3.0 },
    { min: 40, range: "40 - 49", grade: "C", gp: 2.0 },
    { min: 33, range: "33 - 39", grade: "D", gp: 1.0 },
    { min: 0, range: "0 - 32", grade: "F", gp: 0.0 },
];

// Demo data: pore StudentManagement / API theke asle students={students} diye dilei hobe
export const DEMO_STUDENTS = [
    { id: 1, admissionNumber: "1001", name: "Rahim Uddin", classId: "Class 1", section: "A" },
    { id: 2, admissionNumber: "1002", name: "Karim Hossain", classId: "Class 1", section: "A" },
    { id: 3, admissionNumber: "1003", name: "Fatema Akter", classId: "Class 1", section: "A" },
    { id: 4, admissionNumber: "1004", name: "Nusrat Jahan", classId: "Class 1", section: "B" },
    { id: 5, admissionNumber: "1005", name: "Sabbir Ahmed", classId: "Class 1", section: "B" },
    { id: 6, admissionNumber: "2001", name: "Tanvir Hasan", classId: "Class 2", section: "A" },
    { id: 7, admissionNumber: "2002", name: "Mim Chowdhury", classId: "Class 2", section: "A" },
    { id: 8, admissionNumber: "2003", name: "Rakib Islam", classId: "Class 2", section: "A" },
];

/* ---------- Grade / GPA / Pass-Fail logic ---------- */

// Ekta subject-er marks theke Grade ar Grade Point
export const gradeInfo = (marks) => {
    const row = GRADE_TABLE.find((g) => marks >= g.min) || GRADE_TABLE[GRADE_TABLE.length - 1];
    return { grade: row.grade, gp: row.gp };
};

const gradeFromGpa = (gpa) => {
    if (gpa >= 5) return "A+";
    if (gpa >= 4) return "A";
    if (gpa >= 3.5) return "A-";
    if (gpa >= 3) return "B";
    if (gpa >= 2) return "C";
    if (gpa >= 1) return "D";
    return "F";
};

// subjectMarks = { Bangla: 80, English: 72, ... }
// Kono ekta subject-e fail korle GPA 0.00 ar Grade F hoy
export const calcResult = (subjectMarks) => {
    const subjects = SUBJECTS.map((subject) => {
        const m = subjectMarks ? subjectMarks[subject] : undefined;
        if (m === undefined || m === null || m === "") return { subject, marks: null };
        const marks = Number(m);
        const { grade, gp } = gradeInfo(marks);
        return { subject, marks, grade, gp, pass: marks >= PASS_MARKS };
    });

    if (!subjects.every((s) => s.marks !== null)) return { complete: false, subjects };

    const total = subjects.reduce((a, s) => a + s.marks, 0);
    const percentage = (total / (SUBJECTS.length * FULL_MARKS)) * 100;
    const failedSubjects = subjects.filter((s) => !s.pass).map((s) => s.subject);
    const passed = failedSubjects.length === 0;
    const gpaRaw = passed ? subjects.reduce((a, s) => a + s.gp, 0) / subjects.length : 0;

    return {
        complete: true,
        subjects,
        total,
        percentage,
        passed,
        failedSubjects,
        gpaRaw,
        gpa: gpaRaw.toFixed(2),
        grade: passed ? gradeFromGpa(gpaRaw) : "F",
    };
};

export const markKey = (examType, studentId) => `${examType}|${studentId}`;

// Pass kora student-der merit position (GPA, tarpor total diye)
export const buildRanks = (students, marks, examType) => {
    const list = students
        .map((s) => ({ id: s.id, r: calcResult(marks[markKey(examType, s.id)]) }))
        .filter((x) => x.r.complete && x.r.passed)
        .sort((a, b) => b.r.gpaRaw - a.r.gpaRaw || b.r.total - a.r.total);
    const map = {};
    list.forEach((x, i) => (map[x.id] = i + 1));
    return map;
};

/* ---------- Shared result store ----------
   Form, List ar Show tinta file-i ekhan theke data pay. Form-e save korle List/Show-te
   sathe sathe dekha jay. localStorage-e save thake, tai refresh dileo data jabe na. */
const STORAGE_KEY = "school_results";
const listeners = new Set();

// Demo marks (prothom bar kono data na thakle). Student 5-er Math-e fail dekhano hoyeche.
const buildDemoMarks = () => {
    const data = {};
    DEMO_STUDENTS.forEach((s, i) => {
        const sm = {};
        SUBJECTS.forEach((sub, j) => {
            sm[sub] = 40 + ((i * 17 + j * 23) % 56);
        });
        data[markKey("1st Term", s.id)] = sm;
    });
    data[markKey("1st Term", 5)].Mathematics = 25;
    return data;
};

const loadMarks = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved && typeof saved === "object") return saved;
    } catch {
        /* ignore */
    }
    return buildDemoMarks();
};

// marks: { "1st Term|1": { Bangla: 80, ... } }, viewing: Result Sheet-e kon student dekhabe
let state = { marks: loadMarks(), viewing: null };

const commit = (next) => {
    state = next;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.marks));
    } catch {
        /* storage full / blocked: ignore */
    }
    listeners.forEach((l) => l());
};

export const saveMarks = (updates) => commit({ ...state, marks: { ...state.marks, ...updates } });
export const viewResult = (examType, classId, section, studentId) =>
    commit({ ...state, viewing: { examType, classId, section, studentId } });

const subscribe = (cb) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
};

export function useResultStore() {
    return useSyncExternalStore(subscribe, () => state);
}

export function ResultBadge({ result }) {
    if (!result.complete) return <span className="badge bg-secondary">Not Entered</span>;
    return result.passed ? <span className="badge bg-success">Pass</span> : <span className="badge bg-danger">Fail</span>;
}

// Exam Type + Class + Section filter (tinta file-i use kore)
export function FilterBar({ examType, classId, section, onExamType, onClass, onSection }) {
    return (
        <div className="row g-3 mb-3 d-print-none">
            <div className="col-sm-4 col-md-3">
                <label className="form-label">Exam Type</label>
                <select className="form-select" value={examType} onChange={(e) => onExamType(e.target.value)}>
                    {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div className="col-sm-4 col-md-3">
                <label className="form-label">Class</label>
                <select className="form-select" value={classId} onChange={(e) => onClass(e.target.value)}>
                    {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="col-sm-4 col-md-3">
                <label className="form-label">Section</label>
                <select className="form-select" value={section} onChange={(e) => onSection(e.target.value)}>
                    {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>
    );
}

/* =====================================================================
   FORM: Subject-wise Marks entry (Grade, GPA, Pass/Fail live dekhay)
   ===================================================================== */
export default function ResultForm({ students = DEMO_STUDENTS }) {
    const { marks } = useResultStore();

    const [examType, setExamType] = useState("1st Term");
    const [classId, setClassId] = useState("Class 1");
    const [section, setSection] = useState("A");
    const [draft, setDraft] = useState({}); // { studentId: { subject: "80" } }
    const [saved, setSaved] = useState(false);

    const classStudents = useMemo(
        () => students.filter((s) => s.classId === classId && s.section === section),
        [students, classId, section]
    );

    // Exam Type / Class / Section bodlale saved marks load hobe
    useEffect(() => {
        const d = {};
        classStudents.forEach((s) => {
            const saved = marks[markKey(examType, s.id)] || {};
            d[s.id] = {};
            SUBJECTS.forEach((sub) => {
                d[s.id][sub] = saved[sub] !== undefined ? String(saved[sub]) : "";
            });
        });
        setDraft(d);
        setSaved(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [examType, classStudents]);

    const setMark = (studentId, subject, value) => {
        let v = value;
        if (v !== "") v = String(Math.min(FULL_MARKS, Math.max(0, Number(v))));
        setDraft((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [subject]: v } }));
        setSaved(false);
    };

    const toMarksObject = (studentId) => {
        const obj = {};
        SUBJECTS.forEach((sub) => {
            const v = draft[studentId] ? draft[studentId][sub] : "";
            if (v !== "" && v !== undefined) obj[sub] = Number(v);
        });
        return obj;
    };

    const handleSave = () => {
        const updates = {};
        classStudents.forEach((s) => {
            updates[markKey(examType, s.id)] = toMarksObject(s.id);
        });
        saveMarks(updates);
        setSaved(true);
    };

    return (
        <div className="container-fluid py-4">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Enter Result (Subject-wise Marks)</h5>
                </div>
                <div className="card-body">
                    <FilterBar examType={examType} classId={classId} section={section}
                        onExamType={setExamType} onClass={setClassId} onSection={setSection} />

                    {classStudents.length === 0 ? (
                        <p className="text-muted mb-0">Ei class/section-e kono student nei.</p>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm align-middle text-center">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="text-start">Student</th>
                                            {SUBJECTS.map((sub) => (
                                                <th key={sub}>{sub}<br /><small className="text-muted">/{FULL_MARKS}</small></th>
                                            ))}
                                            <th>Total</th>
                                            <th>GPA</th>
                                            <th>Grade</th>
                                            <th>Result</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classStudents.map((s) => {
                                            const result = calcResult(toMarksObject(s.id));
                                            return (
                                                <tr key={s.id}>
                                                    <td className="text-start text-nowrap">
                                                        {s.name}<br /><small className="text-muted">{s.admissionNumber}</small>
                                                    </td>
                                                    {SUBJECTS.map((sub) => {
                                                        const v = draft[s.id] ? draft[s.id][sub] : "";
                                                        const invalid = v !== "" && v !== undefined && Number(v) < PASS_MARKS;
                                                        return (
                                                            <td key={sub}>
                                                                <input type="number" min="0" max={FULL_MARKS}
                                                                    className={`form-control form-control-sm mx-auto ${invalid ? "is-invalid" : ""}`}
                                                                    style={{ width: 80 }}
                                                                    value={v ?? ""}
                                                                    onChange={(e) => setMark(s.id, sub, e.target.value)} />
                                                            </td>
                                                        );
                                                    })}
                                                    <td>{result.complete ? result.total : "-"}</td>
                                                    <td className="fw-bold">{result.complete ? result.gpa : "-"}</td>
                                                    <td className="fw-bold">{result.complete ? result.grade : "-"}</td>
                                                    <td><ResultBadge result={result} /></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <small className="text-muted d-block mb-3">
                                Pass marks {PASS_MARKS}. Kono subject-e fail korle GPA 0.00 ar Grade F hoy. Lal border = fail marks.
                            </small>

                            <div className="d-flex justify-content-end align-items-center gap-3">
                                {saved && <span className="text-success">Result saved ✓</span>}
                                <button type="button" className="btn btn-primary" onClick={handleSave}>Save Result</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
