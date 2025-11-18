import React from 'react'
import {AppBar, Box, Button, Link, Toolbar, Typography} from '@mui/material'
import {Link as RouterLink} from 'react-router-dom'
import {UserEntity} from "@backend/UserEntity";

export default function NavbarUser({user}: {user: UserEntity | null}) {
  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography variant='h6' component={RouterLink} to='/user' sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
          Apps
        </Typography>
        <Box>
          {user && user.applicationSubscriptionIds && user.applicationSubscriptionIds.map(app => (
                <Button key={app.id} color='inherit' component={RouterLink} to={`/user/${app.id}`}>App {app.name}</Button>
              )
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
