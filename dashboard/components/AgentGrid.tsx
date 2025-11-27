type Agent = {
  id: string
  name: string
  mode: 'real'|'mock'
  healthScore: number
  lastSeen: string
  avgLatencyMs?: number
}

export default function AgentGrid({ agents }: { agents: Agent[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {agents.map(a => (
        <div key={a.id} className="p-3 bg-white rounded shadow">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">{a.name}</h3>
              <p className="text-sm text-slate-500">{a.mode.toUpperCase()}</p>
            </div>
            <div className="text-right">
              <div className={`text-sm ${a.healthScore>75 ? 'text-green-600' : a.healthScore>40 ? 'text-yellow-600' : 'text-red-600'}`}>{a.healthScore}%</div>
              <div className="text-xs text-slate-400">{a.avgLatencyMs ?? '—'} ms</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">Last: {new Date(a.lastSeen).toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}
