import useSWR from 'swr'
import AgentGrid from '../components/AgentGrid'
import PipelineView from '../components/PipelineView'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Home() {
  const { data: health } = useSWR('/api/monitor/health', fetcher, { refreshInterval: 5000 })
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">AILCC — Agent Alignment Dashboard</h1>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <AgentGrid agents={health?.agents || []} />
          <PipelineView />
        </div>
        <div className="col-span-4">
          <div className="p-4 bg-white rounded shadow">
            <h2 className="font-semibold">System Status</h2>
            <pre className="text-sm">{JSON.stringify(health || { status: 'down' }, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
