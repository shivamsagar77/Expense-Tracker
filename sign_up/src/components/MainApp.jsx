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
  Snackbar,
  Tabs,
  Tab,
  Chip,
  Grid,
  Paper,
  LinearProgress,
} from "@mui/material";
import { 
  Delete as DeleteIcon, 
  Payment as PaymentIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarTodayIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import api, { expenseAPI } from "../utils/api";
import PaymentComponent from "./PaymentComponent";

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
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({ email: ""});
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // New state for enhanced dashboard
  const [activeTab, setActiveTab] = useState(0);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'daily', 'weekly', 'monthly'
  const [incomes, setIncomes] = useState([]);
  const [incomeForm, setIncomeForm] = useState({ amount: '', description: '', source: '' });
  const [incomeError, setIncomeError] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  
  // Pagination state
  const [currentExpensePage, setCurrentExpensePage] = useState(1);
  const [currentIncomePage, setCurrentIncomePage] = useState(1);
  const [screenSize, setScreenSize] = useState('medium');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dynamic items per page based on screen size
  const getItemsPerPage = (size) => {
    switch (size) {
      case 'small': return 5;   // Mobile phones
      case 'medium': return 10; // Tablets
      case 'large': return 20;  // Desktop
      case 'xlarge': return 40; // Large desktop
      default: return 10;
    }
  };

  // Screen size detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setScreenSize('small');
      } else if (width < 900) {
        setScreenSize('medium');
      } else if (width < 1200) {
        setScreenSize('large');
      } else {
        setScreenSize('xlarge');
      }
    };

    // Initial detection
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update items per page when screen size changes
  useEffect(() => {
    const newItemsPerPage = getItemsPerPage(screenSize);
    setItemsPerPage(newItemsPerPage);
    
    // Reset to first page when items per page changes
    setCurrentExpensePage(1);
    setCurrentIncomePage(1);
  }, [screenSize]);

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

  // Extract income data from expenses (premium users only)
  useEffect(() => {
    if (welcome && isPremiumUser) {
      const incomeData = expenses
        .filter(exp => exp.income_amount && exp.income_amount > 0)
        .map(exp => ({
          id: exp.id,
          amount: exp.income_amount,
          description: exp.income_description || 'Income',
          source: exp.income_source || 'Unknown',
          created_at: exp.created_at
        }));
      setIncomes(incomeData);
    } else {
      setIncomes([]);
    }
  }, [welcome, isPremiumUser, expenses]);

  // Filter data based on time filter
  useEffect(() => {
    const now = new Date();
    let filteredExp = expenses;
    let filteredInc = incomes;

    switch (timeFilter) {
      case 'daily':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filteredExp = expenses.filter(exp => new Date(exp.created_at) >= today);
        filteredInc = incomes.filter(inc => new Date(inc.created_at) >= today);
        break;
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredExp = expenses.filter(exp => new Date(exp.created_at) >= weekAgo);
        filteredInc = incomes.filter(inc => new Date(inc.created_at) >= weekAgo);
        break;
      case 'monthly':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredExp = expenses.filter(exp => new Date(exp.created_at) >= monthAgo);
        filteredInc = incomes.filter(inc => new Date(inc.created_at) >= monthAgo);
        break;
      default:
        // 'all' - no filtering
        break;
    }

    setFilteredExpenses(filteredExp);
    setFilteredIncomes(filteredInc);
  }, [expenses, incomes, timeFilter]);

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
    try {
      await expenseAPI.deleteExpense(expenseId);
      setExpenses(expenses.filter(exp => exp.id !== expenseId));
      setSnackbar({ open: true, message: 'Expense deleted successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || err.message, severity: 'error' });
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
          setSnackbar({ open: true, message: "Signup successful!", severity: 'success' });
          
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
          setSnackbar({ open: true, message: res.data.message, severity: 'error' });
        }
      } catch (err) {
        console.error("Signup error:", err);
        setSnackbar({ open: true, message: err.response?.data?.message || err.message || "Signup failed. Please try again.", severity: 'error' });
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
        localStorage.setItem('user_id', res.data.user_id);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user_name', res.data.name);
        localStorage.setItem('ispremimumuser', res.data.ispremimumuser);
        
        setWelcome(res.data.name);
        setUserId(res.data.user_id);
        setIsPremiumUser(res.data.ispremimumuser === true);
        
        setLoginOpen(false);
        setLoginData({ email: "", password: "" });
        setSnackbar({ open: true, message: `Login successful! Welcome ${res.data.name}`, severity: 'success' });
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

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({ ...forgotPasswordData, [e.target.name]: e.target.value });
  };

  const validateForgotPassword = () => {
    let tempError = "";
    if (!forgotPasswordData.email) {
      tempError = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(forgotPasswordData.email)) {
      tempError = "Invalid email format";
    } 
    setForgotPasswordError(tempError);
    return !tempError;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordLoading(true);

    if (validateForgotPassword()) {
      try {
        console.log("Sending forgot password request...");
        const res = await api.post("/forgotpassword", forgotPasswordData);
        console.log("Forgot password response:", res.data);
        setSnackbar({ open: true, message: res.data.message || "Password reset successful!", severity: 'success' });
        setForgotPasswordOpen(false);
        setForgotPasswordData({ email: "" });
      } catch (err) {
        console.error("Forgot password error:", err);
        setForgotPasswordError(err.response?.data?.message || err.message || "Password reset failed. Please try again.");
      } finally {
        setForgotPasswordLoading(false);
      }
    } else {
      setForgotPasswordLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Time filter tabs handler
  const handleTabChange = (_e, newValue) => {
    setActiveTab(newValue);
    const mapping = ['all', 'daily', 'weekly', 'monthly'];
    setTimeFilter(mapping[newValue] || 'all');
  };

  // Income management functions
  const handleIncomeChange = (e) => {
    setIncomeForm({ ...incomeForm, [e.target.name]: e.target.value });
  };

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    setIncomeError("");
    if (!incomeForm.amount || !incomeForm.description) {
      setIncomeError("Amount and description are required");
      return;
    }
    
    if (!isPremiumUser) {
      setIncomeError("Income tracking is only available for premium users");
      return;
    }
    
    try {
      // Create income entry - only send income data
      const res = await api.post("/expenses", {
        income_amount: parseFloat(incomeForm.amount),
        income_description: incomeForm.description,
        income_source: incomeForm.source || "Unknown"
      });
      
      setExpenses([res.data, ...expenses]);
      setIncomeForm({ amount: '', description: '', source: '' });
      setSnackbar({ open: true, message: 'Income added successfully!', severity: 'success' });
      
      // Refresh expenses to get updated data
      api.get("/expenses")
        .then(res => setExpenses(res.data))
        .catch(() => setExpenses([]));
    } catch (err) {
      setIncomeError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteIncome = async (incomeId) => {
    try {
      await expenseAPI.deleteExpense(incomeId);
      setExpenses(expenses.filter(exp => exp.id !== incomeId));
      setSnackbar({ open: true, message: 'Income deleted successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || err.message, severity: 'error' });
    }
  };

  // Download functionality
  const handleDownload = () => {
    if (!isPremiumUser) {
      setSnackbar({ open: true, message: 'Download feature is only available for premium users', severity: 'warning' });
      return;
    }

    const data = {
      expenses: filteredExpenses.map(exp => ({
        amount: exp.amount,
        description: exp.description,
        category: exp.Category?.name || 'Unknown',
        date: new Date(exp.created_at).toLocaleDateString('en-IN'),
        time: new Date(exp.created_at).toLocaleTimeString('en-IN')
      })),
      incomes: filteredIncomes.map(inc => ({
        amount: inc.amount,
        description: inc.description,
        source: inc.source,
        date: new Date(inc.created_at).toLocaleDateString('en-IN'),
        time: new Date(inc.created_at).toLocaleTimeString('en-IN')
      })),
      summary: {
        totalExpenses: filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
        totalIncomes: filteredIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount), 0),
        netAmount: filteredIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount), 0) - 
                  filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
        period: timeFilter === 'all' ? 'All Time' : 
                timeFilter === 'daily' ? 'Today' :
                timeFilter === 'weekly' ? 'Last 7 Days' : 'Last 30 Days'
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-${timeFilter}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: 'Data downloaded successfully!', severity: 'success' });
  };

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const totalIncomes = filteredIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
  const netAmount = totalIncomes - totalExpenses;

  // Pagination logic
  const totalExpensePages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const totalIncomePages = Math.ceil(filteredIncomes.length / itemsPerPage);
  
  const startExpenseIndex = (currentExpensePage - 1) * itemsPerPage;
  const endExpenseIndex = startExpenseIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startExpenseIndex, endExpenseIndex);
  
  const startIncomeIndex = (currentIncomePage - 1) * itemsPerPage;
  const endIncomeIndex = startIncomeIndex + itemsPerPage;
  const paginatedIncomes = filteredIncomes.slice(startIncomeIndex, endIncomeIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentExpensePage(1);
    setCurrentIncomePage(1);
  }, [timeFilter]);

  // Pagination handlers
  const handleExpensePageChange = (page) => {
    setCurrentExpensePage(page);
  };

  const handleIncomePageChange = (page) => {
    setCurrentIncomePage(page);
  };

  // Pagination Component
  const PaginationComponent = ({ currentPage, totalPages, onPageChange, type, itemsPerPage }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 1, 
        mt: 2,
        flexWrap: 'wrap'
      }}>
        <Button
          size="small"
          variant="outlined"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          sx={{
            borderRadius: '8px',
            color: '#4cafef',
            borderColor: '#4cafef',
            '&:disabled': {
              color: 'rgba(255,255,255,0.3)',
              borderColor: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          Previous
        </Button>
        
        {getPageNumbers().map((page, index) => (
          <Button
            key={index}
            size="small"
            variant={page === currentPage ? "contained" : "outlined"}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            sx={{
              minWidth: '32px',
              height: '32px',
              borderRadius: '8px',
              color: page === currentPage ? '#fff' : '#4cafef',
              borderColor: '#4cafef',
              backgroundColor: page === currentPage ? '#4cafef' : 'transparent',
              '&:disabled': {
                color: 'rgba(255,255,255,0.5)',
                borderColor: 'transparent',
                backgroundColor: 'transparent'
              }
            }}
          >
            {page}
          </Button>
        ))}
        
        <Button
          size="small"
          variant="outlined"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          sx={{
            borderRadius: '8px',
            color: '#4cafef',
            borderColor: '#4cafef',
            '&:disabled': {
              color: 'rgba(255,255,255,0.3)',
              borderColor: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          Next
        </Button>
        
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          Page {currentPage} of {totalPages} • {itemsPerPage} per page
        </Typography>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
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
                    <Chip 
                      label={`${screenSize.toUpperCase()} • ${itemsPerPage} per page`}
                      size="small"
                      sx={{
                        background: 'rgba(76, 175, 239, 0.1)',
                        color: '#4cafef',
                        border: '1px solid rgba(76, 175, 239, 0.3)',
                        fontWeight: 'bold',
                        fontSize: '0.7rem'
                      }}
                    />
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
                            setSnackbar({ open: true, message: 'Failed to load leaderboard: ' + (err.response?.data?.message || err.message), severity: 'error' });
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

                {/* Top Summary + Time Filters + Download */}
                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Tabs
                      value={activeTab}
                      onChange={handleTabChange}
                      textColor="primary"
                      indicatorColor="primary"
                      sx={{ minHeight: 32, '& .MuiTab-root': { minHeight: 32 } }}
                    >
                      <Tab icon={<FilterListIcon fontSize="small" />} iconPosition="start" label="All" />
                      <Tab icon={<CalendarTodayIcon fontSize="small" />} iconPosition="start" label="Daily" />
                      <Tab icon={<CalendarTodayIcon fontSize="small" />} iconPosition="start" label="Weekly" />
                      <Tab icon={<CalendarTodayIcon fontSize="small" />} iconPosition="start" label="Monthly" />
                    </Tabs>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={handleDownload}
                      disabled={!isPremiumUser}
                      sx={{
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        background: isPremiumUser ? 'linear-gradient(135deg, #4cafef, #1976d2)' : 'rgba(255,255,255,0.08)'
                      }}
                    >
                      Download
                    </Button>
                  </Box>

                  {/* Summary cards */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                    <Card sx={{ p: 2, background: 'rgba(76, 175, 239, 0.08)', border: '1px solid rgba(76,175,239,0.2)' }}>
                      <Typography variant="body2" color="text.secondary">Total Income</Typography>
                      <Typography variant="h5" color="#4cafef" fontWeight="bold">₹{totalIncomes.toFixed(2)}</Typography>
                    </Card>
                    <Card sx={{ p: 2, background: 'rgba(255, 99, 132, 0.08)', border: '1px solid rgba(255,99,132,0.2)' }}>
                      <Typography variant="body2" color="text.secondary">Total Expense</Typography>
                      <Typography variant="h5" color="#ff8a80" fontWeight="bold">₹{totalExpenses.toFixed(2)}</Typography>
                    </Card>
                    <Card sx={{ p: 2, background: 'rgba(76, 175, 80, 0.08)', border: '1px solid rgba(76,175,80,0.2)' }}>
                      <Typography variant="body2" color="text.secondary">Net</Typography>
                      <Typography variant="h5" color={netAmount >= 0 ? '#81c784' : '#ff8a80'} fontWeight="bold">₹{netAmount.toFixed(2)}</Typography>
                    </Card>
                  </Box>
                </Box>
              
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', lg: '1fr 1.2fr' }, 
                  gap: 4,
                  alignItems: 'start'
                }}>
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

                  {/* Expenses list */}
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
                            ₹{filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" color="text.secondary" fontWeight="medium">
                            Total Count:
                          </Typography>
                          <Typography variant="h6" color="text.primary" fontWeight="bold">
                            {filteredExpenses.length} expenses
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary" fontWeight="medium">
                            Showing:
                          </Typography>
                          <Typography variant="body2" color="text.primary" fontWeight="bold">
                            {paginatedExpenses.length} of {filteredExpenses.length} • {itemsPerPage} per page
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                    
                    <Box sx={{ 
                      maxHeight: screenSize === 'small' ? 300 : screenSize === 'medium' ? 400 : screenSize === 'large' ? 500 : 600, 
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
                      {paginatedExpenses.length === 0 ? (
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
                        paginatedExpenses.map((exp) => (
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
                    
                    {/* Pagination for Expenses */}
                    <PaginationComponent
                      currentPage={currentExpensePage}
                      totalPages={totalExpensePages}
                      onPageChange={handleExpensePageChange}
                      type="expenses"
                      itemsPerPage={itemsPerPage}
                    />
                  </Card>
                </Box>

                {/* Second row: Income - Premium Only */}
                {isPremiumUser && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.2fr' }, gap: 4, alignItems: 'start', mt: 4 }}>
                    <Card sx={{ 
                      p: 3, 
                      background: "rgba(76, 175, 239, 0.05)", 
                      border: "1px solid rgba(76, 175, 239, 0.2)",
                      borderRadius: "12px"
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <Typography variant="h5" sx={{ color: "#4cafef", fontWeight: "bold" }}>
                          Add Income
                        </Typography>
                        <Chip 
                          label="PREMIUM" 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }} 
                        />
                      </Box>
                    <form onSubmit={handleIncomeSubmit}>
                      <TextField
                        label="Amount *"
                        name="amount"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={incomeForm.amount}
                        onChange={handleIncomeChange}
                        required
                      />
                      <TextField
                        label="Description *"
                        name="description"
                        fullWidth
                        margin="normal"
                        value={incomeForm.description}
                        onChange={handleIncomeChange}
                        required
                      />
                      <TextField
                        label="Source (Optional)"
                        name="source"
                        fullWidth
                        margin="normal"
                        value={incomeForm.source}
                        onChange={handleIncomeChange}
                        placeholder="e.g., Salary, Freelance, Investment"
                      />
                      {incomeError && (
                        <Typography color="error" align="center" sx={{ mt: 2, p: 1, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: '4px' }}>
                          {incomeError}
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
                        }}
                      >
                        ADD INCOME
                      </Button>
                    </form>
                  </Card>

                    <Card sx={{ 
                      p: 3, 
                      background: "rgba(76, 175, 239, 0.05)", 
                      border: "1px solid rgba(76, 175, 239, 0.2)",
                      borderRadius: "12px",
                      height: 'fit-content'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <Typography variant="h5" sx={{ color: "#4cafef", fontWeight: "bold" }}>
                          Your Incomes
                        </Typography>
                        <Chip 
                          label="PREMIUM" 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }} 
                        />
                      </Box>

                    <Card sx={{ 
                      mb: 3, 
                      backgroundColor: 'rgba(76, 175, 239, 0.1)', 
                      border: '1px solid rgba(76, 175, 239, 0.3)',
                      borderRadius: '8px'
                    }}>
                      <CardContent sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body1" color="text.secondary" fontWeight="medium">
                            Total Incomes:
                          </Typography>
                          <Typography variant="h5" color="#4cafef" fontWeight="bold">
                            ₹{filteredIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount), 0).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" color="text.secondary" fontWeight="medium">
                            Total Count:
                          </Typography>
                          <Typography variant="h6" color="text.primary" fontWeight="bold">
                            {filteredIncomes.length} incomes
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary" fontWeight="medium">
                            Showing:
                          </Typography>
                          <Typography variant="body2" color="text.primary" fontWeight="bold">
                            {paginatedIncomes.length} of {filteredIncomes.length} • {itemsPerPage} per page
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>

                    <Box sx={{ 
                      maxHeight: screenSize === 'small' ? 300 : screenSize === 'medium' ? 400 : screenSize === 'large' ? 500 : 600, 
                      overflowY: 'auto'
                    }}>
                      {paginatedIncomes.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            No incomes yet
                          </Typography>
                          <Typography variant="body2">
                            Add your first income to get started!
                          </Typography>
                        </Box>
                      ) : (
                        paginatedIncomes.map((inc) => (
                          <Card key={inc.id} sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" color="#81c784" fontWeight="bold" sx={{ mb: 0.5 }}>
                                    ₹{inc.amount} - {inc.source}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {inc.description}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(inc.created_at).toLocaleDateString('en-IN')} at {new Date(inc.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                </Box>
                                <IconButton
                                  onClick={() => handleDeleteIncome(inc.id)}
                                  sx={{ color: '#ff6b6b' }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </Box>
                    
                    {/* Pagination for Incomes */}
                    <PaginationComponent
                      currentPage={currentIncomePage}
                      totalPages={totalIncomePages}
                      onPageChange={handleIncomePageChange}
                      type="incomes"
                      itemsPerPage={itemsPerPage}
                    />
                    </Card>
                  </Box>
                )}
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
                <Typography
                  variant="body2"
                  align="center"
                  sx={{ mt: 2, color: "gray" }}
                >
                  Forgot Password?{" "}
                  <span style={{ color: "#4cafef", cursor: "pointer" }} onClick={() => setForgotPasswordOpen(true)}>
                    Forgot Password
                  </span>
                </Typography>
              </form>
            </CardContent>
          </Card>
        )}
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
        <Modal
          open={forgotPasswordOpen}
          onClose={() => setForgotPasswordOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={forgotPasswordOpen}>
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
                Forgot Password
              </Typography>
              <form onSubmit={handleForgotPassword}>
                <TextField
                  label="Email Address"
                  name="email"
                  fullWidth
                  margin="normal"
                  value={forgotPasswordData.email}
                  onChange={handleForgotPasswordChange}
                  error={!!forgotPasswordError && forgotPasswordError.includes("email")}
                  helperText={forgotPasswordError.includes("email") ? forgotPasswordError : ""}
                  required
                />
              
                {forgotPasswordError && !forgotPasswordError.includes("email")  && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {forgotPasswordError}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={forgotPasswordLoading}
                  sx={{
                    mt: 2,
                    borderRadius: "10px",
                    fontWeight: "bold",
                    py: 1.2,
                    background: "linear-gradient(135deg, #4cafef, #1976d2)",
                  }}
                >
                  {forgotPasswordLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Box>
          </Fade>
        </Modal>
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
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}