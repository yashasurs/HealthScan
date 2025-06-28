import React from 'react';

const PatientChart = ({ timeframe }) => {
  // Hardcoded data for different timeframes
  const chartData = {
    week: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      appointments: [12, 15, 8, 20, 18, 5, 3],
      maxValue: 25
    },
    month: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      appointments: [78, 85, 92, 88],
      maxValue: 100
    },
    quarter: {
      labels: ['Jan', 'Feb', 'Mar'],
      appointments: [245, 289, 267],
      maxValue: 300
    },
    year: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      appointments: [801, 923, 856, 1012],
      maxValue: 1100
    }
  };

  const data = chartData[timeframe];

  return (
    <div className="relative h-64">
      <div className="flex items-end justify-between h-full space-x-2 pl-8">
        {data.labels.map((label, index) => {
          const height = (data.appointments[index] / data.maxValue) * 100;
          return (
            <div key={label} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center justify-end h-48">
                <div 
                  className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 ease-out hover:from-blue-600 hover:to-blue-500 cursor-pointer relative group"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {data.appointments[index]} appointments
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-600 mt-2 font-medium">{label}</span>
            </div>
          );
        })}
      </div>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-xs text-gray-500">
        <span>{data.maxValue}</span>
        <span>{Math.floor(data.maxValue * 0.75)}</span>
        <span>{Math.floor(data.maxValue * 0.5)}</span>
        <span>{Math.floor(data.maxValue * 0.25)}</span>
        <span>0</span>
      </div>
    </div>
  );
};

export default PatientChart;
