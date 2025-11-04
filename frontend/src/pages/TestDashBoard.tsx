import React from "react";
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
    ListItemText
} from "@mui/material";

// Example data (replace with API calls)
const subscriptions = [
    { id: 1, name: "Basic", price: 10, sold: 120 },
    { id: 2, name: "Pro", price: 30, sold: 85 },
    { id: 3, name: "Premium", price: 50, sold: 45 }
];

const tokensLeft = 350;

const usedCodes = ["ABC123", "XYZ789", "TOK567"];
const unusedCodes = ["FREE001", "GIFT002", "BONUS003", "WIN004"];

export default function TestDashBoard() {
    const calculateRevenue = (price: number, sold: number) => price * sold;

    const totalRevenue = subscriptions.reduce(
        (sum, s) => sum + calculateRevenue(s.price, s.sold),
        0
    );

    return (
        <Box sx={{ p: 4 }}>
            {/* Header */}
            <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
                Subscription Dashboard
            </Typography>

            {/* Stats Summary */}
            <Grid container spacing={3}>

                {subscriptions.map((sub) => (
                    <Grid item xs={12} md={4} key={sub.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{sub.name}</Typography>
                                <Typography variant="body1">
                                    Sold: <strong>{sub.sold}</strong>
                                </Typography>
                                <Typography variant="body1">
                                    Revenue: <strong>${calculateRevenue(sub.price, sub.sold)}</strong>
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                {/* Total Revenue */}
                <Grid item xs={12}>
                    <Card sx={{ bgcolor: "primary.main", color: "#fff" }}>
                        <CardContent>
                            <Typography variant="h6">Total Revenue</Typography>
                            <Typography variant="h5" fontWeight="bold">
                                ${totalRevenue}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tokens Section */}
            <Box sx={{ mt: 4 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Tokens Left:</Typography>
                        <Chip
                            label={tokensLeft}
                            color="secondary"
                            sx={{ mt: 1, fontSize: "16px", height: "32px" }}
                        />
                    </CardContent>
                </Card>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Subscription Cards */}
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Subscription Plans (User View)
            </Typography>
            <Grid container spacing={3}>
                {subscriptions.map((sub) => (
                    <Grid item xs={12} sm={6} md={4} key={sub.id}>
                        <Card>
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography variant="h6">{sub.name}</Typography>
                                <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
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

            <Divider sx={{ my: 4 }} />

            {/* Codes Section */}
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Used Codes
                    </Typography>
                    <Card>
                        <List>
                            {usedCodes.map((code, idx) => (
                                <ListItem key={idx}>
                                    <ListItemText primary={code} />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Unused Codes
                    </Typography>
                    <Card>
                        <List>
                            {unusedCodes.map((code, idx) => (
                                <ListItem key={idx}>
                                    <ListItemText primary={code} />
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
