import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button, TextField, Radio, Checkbox } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { PopupError, ToastError, ToastSuccess } from "../../../composables/sweetalert";
import { getUjianById } from "../../../services/ujianService";
import { getKelasTahunAjaranById } from "../../../services/kelasTahunAjaranService";
import { getRandomSoal } from "../../../services/soalService";
import { createJawabanUjian } from "../../../services/jawabanUjianService";
import TextEditor from "../../../components/inputs/TextEditor";
import { useDispatch } from "react-redux";
import { setUjianMode, resetUjianMode } from "../../../stores/ujianSlice";

export default function FormUjianSiswaPage() {
  const { idKelasTahunAjaran, idUjian } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [ujian, setUjian] = useState(null);
  const [kelasTahunAjaran, setKelasTahunAjaran] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [soal, setSoal] = useState(null);
  const [jawaban, setJawaban] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null); 
  const [nomorSoal, setNomorSoal] = useState(0);
  const [hasLeftTab, setHasLeftTab] = useState(false);

  const id_user = localStorage.getItem("id_user");

  // ================== FETCH DATA UJIAN ==================
  useEffect(() => {
    const fetchUjian = async () => {
      try {
        setLoading(true);
        const res = await getUjianById(idUjian);
        const data = res?.data;

        if (!data) {
          ToastError.fire({ title: "Data ujian tidak ditemukan" });
          navigate(-1);
          return;
        }

        let siswaList = [];
        try {
          siswaList =
            typeof data.list_siswa === "string"
              ? JSON.parse(data.list_siswa)
              : data.list_siswa || [];
        } catch {
          siswaList = [];
        }

        if (!id_user || !siswaList.map(Number).includes(Number(id_user))) {
          ToastError.fire({
            title: "Anda tidak terdaftar untuk mengikuti ujian ini.",
          });
          return navigate(-1);
        }
        setNomorSoal(data.jumlah_soal_dijawab + 1)
        setUjian(data);
        setStartTime(new Date(data.start_date));
        setEndTime(new Date(data.end_date));
      } catch (err) {
        console.error(err);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    const fetchKelasTahunAjaran = async () => {
      try {
        const res = await getKelasTahunAjaranById(idKelasTahunAjaran);
        setKelasTahunAjaran(res?.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (idUjian) {
      fetchKelasTahunAjaran();
      fetchUjian();
    }
  }, [idUjian, idKelasTahunAjaran]);

  // ================== CEK & KUNCI SELAMA UJIAN BERLANGSUNG ==================
  useEffect(() => {
    if (!isLocked) return;

    // Cegah shortcut keluar / refresh
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey && e.key === "w") ||
        (e.altKey && e.key === "F4") ||
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r")
      ) {
        e.preventDefault();
        e.stopPropagation();
        PopupError.fire({ title: "Shortcut dinonaktifkan selama ujian berlangsung.", html: "" });
      }
    };

    // Deteksi jika siswa meninggalkan tab
    const handleVisibilityChange = () => {
      if (document.hidden) {
        PopupError.fire({ title: "Anda meninggalkan tab ujian! Harap tetap berada di halaman ujian.", html: "" });
        setHasLeftTab(true);
      }
    };

    // Pasang listener
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Bersihkan saat komponen unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLocked]);

  useEffect(() => {
    if (isLocked) {
      // ujian sedang berlangsung
      dispatch(setUjianMode(true));
    } else {
      // ujian belum mulai atau sudah selesai
      dispatch(resetUjianMode());
    }

    return () => {
      dispatch(resetUjianMode());
    };
  }, [isLocked, soal, dispatch]);

  // ================== COUNTDOWN TIMER ==================
  useEffect(() => {
    const timer = setInterval(() => {
      if (!startTime || !endTime) {
        setTimeLeft("");
        return;
      }

      const now = new Date();

      if (now < startTime) {
        const diff = startTime - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`Belum mulai: ${h} jam ${m} menit ${s} detik lagi`);
      } else if (now >= startTime && now < endTime) {
        const diff = endTime - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`Tersisa ${h} jam ${m} menit ${s} detik`);
      } else {
        setTimeLeft("Waktu pengerjaan telah habis");
        setIsLocked(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime]);

  // ================== FETCH RANDOM SOAL ==================
  const fetchSoal = async () => {
    try {
      if (!isLocked) return; // hanya fetch jika ujian sedang aktif

      const res = await getRandomSoal(idUjian);
      if (res?.data) {
        // kalau ada data, set soalnya
        setSoal(res.data);
        return true;
      } else {
        // kalau null, tandanya semua sudah dijawab
        setSoal(null);
        setIsLocked(false);
        ToastSuccess.fire({ title: "Telah selesai mengerjakan ujian!" });
      }
    } catch (err) {
      console.error(err);
      setSoal(null);
      setIsLocked(false);
      return false;
    }
    return false;
  };

  useEffect(() => {
    fetchSoal();
  }, [idUjian, isLocked]);

  // ================== SUBMIT JAWABAN ==================
  const handleSubmit = async () => {
    try {
      if (!soal) {
        ToastError.fire({ title: "Soal tidak ditemukan" });
        return;
      }
      
      // validasi
      if (
        (soal.jenis_soal === "isian" && !jawaban.trim()) ||
        (soal.jenis_soal !== "isian" && (jawaban === "" || jawaban === null))
      ) {
        ToastError.fire({ title: "Jawaban tidak boleh kosong" });
        return;
      }
      
      // tentukan payload sesuai jenis soal
      let payloadJawaban;
      if (soal.jenis_soal === "isian") {
        payloadJawaban = jawaban.trim(); // kirim teks langsung
      } else {
        payloadJawaban = selectedIndex; // kirim index (angka / array)
      }
      
      setLoadingSubmit(true)
      // kirim ke backend
      await createJawabanUjian({
        id_ujian: idUjian,
        id_soal: soal.id_soal,
        jawaban: payloadJawaban,
        ...(hasLeftTab ? { keterangan: "Siswa Telah Meninggalkan Tab" } : {}),
      });
      setHasLeftTab(false);

      // lanjut ke soal berikut
      const cekSoal = await fetchSoal();
      if(cekSoal) setNomorSoal((prev) => prev + 1);
      setJawaban("");
      setSelectedIndex(null);
      setLoadingSubmit(false)
    } catch (err) {
      console.error(err);
      ToastError.fire({ title: "Gagal menyimpan jawaban" });
      setLoadingSubmit(false)
    }
    setLoadingSubmit(false)
  };

  // ================== LOADING ==================
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!ujian) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h6" color="error">
          Data ujian tidak ditemukan.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          {`${ujian?.jenis_ujian || "-"} - ${
            kelasTahunAjaran?.Pelajaran?.nama_pelajaran || "-"
          }`}
        </Typography>
      </Box>

      <hr />
      <Box sx={{ textAlign: "center" }}>
        {soal && (
          <Box>
            <Typography variant="body1" sx={{ my: 2 }}>
              Total {ujian.jumlah_total_soal} Soal - {timeLeft}
            </Typography>
          </Box>
        )}
      </Box>

      {/* =============== BAGIAN SOAL RANDOM =============== */}
      <Box sx={{ mt: 4 }}>
        {isLocked ? (
          soal ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {nomorSoal}. {soal.text_soal}
              </Typography>

              {soal.gambar_url && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={soal.gambar_url}
                    alt="gambar soal"
                    style={{ maxWidth: "100%", borderRadius: 8 }}
                  />
                </Box>
              )}

              {/* ===== Pilihan Ganda Satu ===== */}
              {soal.jenis_soal === "pilihan_ganda_satu" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {Array.isArray(JSON.parse(soal.list_jawaban)) &&
                    JSON.parse(soal.list_jawaban).map((opt, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #ddd",
                          borderRadius: 2,
                          p: 1,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setJawaban(opt);
                          setSelectedIndex(idx);
                        }}
                      >
                        <Radio
                          checked={jawaban === opt}
                          onChange={() => {
                            setJawaban(opt);
                            setSelectedIndex(idx);
                          }}
                          value={opt}
                          sx={{ mr: 1 }}
                        />
                        <Typography>{opt}</Typography>
                      </Box>
                    ))}
                </Box>
              )}

              {/* ===== Pilihan Ganda Banyak ===== */}
              {soal.jenis_soal === "pilihan_ganda_banyak" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {Array.isArray(JSON.parse(soal.list_jawaban)) &&
                    JSON.parse(soal.list_jawaban).map((opt, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          border: "1px solid #ddd",
                          borderRadius: 2,
                          p: 1,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setJawaban((prev) => {
                            const arr = Array.isArray(prev) ? [...prev] : [];
                            const updated = arr.includes(opt)
                              ? arr.filter((j) => j !== opt)
                              : [...arr, opt];
                            const parsed = JSON.parse(soal.list_jawaban);
                            const selectedIdx = updated.map((j) =>
                              parsed.indexOf(j)
                            );
                            setSelectedIndex(selectedIdx);
                            return updated;
                          });
                        }}
                      >
                        <Checkbox
                          checked={
                            Array.isArray(jawaban)
                              ? jawaban.includes(opt)
                              : false
                          }
                          value={opt}
                          sx={{ mr: 1 }}
                        />
                        <Typography>{opt}</Typography>
                      </Box>
                    ))}
                </Box>
              )}

              {/* ===== Isian ===== */}
              {soal.jenis_soal === "isian" && (
                <Box sx={{ my: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Jawaban Anda:
                  </Typography>
                  <TextEditor
                    value={jawaban}
                    onChange={setJawaban}
                    // onSend={handleSubmit}
                  />
                </Box>
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                sx={{ mt: 3 }}
                disabled={loadingSubmit}
                loading={loadingSubmit}
              >
                Kirim Jawaban
              </Button>
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Semua soal sudah dijawab
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate(-1)}
              >
                Kembali
              </Button>
            </Box>
          )
        ) : (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography sx={{ textAlign: "center", my: 3 }}>
              Ujian belum dimulai atau sudah selesai.
            </Typography>
            <Button
              variant="contained"
              color="warning"
              onClick={() =>
                navigate(`/ujian/detail/${idKelasTahunAjaran}`)
              }
            >
              Kembali
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
