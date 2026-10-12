import { useState } from "react";
import {
    DEMO_STUDENTS,
    ClassSectionPicker,
    StatusBadge,
    useAttendance,
    getStats,
    percent,
    todayStr,
    formatDate,
} from "./AttendanceForm";


export default function AttendanceList({ students = DEMO_STUDENTS }) {
    const attendance = useAttendance();
    const [tab, setTab] = useState("date");

    // ----- Date-wise -----
    const [dwDate, setDwDate] = useState(todayStr());
    const [dwClass, setDwClass] = useState("");
    const [dwSection, setDwSection] = useState("");

    // ----- Class-wise -----
    const [cwClass, setCwClass] = useState("Class 1");
    const [cwSection, setCwSection] = useState("A");

    // Date-wise rows
    const dwStudents = students.filter(
        (s) => (!dwClass || s.classId === dwClass) && (!dwSection || s.section === dwSection)
    );
    const dwCounts = { Present: 0, Absent: 0, Late: 0, "Not Marked": 0 };
    dwStudents.forEach((s) => {
        const st = attendance[`${dwDate}|${s.id}`];
        dwCounts[st || "Not Marked"]++;
    });

    // Class-wise rows
    const cwStudents = students.filter((s) => s.classId === cwClass && s.section === cwSection);

    const tabs = [
        { id: "date", label: "Date-wise" },
        { id: "class", label: "Class-wise" },
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

            
            {tab === "date" && (
                <div className="card shadow-sm">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">Date-wise Attendance</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-3">
                            <div className="col-sm-12 col-md-3">
                                <label className="form-label">Date</label>
                                <input type="date" className="form-control" value={dwDate}
                                    onChange={(e) => e.target.value && setDwDate(e.target.value)} />
                            </div>
                            <ClassSectionPicker classId={dwClass} section={dwSection}
                                onClass={setDwClass} onSection={setDwSection} allowAll />
                        </div>

                        <div className="d-flex flex-wrap gap-2 mb-3">
                            <span className="badge bg-success fs-6">Present: {dwCounts.Present}</span>
                            <span className="badge bg-danger fs-6">Absent: {dwCounts.Absent}</span>
                            <span className="badge bg-warning text-dark fs-6">Late: {dwCounts.Late}</span>
                            <span className="badge bg-secondary fs-6">Not Marked: {dwCounts["Not Marked"]}</span>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Admission No</th>
                                        <th>Name</th>
                                        <th>Class & Section</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dwStudents.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center text-muted py-4">No students found.</td></tr>
                                    ) : (
                                        dwStudents.map((s) => (
                                            <tr key={s.id}>
                                                <td>{formatDate(dwDate)}</td>
                                                <td>{s.admissionNumber}</td>
                                                <td>{s.name}</td>
                                                <td>{s.classId} - {s.section}</td>
                                                <td><StatusBadge status={attendance[`${dwDate}|${s.id}`]} /></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

           
            {tab === "class" && (
                <div className="card shadow-sm">
                    <div className="card-header bg-info text-white">
                        <h5 className="mb-0">Class-wise Attendance</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-3">
                            <ClassSectionPicker classId={cwClass} section={cwSection}
                                onClass={setCwClass} onSection={setCwSection} />
                        </div>

                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Admission No</th>
                                        <th>Name</th>
                                        <th className="text-center">Present</th>
                                        <th className="text-center">Absent</th>
                                        <th className="text-center">Late</th>
                                        <th style={{ minWidth: 160 }}>Attendance %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cwStudents.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center text-muted py-4">No students found.</td></tr>
                                    ) : (
                                        cwStudents.map((s) => {
                                            const st = getStats(attendance, s.id);
                                            const p = percent(st);
                                            return (
                                                <tr key={s.id}>
                                                    <td>{s.admissionNumber}</td>
                                                    <td>{s.name}</td>
                                                    <td className="text-center">{st.Present}</td>
                                                    <td className="text-center">{st.Absent}</td>
                                                    <td className="text-center">{st.Late}</td>
                                                    <td>
                                                        {p === null ? (
                                                            <span className="text-muted">-</span>
                                                        ) : (
                                                            <div className="progress" style={{ height: 20 }}>
                                                                <div className={`progress-bar ${p >= 75 ? "bg-success" : "bg-danger"}`}
                                                                    style={{ width: `${p}%` }}>{p}%</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <small className="text-muted">Late ke attend hishebe dhora hoyeche. 75%-er niche hole lal dekhabe.</small>
                    </div>
                </div>
            )}
        </div>
    );
}
