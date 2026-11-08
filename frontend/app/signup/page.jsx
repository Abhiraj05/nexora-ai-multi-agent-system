"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import AuthShell from "@/components/AuthShell";
import Loader from "@/components/Loader";
import Toast from "@/components/Toast";
import { ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

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

  const handleNavigate = (route) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(route);
    }, 2000);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      setName(value);
    } else if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }

    setError("");
  };

  // Handle signup submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setBusy(true);

    try {
      await axios.post(
        "/api/auth/signup",
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setPassword("");
      setAccountCreated(true);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to create account. Please try again.",
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

      {accountCreated && (
        <div
          className="fixed inset-0 z-10000 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm"
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-success-title"
            aria-describedby="signup-success-description"
            className="w-full max-w-md rounded-2xl border border-primary-500/25 bg-slate-900 p-7 text-center shadow-2xl shadow-black/40"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600/15 text-primary-500">
              <CheckCircle2 size={30} aria-hidden="true" />
            </div>
            <h2
              id="signup-success-title"
              className="mt-5 text-xl font-bold text-slate-100"
            >
              Account created
            </h2>
            <p
              id="signup-success-description"
              className="mt-2 text-sm leading-6 text-slate-300"
            >
              Your account is ready. Sign in to continue.
            </p>
            <button
              type="button"
              onClick={() => router.replace("/signin")}
              className="primary mt-6 inline-flex w-full items-center justify-center gap-2"
            >
              Go to Sign In
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </motion.div>
        </div>
      )}

      {loading && <Loader />}

      {!loading && (
        <AuthShell
          eyebrow="JOIN RESEARCH AGENT"
          title="Create an account"
          description="Start turning research topics into structured reports."
        >
          <motion.form
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {/* Full Name */}
            <motion.label
              variants={itemVariants}
              className="block text-sm font-semibold"
            >
              Full name
              <div className="relative mt-2">
                <input
                  name="name"
                  className="field pl-11"
                  value={name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>
            </motion.label>

            {/* Email */}
            <motion.label
              variants={itemVariants}
              className="block text-sm font-semibold"
            >
              Email address
              <div className="relative mt-2">
                <input
                  name="email"
                  type="email"
                  className="field pl-11"
                  value={email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>
            </motion.label>

            {/* Password */}
            <motion.label
              variants={itemVariants}
              className="block text-sm font-semibold"
            >
              Password
              <div className="relative mt-2">
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  className="field pl-11 pr-12"
                  value={password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  minLength={8}
                />

                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-teal"
                >
                  {show ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </motion.label>

            {/* Signup Button */}
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
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </motion.button>

            {/* Signin Link */}
            <motion.p
              variants={itemVariants}
              className="text-sm text-center text-muted"
            >
              Already have an account?{" "}
              <button
                className="text-teal font-semibold hover:underline"
                onClick={() => handleNavigate("/signin")}
              >
                Sign in
              </button>
            </motion.p>
          </motion.form>
        </AuthShell>
      )}
    </>
  );
}
