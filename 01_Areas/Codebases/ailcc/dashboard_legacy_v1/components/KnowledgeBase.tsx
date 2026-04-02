import React from 'react';

export default function KnowledgeBase() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <header className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">Knowledge Base</h2>
        <p className="text-sm text-gray-500">Pattern Library & SOPs</p>
      </header>
      
      <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center p-6">
          <div className="text-4xl mb-2">📚</div>
          <h3 className="font-semibold text-gray-700">Library Online</h3>
          <p className="text-xs text-gray-500 mt-1">14,205 Vectors Indexed</p>
          <button className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
            Search Archive
          </button>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
         <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sync Status</span>
            <span className="text-green-600 font-bold">● Active</span>
         </div>
         <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
             <div className="bg-blue-500 h-full w-[85%]"></div>
         </div>
      </div>
    </div>
  );
}
