import React from 'react'
import {Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import LoginRedirect from "./pages/Login-Redirect";
import {AuthProvider} from "./context/authContext";
import {AxiosProvider} from "./api/axiosInstance";
import PageProtector from "./pages/protected/PageProtector";
import TestDashBoard from "./pages/TestDashBoard";
import TestDashBoardGraph from "./pages/TestDashBoardGraph";
import TestDashBoardGraphCompleted from "./pages/TestDashBoardGraphCompleted";
import CreateEdit from "./pages/CreateEdit";

export default function App() {
    return (
        <AuthProvider>
            <AxiosProvider>
                <Navbar/>
                <Routes>
                    <Route path='/' element={<Home/>}/>
                    <Route path='/login' element={<Login/>}/>
                    <Route path='/auth/*' element={<PageProtector/>}/>
                    <Route path='/test' element={<TestDashBoard/>}/>
                    <Route path='/testg' element={<TestDashBoardGraph/>}/>
                    <Route path='/testc' element={<TestDashBoardGraphCompleted/>}/>
                    <Route path='/create' element={<CreateEdit
                        initialData={null} // or subscription object for editing
                        onSave={(data: any) => console.log("SAVE TO API:", data)}
                        onCancel={() => console.log("Cancel")}
                    />}/>
                    <Route path='/login-redirect' element={<LoginRedirect/>}/>
                    <Route path='*' element={<div>404 Not Found</div>}/>
                </Routes>
            </AxiosProvider>
        </AuthProvider>
    )
}
