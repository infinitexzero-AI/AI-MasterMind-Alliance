import React, { useState, useEffect } from 'react';
// fetch is globally available in browsers
import { Zap } from 'lucide-react';
import promptTemplates from '../data/promptTemplates.json';
import { runAction } from '../services/agentActionService';

export const AgentActionPanel = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [params, setParams] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (template) => {
    setSelectedTemplate(template);
    // initialise params with empty strings for each defined parameter
    const init = {};
    template.parameters.forEach(p => {
      init[p.name] = '';
    });
    setParams(init);
    setResult(null);
  };

  const handleChange = (e, name) => {
    setParams({ ...params, [name]: e.target.value });
  };

  const handleRun = async () => {
    if (!selectedTemplate) return;
    setLoading(true);
    try {
      const response = await runAction(selectedTemplate.id, params);
      setResult(response);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
      <h2 className="text-lg font-orbitron font-bold flex items-center gap-2 text-cyan-400">
        <Zap className="w-5 h-5" /> Agent Action Center
      </h2>

      {/* Template List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promptTemplates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => handleSelect(tpl)}
            className={`p-4 border rounded-lg text-left transition-colors ${selectedTemplate?.id === tpl.id ? 'bg-cyan-500/10 border-cyan-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
          >
            <h3 className="font-semibold text-cyan-300">{tpl.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{tpl.description}</p>
          </button>
        ))}
      </div>

      {/* Parameter Form */}
      {selectedTemplate && (
        <div className="mt-4 flex flex-col gap-4">
          <h3 className="font-medium text-slate-300">Parameters for "{selectedTemplate.title}"</h3>
          {selectedTemplate.parameters.map((p) => (
            <div key={p.name} className="flex flex-col">
              <label className="text-xs text-slate-400 mb-1" htmlFor={p.name}>{p.label}</label>
              {p.type === 'textarea' ? (
                <textarea
                  id={p.name}
                  rows={4}
                  placeholder={p.placeholder}
                  value={params[p.name]}
                  onChange={(e) => handleChange(e, p.name)}
                  className="bg-white/5 border border-white/10 rounded p-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              ) : (
                <input
                  type="text"
                  id={p.name}
                  placeholder={p.placeholder}
                  value={params[p.name]}
                  onChange={(e) => handleChange(e, p.name)}
                  className="bg-white/5 border border-white/10 rounded p-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              )}
            </div>
          ))}
          <button
            onClick={handleRun}
            disabled={loading}
            className="self-start bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Run Action'}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded">
          <h3 className="font-medium text-slate-300 mb-2">Result</h3>
          {result.error ? (
            <p className="text-red-400">Error: {result.error}</p>
          ) : (
            <pre className="text-sm whitespace-pre-wrap text-slate-200">{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
};
