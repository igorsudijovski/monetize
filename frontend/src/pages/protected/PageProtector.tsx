import {Route, Routes, useNavigate} from "react-router-dom";
import Logout from "./Logout";
import Dashboard from "./Dashboard";
import React, {useContext, useEffect} from "react";
import {AuthContext} from "../../context/authContext";

export default function PageProtector() {

    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
        }
        // You can add additional side effects here if needed when isLoggedIn changes
    }, [isLoggedIn]);

    return (
        isLoggedIn ? (
        <Routes>
            <Route path='/logout' element={<Logout/>}/>
            <Route path='/dashboard' element={<Dashboard/>}/>
        </Routes> ) : <></>
    )
}