import React, {useContext, useEffect, useState} from 'react'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Snackbar,
    Stack,
    Typography
} from '@mui/material'
import {ApplicationsEntity} from "@backend/ApplicationsEntity";
import {Restriction} from "@backend/GeneralSubscriptionsType";
import {AxiosContext} from "../../api/axiosInstance";
import {RevenuePerApp} from "@backend/RevenuePerApp";
import EuroIcon from "@mui/icons-material/Euro";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SoldBarChart from "../../components/SoldBarChart";
import RevenuePie from "../../components/RevenuePie";
import KeysTable from "../../components/KeysTable";
import {DashboardKeysEntity} from "@backend/DashboardKeysEntity";
import {AxiosResponse} from "axios";
import {PaginationModel} from "@backend/PaginationModel";
import {ApplicationSubscriptionsEntity} from "@backend/ApplicationSubscriptionsEntity";
import {CreateNewFolder} from "@mui/icons-material";
import SubscriptionCard from "../../components/SubscriptionCard";
import {mapToSubscriptionCardApp} from "../../model/GeneralSubscriptions";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import SubscriptionDragGrid from "../../components/SubscriptionDragGrid";
import Home from "../Home";

export default function Dashboard({loading, app, restriction}: {
    loading: boolean,
    app: ApplicationsEntity | null,
    restriction: Restriction | null
}) {

    const filterBasic = [
        {id: 'all', name: 'All'}
    ]

    const {axios} = useContext(AxiosContext);
    const navigate = useNavigate();
    const [revenues, setRevenues] = useState<RevenuePerApp[]>([]);
    const [generatedTokens, setGeneratedTokens] = useState<number>(0);
    const [filterApp, setFilterApp] = useState<{ id: string, name: string }[]>(filterBasic);
    const [subscriptions, setSubscriptions] = useState<ApplicationSubscriptionsEntity[]>([]);
    const [snackbar, setSnackbar] = useState({open: false, severity: "success", message: ""});

    const refreshSubscriptions = () => {
        if (app != null) {
            axios.get<{
                "subscriptions": ApplicationSubscriptionsEntity[]
            }>("/api/dashboard/:appId/subscriptions".replace(":appId", app.id.toString()), {withCredentials: true})
                .then(response => {
                    setSubscriptions(response.data.subscriptions)
                    const subs = response.data.subscriptions.map((sub) => ({id: sub.id.toString(), name: sub.name}));
                    setFilterApp([...filterBasic, ...subs]);
                })
                .catch(error => console.error('Error fetching revenue data:', error));
        }
    }

    useEffect(() => {
        if (app != null) {
            axios.get<{
                "revenues": RevenuePerApp[]
            }>("/api/dashboard/:appId/revenue".replace(":appId", app.id.toString()), {withCredentials: true})
                .then(response => setRevenues(response.data.revenues))
                .catch(error => console.error('Error fetching revenue data:', error));
            axios.get<{
                "generatedKeys": number
            }>("/api/dashboard/:appId/generated-keys".replace(":appId", app.id.toString()), {withCredentials: true})
                .then(response => setGeneratedTokens(response.data.generatedKeys))
                .catch(error => console.error('Error fetching revenue data:', error));
            refreshSubscriptions();
        }
    }, [app]);

    const totalRevenue = () => {
        if (app != null && restriction != null) {
            return revenues.reduce((acc, rev) => acc + rev.revenue, 0);
        }
        return 0;
    }

    const tokensLeft = () => {
        if (app != null && restriction != null) {
            if (restriction.numberOfTokens !== undefined) {
                return restriction.numberOfTokens - generatedTokens;
            }
        }
    }

    const getTokens = (endToken: string, page: number | undefined, limit: number | undefined, sortDesc: boolean | undefined, title: string | undefined, searchStr: string | undefined): Promise<AxiosResponse<PaginationModel<DashboardKeysEntity>, any, {}>> => {
        let query = [];
        if (page !== undefined) {
            query.push(`page=${page}`);
        }
        if (limit !== undefined) {
            query.push(`limit=${limit}`);
        }
        if (sortDesc !== undefined) {
            query.push(`sort=${sortDesc ? 'desc' : 'asc'}`);
        }
        if (title !== undefined) {
            query.push(`title=${title}`);
        }
        if (searchStr !== undefined) {
            query.push(`search=${searchStr}`);
        }
        let queryString = '';
        if (query.length > 0) {
            queryString = '?' + query.join('&');
        }
        return axios.get<PaginationModel<DashboardKeysEntity>>(("/api/dashboard/:appId/".replace(":appId", app!.id.toString()) + endToken + queryString));
    };

    const activeTokens = (page: number | undefined, limit: number | undefined, sortDesc: boolean | undefined, title: string | undefined, searchStr: string | undefined): Promise<AxiosResponse<PaginationModel<DashboardKeysEntity>, any, {}>> => {
        return getTokens("activekeys", page, limit, sortDesc, title, searchStr);
    }
    const usedTokens = (page: number | undefined, limit: number | undefined, sortDesc: boolean | undefined, title: string | undefined, searchStr: string | undefined): Promise<AxiosResponse<PaginationModel<DashboardKeysEntity>, any, {}>> => {
        return getTokens("usedkeys", page, limit, sortDesc, title, searchStr);
    }

    const onActivate = (subId: string) => {
        onActivation(subId, "activate");
    }
    const onDeactivate = (subId: string) => {
        onActivation(subId, "deactivate");
    }
    const onEdit = (subId: string) => {
        navigate('/auth/sub/edit/' + subId);
    }


    const onActivation = (subId: string, url: string) => {
        axios.put(`api/${app?.id}/app-subscription/${subId}/${url}`, {}, {withCredentials: true})
            .then(response => {
                setSnackbar({open: true, severity: "success", message: "Subscription activated successfully"});
                refreshSubscriptions();
            }).catch(error => {
            setSnackbar({open: true, severity: "error", message: "Failed to activate subscription"});
            console.error('Error activating subscription:', error);
        });
    }

    const onSwap = (subId: string, otherSubId: string) => {
        axios.put(`api/${app?.id}/app-subscriptions/${subId}/swap/${otherSubId}`, {}, {withCredentials: true})
            .then(response => {
                setSnackbar({open: true, severity: "success", message: "Subscription order swapped successfully"});
                refreshSubscriptions();
            }).catch(error => {
            setSnackbar({open: true, severity: "error", message: "Failed to swap subscription order"});
            console.error('Error swapping subscription order:', error);
        });
    }

    return (
        <Box sx={{p: 4}}>
            <Typography variant="h4" sx={{mb: 3, fontWeight: "bold"}}>
                Subscription Dashboard
            </Typography>
            {!loading ? (
                app == null ? (
                        <Home showTopBar={false}/>
                    ) :
                    (<Box><Grid container spacing={3}>
                        {revenues.map((rev) => (
                            <Grid item xs={12} md={4} key={rev.subId}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">{rev.name}</Typography>
                                        <Typography variant="body1">
                                            Sold: <strong>{rev.totalNumber}</strong>
                                        </Typography>
                                        <Typography variant="body1">
                                            Revenue: <strong>{rev.revenue} <EuroIcon fontSize="inherit"/></strong>
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                        <Box sx={{mt: 3}}>
                            <Card sx={{p: 2, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                <Stack direction="column" spacing={2} alignItems="left">
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography variant="h6">Revenue:</Typography>
                                        <Chip label={totalRevenue()} color="primary"/>
                                    </Stack>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography variant="h6">Tokens Generated:</Typography>
                                        <Chip label={generatedTokens} color="secondary"/>
                                    </Stack>
                                    {app.active && tokensLeft() !== undefined && (
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Typography variant="h6">Tokens Left:</Typography>
                                            <Chip label={tokensLeft()} color="secondary"/>
                                        </Stack>)}
                                </Stack>

                                <Stack direction="row" spacing={1}>
                                    <Button
                                        disabled={totalRevenue() === 0}
                                        variant="outlined"
                                        startIcon={<AccountBalanceWalletIcon/>}
                                    >
                                        Start Withdraw Process
                                    </Button>
                                </Stack>
                            </Card>
                        </Box>

                        {app.active && restriction?.showGraph === true && revenues.length > 0 && (
                            <Box>
                                <Divider sx={{my: 4}}/>
                                <Typography variant="h5" sx={{mb: 2, fontWeight: "bold"}}>
                                    Analytics Overview
                                </Typography>

                                <Grid container spacing={4}>
                                    <SoldBarChart revenues={revenues}/>
                                    <RevenuePie revenues={revenues}/>
                                </Grid>
                            </Box>
                        )}
                        <Divider sx={{my: 4}}/>
                        {app.active && (<Typography variant="h5" sx={{mb: 2, fontWeight: "bold"}}>
                            Codes Overview
                        </Typography>)}
                        {app.active && (<Grid container spacing={4}>
                            <KeysTable title={"Used codes"} filter={usedTokens} sub={filterApp}/>
                            <KeysTable title={"Active codes"} filter={activeTokens} sub={filterApp}/>
                        </Grid>)}
                        <Divider sx={{my: 4}}/>
                        <Box sx={{mt: 3}}>
                            <Card sx={{p: 2, display: "flex", justifyContent: "space-between", alignItems: "left"}}>
                                <Stack direction="column" spacing={2} alignItems="left">
                                    <Typography variant="h4" sx={{fontWeight: "bold", mb: 4}}>
                                        Available Subscriptions
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                    {app.active && (<Button
                                        variant="contained"
                                        disabled={restriction?.numberOfSubscriptions !== undefined && subscriptions.length >= restriction.numberOfSubscriptions}
                                        component={RouterLink} to='/auth/sub/create'
                                        startIcon={<CreateNewFolder/>}
                                    >
                                        Create Application Subscription
                                    </Button>)}
                                </Stack>
                            </Card>
                        </Box>
                        <SubscriptionDragGrid subscriptions={subscriptions} onEdit={onEdit} onActivate={onActivate}
                                              onDeactivate={onDeactivate} onSwap={onSwap}
                                              onBuy={() => setSnackbar({
                                                  open: true,
                                                  severity: "success",
                                                  message: "When pressing this button the user buy the subscription type"
                                              })}/>
                        <Card sx={{p: 2, mt: 6, mb: 6}}>
                            <Typography variant="h4" sx={{fontWeight: "bold", mb: 4}}>
                                User subscription view
                            </Typography>

                            <Grid
                                container
                                spacing={2}
                                alignItems="stretch"
                            >
                                {subscriptions.filter(s => s.active).map((sub) => (
                                    <Grid key={"grid" + sub.id} item xs={6} md={4} display="flex">
                                        <SubscriptionCard {...mapToSubscriptionCardApp(sub)} onBuy={() => setSnackbar({
                                            open: true,
                                            severity: "success",
                                            message: "When pressing this button the user buy the subscription type"
                                        })}/>
                                    </Grid>
                                ))}
                            </Grid>
                        </Card>

                    </Box>)
            ) : (<CircularProgress/>)}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({...s, open: false}))}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({...s, open: false}))}
                    severity={snackbar.severity}
                    sx={{width: "100%"}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>)

}
