import * as React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import EuroIcon from '@mui/icons-material/Euro';
import {Button, Link} from "@mui/material";
import {useContext} from "react";
import {AuthContext} from "../context/authContext";

export default function SubscriptionCard({id, title, price, items}: {
    id: string,
    title: string,
    price: string,
    items?: string[]
}) {

    const {isLoggedIn} = useContext(AuthContext);


    const printItems = (items: string[]) => {
        const liItems = items.map((i, index) => (<li key={id + index}>{i}</li>))
        return (<ul>{liItems}</ul>)
    }


    return (
        <Card variant="outlined" sx={{maxWidth: 360}}>
            <Box sx={{p: 2}}>
                <Stack
                    direction="row"
                    sx={{justifyContent: 'space-between', alignItems: 'center'}}
                >
                    <Typography gutterBottom variant="h5" component="div">
                        {title}
                    </Typography>
                    <Stack direction={"row"}>
                        <Typography textAlign={"right"} variant="h6" component="div">
                            {price}
                        </Typography>
                        <Typography fontSize={15} gutterBottom sx={{mt: 1, pl: 0.3}} textAlign={"left"} variant="h6"
                                    component="div">
                            <EuroIcon fontSize={"inherit"}/>
                        </Typography>
                    </Stack>
                </Stack>
                <Typography variant="body2" sx={{color: 'text.secondary'}}>
                    Pinstriped cornflower blue cotton blouse takes you on a walk to the park or
                    just down the hall.
                </Typography>
            </Box>
            <Divider/>
            {items && (
                <Box>
                    <Box sx={{p: 0.5}}>
                        <Typography component={'span'} variant="body2">
                            {printItems(items)}
                        </Typography>
                    </Box>
                    <Divider/>
                </Box>
            )}
            <Box sx={{p: 2}}>
                <Stack direction="row-reverse" spacing={1}>
                    {isLoggedIn ?
                        (<Link href={'/login-redirect?appId=' + id}>
                            <Button color={"primary"} variant={"contained"}>
                                Buy
                            </Button>
                        </Link>) :
                        (<Link href={'http://localhost:4000/auth/google?appId=' + id}>
                            <Button color={"primary"} variant={"contained"}>
                                Login & Buy
                            </Button>
                        </Link>)
                    }
                </Stack>
            </Box>
        </Card>
    );
}