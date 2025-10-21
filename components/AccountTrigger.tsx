"use client"

import React, { forwardRef } from "react"
import { UserIcon } from "./icons"

type Props = {
  onClick?: () => void
  ariaLabel?: string
  showName?: boolean
  displayName?: string | null
  className?: string
  nameClassName?: string
}

export const AccountTrigger = forwardRef<HTMLButtonElement, Props>(function AccountTrigger(
  {
    onClick,
    ariaLabel = "Hesabım",
    showName = false,
    displayName,
    className = "p-2.5 rounded-lg hover:bg-slate-100 active:bg-slate-200",
    nameClassName = "hidden md:block text-sm text-slate-700 ml-1 truncate max-w-[9rem]",
  },
  ref
) {
  return (
    <div className="flex items-center gap-1">
      <button ref={ref} aria-label={ariaLabel} className={className} onClick={onClick}>
        <UserIcon />
      </button>
      {showName && displayName ? <span className={nameClassName}>{displayName}</span> : null}
    </div>
  )
})

export default AccountTrigger
