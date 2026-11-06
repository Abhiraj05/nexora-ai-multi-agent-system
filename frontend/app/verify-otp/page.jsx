"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import AuthShell from "@/components/AuthShell";
import Loader from "@/components/Loader";
import { ShieldCheck, RefreshCw, ArrowLeft } from "lucide-react";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef([]);

  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const handleNavigate = (route) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(route);
    }, 2000);
  };
  // Get email from URL or sessionStorage
  useEffect(() => {
    const queryEmail = searchParams.get("email");

    const storedEmail =
      typeof window !== "undefined"
        ? sessionStorage.getItem("reset_email")
        : "";

    setEmail(queryEmail || storedEmail || "");
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const containerVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Handle individual OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    setError("");
    setStatus("");

    // Handle multiple pasted digits
    if (value.length > 1) {
      const digits = value.slice(0, 6).split("");

      const newOtp = ["", "", "", "", "", ""];

      digits.forEach((digit, i) => {
        newOtp[i] = digit;
      });

      setOtp(newOtp);

      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();

      return;
    }

    const newOtp = [...otp];

    newOtp[index] = value;

    setOtp(newOtp);

    // Automatically focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP paste
  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(pastedData)) {
      setError("Please paste a valid 6-digit OTP.");
      return;
    }

    setError("");
    setStatus("");

    setOtp(pastedData.split(""));

    inputRefs.current[5]?.focus();
  };

  // Verify OTP
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const enteredOtp = otp.join("");

    setError("");
    setStatus("");

    if (!email) {
      setError("Email address is missing. Please try again.");
      return;
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`,
        {
          email,
          otp: enteredOtp,
        },
      );

      setStatus(response.data?.message || "OTP verified successfully!");

      const resetToken = response.data?.reset_token;

      if (resetToken) {
        sessionStorage.setItem("reset_token", resetToken);
      }

      setTimeout(() => {
        if (resetToken) {
          router.push(
            `/reset-password?token=${encodeURIComponent(resetToken)}`,
          );
        } else {
          router.push("/reset-password");
        }
      }, 800);
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message;

      setError(
        typeof detail === "string"
          ? detail
          : "Invalid or expired OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (timer > 0 || resending) return;

    if (!email) {
      setError("Email address is missing. Please try again.");
      return;
    }

    try {
      setError("");
      setStatus("");
      setResending(true);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-otp`, {
        email,
      });

      setOtp(["", "", "", "", "", ""]);
      setTimer(60);

      setStatus("A new OTP has been sent to your email.");

      inputRefs.current[0]?.focus();
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.message;

      setError(
        typeof detail === "string"
          ? detail
          : "Unable to resend OTP. Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      {loading && <Loader />}

      {!loading && (
        <AuthShell eyebrow="SEND OTP"
      >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md mx-auto"
          >
            {/* Heading */}
            <motion.div variants={itemVariants}>
              <div className="w-12 h-12 rounded-xl bg-[#eaf3f3] text-teal flex items-center justify-center mb-5">
                <ShieldCheck size={24} />
              </div>

              <span className="text-xs tracking-[.15em] font-bold text-teal">
                EMAIL VERIFICATION
              </span>

              <h1 className="text-3xl font-bold mt-3">Verify your OTP</h1>

              <p className="text-muted mt-3 leading-relaxed">
                We've sent a verification code to your email address. Enter the
                6-digit code below to continue.
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              variants={itemVariants}
              className="soft-card p-7 md:p-8 mt-8"
            >
              {/* Email */}
              <div className="text-center mb-7">
                <p className="text-sm text-muted">Verification code sent to</p>

                <p className="mt-1 text-sm font-semibold text-teal break-all">
                  {email || "Your registered email"}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* OTP Inputs */}
                <label className="mb-4 block text-center text-sm font-semibold">
                  Enter verification code
                </label>

                <div
                  className="flex justify-center gap-2 sm:gap-3"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      aria-label={`OTP digit ${index + 1}`}
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      whileFocus={{ scale: 1.05 }}
                      className={`h-12 w-10 sm:h-14 sm:w-12 rounded-xl border bg-white text-center text-lg font-semibold text-[#142625] outline-none transition-all duration-300 ${
                        digit
                          ? "border-[#44858e] ring-2 ring-[#44858e]/10"
                          : "border-[#dce6e5]"
                      } focus:border-[#44858e] focus:ring-2 focus:ring-[#44858e]/20`}
                    />
                  ))}
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="text-sm text-red-500 mt-4"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Success */}
                {status && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="status"
                    className="text-sm text-teal mt-4"
                  >
                    {status}
                  </motion.p>
                )}

                {/* Verify Button */}
                <motion.button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  className="primary mt-6 w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShieldCheck size={18} />

                  {loading ? "Verifying..." : "Verify OTP"}
                </motion.button>
              </form>

              {/* Resend OTP */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted">Didn't receive the code?</p>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={timer > 0 || resending}
                  onClick={handleResendOTP}
                  className="mt-2 inline-flex items-center justify-center gap-2 text-sm font-semibold text-teal transition-colors hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={15}
                    className={resending ? "animate-spin" : ""}
                  />

                  {resending
                    ? "Sending..."
                    : timer > 0
                      ? `Resend OTP in ${timer}s`
                      : "Resend OTP"}
                </motion.button>
              </div>

              {/* Back to Forgot Password */}
              <motion.div
                variants={itemVariants}
                className="mt-7 border-t border-[#e5eeee] pt-6 text-center"
              >
                <button
                  onClick={() => handleNavigate("/forgot-password")}
                  className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-teal font-medium"
                >
                  <ArrowLeft size={16} />
                  Back to Forgot Password
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </AuthShell>
      )}
    </>
  );
}

export default function VerifyOTP() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
