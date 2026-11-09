"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { AlertTriangle, ArrowLeft, LoaderCircle, Save, UserRound } from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`;

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(null);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let stopTimer;
    const startTimer = window.setTimeout(() => {
      if (sessionStorage.getItem("workspace_navigation") !== pathname) return;
      sessionStorage.removeItem("workspace_navigation");
      setNavigationLoading(true);
      stopTimer = window.setTimeout(() => setNavigationLoading(false), 1000);
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(stopTimer);
    };
  }, [pathname]);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("research_access_token");

    if (!token) {
      window.setTimeout(() => {
        setAuthenticated(false);
        setLoading(false);
      }, 0);
      return () => {
        active = false;
      };
    }

    axios
      .get(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (!active) return;
        setAuthenticated(true);
        setName(data.user.name);
        setEmail(data.user.email);
        localStorage.setItem("research_user", JSON.stringify(data.user));
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status === 401) {
          localStorage.removeItem("research_access_token");
          localStorage.removeItem("research_user");
          setAuthenticated(false);
          return;
        }
        setAuthenticated(true);
        setError(
          requestError.response?.data?.message ||
            "Unable to load your profile. Please try again.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const updatedName = name.trim();
    const updatedEmail = email.trim().toLowerCase();
    if (!updatedName || !updatedEmail) {
      setError("Name and email are required.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("research_access_token");
      const { data } = await axios.patch(
        apiUrl,
        { name: updatedName, email: updatedEmail },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setName("");
      setEmail("");
      localStorage.setItem("research_user", JSON.stringify(data.user));
      if (data.access_token) {
        localStorage.setItem("research_access_token", data.access_token);
      }
      setSuccess("Your profile has been updated.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      const token = localStorage.getItem("research_access_token");
      await axios.delete(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("research_user");
      localStorage.removeItem("research_access_token");
      localStorage.removeItem("research_reports");
      sessionStorage.setItem("account_deleted_toast", "Your account was deleted successfully.");
      router.replace("/");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete your account. Please try again.",
      );
      setDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="relative min-h-screen min-w-0 flex-1 px-5 py-10 md:px-10 md:py-14">
        {navigationLoading && (
          <Loader fullscreen={false} text="Loading your profile..." />
        )}
        {authenticated === false ? (
          <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-xl flex-col items-center justify-center px-6 text-center">
            <h1 className="text-3xl font-bold">Sign in to view your profile</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Your profile is available after you sign in to your account.
            </p>
            <Link href="/signin" className="primary mt-6">
              Go to Sign In
            </Link>
            <Link
              href="/signup"
              className="mt-4 text-sm font-semibold text-primary-500 hover:underline"
            >
              Create an account
            </Link>
          </div>
        ) : (
        <div className="mx-auto max-w-3xl">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-primary-500"
          >
            <ArrowLeft size={16} /> Back to dashboard
          </Link>

          <header className="mt-8">
            <p className="text-xs font-bold tracking-[.16em] text-primary-500">
              ACCOUNT SETTINGS
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Your profile
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              View and update the details associated with your account.
            </p>
          </header>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              role="status"
              className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              {success}
            </div>
          )}

          <section className="soft-card mt-8 p-6 md:p-8">
            <div className="mb-7 flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-600/15 text-primary-500">
                <UserRound size={26} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Personal information</h2>
                <p className="mt-1 text-sm text-muted">
                  Your name and email address.
                </p>
              </div>
            </div>

            {!loading && (
              <form onSubmit={handleSave} className="space-y-5">
                <label className="block text-sm font-medium">
                  Full name
                  <input
                    className="field mt-2"
                    name="name"
                    autoComplete="name"
                    maxLength={100}
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <label className="block text-sm font-medium">
                  Email address
                  <input
                    className="field mt-2"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={255}
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="primary inline-flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-red-400/25 bg-red-500/4 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle
                size={21}
                className="mt-0.5 shrink-0 text-red-400"
                aria-hidden="true"
              />
              <div className="flex-1">
                <h2 className="font-semibold text-red-300">Delete account</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Permanently delete your account and saved research reports.
                  This action cannot be undone.
                </p>
                <button
                  type="button"
                  disabled={loading || deleting}
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="mt-5 rounded-xl border border-red-400/40 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                >
                  Delete my account
                </button>
              </div>
            </div>
          </section>
        </div>
        )}
      </main>

      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-100 grid place-items-center bg-slate-950/75 px-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
            className="w-full max-w-md rounded-2xl border border-red-400/25 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 text-red-300">
              <AlertTriangle size={22} aria-hidden="true" />
              <h2 id="delete-account-title" className="text-lg font-bold">
                Delete your account?
              </h2>
            </div>
            <p
              id="delete-account-description"
              className="mt-4 text-sm leading-6 text-slate-300"
            >
              Your account and all saved reports will be permanently deleted.
              You will not be able to undo this action.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteConfirmation(false)}
                className="secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                {deleting && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                {deleting ? "Deleting..." : "Permanently delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
