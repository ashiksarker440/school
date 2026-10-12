import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from '../../../Lib/axios';

export default function TeacherShow() {
    const [viewTeacher, setViewTeacher] = useState(null);

    let { id } = useParams();

    const fetchData = async () => {
        try {
            const response = await axios.get('Teacher/single.php?id=' + id);
            const data = await response.data;
            setViewTeacher(data.data[0]);
        } catch (error) {
            console.error('Error fetching teacher:', error);
        }
    }

    useEffect(() => {
        if (id)
            fetchData();
    }, [viewTeacher]);
    return (
        <div className="container-fluid py-4">
            <div className="row">
                {/* ===== Teacher Profile ===== */}
                <div className="col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">Teacher Profile</h5>
                        </div>
                        <div className="card-body">
                            {!viewTeacher ? (
                                <p className="text-muted mb-0">List theke "View" button-e click korle profile ekhane dekha jabe.</p>
                            ) : (
                                <div className="d-flex flex-wrap gap-3">
                                    {viewTeacher.photo ? (
                                        <img src={`${import.meta.env.VITE_API_URL}${viewTeacher.photo}`} alt={viewTeacher.name} className="rounded border"
                                            style={{ width: 120, height: 120, objectFit: "cover" }} />
                                    ) : (
                                        <div className="rounded border bg-light d-flex align-items-center justify-content-center text-muted"
                                            style={{ width: 120, height: 120 }}>No Photo</div>
                                    )}
                                    <div>
                                        <h5 className="mb-1">{viewTeacher.name}</h5>
                                        <span className="badge bg-primary mb-2">{viewTeacher.subject}</span>
                                        <p className="mb-1"><strong>Qualification:</strong> {viewTeacher.qualification}</p>
                                        <p className="mb-1"><strong>Salary:</strong> {viewTeacher.salary}</p>
                                        <p className="mb-1"><strong>Joining Date:</strong> {viewTeacher.joining_date}</p>
                                        <hr className="my-2" />
                                        <p className="mb-1"><strong>Email:</strong> {viewTeacher.email || "-"}</p>
                                        <p className="mb-1"><strong>Mobile:</strong> {viewTeacher.phone || "-"}</p>
                                        <p className="mb-0"><strong>Address:</strong> {viewTeacher.address || "-"}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}


