"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getReports } from "@/lib/store";
import { MessageSquare, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";

export default function Feedback() {
  const router = useRouter();
  const [reports, setReports] = useState([]),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const handleNavigate = (route) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(route);
    }, 2000);
  };
  useEffect(() => setReports(getReports()), []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") setName(value);
    if (name === "email") setEmail(value);
    if (name === "message") setMessage(value);
  };

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setStatus("");

    try {
      const response = await axios.post("/api/feedback", {
        name,
        email,
        message,
      });

      if (response.status === 200 || response.status === 201) {
        setStatus("Feedback sent successfully!");
        setMessage("");
      }
    } catch (err) {
      setStatus(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Unable to send feedback",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {loading && <Loader />}

      {!loading && (
        <>
          <Navbar handleNavigate={handleNavigate} />
          <div className="min-h-screen md:flex mt-20">
            <main className="flex-1 px-5 py-16">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-[610px] mx-auto"
              >
                <motion.span
                  variants={itemVariants}
                  className="inline-flex items-center gap-2 bg-[#eaf3f3] text-teal rounded-full px-3 py-1 text-xs font-bold"
                >
                  <MessageSquare size={14} /> WE'D LOVE TO HEAR FROM YOU
                </motion.span>

                <motion.h1
                  variants={itemVariants}
                  className="text-4xl font-bold mt-5"
                >
                  Share your feedback
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="text-muted mt-3 mb-9"
                >
                  Have a suggestion, question, or idea? Send us a message.
                </motion.p>

                <motion.form
                  onSubmit={submit}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.3 }}
                  className="soft-card p-7 md:p-9 space-y-5"
                >
                  <motion.label
                    variants={itemVariants}
                    className="block text-sm font-semibold"
                  >
                    Your name
                    <input
                      name="name"
                      className="field mt-2"
                      value={name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                    />
                  </motion.label>

                  <motion.label
                    variants={itemVariants}
                    className="block text-sm font-semibold"
                  >
                    Email address
                    <input
                      name="email"
                      type="email"
                      className="field mt-2"
                      value={email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                    />
                  </motion.label>

                  <motion.label
                    variants={itemVariants}
                    className="block text-sm font-semibold"
                  >
                    Message
                    <textarea
                      name="message"
                      className="field mt-2 min-h-[160px] resize-y"
                      value={message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us what you think..."
                    />
                  </motion.label>

                  {status && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="status"
                      className="text-sm text-teal"
                    >
                      {status}
                    </motion.p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="primary w-full flex items-center justify-center gap-2"
                    disabled={busy}
                  >
                    <Send size={17} />
                    {busy ? "Sending..." : "Send Feedback"}
                  </motion.button>
                </motion.form>
              </motion.div>
            </main>
          </div>
          <Footer handleNavigate={handleNavigate} />{" "}
        </>
      )}
    </>
  );
}
