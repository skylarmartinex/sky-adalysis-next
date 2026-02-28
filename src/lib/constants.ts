export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { label: "Campaigns", href: "/campaigns", icon: "Megaphone" },
  { label: "Opportunities", href: "/opportunities", icon: "Lightbulb" },
  { label: "Reporting", href: "/reporting", icon: "FileText" },
] as const;

export const CAMPAIGN_TYPE_COLORS: Record<string, string> = {
  Brand: "bg-blue-500/20 text-blue-400",
  Nonbrand: "bg-purple-500/20 text-purple-400",
  Competitor: "bg-orange-500/20 text-orange-400",
};

export const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400",
  warning: "bg-yellow-500/20 text-yellow-400",
  info: "bg-blue-500/20 text-blue-400",
};

export const IMPACT_COLORS: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-green-500/20 text-green-400",
};

export const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-500/20 text-green-400",
  Paused: "bg-gray-500/20 text-gray-400",
  Removed: "bg-red-500/20 text-red-400",
};
