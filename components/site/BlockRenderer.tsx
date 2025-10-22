"use client"

import Image from "next/image"
import { Block } from "@/lib/siteConfig"

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((b) => (
        <div key={b.id} className="rounded-2xl border border-slate-800 bg-black/30 p-4">
          {b.type === "banner" && <BannerBlock block={b} />}
          {b.type === "products" && <ProductsBlock block={b} />}
          {b.type === "text" && <TextBlock block={b} />}
          {b.type === "campaign" && <CampaignBlock block={b} />}
        </div>
      ))}
    </div>
  )
}

function Title({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="mb-2">
      {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </div>
  )
}

function BannerBlock({ block }: { block: Block }) {
  return (
    <div>
      <Title title={block.title} subtitle={block.subtitle} />
      {block.image?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={block.image.url} alt={block.image.alt || ""} className="w-full rounded-xl border border-slate-800" />
      ) : (
        <div className="aspect-[16/6] w-full rounded-xl bg-slate-800/40 grid place-items-center text-slate-500 text-sm">Görsel yok</div>
      )}
      {block.text && <p className="mt-2 text-sm text-slate-200">{block.text}</p>}
      {block.cta && (
        <a href={block.cta.href} className="inline-block mt-3 text-blue-300/90 text-sm underline">
          {block.cta.label}
        </a>
      )}
    </div>
  )
}

function ProductsBlock({ block }: { block: Block }) {
  return (
    <div>
      <Title title={block.title} subtitle={block.subtitle} />
      <div className="text-xs text-slate-400">
        Kaynak: {(block as any).source || "—"}
        {(block as any).productIds?.length ? (
          <div className="mt-1 text-slate-300">Seçili ürün sayısı: {(block as any).productIds.length}</div>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="h-24 rounded-lg bg-slate-700/30 border border-slate-800"></div>
        <div className="h-24 rounded-lg bg-slate-700/30 border border-slate-800"></div>
        <div className="h-24 rounded-lg bg-slate-700/30 border border-slate-800"></div>
        <div className="h-24 rounded-lg bg-slate-700/30 border border-slate-800"></div>
      </div>
    </div>
  )
}

function TextBlock({ block }: { block: Block }) {
  return (
    <div>
      <Title title={block.title} subtitle={block.subtitle} />
      {block.text ? (
        <div className="prose prose-invert max-w-none">
          <p>{block.text}</p>
        </div>
      ) : (
        <div className="text-sm text-slate-400">Metin girilmemiş.</div>
      )}
    </div>
  )
}

function CampaignBlock({ block }: { block: Block }) {
  return (
    <div>
      <Title title={block.title} subtitle={block.subtitle} />
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">Kampanya kutusu</div>
        <div className="rounded-lg p-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-200">Kampanya kutusu</div>
      </div>
    </div>
  )
}
