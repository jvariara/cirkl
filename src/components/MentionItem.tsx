import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

interface MentionItemProps extends React.ComponentPropsWithoutRef<"div"> {
  isActive: boolean;
}

export const MentionItem = ({
  isActive,
  className,
  style,
  ...props
}: MentionItemProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({ block: "nearest" });
    }
  }, [isActive]);

  return (
    <div
      ref={ref}
      className={cn("p-2 cursor-pointer text-card-foreground", isActive && "bg-primary/60", className)}
      style={{ ...style }}
      {...props}
    />
  );
};
