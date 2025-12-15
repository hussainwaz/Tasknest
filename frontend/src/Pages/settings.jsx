import React, { useState } from "react";
import { User, Mail, HelpCircle, LogOut, ChevronRight, Lock, LogIn, UserRoundPlus } from "lucide-react";
import { useData } from "../DataContext";
import AuthModal from "../Components/AuthModal";

export default function Settings() {
  const [currentView, setCurrentView] = useState("main");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin');

  const { userId, isGuest, setIsGuest, setUserId } = useData();

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/resetpassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "An error occurred while changing password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    setUserId(null);
    setIsGuest(true);
    window.dispatchEvent(new Event("userLoggedOut"));
    setCurrentView("main");
  };

  const settingsSections = [
    {
      title: "Account",
      icon: <User className="h-5 w-5" />,
      items: isGuest ? [
        {
          name: "Login",
          action: () => handleAuthClick('signin'),
          icon: <LogIn className="h-5 w-5" />
        },
        {
          name: "Sign Up",
          action: () => handleAuthClick('signup'),
          icon: <UserRoundPlus className="h-5 w-5" />
        }
      ] : [
        { name: "Profile", action: () => { } },
        {
          name: "Change Password",
          action: () => setCurrentView("changePassword"),
          icon: <Lock className="h-5 w-5" />
        },
      ]
    },
    {
      title: "Support",
      icon: <HelpCircle className="h-5 w-5" />,
      items: [
        {
          name: "Contact Us",
          action: () => setCurrentView("contact"),
          icon: <Mail className="h-5 w-5" />
        },
        {
          name: "About Taskify",
          action: () => setCurrentView("about"),
          icon: <HelpCircle className="h-5 w-5" />
        }
      ]
    },
    ...(!isGuest ? [{
      title: "Session",
      icon: <LogOut className="h-5 w-5" />,
      items: [
        {
          name: "Sign Out",
          action: handleLogout,
          danger: true
        }
      ]
    }] : [])
  ];

  const Shell = ({ title, subtitle, onBack, children }) => (
    <section className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_15%,rgba(109,141,255,0.16),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(87,214,255,0.12),transparent_60%)]" />
      </div>

      <div className="relative h-full w-full overflow-y-auto custom-scrollbar px-[10px] py-4">
        <div className="surface-blur overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.04)]">
          <div className="flex items-center gap-4 border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[rgba(197,208,245,0.85)] transition hover:border-[rgba(255,255,255,0.16)]"
                aria-label="Back"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
              </button>
            )}

            <div>
              <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-[rgba(197,208,245,0.68)]">{subtitle}</p>}
            </div>
          </div>

          <div className="px-4 py-4">{children}</div>
        </div>
      </div>
    </section>
  );

  // Change Password View
  if (currentView === "changePassword") {
    return (
      <Shell
        title="Change password"
        subtitle="Update your account password"
        onBack={() => setCurrentView("main")}
      >
        {error && (
          <div className="mb-4 rounded-2xl border border-[rgba(255,107,107,0.25)] bg-[rgba(255,107,107,0.12)] p-3 text-[rgba(255,107,107,0.92)]">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-2xl border border-[rgba(125,216,125,0.25)] bg-[rgba(125,216,125,0.12)] p-3 text-[rgba(125,216,125,0.92)]">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-[rgba(197,208,245,0.7)]">Current password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-white placeholder:text-[rgba(197,208,245,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(109,141,255,0.35)]"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[rgba(197,208,245,0.7)]">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-white placeholder:text-[rgba(197,208,245,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(109,141,255,0.35)]"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[rgba(197,208,245,0.7)]">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-white placeholder:text-[rgba(197,208,245,0.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(109,141,255,0.35)]"
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={isLoading}
            className="w-full rounded-full bg-gradient-to-r from-[rgba(109,141,255,0.85)] to-[rgba(87,214,255,0.85)] px-5 py-2 text-sm font-semibold text-[rgba(4,7,13,0.85)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </Shell>
    );
  }

  if (currentView === "about") {
    return (
      <Shell
        title="About Tasknest"
        subtitle="Learn more about the app"
        onBack={() => setCurrentView("main")}
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Welcome to Tasknest</h2>
          <p className="text-sm text-[rgba(197,208,245,0.78)]">
            Tasknest is a modern task and notes workspace designed to help you organise your work and personal life.
          </p>

          <h3 className="mt-5 text-sm font-semibold text-white">Features</h3>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[rgba(197,208,245,0.78)]">
            <li>Intuitive task creation and organization</li>
            <li>Priority and deadline management</li>
            <li>Cross-platform synchronization</li>
            <li>Secure cloud backup</li>
            <li>Fast capture for notes and ideas</li>
          </ul>

          <h3 className="mt-5 text-sm font-semibold text-white">Version</h3>
          <p className="text-sm text-[rgba(197,208,245,0.78)]">1.0.0</p>

          <h3 className="mt-5 text-sm font-semibold text-white">Team</h3>
          <p className="text-sm text-[rgba(197,208,245,0.78)]">
            Tasknest is built by a small team focused on calm, high-signal productivity.
          </p>
        </div>
      </Shell>
    );
  }

  if (currentView === "contact") {
    return (
      <Shell
        title="Contact"
        subtitle="Get in touch with support"
        onBack={() => setCurrentView("main")}
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">We’re here to help</h2>
          <p className="text-sm text-[rgba(197,208,245,0.78)]">
            Have questions or feedback? Reach out to our support team through any of the channels below.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Email</h3>
              <p className="text-sm text-[rgba(197,208,245,0.78)]">support@tasknest.com</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Community</h3>
              <p className="text-sm text-[rgba(197,208,245,0.78)]">community.tasknest.com</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Social</h3>
              <p className="text-sm text-[rgba(197,208,245,0.78)]">@TasknestApp</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">Office</h3>
              <p className="text-sm text-[rgba(197,208,245,0.78)]">
                Tasknest Inc.<br />
                123 Productivity Lane<br />
                San Francisco, CA 94107<br />
                United States
              </p>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-semibold text-white">Business hours</h3>
            <p className="text-sm text-[rgba(197,208,245,0.78)]">
              Monday - Friday: 9:00 AM to 5:00 PM PST<br />
              Weekends: Closed
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  // Main settings view
  return (
    <Shell title="Settings" subtitle="Manage your account and preferences">
      <div className="space-y-6">
        {settingsSections.map((section, index) => (
          <div key={index} className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]">
            <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-4 py-4">
              <div className="text-[rgba(109,141,255,0.9)]">
                {section.icon}
              </div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[rgba(197,208,245,0.78)]">{section.title}</h2>
            </div>

            <div className="p-2">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  type="button"
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-[rgba(255,255,255,0.04)] ${item.danger ? "text-[rgba(255,107,107,0.92)]" : "text-white"}`}
                  onClick={item.action}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && (
                      <div className="text-[rgba(197,208,245,0.7)]">
                        {item.icon}
                      </div>
                    )}
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[rgba(197,208,245,0.6)]" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={() => setAuthMode(mode => mode === 'signin' ? 'signup' : 'signin')}
        />
      )}
    </Shell>
  );
}