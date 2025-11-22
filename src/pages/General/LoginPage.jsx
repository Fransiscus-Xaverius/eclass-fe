// src/pages/auth/LoginPage.jsx
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
} from "@mui/icons-material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";

import logo from "../../assets/images/logo.png"
import logoTarakanita from "../../assets/images/logo.png";
import bgLogin from "../../assets/images/bgLogin.jpg";

import {
  requestOtpForgotPassword,
  changePasswordWithOtp,
} from "../../services/authService";
import { ToastError, ToastSuccess } from "../../composables/sweetalert";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  // Toggle password visibility
  const [visible, setVisible] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Forgot Password states
  const [openForgotDialog, setOpenForgotDialog] = useState(false);
  const [fpUsername, setFpUsername] = useState("");
  const [fpOtp, setFpOtp] = useState(Array(6).fill(""));
  const [fpStep, setFpStep] = useState(1); // 1 = username/email, 2 = OTP
  const [loading, setLoading] = useState(false);
  const fpOtpRefs = useRef([]);

  // Methods
  const onSubmit = (data) => {
    if (data.username && data.password) {
      setLoading(true);
      onLogin(data);
      setLoading(false);
    }
  };

  const handleCloseForgotDialog = () => {
    setOpenForgotDialog(false);
    setFpUsername("");
    setFpOtp(Array(6).fill(""));
    setFpStep(1);
    setLoading(false);
  };

  const handleRequestFpOtp = async () => {
    if (!fpUsername) {
      ToastError.fire({ title: "Username atau email harus diisi!" });
      return;
    }
    try {
      setLoading(true);
      await requestOtpForgotPassword({ username: fpUsername });
      ToastSuccess.fire({ title: "OTP dikirim ke email Anda!" });
      setFpStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFpOtp = async () => {
    if (fpOtp.some((d) => d === "")) {
      ToastError.fire({ title: "OTP harus 6 digit!" });
      return;
    }
    try {
      setLoading(true);
      const body = {
        username: fpUsername,
        otp_code: fpOtp.join(""),
      };
      await changePasswordWithOtp(body);
      ToastSuccess.fire({
        title:
          "Password baru sudah dikirim ke email Anda. Silakan login kembali.",
      });
      handleCloseForgotDialog();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${bgLogin})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <Grid
        sx={{
          maxWidth: 1160,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Grid container justifyContent="center" gap={3}>
          {/* Left side (Form) */}
          <Grid xs={12} md={6} sx={{ my: 3 }}>
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Card sx={{ p: 4, borderRadius: 3, boxShadow: 6 }}>
                <Box sx={{ mb: 4, textAlign: "center" }}>
                  <img src={logo} alt="Logo " width={200} />
                </Box>

                <Typography
                  variant="h4"
                  fontWeight="bold"
                  textAlign="center"
                  gutterBottom
                >
                  Login
                </Typography>
                <Typography
                  variant="body1"
                  textAlign="center"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Masukkan username dan password anda untuk login
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Username */}
                  <Typography variant="subtitle2" color="text.secondary">
                    Username
                  </Typography>
                  <TextField
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    placeholder="Username"
                    {...register("username", {
                      required: "Username is required",
                      minLength: {
                        value: 3,
                        message: "Username must be at least 3 characters",
                      },
                    })}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircleOutlinedIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Password */}
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 3,
                        message: "Password must be at least 3 characters",
                      },
                    })}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                  >
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    type={visible ? "text" : "password"}
                    placeholder="Password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setVisible(!visible)}
                            edge="end"
                          >
                            {visible ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      inputProps: { autoComplete: "new-password" },
                    }}
                  />

                  {/* Forgot Password */}
                  <Box textAlign="right" mt={2}>
                    <Link
                      href="#"
                      underline="hover"
                      variant="caption"
                      color="primary"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenForgotDialog(true);
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>

                  {/* Login Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3, fontWeight: "bold" }}
                    type="submit"
                  >
                    Login
                  </Button>
                </form>
              </Card>
            </motion.div>
          </Grid>

          {/* Right side (Image) */}
          {/* <Grid
            md={6}
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              alignItems: "center",
              p: 3,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(5px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <motion.img
              src={logoTarakanita}
              alt="Logo"
              style={{ maxWidth: 400, maxHeight: 540 }}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </Grid> */}
        </Grid>
      </Grid>

      {/* Forgot Password Dialog */}
      <Dialog
        open={openForgotDialog}
        onClose={(e, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleCloseForgotDialog();
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        {fpStep === 1 ? (
          <>
            <DialogTitle>Lupa Password</DialogTitle>
            <DialogContent dividers>
              <TextField
                fullWidth
                label="Username atau Email"
                margin="normal"
                value={fpUsername}
                onChange={(e) => setFpUsername(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseForgotDialog} color="primary">
                Batal
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRequestFpOtp}
                loading={loading}
              >
                Send OTP
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>Verifikasi OTP</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" gutterBottom>
                Masukkan 6 digit kode OTP
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1 }}>
                {fpOtpRefs.current === undefined && (fpOtpRefs.current = Array(6).fill(null))}
                {Array.from({ length: 6 }).map((_, i) => (
                  <TextField
                    key={i}
                    id={`fp-otp-${i}`}
                    value={fpOtp[i] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      if (!val) return;
                      const newOtp = [...fpOtp];
                      newOtp[i] = val[0];
                      setFpOtp(newOtp);
                      if (i < 5 && fpOtpRefs.current[i + 1]) fpOtpRefs.current[i + 1].focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        const newOtp = [...fpOtp];
                        if (newOtp[i]) {
                          newOtp[i] = "";
                          setFpOtp(newOtp);
                        } else if (i > 0 && fpOtpRefs.current[i - 1]) {
                          fpOtpRefs.current[i - 1].focus();
                        }
                      }
                    }}
                    inputRef={(el) => (fpOtpRefs.current[i] = el)}
                    inputProps={{ maxLength: 1, style: { textAlign: "center", fontSize: "20px" } }}
                    sx={{ width: 45 }}
                  />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFpStep(1)} color="warning">
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendFpOtp}
                loading={loading}
              >
                Send
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Grid>
  );
}
