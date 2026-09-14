import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  Settings,
  Users,
  ShoppingCart,
  Share2
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
    pattern: "^/admin$"
  },
  {
    title: "Products",
    icon: Package,
    href: "/admin/products",
    pattern: "^/admin/products"
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/admin/orders",
    pattern: "^/admin/orders"
  },
  {
    title: "Policies",
    icon: FileText,
    href: "/admin/policies",
    pattern: "^/admin/policies"
  },
  {
    title: "Messages",
    icon: MessageSquare,
    href: "/admin/messages",
    pattern: "^/admin/messages"
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users",
    pattern: "^/admin/users"
  },
  {
    title: "Social Media",
    icon: Share2,
    href: "/admin/social-media",
    pattern: "^/admin/social-media"
  }
];

export function Sidebar() {
  const location = useLocation();

  const isActive = (pattern) => {
    return new RegExp(pattern).test(location.pathname);
  };

  return (
    <div className="w-64 h-screen bg-background border-r border-border fixed left-0 top-16 p-4">
      <nav className="space-y-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive(item.pattern)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}