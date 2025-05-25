import React, { useState } from "react";
import {  User, Mail,  HelpCircle,  LogOut, ChevronRight } from "lucide-react";

export default function Settings() {
  const settingsSections = [
    {
      title: "Account",
      icon: <User className="h-5 w-5" />,
      items: [
        { name: "Profile", action: () => {} },
        { name: "Change Password", action: () => {} },
      ]
    },
    {
      title: "Support",
      icon: <HelpCircle className="h-5 w-5" />,
      items: [
        { name: "Contact Us", action: () => {}, icon: <Mail className="h-5 w-5" /> },
        { name: "About Taskify", action: () => {} }
      ]
    },
    {
      title: "Session",
      icon: <LogOut className="h-5 w-5" />,
      items: [
        { name: "Sign Out", action: () => {}, danger: true }
      ]
    }
  ];

  return (
    <div className="relative w-full h-full bg-black text-[#fffbfeff] flex flex-col">
      <div className="bg-[#121212] rounded-2xl flex-1 mx-1 mb-3 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account preferences</p>
        </div>

        {/* Settings Content */}
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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}