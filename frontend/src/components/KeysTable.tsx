import {DashboardKeysEntity} from "@backend/DashboardKeysEntity";
import {
    Box,
    Card,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Pagination,
    Select,
    TextField,
    Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import React, {useEffect} from "react";
import {useStateDebounced} from "../hook/useStateDebounce";
import {AxiosResponse} from "axios";
import {PaginationModel} from "@backend/PaginationModel";

export default function KeysTable({title, sub, filter} : {title: string; sub: {id: string, name: string}[]; filter: (page: number | undefined, limit: number | undefined, sortDesc: boolean | undefined, title: string | undefined, searchStr: string | undefined) => Promise<AxiosResponse<PaginationModel<DashboardKeysEntity>, any, {}>>}) {

    const [searchTerm, debouncedValue, setSearchTerm] = useStateDebounced('', 400);
    const [filterSubscription, setFilterSubscription] = React.useState<string>('all');
    const [sortBy, setSortBy] = React.useState<string>('true');
    const [currentPage, setCurrentPage] = React.useState<number>(1);
    const [codes, setCodes] = React.useState<PaginationModel<DashboardKeysEntity>>({
        items: [],
        totalItems: 0,
        currentPage: 1,
        totalPages: 1,
        limit: 10
    });

    useEffect(() => {
        filter(currentPage, 10, sortBy === 'true', filterSubscription === 'All' ? undefined : filterSubscription, debouncedValue === '' ? undefined : debouncedValue)
            .then(response => setCodes(response.data))
            .catch(error => {
                console.error('Error fetching keys data:', error);
                setCodes({items: [],
                    totalItems: 0,
                    currentPage: 1,
                    totalPages: 1,
                    limit: 10})
            });
    }, [debouncedValue, filterSubscription, sortBy, currentPage]);



    return (<Grid item xs={12} md={6}>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
                size="small"
                variant="outlined"
                placeholder="Search code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="filter-sub-label">Filter by Subscription</InputLabel>
                <Select
                    labelId="filter-sub-label"
                    value={filterSubscription}
                    label="Filter by Subscription"
                    onChange={(e) => setFilterSubscription(e.target.value)}
                >
                    {sub.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                            {s.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                    labelId="sort-by-label"
                    variant={"outlined"}
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <MenuItem value="true">Latest Buy Time</MenuItem>
                    <MenuItem value="false">Oldest Buy Time</MenuItem>
                </Select>
            </FormControl>
        </Box>
        <Typography variant="h6">{title}</Typography>
        <Card>
            <List>
                {codes.items.length === 0 && (
                    <ListItem>
                        <ListItemText primary="No keys match your filter." />
                    </ListItem>
                )}

                {codes.items.map((item) => (
                    <ListItem
                        key={item.id}
                        // secondaryAction={
                        //     <IconButton color="primary" onClick={() => console.log('regen')}>
                        //         <RefreshIcon />
                        //     </IconButton>
                        // }
                    >
                        <ListItemText
                            primary={`${item.appKey}`}
                            secondary={
                                <>
                        <span>
                          Subscription:{" " + item.name}
                        </span>
                                    {item.lastUsedAt && (<br />)}
                                    {item.lastUsedAt && (<span>Used: {new Date(item.lastUsedAt).toLocaleString()}</span>)}
                                    <br />
                                    <span>Buy: {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}</span>
                                    {item.expiresAt && (<br />)}
                                    {item.expiresAt && (<span>Expires: {new Date(item.expiresAt).toLocaleString()}</span>)}
                                </>
                            }
                        />
                    </ListItem>
                ))}
            </List>

            {codes.totalPages > 1 && (<Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
                <Pagination
                    count={codes.totalPages}
                    page={currentPage}
                    onChange={(e, val) => setCurrentPage(val)}
                    color="primary"
                />
            </Box>)}
        </Card>
    </Grid>)

}