import {ApplicationsEntity} from "@backend/ApplicationsEntity";
import {Restriction} from "@backend/GeneralSubscriptionsType";
import {Box, CircularProgress} from "@mui/material";
import CreateEditSubscription from "../../components/CreateEditSubscription";
import React, {useContext, useEffect} from "react";
import {AxiosContext} from "../../api/axiosInstance";
import {useNavigate, useParams} from "react-router-dom";
import {ApplicationSubscriptionsEntity} from "@backend/ApplicationSubscriptionsEntity";

export default function EditAppSubscription({app, restriction} : {app: ApplicationsEntity | null, restriction: Restriction | null}) {

    const { axios } = useContext(AxiosContext);
    const navigate = useNavigate();
    const {appId} = useParams();
    const [data, setData] = React.useState<ApplicationSubscriptionsEntity | null>(null);
    const [canDelete, setCanDelete] = React.useState<boolean>(false);

    const onSave = async (data: ApplicationSubscriptionsEntity): Promise<void> => {
        return axios.put(`api/${app?.id}/app-subscription/${appId}`, data, { withCredentials: true }).then((response) => {
            setData(response.data.applicationSubscription);
            return Promise.resolve();
        }).catch((error) => {
            console.error("Failed to create application subscription:", error);
            return Promise.reject();
        });
    }

    const onDelete = async (): Promise<void> => {
        axios.delete(`api/${app?.id}/app-subscription/${appId}`, { withCredentials: true }).then(() => {
            navigate(`/auth/dashboard`);
            return Promise.resolve();
        }).catch((error) => {
            console.error("Failed to delete application subscription:", error);
            return Promise.reject();
        });
    }

    useEffect(() => {
        if (app != null) {
            axios.get(`api/${app?.id}/app-subscription/${appId}`, {withCredentials: true})
                .then((response) => {
                    setData(response.data.applicationSubscription);

                })
                .catch((error) => {
                    console.error("Failed to fetch application subscription:", error);
                });
            axios.get<{canDelete: boolean}>(`api/${app?.id}/app-subscription/${appId}/can-delete`, {withCredentials: true})
                .then((response) => {
                    setCanDelete(response.data.canDelete);

                })
                .catch((error) => {
                    setCanDelete(false);
                    console.error("Failed to fetch application subscription:", error);
                });
        }
    }, [appId, app]);

    const onCancel = (): void => {
        navigate(`/auth/dashboard`);
    }

    return (
        <Box>
            {(app !== null && restriction !== null && data !== null) ?
            (<CreateEditSubscription initialData={data} onSave={onSave} onCancel={onCancel} onDelete={canDelete ? onDelete : undefined} restriction={restriction} />) :
            (<CircularProgress />)}
        </Box>
    )
}