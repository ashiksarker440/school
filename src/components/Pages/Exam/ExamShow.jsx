import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(String(value).replace(" ", "T"));
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-GB");
};

function InfoBox({ label, value }) {
    return (
        <div className="col-12 col-md-6">
            <div className="border rounded p-3 h-100">
                <div className="text-muted small">{label}</div>
                <div className="fw-bold">{value || "-"}</div>
            </div>
        </div>
    );
}

export default function ExamShow() {
    const { id } = useParams();
    const [result, setResult] = useState({ id: null, exam: null, error: "" });
    const loading = result.id !== id;
    const exam = loading ? null : result.exam;
    const error = loading ? "" : result.error;

    useEffect(() => {
        let active = true;
        axios.get(`Exam/single.php?id=${encodeURIComponent(id)}`)
            .then((response) => {
                if (!active) return;
                const record = response.data.data?.[0];
                setResult({
                    id,
                    exam: record || null,
                    error: record ? "" : response.data.message || "Exam not found.",
                });
            })
            .catch((requestError) => {
                console.error("Error fetching exam:", requestError);
                if (active) {
                    setResult({
                        id,
                        exam: null,
                        error: requestError.response?.data?.message || "Could not load exam.",
                    });
                }
            });
        return () => {
            active = false;
        };
    }, [id]);

    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="card shadow-sm">
                    <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Exam Details</h5>
                        <div className="d-flex gap-2 d-print-none">
                            {exam && <Link className="btn btn-sm btn-warning" to={`/exam/edit/${exam.id}`}>Edit</Link>}
                            <button type="button" className="btn btn-sm btn-light" onClick={() => window.print()}>Print</button>
                            <Link className="btn btn-sm btn-outline-light" to="/exam">Back</Link>
                        </div>
                    </div>
                    <div className="card-body">
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                        {loading ? (
                            <p className="text-muted mb-0">Loading...</p>
                        ) : !exam ? (
                            <p className="text-muted mb-0">Exam not found.</p>
                        ) : (
                            <div className="row g-3">
                                <InfoBox label="ID" value={exam.id} />
                                <InfoBox label="Exam Name" value={exam.exam_name} />
                                <InfoBox label="Type" value={exam.type} />
                                <InfoBox label="Created At" value={formatDateTime(exam.created_at)} />
                                <InfoBox label="Deleted At" value={formatDateTime(exam.deleted_at)} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
