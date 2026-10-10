import { useState, useEffect, useSyncExternalStore } from "react";

/* =====================================================================
   SHARED PART (ExamList.jsx ar ExamShow.jsx ei file theke import kore)
   ===================================================================== */

export const CLASSES = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
export const SUBJECTS = ["Bangla", "English", "Mathematics", "Science", "Social Science", "Religion", "ICT", "Physics", "Chemistry", "Biology"];
export const EXAM_TYPES = ["Class Test", "Monthly Test", "1st Term", "Half Yearly", "2nd Term", "Annual / Final", "Model Test"];

export const todayStr = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
};

const addDays = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
};

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "-");

// "14:30" -> "2:30 PM"
export const formatTime = (t) => {
    if (!t) return "-";
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

export const examStatus = (date) => {
    const today = todayStr();
    if (date > today) return "Upcoming";
    if (date === today) return "Today";
    return "Completed";
};

export function ExamStatusBadge({ date }) {
    const st = examStatus(date);
    const cls = { Upcoming: "bg-primary", Today: "bg-warning text-dark", Completed: "bg-secondary" }[st];
    return <span className={`badge ${cls}`}>{st}</span>;
}

// Demo data (prothom bar kono exam na thakle ei gulo dekhabe)
const DEMO_EXAMS = [
    { id: 1, name: "Bangla 1st Term", type: "1st Term", classId: "Class 1", subject: "Bangla", date: addDays(3), startTime: "10:00", endTime: "12:00", fullMarks: 100, passMarks: 33 },
    { id: 2, name: "English 1st Term", type: "1st Term", classId: "Class 1", subject: "English", date: addDays(5), startTime: "10:00", endTime: "12:00", fullMarks: 100, passMarks: 33 },
    { id: 3, name: "Math Monthly Test", type: "Monthly Test", classId: "Class 2", subject: "Mathematics", date: addDays(1), startTime: "09:00", endTime: "10:00", fullMarks: 50, passMarks: 17 },
    { id: 4, name: "Science Class Test", type: "Class Test", classId: "Class 2", subject: "Science", date: addDays(-4), startTime: "11:00", endTime: "11:45", fullMarks: 25, passMarks: 8 },
    { id: 5, name: "Math 1st Term", type: "1st Term", classId: "Class 1", subject: "Mathematics", date: addDays(7), startTime: "10:00", endTime: "12:00", fullMarks: 100, passMarks: 33 },
];

/* ---------- Shared exam store ----------
   Form, List ar Show tinta file-i ekhan theke data pay. Form-e save korle List/Show-te
   sathe sathe dekha jay. localStorage-e save thake, tai refresh dileo data jabe na. */
const STORAGE_KEY = "school_exams";
const listeners = new Set();

const loadExams = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(saved)) return saved;
    } catch {
        /* ignore */
    }
    return DEMO_EXAMS;
};

let state = { exams: loadExams(), editingId: null };

const commit = (next) => {
    state = next;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.exams));
    } catch {
        /* storage full / blocked: ignore */
    }
    listeners.forEach((l) => l());
};

export const addExam = (exam) => commit({ ...state, exams: [...state.exams, { ...exam, id: Date.now() }] });
export const updateExam = (id, exam) =>
    commit({ ...state, exams: state.exams.map((e) => (e.id === id ? { ...exam, id } : e)) });
export const deleteExam = (id) =>
    commit({ exams: state.exams.filter((e) => e.id !== id), editingId: state.editingId === id ? null : state.editingId });
export const startEdit = (id) => commit({ ...state, editingId: id });
export const stopEdit = () => commit({ ...state, editingId: null });

const subscribe = (cb) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
};

export function useExamStore() {
    return useSyncExternalStore(subscribe, () => state);
}

/* =====================================================================
   FORM: Exam Add / Edit
   ===================================================================== */
const emptyForm = {
    name: "",
    type: "",
    classId: "",
    subject: "",
    date: "",
    startTime: "",
    endTime: "",
    fullMarks: "",
    passMarks: "",
};

// Component-er BAIRE rakha hoyeche, tai type korle input focus harabe na
function Field({ label, children }) {
    return (
        <div className="row mb-3">
            <label className="col-sm-4 col-form-label">{label}</label>
            <div className="col-sm-8">{children}</div>
        </div>
    );
}

export default function ExamForm() {
    const { exams, editingId } = useExamStore();
    const [form, setForm] = useState(emptyForm);
    const [message, setMessage] = useState("");

    // List theke Edit click korle form-e data ashbe
    useEffect(() => {
        if (editingId) {
            const exam = exams.find((e) => e.id === editingId);
            if (exam) setForm(exam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setMessage("");
    };

    const resetForm = () => {
        setForm(emptyForm);
        stopEdit();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (Number(form.passMarks) > Number(form.fullMarks)) {
            setMessage("error");
            return;
        }
        const exam = { ...form, fullMarks: Number(form.fullMarks), passMarks: Number(form.passMarks) };
        if (editingId) {
            updateExam(editingId, exam);
            setMessage("updated");
        } else {
            addExam(exam);
            setMessage("added");
        }
        setForm(emptyForm);
        stopEdit();
    };

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-lg-7">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">{editingId ? "Edit Exam" : "Add Exam"}</h5>
                        </div>
                        <div className="card-body">
                            {message === "added" && <div className="alert alert-success py-2">Exam saved ✓</div>}
                            {message === "updated" && <div className="alert alert-success py-2">Exam updated ✓</div>}
                            {message === "error" && (
                                <div className="alert alert-danger py-2">Pass Marks, Full Marks-er cheye beshi hote pare na.</div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <Field label="Exam Name">
                                    <input type="text" className="form-control" name="name"
                                        placeholder="e.g. Bangla 1st Term" value={form.name}
                                        onChange={handleChange} required />
                                </Field>

                                <Field label="Exam Type">
                                    <select className="form-select" name="type" value={form.type}
                                        onChange={handleChange} required>
                                        <option value="">Select Exam Type</option>
                                        {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </Field>

                                <Field label="Class">
                                    <select className="form-select" name="classId" value={form.classId}
                                        onChange={handleChange} required>
                                        <option value="">Select Class</option>
                                        {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>

                                <Field label="Subject">
                                    <select className="form-select" name="subject" value={form.subject}
                                        onChange={handleChange} required>
                                        <option value="">Select Subject</option>
                                        {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </Field>

                                <Field label="Exam Date">
                                    <input type="date" className="form-control" name="date"
                                        value={form.date} onChange={handleChange} required />
                                </Field>

                                <Field label="Start Time">
                                    <input type="time" className="form-control" name="startTime"
                                        value={form.startTime} onChange={handleChange} required />
                                </Field>

                                <Field label="End Time">
                                    <input type="time" className="form-control" name="endTime"
                                        value={form.endTime} onChange={handleChange} required />
                                </Field>

                                <Field label="Full Marks">
                                    <input type="number" min="1" className="form-control" name="fullMarks"
                                        placeholder="Full Marks" value={form.fullMarks}
                                        onChange={handleChange} required />
                                </Field>

                                <Field label="Pass Marks">
                                    <input type="number" min="0" className="form-control" name="passMarks"
                                        placeholder="Pass Marks" value={form.passMarks}
                                        onChange={handleChange} required />
                                </Field>

                                <div className="d-flex justify-content-end gap-2">
                                    <button type="submit" className="btn btn-primary">
                                        {editingId ? "Update" : "Submit"}
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                                        {editingId ? "Cancel" : "Reset"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
