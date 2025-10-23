import React, {useContext} from 'react'
import {Card, CardContent, Container, Grid, Typography} from '@mui/material'
import {AxiosContext} from "../../api/axiosInstance";

export default function Dashboard() {
  const [user, setUser] = React.useState<{email: string, name: string} | null>(null);
  const { axios } = useContext(AxiosContext);

  React.useEffect(() => {
    console.log('Fetching user data...');
    axios.get('/api/user', { withCredentials: true })
      .then(response => setUser(response.data))
      .catch(error => console.error('Error fetching user data:', error));
  }, []);
  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant='h4' gutterBottom>Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6'>{ user !== null ? user.email : '' }</Typography>
              <Typography variant='h6'>{ user !== null ? user.name : '' }</Typography>
              <Typography variant='body2'>List of products will appear here.</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6'>Analytics</Typography>
              <Typography variant='body2'>Revenue and stats will appear here.</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
