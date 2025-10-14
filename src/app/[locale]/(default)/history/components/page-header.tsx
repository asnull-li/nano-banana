"use client";

import { Clock } from "lucide-react";

interface PageHeaderProps {
  pageData: any;
}

export default function PageHeader({ pageData }: PageHeaderProps) {
  return (
    <div className="mb-10 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full mb-6 shadow-lg shadow-green-500/25">
        <Clock className="h-5 w-5 text-white" />
      </div>
      <h1 className="text-3xl font-bold lg:text-4xl bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
        {pageData?.title || "History"}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {pageData?.description || ""}
      </p>
    </div>
  );
}
