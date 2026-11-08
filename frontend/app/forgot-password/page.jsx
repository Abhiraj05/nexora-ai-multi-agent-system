"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { ArrowLeft, Send } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import Loader from "@/components/Loader";
import Toast from "@/components/Toast";

export default function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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
    setEmail(e.target.value);
    setError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setBusy(true);

    try {
      const response = await axios.post(
        "/api/auth/forgot-password",
        {
          email: normalizedEmail,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        sessionStorage.setItem("reset_email", normalizedEmail);

        // Clear any previous OTP
        sessionStorage.removeItem("reset_otp");

        router.push("/verify-otp");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to send verification code. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Toast
        message={error}
        type="error"
        show={!!error}
        onClose={() => setError("")}
      />

      {loading && <Loader />}

      {!loading && (
        <AuthShell
          eyebrow="ACCOUNT RECOVERY"
          title="Reset your password"
          description="Enter your registered email address to receive a verification code."
        >
          <motion.form
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {/* Email Input */}
            <motion.label
              variants={itemVariants}
              className="block text-sm font-semibold"
            >
              Email address
              <div className="relative mt-2">
                <input
                  type="email"
                  name="email"
                  className="field pl-11"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleChange}
                />
              </div>
            </motion.label>

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
                  Sending...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Send Reset Email
                </>
              )}
            </motion.button>

            {/* Back to Signin */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <button
                onClick={() => handleNavigate("/signin")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal transition hover:underline"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </button>
            </motion.div>
          </motion.form>
        </AuthShell>
      )}
    </>
  );
}
