import React from 'react';
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

function Layout({ children }) {


    return (
        <div className="wrapper">
            <Sidebar />
            <div className="main-panel">
                <Header />
                {children}
                <Footer />
            </div>
        </div>

    )
}

export default Layout