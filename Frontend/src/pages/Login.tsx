import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Typography, Box, Link } from "@mui/material";
import type { SubmitHandler } from "react-hook-form";
import { useAppDispatch } from "@/store/storeHooks";
import { setTokens } from "@/store/authSlice";

import { decodeJwt } from "@/services/jwt";

interface SigninForm {
  email: string;
  password: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function SigninPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninForm>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<SigninForm> = async (data) => {
    try {
      const res = await fetch(`${API_URL}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Login failed");

      const json = await res.json();
      localStorage.setItem("accessToken", json.accessToken);
      localStorage.setItem("refreshToken", json.refreshToken);

      dispatch(
        setTokens({
          access: json.accessToken,
          refresh: json.refreshToken,
        }),
      );
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
        Sign In
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
          {...register("password", { required: "Password is required" })}
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
          Sign In
        </Button>

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/signup")}
          >
            Sign Up
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
