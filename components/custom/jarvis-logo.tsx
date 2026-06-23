import Image from "next/image";
import { cn } from "@/lib/utils";
import { JARVIS } from "@/lib/jarvis";

interface JarvisLogoProps {
  className?: string;
  size?: number;
  /** `logo` = header/wordmark, `avatar` = chat message icon */
  variant?: "logo" | "avatar";
}

export function JarvisLogo({
  className,
  size = 48,
  variant = "logo",
}: JarvisLogoProps) {
  const isAvatar = variant === "avatar";

  return (
    <Image
      src={isAvatar ? JARVIS.avatar : JARVIS.logo}
      alt={JARVIS.name}
      width={size}
      height={size}
      className={cn(
        "h-auto w-auto object-contain",
        isAvatar && "rounded-full",
        className
      )}
      priority={size <= 24}
    />
  );
}

/** Chat avatar — orange badge favicon */
export function JarvisAvatar({
  className,
  size = 24,
}: Omit<JarvisLogoProps, "variant">) {
  return (
    <JarvisLogo variant="avatar" size={size} className={className} />
  );
}
