import React, { useState } from "react";
import { LogIn, UserRoundPlus, X, Sparkles } from "lucide-react";

export default function AuthModal({ mode, onClose, onSwitchMode }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");


  const handleAuth = async (e) => {
    e.preventDefault();

    if (mode === 'signup' && password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    const payload = mode === 'signup'
      ? { full_name: fullName, email, password }
      : { email, password };

    const endpoint = mode === 'signup'
      ? '/users/signup'
      : '/users/login';

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Auth failed');
        return;
      }

      // Success: do something, maybe close modal
      alert('Success!');
      onClose();
      localStorage.setItem("user_id", data.userId);
      window.dispatchEvent(new Event("userLoggedIn"));
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(3,6,12,0.82)] backdrop-blur-2xl px-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[rgba(109,141,255,0.16)] bg-[rgba(13,21,35,0.9)] p-8 shadow-[0_24px_45px_rgba(4,7,13,0.55)]">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-[rgba(109,141,255,0.18)] to-[rgba(87,214,255,0.12)] blur-2xl" aria-hidden="true" />
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full bg-[rgba(255,255,255,0.08)] p-2 text-[rgba(197,208,245,0.8)] transition hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <span className="pill text-[rgba(197,208,245,0.75)]">{mode === 'signin' ? 'Welcome back' : 'Create your space'}</span>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(109,141,255,0.16)] text-gradient">
            {mode === 'signin' ? <LogIn className="h-6 w-6" /> : <UserRoundPlus className="h-6 w-6" />}
          </div>
          <h2 className="text-2xl font-semibold md:text-3xl">
            {mode === 'signin' ? 'Log into Tasknest' : 'Start a focused workspace'}
          </h2>
          <p className="max-w-sm text-sm text-[rgba(197,208,245,0.75)]">
            {mode === 'signin'
              ? 'Pick up where you left off and keep your ideas organised.'
              : 'A unified hub for tasks, notes and your personal workflow rituals.'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleAuth}>
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-2xl border border-[rgba(109,141,255,0.2)] bg-[rgba(16,24,38,0.82)] px-4 py-3 text-sm text-white placeholder:text-[rgba(197,208,245,0.55)] focus:border-[rgba(109,141,255,0.38)] focus:outline-none" />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-[rgba(109,141,255,0.2)] bg-[rgba(16,24,38,0.82)] px-4 py-3 text-sm text-white placeholder:text-[rgba(197,208,245,0.55)] focus:border-[rgba(109,141,255,0.38)] focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-[rgba(109,141,255,0.2)] bg-[rgba(16,24,38,0.82)] px-4 py-3 text-sm text-white placeholder:text-[rgba(197,208,245,0.55)] focus:border-[rgba(109,141,255,0.38)] focus:outline-none"
          />
          {mode === 'signup' && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-2xl border border-[rgba(109,141,255,0.2)] bg-[rgba(16,24,38,0.82)] px-4 py-3 text-sm text-white placeholder:text-[rgba(197,208,245,0.55)] focus:border-[rgba(109,141,255,0.38)] focus:outline-none"
            />
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-[rgba(109,141,255,0.85)] via-[rgba(87,214,255,0.9)] to-[rgba(109,141,255,0.85)] py-3 text-sm font-semibold tracking-wide text-[rgba(4,7,13,0.9)] transition hover:opacity-95"
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-4 text-center">
          <button
            className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.08)] px-4 py-2 text-xs font-medium uppercase tracking-wide text-[rgba(197,208,245,0.8)]"
            type="button"
          >
            <Sparkles className="h-4 w-4" />
            Secure by Supabase Auth
          </button>
          <button
            onClick={onSwitchMode}
            className="text-sm font-medium text-[rgba(109,141,255,0.92)] underline-offset-4 hover:underline"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}