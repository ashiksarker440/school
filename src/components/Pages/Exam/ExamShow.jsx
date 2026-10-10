import { useState, useMemo } from "react";
import {
    CLASSES,
    EXAM_TYPES,
    useExamStore,
    ExamStatusBadge,
    formatDate,
    formatTime,
    todayStr,
} from "./ExamForm";

/* =====================================================================
   SHOW: Exam Schedule (Class / Exam Type filter) + Exam Details card
   ===================================================================== */
export default function ExamShow() {
    const { exams } = useExamStore();
    const [classId, setClassId] = useState("");
    const [type, setType] = useState("");
    const [viewExamId, setViewExamId] = useState(null);

    const rows = useMemo(
        () =>
            exams
                .filter((e) => (!classId || e.classId === classId) && (!type || e.type === type))
                .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)),
        [exams, classId, type]
    );

    const viewExam = exams.find((e) => e.id === viewExamId) || null;
    const daysLeft = viewExam
        ? Math.round((new Date(viewExam.date) - new Date(todayStr())) / 86400000)
        : 0;

    return (
        <div className="container-fluid py-4">
            <div className="row g-4">
                {/* ===== Exam Schedule ===== */}
                <div className="col-lg-8">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Exam Schedule</h5>
                            <button type="button" className="btn btn-sm btn-light" onClick={() => window.print()}>Print</button>
                        </div>
                        <div className="card-body">
                            <div className="row g-3 mb-3">
                                <div className="col-sm-6">
                                    <label className="form-label">Class</label>
                                    <select className="form-select" value={classId} onChange={(e) => setClassId(e.target.value)}>
                                        <option value="">All Classes</option>
                                        {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="col-sm-6">
                                    <label className="form-label">Exam Type</label>
                                    <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                                        <option value="">All Types</option>
                                        {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-striped table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Class</th>
                                            <th>Subject</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th className="text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.length === 0 ? (
                                            <tr><td colSpan="7" className="text-center text-muted py-4">No exams found.</td></tr>
                                        ) : (
                                            rows.map((e) => (
                                                <tr key={e.id} className={e.id === viewExamId ? "table-active" : ""}>
                                                    <td>{formatDate(e.date)}</td>
                                                    <td className="text-nowrap">{formatTime(e.startTime)}</td>
                                                    <td>{e.classId}</td>
                                                    <td>{e.subject}</td>
                                                    <td>{e.type}</td>
                                                    <td><ExamStatusBadge date={e.date} /></td>
                                                    <td className="text-end">
                                                        <button className="btn btn-sm btn-info" onClick={() => setViewExamId(e.id)}>View</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== Exam Details ===== */}
                <div className="col-lg-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">Exam Details</h5>
                        </div>
                        <div className="card-body">
                            {!viewExam ? (
                                <p className="text-muted mb-0">Schedule theke "View" button-e click korle exam-er details ekhane dekha jabe.</p>
                            ) : (
                                <>
                                    <h5 className="mb-1">{viewExam.name}</h5>
                                    <div className="mb-3">
                                        <span className="badge bg-primary me-1">{viewExam.type}</span>
                                        <ExamStatusBadge date={viewExam.date} />
                                    </div>
                                    <p className="mb-1"><strong>Class:</strong> {viewExam.classId}</p>
                                    <p className="mb-1"><strong>Subject:</strong> {viewExam.subject}</p>
                                    <p className="mb-1"><strong>Date:</strong> {formatDate(viewExam.date)}</p>
                                    <p className="mb-1"><strong>Time:</strong> {formatTime(viewExam.startTime)} - {formatTime(viewExam.endTime)}</p>
                                    <p className="mb-1"><strong>Full Marks:</strong> {viewExam.fullMarks}</p>
                                    <p className="mb-3"><strong>Pass Marks:</strong> {viewExam.passMarks}</p>
                                    {daysLeft > 0 && <div className="alert alert-info py-2 mb-0">Exam hote aro {daysLeft} din baki.</div>}
                                    {daysLeft === 0 && <div className="alert alert-warning py-2 mb-0">Exam ajkei!</div>}
                                    {daysLeft < 0 && <div className="alert alert-secondary py-2 mb-0">Exam shesh hoye geche.</div>}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
