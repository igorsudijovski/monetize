import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography variant='h6' component={RouterLink} to='/' sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
          Licensing Marketplace
        </Typography>
        <Box>
          <Button color='inherit' component={RouterLink} to='/'>Home</Button>
          <Button color='inherit' component={RouterLink} to='/dashboard'>Dashboard</Button>
          <Button color='inherit' component={RouterLink} to='/login'>Login</Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
