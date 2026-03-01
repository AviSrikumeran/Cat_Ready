"use client";

import { CheckCircle, AlertTriangle, XCircle, Clock, User } from "lucide-react";

type InspectionStatus = "PASS" | "MONITOR" | "FAIL";

interface Inspection {
  id: string;
  machine: string;
  operator: string;
  status: InspectionStatus;
  timestamp: string;
  findings: string;
}

const recentInspections: Inspection[] = [
  { id: "1", machine: "777 Truck #156", operator: "James Lee", status: "PASS", timestamp: "2026-02-27 14:32", findings: "All systems operational. Minor wear on tracks noted." },
  { id: "2", machine: "320 Excavator #1138", operator: "Sarah Chen", status: "MONITOR", timestamp: "2026-02-27 11:15", findings: "Hydraulic pressure slightly below optimal. Schedule maintenance." },
  { id: "3", machine: "D6 Dozer #472", operator: "Mike Johnson", status: "PASS", timestamp: "2026-02-26 16:45", findings: "Engine running smoothly. Fluid levels nominal." },
  { id: "4", machine: "140 Grader #234", operator: "Tom Wilson", status: "FAIL", timestamp: "2026-02-24 09:20", findings: "Brake system requires immediate attention. Do not operate." },
  { id: "5", machine: "CS56 Compactor #89", operator: "Anna Park", status: "MONITOR", timestamp: "2026-02-23 13:50", findings: "Vibration system intermittent. Needs diagnostic check." },
];

const statusConfig: Record<InspectionStatus, { icon: typeof CheckCircle; color: string; bg: string }> = {
  PASS: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/20" },
  MONITOR: { icon: AlertTriangle, color: "text-cat-yellow", bg: "bg-cat-yellow/20" },
  FAIL: { icon: XCircle, color: "text-cat-red", bg: "bg-cat-red/20" },
};

export function RecentInspections() {
  return (
    <div className="bg-[#2a2a2a] rounded-2xl border border-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">Recent Inspections</h3>
        <button className="text-cat-yellow text-sm font-medium hover:underline">View All</button>
      </div>
      <div className="divide-y divide-white/5">
        {recentInspections.map((inspection) => {
          const status = statusConfig[inspection.status];
          const StatusIcon = status.icon;
          return (
            <div key={inspection.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl ${status.bg} shrink-0`}>
                  <StatusIcon className={`h-5 w-5 ${status.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-white font-medium truncate">{inspection.machine}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>{inspection.status}</span>
                  </div>
                  <p className="text-white/60 text-sm line-clamp-1 mb-2">{inspection.findings}</p>
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{inspection.operator}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{inspection.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
