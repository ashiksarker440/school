import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "../../../Lib/axios";

const CLASSES = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
const SECTIONS = ["A", "B", "C", "D"];

const emptyForm = {
    admission_number: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    class_id: "",
    section: "",
    guardian_name: "",
    guardian_relation: "",
    guardian_phone: "",
    guardianAddress: "",
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

export default function StudentForm() {
    let { id } = useParams();

    const [students, setStudents] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [viewStudent, setViewStudent] = useState(null);
    const [selectedfile, setSelectedFile] = useState([]);// image file


    function fetchData() {
        fetch('http://localhost/school_management/students/single.php?id=' + id)
            .then(response => response.json())
            .then(data => setStudents(data.data[0]))
            .catch(error => console.error('Error fetching student:', error));
    }

    useEffect(() => {
        if (id)
            fetchData();
    }, [students]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    /* handel image/file */
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
        e.preventDefault();
        const formData = new FormData(e.target);
        /* handel image/file */
        for (let i = 0; i < selectedfile.length; i++) {
            formData.append('files[]', selectedfile[i])
        }
        // const data = Object.fromEntries(formData.entries());
        let url = 'Student/create.php';
        let response = await axios.post(`Student/create.php`, formData);

        window.location.href = '/students';
    };




    return (
        <div className="container-fluid py-4">
            <div className="row g-4 mb-4">
                {/* ===== Add / Edit Form ===== */}
                <div className="col-lg-10">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">{editingId ? "Edit Student" : "Add Student"}</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <Field label="Admission Number">
                                    <input type="text" className="form-control" name="admission_number"
                                        placeholder="Admission Number" value={form.admission_number}
                                        onChange={handleChange} required />
                                </Field>

                                <Field label="Student Name">
                                    <input type="text" className="form-control" name="name"
                                        placeholder="Full Name" value={form.name}
                                        onChange={handleChange} required />
                                </Field>

                                <Field label="Email">
                                    <input type="email" className="form-control" name="email"
                                        placeholder="Email" value={form.email} onChange={handleChange} />
                                </Field>

                                <Field label="Phone">
                                    <input type="tel" className="form-control" name="phone"
                                        placeholder="phone" value={form.phone} onChange={handleChange} />
                                </Field>

                                <Field label="Password">
                                    <input type="password" className="form-control" name="password"
                                        placeholder="Password" value={form.password}
                                        onChange={handleChange} required={!editingId} />
                                </Field>

                                <Field label="Class">
                                    <select className="form-select" name="class_id"
                                        value={form.class_id} onChange={handleChange} required>
                                        <option value="">Select Class</option>
                                        {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>

                                <Field label="Section">
                                    <select className="form-select" name="section"
                                        value={form.section} onChange={handleChange} required>
                                        <option value="">Select Section</option>
                                        {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </Field>

                                <h6 className="border-bottom pb-2 mt-4 mb-3">Guardian Information</h6>

                                <Field label="Guardian Name">
                                    <input type="text" className="form-control" name="guardian_name"
                                        placeholder="Guardian Name" value={form.guardian_name}
                                        onChange={handleChange} />
                                </Field>

                                <Field label="Relation">
                                    <select className="form-select" name="guardian_relation"
                                        value={form.guardian_relation} onChange={handleChange}>
                                        <option value="">Select Relation</option>
                                        <option value="Father">Father</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </Field>

                                <Field label="Guardian phone">
                                    <input type="tel" className="form-control" name="guardian_phone"
                                        placeholder="Guardian phone" value={form.guardian_phone}
                                        onChange={handleChange} />
                                </Field>

                                <Field label="Address">
                                    <textarea className="form-control" rows="2" name="guardianAddress"
                                        placeholder="Address" value={form.guardianAddress}
                                        onChange={handleChange} />
                                </Field>

                                <Field label="Student Photo">
                                    <input type="file" className="form-control" accept="image/*"
                                        onChange={handelFile} />
                                    {form.photo && (
                                        <img src={form.photo} alt="Preview" className="mt-2 rounded border"
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
