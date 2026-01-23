import { useAppSelector, useAppDispatch } from "@/store/storeHooks";
import { logout } from "@/store/authSlice";
import {
  addFiles,
  setFiles,
  deleteFile,
  addUpload,
  updateUploadProgress,
  type FileItem,
} from "@/store/fileSlice";
import { useNavigate } from "react-router-dom";
import React, { useRef, useState, useEffect } from "react";
import type { AxiosProgressEvent } from "axios";
import { useSnackbar } from "notistack";
import api, { API_URL } from "@/services/api";
import Select from "react-select";

import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Tooltip,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Upload,
  MoreVertical,
  Trash2,
  FileText,
  LayoutGrid,
  List as ListIcon,
  HardDrive,
  Plus,
  Bell,
} from "lucide-react";
import UploadDrawer from "@/components/UploadDrawer";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { files } = useAppSelector((state) => state.files);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await api.get(`${API_URL}/v1/user/files-db`);
        console.log(resp.data);
        const serverFiles = (resp.data || []).map((f: any) => ({
          id: f.id,
          name: f.id,
          size: 0,
          type: "application/octet-stream",
          uploadedAt: f.uploadedAt,
          url: f.url,
        }));
        if (serverFiles.length) dispatch(setFiles(serverFiles));
      } catch (e) {}
    })();
  }, [dispatch]);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [notiPermission, setNotiPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setNotiPermission(Notification.permission);
    }
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    enqueueSnackbar("Logged out successfully", { variant: "info" });
    setAccountAnchorEl(null);
  };

  const handleTestNotification = async () => {
    try {
      await api.post("/v1/user/test-notification");
      enqueueSnackbar("Test notification request sent", { variant: "success" });
    } catch (e) {
      enqueueSnackbar("Failed to send test notification", { variant: "error" });
    }
  };

  const handleTestDelayedNotification = async () => {
    try {
      await api.post("/v1/user/test-notification-delayed");
      enqueueSnackbar("Delayed notification scheduled! Close the tab now.", {
        variant: "info",
        autoHideDuration: 10000,
      });
    } catch (e) {
      enqueueSnackbar("Failed to schedule delayed notification", {
        variant: "error",
      });
    }
  };

  const handleFiles = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return;

    const results = await Promise.all(
      Array.from(uploadedFiles).map(async (file) => {
        const uploadId = Math.random().toString(36).substring(7);

        dispatch(
          addUpload({
            id: uploadId,
            name: file.name,
            progress: 0,
            status: "uploading",
          }),
        );

        const form = new FormData();
        form.append("file", file);

        try {
          const resp = await api.post("/v1/upload", form, {
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
              const loaded = progressEvent?.loaded ?? 0;
              const total = progressEvent?.total ?? 0;
              if (total > 0) {
                const percent = Math.round((loaded / total) * 100);
                dispatch(
                  updateUploadProgress({ id: uploadId, progress: percent }),
                );
              }
            },
          });

          const data = resp.data;
          const newFile: FileItem = {
            id: data.id,
            name: file.name,
            size: file.size,
            type: file.type || "application/octet-stream",
            uploadedAt: data.uploadedAt || new Date().toISOString(),
            url: data.url,
          };

          dispatch(
            updateUploadProgress({
              id: uploadId,
              progress: 100,
              status: "completed",
            }),
          );
          dispatch(addFiles([newFile]));
          return { success: true, name: file.name };
        } catch (e) {
          dispatch(
            updateUploadProgress({
              id: uploadId,
              progress: 0,
              status: "error",
            }),
          );
          return { success: false, name: file.name };
        }
      }),
    );

    const successful = results.filter((r) => r.success);
    if (successful.length > 0) {
      const msg =
        successful.length > 1
          ? `Successfully uploaded ${successful.length} files`
          : `File "${successful[0].name}" uploaded successfully`;
      enqueueSnackbar(msg, { variant: "success" });

      try {
        await api.post(
          "/v1/user/notify-upload-batch",
          {
            count: successful.length,
            firstName: successful[0].name,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          },
        );
      } catch (err) {
        console.error("Batch notify error:", err);
      }
    }

    const failed = results.filter((r) => !r.success);
    if (failed.length > 0) {
      enqueueSnackbar(`Failed to upload ${failed.length} file(s)`, {
        variant: "error",
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    await handleFiles(event.target.files);
  };

  const handleDelete = (id: string) => {
    (async () => {
      try {
        await api.delete(`${API_URL}/v1/upload/${id}`);
        dispatch(deleteFile(id));
        enqueueSnackbar("File deleted", { variant: "info" });
      } catch (e) {
        enqueueSnackbar("Failed to delete file", { variant: "error" });
      } finally {
        setAnchorEl(null);
      }
    })();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    file: FileItem,
  ) => {
    setSelectedFile(file);
    setAnchorEl(event.currentTarget);
  };

  return (
    <Box
      sx={{ display: "flex", height: "100vh", bgcolor: "#f8fafc" }}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <Box
        sx={{
          width: 260,
          borderRight: "1px solid",
          borderColor: "divider",
          p: 2,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box
          sx={{ p: 1, mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: "primary.main",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <HardDrive size={24} />
          </Box>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            CloudDrive
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            py: 1.5,
            borderRadius: 3,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            mb: 4,
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        >
          New File
        </Button>

        <Button
          startIcon={<HardDrive size={20} />}
          fullWidth
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color: "primary.main",
            bgcolor: "rgba(99, 102, 241, 0.08)",
            borderRadius: 2,
            p: 1.5,
            mb: 1,
            "&:hover": {
              bgcolor: "rgba(99, 102, 241, 0.12)",
            },
          }}
        >
          My Drive
        </Button>

        <Button
          startIcon={<Bell size={20} />}
          fullWidth
          onClick={handleTestNotification}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color:
              notiPermission === "granted" ? "text.secondary" : "error.main",
            borderRadius: 2,
            p: 1.5,
            "&:hover": {
              bgcolor: "action.hover",
              color: "primary.main",
            },
          }}
        >
          {notiPermission === "granted"
            ? "Test OS Notification"
            : "Fix Permissions"}
        </Button>

        {notiPermission === "granted" && (
          <Button
            startIcon={<Bell size={20} />}
            fullWidth
            onClick={handleTestDelayedNotification}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              color: "text.secondary",
              borderRadius: 2,
              p: 1.5,
              mt: 1,
              "&:hover": {
                bgcolor: "action.hover",
                color: "primary.main",
              },
            }}
          >
            Test Background Alert (10s)
          </Button>
        )}

        {notiPermission !== "granted" && (
          <Typography
            variant="caption"
            color="error"
            sx={{ px: 2, mt: 1, display: "block" }}
          >
            {notiPermission === "denied"
              ? "Notifications blocked by browser. Reset in address bar."
              : "Notification permission required for OS alerts."}
          </Typography>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "white",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ width: 400 }}>
            <Select
              options={files.map((file) => ({
                value: file.id,
                label: file.name,
              }))}
              value={selectedOption}
              onChange={(option) => {
                setSelectedOption(option);
              }}
              placeholder="Search in Drive"
              isClearable
              isSearchable
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "8px",
                  backgroundColor: "#f1f5f9",
                  border: "none",
                  boxShadow: "none",
                  minHeight: "40px",
                }),
                input: (base) => ({
                  ...base,
                  color: "#000",
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? "#6366f1"
                    : state.isFocused
                      ? "#f1f5f9"
                      : "#fff",
                  color: state.isSelected ? "#fff" : "#000",
                  cursor: "pointer",
                }),
              }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                bgcolor: "#f1f5f9",
                p: 0.5,
                borderRadius: 2,
              }}
            >
              <IconButton
                size="small"
                onClick={() => setView("grid")}
                sx={{
                  color: view === "grid" ? "primary.main" : "text.secondary",
                  bgcolor: view === "grid" ? "white" : "transparent",
                  boxShadow: view === "grid" ? 1 : 0,
                  "&:hover": {
                    bgcolor: view === "grid" ? "white" : "action.hover",
                  },
                }}
              >
                <LayoutGrid size={18} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setView("list")}
                sx={{
                  color: view === "list" ? "primary.main" : "text.secondary",
                  bgcolor: view === "list" ? "white" : "transparent",
                  boxShadow: view === "list" ? 1 : 0,
                  "&:hover": {
                    bgcolor: view === "list" ? "white" : "action.hover",
                  },
                }}
              >
                <ListIcon size={18} />
              </IconButton>
            </Box>
            <Box>
              <IconButton
                onClick={(e) => setAccountAnchorEl(e.currentTarget)}
                size="small"
                sx={{ p: 0.5 }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    cursor: "pointer",
                  }}
                >
                  U
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={accountAnchorEl}
                open={Boolean(accountAnchorEl)}
                onClose={() => setAccountAnchorEl(null)}
                PaperProps={{
                  elevation: 2,
                  sx: { borderRadius: 2, minWidth: 160 },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setAccountAnchorEl(null);
                    navigate("/profile");
                  }}
                  sx={{ fontSize: "0.95rem", fontWeight: 500 }}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    color: "error.main",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 4, overflow: "auto", flexGrow: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              My Files
            </Typography>
          </Box>

          {files.length === 0 ? (
            <Box
              sx={{
                height: "60vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: "#f1f5f9",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Upload size={48} />
              </Box>
              <Typography variant="h6">No files yet</Typography>
              <Typography variant="body2">
                Upload your first file to get started
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Upload size={18} />}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload File
              </Button>
            </Box>
          ) : (
            (() => {
              const filteredFiles = selectedOption
                ? files.filter((file) => file.id === selectedOption.value)
                : files;

              if (filteredFiles.length === 0) {
                return (
                  <Box
                    sx={{
                      height: "60vh",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "text.secondary",
                      gap: 2,
                    }}
                  >
                    <FileText size={48} />
                    <Typography variant="h6">No files found</Typography>
                    <Typography variant="body2">
                      Try searching with different keywords
                    </Typography>
                  </Box>
                );
              }

              return view === "grid" ? (
                <Grid container spacing={3}>
                  {filteredFiles.map((file) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={file.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          "&:hover": {
                            borderColor: "primary.main",
                            boxShadow: 1,
                          },
                          position: "relative",
                          transition: "all 0.2s",
                        }}
                      >
                        <Box
                          sx={{
                            height: 120,
                            bgcolor: "#f8fafc",
                            borderRadius: 2,
                            mb: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "primary.main",
                          }}
                        >
                          <FileText size={48} />
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                          }}
                        >
                          <Box sx={{ overflow: "hidden" }}>
                            <Typography
                              variant="subtitle2"
                              noWrap
                              fontWeight="bold"
                            >
                              {file.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatSize(file.size)} •{" "}
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, file)}
                          >
                            <MoreVertical size={16} />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 120px 120px 48px",
                      p: 2,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="caption" fontWeight="bold">
                      NAME
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      SIZE
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      UPLOADED
                    </Typography>
                    <Box />
                  </Box>
                  {filteredFiles.map((file) => (
                    <Box
                      key={file.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 120px 120px 48px",
                        p: 2,
                        alignItems: "center",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        "&:hover": { bgcolor: "action.hover" },
                        "&:last-child": { borderBottom: 0 },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          overflow: "hidden",
                        }}
                      >
                        <FileText size={20} color="#6366f1" />
                        <Typography variant="body2" noWrap fontWeight="medium">
                          {file.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatSize(file.size)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, file)}
                      >
                        <MoreVertical size={16} />
                      </IconButton>
                    </Box>
                  ))}
                </Paper>
              );
            })()
          )}
        </Box>
      </Box>

      {/* Hidden File Input */}
      {dragActive && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(99,102,241,0.08)",
            zIndex: 1300,
            pointerEvents: "none",
          }}
        >
          <Paper
            elevation={0}
            sx={{ p: 4, borderRadius: 2, bgcolor: "transparent" }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: "primary.main" }}
            >
              Drop files to upload
            </Typography>
          </Paper>
        </Box>
      )}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {/* File Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 2,
          sx: { borderRadius: 2, minWidth: 150 },
        }}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              width: "100%",
            }}
          >
            <FileText size={18} /> View Details
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => selectedFile && handleDelete(selectedFile.id)}
          sx={{ color: "error.main" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              width: "100%",
            }}
          >
            <Trash2 size={18} /> Delete
          </Box>
        </MenuItem>
      </Menu>

      {/* Upload Progress Drawer */}
      <UploadDrawer />
    </Box>
  );
}
