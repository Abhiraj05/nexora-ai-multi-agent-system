"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { LockKeyhole, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import Loader from "@/components/Loader";

export default function ResetPassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
 const [loading, setLoading] = useState(false);
  const handleNavigate = (route) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(route);
    }, 2000);
  };
  // Animation variants
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
      transition: { duration: 0.5 },
    },
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password") {
      setPassword(value);
    } else if (name === "confirm") {
      setConfirm(value);
    }

    setError("");
  };

  // Handle password reset
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const email = sessionStorage.getItem("reset_email");
      const resetToken = sessionStorage.getItem("reset_token");

      if (!email || !resetToken) {
        throw new Error(
          "Session expired. Please verify your email again."
        );
      }

      const response = await axios.post(
        "/api/auth/reset-password",
        {
          email,
          reset_token: resetToken,
          new_password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        sessionStorage.removeItem("reset_email");
        sessionStorage.removeItem("reset_token");

        router.push("/signin");
      }

    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to update password. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
     <>
      {loading && <Loader />}

      {!loading && (
    <AuthShell
      eyebrow="SECURE YOUR ACCOUNT"
      title="Set new password"
      description="Choose a strong new password to secure your account."
    >
      <motion.form
        onSubmit={handleSubmit}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >

        {/* New Password */}
        <motion.label
          variants={itemVariants}
          className="block text-sm font-semibold"
        >
          New password

          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="field pr-12"
              placeholder="At least 8 characters"
              value={password}
              onChange={handleChange}
              minLength={8}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#829492] transition hover:text-[#44858e]"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </motion.label>

        {/* Confirm Password */}
        <motion.label
          variants={itemVariants}
          className="block text-sm font-semibold"
        >
          Confirm new password

          <div className="relative mt-2">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirm"
              className="field pr-12"
              placeholder="Confirm your password"
              value={confirm}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#829492] transition hover:text-[#44858e]"
            >
              {showConfirm ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </motion.label>

        {/* Password Match Indicator */}
        {confirm.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 text-xs font-medium ${
              password === confirm
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            <CheckCircle2 size={15} />

            {password === confirm
              ? "Passwords match"
              : "Passwords do not match"}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={busy}
          className="primary w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Updating Password...
            </>
          ) : (
            <>
              <LockKeyhole size={17} />
              Update Password
            </>
          )}
        </motion.button>

      </motion.form>
    </AuthShell> )}
    </>
  );
}