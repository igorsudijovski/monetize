import React from 'react'
import { Container, Typography, TextField, Button, Box } from '@mui/material'

export default function Login() {
  return (
    <Container sx={{ mt: 6, maxWidth: 'xs' }}>
      <Typography variant='h4' gutterBottom>Sign in</Typography>
      <Box component='form' sx={{ display: 'grid', gap: 2 }}>
        <TextField label='Email' type='email' fullWidth />
        <TextField label='Password' type='password' fullWidth />
        <Button variant='contained'>Sign in</Button>
      </Box>
    </Container>
  )
}
