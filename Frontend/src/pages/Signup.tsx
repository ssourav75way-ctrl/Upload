import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Typography, Button, Link } from "@mui/material";
import { useAppDispatch } from "@/store/storeHooks";
import { setTokens } from "@/store/authSlice";
import { decodeJwt } from "@/services/jwt";

interface SignupForm {
  email: string;
  password: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const onSubmit: SubmitHandler<SignupForm> = async (data) => {
    try {
      const res = await fetch(`${API_URL}/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Signup failed");

      const json = await res.json();
      localStorage.setItem("accessToken", json.accessToken);
      localStorage.setItem("refreshToken", json.refreshToken);
      dispatch(
        setTokens({
          access: json.accessToken,
          refresh: json.refreshToken,
        }),
      );

      //   if (!token || typeof token !== "string" || !token.includes(".")) {
      //     console.error("Invalid token returned:", token);
      //     return;
      //   }
      const payload = decodeJwt(json.accessToken);
      if (payload.roles.includes("ADMIN")) navigate("/admin-dashboard");
      else if (payload.roles.includes("USER")) navigate("/dashboard");
      else navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={10} p={4} borderRadius={2} boxShadow={3}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Create Account
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          {...register("email", { required: "Email is required" })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Create Account
        </Button>

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/forgetPassword")}
          >
            Forgot Password?
          </Link>
        </Box>
      </form>
    </Box>
  );
}
