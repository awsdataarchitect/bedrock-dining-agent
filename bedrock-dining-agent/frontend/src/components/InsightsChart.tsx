import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface InsightsChartProps {
  title: string;
  data: ChartData[];
  type?: 'bar' | 'pie' | 'donut';
  className?: string;
}

const InsightsChart: React.FC<InsightsChartProps> = ({
  title,
  data,
  type = 'bar',
  className = '',
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  const defaultColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const getColor = (index: number, customColor?: string) => {
    return customColor || defaultColors[index % defaultColors.length];
  };

  const renderBarChart = () => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: getColor(index, item.color),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="flex items-center space-x-6">
        {/* Simple pie representation using CSS */}
        <div className="relative w-32 h-32">
          <div className="w-full h-full rounded-full bg-gray-200 relative overflow-hidden">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const startAngle = cumulativePercentage * 3.6; // Convert to degrees
              cumulativePercentage += percentage;
              
              return (
                <div
                  key={item.label}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from ${startAngle}deg, ${getColor(index, item.color)} 0deg, ${getColor(index, item.color)} ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg)`,
                  }}
                />
              );
            })}
          </div>
          {type === 'donut' && (
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">Total</span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={item.label} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getColor(index, item.color) }}
                />
                <span className="text-sm text-gray-700">
                  {item.label}: {item.value} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="text-2xl">📊</span>
          <p className="mt-2">No data available</p>
        </div>
      ) : type === 'bar' ? (
        renderBarChart()
      ) : (
        renderPieChart()
      )}
    </div>
  );
};

export default InsightsChart;