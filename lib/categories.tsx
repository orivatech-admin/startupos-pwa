import {
  Ellipsis,
  Building2,
  AppWindow,
  Cloud,
  Globe,
  Scale,
  Calculator,
  Landmark,
  Users,
  Handshake,
  Cpu,
  Wifi,
  Plane,
  Megaphone,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  CreditCard,
  Wallet,
  Smartphone,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountType, PaymentModeKind } from "@/lib/supabase/types";

// Rendered via a switch (not a map-lookup assigned to a variable used as a
// JSX tag) so eslint-plugin-react-hooks' static-components rule can verify
// the element type is stable across renders.
export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case "building-2":
      return <Building2 className={cn("text-slate-400", className)} />;
    case "app-window":
      return <AppWindow className={cn("text-violet-400", className)} />;
    case "cloud":
      return <Cloud className={cn("text-sky-400", className)} />;
    case "globe":
      return <Globe className={cn("text-cyan-400", className)} />;
    case "scale":
      return <Scale className={cn("text-amber-400", className)} />;
    case "calculator":
      return <Calculator className={cn("text-emerald-400", className)} />;
    case "landmark":
      return <Landmark className={cn("text-blue-400", className)} />;
    case "users":
      return <Users className={cn("text-indigo-400", className)} />;
    case "handshake":
      return <Handshake className={cn("text-orange-400", className)} />;
    case "cpu":
      return <Cpu className={cn("text-zinc-400", className)} />;
    case "wifi":
      return <Wifi className={cn("text-teal-400", className)} />;
    case "plane":
      return <Plane className={cn("text-rose-400", className)} />;
    case "megaphone":
      return <Megaphone className={cn("text-pink-400", className)} />;
    case "briefcase":
      return <Briefcase className={cn("text-purple-400", className)} />;
    case "graduation-cap":
      return <GraduationCap className={cn("text-lime-400", className)} />;
    case "shield-check":
      return <ShieldCheck className={cn("text-red-400", className)} />;
    default:
      return <Ellipsis className={className} />;
  }
}

export function AccountTypeIcon({
  accountType,
  className,
}: {
  accountType: AccountType;
  className?: string;
}) {
  switch (accountType) {
    case "bank_account":
      return <Landmark className={cn("text-sky-400", className)} />;
    case "wallet":
      return <Wallet className={cn("text-cyan-400", className)} />;
    case "credit_card":
      return <CreditCard className={cn("text-violet-400", className)} />;
    default:
      return <Ellipsis className={cn("text-muted-foreground", className)} />;
  }
}

export function PaymentModeIcon({
  kind,
  className,
}: {
  kind: PaymentModeKind;
  className?: string;
}) {
  switch (kind) {
    case "upi":
      return <Smartphone className={cn("text-emerald-400", className)} />;
    case "cheque":
      return <FileText className={cn("text-amber-400", className)} />;
    case "internet_banking":
      return <Globe className={cn("text-sky-400", className)} />;
    case "debit_card":
      return <CreditCard className={cn("text-cyan-400", className)} />;
    default:
      return <Ellipsis className={cn("text-muted-foreground", className)} />;
  }
}
