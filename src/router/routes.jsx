// Page import
// General
import HomePage from "../pages/General/HomePage";
import LoginPage from "../pages/General/LoginPage";
import JadwalPage from "../pages/General/JadwalPage";
import ProfilePage from "../pages/General/ProfilePage";
import KelasPage from "../pages/General/KelasPage";
import UjianPage from "../pages/General/UjianPage";

// Siswa
import NilaiSiswaPage from "../pages/Siswa/NilaiSiswaPage";
import DetailModuleSiswaPage from "../pages/Siswa/Kelas/DetailModuleSiswaPage";
import DetailKelasSiswaPage from "../pages/Siswa/Kelas/DetailKelasSiswaPage";
import DetailUjianSiswaPage from "../pages/Siswa/Ujian/DetailUjianSiswaPage";
import FormUjianSiswaPage from "../pages/Siswa/Ujian/FormUjianSiswaPage";

// Guru
import DetailKelasGuruPage from "../pages/Guru/Kelas/DetailKelasGuruPage";
import DetailModuleGuruPage from "../pages/Guru/Kelas/DetailModuleGuruPage";
import DetailPresensiGuruPage from "../pages/Guru/Kelas/DetailPresensiGuruPage";
import DetailUjianGuruPage from "../pages/Guru/Ujian/DetailUjianGuruPage";
import FormUjianGuruPage from "../pages/Guru/Ujian/FormUjianGuruPage";
import PeriksaUjianGuruPage from "../pages/Guru/Ujian/PeriksaUjianGuruPage";
import PeriksaDetailUjianGuruPage from "../pages/Guru/Ujian/PeriksaDetailUjianGuruPage";

// Admin
import RegisterPage from "../pages/Admin/RegisterPage";
import MasterJadwalPage from "../pages/Admin/MasterJadwalPage";
import MasterKelasPage from "../pages/Admin/MasterKelasPage";
import MasterTahunAjaranPage from "../pages/Admin/MasterTahunAjaranPage";
import MasterPelajaranPage from "../pages/Admin/MasterPelajaranPage";
import MasterPeriodePelajaranPage from "../pages/Admin/MasterPeriodePelajaranPage";
import MasterKelasSiswaPage from "../pages/Admin/MasterKelasSiswaPage";

// Icon import
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import SensorDoorOutlinedIcon from '@mui/icons-material/SensorDoorOutlined';
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import LaptopChromebookOutlinedIcon from '@mui/icons-material/LaptopChromebookOutlined';

const loginRoutes = [
  {
    section: "login",
    items: [
      { path: "/", element: <LoginPage />, label: "Login", icon: <ExitToAppOutlinedIcon /> },
    ],
  },
];

const studentRoutes = [
  {
    section: "General",
    items: [
      { path: "/dashboard", element: <HomePage />, label: "Pengumuman", icon: <AnnouncementOutlinedIcon /> },
    ],
  },
  {
    section: "Akademik",
    items: [
      { path: "/jadwal", element: <JadwalPage />, label: "Jadwal Pelajaran", icon: <CalendarMonthOutlinedIcon /> },
      { path: "/kelas", element: <KelasPage />, label: "Kelas Online", icon: <MenuBookOutlinedIcon /> },
      { path: "/nilai", element: <NilaiSiswaPage />, label: "Nilai Akademik", icon: <SchoolOutlinedIcon /> },
      { path: "/ujian", element: <UjianPage />, label: "Ujian Online", icon: <BorderColorOutlinedIcon /> },
    ],
  },
  {
    section: "dont-show",
    items: [
      { path: "/profile", element: <ProfilePage /> },
      { path: "/kelas/detail/:id", element: <DetailKelasSiswaPage /> },
      { path: "/kelas/detail/:id/module/:modulId", element: <DetailModuleSiswaPage /> },
      { path: "/ujian/detail/:idKelasTahunAjaran", element: <DetailUjianSiswaPage /> },
      { path: "/ujian/detail/:idKelasTahunAjaran/form/:idUjian", element: <FormUjianSiswaPage /> },
      // { path: "*", element: <NotFoundPage /> },
    ],
  },
];

