import { BrowserRouter, Routes, Route } from "react-router";
import { useState } from "react";


import Login from "./components/Pages/Login.jsx";
import Register from "./components/Pages/Register.jsx";
import Logout from './Auth/Logout.jsx';

import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Footer from './components/Footer'
import PageHeading from './components/PageHeading'
import Dashboard from './components/Pages/Dashboard'
import Form from './components/Pages/Form'
import StudentList from './components/Pages/Student/StudentList'
import StudentForm from './components/Pages/Student/StudentForm'
import StudentShow from './components/Pages/Student/StudentShow'
import TeacherList from './components/Pages/Teacher/TeacherList'
import TeacherFrom from './components/Pages/Teacher/TeacherForm'
import TeacherShow from './components/Pages/Teacher/TeacherShow'
import AttendanceList from './components/Pages/Attendance/AttendanceList'
import AttendanceForm from './components/Pages/Attendance/AttendanceForm'
import AttendanceShow from './components/Pages/Attendance/AttendanceShow'
import ExamList from './components/Pages/Exam/ExamList'
import ExamForm from './components/Pages/Exam/ExamForm'
import ExamShow from './components/Pages/Exam/ExamShow'
import ResultList from './components/Pages/Result/ResultList'
import ResultForm from './components/Pages/Result/ResultForm'
import ResultShow from './components/Pages/Result/ResultShow'

function App() {
  const [isSignedIn, setIsSignedIn] = useState(() => {
    /* if you want, user will be logged in until they logout*/
    return localStorage.getItem("access_token") || false;
    /* if you want, user will be logged when they close the browser*/
    //return sessionStorage.getItem("access_token") || false;
  });


  return (
    <BrowserRouter>


      <Routes>

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="Logout" element={<Logout />} />


        <Route index element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="student">
          <Route index element={<StudentList />} />
          <Route path="create" element={<StudentForm />} />
          <Route path="edit/:id" element={<StudentForm />} />
          <Route path=":id" element={<StudentShow />} />
        </Route>
        <Route path="teacher">
          <Route index element={<TeacherList />} />
          <Route path="create" element={<TeacherFrom />} />
          <Route path="edit/:id" element={<TeacherFrom />} />
          <Route path=":id" element={<TeacherShow />} />
        </Route>
        <Route path="Attendance">
          <Route index element={<AttendanceList />} />
          <Route path="create" element={<AttendanceForm />} />
          <Route path="edit/:id" element={<AttendanceForm />} />
          <Route path=":id" element={<AttendanceShow />} />
        </Route>
        <Route path="Exam">
          <Route index element={<ExamList />} />
          <Route path="create" element={<ExamForm />} />
          <Route path=":id" element={<ExamShow />} />
        </Route>
        <Route path="Result">
          <Route index element={<ResultList />} />
          <Route path="create" element={<ResultForm />} />
          <Route path=":id" element={<ResultShow />} />
        </Route>

        {/* <Route element={<AuthLayout />}> */}

        {/* </Route> */}


      </Routes>


    </BrowserRouter>
  )
}


export default App
