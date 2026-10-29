import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router";
import axios from "../../Lib/axios"; // Dashboard.jsx Layout.jsx er pasher folder e thakle eta thik. Na hole path milie nin.
import Layout from "./Layout";

const PRIMARY = "#435ebe";
const SOFT_BLUE = "#a8dcf5";
const SOFT_YELLOW = "#fcdc6a";
const API_URL = import.meta.env.VITE_API_URL;

/* ---------- Helpers ---------- */

// Attendance list er moto-i: 1/present => Present, 2/late => Late, baki => Absent
const normalizeStatus = (s) => {
    const v = String(s ?? "").toLowerCase();
    if (v === "1" || v === "present") return "Present";
    if (v === "2" || v === "late") return "Late";
    return "Absent";
};

const toKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
};

const formatNumber = (n) => Number(n || 0).toLocaleString("en-US");

// Gender value ta ja-i hok (male/female/boy/girl/m/f) shetake normalize kore
const normalizeGender = (g) => {
    const v = String(g ?? "").trim().toLowerCase();
    if (["male", "boy", "m"].includes(v)) return "boys";
    if (["female", "girl", "f"].includes(v)) return "girls";
    return null;
};

/* ---------- Small components ---------- */

function StatCard({ label, value, bg, loading }) {
    return (
        <div className="col-6 col-md-3">
            <div className="card mb-3" style={{ background: bg, border: "none" }}>
                <div className="card-body py-3 px-3">
                    <h4 className="font-extrabold mb-0" style={{ whiteSpace: "nowrap" }}>
                        {loading ? "..." : formatNumber(value)}
                    </h4>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                        {label}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StudentsDonut({ boys, girls }) {
    const total = boys + girls;
    if (total === 0) {
        return (
            <div className="text-muted text-center py-5" style={{ fontSize: 13 }}>
                Gender data pawa jayni.
            </div>
        );
    }
    const girlsPct = Math.round((girls / total) * 100);
    const boysPct = 100 - girlsPct;
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
                        strokeDasharray={`${(girls / total) * c} ${c}`}
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
                    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: SOFT_BLUE }}></span>
                    <span className="ms-2 text-muted">Boys ({boys})</span>
                    <h6 className="mb-0 font-bold">{boysPct}%</h6>
                </div>
                <div className="text-center">
                    <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: SOFT_YELLOW }}></span>
                    <span className="ms-2 text-muted">Girls ({girls})</span>
                    <h6 className="mb-0 font-bold">{girlsPct}%</h6>
                </div>
            </div>
        </div>
    );
}

