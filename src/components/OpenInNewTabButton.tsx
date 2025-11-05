import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { openInNewTab } from "@/utils/multiTab";

interface OpenInNewTabButtonProps {
  path: string;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export const OpenInNewTabButton = ({ 
  path, 
  label = "Open in New Tab",
  variant = "outline",
  size = "sm" 
}: OpenInNewTabButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => openInNewTab(path)}
    >
      <ExternalLink className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};