export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8 animate-pulse">
            <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 dark:bg-gray-700" />
            <div className="h-8 w-48 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
            <div className="h-8 w-48 mb-6 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="space-y-6">
              <div>
                <div className="h-6 w-32 mb-2 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 w-24 mt-2 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div>
                <div className="h-6 w-32 mb-2 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 w-24 mt-2 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}