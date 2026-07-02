import {
  Ellipsis,
  Utensils,
  ShoppingBag,
  Plane,
  Film,
  HeartPulse,
  Sparkles,
  GraduationCap,
  Receipt,
  TrendingUp,
  Home,
  Landmark,
  Building2,
  Gift,
  ShoppingCart,
  Car,
  CreditCard,
  Wallet,
  Smartphone,
  FileText,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountType, PaymentModeKind } from "@/lib/supabase/types";

// Rendered via a switch (not a map-lookup assigned to a variable used as a
// JSX tag) so eslint-plugin-react-hooks' static-components rule can verify
// the element type is stable across renders.
export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case "utensils":
      return <Utensils className={className} />;
    case "shopping-bag":
      return <ShoppingBag className={className} />;
    case "plane":
      return <Plane className={className} />;
    case "film":
      return <Film className={className} />;
    case "heart-pulse":
      return <HeartPulse className={className} />;
    case "sparkles":
      return <Sparkles className={className} />;
    case "graduation-cap":
      return <GraduationCap className={className} />;
    case "receipt":
      return <Receipt className={className} />;
    case "trending-up":
      return <TrendingUp className={className} />;
    case "home":
      return <Home className={className} />;
    case "landmark":
      return <Landmark className={className} />;
    case "building-2":
      return <Building2 className={className} />;
    case "gift":
      return <Gift className={className} />;
    case "shopping-cart":
      return <ShoppingCart className={className} />;
    case "car":
      return <Car className={className} />;
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
