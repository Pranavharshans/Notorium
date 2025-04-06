import React from 'react';
import { cn } from '@/lib/utils';

interface Category {
  name: string;
  count: number;
}

interface CategoriesListProps {
  categories: Category[];
  selectedCategories: string[];
  onCategorySelect: (category: string) => void;
}

const CategoriesList: React.FC<CategoriesListProps> = ({
  categories,
  selectedCategories,
  onCategorySelect
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Categories</h3>
      <ul className="space-y-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.name);
          return (
            <li
              key={category.name}
              className="group"
            >
              <button
                onClick={() => onCategorySelect(category.name)}
                className={cn(
                  "w-full py-2 px-3 rounded-lg transition-all duration-200",
                  "flex justify-between items-center",
                  "hover:bg-gray-100 dark:hover:bg-gray-700",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                  isSelected && "bg-blue-50 dark:bg-blue-900/50"
                )}
              >
                <span className={cn(
                  "text-sm font-medium flex items-center gap-2",
                  "text-gray-700 dark:text-gray-300",
                  "group-hover:text-gray-900 dark:group-hover:text-gray-100",
                  isSelected && "text-blue-600 dark:text-blue-400"
                )}>
                  #
                  <span className={cn(
                    "transition-transform duration-200",
                    isSelected && "translate-x-0.5"
                  )}>
                    {category.name}
                  </span>
                </span>
                <span className={cn(
                  "text-xs font-medium rounded-full px-2.5 py-1 transition-all duration-200",
                  isSelected
                    ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                )}>
                  {category.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {categories.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No categories yet
        </p>
      )}
    </div>
  );
};

export default CategoriesList;