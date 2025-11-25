import {ApplicationsEntity} from "@backend/ApplicationsEntity";
import {Restriction} from "@backend/GeneralSubscriptionsType";

import React, {useContext, useEffect, useState} from "react";
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Divider,
    Grid, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert, Snackbar, Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {GeneralSubscriptionsEntity} from "@backend/GeneralSubscriptionsEntity";
import {AxiosContext} from "../../api/axiosInstance";
import {mapToSubscriptionCard} from "../../model/GeneralSubscriptions";
import SubscriptionCard from "../../components/SubscriptionCard";
import {UserEntity} from "@backend/UserEntity";
import {useStateDebounced} from "../../hook/useStateDebounce";

export default function MySubscription({user, app, restriction} : {user: UserEntity | null, app: ApplicationsEntity | null, restriction: Restriction | null}) {
    const { axios } = useContext(AxiosContext);

    const [urlNameTerm, urlNameValue, setUrlNameTerm] = useStateDebounced('', 400);
    const [hasError, setHasError] = useState(false);
    const [realUrlName, setRealUrlName] = useState(app?.urlName || "");
    const [showClientId, setShowClientId] = useState(false);
    const [showClientSecret, setShowClientSecret] = useState(false);
    const [sub, setSub] = useState<GeneralSubscriptionsEntity | null>(null);
    const [clientId, setClientId] = useState(app?.clientId);
    const [clientSecret, setClientSecret] = useState(app?.clientSecret);
    const [verifyKey, setVerifyKey] = useState("");
    const [subscriptions, setSubscriptions] = useState<GeneralSubscriptionsEntity[]>([]);
    const [snackbar, setSnackbar] = useState({open: false, severity: "success", message: ""});

    const [appForm, setAppForm] = useState({
        name: "",
        tileColor: "#1976d2",
        backgroundColor: "#f5f5f5",
        redirectUrl: "",
        urlName: "",

    });

    useEffect(() => {
        if (app) {
            setClientId(app.clientId);
            setClientSecret(app.clientSecret);
            setAppForm({
                name: app.name || "",
                tileColor: app.fontColor || "#1976d2",
                backgroundColor: app.backgroundColor || "#f5f5f5",
                redirectUrl: app.redirectUrl || "",
                urlName: app.urlName || "",
            });
            setUrlNameTerm(app.urlName);
            setRealUrlName(app.urlName);
            axios.get('/general/subscriptions')
                .then(response => {
                    setSubscriptions(response.data);
                    setSub(response.data.find((s: GeneralSubscriptionsEntity) => s.id === app.subscriptionId) || null);
                })
                .catch(error => console.error('Error fetching user data:', error));
        }
    }, [app]);

    useEffect(() => {

    }, []);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);

    const handleFormChange = (e) => {
        setAppForm({ ...appForm, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (urlNameValue.trim() === "" || hasError) {
            return;
        }
        axios.get(`/api/urlExists/${urlNameValue}`, { withCredentials: true })
            .then(response => {
                if (!response.data.exists) {
                    setAppForm({ ...appForm, urlName: urlNameValue });
                }})
            .catch(error => {
                console.error('Error checking URL name:', error)
            });
    }, [urlNameValue]);

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const confirmAction = () => {
        if (app) {
            axios.get(`api/subscription/${app.id}/cancel`, {withCredentials: true})
                .then(response => {
                    setSnackbar({open: true, severity: "success", message: "Subscription cancelled successfully"});
                    console.log('Subscription cancelled successfully');
                    app.active = false;
                    setModalOpen(false);
                })
                .catch(error => {
                    setSnackbar({open: true, severity: "error", message: "Error cancelling subscription"});
                    console.error('Error cancelling subscription:', error);
                    setModalOpen(false);
                });
        }

    };

    const hasErrorInUrlName = (name: string): void => {
        if (name.trim().length < 3 || name.trim().length > 50) {
            setHasError(true);
        } else
        if (/^[a-zA-Z][a-zA-Z0-9-_]+$/.test(name)) {
            setHasError(false);
        } else {
            setHasError(true);
        }
    }

    const saveAppSettings = () => {
        if (!app) return;
        app.name = appForm.name;
        app.redirectUrl = appForm.redirectUrl;
        app.urlName = appForm.urlName;
        axios.put('/api/my-subscription', app, { withCredentials: true })
            .then(response => {
                setSnackbar({open: true, severity: "success", message: "Application updated successfully"});
                setRealUrlName(appForm.urlName);
                console.log('Application updated successfully');
            })
            .catch(error => console.error('Error updating application:', error));
        // Implement save logic here
    }

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
            <Typography variant="h4" gutterBottom>
                My Subscription
            </Typography>

            {user && (<Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        User Information
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemText primary="Username" secondary={user.email} />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText primary="Name" secondary={user.name} />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>)}



            {/* Application Form */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Application Settings
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Application Name"
                                name="name"
                                fullWidth
                                value={appForm.name}
                                onChange={handleFormChange}
                            />
                        </Grid>
                        {/*<Grid item xs={6}>*/}
                        {/*    <TextField*/}
                        {/*        label="Tile Color"*/}
                        {/*        name="tileColor"*/}
                        {/*        type="color"*/}
                        {/*        fullWidth*/}
                        {/*        value={appForm.tileColor}*/}
                        {/*        onChange={handleFormChange}*/}
                        {/*    />*/}
                        {/*</Grid>*/}
                        {/*<Grid item xs={6}>*/}
                        {/*    <TextField*/}
                        {/*        label="Background Color"*/}
                        {/*        name="backgroundColor"*/}
                        {/*        type="color"*/}
                        {/*        fullWidth*/}
                        {/*        value={appForm.backgroundColor}*/}
                        {/*        onChange={handleFormChange}*/}
                        {/*    />*/}
                        {/*</Grid>*/}
                        <Grid item xs={12}>
                            <TextField
                                label="Page url"
                                name="urlName"
                                fullWidth
                                error={hasError}
                                helperText={hasError ? "This URL name is already taken." : ""}
                                value={urlNameTerm}
                                onChange={(e) => {hasErrorInUrlName(e.target.value); setUrlNameTerm(e.target.value)}}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Redirect URL"
                                name="redirectUrl"
                                fullWidth
                                value={appForm.redirectUrl}
                                onChange={handleFormChange}
                            />
                        </Grid>
                    </Grid>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 2, fontStyle: "italic" }}
                    >
                        Url page:{" "}
                        <Link href={`${window.location.origin}/app/${realUrlName}`} target={"_blank"} rel="noopener noreferrer">
                            {appForm.urlName
                            ? `${window.location.origin}/app/${realUrlName}`
                            : "Your URL will appear here"}</Link>
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 2, fontStyle: "italic" }}
                    >
                        Redirect example:{" "}
                        {appForm.redirectUrl
                            ? `${appForm.redirectUrl}?code=YOUR_CODE`
                            : "Your redirect URL will appear here"}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button variant="contained" color="primary" onClick={saveAppSettings}>
                        Save Settings
                    </Button>
                </CardActions>
            </Card>


            {/* Verify Key */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Verify Key
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            label="Enter API Key"
                            fullWidth
                            value={verifyKey}
                            onChange={(e) => setVerifyKey(e.target.value)}
                        />
                        <Button variant="contained" color="primary">
                            Check
                        </Button>
                        <Button variant="outlined" color="secondary">
                            Verify
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Client ID and Secret */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Client Credentials
                    </Typography>
                    <TextField
                        label="Client ID"
                        fullWidth
                        value={showClientId ? clientId : "••••••••••••••"}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowClientId(!showClientId)}>
                                        {showClientId ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Client Secret"
                        fullWidth
                        value={showClientSecret ? clientSecret : "••••••••••••••"}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowClientSecret(!showClientSecret)}
                                    >
                                        {showClientSecret ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </CardContent>
            </Card>
            {/* API Call Explanation */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        How to Make a POST Call
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        To verify or interact with your API, make a <strong>POST</strong>{" "}
                        request to your endpoint using your <strong>API Key</strong>,{" "}
                        <strong>Client ID</strong>, and <strong>Client Secret</strong>.
                    </Typography>

                    <Box
                        sx={{
                            bgcolor: "#f5f5f5",
                            p: 2,
                            borderRadius: 2,
                            fontFamily: "monospace",
                            whiteSpace: "pre-wrap",
                            fontSize: "0.9rem",
                        }}
                    >
                        {`POST https://your-api-endpoint.com/verify
Headers:
  Content-Type: application/json
  X-API-KEY: YOUR_KEY
  CLIENT-ID: ${showClientId ? clientId : "YOUR_CLIENT_ID"}
  CLIENT-SECRET: ${showClientSecret ? clientSecret : "YOUR_CLIENT_SECRET"}

Body:
{
  "data": "example"
}`}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        You can test this using <strong>curl</strong>, <strong>Postman</strong>, or your preferred HTTP client.
                    </Typography>
                </CardContent>
            </Card>
            {/* Cancel Subscription */}
            {app && app.active ? (<Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Manage Subscription
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        You can cancel your current subscription below.
                    </Typography>
                    {sub && (<SubscriptionCard {...mapToSubscriptionCard(sub)} noButtons={true} />)}
                </CardContent>
                <CardActions>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={openModal}
                    >
                        Cancel Subscription
                    </Button>
                </CardActions>
            </Card>) : <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Available Subscriptions
                    </Typography>
                    <Grid
                        container
                        spacing={2}
                        alignItems="stretch" // 🔥 Ensures equal height rows
                    >
                        {subscriptions.map((sub, index) => (
                            <Grid key={"grid" + sub.id} item xs={6} md={4} display="flex">
                                <SubscriptionCard {...mapToSubscriptionCard(sub)} />
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>}

            {/* Confirmation Modal */}
            <Dialog open={modalOpen} onClose={closeModal}>
                <DialogTitle>
                    Cancellation
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel your current subscription
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeModal}>No</Button>
                    <Button color="primary" variant="contained" onClick={confirmAction}>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
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
        </Box>
    );
}