import React, {useContext, useEffect, useState} from "react";
import {AxiosContext} from "../../api/axiosInstance";
import {Route, Routes, useParams} from "react-router-dom";
import {ApplicationSubscriptionsEntity} from "@backend/ApplicationSubscriptionsEntity";
import NavbarApps from "../../components/NavbarApps";
import AppSubscriptions from "./AppSubscriptions";

export default function UserParent() {
    const {axios} = useContext(AxiosContext);
    const params = useParams();
    const [appData, setAppData] = useState<{id: string, name: string} | null>(null);
    const [subs, setSubs] = useState<ApplicationSubscriptionsEntity[]>([]);

    useEffect(() => {
        if (params.urlName) {
            axios.get(`/user/app/${params.urlName}`)
                .then(response => {
                    setAppData(response.data.app);
                    setSubs(response.data.subs);
                })
                .catch(error => console.error('Error fetching app data:', error));
        }
    }, [params]);

    return (appData && (
        <>
            <NavbarApps name={appData.name} link={appData.id} />
            <Routes>
                <Route path='/' element={<AppSubscriptions app={appData} subs={subs} urlName={params.urlName || ''}/>} />
            </Routes>
        </>));
}