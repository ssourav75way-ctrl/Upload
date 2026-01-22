import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  url: string;
}

export interface UploadProgress {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "completed" | "error";
}

interface FileState {
  files: FileItem[];
  uploads: UploadProgress[];
}

const initialState: FileState = {
  files: JSON.parse(localStorage.getItem("drive_files") || "[]"),
  uploads: [],
};

export const fileSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    addFiles: (state, action: PayloadAction<FileItem[]>) => {
        state.files = [...action.payload, ...state.files];
      localStorage.setItem("drive_files", JSON.stringify(state.files));
    },
      setFiles: (state, action: PayloadAction<FileItem[]>) => {
        state.files = action.payload;
        localStorage.setItem("drive_files", JSON.stringify(state.files));
      },
    deleteFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter((f) => f.id !== action.payload);
      localStorage.setItem("drive_files", JSON.stringify(state.files));
    },
    addUpload: (state, action: PayloadAction<UploadProgress>) => {
      state.uploads.unshift(action.payload);
    },
    updateUploadProgress: (
      state,
      action: PayloadAction<{
        id: string;
        progress: number;
        status?: UploadProgress["status"];
      }>,
    ) => {
      const upload = state.uploads.find((u) => u.id === action.payload.id);
      if (upload) {
        upload.progress = action.payload.progress;
        if (action.payload.status) {
          upload.status = action.payload.status;
        }
      }
    },
    removeUpload: (state, action: PayloadAction<string>) => {
      state.uploads = state.uploads.filter((u) => u.id !== action.payload);
    },
    clearCompletedUploads: (state) => {
      state.uploads = state.uploads.filter((u) => u.status === "uploading");
    },
  },
});

export const {
  addFiles,
  setFiles,
  deleteFile,
  addUpload,
  updateUploadProgress,
  removeUpload,
  clearCompletedUploads,
} = fileSlice.actions;

export default fileSlice.reducer;
