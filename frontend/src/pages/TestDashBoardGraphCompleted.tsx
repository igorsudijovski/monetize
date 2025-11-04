// SubscriptionDashboard.jsx
import React, { useMemo, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Grid,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

// Recharts
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

/**
 * Full dashboard component with charts, codes management (search/filter/sort/pagination),
 * regenerate confirmation modal, and withdraw modal.
 *
 * Replace example data and local handlers with API calls where TODO is marked.
 */

const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a28fd0"];

const generateCodeString = () =>
    Math.random().toString(36).substring(2, 9).toUpperCase();

// Example initial data (replace with server data)
const initialSubscriptions = [
    { id: 1, name: "Basic", price: 10, sold: 120 },
    { id: 2, name: "Pro", price: 30, sold: 85 },
    { id: 3, name: "Premium", price: 50, sold: 45 },
];

// Note: include id fields for codes. buyTime and usedTime are ISO strings.
const initialUsedCodes = [
    {
        id: "u1",
        code: "ABC123",
        subscriptionId: 1,
        buyTime: "2025-01-12T12:00:00Z",
        usedTime: "2025-01-12T15:30:00Z",
        regeneratedTimes: 0,
    },
    {
        id: "u2",
        code: "XYZ789",
        subscriptionId: 2,
        buyTime: "2025-02-10T09:30:00Z",
        usedTime: "2025-02-10T11:00:00Z",
        regeneratedTimes: 1,
    },
    {
        id: "u3",
        code: "TOK567",
        subscriptionId: 3,
        buyTime: "2025-03-05T14:20:00Z",
        usedTime: "2025-03-06T08:45:00Z",
        regeneratedTimes: 0,
    },
];

const initialUnusedCodes = [
    {
        id: "n1",
        code: "FREE001",
        subscriptionId: 1,
        buyTime: "2025-01-01T10:00:00Z",
        regeneratedTimes: 0,
    },
    {
        id: "n2",
        code: "GIFT002",
        subscriptionId: 2,
        buyTime: "2025-01-15T12:12:00Z",
        regeneratedTimes: 1,
    },
    {
        id: "n3",
        code: "BONUS003",
        subscriptionId: 3,
        buyTime: "2025-02-20T09:45:00Z",
        regeneratedTimes: 0,
    },
    {
        id: "n4",
        code: "WIN004",
        subscriptionId: 1,
        buyTime: "2025-03-01T16:00:00Z",
        regeneratedTimes: 2,
    },
    {
        id: "n5",
        code: "SPARE005",
        subscriptionId: 2,
        buyTime: "2025-04-01T08:00:00Z",
        regeneratedTimes: 0,
    },
    {
        id: "n6",
        code: "PROMO06",
        subscriptionId: 3,
        buyTime: "2025-04-15T10:30:00Z",
        regeneratedTimes: 0,
    },
];

export default function TestDashBoardGraphCompleted() {
    // App states
    const [subscriptions] = useState(initialSubscriptions);
    const [usedCodes, setUsedCodes] = useState(initialUsedCodes);
    const [unusedCodes, setUnusedCodes] = useState(initialUnusedCodes);

    // tokens & withdraw modal
    const [tokensLeft, setTokensLeft] = useState(350);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, severity: "success", message: "" });

    // codes controls
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSubscription, setFilterSubscription] = useState("all");
    const [sortBy, setSortBy] = useState("latest"); // "latest" or "oldest"
    const itemsPerPage = 5;
    const [usedPage, setUsedPage] = useState(1);
    const [unusedPage, setUnusedPage] = useState(1);

    // confirm regenerate modal
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedCodeObj, setSelectedCodeObj] = useState(null); // { codeObj, category: 'used'|'unused' }

    // charts data
    const salesData = useMemo(
        () => subscriptions.map((s) => ({ name: s.name, sold: s.sold })),
        [subscriptions]
    );
    const revenueData = useMemo(
        () => subscriptions.map((s) => ({ name: s.name, revenue: s.sold * s.price })),
        [subscriptions]
    );

    const totalRevenue = revenueData.reduce((sum, r) => sum + r.revenue, 0);

    // ---------- Filtering / searching / sorting logic ----------
    const searchFilter = (c: any) =>
        !searchTerm || c.code.toLowerCase().includes(searchTerm.toLowerCase());

    const subscriptionFilterFn = (c: any) =>
        filterSubscription === "all" || c.subscriptionId === Number(filterSubscription);

    const sortFn = (a: any, b: any) => {
        const aTime = new Date(a.buyTime).getTime();
        const bTime = new Date(b.buyTime).getTime();
        return sortBy === "latest" ? bTime - aTime : aTime - bTime;
    };

    const filteredUsed = useMemo(() => {
        return [...usedCodes].filter(searchFilter).filter(subscriptionFilterFn).sort(sortFn);
    }, [usedCodes, searchTerm, filterSubscription, sortBy]);

    const filteredUnused = useMemo(() => {
        return [...unusedCodes].filter(searchFilter).filter(subscriptionFilterFn).sort(sortFn);
    }, [unusedCodes, searchTerm, filterSubscription, sortBy]);

    const usedPageCount = Math.max(1, Math.ceil(filteredUsed.length / itemsPerPage));
    const unusedPageCount = Math.max(1, Math.ceil(filteredUnused.length / itemsPerPage));

    const paginatedUsedCodes = filteredUsed.slice(
        (usedPage - 1) * itemsPerPage,
        usedPage * itemsPerPage
    );
    const paginatedUnusedCodes = filteredUnused.slice(
        (unusedPage - 1) * itemsPerPage,
        unusedPage * itemsPerPage
    );

    // Reset pages if filters change (so page doesn't point to out-of-range)
    React.useEffect(() => setUsedPage(1), [searchTerm, filterSubscription, sortBy, usedCodes.length]);
    React.useEffect(() => setUnusedPage(1), [searchTerm, filterSubscription, sortBy, unusedCodes.length]);

    // ---------- Regeneration handlers ----------
    const applyRegeneration = () => {
        if (!selectedCodeObj) {
            setConfirmOpen(false);
            return;
        }

        const { codeObj, category } = selectedCodeObj;
        const newCodeString = generateCodeString();

        if (category === "used") {
            setUsedCodes((prev) =>
                prev.map((c) =>
                    c.id === codeObj.id
                        ? { ...c, code: newCodeString, regeneratedTimes: (c.regeneratedTimes || 0) + 1 }
                        : c
                )
            );
        } else {
            setUnusedCodes((prev) =>
                prev.map((c) =>
                    c.id === codeObj.id
                        ? { ...c, code: newCodeString, regeneratedTimes: (c.regeneratedTimes || 0) + 1 }
                        : c
                )
            );
        }

        // TODO: call API to persist regeneration (e.g. POST /codes/:id/regenerate)
        setConfirmOpen(false);
        setSnackbar({ open: true, severity: "success", message: `Code regenerated: ${newCodeString}` });
    };

    const confirmRegenerate = (codeObj, category) => {
        setSelectedCodeObj({ codeObj, category });
        setConfirmOpen(true);
    };

    // ---------- Withdraw handlers ----------
    const handleStartWithdraw = () => setWithdrawOpen(true);

    const handleConfirmWithdraw = () => {
        const amount = Number(withdrawAmount);
        if (!amount || amount <= 0) {
            setSnackbar({ open: true, severity: "error", message: "Enter a valid withdraw amount" });
            return;
        }
        if (amount > tokensLeft) {
            setSnackbar({ open: true, severity: "error", message: "Insufficient tokens" });
            return;
        }

        // Simulate withdraw process:
        // TODO: call withdraw API here and only update on success
        setTokensLeft((prev) => prev - amount);
        setWithdrawOpen(false);
        setWithdrawAmount("");
        setSnackbar({ open: true, severity: "success", message: `Withdraw started for ${amount} tokens` });
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
                Subscription Dashboard
            </Typography>

            {/* Top summary + charts */}
            <Grid container spacing={3}>
                {/* subscription summary cards */}
                {subscriptions.map((sub) => (
                    <Grid item xs={12} md={4} key={sub.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{sub.name}</Typography>
                                <Typography>Sold: {sub.sold}</Typography>
                                <Typography>Revenue: ${sub.price * sub.sold}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* tokens + withdraw */}
            <Box sx={{ mt: 3 }}>
                <Card sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h6">Tokens Left:</Typography>
                        <Chip label={tokensLeft} color="secondary" />
                    </Stack>

                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<AccountBalanceWalletIcon />}
                            onClick={handleStartWithdraw}
                        >
                            Start Withdraw Process
                        </Button>
                    </Stack>
                </Card>
            </Box>

            {/* charts */}
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Analytics Overview
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Sales Count per Subscription
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <BarChart width={420} height={300} data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sold" />
                            </BarChart>
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Revenue Distribution
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <PieChart width={420} height={300}>
                                <Pie
                                    data={revenueData}
                                    dataKey="revenue"
                                    nameKey="name"
                                    outerRadius={120}
                                    label
                                >
                                    {revenueData.map((entry, idx) => (
                                        <Cell key={entry.name} fill={colors[idx % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </Box>
                        <Box sx={{ px: 2, pb: 1 }}>
                            <Typography variant="subtitle2">Total Revenue: ${totalRevenue}</Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Codes controls */}
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Codes Overview
            </Typography>

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
                        <MenuItem value="all">All</MenuItem>
                        {subscriptions.map((s) => (
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
                        value={sortBy}
                        label="Sort By"
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <MenuItem value="latest">Latest Buy Time</MenuItem>
                        <MenuItem value="oldest">Oldest Buy Time</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Codes lists: used & unused */}
            <Grid container spacing={4}>
                {/* Used Codes */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Used Codes</Typography>
                    <Card>
                        <List>
                            {paginatedUsedCodes.length === 0 && (
                                <ListItem>
                                    <ListItemText primary="No used codes match your filters." />
                                </ListItem>
                            )}

                            {paginatedUsedCodes.map((item) => (
                                <ListItem
                                    key={item.id}
                                    secondaryAction={
                                        <IconButton color="primary" onClick={() => confirmRegenerate(item, "used")}>
                                            <RefreshIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={`${item.code}`}
                                        secondary={
                                            <>
                        <span>
                          Subscription:{" "}
                            {subscriptions.find((s) => s.id === item.subscriptionId)?.name}
                        </span>
                                                <br />
                                                <span>Used: {item.usedTime ? new Date(item.usedTime).toLocaleString() : "—"}</span>
                                                <br />
                                                <span>Buy: {item.buyTime ? new Date(item.buyTime).toLocaleString() : "—"}</span>
                                                <br />
                                                <span>Regens: {item.regeneratedTimes || 0}</span>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>

                        <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
                            <Pagination
                                count={usedPageCount}
                                page={usedPage}
                                onChange={(e, val) => setUsedPage(val)}
                                color="primary"
                            />
                        </Box>
                    </Card>
                </Grid>

                {/* Unused Codes */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Unused Codes</Typography>
                    <Card>
                        <List>
                            {paginatedUnusedCodes.length === 0 && (
                                <ListItem>
                                    <ListItemText primary="No unused codes match your filters." />
                                </ListItem>
                            )}

                            {paginatedUnusedCodes.map((item) => (
                                <ListItem
                                    key={item.id}
                                    secondaryAction={
                                        <IconButton color="primary" onClick={() => confirmRegenerate(item, "unused")}>
                                            <RefreshIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={item.code}
                                        secondary={
                                            <>
                        <span>
                          Subscription:{" "}
                            {subscriptions.find((s) => s.id === item.subscriptionId)?.name}
                        </span>
                                                <br />
                                                <span>Buy: {item.buyTime ? new Date(item.buyTime).toLocaleString() : "—"}</span>
                                                <br />
                                                <span>Regens: {item.regeneratedTimes || 0}</span>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>

                        <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
                            <Pagination
                                count={unusedPageCount}
                                page={unusedPage}
                                onChange={(e, val) => setUnusedPage(val)}
                                color="primary"
                            />
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Confirm Regenerate Dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Confirm Code Regeneration</DialogTitle>
                <DialogContent>
                    Are you sure you want to regenerate the code{" "}
                    <strong>{selectedCodeObj?.codeObj?.code}</strong> for subscription{" "}
                    <strong>
                        {selectedCodeObj
                            ? subscriptions.find((s) => s.id === selectedCodeObj.codeObj.subscriptionId)?.name
                            : ""}
                    </strong>
                    ?
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        This will replace the existing code and increment its regeneration counter.
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            applyRegeneration();
                        }}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Withdraw Dialog */}
            <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)}>
                <DialogTitle>Start Withdraw Process</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        Enter the number of tokens to withdraw (available: {tokensLeft}).
                    </Typography>
                    <TextField
                        label="Amount"
                        type="number"
                        fullWidth
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        inputProps={{ min: 0 }}
                        sx={{ mt: 1 }}
                    />
                    <TextField
                        label="Withdrawal destination (wallet / account)"
                        fullWidth
                        sx={{ mt: 2 }}
                        placeholder="e.g. wallet address or account ID"
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setWithdrawOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleConfirmWithdraw}>
                        Start Withdraw
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbars */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
