import * as React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import EuroIcon from '@mui/icons-material/Euro';
import {Button, Link, Chip, IconButton} from "@mui/material";
import {useContext} from "react";
import {AuthContext} from "../context/authContext";
import {SubscriptionCardProps} from "../model/SubscriptionCardProps";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {AxiosContext} from "../api/axiosInstance";


export default function SubscriptionCard({
                                             id,
                                             title,
                                             description,
                                             price,
                                             active,
                                             applicationId,
                                             appUrlName,
                                             items = [],
                                             type = "one_time",
                                             days,
                                             usageLimit,
                                             showAdminActions = false,
                                             adminSide = false,
                                             subsType,
                                             onBuy,
                                             onEdit,
                                             onActivate,
                                             onDeactivate,
                                             noButtons = false,
                                             isFirst,
                                             isLast,
                                             move,
                                         }: SubscriptionCardProps) {
    const {isLoggedIn} = useContext(AuthContext);
    const { axios } = useContext(AxiosContext);

    const printItems = (items: string[]) => (
        <ul style={{margin: 0, paddingLeft: 20}}>
            {items.map((i, index) => (
                <li key={id + index}>{i}</li>
            ))}
        </ul>
    );

    const shouldShowComponent = (): boolean => {
        if (showAdminActions === true) {
            return true;
        }
        return active;
    }

    const getTypeLabel = () => {
        switch (type) {
            case "subscription":
                return `Subscription (${days ?? 0} days)`;
            case "usage_limited":
                return `Usage-Limited (${usageLimit ?? 0} uses)`;
            case "lifetime":
                return "Lifetime Access";
            default:
                return "One-Time Purchase";
        }
    };

    const getApplicationSubsButtons = () => {
        if (subsType == 'application') {
            if (adminSide) {
                return (<Button color="primary" variant="contained" onClick={onBuy}>
                    {type !== 'subscription' ? 'Buy' : 'Subscribe'}
                </Button>);
            }

            if (type !== 'subscription') {
                return (
                    <Button color="primary" variant="contained" onClick={handleBuy}>
                        Buy
                    </Button>);
            }
            if (isLoggedIn) {
                return (<Link
                    href={`/login-redirect?subId=${id}&refresh=true&type=endUser&appId=${applicationId}`}>
                    <Button color="primary" variant="contained">
                        Subscribe
                    </Button>
                </Link>);
            }
            return (<Link
                href={`http://localhost:4000/auth/google?appId=${id}&type=endUser&subId=${applicationId}`}>
                <Button color="primary" variant="contained">
                    Login & Subscribe
                </Button>
            </Link>)
        }
        return null;
    }

    const handleBuy = async () => {
        try {
            const response = await axios.get(`/user/app/${applicationId}/buy/${id}`, {
                withCredentials: isLoggedIn,
                maxRedirects: 2
            });
            if (response.data.url) {
                window.open(response.data.url, '_self');
                return;
            }
        } catch (error) {
            console.error('Error creating subscription payment:', error);
        }
    }

    const getGeneralSubsButtons = () => {
        if (subsType == 'general') {
            if (adminSide) {
                return null;
            }
            if (isLoggedIn) {
                return (<Link
                    href={`/login-redirect?appId=${id}&refresh=true&type=client`}>
                    <Button color="primary" variant="contained">
                        Subscribe
                    </Button>
                </Link>);
            }
            return (<Link
                href={`http://localhost:4000/auth/google?appId=${id}&type=client`}>
                <Button color="primary" variant="contained">
                    Login & Subscribe
                </Button>
            </Link>)
        }
        return null;
    }

    return shouldShowComponent() && (
        <Card
            variant="outlined"
            sx={{
                backgroundColor: active ? "background.paper" : "grey.400",
                width: 1,
                borderRadius: 3,
                boxShadow: 2,
                ":hover": {boxShadow: 4},
                transition: "all 0.2s ease-in-out",
                height: showAdminActions ? 1 : 'auto'
            }}
        >
            {showAdminActions &&
                (<Box sx={{mt: 1, display: "flex", justifyContent: "center", gap: 1, pb: 2, width: 1}}>
                    <IconButton size="medium" sx={{width: 0.5, "&:hover": {backgroundColor: "transparent"}}}
                                disabled={isFirst == true} onClick={() => move && move("left")}>
                        {isFirst !== true && (<ArrowBackIosNewIcon fontSize="medium"/>)}
                    </IconButton>

                    <IconButton size="medium" sx={{width: 0.5, "&:hover": {backgroundColor: "transparent"}}}
                                disabled={isLast == true} onClick={() => move && move("right")}>
                        {isLast !== true && (<ArrowForwardIosIcon fontSize="medium"/>)}
                    </IconButton>
                </Box>)}
            <Box sx={{p: 2}}>
                <Stack
                    direction="row"
                    sx={{justifyContent: "space-between", alignItems: "center"}}
                >
                    <Typography gutterBottom variant="h5" component="div">
                        {title || "Untitled Plan"}
                    </Typography>
                    <Stack direction="row" alignItems="center">
                        <Typography textAlign="right" variant="h6" component="div">
                            {price || "0"}
                        </Typography>
                        <Typography
                            fontSize={15}
                            gutterBottom
                            sx={{mt: 1, pl: 0.3}}
                            textAlign="left"
                            variant="h6"
                            component="div"
                        >
                            <EuroIcon fontSize="inherit"/>
                        </Typography>
                    </Stack>
                </Stack>

                <Chip
                    label={getTypeLabel()}
                    color={active ? 'info' : 'default'}
                    size="small"
                    sx={{mb: 1}}
                />

                {(showAdminActions == true || description !== undefined) &&
                    (<Typography variant="body2" sx={{color: "text.secondary", minHeight: 48}}>
                        {description || "Your subscription description will appear here."}
                    </Typography>)}
            </Box>

            <Divider/>

            {items.length > 0 && (
                <Box>
                    <Box sx={{p: 1}}>
                        <Typography component="span" variant="body2">
                            {printItems(items)}
                        </Typography>
                    </Box>
                    <Divider/>
                </Box>
            )}

            {(noButtons === undefined || !noButtons) &&
                (<Box sx={{p: 2}}>
                    {showAdminActions && (
                        <Stack direction="row" spacing={1}>
                            <Button variant="text" size="small" color="warning" onClick={onEdit}>
                                Edit
                            </Button>
                            {active && (<Button variant="text" size="small" color="error" onClick={onDeactivate}>
                                Deactivate
                            </Button>)}
                            {!active && (<Button variant="text" size="small" color="error" onClick={onActivate}>
                                Activate
                            </Button>)}
                        </Stack>
                    )}
                    {!showAdminActions && (<Stack direction="row-reverse" spacing={1}>
                        {getApplicationSubsButtons()}
                        {getGeneralSubsButtons()}
                    </Stack>)}
                </Box>)}
        </Card>
    );
}
