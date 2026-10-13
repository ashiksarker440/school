import { useState } from "react";
import Layout from "./Layout";

/* ---------- Dummy data (pore API theke replace korben) ---------- */
const stats = [
    { label: "Students", value: "224", bg: "#dcd6fb", tag: "10%" },
    { label: "Teachers", value: "22", bg: "#fde9a2", tag: "3%" },
    { label: "Staffs", value: "8", bg: "#dcd6fb", tag: "5%" },
    { label: "Awards", value: "2", bg: "#fde9a2", tag: "2%" },
];

const attendance = [
    { day: "Mon", present: 72, absent: 55 },
    { day: "Tue", present: 80, absent: 62 },
    { day: "Wed", present: 95, absent: 58 },
    { day: "Thu", present: 70, absent: 78 },
    { day: "Fri", present: 85, absent: 60 },
    { day: "Sat", present: 68, absent: 75 },
];

const agenda = [
    { time: "08:00 am", group: "All Grade", title: "Homeroom & Announcement", bg: "#e4e0fb" },
    { time: "10:00 am", group: "Grades 3-5", title: "Math Review & Practice", bg: "#fdf0b8" },
    { time: "02:00 pm", group: "Grades 6-8", title: "Science Experiment & Discussion", bg: "#d6eefb" },
];

const messages = [
    { name: "Hank Schrader", handle: "@hankschrader", color: "#9694ff" },
    { name: "Dean Winchester", handle: "@imdean", color: "#57caeb" },
    { name: "John Dodol", handle: "@dodoljohn", color: "#5ddab4" },
];

const PRIMARY = "#435ebe";
const SOFT_BLUE = "#a8dcf5";
const SOFT_YELLOW = "#fcdc6a";

/* ---------- Small components ---------- */

function StatCard({ label, value, bg, tag }) {
    return (
        <div className="col-6 col-md-3">
            <div className="card mb-3" style={{ background: bg, border: "none" }}>
                <div className="card-body py-3 px-3">
                    <span
                        className="badge bg-white text-dark mb-2"
                        style={{ fontWeight: 500, fontSize: 11 }}
                    >
                        {tag}
                    </span>
                    <h4 className="font-extrabold mb-0" style={{ whiteSpace: "nowrap" }}>
                        {value}
                    </h4>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                        {label}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StudentsDonut({ boys = 52, girls = 48 }) {
    const r = 70;
    const c = 2 * Math.PI * r;
    return (
        <div className="d-flex flex-column align-items-center">
            <div style={{ position: "relative", width: 190, height: 190 }}>
                <svg width="190" height="190" viewBox="0 0 190 190">
                    <circle cx="95" cy="95" r={r} fill="none" stroke={SOFT_BLUE} strokeWidth="22" />
                    <circle
                        cx="95"
                        cy="95"
                        r={r}
                        fill="none"
                        stroke={SOFT_YELLOW}
                        strokeWidth="22"
                        strokeDasharray={`${(girls / 100) * c} ${c}`}
                        strokeLinecap="round"
                        transform="rotate(-90 95 95)"
                    />
                </svg>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                    }}
                >
                    <i className="bi bi-person-fill" style={{ fontSize: 34, color: SOFT_BLUE }}></i>
                    <i className="bi bi-person-fill" style={{ fontSize: 34, color: SOFT_YELLOW }}></i>
                </div>
            </div>
            <div className="d-flex justify-content-around w-100 mt-3">
                <div className="text-center">
                    <span
                        style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: SOFT_BLUE }}
                    ></span>
                    <span className="ms-2 text-muted">Boys</span>
                    <h6 className="mb-0 font-bold">{boys}%</h6>
                </div>
                <div className="text-center">
                    <span
                        style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: SOFT_YELLOW }}
                    ></span>
                    <span className="ms-2 text-muted">Girls</span>
                    <h6 className="mb-0 font-bold">{girls}%</h6>
                </div>
            </div>
        </div>
    );
}

