import React, { useEffect, useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  IconButton,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import TableTemplate from "../tables/TableTemplate";
import {
  ToastError,
  ToastSuccess,
  PopupDelete,
  PopupEdit,
} from "../../composables/sweetalert";
import {
  getAllMateri,
  createMateri,
  updateMateri,
  deleteMateri,
  downloadMateri,
} from "../../services/materiService";
import { compressFile } from "../../utils/utils";

export default function TabMateri({ idKelasTahunAjaran }) {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [rows, setRows] = useState([]);

  const userRole = localStorage.getItem("role");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const fetchMateri = async () => {
    if (!idKelasTahunAjaran) return;
    try {
      setLoading(true);
      const res = await getAllMateri(idKelasTahunAjaran);
      setRows(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateri();
  }, [idKelasTahunAjaran]);

  const handleInfoClick = (row) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const handleOpenCreate = () => {
    if (userRole !== "guru") return ToastError.fire({ title: "Hanya guru yang dapat membuat materi" });
    reset();
    setIsEdit(false);
    setOpenCreate(true);
  };

  const handleOpenEdit = (row) => {
    if (userRole !== "guru") return ToastError.fire({ title: "Hanya guru yang dapat mengedit materi" });
    setIsEdit(true);
    setOpenCreate(true);
    reset({
      id_materi: row.id_materi,
      nama_materi: row.nama,
      pertemuan: row.pertemuan,
      deskripsi: row.deskripsi,
    });
  };

  const handleCloseCreate = async () => {
    const hasChanges = Object.values(watch()).some((v) => v);
    if (hasChanges && !isEdit) {
      const confirmClose = await PopupEdit.fire({
        title: "Batalkan?",
        text: "Data sudah diisi sebagian. Yakin ingin membatalkan?",
      });
      if (!confirmClose.isConfirmed) return;
    }
    reset();
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
    setOpenCreate(false);
  };

  const onSubmit = async (data) => {
    if (userRole !== "guru") {
      ToastError.fire({ title: "Hanya guru yang dapat menambahkan atau mengubah materi" });
      return;
    }
    setSubmitLoading(true);
    const body = new FormData();
    body.append("id_kelas_tahun_ajaran", idKelasTahunAjaran);
    body.append("nama_materi", data.nama_materi);
    body.append("pertemuan", data.pertemuan);
    body.append("deskripsi", data.deskripsi);
    if (data.file && data.file.length > 0) {
      // const compressedFile = await compressFile(data.file[0]);
      body.append("file", data.file[0]);
    }

    try {
      if (isEdit && data.id_materi) {
        await updateMateri(data.id_materi, body);
      } else {
        await createMateri(body);
      }

      ToastSuccess.fire({
        title: isEdit ? "Materi berhasil diperbarui" : "Materi berhasil ditambahkan",
      });

      fetchMateri();
      setOpenCreate(false);
      reset();
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error(err);
    }
    setSubmitLoading(false)
  };

  const handleDelete = async (row) => {
    if (userRole !== "guru") return ToastError.fire({ title: "Hanya guru yang dapat menghapus materi" });
    const confirm = await PopupDelete.fire({ title: "Hapus Materi ini?" });
    if (!confirm.isConfirmed) return;
    try {
      await deleteMateri(row.id_materi);
      fetchMateri();
      ToastSuccess.fire({ title: "Materi berhasil dihapus" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadFile = async (row) => {
    setLoadingDownload(true)
    try {
      const res = await downloadMateri(row.id_materi);
      const blob = new Blob([res]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = row.file || "materi";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      ToastError.fire({ title: "Gagal mengunduh file" });
    }
    setLoadingDownload(false)
  };

  const columns = [
    { field: "nama", label: "Nama Materi", width: "250px" },
    { field: "pertemuan", label: "Pertemuan", width: "100px" },
    { field: "deskripsi", label: "Deskripsi", width: "400px" },
    {
      field: "action",
      label: "Action",
      width: "160px",
      align: "center",
      render: (value, row) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Detail Info">
            <IconButton size="small" color="primary" onClick={() => handleInfoClick(row)}>
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download File">
            <IconButton size="small" color="primary" onClick={() => handleDownloadFile(row)}>
              <DownloadOutlinedIcon />
            </IconButton>
          </Tooltip>

          {userRole === "guru" && (
            <>
              <Tooltip title="Edit">
                <IconButton size="small" color="warning" onClick={() => handleOpenEdit(row)}>
                  <EditOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={() => handleDelete(row)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Backdrop open={loadingDownload} sx={{ zIndex: 2000, color: "#fff" }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <TableTemplate
        key={"Materi"}
        title={"Materi"}
        columns={columns}
        rows={rows}
        isLoading={loading}
        initialRowsPerPage={10}
        tableHeight={400}
        isCheckbox={false}
        isCreate={userRole=="guru"}
        isUpdate={false}
        isDelete={false}
        isUpload={false}
        isDownload={false}
        onCreate={userRole === "guru" ? handleOpenCreate : undefined}
      />

      {/* Dialog Detail */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Detail Materi</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" fontWeight="bold">
            {selectedRow?.nama}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Deskripsi: {selectedRow?.deskripsi}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Pertemuan: {selectedRow?.pertemuan}
          </Typography>

          {selectedRow?.file_url && (
            <Box sx={{ mt: 2 }}>
              {/* Preview PDF */}
              {/\.(pdf)$/i.test(selectedRow.file_url) ? (
                <iframe
                  src={selectedRow.file_url}
                  width="100%"
                  height="500px"
                  title="PDF Preview"
                />
              ) : 
              /* Preview Office files */
              /\.(doc|docx|ppt|pptx|xls|xlsx)$/i.test(selectedRow.file_url) ? (
                selectedRow.file_url.startsWith("http://localhost") ? (
                  <Typography color="text.secondary" align="center">
                    Pratinjau tidak tersedia di mode lokal. Upload ke server agar dapat ditampilkan.
                  </Typography>
                ) : (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(selectedRow.file_url)}`}
                    width="100%"
                    height="500px"
                    title="Office Preview"
                    style={{ border: "none" }}
                  />
                )
              ) : 
              /* Preview Image */
              /\.(jpg|jpeg|png|gif)$/i.test(selectedRow.file_url) ? (
                <img
                  src={selectedRow.file_url}
                  alt="Materi"
                  style={{ width: "100%", borderRadius: 8 }}
                />
              ) : 
              /* Preview Video (MP4 / MKV / MOV) */
              /\.(mp4|mkv|mov)$/i.test(selectedRow.file_url) ? (
                <video
                  src={selectedRow.file_url}
                  controls
                  style={{ width: "100%", borderRadius: 8 }}
                />
              ) : (
                <Typography color="text.secondary" align="center">
                  Format file tidak didukung untuk pratinjau.
                </Typography>
              )}
            </Box>
          )}

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="primary">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Create/Edit */}
      <Dialog open={openCreate} onClose={handleCloseCreate} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? "Edit Materi" : "Buat Materi Baru"}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                label="Nama Materi"
                fullWidth
                size="small"
                {...register("nama_materi", { required: "Nama materi wajib diisi" })}
                error={!!errors.nama_materi}
                helperText={errors.nama_materi?.message}
              />
              <TextField
                label="Pertemuan"
                fullWidth
                size="small"
                {...register("pertemuan", { required: "Pertemuan wajib diisi" })}
                error={!!errors.pertemuan}
                helperText={errors.pertemuan?.message}
              />
              <TextField
                label="Deskripsi"
                fullWidth
                multiline
                rows={4}
                {...register("deskripsi")}
              />
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Upload File (opsional)
                </Typography>
                <input
                  type="file"
                  {...register("file")}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png,.mp4,.mkv,.mov"
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreate} disabled={submitLoading}>Batal</Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitLoading} loading={submitLoading}>
              {isEdit ? "Update" : "Simpan"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
