import React from 'react'
import {AppBar, Box, Button, Toolbar, Typography} from '@mui/material'
import {Link as RouterLink} from 'react-router-dom'
import {UserEntity} from "@backend/UserEntity";

export default function NavbarAdmin({user} : {user: UserEntity | null}) {

    return (
        <AppBar position='static'>
            <Toolbar>
                <Typography variant='h6' component={RouterLink} to='/auth/dashboard'
                            sx={{color: 'inherit', textDecoration: 'none', flexGrow: 1}}>
                    Licensing Marketplace
                </Typography>
                <Box>
                    <Button color='inherit' component={RouterLink} to='/auth/dashboard'>Dashboard</Button>
                    {user && user.applicationId &&
                        (<Button color='inherit' component={RouterLink} to='/auth/subscription'>My
                            Subscription</Button>)}
                    <Button color='inherit' component={RouterLink} to='/auth/logout'>Logout</Button>
                </Box>
            </Toolbar>
        </AppBar>
    )
}
