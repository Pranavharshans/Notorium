"use client";

import { useRouter, useSearchParams } from "next/navigation";
import CustomerPaymentForm from "@/components/ui/CustomerPaymentForm";
import { useAuth } from "@/context/auth-context";
import { useState, Suspense } from "react";
import type { z } from "zod";
import type { formSchema } from "@/components/ui/CustomerPaymentForm";

function BillingDetailsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!productId || !user) {
      router.push("/pricing");
      return;
    }

    try {
      setIsLoading(true);
      console.log('Form data submitted:', data); // Log form data
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/api/checkout/subscription?productId=${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            billing: {
              city: data.city,
              country: data.country,
              state: data.state,
              street: data.addressLine,
              zipcode: data.zipCode,
            },
            customer: {
              email: data.email,
              name: `${data.firstName} ${data.lastName}`,
            }
          }),
          cache: "no-store",
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Checkout failed: ${errorData.error || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('API response:', responseData); // Log API response
      if (responseData.payment_link) {
        router.push(responseData.payment_link);
      } else {
        throw new Error("No payment link received");
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (!productId) {
    return (
      <div className="p-4">
        <p>Invalid request. Please select a plan first.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="pb-6">
        <button 
          onClick={() => router.push('/pricing')} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Pricing
        </button>
      </div>
      <CustomerPaymentForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        userEmail={user?.email || ''}
      />
    </div>
  );
}

export default function BillingDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingDetailsPageInner />
    </Suspense>
  );
}