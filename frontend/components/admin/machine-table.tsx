"use client";

import { useState } from "react";
import { Search, MapPin, Clock, ChevronRight } from "lucide-react";

type MachineStatus = "PASS" | "MONITOR" | "FAIL" | "PENDING";

interface Machine {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: MachineStatus;
  hours: number;
  location: string;
  lastInspection: string;
  operator: string;
}

const machines: Machine[] = [
  {
    id: "1",
    name: "D6 Dozer #472",
    model: "D6",
    serialNumber: "CAT-D6-0472",
    status: "PASS",
    hours: 4250,
    location: "Site A - North Sector",
    lastInspection: "2026-02-26",
    operator: "Mike Johnson",
  },
  {
    id: "2",
    name: "320 Excavator #1138",
    model: "320",
    serialNumber: "CAT-320-1138",
    status: "MONITOR",
    hours: 3180,
    location: "Site A - East Sector",
    lastInspection: "2026-02-27",
    operator: "Sarah Chen",
  },
  {
    id: "3",
    name: "950 Loader #891",
    model: "950",
    serialNumber: "CAT-950-0891",
    status: "PENDING",
    hours: 5620,
    location: "Site B - Main Yard",
    lastInspection: "2026-02-25",
    operator: "—",
  },
  {
    id: "4",
    name: "140 Grader #234",
    model: "140",
    serialNumber: "CAT-140-0234",
    status: "FAIL",
    hours: 2890,
    location: "Site B - Road Section",
    lastInspection: "2026-02-24",
    operator: "Tom Wilson",
  },
  {
    id: "5",
    name: "777 Truck #156",
    model: "777",
    serialNumber: "CAT-777-0156",
    status: "PASS",
    hours: 6100,
    location: "Site A - Haul Route",
    lastInspection: "2026-02-27",
    operator: "James Lee",
  },
  {
    id: "6",
    name: "CS56 Compactor #89",
    model: "CS56",
    serialNumber: "CAT-CS56-0089",
    status: "MONITOR",
    hours: 1540,
    location: "Site C - Foundation",
    lastInspection: "2026-02-23",
    operator: "Anna Park",
  },
];

const statusConfig: Record<MachineStatus, { bg: string; text: string; label: string }> = {
  PASS: { bg: "bg-green-500", text: "text-white", label: "PASS" },
  MONITOR: { bg: "bg-cat-yellow", text: "text-cat-black", label: "MONITOR" },
  FAIL: { bg: "bg-cat-red", text: "text-white", label: "FAIL" },
  PENDING: { bg: "bg-white/20", text: "text-white", label: "PENDING" },
};

const filterOptions: { value: MachineStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Machines" },
  { value: "PENDING", label: "Pending" },
  { value: "PASS", label: "Pass" },
  { value: "MONITOR", label: "Monitor" },
  { value: "FAIL", label: "Fail" },
];

export function MachineTable() {
  const [filter, setFilter] = useState<MachineStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filteredMachines = machines.filter((machine) => {
    const matchesFilter = filter === "ALL" || machine.status === filter;
    const matchesSearch =
      search === "" ||
      machine.name.toLowerCase().includes(search.toLowerCase()) ||
      machine.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      machine.location.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-[#2a2a2a] rounded-2xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by name, ID, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-full pl-10 pr-4 py-2 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-cat-yellow/50"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === option.value
                    ? "bg-cat-yellow text-cat-black"
                    : "bg-[#1a1a1a] text-white/70 hover:bg-white/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Machine
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider hidden md:table-cell">
                Location
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider hidden lg:table-cell">
                Hours
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider hidden lg:table-cell">
                Last Inspection
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider hidden xl:table-cell">
                Operator
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredMachines.map((machine) => {
              const status = statusConfig[machine.status];
              return (
                <tr
                  key={machine.id}
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-white font-medium">{machine.name}</p>
                      <p className="text-white/50 text-sm">{machine.serialNumber}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <MapPin className="h-4 w-4 text-white/40" />
                      {machine.location}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Clock className="h-4 w-4 text-white/40" />
                      {machine.hours.toLocaleString()} hrs
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-white/70 text-sm">{machine.lastInspection}</span>
                  </td>
                  <td className="px-4 py-4 hidden xl:table-cell">
                    <span className="text-white/70 text-sm">{machine.operator}</span>
                  </td>
                  <td className="px-4 py-4">
                    <ChevronRight className="h-5 w-5 text-white/30" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5">
        <p className="text-sm text-white/50">
          {filteredMachines.length} machine{filteredMachines.length !== 1 ? "s" : ""} found
        </p>
      </div>
    </div>
  );
}
