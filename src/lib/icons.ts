import {
  BarChart3,
  Target,
  ShoppingCart,
  Users,
  Gauge,
  TrendingUp,
  PieChart,
  LineChart,
  Boxes,
  Truck,
  FileText,
  Wallet,
  ClipboardList,
  Factory,
  Database,
  Briefcase,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  BarChart3,
  Target,
  ShoppingCart,
  Users,
  Gauge,
  TrendingUp,
  PieChart,
  LineChart,
  Boxes,
  Truck,
  FileText,
  Wallet,
  ClipboardList,
  Factory,
  Database,
  Briefcase,
};

export const iconNames = Object.keys(iconMap);

export const getIcon = (name?: string | null): LucideIcon =>
  (name && iconMap[name]) || BarChart3;