function AttendanceChart() {
    const ticks = [100, 75, 50, 25, 0];
    const H = 200;
    return (
        <div>
            <div className="d-flex gap-3 mb-3" style={{ fontSize: 13 }}>
                <span>
                    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: SOFT_YELLOW }}></span>
                    <span className="ms-1 text-muted">Total Present</span>
                </span>
                <span>
                    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: SOFT_BLUE }}></span>
                    <span className="ms-1 text-muted">Total Absent</span>
                </span>
            </div>

            <div className="d-flex">
                {/* Y axis */}
                <div
                    className="d-flex flex-column justify-content-between text-muted pe-2"
                    style={{ height: H, fontSize: 12 }}
                >
                    {ticks.map((t) => (
                        <span key={t}>{t}</span>
                    ))}
                </div>

                {/* Bars */}
                <div
                    className="d-flex justify-content-around align-items-end flex-grow-1"
                    style={{ height: H, borderBottom: "1px solid #eee" }}
                >
                    {attendance.map((d) => (
                        <div key={d.day} className="d-flex align-items-end" style={{ gap: 4, height: "100%" }}>
                            <div
                                title={`Present: ${d.present}%`}
                                style={{ width: 12, height: `${d.present}%`, background: SOFT_YELLOW, borderRadius: 6 }}
                            ></div>
                            <div
                                title={`Absent: ${d.absent}%`}
                                style={{ width: 12, height: `${d.absent}%`, background: SOFT_BLUE, borderRadius: 6 }}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* X axis */}
            <div className="d-flex" style={{ paddingLeft: 28 }}>
                <div className="d-flex justify-content-around flex-grow-1 text-muted pt-2" style={{ fontSize: 12 }}>
                    {attendance.map((d) => (
                        <span key={d.day}>{d.day}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MiniCalendar() {
    const [date, setDate] = useState(new Date());
    const today = new Date();

    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const isToday = (d) =>
        d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const title = date.toLocaleString("en-US", { month: "long", year: "numeric" });

    return (
        <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    className="btn btn-sm btn-light"
                    onClick={() => setDate(new Date(year, month - 1, 1))}
                    aria-label="Previous month"
                >
                    <i className="bi bi-chevron-left"></i>
                </button>
                <h6 className="mb-0 font-bold">{title}</h6>
                <button
                    className="btn btn-sm btn-light"
                    onClick={() => setDate(new Date(year, month + 1, 1))}
                    aria-label="Next month"
                >
                    <i className="bi bi-chevron-right"></i>
                </button>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    rowGap: 6,
                    textAlign: "center",
                    fontSize: 13,
                }}
            >
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <span key={i} className="text-muted">
                        {d}
                    </span>
                ))}
                {cells.map((d, i) => (
                    <span
                        key={i}
                        style={{
                            margin: "0 auto",
                            width: 28,
                            height: 28,
                            lineHeight: "28px",
                            borderRadius: "50%",
                            background: d && isToday(d) ? PRIMARY : "transparent",
                            color: d && isToday(d) ? "#fff" : "inherit",
                        }}
                    >
                        {d}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ---------- Page ---------- */

function Dashboard() {
    return (
        <Layout>
            <div className="page-content">
                <section className="row">
                    {/* ===== Left / main area ===== */}
                    <div className="col-12 col-lg-9">
                        {/* Top stat cards */}
                        <div className="row">
                            {stats.map((s) => (
                                <StatCard key={s.label} {...s} />
                            ))}
                        </div>

                        {/* Students + Attendance */}
                        <div className="row">
                            <div className="col-12 col-xl-4">
                                <div className="card">
                                    <div className="card-header">
                                        <h4>Students</h4>
                                    </div>
                                    <div className="card-body">
                                        <StudentsDonut boys={52} girls={48} />
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-xl-8">
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h4 className="mb-0">Attendance</h4>
                                        <div className="d-flex gap-2">
                                            <select className="form-select form-select-sm">
                                                <option>Weekly</option>
                                                <option>Monthly</option>
                                            </select>
                                            <select className="form-select form-select-sm">
                                                <option>Grade 5</option>
                                                <option>Grade 6</option>
                                                <option>Grade 7</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <AttendanceChart />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Right sidebar ===== */}
                    <div className="col-12 col-lg-3">
                        {/* Calendar */}
                        <div className="card">
                            <MiniCalendar />
                        </div>

                        {/* Agenda */}
                        <div className="card">
                            <div className="card-header">
                                <h4>Agenda</h4>
                            </div>
                            <div className="card-body pt-0">
                                {agenda.map((a) => (
                                    <div
                                        key={a.title}
                                        className="d-flex mb-3 p-2"
                                        style={{ background: a.bg, borderRadius: 8, gap: 10 }}
                                    >
                                        <div className="text-muted" style={{ fontSize: 12, minWidth: 56 }}>
                                            {a.time}
                                        </div>
                                        <div>
                                            <div className="text-muted" style={{ fontSize: 11 }}>
                                                {a.group}
                                            </div>
                                            <div className="font-bold" style={{ fontSize: 13 }}>
                                                {a.title}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </section>
            </div>
        </Layout>
    );
}

export default Dashboard;