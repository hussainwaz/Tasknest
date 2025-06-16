import React, { useState, useEffect } from "react";
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
        { name: "Profile", action: () => {} },
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

  // Change Password View
  if (currentView === "changePassword") {
    return (
      <div className="relative w-full h-full bg-black text-[#fffbfeff] flex flex-col">
        <div className="bg-[#121212] rounded-2xl flex-1 mx-1 mb-3 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-800 flex items-center">
            <button 
              onClick={() => setCurrentView("main")}
              className="mr-4 text-gray-400 hover:text-white"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Change Password</h1>
              <p className="text-gray-400 mt-1">Update your account password</p>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-900/50 text-green-300 rounded-lg">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "about") {
    return (
      <div className="relative w-full h-full bg-black text-[#fffbfeff] flex flex-col">
        <div className="bg-[#121212] rounded-2xl flex-1 mx-1 mb-3 overflow-hidden flex flex-col">
          {/* Header with back button */}
          <div className="p-6 border-b border-gray-800 flex items-center">
            <button 
              onClick={() => setCurrentView("main")}
              className="mr-4 text-gray-400 hover:text-white"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">About Taskify</h1>
              <p className="text-gray-400 mt-1">Learn more about our application</p>
            </div>
          </div>

          {/* About Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Welcome to Taskify</h2>
              <p className="text-gray-300">
                Taskify is a modern task management application designed to help you organize your work and personal life.
              </p>
              
              <h3 className="text-lg font-medium mt-4">Features</h3>
              <ul className="list-disc pl-5 text-gray-300 space-y-2">
                <li>Intuitive task creation and organization</li>
                <li>Priority and deadline management</li>
                <li>Cross-platform synchronization</li>
                <li>Secure cloud backup</li>
                <li>Collaboration tools for teams</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Version</h3>
              <p className="text-gray-300">1.0.0</p>

              <h3 className="text-lg font-medium mt-4">Development Team</h3>
              <p className="text-gray-300">
                Taskify is developed by a passionate team of developers dedicated to creating productivity tools that make a difference.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "contact") {
    return (
      <div className="relative w-full h-full bg-black text-[#fffbfeff] flex flex-col">
        <div className="bg-[#121212] rounded-2xl flex-1 mx-1 mb-3 overflow-hidden flex flex-col">
          {/* Header with back button */}
          <div className="p-6 border-b border-gray-800 flex items-center">
            <button 
              onClick={() => setCurrentView("main")}
              className="mr-4 text-gray-400 hover:text-white"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Contact Us</h1>
              <p className="text-gray-400 mt-1">Get in touch with our support team</p>
            </div>
          </div>

          {/* Contact Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">We're Here to Help</h2>
              <p className="text-gray-300">
                Have questions or feedback? Reach out to our support team through any of the channels below.
              </p>
              
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-medium">Email Support</h3>
                  <p className="text-gray-300">support@taskify.com</p>
                </div>

                <div>
                  <h3 className="font-medium">Community Forum</h3>
                  <p className="text-gray-300">community.taskify.com</p>
                </div>

                <div>
                  <h3 className="font-medium">Twitter</h3>
                  <p className="text-gray-300">@TaskifyApp</p>
                </div>

                <div>
                  <h3 className="font-medium">Office Address</h3>
                  <p className="text-gray-300">
                    Taskify Inc.<br />
                    123 Productivity Lane<br />
                    San Francisco, CA 94107<br />
                    United States
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-medium">Business Hours</h3>
                <p className="text-gray-300">
                  Monday - Friday: 9:00 AM to 5:00 PM PST<br />
                  Weekends: Closed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

 // Main settings view
  return (
    <div className="relative w-full h-full bg-black text-[#fffbfeff] flex flex-col">
      <div className="bg-[#121212] rounded-2xl flex-1 mx-1 mb-3 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account preferences</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {settingsSections.map((section, index) => (
            <div key={index} className="border-b border-gray-800 last:border-0">
              <div className="px-6 py-4 flex items-center">
                <div className="text-blue-400 mr-3">
                  {section.icon}
                </div>
                <h2 className="text-lg font-medium">{section.title}</h2>
              </div>

              <div className="pb-2">
                {section.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex}
                    className={`px-6 py-3 flex items-center justify-between hover:bg-gray-800/50 cursor-pointer transition-colors ${item.danger ? "text-red-400 hover:text-red-300" : ""}`}
                    onClick={item.action}
                  >
                    <div className="flex items-center">
                      {item.icon && (
                        <div className="mr-3 text-gray-400">
                          {item.icon}
                        </div>
                      )}
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={() => setAuthMode(mode => mode === 'signin' ? 'signup' : 'signin')}
        />
      )}
    </div>
  );
}