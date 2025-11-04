import React, { useState } from "react";
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
    Divider,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

export default function CreateEdit({ initialData, onSave, onCancel }: {initialData: any, onSave: any, onCancel: any}) {
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [price, setPrice] = useState(initialData?.price || "");
    const [listInput, setListInput] = useState("");
    const [features, setFeatures] = useState(initialData?.features || []);
    const [type, setType] = useState(initialData?.type || "one_time");
    const [days, setDays] = useState(initialData?.days || "");
    const [usageLimit, setUsageLimit] = useState(initialData?.usageLimit || "");

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
        const payload = {
            name,
            description,
            price: Number(price),
            type,
            days: type === "subscription" ? Number(days) : null,
            usageLimit:
                type === "usage_limited" ? Number(usageLimit) : null,
            features,
        };

        onSave && onSave(payload); // return data to parent component
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
                    <Card sx={{ p: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                {name || "Subscription Name"}
                            </Typography>

                            <Typography sx={{ mt: 1 }}>
                                {description || "Subscription description will be displayed here…"}
                            </Typography>

                            <List dense>
                                {features.length > 0 ? (
                                    features.map((f: any, i: any) => (
                                        <ListItem key={i} sx={{ py: 0.2 }}>
                                            • {f}
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem sx={{ py: 0.2, opacity: 0.6 }}>
                                        • Add subscription features…
                                    </ListItem>
                                )}
                            </List>

                            <Typography sx={{ mt: 1 }}>
                                Price: <strong>${price || "0"}</strong>
                            </Typography>

                            <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                                Type:
                                {type === "one_time" && " One-Time Purchase"}
                                {type === "subscription" && ` Subscription (${days || 0} days)`}
                                {type === "usage_limited" && ` Limited (${usageLimit || 0} uses)`}
                                {type === "lifetime" && " Lifetime Access"}
                            </Typography>
                        </CardContent>
                    </Card>
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
                            label="Price ($)"
                            type="number"
                            sx={{ mb: 2 }}
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />

                        {/* Subscription Type */}
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Subscription Type</InputLabel>
                            <Select value={type} label="Subscription Type" onChange={(e) => setType(e.target.value)}>
                                <MenuItem value="one_time">One-Time Purchase</MenuItem>
                                <MenuItem value="subscription">Subscription (days)</MenuItem>
                                <MenuItem value="usage_limited">Number of Usages</MenuItem>
                                <MenuItem value="lifetime">Lifetime Access</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Conditional Inputs */}
                        {type === "subscription" && (
                            <TextField
                                fullWidth
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
                                label="Number of Usages"
                                type="number"
                                sx={{ mb: 2 }}
                                value={usageLimit}
                                onChange={(e) => setUsageLimit(e.target.value)}
                            />
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                            <Button variant="outlined" color="error" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={handleSave}>
                                Save Subscription
                            </Button>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
