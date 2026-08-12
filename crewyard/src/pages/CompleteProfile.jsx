/**
 * CompleteProfile.jsx
 *
 * Shown once after first login when a user has no github_username set.
 * Collects: full name, college, year, major, GitHub username.
 * Saves via db.js updateProfile(), then navigates into the app.
 */

import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../data/db";

const YEAR_OPTIONS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
  { value: "5", label: "5th Year" },
  { value: "pg1", label: "PG 1st Year" },
  { value: "pg2", label: "PG 2nd Year" },
];

// ─────────────────────────────────────────────────────────────
//  Shared input style helper
// ─────────────────────────────────────────────────────────────
const INPUT_BASE =
  "font-sans text-sm text-cy-ink bg-cy-bg px-4 py-3 w-full";

function Field({ label, htmlFor, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10px] tracking-[0.14em] uppercase text-cy-muted"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="font-mono text-[10px] text-cy-orange tracking-[0.06em]">
          ↑ {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CompleteProfile page
// ─────────────────────────────────────────────────────────────
export default function CompleteProfile() {
  const { user, profile, refreshProfile, loading, needsProfileSetup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:           profile?.name          ?? "",
    college:        profile?.college       ?? "",
    year:           profile?.year          ?? "",
    major:          profile?.major         ?? "",
    githubUsername: profile?.githubUsername ?? "",
  });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverErr,  setServerErr]  = useState("");

  // Route guards
  if (loading) {
    return (
      <div className="min-h-screen bg-cy-bg flex items-center justify-center">
        <p className="font-mono text-xs text-cy-muted">Loading profile...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  if (!needsProfileSetup) return <Navigate to="/board" replace />;

  function set(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
      setServerErr("");
    };
  }

  function validate() {
    const next = {};
    if (!form.name.trim())           next.name           = "Full name is required.";
    if (!form.college.trim())        next.college        = "College is required.";
    if (!form.year)                  next.year           = "Year is required.";
    if (!form.major.trim())          next.major          = "Major / department is required.";
    if (!form.githubUsername.trim()) next.githubUsername = "GitHub username is required.";
    else if (form.githubUsername.includes(" "))
      next.githubUsername = "GitHub username cannot contain spaces.";
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setServerErr("");
    try {
      await updateProfile({
        name:           form.name.trim(),
        college:        form.college.trim(),
        year:           form.year,
        major:          form.major.trim(),
        githubUsername: form.githubUsername.trim().replace(/^@/, ""),
      });
      await refreshProfile(); // pull updated profile into AuthContext
      navigate("/board", { replace: true });
    } catch (err) {
      setServerErr(err.message ?? "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  // Border focus handlers for brutalist inputs
  function onFocus(e)  { e.target.style.borderColor = "#E8542A"; }
  function onBlur(e, hasError) {
    e.target.style.borderColor = hasError ? "#E8542A" : "#111111";
  }

  const borderStyle = (hasError) => ({
    border: hasError ? "1.5px solid #E8542A" : "1.5px solid #111111",
    borderRadius: 0,
    outline: "none",
  });

  return (
    <div className="min-h-screen bg-cy-bg flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-8">
          {/* Wordmark */}
          <p className="font-display font-bold text-2xl text-cy-ink leading-none mb-6">
            CrewYard<span style={{ color: "#E8542A" }}>.</span>
          </p>
          <h1
            className="font-display font-black text-cy-ink leading-tight mb-2"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
          >
            Complete your profile
          </h1>
          <p className="font-sans text-sm text-cy-muted">
            Just a few details to connect you with the right builders.
            Your GitHub username proves you build real things.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6"
        >

          {/* Full Name */}
          <Field label="Full name" htmlFor="cp-name" error={errors.name}>
            <input
              id="cp-name"
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Prakhar Jaiswal"
              className={INPUT_BASE}
              style={borderStyle(!!errors.name)}
              onFocus={onFocus}
              onBlur={(e) => onBlur(e, !!errors.name)}
              autoFocus
            />
          </Field>

          {/* College */}
          <Field label="College / University" htmlFor="cp-college" error={errors.college}>
            <input
              id="cp-college"
              type="text"
              value={form.college}
              onChange={set("college")}
              placeholder="e.g. NIT Trichy"
              className={INPUT_BASE}
              style={borderStyle(!!errors.college)}
              onFocus={onFocus}
              onBlur={(e) => onBlur(e, !!errors.college)}
            />
          </Field>

          {/* Year + Major — side by side on ≥sm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Year" htmlFor="cp-year" error={errors.year}>
              <select
                id="cp-year"
                value={form.year}
                onChange={set("year")}
                className={INPUT_BASE + " cursor-pointer"}
                style={borderStyle(!!errors.year)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, !!errors.year)}
              >
                <option value="" disabled>Select year…</option>
                {YEAR_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>

            <Field label="Major / Department" htmlFor="cp-major" error={errors.major}>
              <input
                id="cp-major"
                type="text"
                value={form.major}
                onChange={set("major")}
                placeholder="e.g. Computer Science"
                className={INPUT_BASE}
                style={borderStyle(!!errors.major)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, !!errors.major)}
              />
            </Field>
          </div>

          {/* GitHub Username */}
          <Field
            label="GitHub Username"
            htmlFor="cp-github"
            error={errors.githubUsername}
          >
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2
                           font-mono text-sm text-cy-muted pointer-events-none"
              >
                @
              </span>
              <input
                id="cp-github"
                type="text"
                value={form.githubUsername}
                onChange={set("githubUsername")}
                placeholder="your-handle"
                className={INPUT_BASE + " pl-8"}
                style={borderStyle(!!errors.githubUsername)}
                onFocus={onFocus}
                onBlur={(e) => onBlur(e, !!errors.githubUsername)}
              />
            </div>
            <p className="font-mono text-[10px] text-cy-muted tracking-[0.04em]">
              Used to verify your commits. We only read public data.
            </p>
          </Field>

          {/* Server error */}
          {serverErr && (
            <p
              role="alert"
              className="font-mono text-[11px] text-cy-orange tracking-[0.06em]"
            >
              {serverErr}
            </p>
          )}

          {/* Submit */}
          <button
            id="complete-profile-submit-btn"
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center gap-3 w-fit
                       font-mono text-xs font-bold tracking-[0.08em] uppercase
                       disabled:opacity-40 mt-2"
          >
            {submitting ? "Saving…" : "Enter CrewYard"}
            {!submitting && <ArrowRight size={14} strokeWidth={2.5} />}
          </button>
        </form>
      </div>
    </div>
  );
}
