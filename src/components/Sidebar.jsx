import { NavLink } from 'react-router'
function Sidebar() {
    return (
        <div id="sidebar" className="active">
            <div className="sidebar-wrapper active">
                <div className="sidebar-header">
                    <div className="d-flex justify-content-between">
                        <div className="logo">
                            <a href="index.html"><img src="assets/images/logo/logo.png" alt="Logo" /></a>
                        </div>
                        <div className="toggler">

                            <a href="#" className="sidebar-hide d-xl-none d-block"><i className="bi bi-x bi-middle"></i></a>
                        </div>
                    </div>
                </div>
                <div className="sidebar-menu">
                    <ul className="menu">
                        <li className="sidebar-title">Menu</li>

                        <li className="sidebar-item active ">
                            <NavLink to='/dashboard' className='sidebar-link'>
                                <i className="bi bi-grid-fill"></i>
                                <span>Dashboard</span>
                            </NavLink>
                        </li>

                        <li className="sidebar-item  ">
                            <NavLink to="/teacher" className='sidebar-link'>
                                <i className="bi bi-file-earmark-medical-fill"></i>
                                <span>Teacher</span>
                            </NavLink>
                        </li>

                        <li className="sidebar-item  ">
                            <NavLink to="/student" className='sidebar-link'>

                                <i className="bi bi-file-earmark-medical-fill"></i>
                                <span>Student</span>

                            </NavLink >
                        </li>

                        <li className="sidebar-item  ">
                            <NavLink to="/Attendance " className='sidebar-link'>

                                <i className="bi bi-file-earmark-medical-fill"></i>
                                <span>Attendance </span>

                            </NavLink >
                        </li>
                        <li className="sidebar-item  ">
                            <NavLink to="/Exam " className='sidebar-link'>

                                <i className="bi bi-file-earmark-medical-fill"></i>
                                <span>Exam </span>

                            </NavLink >
                        </li>
                        <li className="sidebar-item">
                            <NavLink to="/exam-subject-marks" className='sidebar-link'>
                                <i className="bi bi-journal-check"></i>
                                <span>Exam Subject Marks</span>
                            </NavLink>
                        </li>
                        <li className="sidebar-item">
                            <NavLink to="/student-subject-marks" className='sidebar-link'>
                                <i className="bi bi-pencil-square"></i>
                                <span>Student Exam Marks</span>
                            </NavLink>
                        </li>
                        <li className="sidebar-item  ">
                            <NavLink to="/Result  " className='sidebar-link'>

                                <i className="bi bi-file-earmark-medical-fill"></i>
                                <span>Result  </span>

                            </NavLink >
                        </li>


                    </ul>

                    <ul className="menu">
                        <li className="sidebar-item  ">
                            <NavLink to="/logout  " className='sidebar-link'>
                                <i className="bi bi-lock"></i>
                                <span>Logout</span>
                            </NavLink >
                        </li>
                    </ul>
                </div>
                <button className="sidebar-toggler btn x"><i data-feather="x"></i></button>
            </div>
        </div>
    );
}

export default Sidebar