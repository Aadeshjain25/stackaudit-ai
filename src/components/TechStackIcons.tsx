"use client";

import { SiJavascript, SiNodedotjs, SiReact, SiTypescript } from "react-icons/si";
import type { IconType } from "react-icons";
import type { TechStack } from "@/src/types/audit";

const iconMap: Record<
  TechStack,
  {
    label: string;
    icon: IconType;
  }
> = {
  javascript: { label: "JavaScript", icon: SiJavascript },
  typescript: { label: "TypeScript", icon: SiTypescript },
  react: { label: "React", icon: SiReact },
  nodejs: { label: "Node.js", icon: SiNodedotjs },
};

type TechStackIconsProps = {
  techStack?: TechStack[];
  className?: string;
};

export default function TechStackIcons({ techStack = [], className = "" }: TechStackIconsProps) {
  if (techStack.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {techStack.map((item) => {
        const { icon: Icon, label } = iconMap[item];

        return (
          <span
            key={item}
            title={label}
            aria-label={label}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:text-slate-100"
          >
            <Icon className="h-4 w-4" />
          </span>
        );
      })}
    </div>
  );
}
