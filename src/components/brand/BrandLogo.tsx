import Image from "next/image";
import Link from "next/link";

type Props = {
  className?: string;
  priority?: boolean;
  /** Pasa `null` o `""` para renderizar el logo sin enlace */
  href?: string | null;
};

export function BrandLogo({ className = "h-10 w-auto", priority, href = "/" }: Props) {
  const img = (
    <Image
      src="/brand/centralmark-logo.svg"
      alt="CentralMark — Marketing en segundos"
      width={720}
      height={180}
      className={className}
      priority={priority}
    />
  );

  if (!href) return img;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="CentralMark">
      {img}
    </Link>
  );
}
