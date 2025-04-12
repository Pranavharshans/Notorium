'use client';

import React, { useState } from 'react';
import { SubscriptionTier } from '@/lib/subscription-config';
import { useToast } from '@/components/ui/toast';
import AdminService from '@/lib/admin-service';
import SubscriptionDBService from '@/lib/subscription-db-service';

interface AdminActionsProps {
  userId: string;
  currentTier: SubscriptionTier;
  onActionComplete: () => void;
}

export default function AdminActions({ 
  userId, 
  currentTier,
  onActionComplete 
}: AdminActionsProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState<'reset' | 'change' | null>(null);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(currentTier);

  const handleResetUsage = async () => {
    try {
      setLoading(true);
      const dbService = SubscriptionDBService.getInstance();
      await dbService.resetUsage(userId);
      showToast('Usage reset successfully', 'success');
      onActionComplete();
    } catch (error) {
      console.error('Failed to reset usage:', error);
      showToast('Failed to reset usage', 'error');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleChangeTier = async () => {
    try {
      setLoading(true);
      const dbService = SubscriptionDBService.getInstance();
      await dbService.updateSubscription(userId, {
        tier: selectedTier,
        status: 'active',
        startDate: new Date(),
        endDate: null
      });
      showToast('Subscription tier updated successfully', 'success');
      onActionComplete();
    } catch (error) {
      console.error('Failed to change tier:', error);
      showToast('Failed to update subscription tier', 'error');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">
          {actionType === 'reset' 
            ? 'Reset Usage Counters'
            : 'Change Subscription Tier'}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {actionType === 'reset'
            ? 'This will reset all usage counters to zero. Are you sure?'
            : `Change subscription tier to ${selectedTier.toUpperCase()}?`}
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowConfirmation(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={actionType === 'reset' ? handleResetUsage : handleChangeTier}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-lg mb-4">Admin Actions</h3>
      
      {/* Change Subscription Tier */}
      <div className="flex items-center gap-4">
        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value as SubscriptionTier)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="free">Free Tier</option>
          <option value="pro">Pro Tier</option>
        </select>
        <button
          onClick={() => {
            setActionType('change');
            setShowConfirmation(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={selectedTier === currentTier}
        >
          Change Tier
        </button>
      </div>

      {/* Reset Usage */}
      <div>
        <button
          onClick={() => {
            setActionType('reset');
            setShowConfirmation(true);
          }}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
        >
          Reset Usage Counters
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && <ConfirmationModal />}
    </div>
  );
}