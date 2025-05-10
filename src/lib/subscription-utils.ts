import { db } from './firebase-admin';

export interface SubscriptionData {
  customer_id: string;
  subscription_id: string;
  status: 'pending' | 'active' | 'cancelled' | 'on_hold';
  next_billing_date?: string;
  customer?: {
    email: string;
    name: string;
  };
  billing?: {
    city: string;
    country: string;
    state: string;
    street: string;
    zipcode: string;
  };
  product_id?: string;
  payment_frequency?: {
    count: number;
    interval: string;
  };
  updated_at: string;
  created_at: string;
}

export async function storeSubscriptionData(
  firebaseUID: string,
  customerId: string,
  subscriptionId: string,
  status: SubscriptionData['status'] = 'pending'
): Promise<void> {
  console.log('Attempting to store subscription data:', {
    firebaseUID,
    customerId,
    subscriptionId,
    status
  });

  try {
    const userRef = db.collection('users').doc(firebaseUID);
    console.log('Created Firestore reference:', userRef.path);

    const data = {
      customer_id: customerId,
      subscription_id: subscriptionId,
      status: status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Attempting to write data:', data);

    await userRef.set(data, { merge: true });
    console.log('Successfully stored subscription data in Firestore');
  } catch (error) {
    console.error('Error storing subscription data:', {
      error,
      stackTrace: error instanceof Error ? error.stack : undefined,
      firebaseUID,
      customerId,
      subscriptionId
    });
    throw error;
  }
}

interface SubscriptionUpdateData {
  customer?: {
    email: string;
    name: string;
  };
  billing?: {
    city: string;
    country: string;
    state: string;
    street: string;
    zipcode: string;
  };
  product_id?: string;
  payment_frequency_count?: number;
  payment_frequency_interval?: string;
  [key: string]: unknown;
}

export async function updateSubscriptionStatus(
  firebaseUID: string,
  status: SubscriptionData['status'],
  nextBillingDate?: string,
  subscriptionData?: SubscriptionUpdateData
): Promise<void> {
  try {
    console.log('Updating subscription status for user:', firebaseUID);
    console.log('Status:', status);
    console.log('Next billing date:', nextBillingDate);
    console.log('Subscription data:', JSON.stringify(subscriptionData, null, 2));

    const userRef = db.collection('users').doc(firebaseUID);
    console.log('Firestore reference created for path:', `users/${firebaseUID}`);

    const updateData: Partial<SubscriptionData> = {
      status: status,
      updated_at: new Date().toISOString(),
    };
    
    if (nextBillingDate) {
      updateData.next_billing_date = nextBillingDate;
    }

    if (subscriptionData) {
      console.log('Processing additional subscription data');
      
      // Add additional subscription data if available
      if (subscriptionData.customer) {
        updateData.customer = {
          email: subscriptionData.customer.email,
          name: subscriptionData.customer.name,
        };
      }

      if (subscriptionData.billing) {
        updateData.billing = subscriptionData.billing;
      }

      if (subscriptionData.product_id) {
        updateData.product_id = subscriptionData.product_id;
      }

      if (subscriptionData.payment_frequency_count && subscriptionData.payment_frequency_interval) {
        updateData.payment_frequency = {
          count: subscriptionData.payment_frequency_count,
          interval: subscriptionData.payment_frequency_interval,
        };
      }

      console.log('Final update data:', JSON.stringify(updateData, null, 2));
    }
    
    console.log('Attempting to update Firestore document...');
    await userRef.update(updateData);
    console.log(`Subscription status updated to ${status}`);
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}