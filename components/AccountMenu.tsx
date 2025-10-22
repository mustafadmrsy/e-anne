"use client"

import Link from "next/link"
import React from "react"
import { CartIcon, UserIcon } from "./icons"

type Props = {
  variant: "desktop" | "mobile"
  isAuthed: boolean
  displayName: string | null
  onLogoutClick: () => void
  onNavigate?: (href: string) => void
  sellerApproved?: boolean
}

export default function AccountMenu({ variant, isAuthed, displayName, onLogoutClick, onNavigate, sellerApproved }: Props) {
  const stopProps =
    variant === "mobile"
      ? {
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
          onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
        }
      : {}

  return (
    <div className={variant === "mobile" ? "md:hidden px-4 py-2 border-b bg-white" : "w-72"} {...stopProps}>
      <div className={`rounded-xl border border-slate-200 ${variant === "desktop" ? "overflow-hidden" : "overflow-hidden"}`}>
        <div className={`p-3 flex items-center gap-3 border-b ${variant === "mobile" ? "bg-slate-50" : ""}`}>
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <UserIcon />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{displayName ?? "Misafir"}</p>
            <p className="text-xs text-slate-500">Hesap menüsü</p>
          </div>
        </div>
        <div className="p-2">
          {isAuthed ? (
            <>
              {sellerApproved && (
                <div className="mb-2">
                  <Link
                    href="/seller"
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 text-slate-700"
                    onClick={(e) => { e.preventDefault(); onNavigate?.("/seller") }}
                    onTouchEnd={(e) => { e.preventDefault(); onNavigate?.("/seller") }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <span className="text-slate-500">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>
                    </span>
                    <span>Satıcı Dashboard</span>
                  </Link>
                  <div className="grid grid-cols-2 gap-1 px-3 mt-1">
                    <Link href="/seller/products" className="text-sm text-slate-700 hover:underline" onClick={(e)=>{e.preventDefault(); onNavigate?.("/seller/products")}} onTouchEnd={(e)=>{e.preventDefault(); onNavigate?.("/seller/products")}}>Ürünler</Link>
                    <Link href="/seller/orders" className="text-sm text-slate-700 hover:underline" onClick={(e)=>{e.preventDefault(); onNavigate?.("/seller/orders")}} onTouchEnd={(e)=>{e.preventDefault(); onNavigate?.("/seller/orders")}}>Siparişler</Link>
                    <Link href="/seller/notifications" className="text-sm text-slate-700 hover:underline" onClick={(e)=>{e.preventDefault(); onNavigate?.("/seller/notifications")}} onTouchEnd={(e)=>{e.preventDefault(); onNavigate?.("/seller/notifications")}}>Bildirimler</Link>
                    <Link href="/seller/profile" className="text-sm text-slate-700 hover:underline" onClick={(e)=>{e.preventDefault(); onNavigate?.("/seller/profile")}} onTouchEnd={(e)=>{e.preventDefault(); onNavigate?.("/seller/profile")}}>Profil</Link>
                  </div>
                </div>
              )}
              <Link
                href="/account"
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 text-slate-700"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate?.("/account")
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  onNavigate?.("/account")
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span className="text-slate-500">
                  <UserIcon />
                </span>
                <span>Hesabım</span>
              </Link>
              <Link
                href="/orders"
                className="mt-1 w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 text-slate-700"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate?.("/orders")
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  onNavigate?.("/orders")
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span className="text-slate-500">
                  <CartIcon />
                </span>
                <span>Siparişlerim</span>
              </Link>
              <button
                type="button"
                className="mt-1 w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-red-600 bg-red-50 hover:bg-red-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onLogoutClick()
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  onLogoutClick()
                }}
              >
                <span className="text-red-500">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </span>
                <span>Çıkış Yap</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 text-slate-700"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate?.("/login")
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  onNavigate?.("/login")
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span className="text-slate-500">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </span>
                <span>Giriş Yap</span>
              </Link>
              <Link
                href="/register"
                className="mt-1 w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 text-slate-700"
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate?.("/register")
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  onNavigate?.("/register")
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span className="text-slate-500">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <span>Kayıt Ol</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
