"use client";

import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth'; // Added import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { quotaService, QUOTA_LIMITS, SubscriptionTier } from "@/lib/quota-service"; // Import QUOTA_LIMITS and SubscriptionTier

export default function ProfilePage() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const { subscriptionData, loading: subscriptionLoading, isSubscriptionActive } = useSubscription();
  const [quotaData, setQuotaData] = useState<{
    recording: { minutesRemaining: number; percentageUsed: number; subscriptionStatus?: SubscriptionTier }; // Add subscriptionStatus
    enhance: { enhancesRemaining: number; percentageUsed: number; subscriptionStatus?: SubscriptionTier }; // Add subscriptionStatus
  }>({
    recording: { minutesRemaining: 0, percentageUsed: 0 },
    enhance: { enhancesRemaining: 0, percentageUsed: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [cancelIsLoading, setCancelIsLoading] = useState(false); // Added state
  const [cancelError, setCancelError] = useState<string | null>(null); // Added state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false); // Added state
  const [cancelEndDate, setCancelEndDate] = useState<string | null>(null); // Added state
  const auth = getAuth(); // Added auth instance

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    async function fetchQuota() {
      try {
        if (!user) {
          console.error("User is null, cannot fetch quota.");
          setLoading(false);
          return;
        }

        // Initialize default quotas with trial status
        let recordingQuota = {
          minutesRemaining: 0,
          percentageUsed: 100,
          subscriptionStatus: 'trial' as SubscriptionTier
        };

        let enhanceQuota = {
          enhancesRemaining: 0,
          percentageUsed: 0,
          subscriptionStatus: 'trial' as SubscriptionTier
        };

        // Fetch recording quota
        try {
          recordingQuota = await quotaService.checkRecordingQuota(user.uid);
        } catch (error: any) {
          console.error("Error fetching recording quota:", error);
          if (error.name === 'RecordingQuotaExhaustedError') {
            recordingQuota.percentageUsed = 100;
          }
        }

        // Fetch enhance quota
        try {
          enhanceQuota = await quotaService.checkEnhanceQuota(user.uid);
        } catch (error: any) {
          console.error("Error fetching enhance quota:", error);
          if (error.name === 'EnhanceQuotaExhaustedError') {
            enhanceQuota.percentageUsed = 100;
          }
        }

        setQuotaData({
          recording: recordingQuota,
          enhance: enhanceQuota
        });
      } catch (error) {
        console.error("Error in fetchQuota:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuota();
  }, [user, router]);

  if (!user || loading || subscriptionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleManageSubscription = () => {
    // Instead of navigating, show the confirmation dialog
    setShowCancelConfirm(true);
    setCancelError(null); // Reset error when showing confirm
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelIsLoading(true);
      setCancelError(null);

      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      setCancelEndDate(data.end_date);
      setShowCancelConfirm(false);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCancelIsLoading(false);
    }
  };

  const getPlanName = () => {
    if (!subscriptionData) return "Free Plan";
    return "Pro Plan";
  };

  const getStatusColor = () => {
    if (!subscriptionData) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    if (isSubscriptionActive) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  };

  const getStatusText = () => {
    if (!subscriptionData) return "Free";
    if (isSubscriptionActive) return "Active";
    return subscriptionData.status.charAt(0).toUpperCase() + subscriptionData.status.slice(1);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-3 border-b pb-7 pt-6">
          <div className="h-24 w-24 rounded-full overflow-hidden">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl text-gray-500 dark:text-gray-400">
                {(user.displayName || user.email || "?")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">{user.displayName || "User"}</CardTitle>
            <CardDescription className="text-base">{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Plan</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            <div className="text-lg font-semibold dark:text-white">
              {getPlanName()}
            </div>
            {subscriptionData?.next_billing_date && (
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Renews on {new Date(subscriptionData.next_billing_date).toLocaleDateString()}
              </div>
            )}
          </div>

          <Tabs defaultValue="usage" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>
            {/* Remove className prop as it's not accepted by TabsContent */}
            <TabsContent value="usage">
              <div className="space-y-4 pt-4"> {/* Apply styling to a wrapper div */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Recording Minutes</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {quotaData.recording.subscriptionStatus ?
                      `${QUOTA_LIMITS[quotaData.recording.subscriptionStatus].recordingMinutes - quotaData.recording.minutesRemaining} used / ${QUOTA_LIMITS[quotaData.recording.subscriptionStatus].recordingMinutes} total` :
                      `${quotaData.recording.minutesRemaining} remaining`
                    }
                  </span>
                </div>
                <Progress value={quotaData.recording.percentageUsed} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">AI Enhancements</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {quotaData.enhance.subscriptionStatus ?
                      `${QUOTA_LIMITS[quotaData.enhance.subscriptionStatus].enhanceNotes - quotaData.enhance.enhancesRemaining} used / ${QUOTA_LIMITS[quotaData.enhance.subscriptionStatus].enhanceNotes} total` :
                      `${quotaData.enhance.enhancesRemaining} remaining`
                    }
                  </span>
                </div>
                <Progress value={quotaData.enhance.percentageUsed} className="h-2" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 border-t p-6">
        {/* Only show Manage/Cancel Subscription if active */}
        {isSubscriptionActive && !cancelEndDate && (
          <>
            {!showCancelConfirm ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleManageSubscription}
                disabled={cancelIsLoading}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Cancel Subscription
              </Button>
            ) : (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 mb-4">
                  Are you sure you want to cancel your subscription? You'll continue to have access until your current billing period ends.
                </p>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleCancelSubscription}
                    disabled={cancelIsLoading}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {cancelIsLoading ? 'Cancelling...' : 'Yes, Cancel'}
                  </Button>
                  <Button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelIsLoading}
                    variant="outline"
                    className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300"
                  >
                    No, Keep Subscription
                  </Button>
                </div>
                {cancelError && (
                  <p className="mt-2 text-sm text-red-600">
                    {cancelError}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Show cancellation confirmation message */}
        {cancelEndDate && (
          <div className="w-full p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Your subscription has been cancelled. You will have access until {new Date(cancelEndDate).toLocaleDateString()}.
            </p>
          </div>
        )}

        {/* Always show Logout button */}
        <Button
          variant="outline"
          className="w-full justify-start text-red-500 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </CardFooter>
    </Card>
  </div>
  );
}