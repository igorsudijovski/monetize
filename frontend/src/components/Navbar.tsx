import React, {useContext} from 'react'
import {AppBar, Box, Button, Toolbar, Typography} from '@mui/material'
import {Link as RouterLink} from 'react-router-dom'
import {AuthContext} from "../context/authContext";

export default function Navbar() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography variant='h6' component={RouterLink} to='/' sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
          Licensing Marketplace
        </Typography>
        <Box>
          {isLoggedIn ? <Button color='inherit' component={RouterLink} to='/'>Home</Button> : ''}
          {isLoggedIn ? <Button color='inherit' component={RouterLink} to='/auth/dashboard'>Dashboard</Button> : ''}
          {!isLoggedIn  ? <Button color='inherit' component={RouterLink} to='/login'>Login</Button> : ''}
          {isLoggedIn ? <Button color='inherit' component={RouterLink} to='/auth/logout'>Logout</Button> : ''}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
