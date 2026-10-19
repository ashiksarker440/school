import { useState, useMemo, useEffect, useCallback } from "react";
import { NavLink, Link } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const STATUS_BADGE = {
    Present: "bg-success",
    Absent: "bg-danger",
    Late: "bg-warning text-dark",
};

const formatDate = (d) => {
    if (!d) return "-";
    const [year, month, day] = String(d).slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-GB");
};
const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1).padStart(2, "0"),
    label: new Date(2000, index).toLocaleString("en", { month: "long" }),
}));

const getMonthDays = (year, month) => {
    const count = new Date(Number(year), Number(month), 0).getDate();
    return Array.from({ length: count }, (_, index) => {
        const day = String(index + 1).padStart(2, "0");
        return `${year}-${month}-${day}`;
    });
};

// status 1 / "present" => Present, 2 / "late" => Late, baki sob => Absent
const normalizeStatus = (s) => {
    const v = String(s ?? "").toLowerCase();
    if (v === "1" || v === "present") return "Present";
    if (v === "2" || v === "late") return "Late";
    return "Absent";
};

export default function AttendanceList() {
    const [initialReportDate] = useState(() => new Date());
    const [attendance, setAttendance] = useState([]);
    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const [classSection, setClassSection] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("records");
    const [reportClasses, setReportClasses] = useState([]);
    const [reportSections, setReportSections] = useState([]);
    const [reportStudents, setReportStudents] = useState([]);
    const [reportMonth, setReportMonth] = useState(String(initialReportDate.getMonth() + 1).padStart(2, "0"));
    const [reportYear, setReportYear] = useState(String(initialReportDate.getFullYear()));
    const [reportYears, setReportYears] = useState([String(initialReportDate.getFullYear())]);
    const [reportClass, setReportClass] = useState("");
    const [reportSection, setReportSection] = useState("");
    const [reportStudent, setReportStudent] = useState("");
    const [studentReport, setStudentReport] = useState([]);
    const [classReport, setClassReport] = useState([]);
    const [studentReportLoading, setStudentReportLoading] = useState(false);
    const [classReportLoading, setClassReportLoading] = useState(false);
    const [reportError, setReportError] = useState("");

    const fetchReportOptions = useCallback(async (params = {}) => {
        const response = await axios.get("Attendance/report.php", { params });
        if (!response.data?.status) {
            throw new Error(response.data?.message || "Report options could not be loaded.");
        }
        return response.data.data;
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get("Attendance/index.php");
            const data = response?.data?.data;
            setAttendance(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching attendance:", err);
            setAttendance([]);
            setError("Failed to load attendance records. Please check your API.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const loadClasses = async () => {
            try {
                const data = await fetchReportOptions();
                setReportClasses(data.classes || []);
                setReportYears(data.years || [String(initialReportDate.getFullYear())]);
            } catch (err) {
                console.error("Error loading attendance report classes:", err);
                setReportError(err.response?.data?.message || err.message || "Failed to load report classes.");
            }
        };
        loadClasses();
    }, [fetchReportOptions, initialReportDate]);

    useEffect(() => {
        let active = true;
        if (!reportClass) return () => {
            active = false;
        };

        const loadSections = async () => {
            try {
                const data = await fetchReportOptions({ class_id: reportClass });
                if (active) setReportSections(data.sections || []);
            } catch (err) {
                console.error("Error loading attendance report sections:", err);
                if (active) {
                    setReportError(err.response?.data?.message || err.message || "Failed to load report sections.");
                }
            }
        };
        loadSections();
        return () => {
            active = false;
        };
    }, [fetchReportOptions, reportClass]);

    useEffect(() => {
        let active = true;
        if (!reportClass || !reportSection) return () => {
            active = false;
        };

        const loadStudents = async () => {
            try {
                const data = await fetchReportOptions({
                    class_id: reportClass,
                    section_id: reportSection,
                });
                if (active) setReportStudents(data.students || []);
            } catch (err) {
                console.error("Error loading attendance report students:", err);
                if (active) {
                    setReportError(err.response?.data?.message || err.message || "Failed to load report students.");
                }
            }
        };
        loadStudents();
        return () => {
            active = false;
        };
    }, [fetchReportOptions, reportClass, reportSection]);

    useEffect(() => {
        let active = true;
        if (activeTab !== "student" || !reportClass || !reportYear || !reportMonth || !reportSection || !reportStudent) {
            return () => {
                active = false;
            };
        }

        const loadStudentReport = async () => {
            try {
                setStudentReportLoading(true);
                const response = await axios.get("Attendance/report.php", {
                    params: {
                        type: "student",
                        year: reportYear,
                        month: reportMonth,
                        class_id: reportClass,
                        section_id: reportSection,
                        student_id: reportStudent,
                    },
                });
                if (!response.data?.status) {
                    throw new Error(response.data?.message || "Student report could not be loaded.");
                }
                if (active) setStudentReport(response.data.data?.attendance || []);
            } catch (err) {
                console.error("Error loading student attendance report:", err);
                if (active) {
                    setReportError(err.response?.data?.message || err.message || "Failed to load student report.");
                }
            } finally {
                if (active) setStudentReportLoading(false);
            }
        };
        loadStudentReport();
        return () => {
            active = false;
        };
    }, [activeTab, reportClass, reportMonth, reportSection, reportStudent, reportYear]);

    useEffect(() => {
        let active = true;
        if (activeTab !== "class" || !reportClass || !reportYear || !reportMonth) {
            return () => {
                active = false;
            };
        }

        const loadClassReport = async () => {
            try {
                setClassReportLoading(true);
                const response = await axios.get("Attendance/report.php", {
                    params: {
                        type: "class",
                        year: reportYear,
                        month: reportMonth,
                        class_id: reportClass,
                    },
                });
                if (!response.data?.status) {
                    throw new Error(response.data?.message || "Class report could not be loaded.");
                }
                if (active) setClassReport(response.data.data?.attendance || []);
            } catch (err) {
                console.error("Error loading class attendance report:", err);
                if (active) {
                    setReportError(err.response?.data?.message || err.message || "Failed to load class report.");
                }
            } finally {
                if (active) setClassReportLoading(false);
            }
        };
        loadClassReport();
        return () => {
            active = false;
        };
    }, [activeTab, reportClass, reportMonth, reportYear]);

    // Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this attendance?")) return;
        try {
            await axios.delete(`Attendance/delete.php?id=${id}`);
            await fetchData();
        } catch (err) {
            console.error("Error deleting attendance:", err);
            alert(err.response?.data?.message || "Failed to delete attendance.");
        }
    };

    // Class & Section dropdown-er option data theke auto toiri hobe
    const classSections = useMemo(
        () => [...new Set(attendance.map((a) => a.class_section).filter(Boolean))].sort(),
        [attendance]
    );

    // Search + filters
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return attendance.filter((a) => {
            const matchesSearch =
                !q ||
                [a.admission_no, a.roll_no, a.name, a.class_section]
                    .join(" ")
                    .toLowerCase()
                    .includes(q);

            const matchesDate = !date || String(a.date || "").slice(0, 10) === date;
            const matchesClass = !classSection || a.class_section === classSection;
            const matchesStatus = !status || normalizeStatus(a.status) === status;

            return matchesSearch && matchesDate && matchesClass && matchesStatus;
        });
    }, [attendance, search, date, classSection, status]);

    // Summary (current filter onujayi)
    const presentCount = filtered.filter((a) => normalizeStatus(a.status) === "Present").length;
    const absentCount = filtered.filter((a) => normalizeStatus(a.status) === "Absent").length;
    const resetFilters = () => {
        setSearch("");
        setDate("");
        setClassSection("");
        setStatus("");
    };

    const handleReportClassChange = (value) => {
        setReportClass(value);
        setStudentReportLoading(false);
        setClassReportLoading(false);
        setReportSections([]);
        setReportStudents([]);
        setReportSection("");
        setReportStudent("");
        setStudentReport([]);
        setClassReport([]);
        setReportError("");
    };

    const handleReportSectionChange = (value) => {
        setReportSection(value);
        setStudentReportLoading(false);
        setReportStudents([]);
        setReportStudent("");
        setStudentReport([]);
        setReportError("");
    };

    const isReportLoading = activeTab === "student" ? studentReportLoading : classReportLoading;

    const studentAttendanceByDate = new Map(
        studentReport.map((row) => [String(row.date).slice(0, 10), row])
    );
    const classAttendanceByDate = new Map(
        classReport.map((row) => [String(row.date).slice(0, 10), row])
    );
    const reportDays = getMonthDays(reportYear, reportMonth);

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="card shadow-sm">
                    {/* Header */}
                    <div className="card-header bg-white py-3">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <h5 className="mb-0">
                                <i className="bi bi-calendar-check me-2"></i>
                                Attendance List
                            </h5>
                            <div className="d-flex gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={fetchData}
                                    disabled={loading}
                                >
                                    <i className="bi bi-arrow-clockwise me-1"></i>
                                    Refresh
                                </button>
                                <NavLink className="btn btn-primary" to="./create">
                                    <i className="bi bi-plus-lg me-1"></i>
                                    Add new
                                </NavLink>
                            </div>
                        </div>
                    </div>

                    <div className="card-body">
                        {error && <div className="alert alert-danger">{error}</div>}

                        <ul className="nav nav-tabs mb-4" role="tablist" aria-label="Attendance views">
                            {[
                                ["records", "Attendance Records"],
                                ["student", "Student-wise Report"],
                                ["class", "Class-wise Report"],
                            ].map(([tab, label]) => (
                                <li className="nav-item" role="presentation" key={tab}>
                                    <button
                                        type="button"
                                        className={`nav-link${activeTab === tab ? " active" : ""}`}
                                        role="tab"
                                        aria-selected={activeTab === tab}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setStudentReportLoading(false);
                                            setClassReportLoading(false);
                                            setReportError("");
                                        }}
                                    >
                                        {label}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {activeTab !== "records" && (
                            <>
                                {reportError && <div className="alert alert-danger" role="alert">{reportError}</div>}
                                <div className="row g-3 mb-4">
                                    <div className="col-md-3">
                                        <label className="form-label" htmlFor="report-month">Month</label>
                                        <select
                                            id="report-month"
                                            className="form-select"
                                            value={reportMonth}
                                            onChange={(event) => {
                                                setReportMonth(event.target.value);
                                                setStudentReportLoading(false);
                                                setClassReportLoading(false);
                                                setStudentReport([]);
                                                setClassReport([]);
                                                setReportError("");
                                            }}
                                        >
                                            {monthOptions.map((month) => (
                                                <option key={month.value} value={month.value}>{month.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label" htmlFor="report-year">Year</label>
                                        <select
                                            id="report-year"
                                            className="form-select"
                                            value={reportYear}
                                            onChange={(event) => {
                                                setReportYear(event.target.value);
                                                setStudentReportLoading(false);
                                                setClassReportLoading(false);
                                                setStudentReport([]);
                                                setClassReport([]);
                                                setReportError("");
                                            }}
                                        >
                                            {reportYears.map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label" htmlFor="report-class">Class</label>
                                        <select
                                            id="report-class"
                                            className="form-select"
                                            value={reportClass}
                                            onChange={(event) => handleReportClassChange(event.target.value)}
                                        >
                                            <option value="">Select Class</option>
                                            {reportClasses.map((item) => (
                                                <option key={item.class_id} value={item.class_id}>{item.class_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {activeTab === "student" && (
                                        <>
                                            <div className="col-md-2">
                                                <label className="form-label" htmlFor="report-section">Section</label>
                                                <select
                                                    id="report-section"
                                                    className="form-select"
                                                    value={reportSection}
                                                    onChange={(event) => handleReportSectionChange(event.target.value)}
                                                    disabled={!reportClass}
                                                >
                                                    <option value="">Select Section</option>
                                                    {reportSections.map((item) => (
                                                        <option key={item.section_id} value={item.section_id}>
                                                            {item.section_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-2">
                                                <label className="form-label" htmlFor="report-student">Student</label>
                                                <select
                                                    id="report-student"
                                                    className="form-select"
                                                    value={reportStudent}
                                                    onChange={(event) => {
                                                        setReportStudent(event.target.value);
                                                        setStudentReportLoading(false);
                                                        setStudentReport([]);
                                                        setReportError("");
                                                    }}
                                                    disabled={!reportSection}
                                                >
                                                    <option value="">Select Student</option>
                                                    {reportStudents.map((student) => (
                                                        <option key={student.id} value={student.id}>
                                                            {student.name} ({student.admission_number})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {isReportLoading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading report...</span>
                                        </div>
                                        <p className="mt-2 mb-0">Loading report...</p>
                                    </div>
                                ) : activeTab === "student" ? (
                                    reportClass && reportSection && reportStudent ? (
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-hover align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Day</th>
                                                        <th>Attendance Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportDays.map((day) => {
                                                        const record = studentAttendanceByDate.get(day);
                                                        const statusLabel = record ? normalizeStatus(record.status) : "Not marked";
                                                        return (
                                                            <tr key={day}>
                                                                <td>{formatDate(day)}</td>
                                                                <td>{new Date(`${day}T00:00:00`).toLocaleDateString("en", { weekday: "long" })}</td>
                                                                <td>
                                                                    {record ? (
                                                                        <span className={`badge ${STATUS_BADGE[statusLabel]}`}>
                                                                            {statusLabel}
                                                                        </span>
                                                                    ) : <span className="text-muted">Not marked</span>}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-muted">Select month, year, class, section, and student to view the report.</div>
                                    )
                                ) : (
                                    reportClass ? (
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-hover align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Day</th>
                                                        <th>Present</th>
                                                        <th>Absent</th>
                                                        <th>Late</th>
                                                        <th>Total Marked</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportDays.map((day) => {
                                                        const totals = classAttendanceByDate.get(day) || {};
                                                        const present = Number(totals.present || 0);
                                                        const absent = Number(totals.absent || 0);
                                                        const late = Number(totals.late || 0);
                                                        return (
                                                            <tr key={day}>
                                                                <td>{formatDate(day)}</td>
                                                                <td>{new Date(`${day}T00:00:00`).toLocaleDateString("en", { weekday: "long" })}</td>
                                                                <td><span className="badge bg-success">{present}</span></td>
                                                                <td><span className="badge bg-danger">{absent}</span></td>
                                                                <td><span className="badge bg-warning text-dark">{late}</span></td>
                                                                <td>{present + absent + late}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-muted">Select month, year, and class to view the report.</div>
                                    )
                                )}
                            </>
                        )}

                        {activeTab === "records" && <>
                            {/* Summary cards */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <div className="card border-success h-100">
                                        <div className="card-body">
                                            <div className="text-secondary">Present</div>
                                            <h3 className="text-success mb-0">{presentCount}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-danger h-100">
                                        <div className="card-body">
                                            <div className="text-secondary">Absent</div>
                                            <h3 className="text-danger mb-0">{absentCount}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search + filters */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-3">
                                    <label className="form-label">Search Student</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Name, admission no, roll no..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Class & Section</label>
                                    <select
                                        className="form-select"
                                        value={classSection}
                                        onChange={(e) => setClassSection(e.target.value)}
                                    >
                                        <option value="">All Class & Section</option>
                                        {classSections.map((cs) => (
                                            <option key={cs} value={cs}>{cs}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="Present">Present</option>
                                        <option value="Absent">Absent</option>
                                        <option value="Late">Late</option>
                                    </select>
                                </div>

                                <div className="col-md-2 d-flex align-items-end">
                                    <button
                                        type="button"
                                        className="btn btn-secondary w-100"
                                        onClick={resetFilters}
                                    >
                                        <i className="bi bi-arrow-counterclockwise me-1"></i>
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Admission No</th>
                                            <th>Roll No</th>
                                            <th>Name</th>
                                            <th>Class & Section</th>
                                            <th>Status</th>
                                            <th className="text-end" style={{ minWidth: "150px" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4">
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    <p className="mt-2 mb-0">Loading attendance records...</p>
                                                </td>
                                            </tr>
                                        ) : filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center text-muted py-4">
                                                    No attendance found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filtered.map((a) => {
                                                const st = normalizeStatus(a.status);
                                                return (
                                                    <tr key={a.id}>
                                                        <td>{formatDate(a.date)}</td>
                                                        <td>{a.admission_no || "-"}</td>
                                                        <td>{a.roll_no || "-"}</td>
                                                        <td>{a.name || "-"}</td>
                                                        <td>{a.class_section || "-"}</td>
                                                        <td>
                                                            <span className={`badge ${STATUS_BADGE[st]}`}>{st}</span>
                                                        </td>
                                                        <td className="text-end text-nowrap">
                                                            <Link className="btn btn-sm btn-info text-white me-1" to={`/attendance/${a.id}`} title="View">
                                                                <i className="bi bi-eye"></i>
                                                            </Link>
                                                            <Link className="btn btn-sm btn-warning me-1" to={`/attendance/edit/${a.id}`} title="Edit">
                                                                <i className="bi bi-pencil-square"></i>
                                                            </Link>
                                                            <button className="btn btn-sm btn-danger" title="Delete" onClick={() => handleDelete(a.id)}>
                                                                <i className="bi bi-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="text-muted mt-3">
                                Total Attendance Records: {filtered.length}
                            </div>
                        </>}
                    </div>
                </div>
            </div>
        </Layout>
    );
}