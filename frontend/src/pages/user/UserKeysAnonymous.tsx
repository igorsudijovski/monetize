import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Container,
    Typography,
    IconButton,
    Box,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Snackbar
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { AxiosContext } from "../../api/axiosInstance";
import KeyCard, { KeyData } from "../../components/KeyCard";

export default function UserKeysAnonymous() {
    const params = useParams();
    const { axios } = useContext(AxiosContext);

    const [keyData, setKeyData] = useState<KeyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showKey, setShowKey] = useState(false);
    const [useKeyDialog, setUseKeyDialog] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const pageId = params.pageId;
    const urlName = params.urlName;

    useEffect(() => {
        fetchData();
    }, [pageId, urlName]);

    const fetchData = async () => {
        try {
            setLoading(true);

            if (pageId && urlName) {
                const keyResponse = await axios.get(`/api/app/${urlName}/key/${pageId}`);
                setKeyData(keyResponse.data);
            }
        } catch (error) {
            console.error('Error fetching key:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUseKey = async () => {
        if (!keyData) return;

        try {
            await axios.post(`/api/app/${urlName}/key/${keyData.id}/use`);
            setUseKeyDialog(false);
            setSnackbarMessage('Token used successfully!');
            setSnackbarOpen(true);
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error using key:', error);
            setSnackbarMessage('Failed to use token');
            setSnackbarOpen(true);
        }
    };

    const toggleShowKey = () => {
        setShowKey(prev => !prev);
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

    if (!keyData) {
        return (
            <Container sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error">
                    <Typography variant="body1">
                        Key not found. Please check the URL and try again.
                    </Typography>
                </Alert>
            </Container>
        );
    }

    return (
        <>
            <Container sx={{ mt: 4, mb: 4 }}>
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        <strong>Important:</strong> Please save this URL to access your key again.
                        Without logging in, you won't be able to retrieve this key later.
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                            {window.location.href}
                        </Typography>
                        <IconButton
                            onClick={() => copyToClipboard(window.location.href)}
                            size="small"
                            color="warning"
                        >
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Alert>

                {/* Key Display */}
                <Box mb={4}>
                    <Typography variant="h5" gutterBottom>
                        Your Token
                    </Typography>
                    <KeyCard
                        keyData={keyData}
                        isPrimary={true}
                        showKey={showKey}
                        onToggleShowKey={toggleShowKey}
                        onCopyToClipboard={copyToClipboard}
                        onUseKey={() => setUseKeyDialog(true)}
                    />
                </Box>

                {/* Use Key Dialog */}
                <Dialog
                    open={useKeyDialog}
                    onClose={() => setUseKeyDialog(false)}
                >
                    <DialogTitle>Use Token</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to use this token? This action will increment the usage counter.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setUseKeyDialog(false)}>Cancel</Button>
                        <Button
                            onClick={handleUseKey}
                            variant="contained"
                            autoFocus
                        >
                            Confirm
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

