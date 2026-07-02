import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function UserAvatarLink({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  return (
    <Link href="/profile" aria-label="View profile" className="rounded-full">
      <Avatar className="size-10 border border-border">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}
