'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import AdminService from '@/lib/admin-service';
import SubscriptionDBService from '@/lib/subscription-db-service';
import { UserData } from '@/lib/admin-service';

export default function AdminSubscriptionsPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const adminService = AdminService.getInstance();
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateRenewal = async () => {
    try {
      setLoading(true);
      const dbService = SubscriptionDBService.getInstance();
      const dodoService = AdminService.getInstance(); // Assuming AdminService can access Dodo

      // Iterate through all users and simulate renewal for Pro subscriptions
      for (const user of users) {
        if (user.subscription.tier === 'pro' && user.subscription.status === 'active') {
          // Simulate renewal payment
          // In a real implementation, this would involve calling Dodo Payments API
          // and handling payment success/failure

          // Update subscription dates (simulated)
          const now = new Date();
          const newEndDate = new Date(now.setMonth(now.getMonth() + 1));

          await dbService.updateSubscription(user.id, {
            endDate: newEndDate,
            startDate: now
          });
        }
      }

      showToast('Simulated renewal for all Pro subscriptions', 'success');
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Failed to simulate renewal:', error);
      showToast('Failed to simulate renewal', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Subscriptions</h1>

        <div className="mb-4">
          <button
            onClick={handleSimulateRenewal}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Simulate Renewal for All Pro Subscriptions'}
          </button>
        </div>

        {/* Display subscription information for each user */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.subscription.tier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.subscription.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.subscription.endDate ? user.subscription.endDate.toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}