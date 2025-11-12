import {RevenuePerApp} from "@backend/RevenuePerApp";
import React, {useMemo} from "react";
import {Box, Card, Grid, Typography} from "@mui/material";
import {Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis} from "recharts";
import EuroIcon from "@mui/icons-material/Euro";

const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a28fd0"];

export default function RevenuePie({revenues}:{revenues: RevenuePerApp[]}) {

    const data = useMemo(
        () => revenues.map((r) => ({ name: r.name, revenue: r.revenue })),
        [revenues]
    );

    const totalRevenue = useMemo(
        () => revenues.reduce((acc, rev) => acc + rev.revenue, 0),
        [revenues]
    )

    return (<Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
                Revenue Distribution
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
                <PieChart width={420} height={300}>
                    <Pie
                        data={data}
                        dataKey="revenue"
                        nameKey="name"
                        outerRadius={120}
                        label
                    >
                        {data.map((entry, idx) => (
                            <Cell key={entry.name} fill={colors[idx % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </Box>
            <Box sx={{ px: 2, pb: 1 }}>
                <Typography variant="subtitle2">Total Revenue: {totalRevenue} <EuroIcon fontSize="inherit" /></Typography>
            </Box>
        </Card>
    </Grid>)


}