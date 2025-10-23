import React, {useContext, useEffect} from 'react'
import {Container, Typography, TextField, Button, Box, Link} from '@mui/material'
import {AuthContext} from "../context/authContext";
import {useNavigate} from "react-router-dom";

export default function Login() {

    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/');
        }
        // You can add additional side effects here if needed when isLoggedIn changes
    }, [isLoggedIn]);

  return (
    <Container sx={{ mt: 6, maxWidth: 'xs' }}>
      <Typography variant='h4' gutterBottom>Sign in</Typography>
      <Box component='form' sx={{ display: 'grid', gap: 2 }}>
        <TextField label='Email' type='email' fullWidth />
        <TextField label='Password' type='password' fullWidth />
        <Button variant='contained'>Sign in</Button>
      </Box>
      <Box sx={{ display: 'grid', gap: 2 }}>
          <Button><Link href="http://localhost:4000/auth/google">Sign in with google</Link></Button>
      </Box>

    </Container>
  )
}
