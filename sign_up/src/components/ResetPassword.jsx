import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Card, CardContent, Typography, Alert } from "@mui/material";
import api from "../utils/api";

export default function ResetPassword() {
  const { id } = useParams();  // yeh requestId ayega (UUID)
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post(`/forgotpassword/resetpassword/${id}`, { newPassword: password });
      setSuccess(res.data.message || "Password reset successful!");
      setTimeout(() => navigate("/"), 2000); // 2 sec baad login page par bhej do
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <Card sx={{ width: 400, p: 3, borderRadius: "16px", margin: "100px auto" }}>
      <CardContent>
        <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: "bold", color: "#4cafef" }}>
          Reset Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, borderRadius: "10px", fontWeight: "bold" }}
          >
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
