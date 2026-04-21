import React from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  LinearProgress,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/storeHooks";
import { clearCompletedUploads } from "@/store/fileSlice";

export default function UploadDrawer() {
  const uploads = useAppSelector((state) => state.files.uploads);
  const dispatch = useAppDispatch();
  const [minimized, setMinimized] = React.useState(false);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (uploads.length === 0) {
      setVisible(false);
      return;
    }

    // If any upload is still in progress, ensure drawer is visible
    const uploading = uploads.some((u) => u.status === "uploading");
    if (uploading) {
      setVisible(true);
      return;
    }

    // All uploads completed or errored; auto-hide after short delay and clear completed
    const timer = setTimeout(() => {
      dispatch(clearCompletedUploads());
      setVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [uploads, dispatch]);

  if (uploads.length === 0 || !visible) return null;

  const completedCount = uploads.filter((u) => u.status === "completed").length;
  const totalCount = uploads.length;

  return (
    <Paper
      elevation={6}
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 300,
        zIndex: 1300,
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          bgcolor: "grey.900",
          color: "white",
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setMinimized(!minimized)}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {completedCount === totalCount
            ? `Uploaded ${totalCount} items`
            : `Uploading ${totalCount - completedCount} items...`}
        </Typography>
        <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setMinimized(!minimized);
            }}
            sx={{ color: "white" }}
          >
            {minimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(clearCompletedUploads());
            }}
            sx={{ color: "white" }}
          >
            <X size={18} />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={!minimized}>
        <List sx={{ maxHeight: 200, overflow: "auto", p: 0 }}>
          {uploads.map((upload) => (
            <ListItem
              key={upload.id}
              divider
              sx={{
                px: 2,
                py: 1.5,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <FileText size={20} color="#6366f1" />
              </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" noWrap fontWeight="medium" sx={{ fontSize: 13 }}>
                      {upload.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 0.3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={upload.progress}
                            sx={{
                              height: 3,
                              borderRadius: 2,
                              bgcolor: "grey.200",
                              "& .MuiLinearProgress-bar": {
                                bgcolor:
                                  upload.status === "error"
                                    ? "error.main"
                                    : upload.status === "completed"
                                    ? "success.main"
                                    : "primary.main",
                              },
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                          {Math.round(upload.progress)}%
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              <Box sx={{ ml: 1 }}>
                {upload.status === "uploading" && (
                  <Loader2 className="animate-spin" size={18} color="#6366f1" />
                )}
                {upload.status === "completed" && (
                  <CheckCircle2 size={18} color="#22c55e" />
                )}
                {upload.status === "error" && (
                  <AlertCircle size={18} color="#ef4444" />
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Paper>
  );
}
