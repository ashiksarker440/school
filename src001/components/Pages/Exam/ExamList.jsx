import { useState, useMemo } from "react";
import {
    CLASSES,
    SUBJECTS,
    useExamStore,
    deleteExam,
    startEdit,
    ExamStatusBadge,
    formatDate,
    formatTime,
} from "./ExamForm";

/* =====================================================================
   LIST: All Exams / Class-wise Exam / Subject-wise Exam
   onEdit (optional): Edit click korle onno page-e jawar jonno, jemon () => navigate("/exam/form")
   ===================================================================== */
export default function ExamList({ onEdit }) {
    const { exams } = useExamStore();
    const [tab, setTab] = useState("all");
    const [search, setSearch] = useState("");
    const [cwClass, setCwClass] = useState("Class 1");
    const [swSubject, setSwSubject] = useState("Bangla");

    const sorted = useMemo(() => [...exams].sort((a, b) => a.date.localeCompare(b.date)), [exams]);

    const searched = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return sorted;
        return sorted.filter((e) =>
            [e.name, e.type, e.classId, e.subject].join(" ").toLowerCase().includes(q)
        );
    }, [sorted, search]);

    const classExams = sorted.filter((e) => e.classId === cwClass);
    const subjectExams = sorted.filter((e) => e.subject === swSubject);

    const handleEdit = (id) => {
        startEdit(id);
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (onEdit) onEdit(id);
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this exam?")) return;
        deleteExam(id);
    };

    // Ekta table, tinta tab-ei use hoy
    const ExamTable = ({ rows }) => (
        <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th>Exam Name</th>
                        <th>Type</th>
                        <th>Class</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Marks (Pass/Full)</th>
                        <th>Status</th>
                        <th className="text-end">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr><td colSpan="9" className="text-center text-muted py-4">No exams found.</td></tr>
                    ) : (
                        rows.map((e) => (
                            <tr key={e.id}>
                                <td>{e.name}</td>
                                <td>{e.type}</td>
                                <td>{e.classId}</td>
                                <td>{e.subject}</td>
                                <td>{formatDate(e.date)}</td>
                                <td className="text-nowrap">{formatTime(e.startTime)} - {formatTime(e.endTime)}</td>
                                <td>{e.passMarks} / {e.fullMarks}</td>
                                <td><ExamStatusBadge date={e.date} /></td>
                                <td className="text-end text-nowrap">
                                    <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(e.id)}>Edit</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    const tabs = [
        { id: "all", label: "All Exams" },
        { id: "class", label: "Class-wise Exam" },
        { id: "subject", label: "Subject-wise Exam" },
    ];

    return (
        <div className="container-fluid py-4">
            <ul className="nav nav-tabs mb-3">
                {tabs.map((t) => (
                    <li className="nav-item" key={t.id}>
                        <button type="button" className={`nav-link ${tab === t.id ? "active" : ""}`}
                            onClick={() => setTab(t.id)}>
                            {t.label}
                        </button>
                    </li>
                ))}
            </ul>

            {/* ================= All Exams ================= */}
            {tab === "all" && (
                <div className="card shadow-sm">
                    <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <h5 className="mb-0">Exam List</h5>
                        <input type="text" className="form-control w-auto" placeholder="Search exam..."
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="card-body p-0">
                        <ExamTable rows={searched} />
                    </div>
                </div>
            )}

            {/* ================= Class-wise ================= */}
            {tab === "class" && (
                <div className="card shadow-sm">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0">Class-wise Exam</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-3 align-items-end">
                            <div className="col-sm-6 col-md-3">
                                <label className="form-label">Class</label>
                                <select className="form-select" value={cwClass} onChange={(e) => setCwClass(e.target.value)}>
                                    {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="col-auto">
                                <span className="badge bg-primary fs-6">Total: {classExams.length}</span>
                            </div>
                        </div>
                        <ExamTable rows={classExams} />
                    </div>
                </div>
            )}

            {/* ================= Subject-wise ================= */}
            {tab === "subject" && (
                <div className="card shadow-sm">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">Subject-wise Exam</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-3 align-items-end">
                            <div className="col-sm-6 col-md-3">
                                <label className="form-label">Subject</label>
                                <select className="form-select" value={swSubject} onChange={(e) => setSwSubject(e.target.value)}>
                                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="col-auto">
                                <span className="badge bg-primary fs-6">Total: {subjectExams.length}</span>
                            </div>
                        </div>
                        <ExamTable rows={subjectExams} />
                    </div>
                </div>
            )}
        </div>
    );
}
