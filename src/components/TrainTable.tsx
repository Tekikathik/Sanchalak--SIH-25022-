import type { Snapshot } from '../engine/simulation'
import { CLASS_META, CLASS_WEIGHT } from '../engine/priorities'
import { signed } from './format'

const STATE_TONE: Record<string, string> = {
  RUNNING: 'text-signal-green font-semibold',
  HELD: 'text-signal-amber font-semibold',
  DWELL: 'text-signal-blue font-semibold',
  SCHEDULED: 'text-muted font-medium',
  ARRIVED: 'text-muted/70 font-medium',
}
const ORDER: Record<string, number> = { RUNNING: 0, HELD: 1, DWELL: 2, SCHEDULED: 3, ARRIVED: 4 }

export function TrainTable({ snap, selectedId, onSelect }: { snap: Snapshot; selectedId: string | null; onSelect: (id: string | null) => void }) {
  const rows = [...snap.trains].sort((a, b) => ORDER[a.state] - ORDER[b.state] || b.delaySec - a.delaySec)
  return (
    <div className="panel-card flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b hairline bg-panel2/40 px-3 py-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Train Register</span>
        <span className="tabular rounded-full bg-panel2 px-2 py-0.5 text-[10px] font-semibold text-muted border border-edge/60">
          {snap.trains.length} services
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="sticky top-0 z-10 bg-panel2 text-[9.5px] uppercase tracking-wider text-muted font-bold border-b hairline shadow-2xs">
              <th className="py-2 pl-3" />
              <th className="py-2 pr-2 font-semibold">Train</th>
              <th className="py-2 pr-2 font-semibold">Service</th>
              <th className="py-2 text-center font-semibold">Dir</th>
              <th className="py-2 pr-2 font-semibold">State</th>
              <th className="py-2 pr-2 text-right font-semibold">km/h</th>
              <th className="py-2 pr-3 text-right font-semibold">Delay</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const meta = CLASS_META[t.cls]
              const sel = selectedId === t.id
              return (
                <tr
                  key={t.id}
                  onClick={() => onSelect(sel ? null : t.id)}
                  className={`cursor-pointer border-b border-edge/40 transition-colors hover:bg-panel2 ${
                    sel ? 'bg-signal-blue/10 border-l-2 border-l-signal-blue' : ''
                  }`}
                >
                  <td className="py-2 pl-3 pr-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: meta.color, boxShadow: `0 0 5px ${meta.color}88` }} />
                  </td>
                  <td className="tabular py-2 pr-2 text-xs font-bold text-ink">{t.number}</td>
                  <td className="py-2 pr-2">
                    <div className="max-w-[150px] truncate text-[11.5px] font-semibold text-ink">{t.name}</div>
                    <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                      {meta.short} · ×{CLASS_WEIGHT[t.cls]}
                    </div>
                  </td>
                  <td className="py-2 pr-1 text-center text-[11px] font-medium text-muted">{t.direction === 'UP' ? '▶' : '◀'}</td>
                  <td className={`py-2 pr-2 text-[10px] ${STATE_TONE[t.state]}`}>{t.state}</td>
                  <td className="tabular py-2 pr-2 text-right text-[11px] font-medium text-muted">{t.speedKmh > 0 ? `${t.speedKmh}` : '—'}</td>
                  <td className={`tabular py-2 pr-3 text-right text-[11px] font-bold ${t.delaySec > 300 ? 'text-signal-amber' : 'text-muted'}`}>
                    {signed(t.delaySec)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
