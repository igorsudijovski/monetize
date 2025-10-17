import React from 'react'
import { Container, Typography, Card, CardContent, Grid } from '@mui/material'

export default function Dashboard() {
  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant='h4' gutterBottom>Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6'>Your Products</Typography>
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
