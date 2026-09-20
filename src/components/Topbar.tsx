import { Pause, Play, RotateCcw, Sun, Moon } from 'lucide-react'
import type { SimController, Speed } from '../state/useSimulation'
import { Logo } from './Logo'
import { clock } from './format'

const SPEEDS: Speed[] = [1, 2, 4, 8]

export function Topbar({
  ctl,
  onStartTour,
  tourActive,
  theme = 'light',
  onToggleTheme,
}: {
  ctl: SimController
  onStartTour: () => void
  tourActive: boolean
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
}) {
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b hairline bg-panel/85 px-4 py-2.5 shadow-sm backdrop-blur-md transition-colors">
      {/* brand */}
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-signal-green/10 ring-1 ring-signal-green/30 shadow-sm">
          <Logo size={26} />
        </div>
        <div className="leading-tight">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black tracking-tight text-ink">SANCHALAK</span>
            <span className="text-sm font-semibold text-signal-green">संचालक</span>
          </div>
          <div className="text-[9.5px] font-medium uppercase tracking-[0.22em] text-muted">Glass-Box Dispatcher · SIH25022</div>
        </div>
      </div>

      {/* scenario selector */}
      <div className="flex items-center gap-1 rounded-xl border hairline bg-panel2 p-1 shadow-sm">
        {ctl.scenarios.map((s) => {
          const active = ctl.scenario.id === s.id
          const danger = s.id === 'safety'
          return (
            <button
              key={s.id}
              onClick={() => ctl.selectScenario(s.id)}
              title={s.blurb}
              className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                active
                  ? danger
                    ? 'bg-signal-red/15 text-signal-red font-semibold shadow-xs'
                    : 'bg-panel text-ink font-semibold shadow-xs border border-edge/60'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {s.title}
            </button>
          )
        })}
      </div>

      {/* clock */}
      <div className="flex items-center gap-2 rounded-xl border hairline bg-panel2/60 px-3 py-1 shadow-xs">
        <span className="h-2 w-2 rounded-full bg-signal-green animate-blip" />
        <span className="tabular text-xl font-bold tracking-wider text-ink">{clock(ctl.primary.simSec)}</span>
        <span className="text-[9px] font-semibold uppercase text-muted tracking-wider">{ctl.finished ? 'cleared' : ctl.playing ? 'live' : 'paused'}</span>
      </div>

      {/* transport */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={ctl.togglePlay}
          aria-label={ctl.playing ? 'Pause' : 'Play'}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-signal-green/15 px-3 py-1.5 text-xs font-semibold text-signal-green shadow-xs transition-colors hover:bg-signal-green/25 border border-signal-green/20"
        >
          {ctl.playing ? <Pause size={14} /> : <Play size={14} />}
          {ctl.playing ? 'Pause' : 'Run'}
        </button>
        <button onClick={ctl.reset} aria-label="Reset" className="cursor-pointer rounded-lg border hairline bg-panel2 p-1.5 text-muted shadow-xs transition-colors hover:text-ink hover:border-edge">
          <RotateCcw size={14} />
        </button>
        <div className="flex items-center overflow-hidden rounded-lg border hairline bg-panel2 shadow-xs">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => ctl.setSpeed(s)}
              className={`tabular cursor-pointer px-2 py-1.5 text-[11px] transition-colors ${ctl.speed === s ? 'bg-signal-blue/20 text-signal-blue font-bold' : 'text-muted hover:text-ink'}`}
            >
              {s}×
            </button>
          ))}
        </div>
        {!tourActive && (
          <button
            onClick={onStartTour}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-signal-green/40 bg-signal-green/10 px-2.5 py-1.5 text-[11px] font-semibold text-signal-green shadow-xs transition-colors hover:bg-signal-green/20"
          >
            <Play size={13} /> Guided Demo
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {/* theme toggle button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="cursor-pointer inline-flex items-center justify-center rounded-xl border hairline bg-panel2 p-2 text-ink shadow-xs transition-colors hover:border-signal-blue/40"
          >
            {theme === 'light' ? (
              <Moon size={15} className="text-muted hover:text-ink" />
            ) : (
              <Sun size={15} className="text-signal-amber" />
            )}
          </button>
        )}

        {/* the hero toggle */}
        <button
          onClick={() => ctl.setOptimizerOn(!ctl.optimizerOn)}
          className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border hairline bg-panel2 px-3 py-1.5 shadow-sm transition-colors hover:border-signal-green/50"
          aria-label="Toggle AI optimizer"
        >
          <div className="text-right leading-tight">
            <div className="text-[9px] uppercase tracking-[0.18em] text-muted">Dispatch policy</div>
            <div className={`text-[12px] font-bold ${ctl.optimizerOn ? 'text-signal-green' : 'text-muted'}`}>
              {ctl.optimizerOn ? 'AI OPTIMIZER' : 'FCFS (MANUAL)'}
            </div>
          </div>
          <div className={`relative h-6 w-11 rounded-full transition-colors ${ctl.optimizerOn ? 'bg-signal-green' : 'bg-edge'}`}>
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ${ctl.optimizerOn ? 'left-[22px]' : 'left-0.5'}`}
            />
          </div>
        </button>
      </div>
    </header>
  )
}
