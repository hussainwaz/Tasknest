import React from "react";
export default function ProductivityChart({ completed, pending, overdue }) {
  const total = completed + pending + overdue;
  const completedPercentage = total > 0 ? (completed / total) * 100 : 0;
  const pendingPercentage = total > 0 ? (pending / total) * 100 : 0;
  const overduePercentage = total > 0 ? (overdue / total) * 100 : 0;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Visualization */}
      <div className="flex-1 flex items-end gap-1 h-24 px-4">
        {/* Completed Bar */}
        <div 
          className="flex-1 bg-green-500 rounded-t-sm transition-all duration-500 ease-out"
          style={{ height: `${completedPercentage}%` }}
        >
          <div className="text-xs text-center text-white mt-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {completed}
          </div>
        </div>
        
        {/* Pending Bar */}
        <div 
          className="flex-1 bg-yellow-500 rounded-t-sm transition-all duration-500 ease-out"
          style={{ height: `${pendingPercentage}%` }}
        >
          <div className="text-xs text-center text-white mt-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {pending}
          </div>
        </div>
        
        {/* Overdue Bar */}
        <div 
          className="flex-1 bg-red-500 rounded-t-sm transition-all duration-500 ease-out"
          style={{ height: `${overduePercentage}%` }}
        >
          <div className="text-xs text-center text-white mt-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {overdue}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500"></div>
          <span className="text-gray-300">Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-yellow-500"></div>
          <span className="text-gray-300">Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-red-500"></div>
          <span className="text-gray-300">Overdue</span>
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-between mt-2 px-4 text-xs text-gray-400">
        <div className="text-center">
          <div className="text-green-400 font-medium">{completed}</div>
          <div>Completed</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-400 font-medium">{pending}</div>
          <div>Pending</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 font-medium">{overdue}</div>
          <div>Overdue</div>
        </div>
      </div>
    </div>
  );
}