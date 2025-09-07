import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Modal,
  Fade,
  Backdrop,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import { Delete as DeleteIcon, Payment as PaymentIcon } from "@mui/icons-material";
import api, { expenseAPI } from "./utils/api";
import PaymentComponent from "./components/PaymentComponent";

// Dark Theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4cafef",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

export default function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [welcome, setWelcome] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ amount: '', description: '', category: '' });
  const [expenseError, setExpenseError] = useState('');
  const [userId, setUserId] = useState(() => localStorage.getItem('user_id') || '');
  const [isPremiumUser, setIsPremiumUser] = useState(() => localStorage.getItem('ispremimumuser') === 'true');
  const [categories, setCategories] = useState([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  // Check if user is already logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('user_id');
    const storedUserName = localStorage.getItem('user_name');
    const storedIsPremium = localStorage.getItem('ispremimumuser');
    
    if (token && storedUserId && storedUserName) {
      setWelcome(storedUserName);
      setUserId(storedUserId);
      setIsPremiumUser(storedIsPremium === 'true');
    }
  }, []);

  // Fetch categories from backend
  useEffect(() => {
    if (welcome) {
      api.get("/categories")
        .then(res => setCategories(res.data))
        .catch(() => setCategories([]));
    }
  }, [welcome]);

  // Fetch expenses for user from backend
  useEffect(() => {
    if (welcome && userId) {
      api.get("/expenses")
        .then(res => setExpenses(res.data))
        .catch(() => setExpenses([]));
    }
  }, [welcome, userId]);

  // Add expense via backend
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setExpenseError("");
    if (!expenseForm.amount || !expenseForm.description || !expenseForm.category) {
      setExpenseError("All fields are required");
      return;
    }
    const selectedCategory = categories.find(cat => cat.name === expenseForm.category);
    if (!selectedCategory) {
      setExpenseError("Invalid category");
      return;
    }
          try {
        const res = await api.post("/expenses", {
          amount: expenseForm.amount,
          description: expenseForm.description,
          category_id: selectedCategory.id,
        });
      setExpenses([res.data, ...expenses]);
      setExpenseForm({ amount: '', description: '', category: '' });

      api.get("/expenses")
      .then(res => setExpenses(res.data))
      .catch(() => setExpenses([]));
    } catch (err) {
      setExpenseError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.deleteExpense(expenseId);
        // Remove the deleted expense from the local state
        setExpenses(expenses.filter(exp => exp.id !== expenseId));
      } catch (err) {
        alert('Error deleting expense: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // input handle
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // validation
  const validate = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = "Name is required";
    if (!formData.email) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Invalid email format";
    }
    if (!formData.phone) {
      tempErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      tempErrors.phone = "Phone must be 10 digits";
    }
    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // submit
  const handleSubmit = async (e) => {
    console.log("Signup attempt started...");
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      try {
        console.log("Sending signup request...");
        const res = await api.post("/signup", formData);
        console.log("Signup response:", res.data);
        
        if (res.data.message === "User signed up successfully") {
          alert("Signup successful: " + res.data.message);
          
          // Auto-login after signup
          setWelcome(res.data.user.name);
          setUserId(res.data.user.id);
          setIsPremiumUser(res.data.user.ispremimumuser === true);
          localStorage.setItem('user_id', res.data.user.id);
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user_name', res.data.user.name);
          localStorage.setItem('ispremimumuser', res.data.user.ispremimumuser);
          
          console.log("Signup successful, user data saved");
        } else {
          alert("Signup failed: " + res.data.message);
        }
      } catch (err) {
        console.error("Signup error:", err);
        alert("Error: " + (err.response?.data?.message || err.message || "Signup failed. Please try again."));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    
    try {
      const res = await api.post("/login", loginData);
      console.log("Login response:", res.data);
      
      if (res.data.message === 'Login successful') {
        // Save to localStorage first
        localStorage.setItem('user_id', res.data.user_id);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user_name', res.data.name);
        localStorage.setItem('ispremimumuser', res.data.ispremimumuser);
        
        // Set user data in state
        setWelcome(res.data.name);
        setUserId(res.data.user_id);
        setIsPremiumUser(res.data.ispremimumuser === true);
        
        // Close login modal and reset form
        setLoginOpen(false);
        setLoginData({ email: "", password: "" });
        
        // Show success message
        alert(`Login successful! Welcome ${res.data.name}`);
      } else {
        setLoginError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError(err.response?.data?.message || err.message || "Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleExpenseChange = (e) => {
    setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {/* Center Box */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        {welcome ? (
          <Box sx={{ width: '100%', maxWidth: 1200, p: 2 }}>
            <Card sx={{ 
              p: 3, 
              borderRadius: "16px", 
              background: "rgba(30,30,30,0.95)", 
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)", 
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(76, 175, 239, 0.2)"
            }}>
              <CardContent sx={{ p: 0 }}>
                {/* Header Section */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "#4cafef" }}>
                      Welcome, {welcome}!
                    </Typography>
                    {isPremiumUser && (
                      <Box
                        sx={{
                          position: 'relative',
                          background: 'linear-gradient(45deg, #FFD700, #FFA500, #FFD700)',
                          backgroundSize: '200% 200%',
                          animation: 'shimmer 2s ease-in-out infinite',
                          borderRadius: '20px',
                          px: 2,
                          py: 0.5,
                          boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                          border: '2px solid rgba(255, 215, 0, 0.6)',
                          '@keyframes shimmer': {
                            '0%': {
                              backgroundPosition: '0% 50%',
                            },
                            '50%': {
                              backgroundPosition: '100% 50%',
                            },
                            '100%': {
                              backgroundPosition: '0% 50%',
                            },
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 'bold',
                            color: '#000',
                            textShadow: '0 1px 2px rgba(255,255,255,0.5)',
                            fontSize: '0.75rem',
                            letterSpacing: '0.5px',
                          }}
                        >
                          ⭐ PREMIUM USER ⭐
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PaymentIcon />}
                      onClick={() => setPaymentOpen(true)}
                      sx={{
                        borderRadius: "8px",
                        color: "#4cafef",
                        borderColor: "#4cafef",
                        fontWeight: "bold",
                        "&:hover": {
                          borderColor: "#4cafef",
                          backgroundColor: "rgba(76, 175, 239, 0.1)"
                        }
                      }}
                    >
                      Payment
                    </Button>
                    {isPremiumUser && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={async () => {
                          try {
                            const res = await api.get('/expenses/leaderboard');
                            setLeaderboard(res.data || []);
                            setLeaderboardOpen(true);
                          } catch (err) {
                            alert('Failed to load leaderboard: ' + (err.response?.data?.message || err.message));
                          }
                        }}
                        sx={{
                          borderRadius: '8px',
                          color: '#FFD700',
                          borderColor: '#FFD700',
                          fontWeight: 'bold',
                          '&:hover': {
                            borderColor: '#FFC107',
                            backgroundColor: 'rgba(255, 215, 0, 0.1)'
                          }
                        }}
                      >
                        Leaderboard
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (userId) {
                          api.get("/expenses")
                            .then(res => setExpenses(res.data))
                            .catch(() => setExpenses([]));
                        }
                      }}
                      sx={{
                        borderRadius: "8px",
                        color: "#4cafef",
                        borderColor: "#4cafef",
                        fontWeight: "bold",
                        "&:hover": {
                          borderColor: "#4cafef",
                          backgroundColor: "rgba(76, 175, 239, 0.1)"
                        }
                      }}
                    >
                      Refresh
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setWelcome("");
                        setUserId("");
                        setIsPremiumUser(false);
                        setExpenses([]);
                        localStorage.removeItem('user_id');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user_name');
                        localStorage.removeItem('ispremimumuser');
                      }}
                      sx={{
                        borderRadius: "8px",
                        fontWeight: "bold",
                        color: "#ff6b6b",
                        borderColor: "#ff6b6b",
                        "&:hover": {
                          borderColor: "#ff5252",
                          backgroundColor: "rgba(255, 107, 107, 0.1)"
                        }
                      }}
                    >
                      Logout
                    </Button>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
              
                {/* Main Content Grid */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', lg: '1fr 1.2fr' }, 
                  gap: 4,
                  alignItems: 'start'
                }}>
                  {/* Expense Form (Left) */}
                  <Card sx={{ 
                    p: 3, 
                    background: "rgba(76, 175, 239, 0.05)", 
                    border: "1px solid rgba(76, 175, 239, 0.2)",
                    borderRadius: "12px"
                  }}>
                    <Typography variant="h5" sx={{ mb: 3, color: "#4cafef", fontWeight: "bold" }}>
                      Add Daily Expense
                    </Typography>
                    <form onSubmit={handleExpenseSubmit}>
                      <TextField
                        label="Amount *"
                        name="amount"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={expenseForm.amount}
                        onChange={handleExpenseChange}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '&:hover fieldset': {
                              borderColor: '#4cafef',
                            },
                          }
                        }}
                      />
                      <TextField
                        label="Description *"
                        name="description"
                        fullWidth
                        margin="normal"
                        value={expenseForm.description}
                        onChange={handleExpenseChange}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '&:hover fieldset': {
                              borderColor: '#4cafef',
                            },
                          }
                        }}
                      />
                      <FormControl fullWidth margin="normal" required>
                        <InputLabel>Category *</InputLabel>
                        <Select
                          name="category"
                          value={expenseForm.category}
                          label="Category *"
                          onChange={handleExpenseChange}
                          sx={{
                            borderRadius: '8px',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4cafef',
                            },
                          }}
                        >
                          {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {expenseError && (
                        <Typography color="error" align="center" sx={{ mt: 2, p: 1, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: '4px' }}>
                          {expenseError}
                        </Typography>
                      )}
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                          mt: 3,
                          borderRadius: "10px",
                          fontWeight: "bold",
                          py: 1.5,
                          fontSize: "1.1rem",
                          background: "linear-gradient(135deg, #4cafef, #1976d2)",
                          boxShadow: "0 4px 15px rgba(76, 175, 239, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #1976d2, #4cafef)",
                            boxShadow: "0 6px 20px rgba(76, 175, 239, 0.4)",
                          }
                        }}
                      >
                        ADD EXPENSE
                      </Button>
                    </form>
                  </Card>
                  {/* Expense List (Right) */}
                  <Card sx={{ 
                    p: 3, 
                    background: "rgba(76, 175, 239, 0.05)", 
                    border: "1px solid rgba(76, 175, 239, 0.2)",
                    borderRadius: "12px",
                    height: 'fit-content'
                  }}>
                    <Typography variant="h5" sx={{ mb: 3, color: "#4cafef", fontWeight: "bold" }}>
                      Your Expenses
                    </Typography>
                    
                    {/* Expense Summary */}
                    <Card sx={{ 
                      mb: 3, 
                      backgroundColor: 'rgba(76, 175, 239, 0.1)', 
                      border: '1px solid rgba(76, 175, 239, 0.3)',
                      borderRadius: '8px'
                    }}>
                      <CardContent sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body1" color="text.secondary" fontWeight="medium">
                            Total Expenses:
                          </Typography>
                          <Typography variant="h5" color="#4cafef" fontWeight="bold">
                            ₹{expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" color="text.secondary" fontWeight="medium">
                            Total Count:
                          </Typography>
                          <Typography variant="h6" color="text.primary" fontWeight="bold">
                            {expenses.length} expenses
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                    
                    {/* Expense List */}
                    <Box sx={{ 
                      maxHeight: 400, 
                      overflowY: 'auto',
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#4cafef',
                        borderRadius: '3px',
                      },
                    }}>
                      {expenses.length === 0 ? (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 4,
                          color: 'text.secondary'
                        }}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            No expenses yet
                          </Typography>
                          <Typography variant="body2">
                            Add your first expense to get started!
                          </Typography>
                        </Box>
                      ) : (
                        expenses.map((exp, index) => (
                          <Card key={exp.id} sx={{ 
                            mb: 2, 
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.08)',
                              border: '1px solid rgba(76, 175, 239, 0.3)',
                            }
                          }}>
                            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" color="#4cafef" fontWeight="bold" sx={{ mb: 0.5 }}>
                                    ₹{exp.amount} - {exp.Category?.name || 'Unknown Category'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {exp.description}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(exp.created_at).toLocaleDateString('en-IN')} at {new Date(exp.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                </Box>
                                <IconButton
                                  onClick={() => handleDeleteExpense(exp.id)}
                                  sx={{ 
                                    color: '#ff6b6b',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </Box>
                  </Card>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ) : (
          <Card
            sx={{
              width: 400,
              p: 3,
              borderRadius: "16px",
              background: "rgba(30,30,30,0.9)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                align="center"
                sx={{ mb: 2, fontWeight: "bold", color: "#4cafef" }}
              >
                Create Account
              </Typography>
              <form onSubmit={handleSubmit} noValidate>
                <TextField
                  label="Full Name"
                  name="name"
                  fullWidth
                  margin="normal"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                />
                <TextField
                  label="Email Address"
                  name="email"
                  fullWidth
                  margin="normal"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
                <TextField
                  label="Phone Number"
                  name="phone"
                  fullWidth
                  margin="normal"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 3,
                    borderRadius: "10px",
                    fontWeight: "bold",
                    py: 1.2,
                    background: "linear-gradient(135deg, #4cafef, #1976d2)",
                  }}
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    mt: 2,
                    borderRadius: "10px",
                    fontWeight: "bold",
                    py: 1.2,
                    color: "#4cafef",
                    borderColor: "#4cafef"
                  }}
                  onClick={() => setLoginOpen(true)}
                >
                  Login
                </Button>
                <Typography
                  variant="body2"
                  align="center"
                  sx={{ mt: 2, color: "gray" }}
                >
                  Already have an account?{" "}
                  <span style={{ color: "#4cafef", cursor: "pointer" }} onClick={() => setLoginOpen(true)}>
                    Login
                  </span>
                </Typography>
              </form>
            </CardContent>
          </Card>
        )}
        {/* Login Modal */}
        <Modal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={loginOpen}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 350,
                bgcolor: "background.paper",
                border: "2px solid #4cafef",
                boxShadow: 24,
                p: 4,
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" align="center" sx={{ mb: 2, color: "#4cafef" }}>
                Login
              </Typography>
              <form onSubmit={handleLogin}>
                <TextField
                  label="Email Address"
                  name="email"
                  fullWidth
                  margin="normal"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
                {loginError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {loginError}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loginLoading}
                  sx={{
                    mt: 2,
                    borderRadius: "10px",
                    fontWeight: "bold",
                    py: 1.2,
                    background: "linear-gradient(135deg, #4cafef, #1976d2)",
                  }}
                >
                  {loginLoading ? "Logging In..." : "Login"}
                </Button>
              </form>
            </Box>
          </Fade>
        </Modal>

        {/* Leaderboard Modal */}
        <Modal
          open={leaderboardOpen}
          onClose={() => setLeaderboardOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={leaderboardOpen}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 600 },
                maxHeight: '80vh',
                overflowY: 'auto',
                bgcolor: 'background.paper',
                border: '2px solid #FFD700',
                boxShadow: 24,
                p: 3,
                borderRadius: 3,
              }}
            >
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#FFD700' }}>
                Premium Leaderboard
              </Typography>
              {leaderboard.length === 0 ? (
                <Typography color="text.secondary">No data available.</Typography>
              ) : (
                <List>
                  {leaderboard.map((u, idx) => (
                    <ListItem key={u.id} divider>
                      <ListItemText
                        primary={`${idx + 1}. ${u.name} (${u.email})`}
                        secondary={`Total Expense: ₹${parseFloat(u.totalexpene || 0).toFixed(2)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Fade>
        </Modal>

        {/* Payment Modal */}
        <Modal
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={paymentOpen}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: '90%', sm: 600 },
                maxHeight: '90vh',
                overflowY: 'auto',
                bgcolor: "background.paper",
                border: "2px solid #4cafef",
                boxShadow: 24,
                p: 0,
                borderRadius: 3,
              }}
            >
              <PaymentComponent />
            </Box>
          </Fade>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}
