"use client";
import Link from "next/link";
import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-gray-200">
      <div className="container-page h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Kongfunow
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
            <Link href="#" className="hover:text-gray-900">浏览课程</Link>
            <Link href="#" className="hover:text-gray-900">订阅方案</Link>
            <Link href="#" className="hover:text-gray-900">团队版</Link>
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="#" className="btn-muted">登录</Link>
          <Link href="#" className="btn-primary">注册</Link>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <span className="i">☰</span>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-200">
          <div className="container-page py-4 flex flex-col gap-3">
            <Link href="#">浏览课程</Link>
            <Link href="#">订阅方案</Link>
            <Link href="#">团队版</Link>
            <div className="pt-2 flex gap-3">
              <Link href="#" className="btn-muted flex-1 text-center">登录</Link>
              <Link href="#" className="btn-primary flex-1 text-center">注册</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

