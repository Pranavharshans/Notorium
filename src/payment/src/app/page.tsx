"use client";

import ProductCard from "./components/ProductCard";
import { auth } from "@/lib/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";

type Product = {
  product_id: number;
  name: string;
  description: string;
  price: number;
  is_recurring: boolean;
};

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { subscriptionData, isSubscriptionActive, loading: subscriptionLoading } = useSubscription();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
          cache: 'no-store'
        });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      if (!user) {
        router.push('/auth/signin');
      } else {
        fetchProducts();
      }
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Dodo Payments Product List</h1>
          {!subscriptionLoading && (
            <div className="mt-2">
              <span className="text-sm">
                Subscription Status:{' '}
                <span className={`font-semibold ${
                  isSubscriptionActive ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {subscriptionData?.status || 'No active subscription'}
                </span>
              </span>
              {subscriptionData?.next_billing_date && (
                <span className="text-sm ml-4">
                  Next Billing: {new Date(subscriptionData.next_billing_date).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => auth.signOut().then(() => router.push('/auth/signin'))}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
      
      {isSubscriptionActive ? (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-semibold text-green-700">Premium Features Unlocked! 🎉</h2>
          <p className="text-green-600 mt-2">
            Thank you for your subscription. You now have access to all premium features.
          </p>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-700">Upgrade to Premium</h2>
          <p className="text-yellow-600 mt-2">
            Subscribe to unlock premium features and enhance your experience.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            isSubscribed={isSubscriptionActive}
          />
        ))}
      </div>
    </div>
  );
}