const teacherRoutes = [
  {
    section: "General",
    items: [
      { path: "/dashboard", element: <HomePage />, label: "Pengumuman", icon: <AnnouncementOutlinedIcon /> },
    ],
  },
  {
    section: "Akademik",
    items: [
      { path: "/jadwal", element: <JadwalPage />, label: "Jadwal Mengajar", icon: <CalendarMonthOutlinedIcon /> },
      { path: "/kelas", element: <KelasPage />, label: "Kelas Online", icon: <MenuBookOutlinedIcon /> },
      { path: "/ujian", element: <UjianPage />, label: "Ujian Online", icon: <BorderColorOutlinedIcon /> },
    ],
  },
  {
    section: "dont-show",
    items: [
      { path: "/profile", element: <ProfilePage /> },
      { path: "/kelas/detail/:id", element: <DetailKelasGuruPage /> },
      { path: "/kelas/detail/:id/module/:modulId", element: <DetailModuleGuruPage /> },
      { path: "/kelas/detail/:id/presensi/:presensiId", element: <DetailPresensiGuruPage /> },
      { path: "/ujian/detail/:idKelasTahunAjaran", element: <DetailUjianGuruPage /> },
      { path: "/ujian/detail/:idKelasTahunAjaran/create", element: <FormUjianGuruPage /> },
      { path: "/ujian/detail/:idKelasTahunAjaran/edit/:idUjian", element: <FormUjianGuruPage /> },
      { path: "/ujian/detail/:idKelasTahunAjaran/periksa/:idUjian", element: <PeriksaUjianGuruPage /> },
      { path: "/ujian/detail/:idKelasTahunAjaran/periksa/:idUjian/:idUser", element: <PeriksaDetailUjianGuruPage /> },
      // { path: "*", element: <NotFoundPage /> },
    ],
  },
]; 

const adminRoutes = [
  {
    section: "General",
    items: [
      { path: "/dashboard", element: <HomePage />, label: "Pengumuman", icon: <AnnouncementOutlinedIcon /> },
      { path: "/register", element: <RegisterPage />, label: "Manajemen User", icon: <PersonAddAltOutlinedIcon /> },
    ],
  },
  {
    section: "Akademik",
    items: [
      { path: "/tahun-ajaran", element: <MasterTahunAjaranPage />, label: "Tahun Ajaran", icon: <SchoolOutlinedIcon /> },
      { path: "/kelas", element: <MasterKelasPage />, label: "Kelas", icon: <SensorDoorOutlinedIcon /> },
      { path: "/pelajaran", element: <MasterPelajaranPage />, label: "Pelajaran", icon: <MenuBookOutlinedIcon /> },
      { path: "/periode-pelajaran", element: <MasterPeriodePelajaranPage />, label: "Periode Pelajaran", icon: <EventNoteOutlinedIcon /> },
      { path: "/jadwal", element: <MasterJadwalPage />, label: "Jadwal Belajar", icon: <CalendarMonthOutlinedIcon /> },
      { path: "/kelas-siswa", element: <MasterKelasSiswaPage />, label: "Kelas Siswa", icon: <LaptopChromebookOutlinedIcon /> },
    ],
  }, 
  {
    section: "dont-show",
    items: [
      { path: "/profile", element: <ProfilePage /> },
      // { path: "*", element: <NotFoundPage /> },
    ],
  },
];

// Function to get routes by role
export function getRoutes(role) {
  if (!role) return [...loginRoutes];

  switch (role.toLowerCase()) {
    case "siswa":
      return [...studentRoutes];
    case "guru":
      return [...teacherRoutes];
    case "admin":
      return [...adminRoutes];
    default:
      return [...loginRoutes];
  }
}


