"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import AuthShell from "@/components/AuthShell";
import Loader from "@/components/Loader";
import Toast from "@/components/Toast";
import { setUser } from "@/lib/store";
import { Eye, EyeOff } from "lucide-react";

export default function Signin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
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
    const { name, value } = e.target;

    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }

    setError("");
  };

  // Handle signin submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setBusy(true);

    try {
      const response = await axios.post(
        "/api/auth/signin",
        {
          email: normalizedEmail,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data;

      setUser(
        data.user || {
          name: normalizedEmail.split("@")[0],
          email: normalizedEmail,
        },
        data.access_token,
      );

      router.push("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid email or password. Please try again.",
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
          eyebrow="WELCOME BACK"
          title="Sign in to your account"
          description="Continue exploring your reports and discoveries."
        >
          <motion.form
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
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
                  placeholder="Enter your password"
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

            {/* Forgot Password */}
            <motion.div variants={itemVariants} className="text-right">
              <button
                className="text-sm text-teal hover:underline"
                onClick={() => handleNavigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </motion.div>

            {/* Signin Button */}
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
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </motion.button>

            {/* Signup Link */}
            <motion.p
              variants={itemVariants}
              className="text-sm text-center text-muted"
            >
              New to Nexora?{" "}
              <button
                className="text-teal font-semibold hover:underline"
                onClick={() => handleNavigate("/signup")}
              >
                Create an account
              </button>
            </motion.p>
          </motion.form>
        </AuthShell>
      )}
    </>
  );
}
