import { ShieldCheck, TrendingDown, Clock, Activity, TrainTrack } from 'lucide-react'
import type { Snapshot } from '../engine/simulation'
import type { Projected } from '../state/useSimulation'
import { useCountUp } from './useCountUp'
import { minsInt } from './format'

export function Kpis({ optimizer, fcfs, optimizerOn, projected }: { optimizer: Snapshot; fcfs: Snapshot; optimizerOn: boolean; projected: Projected }) {
  const k = (optimizerOn ? optimizer : fcfs).kpis
  const optW = optimizer.kpis.totalWeightedDelaySec
  const fcW = fcfs.kpis.totalWeightedDelaySec
  const maxW = Math.max(optW, fcW, 1)
  const refused = k.unsafeAdmissionsPrevented
  const animPct = Math.round(useCountUp(projected.pct))
  const premOpt = projected.premierDelayOptSec / 60
  const premFcfs = projected.premierDelayFcfsSec / 60
  const premCutMin = Math.round(premFcfs - premOpt)
  const premCutPct = premFcfs > 0 ? Math.round(((premFcfs - premOpt) / premFcfs) * 100) : 0
  const grp = (n: number) => (n ?? 0).toLocaleString('en-IN')

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.55fr_1fr]">
      {/* HERO — the entire pitch in one glance */}
      <div className="panel-raised flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="shrink-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-signal-green/30 bg-signal-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-signal-green">
            <TrendingDown size={12} /> AI vs Manual Baseline · Live
          </div>
          <div className="mt-1.5 flex items-baseline gap-2.5">
            <span className="tabular text-[64px] font-extrabold leading-none tracking-tight text-signal-green" style={{ textShadow: '0 0 28px rgba(5,150,105,0.2)' }}>
              {animPct}%
            </span>
            <span className="text-xl font-bold tracking-tight text-ink">Less Delay</span>
          </div>
          <div className="mt-2 max-w-[340px] space-y-1 text-[12px] leading-relaxed text-muted">
            <div>
              <span className="tabular font-bold text-ink">{grp(projected.paxMinSaved)}</span> passenger-minutes and{' '}
              <span className="tabular font-bold text-ink">{grp(projected.trainMinSaved)}</span> train-minutes saved this peak hour.
            </div>
            {premCutMin > 0 && (
              <div>
                Premier services run <span className="tabular font-bold text-signal-green">{premCutPct}% less late</span>
                <span className="text-muted/80"> — ~{premCutMin} min faster each than manual FCFS.</span>
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-3 self-stretch border-t border-edge/80 pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-1">
          <Bar label="Sanchalak AI" value={optW} max={maxW} color="var(--signal-green)" active={optimizerOn} />
          <Bar label="Manual (today)" value={fcW} max={maxW} color="var(--muted-color)" active={!optimizerOn} />
          <div className="text-[10px] font-medium text-muted/90 leading-tight">
            The AI prioritizes Superfast and passenger express trains at crossings to eliminate compound bottlenecks.
          </div>
        </div>
      </div>

      {/* SAFETY chip (forward) + secondary stats (recessed) */}
      <div className="flex flex-col gap-3">
        <div className="panel-raised flex items-center gap-3.5 px-4 py-3 border-l-4 border-l-signal-green shadow-xs">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-signal-green/15 text-signal-green">
            <ShieldCheck size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="tabular text-3xl font-extrabold leading-none text-signal-green">{refused}</span>
              <span className="text-[13px] font-bold text-ink">Unsafe Routes Refused</span>
            </div>
            <div className="mt-0.5 text-[11px] leading-snug text-muted">
              Collisions impossible by construction. Interlocking safety floor blocks admissions before AI decides.
            </div>
          </div>
        </div>

        <div className="panel-card grid flex-1 grid-cols-4 divide-x divide-edge/60">
          <Stat icon={<Activity size={12} />} label="Throughput" value={`${k.throughputPerHour}`} sub="trains/hr" />
          <Stat icon={<Clock size={12} />} label="Avg Delay" value={`${minsInt(k.avgDelaySec)}m`} sub={`${k.active} active`} />
          <Stat icon={<TrainTrack size={12} />} label="Crossings" value={`${k.conflictsResolved}`} sub="resolved" />
          <Stat icon={<Activity size={12} />} label="Capacity" value={`${k.capacityUtilPct}%`} sub="utilized" />
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, sub }: { icon?: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col justify-center px-3 py-2.5">
      <div className="flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted">
        {icon}
        <span>{label}</span>
      </div>
      <span className="tabular mt-0.5 text-lg font-bold leading-none text-ink">{value}</span>
      {sub && <span className="mt-1 text-[9.5px] font-medium text-muted/80">{sub}</span>}
    </div>
  )
}

function Bar({ label, value, max, color, active }: { label: string; value: number; max: number; color: string; active: boolean }) {
  const pctW = Math.max(4, (value / max) * 100)
  return (
    <div className="flex items-center gap-2.5">
      <span className={`w-24 shrink-0 text-[11px] ${active ? 'font-bold text-ink' : 'font-medium text-muted'}`}>{label}</span>
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-panel2 border border-edge/60">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pctW}%`, background: color, opacity: active ? 1 : 0.45, boxShadow: active ? `0 0 8px ${color}` : 'none' }}
        />
      </div>
      <span className="tabular w-16 shrink-0 text-right text-[11px] font-semibold text-muted">{minsInt(value)} min</span>
    </div>
  )
}
