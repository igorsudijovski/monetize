import React from 'react'
import {Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import LoginRedirect from "./pages/Login-Redirect";
import {AuthProvider} from "./context/authContext";
import {AxiosProvider} from "./api/axiosInstance";
import PageProtector from "./pages/protected/PageProtector";

export default function App() {
    return (
        <AuthProvider>
            <AxiosProvider>
                <Navbar/>
                <Routes>
                    <Route path='/' element={<Home/>}/>
                    <Route path='/login' element={<Login/>}/>
                    <Route path='/auth/*' element={<PageProtector/>}/>
                    <Route path='/login-redirect' element={<LoginRedirect/>}/>
                    <Route path='*' element={<div>404 Not Found</div>}/>
                </Routes>
            </AxiosProvider>
        </AuthProvider>
    )
}
