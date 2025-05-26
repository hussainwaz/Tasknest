import React, { useEffect, useState } from "react";
import { LogIn, UserRoundPlus, X } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
          {mode === 'signin' ? (
            <>
              <LogIn size={48} className=" mb-4 text-blue-500" />
              <h2 className="text-2xl text-blue-500 font-bold">Sign In</h2>
            </>
          ) : (
            <>
              <UserRoundPlus size={48} className="mb-4 text-green-500" />
              <h2 className="text-2xl font-bold text-green-500">Sign Up</h2>
            </>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleAuth}>
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className=" w-full p-3 bg-gray-900 text-white rounded border border-gray-700 focus:outline-none focus:border-blue-500" />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-900 text-white rounded border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-900 rounded border text-white border-gray-700 focus:outline-none focus:border-blue-500"
          />
          {mode === 'signup' && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-3 bg-gray-900 rounded border text-white border-gray-700 focus:outline-none focus:border-blue-500"
            />
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors cursor-pointer"
            onClick={() => handleAuth}
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={onSwitchMode}
            className="text-blue-400 hover:text-blue-300 underline text-sm cursor-pointer"
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