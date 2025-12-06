import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  FormHelperText,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import TableTemplate from "../../components/tables/TableTemplate";
import { handleDownloadFileExcel, handleUploadFile } from "../../utils/utils";
import {
  ToastError,
  ToastSuccess,
  PopupDelete,
  PopupEdit,
} from "../../composables/sweetalert";
import {
  bulkRegister,
  getAllUsers,
  registerUser,
  updateUser,
  deleteUser,
} from "../../services/authService";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const theme = useTheme();

  // ============ Hook Form ============
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      nama: "",
      email: "",
      password: "",
      role: "",
      nis: "",
      nisn: "",
      gender: "",
      tgl_lahir: "",
      tempat_lahir: "",
      agama: "",
      alamat: "",
      nama_ayah: "",
      nama_ibu: "",
      telp: "",
      telp_ortu: "",
      profile_picture: null,
    },
  });

  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState("");

  const columns = [
    { field: "username", label: "Username", width: 150, sortable: true },
    { field: "nama", label: "Nama", width: 200, sortable: true },
    { field: "email", label: "Email", width: 250, sortable: true },
    { field: "role", label: "Role", width: 120, sortable: true },
    {
      field: "nis",
      label: "NIS",
      width: 120,
      render: (value) => (value === null || value === "null" ? "-" : value),
      sortable: true,
    },
    {
      field: "nisn",
      label: "NISN",
      width: 120,
      render: (value) => (value === null || value === "null" ? "-" : value),
      sortable: true,
    },
    {
      field: "gender",
      label: "Gender",
      width: 120,
      render: (value) => {
        if (value === null || value === "") return "-";
        return value == 0 ? "Perempuan" : "Laki-Laki";
      },
      sortable: true,
    },
    { field: "tgl_lahir", label: "Tanggal Lahir", width: 150, sortable: true },
    { field: "tempat_lahir", label: "Tempat Lahir", width: 150, sortable: true },
    { field: "agama", label: "Agama", width: 120, sortable: true },
    { field: "alamat", label: "Alamat", width: 200, sortable: true },
    { field: "nama_ayah", label: "Nama Ayah", width: 200, sortable: true },
    { field: "nama_ibu", label: "Nama Ibu", width: 200, sortable: true },
    { field: "telp", label: "Telp", width: 150, sortable: true },
    { field: "telp_ortu", label: "Telp Ortu", width: 150, sortable: true },
    {
      field: "status",
      label: "Status",
      width: 120,
      render: (value) => (value === 1 ? "Aktif" : "Tidak Aktif"),
      sortable: true,
    },
    { 
      field: "profile_picture", 
      label: "Foto Profil", 
      width: 150,
      render: (value) =>
        value ? (
          <img
            src={value}
            alt="profile"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              cursor: "pointer",
              objectFit: "cover",
            }}
            onClick={() => {
              setPreviewImage(value);
              setOpenImageDialog(true);
            }}
          />
        ) : (
          "-"
        ),
    },
  ];

  // ================== FETCH USERS ==================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setRows(res.data || []);
    } catch (err) {
      console.error("Gagal fetch users:", err);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  // ================== HANDLE DIALOG ==================
  const defaultFormValues = {
    username: "",
    nama: "",
    email: "",
    password: "",
    role: "",
    nis: "",
    nisn: "",
    gender: "",
    tgl_lahir: "",
    tempat_lahir: "",
    agama: "",
    alamat: "",
    nama_ayah: "",
    nama_ibu: "",
    telp: "",
    telp_ortu: "",
    profile_picture: null,
  };

  const openCreateDialog = () => {
    reset(defaultFormValues);
    setEditMode(false);
    setEditData(null);
    setOpenDialog(true);
  };

  const openUpdateDialog = (row) => {
    setEditMode(true);
    setEditData(row);
    const { created_at, updated_at, deleted_at, ...cleanRow } = row;

    reset({
      ...cleanRow,
      gender:
        cleanRow.gender !== null && cleanRow.gender !== undefined
          ? String(cleanRow.gender)
          : "",
      role:
        cleanRow.role !== null && cleanRow.role !== undefined
          ? String(cleanRow.role)
          : "",
      password: "",
      profile_picture: null,
    });

    setOpenDialog(true);
  };

  const handleCancel = async () => {
    const formValues = watch();
    if (
      (formValues.username ||
        formValues.nama ||
        formValues.email ||
        formValues.password) &&
      !editMode
    ) {
      const confirmClose = await PopupEdit.fire({
        title: "Batalkan?",
        text: "Data sudah diisi sebagian. Yakin ingin membatalkan?",
      });
      if (!confirmClose.isConfirmed) return;
    }
    reset();
    setOpenDialog(false);
  };

  // ================== SAVE ==================
  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      const { created_at, updated_at, deleted_at, ...cleanData } = data;

      if (cleanData.gender !== "") {
        cleanData.gender = parseInt(cleanData.gender, 10);
      }

      if (!cleanData.profile_picture) {
        delete cleanData.profile_picture;
      }

      if (editMode) {
        await updateUser(editData.id_user, cleanData);
        ToastSuccess.fire({ title: "User berhasil diupdate" });
      } else {
        await registerUser(cleanData);
        ToastSuccess.fire({ title: "User berhasil dibuat" });
      }

      reset();
      setOpenDialog(false);
      fetchUsers();
    } catch (err) {
      console.error("Save gagal:", err);
    }
    setSubmitLoading(false);
  };

  // ================== DELETE ==================
  const handleDelete = async (data) => {
    const confirm = await PopupDelete.fire();
    if (confirm.isConfirmed) {
      setSubmitLoading(true);
      let status = true;
      try {
        if (Array.isArray(data)) {
          const ids = data.map((item) =>
            typeof item === "object" ? item.id_user : item
          );
          await Promise.all(ids.map((id) => deleteUser(id)));
          ToastSuccess.fire({ title: `${ids.length} user berhasil dihapus` });
        } else {
          await deleteUser(data.id_user);
          ToastSuccess.fire({ title: "User berhasil dihapus" });
        }

        fetchUsers();
      } catch (err) {
        console.error("Delete gagal:", err);
        status = false;
      }
      setSubmitLoading(false);
      return status;
    }
    return false;
  };

  // ================== UPLOAD ==================
  const handleUploadConfirm = async () => {
    if (!uploadFile) {
      setUploadError("File wajib diisi!");
      return;
    }
    if (!uploadFile.name.endsWith(".xlsx") && !uploadFile.name.endsWith(".xls")) {
      setUploadError("File harus berformat Excel (.xlsx atau .xls)");
      return;
    }
    setUploadLoading(true);
    try {
      const itemsData = await handleUploadFile(uploadFile, columns);

      const cleanedRows = itemsData.rows.map((u) => {
        const { id, id_user, ...rest } = u;
        return rest;
      });

      const res = await bulkRegister({ users: cleanedRows });
      ToastSuccess.fire({ title: res.message || "Bulk register success!" });
      fetchUsers();
      setOpenUploadDialog(false);
      setUploadFile(null);
      setUploadError("");
    } catch (err) {
      console.error("Bulk register gagal:", err);
    }
    setUploadLoading(false);
  };

  // ================== DOWNLOAD ==================
  const handleDownload = () => {
    if (!rows || rows.length === 0) {
      ToastError.fire({ title: "Tidak ada data untuk diunduh!" });
      return;
    }
    const rowsWithPassword = rows.map((row) => ({ ...row, password: "" }));
    const success = handleDownloadFileExcel(rowsWithPassword, "users");
    if (success) ToastSuccess.fire({ title: "Download Success!" });
    else ToastError.fire({ title: "Download Failed!" });
  };

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Manajemen User
      </Typography>

      <Box sx={{ width: "100%" }}>
        <TableTemplate
          isLoading={loading}
          title="Daftar User"
          columns={columns}
          rows={rows}
          initialRowsPerPage={10}
          keyProperty="id_user"
          isCheckbox
          isDownload
          isUpload
          isUpdate
          isDelete
          tableHeight={500}
          onCreate={openCreateDialog}
          onUpdate={openUpdateDialog}
          onDelete={handleDelete}
          onUpload={() => setOpenUploadDialog(true)}
          onDownload={handleDownload}
        />
      </Box>

      {/* ===== Dialog Form User ===== */}
      <Dialog open={openDialog} onClose={handleCancel} fullWidth maxWidth="sm">
        <DialogTitle>
          {editMode ? "Update User" : "Tambah User Baru"}
        </DialogTitle>
        <DialogContent dividers>
          {/* Username */}
          <TextField
            label="Username"
            fullWidth
            required
            margin="normal"
            {...register("username", { required: "Username wajib diisi" })}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          {/* Nama */}
          <TextField
            label="Nama"
            fullWidth
            required
            margin="normal"
            {...register("nama", { required: "Nama wajib diisi" })}
            error={!!errors.nama}
            helperText={errors.nama?.message}
          />
          {/* Email */}
          <TextField
            label="Email"
            fullWidth
            required
            margin="normal"
            {...register("email", { required: "Email wajib diisi" })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          {/* Password hanya saat create */}
          {!editMode && (
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              margin="normal"
              {...register("password", { required: "Password wajib diisi" })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          )}
          {/* Role pakai Controller */}
          <Controller
            name="role"
            control={control}
            rules={{ required: "Role wajib dipilih" }}
            render={({ field }) => (
              <TextField
                label="Role"
                fullWidth
                required
                margin="normal"
                select
                {...field}
                error={!!errors.role}
                helperText={errors.role?.message}
              >
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Guru">Guru</MenuItem>
                <MenuItem value="Siswa">Siswa</MenuItem>
              </TextField>
            )}
          />
          {/* NIS */}
          <TextField label="NIS" fullWidth margin="normal" {...register("nis")} />
          {/* NISN */}
          <TextField
            label="NISN"
            fullWidth
            margin="normal"
            {...register("nisn")}
          />
          {/* Gender pakai Controller */}
          <Controller
            name="gender"
            control={control}
            rules={{ required: "Gender wajib dipilih" }}
            render={({ field }) => (
              <TextField
                label="Gender"
                fullWidth
                margin="normal"
                select
                {...field}
                error={!!errors.gender}
                helperText={errors.gender?.message}
              >
                <MenuItem value="1">Laki-laki</MenuItem>
                <MenuItem value="0">Perempuan</MenuItem>
              </TextField>
            )}
          />
          {/* Tanggal Lahir */}
          <TextField
            label="Tanggal Lahir"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            {...register("tgl_lahir")}
          />
          {/* Tempat Lahir */}
          <TextField
            label="Tempat Lahir"
            fullWidth
            margin="normal"
            {...register("tempat_lahir")}
          />
          {/* Agama */}
          <TextField
            label="Agama"
            fullWidth
            margin="normal"
            {...register("agama")}
          />
          {/* Alamat */}
          <TextField
            label="Alamat"
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            {...register("alamat")}
          />
          {/* Nama Ayah */}
          <TextField
            label="Nama Ayah"
            fullWidth
            margin="normal"
            {...register("nama_ayah")}
          />
          {/* Nama Ibu */}
          <TextField
            label="Nama Ibu"
            fullWidth
            margin="normal"
            {...register("nama_ibu")}
          />
          {/* Telp */}
          <TextField
            label="Telp"
            fullWidth
            margin="normal"
            {...register("telp")}
          />
          {/* Telp Ortu */}
          <TextField
            label="Telp Ortu"
            fullWidth
            margin="normal"
            {...register("telp_ortu")}
          />
          {/* Upload Foto Profil */}
          <div style={{ marginTop: "16px" }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Upload Foto Profil
            </Typography>
            {editMode &&
              editData?.profile_picture &&
              !watch("profile_picture") && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1 }}
                >
                  File sudah ada: {editData.profile_picture || "File lama"}
                </Typography>
              )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && !file.type.startsWith("image/")) {
                  ToastError.fire({
                    title: "File harus berupa gambar (jpg, png, dll)",
                  });
                  e.target.value = "";
                  return;
                }
                setValue("profile_picture", file);
              }}
            />
            {errors.profile_picture && (
              <FormHelperText error>
                Foto profil wajib diupload
              </FormHelperText>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={submitLoading}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={submitLoading}
            loading={submitLoading}
          >
            { editMode ? "Update" : "Simpan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Dialog Upload Excel ===== */}
      <Dialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Upload Data User</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Silakan upload file Excel (.xlsx / .xls) untuk bulk register user.
          </Typography>
          <div style={{ marginTop: "16px" }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Upload File Excel
            </Typography>
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => {
                const file = e.target.files[0];
                if (
                  file &&
                  ![
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  ].includes(file.type)
                ) {
                  ToastError.fire({
                    title: "File harus berupa Excel (.xls atau .xlsx)",
                  });
                  e.target.value = "";
                  return;
                }
                setUploadFile(file);
              }}
            />
            {uploadFile && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                File terpilih: {uploadFile.name}
              </Typography>
            )}
            {uploadError && (
              <FormHelperText error>{uploadError}</FormHelperText>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenUploadDialog(false)}
            disabled={uploadLoading}
          >
            Batal
          </Button>
          <Button
            onClick={handleUploadConfirm}
            variant="contained"
            disabled={uploadLoading}
            loading={uploadLoading}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Preview Foto Profil</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <img
            src={previewImage}
            alt="preview"
            style={{ width: "100%", borderRadius: "12px" }}
          />
        </DialogContent>
      </Dialog>

      <style>
        {`
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: ${theme.palette.mode === "dark" ? "invert(1)" : "invert(0)"};
          }
          input[type="date"] {
            color-scheme: ${theme.palette.mode};
          }
        `}
      </style>
    </div>
  );
}
