import {Route, Routes, useNavigate, useSearchParams} from "react-router-dom";
import Logout from "./Logout";
import Dashboard from "./Dashboard";
import React, {useContext, useEffect} from "react";
import {AuthContext} from "../../context/authContext";
import {AxiosContext} from "../../api/axiosInstance";
import {ApplicationsEntity} from "@backend/ApplicationsEntity";
import {Restriction} from "@backend/GeneralSubscriptionsType";
import EditAppSubscription from "./EditAppSubscription";
import CreateAppSubscription from "./CreateAppSubscription";
import MySubscription from "./MySubscription";
import {UserEntity} from "@backend/UserEntity";
import NavbarAdmin from "../../components/NavbarAdmin";

export default function PageProtector() {

    const [user, setUser] = React.useState<UserEntity | null>(null);
    const [app, setApp] = React.useState<ApplicationsEntity | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [restriction, setRestriction] = React.useState<Restriction | null>(null);
    const {isLoggedIn} = useContext(AuthContext);
    const {axios} = useContext(AxiosContext);
    const [loading, setLoading] = React.useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const refresh = searchParams.get('refresh');
        if (refresh === 'true') {
            console.log('refreshing dashboard');
            navigate('/auth/dashboard');
        } else {
            if (!isLoggedIn) {
                navigate('/');
            } else {
                console.log('fetching user data');
                setLoading(true);
                axios.get('/api/user', {withCredentials: true})
                    .then(response => setUser(response.data))
                    .catch(error => console.error('Error fetching user data:', error));
                axios.get('/api/my-subscription', {withCredentials: true})
                    .then(response => {
                        setApp(response.data.app);
                        setRestriction(response.data.restriction);
                        setLoading(false)
                    })
                    .catch(error => {
                        console.error('Error fetching user data:', error);
                        setLoading(false);
                    });
            }
        }
        // You can add additional side effects here if needed when isLoggedIn changes
    }, [isLoggedIn, searchParams]);

    return (
        isLoggedIn ? (<>
            <NavbarAdmin user={user}/>
            <Routes>
                <Route path='/logout' element={<Logout/>}/>
                <Route path='/dashboard' element={<Dashboard loading={loading} app={app} restriction={restriction}/>}/>
                <Route path='/subscription'
                       element={<MySubscription user={user} app={app} restriction={restriction}/>}/>
                <Route path='/sub/edit/:appId' element={<EditAppSubscription app={app} restriction={restriction}/>}/>
                <Route path='/sub/create' element={<CreateAppSubscription app={app} restriction={restriction}/>}/>
            </Routes> </>) : <></>
    )
}