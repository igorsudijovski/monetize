import React from 'react'
import {Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import LoginRedirect from "./pages/Login-Redirect";
import {AuthProvider} from "./context/authContext";
import {AxiosProvider} from "./api/axiosInstance";
import PageProtector from "./pages/protected/PageProtector";
import UserParent from "./pages/user/UserParent";

export default function App() {
    return (
        <AuthProvider>
            <AxiosProvider>
                <Routes>
                    <Route path='/' element={<Home/>}/>
                    <Route path='/auth/*' element={<PageProtector/>}/>
                    <Route path='/app/:appId' element={<UserParent/>}/>
                    <Route path='/login-redirect' element={<LoginRedirect/>}/>
                    <Route path='*' element={<div>404 Not Found</div>}/>
                </Routes>
            </AxiosProvider>
        </AuthProvider>
    )
}
