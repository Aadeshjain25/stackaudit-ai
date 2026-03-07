"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "@/public/logo.png";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Analyze", href: "/analyze" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Docs", href: "/docs" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="w-full border-b border-white/10 bg-[#070B14]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="relative max-w-7xl mx-auto px-6 h-20 flex items-center">

        {/* LEFT — Logo */}
        <Link href="/" aria-label="Go to home page" title="Home" className="flex items-center gap-1.5">
          <Image
            src={logo}
            alt="StackAudit AI"
            width={64}
            height={64}
            className="object-contain"
            priority
          />
          <span className="-ml-0.5 text-white font-semibold text-2xl tracking-tight leading-none">
            StackAudit
            <span className="text-cyan-400"> AI</span>
          </span>
        </Link>

        {/* CENTER — Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-[family-name:var(--font-display)] tracking-[0.02em] absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href) ? "nav-link-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
