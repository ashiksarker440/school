import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "../../../Lib/axios";

const SUBJECTS = ["Bangla", "English", "Mathematics", "Science", "Social Science", "Religion", "ICT", "Physics", "Chemistry", "Biology"];
const QUALIFICATIONS = ["HSC", "Bachelor (B.A / B.Sc / B.Com)", "B.Ed", "Masters (M.A / M.Sc / M.Com)", "M.Ed", "PhD"];

const emptyForm = {
    name: "",
    email: "",
    phone: "",
    password: "",
    qualification: "",
    main_subject: "",
    salary: "",
    joining_date: "",
    address: "",
    photo: "",
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

export default function TeacherManagement() {
    let { id } = useParams();
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [selectedfile, setSelectedFile] = useState([]);// image file

    const fetchData = async () => {
        try {
            const response = await axios.get('Teacher/single.php?id=' + id);
            const data = await response.data;
            setForm(data.data[0]);
        } catch (error) {
            console.error('Error fetching Teacher:', error);
        }
    }

    useEffect(() => {
        if (id)
            fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handelFile = (e) => {
        setSelectedFile(e.target.files)
    }

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    // Add / Edit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        /* handel image/file */
        for (let i = 0; i < selectedfile.length; i++) {
            formData.append('files[]', selectedfile[i])
        }
        // const data = Object.fromEntries(formData.entries());
        let url = '';
        if (id) {
            url = 'Teacher/update.php?id=' + id;
        } else {
            url = 'Teacher/create.php';
        }
        let response = await axios.post(url, formData);

        window.location.href = '/teacher';
    };



    return (
        <div className="container-fluid py-4">
            <div className="row g-4 mb-4">
                {/* ===== Add / Edit Form ===== */}
                <div className="col-lg-12">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">{editingId ? "Edit Teacher" : "Add Teacher"}</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <Field label="Teacher Name">
                                    <input type="text" className="form-control" name="name"
                                        placeholder="Full Name" value={form.name}
                                        onChange={handleChange} required />
                                </Field>

                                <Field label="Email">
                                    <input type="email" className="form-control" name="email"
                                        placeholder="Email" value={form.email}
                                        onChange={handleChange} required />
                                </Field>

                                <Field label="phone">
                                    <input type="tel" className="form-control" name="phone"
                                        placeholder="phone" value={form.phone} onChange={handleChange} />
                                </Field>

                                <Field label="Password">
                                    <input type="password" className="form-control" name="password"
                                        placeholder="Password" value={form.password}
                                        onChange={handleChange} required={!editingId} />
                                </Field>

                                <Field label="Qualification">
                                    <select className="form-select" name="qualification"
                                        value={form.qualification} onChange={handleChange} required>
                                        <option value="">Select Qualification</option>
                                        {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                                    </select>
                                </Field>

                                <Field label="main_subject">
                                    <select className="form-select" name="main_subject"
                                        value={form.main_subject} onChange={handleChange} required>
                                        <option value="">Select Subject</option>
                                        {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </Field>

                                <Field label="Salary">
                                    <div className="input-group">
                                        <span className="input-group-text">৳</span>
                                        <input type="number" min="0" className="form-control" name="salary"
                                            placeholder="Monthly Salary" value={form.salary}
                                            onChange={handleChange} required />
                                    </div>
                                </Field>

                                <Field label="Joining Date">
                                    <input type="date" className="form-control" name="joining_date"
                                        value={form.joining_date} onChange={handleChange} required />
                                </Field>

                                <Field label="Address">
                                    <textarea className="form-control" rows="2" name="address"
                                        placeholder="Address" value={form.address}
                                        onChange={handleChange} />
                                </Field>

                                <Field label="Teacher Photo">
                                    <input type="file" className="form-control" accept="image/*"
                                        onChange={handelFile} />
                                    {form.photo && (
                                        <img src={`${import.meta.env.VITE_API_URL}${form.photo}`} alt="Preview" className="mt-2 rounded border"
                                            style={{ width: 90, height: 90, objectFit: "cover" }} />
                                    )}
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
