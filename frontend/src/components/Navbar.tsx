import React, {useContext, useEffect} from 'react'
import {AppBar, Box, Button, Link, Toolbar, Typography} from '@mui/material'
import {Link as RouterLink} from 'react-router-dom'
import {AuthContext} from "../context/authContext";
import {AxiosContext} from "../api/axiosInstance";
import {UserEntity} from "@backend/UserEntity";

export default function Navbar() {

    const {isLoggedIn} = useContext(AuthContext);
    const {axios} = useContext(AxiosContext);
    const [user, setUser] = React.useState<UserEntity | null>(null);
    const [urlName, setUrlName] = React.useState<string | null>(null);

    useEffect(() => {
        if (isLoggedIn) {
            console.log('fetching user data');
            axios.get('/api/user', {withCredentials: true})
                .then(response => {
                    setUser(response.data);
                    if (response.data.applicationSubscriptionIds && response.data.applicationSubscriptionIds.length > 0) {
                        setUrlName(response.data.applicationSubscriptionIds[0].id);
                    }
                })
                .catch(error => console.error('Error fetching user data:', error));
        }
        // You can add additional side effects here if needed when isLoggedIn changes
    }, [isLoggedIn]);

  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography variant='h6' component={RouterLink} to='/' sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}>
          Licensing Marketplace
        </Typography>
        <Box>
          <Button color='inherit' component={RouterLink} to='/'>Home</Button>
            {isLoggedIn && user && user.applicationId && (<Button color='inherit' component={RouterLink} to='/auth/dashboard'>Dashboard</Button>)}
            {isLoggedIn && urlName !== null && (
                <Button color='inherit' component={RouterLink} to={`/user/auth/${urlName}`}>Tokens</Button>
            )}
        {!isLoggedIn && (<Button color='inherit'><Link color='inherit' sx={{textDecoration: 'none'}} href="http://localhost:4000/auth/google">Login</Link></Button>)}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
