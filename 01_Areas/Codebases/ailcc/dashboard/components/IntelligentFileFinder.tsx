import React, { useState } from 'react';
import useSWR from 'swr';
import type { SearchResponse } from '../pages/api/storage/search';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface FileResultItemProps {
  name: string;
  path: string;
  tier: 'hot' | 'warm' | 'cold';
  size: string;
  modified: string;
  accessed: string;
}

const FileResultItem: React.FC<FileResultItemProps> = ({
  name,
  path,
  tier,
  size,
  modified,
  accessed,
}) => {
  const tierIcons = {
    hot: '🔥',
    warm: '💾',
    cold: '🧊',
  };

  const tierColors = {
    hot: 'text-orange-400',
    warm: 'text-blue-400',
    cold: 'text-cyan-400',
  };

  const handleOpen = () => {
    // This would be implemented with an API call to open the file
    /* TODO: open file natively */
  };

  const handleShowInFinder = () => {
    // This would be implemented with an API call to reveal in Finder
    /* TODO: reveal in Finder */
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{tierIcons[tier]}</span>
          <div>
            <h4 className="font-semibold">{name}</h4>
            <p className="text-xs text-gray-400 truncate max-w-md">{path}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold ${tierColors[tier]}`}>
          {tier.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
        <span>Size: {size}</span>
        <span>Modified: {modified}</span>
        <span>Accessed: {accessed}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleOpen}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
        >
          Open
        </button>
        <button
          onClick={handleShowInFinder}
          className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
        >
          Show in Finder
        </button>
      </div>
    </div>
  );
};

export const IntelligentFileFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tier, setTier] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [fileType, setFileType] = useState('');

  const { data, error, isLoading } = useSWR<SearchResponse>(
    searchQuery
      ? `/api/storage/search?q=${encodeURIComponent(searchQuery)}&tier=${tier}&type=${fileType}`
      : null,
    fetcher
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🔍 Find Files</h2>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for files..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Search
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Storage:</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as any)}
              title="Filter by storage tier"
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="hot">🔥 Hot Storage</option>
              <option value="warm">💾 Warm Storage</option>
              <option value="cold">🧊 Cold Storage</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">File Type:</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              title="Filter by file type"
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word</option>
              <option value="xlsx">Excel</option>
              <option value="txt">Text</option>
              <option value="md">Markdown</option>
              <option value="zip">Archive</option>
            </select>
          </div>
        </div>
      </form>

      {/* Results */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          {searchQuery ? `Results for "${searchQuery}"` : 'Enter a search query'}
        </h3>

        {isLoading && (
          <div className="text-center py-8 text-gray-400">
            <div className="animate-spin text-4xl mb-2">🔄</div>
            <p>Searching across all storage tiers...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-400">
            <p>Failed to search files</p>
          </div>
        )}

        {data && !isLoading && (
          <>
            {data.results.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-4">
                  Found {data.results.length} file(s)
                </p>
                {data.results.map((result, index) => (
                  <FileResultItem
                    key={`${result.path}-${index}`}
                    name={result.name}
                    path={result.path}
                    tier={result.tier}
                    size={result.size}
                    modified={result.modified}
                    accessed={result.accessed}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No files found matching "{searchQuery}"</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </div>
            )}
          </>
        )}

        {!searchQuery && !isLoading && (
          <div className="text-center py-8 text-gray-400">
            <p>Search across all storage tiers</p>
            <p className="text-sm mt-2">
              Enter a filename or keyword to find files
            </p>
          </div>
        )}
      </div>

      {/* Smart Suggestions */}
      {data && data.results.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-400">
            💡 Smart Suggestions
          </h3>
          <p className="text-sm text-gray-300">
            Files in Warm or Cold storage that haven't been accessed recently
            could be archived or deleted to free up space.
          </p>
        </div>
      )}
    </div>
  );
};

export default IntelligentFileFinder;
