import { useAppSelector, useAppDispatch } from "@/store/storeHooks";
import { logout } from "@/store/authSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Divider,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL;

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: { email: string };
}

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/v1/post/`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();

      setPosts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/v1/post/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete post");

      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Box maxWidth="1100px" mx="auto" mt={5}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Admin Dashboard
        </Typography>

        <Box display="flex" gap={2}>
          <Button variant="contained" onClick={() => navigate("/")}>
            Create Post
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h5" fontWeight="bold" mb={2}>
        Manage Posts
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" textAlign="center" my={2}>
          {error}
        </Typography>
      )}

      {!loading && posts.length === 0 && (
        <Typography textAlign="center" color="text.secondary">
          No posts available
        </Typography>
      )}

      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid key={post.id}>
            <Card elevation={4} sx={{ height: "100%", p: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {post.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mb: 1.2, color: "text.secondary" }}
                >
                  by {post.author.email}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mb: 1.2, color: "text.secondary" }}
                >
                  {new Date(post.createdAt).toLocaleString()}
                </Typography>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {post.content.length > 120
                    ? post.content.slice(0, 120) + "..."
                    : post.content}
                </Typography>

                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  onClick={() => handleDelete(post.id)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
