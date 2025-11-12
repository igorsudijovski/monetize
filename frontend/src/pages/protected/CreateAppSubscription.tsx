import {ApplicationsEntity} from "@backend/ApplicationsEntity";
import {Restriction} from "@backend/GeneralSubscriptionsType";
import {Box, CircularProgress} from "@mui/material";
import CreateEditSubscription from "../../components/CreateEditSubscription";
import React, {useContext} from "react";
import {AxiosContext} from "../../api/axiosInstance";
import {useNavigate} from "react-router-dom";
import {ApplicationSubscriptionsEntity} from "@backend/ApplicationSubscriptionsEntity";

export default function CreateAppSubscription({app, restriction} : {app: ApplicationsEntity | null, restriction: Restriction | null}) {

    const { axios } = useContext(AxiosContext);
    const navigate = useNavigate();

    const onSave = async (data: ApplicationSubscriptionsEntity): Promise<void> => {
        return axios.post(`api/${app?.id}/app-subscription`, data).then((response) => {
            navigate(`/auth/sub/edit/${response.data.applicationSubscription.id}`);
            return Promise.resolve();
        }).catch((error) => {
            console.error("Failed to create application subscription:", error);
            return Promise.reject();
        });
    }

    const onCancel = (): void => {
        navigate(`/auth/dashboard`);
    }

    return (
        <Box>
            {(app !== null && restriction !== null) ?
            (<CreateEditSubscription initialData={null} onSave={onSave} onCancel={onCancel} restriction={restriction} />) :
            (<CircularProgress />)}
        </Box>
    )
}