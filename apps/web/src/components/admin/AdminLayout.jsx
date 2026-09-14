import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/ui/sidebar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <div className="container py-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}