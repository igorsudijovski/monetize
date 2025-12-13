import React from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    Box,
    Chip,
    Divider,
    TextField,
    InputAdornment,
    Grid,
    Stack,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CancelIcon from '@mui/icons-material/Cancel';

export interface KeyData {
    id: string;
    appKey: string;
    numUsages: number;
    active: boolean;
    expiresAt: string | null;
    lastUsedAt: string | null;
    createdAt: string;
    price: number;
    ownerId: string | null;
    subscriptionId: string;
    subscriptionName: string;
    subscriptionCescription: string;
    numDays: number | null;
    usageLimit: number | null;
    isLifetime: boolean;
    appId: string;
    appName: string;
    appUrlName: string;
    pageId?: string;
}

export const getKeyType = (key: KeyData): string => {
    if (key.isLifetime) return 'Lifetime';
    if (key.numDays && key.numDays > 0) return `Subscription ${key.numDays} Days`;
    if (key.usageLimit && key.usageLimit > 0) return `Usage Limited ${key.usageLimit}`;
    return 'One-Time';
};

export const getExpiryText = (key: KeyData): string | null => {
    if (key.expiresAt) {
        const expiryDate = new Date(key.expiresAt);
        const now = new Date();
        const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) return 'Expired';
        if (daysLeft === 0) return 'Expires today';
        if (daysLeft === 1) return 'Expires tomorrow';
        return `Expires in ${daysLeft} days`;
    }
    return null;
};

interface KeyCardProps {
    keyData: KeyData;
    isPrimary?: boolean;
    showKey: boolean;
    onToggleShowKey: () => void;
    onCopyToClipboard: (text: string) => void;
    onUseKey?: () => void;
    onCancelSubscription?: () => void;
}

export default function KeyCard({
    keyData,
    isPrimary = false,
    showKey,
    onToggleShowKey,
    onCopyToClipboard,
    onUseKey,
    onCancelSubscription
}: KeyCardProps) {
    const keyType = getKeyType(keyData);
    const expiryText = getExpiryText(keyData);
    const isSubscription = keyData.numDays && keyData.numDays > 0;
    const hasUsageLimit = keyData.usageLimit && keyData.usageLimit > 0;

    return (
        <Card
            sx={{
                mb: 2,
                border: isPrimary ? '2px solid primary.main' : '1px solid grey.300',
                opacity: keyData.active ? 1 : 0.6
            }}
        >
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                            {keyData.subscriptionName}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Chip
                            label={keyType}
                            color={keyData.active ? "primary" : "default"}
                            size="small"
                        />
                        {!keyData.active && (
                            <Chip label="Inactive" color="error" size="small" />
                        )}
                    </Stack>
                </Stack>

                {keyData.subscriptionCescription && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        {keyData.subscriptionCescription}
                    </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Key Token */}
                <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                        Token Key
                    </Typography>
                    <TextField
                        fullWidth
                        value={showKey ? keyData.appKey : '••••••••••••••'}
                        type={showKey ? 'text' : 'password'}
                        size="small"
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={onToggleShowKey} edge="end">
                                        {showKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                    <IconButton onClick={() => onCopyToClipboard(keyData.appKey)} edge="end">
                                        <ContentCopyIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* Usage Info */}
                {hasUsageLimit && (
                    <Box mb={2}>
                        <Typography variant="caption" color="text.secondary">
                            Usage: {keyData.numUsages} / {keyData.usageLimit}
                        </Typography>
                    </Box>
                )}

                {/* Expiry Info */}
                {expiryText && (
                    <Box mb={2}>
                        <Typography
                            variant="caption"
                            color={expiryText.includes('Expired') ? 'error' : 'warning.main'}
                        >
                            {expiryText}
                        </Typography>
                    </Box>
                )}

                {/* Metadata */}
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                            Purchased
                        </Typography>
                        <Typography variant="body2">
                            {new Date(keyData.createdAt).toLocaleDateString()}
                        </Typography>
                    </Grid>
                    {keyData.lastUsedAt && (
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                                Last Used
                            </Typography>
                            <Typography variant="body2">
                                {new Date(keyData.lastUsedAt).toLocaleDateString()}
                            </Typography>
                        </Grid>
                    )}
                </Grid>

                {/* Actions */}
                {keyData.active && onUseKey && (
                    <Stack direction="row" spacing={1} mt={2}>
                        <Button
                            variant="contained"
                            startIcon={<PlayArrowIcon />}
                            onClick={onUseKey}
                            fullWidth
                        >
                            Use Token
                        </Button>
                        {isSubscription && onCancelSubscription && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={onCancelSubscription}
                                fullWidth
                            >
                                Cancel
                            </Button>
                        )}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}

