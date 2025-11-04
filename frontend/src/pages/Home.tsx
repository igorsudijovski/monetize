import React, {useContext, useState} from 'react'
import {Container, Grid, Typography} from '@mui/material'
import SubscriptionCard from "../components/SubscriptionCard";
import {AxiosContext} from "../api/axiosInstance";
import {GeneralSubscriptions, mapToSubscriptionCard} from "../model/GeneralSubscriptions";


export default function Home() {
    const { axios } = useContext(AxiosContext);
    const [subscriptions, setSub] = useState<GeneralSubscriptions[]>([]);

    React.useEffect(() => {
        console.log('Fetching user data...');
        axios.get('/general/subscriptions')
            .then(response => setSub(response.data))
            .catch(error => console.error('Error fetching user data:', error));
    }, []);

    return (
        <Container sx={{ mt: 6, mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
                Available Subscriptions
            </Typography>

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
    );
}
