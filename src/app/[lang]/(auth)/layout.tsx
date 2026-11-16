import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="from-brand-backdrop-start to-brand-backdrop-end relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br p-4 lg:justify-end lg:p-0">
      {/* Repeating background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen"
        style={{
          backgroundImage: "url('/bg-pattern.png')",
          backgroundSize: "800px",
          backgroundRepeat: "repeat",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-md justify-center lg:mr-[2.5%] lg:h-[90vh] lg:w-[45%] lg:max-w-none xl:mr-[5%]">
        {children}
      </div>
    </div>
  );
}
