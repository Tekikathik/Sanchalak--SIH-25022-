import { useEffect, useRef, useState } from 'react'
import { useSimulation } from './state/useSimulation'
import { useTour } from './state/useTour'
import { TourOverlay } from './components/TourOverlay'
import { SafetyFlash } from './components/SafetyFlash'
import { Topbar } from './components/Topbar'
import { Kpis } from './components/Kpis'
import { CorridorView } from './components/CorridorView'
import { StringLine } from './components/StringLine'
import { TrainTable } from './components/TrainTable'
import { GeoMap } from './components/GeoMap'
import { EventLog } from './components/EventLog'
import { DispatcherPanel } from './components/DispatcherPanel'
import { CLASS_META } from './engine/priorities'
import { BALASORE_CORRIDOR } from './engine/corridor'
import { LayoutGrid, GitCommit, LineChart, Table, Map } from 'lucide-react'

const LEGEND_CLASSES = ['SPECIAL', 'SUPERFAST', 'EXPRESS', 'PASSENGER', 'GOODS'] as const
type ViewMode = 'split' | 'schematic' | 'stringline' | 'table' | 'map'

export default function App() {
  const ctl = useSimulation()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const tour = useTour(ctl, setSelectedId)

  // Fire the "collision prevented" moment whenever the interlocking refuses a route.
  const [flash, setFlash] = useState(false)
  const prevUnsafe = useRef(0)
  const unsafe = ctl.primary.kpis.unsafeAdmissionsPrevented
  useEffect(() => {
    if (unsafe > prevUnsafe.current) {
      setFlash(true)
      const id = window.setTimeout(() => setFlash(false), 5200)
      prevUnsafe.current = unsafe
      return () => window.clearTimeout(id)
    }
    prevUnsafe.current = unsafe
  }, [unsafe])

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} flex h-screen min-h-0 flex-col overflow-hidden text-ink transition-colors`}>
      <Topbar
        ctl={ctl}
        onStartTour={tour.start}
        tourActive={tour.active}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      />
      <TourOverlay caption={tour.caption} onStop={tour.stop} />
      <SafetyFlash show={flash} />

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto p-3 lg:grid-cols-[1fr_minmax(370px,410px)]">
        {/* left column — main monitoring workstation */}
        <div className="flex min-h-0 flex-col gap-3">
          <div className="panel-in">
            <Kpis optimizer={ctl.optimizer} fcfs={ctl.fcfs} optimizerOn={ctl.optimizerOn} projected={ctl.projected} />
          </div>

          {/* hero board with advanced clean view controls */}
          <section className="panel-card panel-in flex min-h-[380px] flex-1 flex-col overflow-hidden shadow-xs" style={{ animationDelay: '80ms' }}>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b hairline bg-panel2/30 px-4 py-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-ink">Section Control Board</span>
                <span className="text-[11px] font-medium text-muted">{BALASORE_CORRIDOR.subtitle}</span>
                <span className="rounded-full border border-edge/80 bg-panel2 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-muted shadow-2xs">
                  Real Stations &amp; Timetable · Live Simulation
                </span>
              </div>

              {/* view mode switcher tabs */}
              <div className="flex items-center gap-1 rounded-xl border hairline bg-panel2 p-0.5 shadow-2xs">
                <button
                  onClick={() => setViewMode('split')}
                  title="Split View: Track Schematic + Stringline"
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10.5px] font-semibold transition-all ${
                    viewMode === 'split' ? 'bg-panel text-ink shadow-xs border border-edge/80' : 'text-muted hover:text-ink'
                  }`}
                >
                  <LayoutGrid size={12} /> Split
                </button>
                <button
                  onClick={() => setViewMode('schematic')}
                  title="Full-Height Track Schematic"
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10.5px] font-semibold transition-all ${
                    viewMode === 'schematic' ? 'bg-panel text-ink shadow-xs border border-edge/80' : 'text-muted hover:text-ink'
                  }`}
                >
                  <GitCommit size={12} /> Schematic
                </button>
                <button
                  onClick={() => setViewMode('stringline')}
                  title="Full-Height Time-Distance Graph"
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10.5px] font-semibold transition-all ${
                    viewMode === 'stringline' ? 'bg-panel text-ink shadow-xs border border-edge/80' : 'text-muted hover:text-ink'
                  }`}
                >
                  <LineChart size={12} /> Time-Distance
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Full Train Register Table"
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10.5px] font-semibold transition-all ${
                    viewMode === 'table' ? 'bg-panel text-ink shadow-xs border border-edge/80' : 'text-muted hover:text-ink'
                  }`}
                >
                  <Table size={12} /> Trains
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  title="Full Geographic Corridor Map"
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10.5px] font-semibold transition-all ${
                    viewMode === 'map' ? 'bg-panel text-ink shadow-xs border border-edge/80' : 'text-muted hover:text-ink'
                  }`}
                >
                  <Map size={12} /> Map
                </button>
              </div>
            </div>

            {/* legend row */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b hairline bg-panel/30 px-4 py-1.5 text-[10px]">
              <p className="max-w-[500px] truncate text-[11px] font-medium text-muted">{ctl.scenario.blurb}</p>
              <div className="flex flex-wrap items-center gap-3">
                {LEGEND_CLASSES.map((cl) => (
                  <span key={cl} className="inline-flex items-center gap-1 text-[9.5px] font-medium text-muted">
                    <span className="h-2 w-2 rounded-xs shadow-2xs" style={{ background: CLASS_META[cl].color }} />
                    {CLASS_META[cl].short}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-signal-amber">
                  <span className="h-2 w-2 rounded-xs bg-signal-amber" /> HELD
                </span>
                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-signal-red">
                  ⚠ CONFLICT
                </span>
              </div>
            </div>

            {/* active board body depending on viewMode */}
            <div className="flex min-h-0 flex-1 flex-col">
              {viewMode === 'split' && (
                <>
                  <div className="min-h-0 flex-[5]">
                    <CorridorView snap={ctl.primary} selectedId={selectedId} onSelect={setSelectedId} playing={ctl.playing} speed={ctl.speed} />
                  </div>
                  <div className="min-h-0 flex-[4] border-t hairline">
                    <StringLine snap={ctl.primary} />
                  </div>
                </>
              )}
              {viewMode === 'schematic' && (
                <div className="min-h-0 flex-1 p-2">
                  <CorridorView snap={ctl.primary} selectedId={selectedId} onSelect={setSelectedId} playing={ctl.playing} speed={ctl.speed} />
                </div>
              )}
              {viewMode === 'stringline' && (
                <div className="min-h-0 flex-1 p-2">
                  <StringLine snap={ctl.primary} />
                </div>
              )}
              {viewMode === 'table' && (
                <div className="min-h-0 flex-1 p-2">
                  <TrainTable snap={ctl.primary} selectedId={selectedId} onSelect={setSelectedId} />
                </div>
              )}
              {viewMode === 'map' && (
                <div className="min-h-0 flex-1 p-2">
                  <GeoMap snap={ctl.primary} />
                </div>
              )}
            </div>
          </section>

          {/* bottom row cockpit cards (visible in split/schematic/stringline modes) */}
          {(viewMode === 'split' || viewMode === 'schematic' || viewMode === 'stringline') && (
            <div className="grid h-[280px] shrink-0 grid-cols-1 gap-3 panel-in md:grid-cols-[1.2fr_0.85fr_0.95fr]" style={{ animationDelay: '160ms' }}>
              <TrainTable snap={ctl.primary} selectedId={selectedId} onSelect={setSelectedId} />
              <GeoMap snap={ctl.primary} />
              <EventLog snap={ctl.primary} />
            </div>
          )}
        </div>

        {/* right rail — the glass-box AI explainability copilot */}
        <aside className="panel-in min-h-0 lg:h-full" style={{ animationDelay: '240ms' }}>
          <DispatcherPanel snap={ctl.primary} optimizerOn={ctl.optimizerOn} selectedId={selectedId} />
        </aside>
      </main>
    </div>
  )
}
