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
      console.log('Form submitted with values:', data);
      
      const response = await fetch(
        `/api/checkout/subscription?productId=${productId}`,
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

      // Attempt to parse the response JSON
      let responseData;
      try {
        responseData = await response.json();
        console.log('API response:', responseData);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        responseData = { error: `${response.status} ${response.statusText}` };
      }

      // Check if the response was not OK (error status code)
      if (!response.ok) {
        console.error('Error response from server:', responseData);
        
        // Extract detailed error information if available
        const errorMessage = responseData.error || 'Unknown error';
        const errorDetails = responseData.details || '';
        const debugInfo = responseData.debug || {};
        
        // Display the error to console with all available debug info
        console.error('Payment processing failed:',
          { message: errorMessage, details: errorDetails, debug: debugInfo }
        );
        
        // Use a simple formatted error message for the alert
        const alertMessage = errorDetails 
          ? `${errorMessage}: ${errorDetails}`
          : errorMessage;
          
        alert(`Payment processing error: ${alertMessage}`);
        return;
      }

      // Handle successful response
      if (responseData.payment_link) {
        console.log('Redirecting to payment link:', responseData.payment_link);
        router.push(responseData.payment_link);
      } else {
        console.error('Missing payment_link in response:', responseData);
        alert('Error: No payment link was provided by the payment system.');
      }
    } catch (error) {
      console.error('Unexpected error during checkout:', error);
      alert(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
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