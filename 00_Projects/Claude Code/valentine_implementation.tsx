import React, { useState } from 'react';
import { CheckCircle2, Circle, Lock, Database, Network, Code, Terminal, FileCode, Shield, AlertTriangle } from 'lucide-react';

export default function ValentineImplementation() {
  const [phase1Progress, setPhase1Progress] = useState({
    github: false,
    linear: false,
    notion: false,
    openai: false,
    anthropic: false,
    perplexity: false
  });

  const [phase2Progress, setPhase2Progress] = useState({
    envFile: false,
    configFile: false,
    npmInit: false
  });

  const [phase3Progress, setPhase3Progress] = useState({
    strategy: '',
    implemented: false
  });

  const togglePhase1 = (key) => {
    setPhase1Progress(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePhase2 = (key) => {
    setPhase2Progress(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const phase1Complete = Object.values(phase1Progress).filter(Boolean).length;
  const phase2Complete = Object.values(phase2Progress).filter(Boolean).length;
  const totalProgress = Math.round(((phase1Complete + phase2Complete + (phase3Progress.implemented ? 1 : 0)) / 10) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🎯 Valentine Core Implementation</h1>
              <p className="text-purple-200">AI Mastermind Network Security Gateway</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">{totalProgress}%</div>
              <div className="text-sm text-purple-200">Complete</div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Security Warning */}
        <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 mb-6 backdrop-blur-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-300 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-red-200 font-bold mb-1">🔐 Security Critical</h3>
              <p className="text-red-100 text-sm">Never commit .env files to git. Never share API tokens. All keys stay local.</p>
            </div>
          </div>
        </div>

        {/* Phase 1: Authentication Layer */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="text-yellow-400" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-white">Phase 1: Authentication Layer</h2>
              <p className="text-purple-200">Generate and configure all API tokens ({phase1Complete}/6)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'github', name: 'GitHub', url: 'https://github.com/settings/tokens', scopes: 'repo, read:org' },
              { key: 'linear', name: 'Linear', url: 'https://linear.app/settings/api', scopes: 'read, write' },
              { key: 'notion', name: 'Notion', url: 'https://www.notion.so/my-integrations', scopes: 'Read content, Update content' },
              { key: 'openai', name: 'OpenAI', url: 'https://platform.openai.com/api-keys', scopes: 'API access' },
              { key: 'anthropic', name: 'Anthropic', url: 'https://console.anthropic.com/settings/keys', scopes: 'API access' },
              { key: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/settings/api', scopes: 'API access' }
            ].map(({ key, name, url, scopes }) => (
              <div 
                key={key}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  phase1Progress[key] 
                    ? 'bg-green-500/20 border-green-400' 
                    : 'bg-white/5 border-white/20 hover:border-purple-400'
                }`}
                onClick={() => togglePhase1(key)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">{name}</span>
                  {phase1Progress[key] ? (
                    <CheckCircle2 className="text-green-400" size={24} />
                  ) : (
                    <Circle className="text-white/40" size={24} />
                  )}
                </div>
                <div className="text-xs text-purple-200 mb-2">Scopes: {scopes}</div>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-300 hover:text-blue-200 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Generate Token →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 2: Configuration Setup */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <FileCode className="text-green-400" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-white">Phase 2: Configuration Setup</h2>
              <p className="text-purple-200">Create config files and initialize project ({phase2Complete}/3)</p>
            </div>
          </div>

          {/* .env File */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Code size={20} />
                Create .env file
              </h3>
              <button
                onClick={() => togglePhase2('envFile')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  phase2Progress.envFile
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {phase2Progress.envFile ? '✓ Complete' : 'Mark Complete'}
              </button>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
{`# .env (Create in project root - DO NOT COMMIT)
GITHUB_TOKEN=ghp_your_token_here
LINEAR_API_KEY=lin_api_your_key_here
NOTION_API_KEY=secret_your_notion_key
OPENAI_API_KEY=sk-your_openai_key
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key
PERPLEXITY_API_KEY=pplx-your_key_here

# Database (Optional - for RAG strategy)
VECTOR_DB_URL=postgresql://localhost:5432/valentine
REDIS_URL=redis://localhost:6379`}
              </pre>
            </div>
          </div>

          {/* valentine.config.js */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal size={20} />
                Create valentine.config.js
              </h3>
              <button
                onClick={() => togglePhase2('configFile')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  phase2Progress.configFile
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {phase2Progress.configFile ? '✓ Complete' : 'Mark Complete'}
              </button>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-blue-400 text-sm">
{`// valentine.config.js
module.exports = {
  security: {
    aiAccessLevels: {
      claude: ['read'], // Read-only access
      grok: ['read', 'write'], // Full access
      perplexity: ['read', 'search'], // Search + read
      chatgpt: ['read', 'write', 'admin'] // Full admin
    },
    rateLimits: {
      perRequest: 100, // Max items per request
      perMinute: 1000, // Max requests per minute
      cacheTime: 300 // Cache results for 5 minutes
    }
  },
  integrations: {
    github: { enabled: true, org: 'your-org' },
    linear: { enabled: true, team: 'your-team' },
    notion: { enabled: true, database: 'your-db-id' }
  },
  dataFlow: 'context-injection' // or 'rag'
};`}
              </pre>
            </div>
          </div>

          {/* NPM Init */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal size={20} />
                Initialize Node.js Project
              </h3>
              <button
                onClick={() => togglePhase2('npmInit')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  phase2Progress.npmInit
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {phase2Progress.npmInit ? '✓ Complete' : 'Mark Complete'}
              </button>
            </div>
            <div className="bg-gray-900 rounded-xl p-4">
              <pre className="text-yellow-400 text-sm">
{`# Run in terminal:
npm init -y
npm install dotenv @octokit/rest @notionhq/client axios
npm install --save-dev nodemon

# Add to .gitignore:
echo ".env" >> .gitignore
echo "node_modules/" >> .gitignore`}
              </pre>
            </div>
          </div>
        </div>

        {/* Phase 3: Data Flow Strategy */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <Database className="text-blue-400" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-white">Phase 3: Choose Data Flow Strategy</h2>
              <p className="text-purple-200">Select your implementation approach</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Context Injection */}
            <div 
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                phase3Progress.strategy === 'context'
                  ? 'bg-blue-500/20 border-blue-400'
                  : 'bg-white/5 border-white/20 hover:border-blue-400'
              }`}
              onClick={() => setPhase3Progress({ strategy: 'context', implemented: false })}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">🚀 Context Injection</h3>
                {phase3Progress.strategy === 'context' && <CheckCircle2 className="text-blue-400" size={24} />}
              </div>
              <p className="text-purple-200 text-sm mb-4">
                Quick start - inject data directly into AI prompts. Best for small to medium datasets.
              </p>
              <div className="text-xs text-purple-300 space-y-1">
                <div>✓ Easy to implement (1-2 hours)</div>
                <div>✓ No database required</div>
                <div>✓ Works with all AI platforms</div>
                <div>✗ Limited to ~10K tokens</div>
              </div>
            </div>

            {/* RAG Strategy */}
            <div 
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                phase3Progress.strategy === 'rag'
                  ? 'bg-purple-500/20 border-purple-400'
                  : 'bg-white/5 border-white/20 hover:border-purple-400'
              }`}
              onClick={() => setPhase3Progress({ strategy: 'rag', implemented: false })}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">⚡ RAG (Vector DB)</h3>
                {phase3Progress.strategy === 'rag' && <CheckCircle2 className="text-purple-400" size={24} />}
              </div>
              <p className="text-purple-200 text-sm mb-4">
                Enterprise solution - semantic search over unlimited data. Best for large datasets.
              </p>
              <div className="text-xs text-purple-300 space-y-1">
                <div>✓ Scales to millions of documents</div>
                <div>✓ Semantic search capabilities</div>
                <div>✓ Fast retrieval with embeddings</div>
                <div>✗ Requires PostgreSQL + pgvector</div>
              </div>
            </div>
          </div>

          {phase3Progress.strategy && (
            <div className="mt-6">
              <button
                onClick={() => setPhase3Progress(prev => ({ ...prev, implemented: true }))}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  phase3Progress.implemented
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {phase3Progress.implemented ? '✓ Strategy Implemented' : 'Mark Strategy as Implemented'}
              </button>
            </div>
          )}
        </div>

        {/* Next Steps */}
        {totalProgress === 100 && (
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-400 rounded-xl p-6 backdrop-blur-lg">
            <h3 className="text-2xl font-bold text-white mb-4">🎉 Setup Complete!</h3>
            <p className="text-green-200 mb-4">Your Valentine Core gateway is ready. Next steps:</p>
            <ol className="space-y-2 text-green-100">
              <li>1. Test GitHub connection with the verification script</li>
              <li>2. Deploy the API gateway server</li>
              <li>3. Configure AI agents to use Valentine Core</li>
              <li>4. Start orchestrating multi-AI workflows!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}