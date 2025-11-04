import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Grid,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Stack
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";

// Charts Imports
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

// Example Data (Replace with API)
const initialSubscriptions = [
    { id: 1, name: "Basic", price: 10, sold: 120 },
    { id: 2, name: "Pro", price: 30, sold: 85 },
    { id: 3, name: "Premium", price: 50, sold: 45 }
];

const initialUsedCodes = [
    { code: "ABC123", subscriptionId: 1 },
    { code: "XYZ789", subscriptionId: 2 },
    { code: "TOK567", subscriptionId: 3 }
];

const initialUnusedCodes = [
    { code: "FREE001", subscriptionId: 1, regeneratedTimes: 0 },
    { code: "GIFT002", subscriptionId: 2, regeneratedTimes: 1 },
    { code: "BONUS003", subscriptionId: 3, regeneratedTimes: 0 },
    { code: "WIN004", subscriptionId: 1, regeneratedTimes: 2 }
];

const colors = ["#8884d8", "#82ca9d", "#ffc658"];

export default function SubscriptionDashboard() {
    const [subscriptions] = useState(initialSubscriptions);
    const [usedCodes] = useState(initialUsedCodes);
    const [unusedCodes, setUnusedCodes] = useState(initialUnusedCodes);

    const tokensLeft = 350;

    const generateNewCode = () =>
        Math.random().toString(36).substring(2, 8).toUpperCase();

    const handleRegenerate = (index: number) => {
        const updated = [...unusedCodes];
        updated[index].code = generateNewCode();
        updated[index].regeneratedTimes++;
        setUnusedCodes(updated);

        // TODO: make API call here
    };

    const salesData = subscriptions.map(s => ({ name: s.name, sold: s.sold }));
    const revenueData = subscriptions.map(s => ({
        name: s.name,
        revenue: s.sold * s.price
    }));

    const totalRevenue = revenueData.reduce((sum, r) => sum + r.revenue, 0);

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
                Subscription Dashboard
            </Typography>

            {/* Summary Stats */}
            <Grid container spacing={3}>
                {subscriptions.map((sub) => (
                    <Grid item xs={12} md={4} key={sub.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{sub.name}</Typography>
                                <Typography>Sold: {sub.sold}</Typography>
                                <Typography>Revenue: ${sub.price * sub.sold}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Balance + Withdraw */}
            <Box sx={{ mt: 3 }}>
                <Card sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6">Tokens Left: {tokensLeft}</Typography>
                    <Button variant="contained" color="secondary">
                        Start Withdraw Process
                    </Button>
                </Card>
            </Box>

            {/* Analytics */}
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Analytics Overview
            </Typography>

            <Grid container spacing={4}>
                {/* Sales Chart */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6">Sales Count per Subscription</Typography>
                        <BarChart width={400} height={300} data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="sold" />
                        </BarChart>
                    </Card>
                </Grid>

                {/* Revenue Chart */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6">Revenue Distribution</Typography>
                        <PieChart width={400} height={300}>
                            <Pie
                                data={revenueData}
                                dataKey="revenue"
                                nameKey="name"
                                outerRadius={120}
                                label
                            >
                                {revenueData.map((entry, idx) => (
                                    <Cell key={idx} fill={colors[idx % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </Card>
                </Grid>
            </Grid>

            {/* Codes */}
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Codes Overview
            </Typography>

            <Grid container spacing={4}>
                {/* Used Codes */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Used Codes</Typography>
                    <Card>
                        <List>
                            {usedCodes.map((item, i) => (
                                <ListItem key={i}>
                                    <ListItemText
                                        primary={item.code}
                                        secondary={`Subscription: ${
                                            subscriptions.find(s => s.id === item.subscriptionId)?.name
                                        }`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </Grid>

                {/* Unused Codes with regenerate button */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Unused Codes</Typography>
                    <Card>
                        <List>
                            {unusedCodes.map((item, i) => (
                                <ListItem
                                    key={i}
                                    secondaryAction={
                                        <IconButton color="primary" onClick={() => handleRegenerate(i)}>
                                            <RefreshIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={item.code}
                                        secondary={
                                            <Stack direction="row" spacing={1}>
                        <span>
                          Subscription: {subscriptions.find(s => s.id === item.subscriptionId)?.name}
                        </span>
                                                <Chip
                                                    size="small"
                                                    label={`Regens: ${item.regeneratedTimes}`}
                                                    color="info"
                                                />
                                            </Stack>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </Grid>
            </Grid>

            {/* Subscription Cards */}
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                Subscription Plans (User View)
            </Typography>

            <Grid container spacing={3}>
                {subscriptions.map(sub => (
                    <Grid item xs={12} sm={6} md={4} key={sub.id}>
                        <Card>
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography variant="h6">{sub.name}</Typography>
                                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                                    ${sub.price}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: "center" }}>
                                <Button variant="contained">Buy</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

        </Box>
    );
}
