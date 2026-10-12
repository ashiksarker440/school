import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from '../../../Lib/axios';
import Layout from "../Layout";
export default function StudentShow() {
    const [viewStudent, setViewStudent] = useState(null);

    let { id } = useParams();

    const fetchData = async () => {
        try {
            const response = await axios.get('Student/single.php?id=' + id);
            const data = await response.data;
            setViewStudent(data.data[0]);
        } catch (error) {
            console.error('Error fetching student:', error);
        }
    }

    useEffect(() => {
        if (id)
            fetchData();
    }, [viewStudent]);


    return (
        <Layout>
            <div className="container-fluid py-4">
                <div className="row">
                    {/* ===== Student Profile ===== */}
                    <div className="col-lg-12">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-success text-white">
                                <h5 className="mb-0">Student Profile</h5>
                            </div>
                            <div className="card-body">
                                {!viewStudent ? (
                                    <p className="text-muted mb-0">List theke "View" button-e click korle profile ekhane dekha jabe.</p>
                                ) : (
                                    <div className="d-flex flex-wrap gap-3">
                                        {viewStudent.photo ? (
                                            <img src={`${import.meta.env.VITE_API_URL}${viewStudent.photo}`} alt={viewStudent.name} className="rounded border"
                                                style={{ width: 120, height: 120, objectFit: "cover" }} />
                                        ) : (
                                            <div className="rounded border bg-light d-flex align-items-center justify-content-center text-muted"
                                                style={{ width: 120, height: 120 }}>No Photo</div>
                                        )}
                                        <div>
                                            <h5 className="mb-1">{viewStudent.name}</h5>
                                            <p className="mb-1"><strong>Admission No:</strong> {viewStudent.admission_number}</p>
                                            <p className="mb-1"><strong>Class & Section:</strong> {viewStudent.class_id} - {viewStudent.section}</p>
                                            <p className="mb-1"><strong>Email:</strong> {viewStudent.email || "-"}</p>
                                            <p className="mb-1"><strong>Mobile:</strong> {viewStudent.phone || "-"}</p>
                                            <hr className="my-2" />
                                            <p className="mb-1"><strong>Guardian:</strong> {viewStudent.guardian_name || "-"} ({viewStudent.guardian_relation || "-"})</p>
                                            <p className="mb-1"><strong>Guardian Mobile:</strong> {viewStudent.guardian_phone || "-"}</p>
                                            <p className="mb-0"><strong>Address:</strong> {viewStudent.address || "-"}</p>
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
