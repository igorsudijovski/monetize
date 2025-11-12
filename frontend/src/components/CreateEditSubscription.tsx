import React, {useEffect, useState} from "react";
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider, CircularProgress, Snackbar, Alert,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import {SubscriptionCardProps, SubscriptionType} from "../model/SubscriptionCardProps";
import SubscriptionCard from "../components/SubscriptionCard";
import {ApplicationSubscriptionsEntity} from "@backend/ApplicationSubscriptionsEntity";
import {Restriction} from "@backend/GeneralSubscriptionsType";

export default function CreateEditSubscription({ initialData, onSave, onCancel, onDelete, restriction }:
{initialData: ApplicationSubscriptionsEntity | null,
    onSave: (data: ApplicationSubscriptionsEntity) => Promise<void>,
    onCancel: () => void,
    onDelete?: () => Promise<void> | null,
    restriction: Restriction}) {
    const getType = () : SubscriptionType => {
        if (!initialData) return "one_time";
        if (initialData.isLifetime) return "lifetime";
        if (initialData.numDays && initialData.numDays > 0) return "subscription";
        if (initialData.numUsages && initialData.numUsages > 0) return "usage_limited";
        return "one_time";
    }

    const getSubscriptionText = (type: SubscriptionType) : string => {
        switch (type) {
            case "one_time": return "One-Time Purchase";
            case "lifetime": return "Lifetime Access";
            case "usage_limited": return "Number of Usages";
            case "subscription": return "Subscription (days)";
        }
    }

    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [price, setPrice] = useState(initialData?.price || "");
    const [listInput, setListInput] = useState("");
    const [features, setFeatures] = useState(initialData?.bulletText || []);
    const [type, setType] = useState<string>(getType());
    const [days, setDays] = useState(initialData?.numDays || "");
    const [usageLimit, setUsageLimit] = useState(initialData?.numUsages || "");
    const [disabled, setDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, severity: "success", message: "" });

    const mapper = () : SubscriptionCardProps => {
        return {
            id: initialData?.id || "",
            title: name,
            description: description,
            price: Number(price),
            active: true,
            items: features,
            type: type as SubscriptionType,
            days: type === "subscription" ? Number(days) : 0,
            usageLimit: type === "usage_limited" ? Number(usageLimit) : 0,
            adminSide: true,
            showAdminActions: false,
        }
    }

    const [subscriptionCardProps, setSubscriptionCardProps] = useState<SubscriptionCardProps>(mapper());

    useEffect(() => {
        setSubscriptionCardProps(mapper());
        if (name == "" || price == 0 || isNaN(Number(price))) {
            setDisabled(true);
        } else if (type === "subscription" && (days == "" || days == "0" || isNaN(Number(days)))) {
            setDisabled(true);
        } else if (type === "usage_limited" && (usageLimit == "" || usageLimit == "0" || isNaN(Number(usageLimit)))) {
            setDisabled(true);
        } else if (Number(price) > restriction.priceHigh || Number(price) < restriction.priceLow) {
            setDisabled(true);
        } else {
            setDisabled(false);
        }
    }, [name, description, price, features, type, days, usageLimit]);


    // Add feature bullet
    const handleAddFeature = (e: any) => {
        if (e.key === "Enter" && listInput.trim() !== "") {
            setFeatures([...features, listInput.trim()]);
            setListInput("");
        }
    };

    // Remove feature bullet
    const removeFeature = (index: number) => {
        setFeatures(features.filter((_: any, i: any) => i !== index));
    };

    const handleSave = () => {
        setLoading(true);
        const payload: ApplicationSubscriptionsEntity = {
            id: initialData?.id || "",
            name,
            description,
            bulletText: features,
            price: Number(price),
            active: true,
            currency: "eur",
            oneTimeUse: type === "one_time",
            isLifetime: type === "lifetime",
            numDays: type === "subscription" ? Number(days) : undefined,
            numUsages: type === "usage_limited" ? Number(usageLimit) : undefined,
            createdAt: new Date()
        };

        if (onSave) {
            onSave(payload).then(() => {
                setLoading(false);
                setSnackbar({ open: true, severity: "success", message: "Subscription saved successfully" });
            }).catch((error) => {
                console.error("Failed to save subscription:", error);
                setSnackbar({ open: true, severity: "error", message: "Subscription can not be saved" });
                setLoading(false);
            });
        } else {
            setLoading(false);
        } // return data to parent component
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
                {initialData ? "Edit Subscription" : "Create Subscription"}
            </Typography>

            <Grid container spacing={4}>
                {/* Live Preview */}
                <Grid item xs={12} md={5}>
                    <Typography sx={{ mb: 1 }} variant="subtitle1">
                        Live Preview
                    </Typography>
                    <SubscriptionCard {...subscriptionCardProps} />
                </Grid>

                {/* Form Fields */}
                <Grid item xs={12} md={7}>
                    <Typography sx={{ mb: 1 }} variant="subtitle1">
                        Edit Fields
                    </Typography>
                    <Card sx={{ p: 3 }}>
                        <TextField
                            fullWidth
                            label="Subscription Name"
                            sx={{ mb: 2 }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={2}
                            sx={{ mb: 2 }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        {/* Features Input */}
                        <TextField
                            disabled={restriction.bulletTextLength === undefined ? false : features.length >= restriction.bulletTextLength}
                            fullWidth
                            label="Add Feature (Enter to add)"
                            sx={{ mb: 1 }}
                            value={listInput}
                            onChange={(e) => setListInput(e.target.value)}
                            onKeyDown={handleAddFeature}
                        />

                        <List dense sx={{ mb: 2 }}>
                            {features.map((f: any, i: any) => (
                                <ListItem
                                    key={i}
                                    secondaryAction={
                                        <IconButton size="small" onClick={() => removeFeature(i)}>
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    }
                                >
                                    <Typography variant="body2">• {f}</Typography>
                                </ListItem>
                            ))}
                        </List>

                        <TextField
                            fullWidth
                            label={`Price between ${restriction.priceLow} and ${restriction.priceHigh}`}
                            type="number"
                            sx={{ mb: 2 }}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />

                        {/* Subscription Type */}
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Subscription Type</InputLabel>
                            <Select disabled={initialData !== null} value={type} label="Subscription Type" onChange={(e) => setType(e.target.value)}>
                                {restriction.creationTypes.map((type) => (
                                        <MenuItem key={type} value={type}>{getSubscriptionText(type)}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Conditional Inputs */}
                        {type === "subscription" && (
                            <TextField
                                fullWidth
                                disabled={initialData !== null}
                                label="Number of Days"
                                type="number"
                                sx={{ mb: 2 }}
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                            />
                        )}

                        {type === "usage_limited" && (
                            <TextField
                                fullWidth
                                disabled={initialData !== null}
                                label="Number of Usages"
                                type="number"
                                sx={{ mb: 2 }}
                                value={usageLimit}
                                onChange={(e) => setUsageLimit(e.target.value)}
                            />
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                            {onDelete &&
                                (<Button variant="outlined" color="error" onClick={onDelete}>
                                    Delete Subscription
                                </Button>)}
                            <Button variant="outlined" color="error" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button disabled={disabled} variant="contained" onClick={handleSave}>
                                {loading ? (<CircularProgress />) : ("Save Subscription")}
                            </Button>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
