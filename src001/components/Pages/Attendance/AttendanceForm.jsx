import { Fragment, useState, useMemo, useEffect, useSyncExternalStore } from "react";



export const CLASSES = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
export const SECTIONS = ["A", "B", "C", "D"];


export const STATUS = {
    Present: { color: "success", badge: "bg-success", letter: "P", text: "text-success" },
    Absent: { color: "danger", badge: "bg-danger", letter: "A", text: "text-danger" },
    Late: { color: "warning", badge: "bg-warning text-dark", letter: "L", text: "text-warning" },
};


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

export const todayStr = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
};

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");


export const percent = (st) => {
    const total = st.Present + st.Absent + st.Late;
    return total ? Math.round(((st.Present + st.Late) / total) * 100) : null;
};


export const getStats = (attendance, studentId, prefix = "") => {
    const out = { Present: 0, Absent: 0, Late: 0 };
    Object.entries(attendance).forEach(([key, value]) => {
        const [d, id] = key.split("|");
        if (id === String(studentId) && d.startsWith(prefix) && out[value] !== undefined) out[value]++;
    });
    return out;
};


const STORAGE_KEY = "school_attendance";
const listeners = new Set();

const loadAttendance = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
};


let attendanceData = loadAttendance();

export function saveAttendance(updates) {
    attendanceData = { ...attendanceData, ...updates };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(attendanceData));
    } catch {
        /* storage full / blocked: ignore */
    }
    listeners.forEach((l) => l());
}

const subscribe = (cb) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
};

export function useAttendance() {
    return useSyncExternalStore(subscribe, () => attendanceData);
}

export function StatusBadge({ status }) {
    if (!status) return <span className="badge bg-secondary">Not Marked</span>;
    return <span className={`badge ${STATUS[status].badge}`}>{status}</span>;
}

export function ClassSectionPicker({ classId, section, onClass, onSection, allowAll = false }) {
    return (
        <>
            <div className="col-sm-6 col-md-3">
                <label className="form-label">Class</label>
                <select className="form-select" value={classId} onChange={(e) => onClass(e.target.value)}>
                    {allowAll && <option value="">All Classes</option>}
                    {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="col-sm-6 col-md-3">
                <label className="form-label">Section</label>
                <select className="form-select" value={section} onChange={(e) => onSection(e.target.value)}>
                    {allowAll && <option value="">All Sections</option>}
                    {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </>
    );
}


export default function AttendanceForm({ students = DEMO_STUDENTS }) {
    const attendance = useAttendance();

    const [date, setDate] = useState(todayStr());
    const [classId, setClassId] = useState("Class 1");
    const [section, setSection] = useState("A");
    const [draft, setDraft] = useState({});
    const [saved, setSaved] = useState(false);

    const markStudents = useMemo(
        () => students.filter((s) => s.classId === classId && s.section === section),
        [students, classId, section]
    );

    // Date / class / section bodlale saved data (na thakle Present) load hobe
    useEffect(() => {
        const d = {};
        markStudents.forEach((s) => {
            d[s.id] = attendance[`${date}|${s.id}`] || "Present";
        });
        setDraft(d);
        setSaved(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date, markStudents]);

    const setStatus = (id, status) => {
        setDraft((prev) => ({ ...prev, [id]: status }));
        setSaved(false);
    };

    const markAll = (status) => {
        const d = {};
        markStudents.forEach((s) => (d[s.id] = status));
        setDraft(d);
        setSaved(false);
    };

    const handleSave = () => {
        const updates = {};
        markStudents.forEach((s) => {
            updates[`${date}|${s.id}`] = draft[s.id];
        });
        saveAttendance(updates);
        setSaved(true);
    };

    const draftCounts = { Present: 0, Absent: 0, Late: 0 };
    markStudents.forEach((s) => {
        if (draft[s.id]) draftCounts[draft[s.id]]++;
    });

    return (
        <div className="container-fluid py-4">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Mark Attendance</h5>
                </div>
                <div className="card-body">
                    <div className="row g-3 mb-3">
                        <div className="col-sm-12 col-md-3">
                            <label className="form-label">Date</label>
                            <input type="date" className="form-control" value={date}
                                onChange={(e) => e.target.value && setDate(e.target.value)} />
                        </div>
                        <ClassSectionPicker classId={classId} section={section}
                            onClass={setClassId} onSection={setSection} />
                    </div>

                    {markStudents.length === 0 ? (
                        <p className="text-muted mb-0">Ei class/section-e kono student nei.</p>
                    ) : (
                        <>
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                                <div className="d-flex gap-2">
                                    <span className="badge bg-success fs-6">Present: {draftCounts.Present}</span>
                                    <span className="badge bg-danger fs-6">Absent: {draftCounts.Absent}</span>
                                    <span className="badge bg-warning text-dark fs-6">Late: {draftCounts.Late}</span>
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="button" className="btn btn-sm btn-outline-success" onClick={() => markAll("Present")}>All Present</button>
                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => markAll("Absent")}>All Absent</button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-striped align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Admission No</th>
                                            <th>Name</th>
                                            <th className="text-end">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {markStudents.map((s, i) => (
                                            <tr key={s.id}>
                                                <td>{i + 1}</td>
                                                <td>{s.admissionNumber}</td>
                                                <td>{s.name}</td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        {Object.keys(STATUS).map((st) => (
                                                            <Fragment key={st}>
                                                                <input type="radio" className="btn-check"
                                                                    name={`att-${s.id}`} id={`att-${s.id}-${st}`}
                                                                    checked={draft[s.id] === st}
                                                                    onChange={() => setStatus(s.id, st)} />
                                                                <label className={`btn btn-outline-${STATUS[st].color}`}
                                                                    htmlFor={`att-${s.id}-${st}`}>{st}</label>
                                                            </Fragment>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="d-flex justify-content-end align-items-center gap-3">
                                {saved && <span className="text-success">Attendance saved ✓</span>}
                                <button type="button" className="btn btn-primary" onClick={handleSave}>
                                    Save Attendance
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
