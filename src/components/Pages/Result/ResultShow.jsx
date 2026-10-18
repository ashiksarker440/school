import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const SCHOOL_NAME = "Your School Name"; // <-- apnar school-er naam din (print-e dekhabe)

export default function ResultShow() {
    const [viewResult, setViewResult] = useState(null);
    const [loading, setLoading] = useState(true);

    let { id } = useParams();

    const fetchData = async () => {
        try {
            const response = await axios.get("Result/single.php?id=" + id);
            const data = await response.data;
            setViewResult(data.data[0] || null);
        } catch (error) {
            console.error("Error fetching result:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const passed = viewResult?.result === "Pass";

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="row">
                    {/* ===== Result Details ===== */}
                    <div className="col-lg-12">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center d-print-none">
                                <h5 className="mb-0">Result Details</h5>
                                <div className="d-flex gap-2">
                                    <button type="button" className="btn btn-sm btn-light" onClick={() => window.print()}>
                                        Print
                                    </button>
                                    <Link className="btn btn-sm btn-outline-light" to="/result">Back</Link>
                                </div>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <p className="text-muted mb-0">Loading...</p>
                                ) : !viewResult ? (
                                    <p className="text-muted mb-0">Result record paoa jayni.</p>
                                ) : (
                                    <div>
                                        <div className="text-center mb-4">
                                            <h3 className="mb-0">{SCHOOL_NAME}</h3>
                                            <h5 className="mb-0">Result Sheet</h5>
                                        </div>

                                        <div className="row mb-4">
                                            <div className="col-md-6">
                                                <strong>Name:</strong> {viewResult.name}
                                            </div>
                                            <div className="col-md-6">
                                                <strong>Admission No:</strong> {viewResult.admission_no}
                                            </div>
                                            <div className="col-md-6">
                                                <strong>Total Marks:</strong> {viewResult.total ?? "-"}
                                            </div>
                                            <div className="col-md-6">
                                                <strong>Percentage:</strong>{" "}
                                                {viewResult.percentage !== null && viewResult.percentage !== ""
                                                    ? `${Number(viewResult.percentage).toFixed(1)}%`
                                                    : "-"}
                                            </div>
                                        </div>

                                        <div className="row text-center g-3">
                                            <div className="col-6 col-md-3">
                                                <div className="border rounded p-2">
                                                    <div className="small text-muted">GPA</div>
                                                    <div className="fs-4 fw-bold">{viewResult.gpa ?? "-"}</div>
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <div className="border rounded p-2">
                                                    <div className="small text-muted">Grade</div>
                                                    <div className="fs-4 fw-bold">{viewResult.grade || "-"}</div>
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <div className="border rounded p-2">
                                                    <div className="small text-muted">Result</div>
                                                    <div className={`fs-4 fw-bold ${passed ? "text-success" : "text-danger"}`}>
                                                        {passed ? "PASS" : "FAIL"}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <div className="border rounded p-2">
                                                    <div className="small text-muted">Merit Position</div>
                                                    <div className="fs-4 fw-bold">{viewResult.merit || "-"}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row text-center mt-5 pt-3">
                                            <div className="col-4"><div className="border-top pt-1">Class Teacher</div></div>
                                            <div className="col-4"><div className="border-top pt-1">Guardian</div></div>
                                            <div className="col-4"><div className="border-top pt-1">Principal</div></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
