import React from 'react';

export interface DataGridColumn<T> {
  header: string;
  key: string;
  render?: (item: T) => React.ReactNode;
}

export function DataGrid<T>({ 
  data, 
  columns, 
  keyExtractor, 
  className = '' 
}: { 
  data: T[]; 
  columns: DataGridColumn<T>[]; 
  keyExtractor: (item: T) => string; 
  className?: string; 
}) {
  return (
    <div className={`w-full overflow-x-auto custom-scrollbar ${className}`}>
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="text-[10px] font-mono tracking-widest uppercase text-slate-500 bg-slate-900/50">
          <tr>
            {columns.map((col, i) => (
              <th key={col.key || i} className="px-4 py-3 border-b border-slate-700/50 font-medium whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50 bg-slate-900/20">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-slate-800/30 transition-colors">
              {columns.map((col, i) => (
                <td key={col.key || i} className="px-4 py-3 whitespace-nowrap">
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">
                No Data Available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
