"use client";

import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { useLoading } from "@/providers/LoadingProvider";
import React from "react";

interface SafeLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export const SafeLink: React.FC<SafeLinkProps> = ({
  href,
  children,
  className,
  onClick,
  ...props
}) => {
  const { setIsLoading } = useLoading();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If it's a regular internal link (no target="_blank"), show loader
    if (!props.target || props.target === "_self") {
      // Small delay prevents flicker for extremely fast navigations
      // but also ensures the user "sees" the brand transition
      setIsLoading(true);
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};
