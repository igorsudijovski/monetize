import React from 'react'
import {Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import LoginRedirect from "./pages/Login-Redirect";
import {AuthProvider} from "./context/authContext";
import {AxiosProvider} from "./api/axiosInstance";
import PageProtector from "./pages/protected/PageProtector";
import UserParent from "./pages/user/UserParent";
import UserKeysAnonymous from "./pages/user/UserKeysAnonymous";
import PageProtectorUser from "./pages/protected/PageProtectorUser";

export default function App() {
    return (
        <AuthProvider>
            <AxiosProvider>
                <Routes>
                    <Route path='/' element={<Home/>}/>
                    <Route path='/auth/*' element={<PageProtector/>}/>
                    <Route path='/app/:urlName/*' element={<UserParent/>}/>
                    <Route path='/user/auth/*' element={<PageProtectorUser/>}/>
                    <Route path='/sub/:urlName/keys/:pageId' element={<UserKeysAnonymous />}/>
                    <Route path='/login-redirect' element={<LoginRedirect/>}/>
                    <Route path='*' element={<div>404 Not Found</div>}/>
                </Routes>
            </AxiosProvider>
        </AuthProvider>
    )
}
