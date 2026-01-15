import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Skeleton from 'react-loading-skeleton';

const TaskChart = ({ data, isLoading }) => {
  console.log("Data ", data);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <Skeleton height={24} width={200} className="mb-6" />
        <Skeleton height={200} />
      </div>
    );
  }

  // If no data or empty array, show placeholder
  if (!data || data.length === 0 || data.every(item =>
    (item.completed === 0 && item.pending === 0 && item.inProgress === 0 && item.delayed === 0)
  )) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">No chart data available</p>
          <p className="text-sm text-gray-400 mt-1">
            Complete some tasks to see your progress chart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Task Overview</h3>
          <p className="text-sm text-gray-500 mt-1">Weekly performance metrics</p>
        </div>

      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="#4CAF50"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="pending"
              name="Pending"
              fill="#FF9800"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="inProgress"
              name="In Progress"
              fill="#2196F3"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="delayed"
              name="Delayed"
              fill="#F44336"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TaskChart;