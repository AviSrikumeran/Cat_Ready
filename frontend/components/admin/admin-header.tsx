"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Settings, User, FileText } from "lucide-react";

const fakeNotifications = [
  { id: "1", title: "Inspection completed", body: "D6 Dozer #472 — PASS", time: "2 min ago", unread: true },
  { id: "2", title: "Machine needs attention", body: "320 Excavator #1138 — MONITOR", time: "1 hour ago", unread: true },
  { id: "3", title: "Daily report ready", body: "Site A summary for Feb 28", time: "3 hours ago", unread: false },
];

const fakeSettingsItems = [
  { icon: User, label: "Profile" },
  { icon: Bell, label: "Notification preferences" },
  { icon: FileText, label: "Report settings" },
];

export function AdminHeader() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotificationsOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-[#0f0f0f] border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/cat-logo.jpg"
                alt="CAT"
                width={40}
                height={40}
                className="invert"
              />
              <div className="hidden sm:block">
                <span className="text-white font-bold text-lg">CAT</span>
                <span className="text-cat-yellow font-bold text-lg ml-1">Ready</span>
              </div>
            </Link>
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <span className="text-white/60 text-sm hidden sm:block">Field Manager Dashboard</span>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => { setNotificationsOpen((o) => !o); setSettingsOpen(false); }}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-white/70" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-cat-red rounded-full" />
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-[#2a2a2a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-white/5 flex items-center justify-between">
                    <span className="font-semibold text-white">Notifications</span>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-cat-yellow text-xs font-medium hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {fakeNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 hover:bg-white/5 border-b border-white/5 last:border-0 ${n.unread ? "bg-white/5" : ""}`}
                      >
                        <p className="text-white text-sm font-medium">{n.title}</p>
                        <p className="text-white/60 text-xs mt-0.5">{n.body}</p>
                        <p className="text-white/40 text-xs mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-white/5">
                    <button
                      type="button"
                      className="w-full py-2 text-cat-yellow text-sm font-medium hover:bg-white/5 rounded-lg"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                onClick={() => { setSettingsOpen((o) => !o); setNotificationsOpen(false); }}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5 text-white/70" />
              </button>
              {settingsOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-[#2a2a2a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-2 border-b border-white/5">
                    <span className="text-white/60 text-xs font-medium px-2">Settings</span>
                  </div>
                  <div className="p-1">
                    {fakeSettingsItems.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/90 text-sm hover:bg-white/10 transition-colors text-left"
                      >
                        <item.icon className="h-4 w-4 text-white/50" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="p-1 border-t border-white/5">
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/90 text-sm hover:bg-white/10 transition-colors text-left"
                    >
                      <User className="h-4 w-4 text-white/50" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-cat-yellow flex items-center justify-center">
                <User className="h-4 w-4 text-cat-black" />
              </div>
              <span className="text-white text-sm hidden md:block">Field Manager</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