function AttendanceChart({ bars }) {
    const H = 200;
    const rawMax = Math.max(1, ...bars.map((b) => Math.max(b.present, b.absent)));
    const step = Math.max(1, Math.ceil(rawMax / 4));
    const niceMax = step * 4;
    const ticks = [4, 3, 2, 1, 0].map((i) => i * step);

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
                <div className="d-flex flex-column justify-content-between text-muted pe-2" style={{ height: H, fontSize: 12 }}>
                    {ticks.map((t) => (
                        <span key={t}>{t}</span>
                    ))}
                </div>

                <div
                    className="d-flex justify-content-around align-items-end flex-grow-1"
                    style={{ height: H, borderBottom: "1px solid #eee" }}
                >
                    {bars.map((b) => (
                        <div key={b.key} className="d-flex align-items-end" style={{ gap: 4, height: "100%" }}>
                            <div
                                title={`Present: ${b.present}`}
                                style={{ width: 12, height: `${(b.present / niceMax) * 100}%`, background: SOFT_YELLOW, borderRadius: 6 }}
                            ></div>
                            <div
                                title={`Absent: ${b.absent}`}
                                style={{ width: 12, height: `${(b.absent / niceMax) * 100}%`, background: SOFT_BLUE, borderRadius: 6 }}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="d-flex" style={{ paddingLeft: 28 }}>
                <div className="d-flex justify-content-around flex-grow-1 text-muted pt-2" style={{ fontSize: 12 }}>
                    {bars.map((b) => (
                        <span key={b.key}>{b.label}</span>
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
                <button className="btn btn-sm btn-light" onClick={() => setDate(new Date(year, month - 1, 1))} aria-label="Previous month">
                    <i className="bi bi-chevron-left"></i>
                </button>
                <h6 className="mb-0 font-bold">{title}</h6>
                <button className="btn btn-sm btn-light" onClick={() => setDate(new Date(year, month + 1, 1))} aria-label="Next month">
                    <i className="bi bi-chevron-right"></i>
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 6, textAlign: "center", fontSize: 13 }}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <span key={i} className="text-muted">{d}</span>
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

function Avatar({ photo, name, color }) {
    const style = { width: 40, height: 40, borderRadius: "50%", flexShrink: 0 };
    if (photo) {
        return <img src={`${API_URL}${photo}`} alt={name} style={{ ...style, objectFit: "cover" }} />;
    }
    return (
        <div className="d-flex align-items-center justify-content-center text-white font-bold" style={{ ...style, background: color }}>
            {String(name || "?").charAt(0).toUpperCase()}
        </div>
    );
}

function RecentList({ title, items, empty, color }) {
    return (
        <div className="card">
            <div className="card-header">
                <h4>{title}</h4>
            </div>
            <div className="card-content pb-3">
                {items.length === 0 ? (
                    <div className="text-muted px-4 py-2">{empty}</div>
                ) : (
                    items.map((it) => (
                        <div key={it.id} className="d-flex align-items-center px-4 py-2">
                            <Avatar photo={it.photo} name={it.name} color={color} />
                            <div className="ms-3">
                                <h6 className="mb-0">{it.name}</h6>
                                <small className="text-muted">{it.sub}</small>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function ResultOverview({ stats }) {
    if (stats.total === 0) {
        return <div className="text-muted text-center py-5">Kono result nei.</div>;
    }
    const gradeMax = Math.max(1, ...stats.grades.map((g) => g.count));
    return (
        <div>
            <div className="row text-center mb-3">
                <div className="col-4">
                    <h4 className="font-extrabold mb-0 text-success">{stats.pass}</h4>
                    <small className="text-muted">Pass</small>
                </div>
                <div className="col-4">
                    <h4 className="font-extrabold mb-0 text-danger">{stats.fail}</h4>
                    <small className="text-muted">Fail</small>
                </div>
                <div className="col-4">
                    <h4 className="font-extrabold mb-0">{stats.avgGpa === null ? "-" : stats.avgGpa.toFixed(2)}</h4>
                    <small className="text-muted">Avg GPA</small>
                </div>
            </div>

            <div className="d-flex justify-content-between" style={{ fontSize: 13 }}>
                <span className="text-muted">Pass rate</span>
                <strong>{stats.passRate}%</strong>
            </div>
            <div className="progress mb-4" style={{ height: 10 }}>
                <div className="progress-bar bg-success" style={{ width: `${stats.passRate}%` }}></div>
            </div>

            <h6 className="mb-2">Grade distribution</h6>
            {stats.grades.map((g, i) => (
                <div key={g.grade} className="d-flex align-items-center mb-2" style={{ gap: 10, fontSize: 13 }}>
                    <span style={{ width: 28 }} className="font-bold">{g.grade}</span>
                    <div style={{ flexGrow: 1, background: "#f2f4f8", borderRadius: 6, height: 12 }}>
                        <div
                            style={{
                                width: `${(g.count / gradeMax) * 100}%`,
                                height: "100%",
                                borderRadius: 6,
                                background: i % 2 === 0 ? SOFT_YELLOW : SOFT_BLUE,
                            }}
                        ></div>
                    </div>
                    <span className="text-muted" style={{ width: 24, textAlign: "right" }}>{g.count}</span>
                </div>
            ))}
        </div>
    );
}

function TopStudents({ rows }) {
    if (rows.length === 0) {
        return <div className="text-muted text-center py-5">Kono result nei.</div>;
    }
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th className="text-center">%</th>
                        <th className="text-center">GPA</th>
                        <th className="text-center">Grade</th>
                        <th className="text-end">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={r.id}>
                            <td>{r.merit || i + 1}</td>
                            <td>
                                <div className="font-bold">{r.name}</div>
                                <small className="text-muted">{r.admission_no}</small>
                            </td>
                            <td className="text-center">
                                {Number.isFinite(Number(r.percentage)) && r.percentage !== "" && r.percentage !== null
                                    ? `${Number(r.percentage).toFixed(1)}%`
                                    : "-"}
                            </td>
                            <td className="text-center font-bold">{r.gpa ?? "-"}</td>
                            <td className="text-center font-bold">{r.grade || "-"}</td>
                            <td className="text-end">
                                <Link className="btn btn-sm btn-info text-white" to={`/result/${r.id}`} title="View result">
                                    <i className="bi bi-eye"></i>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ---------- Page ---------- */

function Dashboard() {
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);

    // Attendance chart filters
    const [range, setRange] = useState("weekly");
    const [classSection, setClassSection] = useState("");

    const loadAll = useCallback(async () => {
        setLoading(true);
        const [stu, tea, att, res] = await Promise.allSettled([
            axios.get("Student/index.php"),
            axios.get("Teacher/index.php"),
            axios.get("Attendance/index.php"),
            axios.get("Result/index.php"),
        ]);

        const errs = [];
        const pick = (res, name, setter) => {
            if (res.status === "fulfilled") {
                const data = res.value?.data?.data;
                setter(Array.isArray(data) ? data : []);
            } else {
                console.error(`Error fetching ${name}:`, res.reason);
                setter([]);
                errs.push(`${name} load kora jayni.`);
            }
        };
        pick(stu, "Students", setStudents);
        pick(tea, "Teachers", setTeachers);
        pick(att, "Attendance", setAttendance);
        pick(res, "Results", setResults);
        setErrors(errs);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    /* ----- Today's attendance ----- */
    const todayKey = toKey(new Date());
    const todayStats = useMemo(() => {
        const rows = attendance.filter((a) => String(a.date || "").slice(0, 10) === todayKey);
        return {
            present: rows.filter((a) => normalizeStatus(a.status) === "Present").length,
            absent: rows.filter((a) => normalizeStatus(a.status) === "Absent").length,
        };
    }, [attendance, todayKey]);

    /* ----- Attendance chart data ----- */
    const classSections = useMemo(
        () => [...new Set(attendance.map((a) => a.class_section).filter(Boolean))].sort(),
        [attendance]
    );

    const bars = useMemo(() => {
        const rows = classSection ? attendance.filter((a) => a.class_section === classSection) : attendance;
        const today = new Date();

        // weekly = last 7 days (1 bar/day), monthly = last 4 weeks (1 bar/week)
        const bucketCount = range === "weekly" ? 7 : 4;
        const bucketSize = range === "weekly" ? 1 : 7;

        const result = [];
        for (let i = bucketCount - 1; i >= 0; i--) {
            const end = addDays(today, -i * bucketSize);
            const start = addDays(end, -(bucketSize - 1));
            const keys = new Set();
            for (let d = 0; d < bucketSize; d++) keys.add(toKey(addDays(start, d)));

            let present = 0;
            let absent = 0;
            rows.forEach((a) => {
                if (!keys.has(String(a.date || "").slice(0, 10))) return;
                // Late = school e esheche, tai present bar e dhora hoyeche
                if (normalizeStatus(a.status) === "Absent") absent++;
                else present++;
            });

            result.push({
                key: toKey(end),
                label:
                    range === "weekly"
                        ? end.toLocaleDateString("en", { weekday: "short" })
                        : `${start.getDate()}/${start.getMonth() + 1}`,
                present,
                absent,
            });
        }
        return result;
    }, [attendance, range, classSection]);

    /* ----- Students gender ----- */
    const gender = useMemo(() => {
        let boys = 0;
        let girls = 0;
        students.forEach((s) => {
            const g = normalizeGender(s.gender);
            if (g === "boys") boys++;
            if (g === "girls") girls++;
        });
        return { boys, girls };
    }, [students]);

    /* ----- Recent lists (sesh e add howa gulo) ----- */
    const recentStudents = useMemo(
        () =>
            [...students]
                .sort((a, b) => Number(b.id) - Number(a.id))
                .slice(0, 4)
                .map((s) => ({
                    id: s.id,
                    name: s.name,
                    photo: s.photo,
                    sub: `Class ${s.class_id ?? "-"} - ${s.section ?? "-"}`,
                })),
        [students]
    );

    const recentTeachers = useMemo(
        () =>
            [...teachers]
                .sort((a, b) => Number(b.id) - Number(a.id))
                .slice(0, 4)
                .map((t) => ({
                    id: t.id,
                    name: t.name,
                    photo: t.photo,
                    sub: t.main_subject || "-",
                })),
        [teachers]
    );

    /* ----- Result stats ----- */
    const resultStats = useMemo(() => {
        const total = results.length;
        const pass = results.filter((r) => String(r.result ?? "").toLowerCase() === "pass").length;
        const fail = total - pass;

        const gpas = results.map((r) => Number(r.gpa)).filter((n) => Number.isFinite(n) && n > 0);
        const avgGpa = gpas.length ? gpas.reduce((a, b) => a + b, 0) / gpas.length : null;

        // grade-wise count; GPA bhalo grade age
        const map = {};
        results.forEach((r) => {
            if (!r.grade) return;
            if (!map[r.grade]) map[r.grade] = { grade: r.grade, count: 0, gpaSum: 0 };
            map[r.grade].count++;
            map[r.grade].gpaSum += Number(r.gpa) || 0;
        });
        const grades = Object.values(map).sort((a, b) => b.gpaSum / b.count - a.gpaSum / a.count);

        return {
            total,
            pass,
            fail,
            passRate: total ? Math.round((pass / total) * 100) : 0,
            avgGpa,
            grades,
        };
    }, [results]);

    const topResults = useMemo(
        () =>
            [...results]
                .filter((r) => Number.isFinite(Number(r.percentage)) && r.percentage !== "" && r.percentage !== null)
                .sort((a, b) => Number(b.percentage) - Number(a.percentage))
                .slice(0, 5),
        [results]
    );

    return (
        <Layout>
            <div className="page-content">
                {errors.length > 0 && (
                    <div className="alert alert-danger d-flex justify-content-between align-items-center">
                        <span>{errors.join(" ")} API check korun.</span>
                        <button className="btn btn-sm btn-light" onClick={loadAll}>Retry</button>
                    </div>
                )}

                <section className="row">
                    {/* ===== Left / main area ===== */}
                    <div className="col-12 col-lg-9">
                        <div className="row">
                            <StatCard label="Students" value={students.length} bg="#dcd6fb" loading={loading} />
                            <StatCard label="Teachers" value={teachers.length} bg="#fde9a2" loading={loading} />
                            <StatCard label="Present Today" value={todayStats.present} bg="#dcd6fb" loading={loading} />
                            <StatCard label="Absent Today" value={todayStats.absent} bg="#fde9a2" loading={loading} />
                        </div>

                        <div className="row">
                            <div className="col-12 col-xl-4">
                                <div className="card">
                                    <div className="card-header">
                                        <h4>Students</h4>
                                    </div>
                                    <div className="card-body">
                                        {loading ? (
                                            <div className="text-center py-5">
                                                <div className="spinner-border text-primary" role="status"></div>
                                            </div>
                                        ) : (
                                            <StudentsDonut boys={gender.boys} girls={gender.girls} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-xl-8">
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                                        <h4 className="mb-0">Attendance</h4>
                                        <div className="d-flex gap-2">
                                            <select className="form-select form-select-sm" value={range} onChange={(e) => setRange(e.target.value)}>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                            <select className="form-select form-select-sm" value={classSection} onChange={(e) => setClassSection(e.target.value)}>
                                                <option value="">All Class</option>
                                                {classSections.map((cs) => (
                                                    <option key={cs} value={cs}>{cs}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {loading ? (
                                            <div className="text-center py-5">
                                                <div className="spinner-border text-primary" role="status"></div>
                                            </div>
                                        ) : (
                                            <AttendanceChart bars={bars} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Result overview + Top students */}
                        <div className="row">
                            <div className="col-12 col-xl-5">
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h4 className="mb-0">Result Overview</h4>
                                        <Link to="/Result" style={{ fontSize: 13 }}>View all</Link>
                                    </div>
                                    <div className="card-body">
                                        {loading ? (
                                            <div className="text-center py-5">
                                                <div className="spinner-border text-primary" role="status"></div>
                                            </div>
                                        ) : (
                                            <ResultOverview stats={resultStats} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-xl-7">
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h4 className="mb-0">Top Results</h4>
                                        <Link to="/Result/sheet" style={{ fontSize: 13 }}>Result Sheet</Link>
                                    </div>
                                    <div className="card-body">
                                        {loading ? (
                                            <div className="text-center py-5">
                                                <div className="spinner-border text-primary" role="status"></div>
                                            </div>
                                        ) : (
                                            <TopStudents rows={topResults} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Right sidebar ===== */}
                    <div className="col-12 col-lg-3">
                        <div className="card">
                            <MiniCalendar />
                        </div>

                        <RecentList
                            title="Recent Students"
                            items={recentStudents}
                            empty="Kono student nei."
                            color="#9694ff"
                        />
                        <RecentList
                            title="Recent Teachers"
                            items={recentTeachers}
                            empty="Kono teacher nei."
                            color="#57caeb"
                        />
                    </div>
                </section>
            </div>
        </Layout>
    );
}

export default Dashboard;
