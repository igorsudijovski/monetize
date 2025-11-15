import React, {useContext, useEffect, useState} from 'react'
import {AppBar, Box, Button, Link, Toolbar, Typography} from '@mui/material'
import {Link as RouterLink} from 'react-router-dom'
import {AuthContext} from "../context/authContext";
import {UserEntity} from "@backend/UserEntity";
import {AxiosContext} from "../api/axiosInstance";

export default function Navbar() {
  const { isLoggedIn } = useContext(AuthContext);
  const { axios } = useContext(AxiosContext);
  const [user, setUser] = useState<UserEntity | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      axios.get('/api/user', {withCredentials: true})
          .then(response => setUser(response.data))
          .catch(error => console.error('Error fetching user data:', error));
    }
  }, [isLoggedIn]);

  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography variant='h6' component={RouterLink} to={isLoggedIn ? '/auth/dashboard' : '/'} sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
          Licensing Marketplace
        </Typography>
        <Box>
          {!isLoggedIn ? <Button color='inherit' component={RouterLink} to='/'>Home</Button> : ''}
          {isLoggedIn ? <Button color='inherit' component={RouterLink} to='/auth/dashboard'>Dashboard</Button> : ''}
          {isLoggedIn && user && user.applicationId ? <Button color='inherit' component={RouterLink} to='/auth/subscription'>My Subscription</Button> : ''}
          {!isLoggedIn  ? <Button color='inherit'><Link color='inherit' sx={{textDecoration: 'none'}} href="http://localhost:4000/auth/google">Login</Link></Button> : ''}
          {isLoggedIn ? <Button color='inherit' component={RouterLink} to='/auth/logout'>Logout</Button> : ''}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
