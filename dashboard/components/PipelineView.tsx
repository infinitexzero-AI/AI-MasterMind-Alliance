export default function PipelineView() {
  return (
    <div className="mt-6 p-4 bg-white rounded shadow">
      <h3 className="font-semibold">Pipeline Execution</h3>
      <p className="text-sm text-slate-500">Recent orchestration runs, PR statuses, and recent push reports.</p>
      {/* placeholder table — CodexForge can wire with /api/monitor/pipeline */}
      <div className="mt-3 text-xs text-slate-700">No runs yet — start a push.</div>
    </div>
  )
}
