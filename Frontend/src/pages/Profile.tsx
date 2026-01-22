import  { useEffect, useState } from "react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  CircularProgress,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  createdAt: string;
  roles: string[];
}

export default function Profile() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const resp = await api.get("/v1/user/profile");
        setUser(resp.data);
      } catch (e) {
        enqueueSnackbar("Failed to load profile", { variant: "error" });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, enqueueSnackbar]);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "error" });
      return;
    }
    if (newPassword.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", { variant: "error" });
      return;
    }

    try {
      await api.post("/v1/user/changePassword", {
        oldPassword: "",
        newPassword,
      });
      enqueueSnackbar("Password changed successfully", { variant: "success" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      enqueueSnackbar("Failed to change password", { variant: "error" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Button
        startIcon={<ArrowLeft size={20} />}
        onClick={() => navigate("/dashboard")}
        sx={{ mb: 4 }}
      >
        Back to Dashboard
      </Button>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Profile
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
            Email
          </Typography>
          <TextField fullWidth value={user?.email || ""} disabled />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
            Member Since
          </Typography>
          <Typography variant="body2">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
            Roles
          </Typography>
          <Typography variant="body2">
            {user?.roles?.join(", ") || "User"}
          </Typography>
        </Box>

        <Typography variant="h6" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
          Change Password
        </Typography>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleChangePassword}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Update Password
        </Button>
      </Paper>
    </Container>
  );
}
