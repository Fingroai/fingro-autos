"use client";
import React, { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-[#26B073] rounded-full animate-spin"></div>
    </div>}>
      {children}
    </Suspense>
  );
}
