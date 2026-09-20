import { useMemo, useRef, useState, useEffect } from 'react'
import { Brain, Send, ShieldAlert, Sparkles } from 'lucide-react'
import type { Snapshot } from '../engine/simulation'
import type { Decision } from '../engine/types'
import { buildLookup, explainDecision, answerQuestion } from '../engine/explain'
import { clock, minsInt } from './format'

interface Msg {
  role: 'user' | 'ai'
  text: string
}

export function DispatcherPanel({
  snap,
  optimizerOn,
  selectedId,
}: {
  snap: Snapshot
  optimizerOn: boolean
  selectedId: string | null
}) {
  const lookup = useMemo(() => buildLookup(snap.trains), [snap.trains])
  const focus: Decision | undefined = useMemo(() => {
    if (selectedId) return snap.decisions.find((d) => d.trainIds.includes(selectedId)) ?? snap.decisions[0]
    return snap.decisions[0]
  }, [snap.decisions, selectedId])

  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const scroller = useRef<HTMLDivElement>(null)

  const ask = (q: string) => {
    if (!q.trim()) return
    const a = answerQuestion(q, snap.trains, snap.decisions, snap.kpis)
    setMessages((m) => [...m, { role: 'user', text: q }, { role: 'ai', text: a.text }])
    setInput('')
  }

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  return (
    <div className="panel-raised flex h-full flex-col overflow-hidden">
      <div className="border-b hairline bg-panel2/40 px-3.5 py-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-ink">
            <Brain size={16} className="text-signal-green" /> Glass-Box Dispatcher
          </span>
          <span className={`tabular rounded-full px-2 py-0.5 text-[9.5px] font-bold shadow-xs ${optimizerOn ? 'bg-signal-green/15 text-signal-green border border-signal-green/30' : 'bg-muted/15 text-muted border border-edge'}`}>
            {optimizerOn ? 'OPTIMIZER ACTIVE' : 'FCFS BASELINE'}
          </span>
        </div>
        <div className="mt-1 text-[11px] font-medium text-signal-green">
          Mathematical decision audit in plain English. Zero black box.
        </div>
      </div>

      {/* Latest decision — the reasoning, grounded in the solver's own numbers */}
      <div className="border-b hairline bg-panel/40 px-3.5 py-3">
        {!focus ? (
          <div className="py-4 text-center text-[11.5px] text-muted font-medium">
            No active crossings yet. Simulation will audit choices here as contentions arise.
          </div>
        ) : (
          <DecisionCard key={focus.id} d={focus} lookup={lookup} />
        )}
      </div>

      {/* Copilot */}
      <div className="flex items-center gap-2 bg-panel2/30 px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
        <Sparkles size={14} className="text-signal-blue" /> Section Controller Copilot
      </div>
      <div ref={scroller} className="min-h-0 flex-1 space-y-2.5 overflow-auto px-3.5 pb-2 pt-1">
        {messages.length === 0 && (
          <div className="rounded-xl border hairline bg-panel2/70 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-muted shadow-xs">
            Every dispatch precedence call is justified by the optimizer's penalty calculation. You can ask why a train is held, verify interlocking safety, or simulate an override tradeoff.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] rounded-xl px-3.5 py-2 text-[11.5px] leading-relaxed animate-rise shadow-xs ${
                m.role === 'user'
                  ? 'bg-signal-blue/15 text-signal-blue font-semibold border border-signal-blue/30'
                  : 'bg-panel2 text-ink border border-edge'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t hairline bg-panel2/40 px-3 py-2.5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {[
            selectedId ? `Why is ${snap.trains.find((t) => t.id === selectedId)?.number ?? ''} held?` : 'Why this call?',
            'Is the section safe?',
            'What if I override?',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => ask(chip)}
              className="cursor-pointer rounded-full border border-edge bg-panel px-2.5 py-1 text-[10.5px] font-medium text-muted shadow-xs transition-colors hover:border-signal-blue/60 hover:text-ink"
            >
              {chip}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask copilot: e.g. why is 12801 held?"
            aria-label="Ask the dispatcher"
            className="tabular min-w-0 flex-1 rounded-lg border border-edge bg-panel px-3 py-1.5 text-[11.5px] text-ink placeholder:text-muted/60 shadow-xs focus:border-signal-blue focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send"
            className="cursor-pointer rounded-lg bg-signal-blue/20 p-2 text-signal-blue transition-colors hover:bg-signal-blue/30 shadow-xs border border-signal-blue/20"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}

function DecisionCard({ d, lookup }: { d: Decision; lookup: ReturnType<typeof buildLookup> }) {
  const exp = explainDecision(d, lookup)
  const isSafety = d.kind === 'SAFETY_REFUSAL'
  const num = (id: string) => lookup.get(id)?.number ?? id
  const chosen = d.options.find((o) => o.order.join() === d.chosenOrder.join())
  const maxCost = Math.max(1, ...d.options.map((o) => o.weightedCostSec))

  return (
    <div className="animate-rise">
      <div className="mb-1.5 flex items-center gap-2">
        {isSafety ? <ShieldAlert size={16} className="text-signal-red shrink-0" /> : <span className="h-2 w-2 rounded-full bg-signal-green animate-blip shrink-0" />}
        <span className={`text-[12px] font-bold ${isSafety ? 'text-signal-red' : 'text-ink'}`}>{exp.headline}</span>
        <span className="tabular ml-auto text-[9.5px] font-medium text-muted">{clock(d.atSec)}</span>
      </div>
      <ul className="space-y-1">
        {exp.rationale.map((r, i) => (
          <li key={i} className="flex gap-1.5 text-[11px] leading-relaxed text-muted">
            <span className={`font-bold ${isSafety ? 'text-signal-red' : 'text-signal-green'}`}>›</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
      {exp.safety && <div className="mt-2 rounded-lg border border-signal-red/30 bg-signal-red/10 px-2.5 py-1.5 text-[10.5px] leading-relaxed text-signal-red font-medium">{exp.safety}</div>}

      {/* option comparison — the explicit trade the optimizer weighed, side by side */}
      {d.options.length > 1 && chosen && (
        <div className="mt-2.5 space-y-1.5">
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted">What the optimizer weighed</div>
          {d.options.slice(0, 3).map((o) => {
            const win = o === chosen
            const held = o.order.slice(1).map(num).join(', ')
            const deltaWm = minsInt(o.weightedCostSec - chosen.weightedCostSec)
            return (
              <div
                key={o.order.join()}
                className={`rounded-lg border px-2.5 py-1.5 transition-all shadow-xs ${win ? 'border-signal-green/50 bg-signal-green/10' : 'border-edge bg-panel2'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-semibold ${win ? 'text-signal-green' : 'text-muted'}`}>
                    {win ? '✓ ' : ''}Clear {num(o.order[0])}
                    {held ? `, hold ${held}` : ''}
                  </span>
                  <span className="tabular shrink-0 text-[10.5px] font-medium text-muted">
                    {minsInt(o.weightedCostSec)} wm
                    {!win && deltaWm > 0 && <span className="text-signal-red font-bold"> +{deltaWm}</span>}
                  </span>
                </div>
                <div className="relative mt-1 h-1.5 overflow-hidden rounded-full bg-panel border border-edge/40">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(3, (o.weightedCostSec / maxCost) * 100)}%`,
                      background: win ? 'var(--signal-green)' : '#94a3b8',
                      boxShadow: win ? '0 0 6px rgba(5,150,105,0.4)' : 'none',
                    }}
                  />
                </div>
              </div>
            )
          })}
          <div className="text-[9.5px] leading-snug text-muted">
            wm = weighted delay-minutes (delay × train priority). The optimizer selects the mathematically lowest penalty.
          </div>
        </div>
      )}
    </div>
  )
}
