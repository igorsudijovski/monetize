import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Snackbar,
    Grid
} from '@mui/material';
import { AxiosContext } from "../../api/axiosInstance";
import KeyCard, { KeyData } from "../../components/KeyCard";

export default function UserKeysAuth() {
    const params = useParams();
    const { axios } = useContext(AxiosContext);

    const [allKeys, setAllKeys] = useState<KeyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showKey, setShowKey] = useState<{ [keyId: string]: boolean }>({});
    const [useKeyDialog, setUseKeyDialog] = useState<string | null>(null);
    const [cancelDialog, setCancelDialog] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const urlName = params.urlName;

    useEffect(() => {
        fetchData();
    }, [urlName]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch all keys
            const keysResponse = await axios.get(`/api/app/${urlName}/keys`);
            const keys: KeyData[] = keysResponse.data;
            setAllKeys(keys);

        } catch (error) {
            console.error('Error fetching keys:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUseKey = async (keyId: string) => {
        try {
            await axios.post(`/api/app/${urlName}/key/${keyId}/use`);
            setUseKeyDialog(null);
            setSnackbarMessage('Token used successfully!');
            setSnackbarOpen(true);
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error using key:', error);
            setSnackbarMessage('Failed to use token');
            setSnackbarOpen(true);
        }
    };

    const handleCancelSubscription = async (keyId: string) => {
        try {
            await axios.post(`/api/key/${keyId}/cancel`);
            setCancelDialog(null);
            setSnackbarMessage('Subscription cancelled successfully!');
            setSnackbarOpen(true);
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            setSnackbarMessage('Failed to cancel subscription');
            setSnackbarOpen(true);
        }
    };

    const toggleShowKey = (keyId: string) => {
        setShowKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setSnackbarMessage('Copied to clipboard!');
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    const activeKeys = allKeys.filter(k => k.active);
    const inactiveKeys = allKeys.filter(k => !k.active);

    return (
        <>
            <Container sx={{ mt: 6, mb: 6 }}>
                {/* Active Keys */}
                {activeKeys.length > 0 && (
                    <Box mb={3}>
                        <Typography variant="h5" gutterBottom>
                            Active Tokens
                        </Typography>
                        <Grid container spacing={2}>
                            {activeKeys.map(key => (
                                <Grid item xs={12} md={6} lg={4} key={key.id}>
                                    <KeyCard
                                        keyData={key}
                                        showKey={showKey[key.id] || false}
                                        onToggleShowKey={() => toggleShowKey(key.id)}
                                        onCopyToClipboard={copyToClipboard}
                                        onUseKey={() => setUseKeyDialog(key.id)}
                                        onCancelSubscription={() => setCancelDialog(key.id)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Inactive/Used Keys */}
                {inactiveKeys.length > 0 && (
                    <Box mb={4}>
                        <Typography variant="h5" gutterBottom>
                            Inactive Tokens
                        </Typography>
                        <Grid container spacing={2}>
                            {inactiveKeys.map(key => (
                                <Grid item xs={12} md={6} lg={4} key={key.id}>
                                    <KeyCard
                                        keyData={key}
                                        showKey={showKey[key.id] || false}
                                        onToggleShowKey={() => toggleShowKey(key.id)}
                                        onCopyToClipboard={copyToClipboard}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Use Key Dialog */}
                <Dialog
                    open={useKeyDialog !== null}
                    onClose={() => setUseKeyDialog(null)}
                >
                    <DialogTitle>Use Token</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to use this token? This action will increment the usage counter.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setUseKeyDialog(null)}>Cancel</Button>
                        <Button
                            onClick={() => useKeyDialog && handleUseKey(useKeyDialog)}
                            variant="contained"
                            autoFocus
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Cancel Subscription Dialog */}
                <Dialog
                    open={cancelDialog !== null}
                    onClose={() => setCancelDialog(null)}
                >
                    <DialogTitle>Cancel Subscription</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to cancel this subscription? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCancelDialog(null)}>No, Keep It</Button>
                        <Button
                            onClick={() => cancelDialog && handleCancelSubscription(cancelDialog)}
                            variant="contained"
                            color="error"
                            autoFocus
                        >
                            Yes, Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </>
    );
}

