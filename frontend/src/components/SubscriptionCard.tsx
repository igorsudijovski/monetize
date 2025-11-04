import * as React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import EuroIcon from '@mui/icons-material/Euro';
import { Button, Link, Chip } from "@mui/material";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import {SubscriptionCardProps} from "../model/SubscriptionCardProps";



export default function SubscriptionCard({
                                             id,
                                             title,
                                             description,
                                             price,
                                             items = [],
                                             type = "one_time",
                                             days,
                                             usageLimit,
                                             showAdminActions = false,
                                             onEdit,
                                             onDelete
                                         }: SubscriptionCardProps) {
    const { isLoggedIn } = useContext(AuthContext);

    const printItems = (items: string[]) => (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
            {items.map((i, index) => (
                <li key={id + index}>{i}</li>
            ))}
        </ul>
    );

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

    return (
        <Card
            variant="outlined"
            sx={{
                width: 1,
                borderRadius: 3,
                boxShadow: 2,
                ":hover": { boxShadow: 4 },
                transition: "all 0.2s ease-in-out"
            }}
        >
            <Box sx={{ p: 2 }}>
                <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between", alignItems: "center" }}
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
                            sx={{ mt: 1, pl: 0.3 }}
                            textAlign="left"
                            variant="h6"
                            component="div"
                        >
                            <EuroIcon fontSize="inherit" />
                        </Typography>
                    </Stack>
                </Stack>

                <Chip
                    label={getTypeLabel()}
                    color="info"
                    size="small"
                    sx={{ mb: 1 }}
                />

                {(showAdminActions == true || description !== undefined) &&
                    (<Typography variant="body2" sx={{ color: "text.secondary", minHeight: 48 }}>
                    {description || "Your subscription description will appear here."}
                </Typography>)}
            </Box>

            <Divider />

            {items.length > 0 && (
                <Box>
                    <Box sx={{ p: 1 }}>
                        <Typography component="span" variant="body2">
                            {printItems(items)}
                        </Typography>
                    </Box>
                    <Divider />
                </Box>
            )}

            <Box sx={{ p: 2 }}>
                {showAdminActions && (
                    <Stack direction="row" spacing={1}>
                        <Button variant="text" size="small" color="warning" onClick={onEdit}>
                            Edit
                        </Button>
                        <Button variant="text" size="small" color="error" onClick={onDelete}>
                            Delete
                        </Button>
                    </Stack>
                )}
                {!showAdminActions && (<Stack direction="row-reverse" spacing={1}>
                    {isLoggedIn ? (
                        <Link href={`/login-redirect?appId=${id}`}>
                            <Button color="primary" variant="contained">
                                {price === 0 ? 'Subscribe' : 'Buy'}
                            </Button>
                        </Link>
                    ) : (
                        <Link href={`http://localhost:4000/auth/google?appId=${id}`}>
                            <Button color="primary" variant="contained">
                                {price === 0 ? 'Login' : 'Login & Buy'}
                            </Button>
                        </Link>
                    )}
                </Stack>)}
            </Box>
        </Card>
    );
}
