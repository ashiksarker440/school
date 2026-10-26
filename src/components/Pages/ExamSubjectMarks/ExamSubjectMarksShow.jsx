import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import axios from "../../../Lib/axios";
import Layout from "../Layout";

const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB");
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

export default function ExamSubjectMarksShow() {
    const { id } = useParams();
    const [result, setResult] = useState({ id: null, record: null, error: "" });
    const loading = result.id !== id;
    const record = loading ? null : result.record;
    const error = loading ? "" : result.error;

    useEffect(() => {
        let active = true;
        axios.get(`ExamSubjectMarks/single.php?id=${encodeURIComponent(id)}`)
            .then((response) => {
                if (!active) return;
                const row = response.data.data?.[0] || null;
                setResult({
                    id,
                    record: row,
                    error: row ? "" : response.data.message || "Record not found.",
                });
            })
            .catch((requestError) => {
                console.error("Error fetching exam subject marks:", requestError);
                if (active) {
                    setResult({
                        id,
                        record: null,
                        error: requestError.response?.data?.message || "Could not load record.",
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
                        <h5 className="mb-0">Exam Subject Marks Details</h5>
                        <div className="d-flex gap-2 d-print-none">
                            {record && (
                                <Link className="btn btn-sm btn-warning" to={`/exam-subject-marks/edit/${record.id}`}>
                                    Edit
                                </Link>
                            )}
                            <button type="button" className="btn btn-sm btn-light" onClick={() => window.print()}>Print</button>
                            <Link className="btn btn-sm btn-outline-light" to="/exam-subject-marks">Back</Link>
                        </div>
                    </div>
                    <div className="card-body">
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                        {loading ? (
                            <p className="text-muted mb-0">Loading...</p>
                        ) : !record ? (
                            <p className="text-muted mb-0">Record not found.</p>
                        ) : (
                            <div className="row g-3">
                                <InfoBox label="ID" value={record.id} />
                                <InfoBox label="Exam ID" value={record.exam_id} />
                                <InfoBox label="Class ID" value={record.class_id} />
                                <InfoBox label="Subject ID" value={record.subject_id} />
                                <InfoBox label="Full Marks" value={record.full_marks} />
                                <InfoBox label="Pass Marks" value={record.pass_marks} />
                                <InfoBox label="Exam Date" value={formatDate(record.exam_date)} />
                                <InfoBox label="Deleted At" value={record.deleted_at} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
