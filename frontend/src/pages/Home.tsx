import React from 'react'
import { Container, Typography, Button, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function Home() {
  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant='h3' gutterBottom>
        Welcome to the Marketplace
      </Typography>
      <Typography variant='body1' sx={{ mb: 3 }}>
        This is a starter project built with React, Vite, TypeScript, and Material UI.
      </Typography>
      <Stack direction='row' spacing={2}>
        <Button variant='contained' component={RouterLink} to='/auth/dashboard'>Dashboard</Button>
        <Button variant='outlined' component={RouterLink} to='/login'>Login</Button>
      </Stack>
    </Container>
  )
}
