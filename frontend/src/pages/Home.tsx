import React, {useContext, useState} from 'react'
import {Container, Grid, Typography} from '@mui/material'
import SubscriptionCard from "../components/SubscriptionCard";
import {AxiosContext} from "../api/axiosInstance";
import {GeneralSubscriptionsEntity} from "@backend/GeneralSubscriptionsEntity";
import {mapToSubscriptionCard} from "../model/GeneralSubscriptions";
import Navbar from "../components/Navbar";


export default function Home({showTopBar = true}: { showTopBar?: boolean }) {
    const { axios } = useContext(AxiosContext);
    const [subscriptions, setSub] = useState<GeneralSubscriptionsEntity[]>([]);

    React.useEffect(() => {
        console.log('Fetching user data...');
        axios.get('/general/subscriptions')
            .then(response => setSub(response.data))
            .catch(error => console.error('Error fetching user data:', error));
    }, []);

    return (
        <>
            <Navbar />
        <Container sx={{ mt: 6, mb: 6 }}>
            {showTopBar && (<Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
                Available Subscriptions
            </Typography>)}

            <Grid
                container
                spacing={2}
                alignItems="stretch" // 🔥 Ensures equal height rows
            >
                {subscriptions.map((sub) => (
                    <Grid key={"grid" + sub.id} item xs={6} md={4} display="flex">
                        <SubscriptionCard {...mapToSubscriptionCard(sub)} />
                    </Grid>
                ))}
            </Grid>
        </Container>
        </>
    );
}
