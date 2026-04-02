"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyReportLinkButtonProps = {
  path?: string;
  className?: string;
};

export default function CopyReportLinkButton({
  path,
  className = "",
}: CopyReportLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = path ? `${window.location.origin}${path}` : window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      className={`inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-100 hover:border-cyan-300/40 hover:bg-white/[0.06] ${className}`}
    >
      {copied ? <Check className="h-4 w-4 text-cyan-200" /> : <Copy className="h-4 w-4 text-slate-300" />}
      {copied ? "Copied!" : "Copy Report Link"}
    </button>
  );
}
