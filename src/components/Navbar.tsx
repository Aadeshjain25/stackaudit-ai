"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: "/dashboard", label: "Dashboard" },
];

const creatorUrl = "https://www.linkedin.com/in/aadeshjain25/";
const twitterUrl = "https://x.com/StackAuditAI";

export default function Navbar() {
  const pathname = usePathname();
  const isShareReport = pathname.startsWith("/report/");

  if (isShareReport) {
    return (
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#07111d]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="StackAudit AI logo"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
            <span className="font-[var(--font-display)] text-xl font-semibold tracking-tight text-white">
              StackAudit
            </span>
          </Link>

          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-100 hover:border-cyan-300/40 hover:bg-white/[0.06]"
          >
            Analyze another repo
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#07111d]/70 backdrop-blur-xl">
      <div className="relative mx-auto flex h-24 w-full max-w-7xl items-center px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="StackAudit AI logo"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
          <span className="font-[var(--font-display)] text-xl font-semibold tracking-tight text-white">
            StackAudit AI
          </span>
        </Link>

        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "nav-link nav-link-active" : "nav-link"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a
            href={creatorUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sky-400/20 bg-sky-400/10 text-sky-200 transition hover:-translate-y-0.5 hover:border-sky-300/35 hover:bg-sky-400/16 hover:text-white"
          >
            <FaLinkedinIn className="h-4 w-4" />
          </a>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter / X"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/10 text-violet-200 transition hover:-translate-y-0.5 hover:border-violet-300/35 hover:bg-violet-400/16 hover:text-white"
          >
            <FaXTwitter className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
