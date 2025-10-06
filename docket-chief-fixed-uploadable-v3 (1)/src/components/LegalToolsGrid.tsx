import React from 'react';

interface LegalTool {
  id: string;
  title: string;
  description: string;
  image: string;
  onClick: () => void;
}

interface LegalToolsGridProps {
  tools: LegalTool[];
}

export const LegalToolsGrid: React.FC<LegalToolsGridProps> = ({ tools }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-6 py-12">
      {tools.map((tool) => (
        <div
          key={tool.id}
          onClick={tool.onClick}
          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 group"
        >
          <div className="aspect-square overflow-hidden rounded-t-xl">
            <img
              src={tool.image}
              alt={tool.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {tool.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};