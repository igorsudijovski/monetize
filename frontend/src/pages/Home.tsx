import React, {useContext, useState} from 'react'
import {Container, Grid} from '@mui/material'
import SubscriptionCard from "../components/SubscriptionCard";
import {AxiosContext} from "../api/axiosInstance";

export default function Home() {
    const { axios } = useContext(AxiosContext);
    const [sub, setSub] = useState([]);

    React.useEffect(() => {
        console.log('Fetching user data...');
        axios.get('/general/subscriptions')
            .then(response => setSub(response.data))
            .catch(error => console.error('Error fetching user data:', error));
    }, []);

    const subCard = (sub:any[]) => {
        return sub.map((s: any) => (
            <Grid key={"grid" + s.id} item xs={6} md={4}>
                <SubscriptionCard key={s.id} id={s.id} title={s.name} price={s.price} items={s.bulletText} />
            </Grid>
        ));
    }
  return (
    <Container sx={{p: 5}}>
        <Grid container spacing={2}>
            {subCard(sub)}
        </Grid>

    </Container>
  )
}
