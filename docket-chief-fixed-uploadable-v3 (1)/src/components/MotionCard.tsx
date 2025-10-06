import React from 'react';

interface MotionCardProps {
  title: string;
  description: string;
  rule: string;
  icon: string;
  onClick: () => void;
}

export const MotionCard: React.FC<MotionCardProps> = ({
  title,
  description,
  rule,
  icon,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 group"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <img src={icon} alt={title} className="w-12 h-12 mr-4" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700">
              {title}
            </h3>
            <span className="text-sm text-blue-600 font-medium">{rule}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        <div className="mt-4 flex justify-end">
          <span className="text-blue-600 text-sm font-medium group-hover:text-blue-700">
            Create Motion →
          </span>
        </div>
      </div>
    </div>
  );
};