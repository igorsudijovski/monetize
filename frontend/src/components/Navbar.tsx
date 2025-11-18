import React from 'react'
import {AppBar, Box, Button, Link, Toolbar, Typography} from '@mui/material'
import {Link as RouterLink} from 'react-router-dom'

export default function Navbar() {

  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography variant='h6' component={RouterLink} to='/' sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
          Licensing Marketplace
        </Typography>
        <Box>
          <Button color='inherit' component={RouterLink} to='/'>Home</Button>
          <Button color='inherit'><Link color='inherit' sx={{textDecoration: 'none'}} href="http://localhost:4000/auth/google">Login</Link></Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
