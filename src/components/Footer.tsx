"use client";

import Image from "next/image";
import Link from "next/link";
import { FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const creatorUrl = "https://www.linkedin.com/in/aadeshjain25/";
const twitterUrl = "https://x.com/StackAuditAI";

const socialLinks = [
  {
    label: "LinkedIn",
    href: creatorUrl,
    icon: FaLinkedinIn,
    className:
      "border-sky-400/20 bg-sky-400/10 text-sky-200 hover:border-sky-300/35 hover:bg-sky-400/16 hover:text-white",
  },
  {
    label: "Twitter / X",
    href: twitterUrl,
    icon: FaXTwitter,
    className:
      "border-violet-400/20 bg-violet-400/10 text-violet-200 hover:border-violet-300/35 hover:bg-violet-400/16 hover:text-white",
  },
];

export default function Footer() {
  return (
    <footer className="px-4 pb-4 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-t-[1.75rem] border border-white/8 bg-[#07111d]/72 px-6 py-8 sm:px-10 sm:py-10 xl:backdrop-blur-2xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <Image
                src="/logo.png"
                alt="StackAudit AI logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full border border-white/10 object-cover shadow-[0_10px_30px_rgba(14,165,233,0.18)]"
              />
              <span className="text-[1.05rem] font-semibold tracking-tight">StackAudit AI</span>
            </Link>

            <div className="flex items-center gap-3 sm:justify-end">
              {socialLinks.map(({ label, href, icon: Icon, className }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-transform hover:-translate-y-0.5 ${className}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
