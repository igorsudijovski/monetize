import {Route, Routes, useNavigate} from "react-router-dom";
import Logout from "./Logout";
import Dashboard from "./Dashboard";
import React, {useContext, useEffect} from "react";
import {AuthContext} from "../../context/authContext";
import {AxiosContext} from "../../api/axiosInstance";
import {ApplicationsEntity} from "@backend/ApplicationsEntity";
import {Restriction} from "@backend/GeneralSubscriptionsType";
import EditAppSubscription from "./EditAppSubscription";
import CreateAppSubscription from "./CreateAppSubscription";

export default function PageProtector() {

    const [user, setUser] = React.useState<{email: string, name: string} | null>(null);
    const [app, setApp] = React.useState<ApplicationsEntity | null>(null);
    const [restriction, setRestriction] = React.useState<Restriction | null>(null);
    const { isLoggedIn } = useContext(AuthContext);
    const { axios } = useContext(AxiosContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/');
        } else {
            axios.get('/api/user', { withCredentials: true })
                .then(response => setUser(response.data))
                .catch(error => console.error('Error fetching user data:', error));
            axios.get('/api/my-subscription', { withCredentials: true })
                .then(response => {
                    setApp(response.data.app);
                    setRestriction(response.data.restriction);
                })
                .catch(error => console.error('Error fetching user data:', error));
        }
        // You can add additional side effects here if needed when isLoggedIn changes
    }, [isLoggedIn]);

    return (
        isLoggedIn ? (
        <Routes>
            <Route path='/logout' element={<Logout/>}/>
            <Route path='/dashboard' element={<Dashboard app={app} restriction={restriction}/>}/>
            <Route path='/sub/edit/:appId' element={<EditAppSubscription app={app} restriction={restriction}/>}/>
            <Route path='/sub/create' element={<CreateAppSubscription app={app} restriction={restriction}/>}/>
        </Routes> ) : <></>
    )
}