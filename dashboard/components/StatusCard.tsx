import React from 'react';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
};

export default function StatusCard({ title, value, subtitle }: Props) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
    </div>
  );
}
