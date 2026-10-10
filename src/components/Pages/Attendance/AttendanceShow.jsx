import { useState } from "react";
import {
    DEMO_STUDENTS,
    STATUS,
    ClassSectionPicker,
    useAttendance,
    getStats,
    percent,
    todayStr,
} from "./AttendanceForm";


export default function AttendanceShow({ students = DEMO_STUDENTS }) {
    const attendance = useAttendance();

    const [month, setMonth] = useState(todayStr().slice(0, 7));
    const [mrClass, setMrClass] = useState("Class 1");
    const [mrSection, setMrSection] = useState("A");

    const mrStudents = students.filter((s) => s.classId === mrClass && s.section === mrSection);

    const [year, mon] = month.split("-").map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthLabel = new Date(year, mon - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    return (
        <div className="container-fluid py-4">
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Monthly Attendance Report</h5>
                    <button type="button" className="btn btn-sm btn-light" onClick={() => window.print()}>Print</button>
                </div>
                <div className="card-body">
                    <div className="row g-3 mb-3">
                        <div className="col-sm-12 col-md-3">
                            <label className="form-label">Month</label>
                            <input type="month" className="form-control" value={month}
                                onChange={(e) => e.target.value && setMonth(e.target.value)} />
                        </div>
                        <ClassSectionPicker classId={mrClass} section={mrSection}
                            onClass={setMrClass} onSection={setMrSection} />
                    </div>

                    <h6 className="mb-3">{mrClass} - Section {mrSection} | {monthLabel}</h6>

                    <div className="table-responsive">
                        <table className="table table-bordered table-sm align-middle text-center" style={{ fontSize: 13 }}>
                            <thead className="table-light">
                                <tr>
                                    <th className="text-start">Name</th>
                                    {days.map((d) => <th key={d}>{d}</th>)}
                                    <th className="text-success">P</th>
                                    <th className="text-danger">A</th>
                                    <th className="text-warning">L</th>
                                    <th>%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mrStudents.length === 0 ? (
                                    <tr><td colSpan={daysInMonth + 5} className="text-muted py-4">No students found.</td></tr>
                                ) : (
                                    mrStudents.map((s) => {
                                        const st = getStats(attendance, s.id, month);
                                        const p = percent(st);
                                        return (
                                            <tr key={s.id}>
                                                <td className="text-start text-nowrap">{s.name}</td>
                                                {days.map((d) => {
                                                    const key = `${month}-${String(d).padStart(2, "0")}|${s.id}`;
                                                    const status = attendance[key];
                                                    return (
                                                        <td key={d} className={status ? `fw-bold ${STATUS[status].text}` : "text-muted"}>
                                                            {status ? STATUS[status].letter : "·"}
                                                        </td>
                                                    );
                                                })}
                                                <td>{st.Present}</td>
                                                <td>{st.Absent}</td>
                                                <td>{st.Late}</td>
                                                <td className="fw-bold">{p === null ? "-" : `${p}%`}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <small className="text-muted">P = Present, A = Absent, L = Late, · = Not marked</small>
                </div>
            </div>
        </div>
    );
}
