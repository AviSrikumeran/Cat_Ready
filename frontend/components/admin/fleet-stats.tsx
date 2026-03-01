"use client";

import { Truck, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";

const stats = [
  {
    label: "Total Machines",
    value: "24",
    icon: Truck,
    color: "bg-white/10",
    textColor: "text-white",
  },
  {
    label: "Passing",
    value: "18",
    subtext: "75%",
    icon: CheckCircle,
    color: "bg-green-500/20",
    textColor: "text-green-400",
  },
  {
    label: "Monitor",
    value: "4",
    subtext: "17%",
    icon: AlertTriangle,
    color: "bg-cat-yellow/20",
    textColor: "text-cat-yellow",
  },
  {
    label: "Failed",
    value: "2",
    subtext: "8%",
    icon: XCircle,
    color: "bg-cat-red/20",
    textColor: "text-cat-red",
  },
  {
    label: "Pending",
    value: "3",
    subtext: "Awaiting",
    icon: Clock,
    color: "bg-white/10",
    textColor: "text-white/70",
  },
];

export function FleetStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#2a2a2a] rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl ${stat.color}`}>
              <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
            </div>
            {stat.subtext && (
              <span className={`text-sm font-medium ${stat.textColor}`}>
                {stat.subtext}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <p className={`text-3xl font-black ${stat.textColor}`}>{stat.value}</p>
            <p className="text-sm text-white/50">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
