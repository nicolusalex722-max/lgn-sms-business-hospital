"use client";

import { useState } from "react";
import Image from "next/image";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function StudentAvatar({
  src,
  name,
  size = 40,
}: {
  /** Local path under /public, e.g. "/students/STD-1001.jpg". Falsy/missing is fine. */
  src?: string | null;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;

  if (!showImage) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-indigo-50 text-xs font-semibold text-indigo-600"
        aria-label={name}
        title={name}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <Image
      src={src as string}
      alt={name}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full border border-slate-200 object-cover"
      style={{ width: size, height: size }}
    />
  );
}