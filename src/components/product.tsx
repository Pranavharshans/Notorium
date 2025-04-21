"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CancelSubscription } from "./CancelSubscription";
import { SubscriptionStatus } from "./SubscriptionStatus";
import { useSubscription } from "@/hooks/useSubscription";

type Product = {
  product_id: number;
  name: string;
  description: string;
  price: number;
  is_recurring: boolean;
};

interface ProductCardProps {
  product: Product;
  isSubscribed?: boolean;
}

export default function ProductCard({ product, isSubscribed = false }: ProductCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { subscriptionData } = useSubscription();

  const checkoutProduct = async (productId: number, is_recurring: boolean) => {
    try {
      setLoading(true);
      const productType = is_recurring ? "subscription" : "onetime";
      
      console.log('Creating checkout session for:', {
        productId,
        productType,
        is_recurring
      });

      const response = await fetch(
        `/api/checkout/${productType}?productId=${productId}`,
        {
          cache: "no-store",
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Checkout failed: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('Checkout session created:', {
        payment_link: data.payment_link,
        metadata: data.metadata
      });

      router.push(data.payment_link);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isProductSubscription = product.is_recurring;
  const showSubscribeButton = isProductSubscription && !isSubscribed;
  const showActiveSubscription = isProductSubscription && isSubscribed;
  const showBuyButton = !isProductSubscription;

  // Show subscription status if we have subscription data and it's not active
  const showSubscriptionStatus = subscriptionData && 
    (subscriptionData.status === 'pending' || subscriptionData.status === 'on_hold');

  return (
    <div 
      className={`bg-white border rounded-lg shadow-lg p-6 hover:transform hover:scale-105 hover:shadow-xl transition-all duration-300
        ${showActiveSubscription ? 'border-green-300' : 'border-gray-200'}`}
    >
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold text-black">{product.name}</h2>
        {isProductSubscription && (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            Subscription
          </span>
        )}
      </div>
      <p className="text-gray-700 mt-2">{product.description}</p>
      <div className="mt-4 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-green-600 font-semibold">${product.price / 100}</p>
          {showActiveSubscription ? (
            <span className="text-green-600 text-sm font-medium">
              ✓ Active Subscription
            </span>
          ) : (
            <button
              className={`px-4 py-2 rounded font-semibold ${
                loading 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors duration-200`}
              onClick={() => checkoutProduct(product.product_id, product.is_recurring)}
              disabled={loading || (isProductSubscription && isSubscribed)}
            >
              {loading ? "Processing..." : 
               showSubscribeButton ? "Subscribe" : "Buy now"}
            </button>
          )}
        </div>
        {showActiveSubscription && <CancelSubscription />}
        {/* Always show subscription status if needed */}
        <SubscriptionStatus />
      </div>
    </div>
  );
}
