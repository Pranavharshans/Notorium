'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import UsageStatsGraph from '@/components/admin/UsageStatsGraph';
import AdminActions from '@/components/admin/AdminActions';
import AdminService from '@/lib/admin-service';
import { useToast } from '@/components/ui/toast';

interface UserUsageData {
  id: string;
  name: string;
  email: string;
  recordingTimeUsed: number;
  aiActionsUsed: number;
}

export default function AdminUsagePage() {
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<UserUsageData[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const adminService = AdminService.getInstance();
      const users = await adminService.getUsers();
      
      const usageData = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        recordingTimeUsed: user.usage.recordingTimeUsed,
        aiActionsUsed: user.usage.aiActionsUsed
      }));

      setUsageData(usageData);
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
      showToast('Failed to load usage data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for the graphs
  const graphData = {
    labels: usageData.map(user => user.name),
    recordingTime: usageData.map(user => user.recordingTimeUsed),
    aiActions: usageData.map(user => user.aiActionsUsed)
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recording Time Usage Graph */}
          <ErrorBoundary>
            <UsageStatsGraph
              data={{
                labels: graphData.labels,
                recordingTime: graphData.recordingTime,
                aiActions: []
              }}
              title="Recording Time Usage by User"
            />
          </ErrorBoundary>

          {/* AI Actions Usage Graph */}
          <ErrorBoundary>
            <UsageStatsGraph
              data={{
                labels: graphData.labels,
                recordingTime: [],
                aiActions: graphData.aiActions
              }}
              title="AI Actions Usage by User"
            />
          </ErrorBoundary>
        </div>

        {/* User Selection and Admin Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <select
                value={selectedUser || ''}
                onChange={(e) => setSelectedUser(e.target.value || null)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a user...</option>
                {usageData.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {selectedUser && (
              <ErrorBoundary>
                <AdminActions
                  userId={selectedUser}
                  currentTier="free" // This should come from user data
                  onActionComplete={() => {
                    fetchUsageData();
                    showToast('Action completed successfully', 'success');
                  }}
                />
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}