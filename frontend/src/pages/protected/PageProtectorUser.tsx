import {Route, Routes, useNavigate, useParams, useSearchParams} from "react-router-dom";
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
import NavbarUser from "../../components/NavbarUser";
import UserKeysAuth from "../user/UserKeysAuth";

export default function PageProtectorUser() {

    let params = useParams();
    const [user, setUser] = React.useState<UserEntity | null>(null);
    const {isLoggedIn} = useContext(AuthContext);
    const {axios} = useContext(AxiosContext);
    const navigate = useNavigate();

    useEffect(() => {
        const param = params['*'] || '';
        if (!isLoggedIn) {
            navigate('/');
        } else {
            axios.get('/api/user', {withCredentials: true})
                .then(response => {
                    if (response.data && response.data.applicationSubscriptionIds && response.data.applicationSubscriptionIds.length > 0) {
                        setUser(response.data);
                        if (param === '') {
                            const firstAppId = response.data.applicationSubscriptionIds[0].id;
                            navigate(`/user/auth/${firstAppId}`);
                        }
                    } else {
                        navigate('/');
                    }
                })
                .catch(error => console.error('Error fetching user data:', error));
        }
        // You can add additional side effects here if needed when isLoggedIn changes
    }, [isLoggedIn, params]);

    return (
        isLoggedIn && user ? (<>
            <NavbarUser apps={user.applicationSubscriptionIds ?? []} currentUrlName={params['*'] || ''} hasDashboard={!!user.applicationId}/>
            <Routes>
                <Route path='/:urlName' element={<UserKeysAuth/>}/>
            </Routes> </>) : <></>
    )
}