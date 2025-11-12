import {RevenuePerApp} from "@backend/RevenuePerApp";
import React, {useMemo} from "react";
import {Box, Card, Grid, Typography} from "@mui/material";
import {Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis} from "recharts";

export default function SoldBarChart({revenues}:{revenues: RevenuePerApp[]}) {

    const data = useMemo(
        () => revenues.map((r) => ({ name: r.name, sold: r.totalNumber })),
        [revenues]
    );

    return (<Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
                Sales Count per Subscription
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
                <BarChart width={420} height={300} data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sold" />
                </BarChart>
            </Box>
        </Card>
    </Grid>)


}