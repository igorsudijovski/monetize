import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Menu,
    MenuItem,
    IconButton,
    Box
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import {Link as RouterLink} from "react-router";

interface AppKey {
    id: string;
    name: string;
}

interface NavbarUserKeysProps {
    apps: AppKey[];
    currentUrlName?: string;
    hasDashboard: boolean;
}

export default function NavbarUser({ apps, currentUrlName, hasDashboard }: NavbarUserKeysProps) {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const maxVisibleApps = 5;
    const visibleApps = apps.slice(0, maxVisibleApps);
    const dropdownApps = apps.slice(maxVisibleApps);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleAppClick = (urlName: string) => {
        navigate(`/user/auth/${urlName}`);
        handleMenuClose();
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 3 }}>
                    My Keys
                </Typography>

                <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, overflow: 'hidden' }}>
                    {visibleApps.map((app) => (
                        <Button
                            key={app.id}
                            color="inherit"
                            onClick={() => handleAppClick(app.id)}
                            variant={currentUrlName === app.id ? 'outlined' : 'text'}
                            sx={{
                                whiteSpace: 'nowrap',
                                borderColor: currentUrlName === app.id ? 'white' : 'transparent'
                            }}
                        >
                            {app.name}
                        </Button>
                    ))}

                    {dropdownApps.length > 0 && (
                        <>
                            <IconButton
                                color="inherit"
                                onClick={handleMenuOpen}
                                sx={{ ml: 1 }}
                            >
                                <MoreVertIcon />
                                <Typography variant="caption" sx={{ ml: 0.5 }}>
                                    +{dropdownApps.length}
                                </Typography>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                {dropdownApps.map((app) => (
                                    <MenuItem
                                        key={app.id}
                                        onClick={() => handleAppClick(app.id)}
                                        selected={currentUrlName === app.id}
                                    >
                                        {app.name}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </>
                    )}
                </Box>

                {hasDashboard && (
                    <Button color="inherit" onClick={() => navigate('/auth/dashboard')}>
                        Dashboard
                    </Button>
                )}
                <Button color='inherit' component={RouterLink} to='/auth/logout'>Logout</Button>
            </Toolbar>
        </AppBar>
    );
}

