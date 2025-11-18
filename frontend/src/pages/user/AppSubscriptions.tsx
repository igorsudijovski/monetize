import React from 'react'
import {Container, Grid, Typography} from '@mui/material'
import {ApplicationSubscriptionsEntity} from "@backend/ApplicationSubscriptionsEntity";
import SubscriptionCard from "../../components/SubscriptionCard";
import {mapToSubscriptionCardApp} from "../../model/GeneralSubscriptions";


export default function AppSubscriptions({app, subs}: {app: {id: string, name: string} | null, subs: ApplicationSubscriptionsEntity[]}) {
    return app && (<Container sx={{ mt: 6, mb: 6 }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
                    {app.name}
                </Typography>

                <Grid
                    container
                    spacing={2}
                    alignItems="stretch" // 🔥 Ensures equal height rows
                >
                    {subs.map((sub) => (
                        <Grid key={"grid" + sub.id} item xs={6} md={4} display="flex">
                            <SubscriptionCard {...mapToSubscriptionCardApp(sub)} />
                        </Grid>
                    ))}
                </Grid>
            </Container>)
    ;
}
