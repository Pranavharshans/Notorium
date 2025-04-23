"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const BillingDetailsPage = () => {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [street, setStreet] = useState("");
  const [zipcode, setZipcode] = useState("");
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const productIdFromParams = searchParams.get("productId");
    if (productIdFromParams) {
      setProductId(productIdFromParams);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) {
      console.error("Missing productId");
      return;
    }

    const billingDetails = {
      city,
      country,
      state,
      street,
      zipcode,
    };

    try {
      const response = await fetch("/api/checkout/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...billingDetails,
          productId: productId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Checkout failed: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      router.push(data.payment_link);
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-white dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Enter Your Billing Details
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              State
            </label>
            <input
              type="text"
              id="state"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="street"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Street
            </label>
            <input
              type="text"
              id="street"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="zipcode"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Zip Code
            </label>
            <input
              type="text"
              id="zipcode"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingDetailsPage;