import React from 'react';
import Sidebar from "../Sidebar.jsx";
import Header from "../Header.jsx";
import Footer from "../Footer.jsx";
import PageHeading from "../PageHeading.jsx";

function Layout({ children }) {


    return (
        <div id="app">
            <Sidebar />
            <div id="main">
                <Header />
                <PageHeading heading="Dashboard" />
                {children}




                <Footer />
            </div>
        </div>
    )
}

export default Layout