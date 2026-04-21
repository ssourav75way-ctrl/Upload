import { useForm } from "react-hook-form";
import { Box, TextField, Typography, Button, Link } from "@mui/material";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
interface FormValues {
  email: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const res = await fetch(`${API_URL}/v1/user/forgetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!res.ok) {
        throw new Error("Failed to send reset email");
      }

      alert("Reset link sent! Check your email.");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={10} p={4} borderRadius={2} boxShadow={3}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Reset Password
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Enter your email and we’ll send you a link to reset your password.
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Invalid email format",
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={isSubmitting}
        >
          Send Reset Link
        </Button>

        <Box mt={2} textAlign="center">
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/")}
          >
            Back to Sign In
          </Link>
        </Box>
      </form>
    </Box>
  );
}
