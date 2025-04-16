Webhook Payloads
Payment Webhook Payload

Copy page

The payload sent to your webhook endpoint when a payment is created or updated.

​
business_id
stringrequired
Identifier of the business associated with the payment

​
created_at
stringrequired
Timestamp when the payment was created

​
currency
enum<string>required
Available options: AED, ALL, AMD, ANG, AOA, ARS, AUD, AWG, AZN, BAM, BBD, BDT, BGN, BHD, BIF, BMD, BND, BOB, BRL, BSD, BWP, BYN, BZD, CAD, CHF, CLP, CNY, COP, CRC, CUP, CVE, CZK, DJF, DKK, DOP, DZD, EGP, ETB, EUR, FJD, FKP, GBP, GEL, GHS, GIP, GMD, GNF, GTQ, GYD, HKD, HNL, HRK, HTG, HUF, IDR, ILS, INR, IQD, JMD, JOD, JPY, KES, KGS, KHR, KMF, KRW, KWD, KYD, KZT, LAK, LBP, LKR, LRD, LSL, LYD, MAD, MDL, MGA, MKD, MMK, MNT, MOP, MRU, MUR, MVR, MWK, MXN, MYR, MZN, NAD, NGN, NIO, NOK, NPR, NZD, OMR, PAB, PEN, PGK, PHP, PKR, PLN, PYG, QAR, RON, RSD, RUB, RWF, SAR, SBD, SCR, SEK, SGD, SHP, SLE, SLL, SOS, SRD, SSP, STN, SVC, SZL, THB, TND, TOP, TRY, TTD, TWD, TZS, UAH, UGX, USD, UYU, UZS, VES, VND, VUV, WST, XAF, XCD, XOF, XPF, YER, ZAR, ZMW 
​
customer
objectrequired

Show child attributes

​
disputes
object[]required
List of disputes associated with this payment


Show child attributes

​
metadata
objectrequired

Show child attributes

​
payment_id
stringrequired
Unique identifier for the payment

​
refunds
object[]required
List of refunds issued for this payment


Show child attributes

​
total_amount
integerrequired
Total amount charged to the customer including tax, in smallest currency unit (e.g. cents)

​
discount_id
string | null
The discount id if discount is applied

​
error_message
string | null
An error message if the payment failed

​
payment_link
string | null
Checkout URL

​
payment_method
string | null
Payment method used by customer (e.g. "card", "bank_transfer")

​
payment_method_type
string | null
Specific type of payment method (e.g. "visa", "mastercard")

​
product_cart
object[] | null
List of products purchased in a one-time payment


Show child attributes

​
status
enum<string>
Available options: succeeded, failed, cancelled, processing, requires_customer_action, requires_merchant_action, requires_payment_method, requires_confirmation, requires_capture, partially_captured, partially_captured_and_capturable 
​
subscription_id
string | null
Identifier of the subscription if payment is part of a subscription

​
tax
integer | null
Amount of tax collected in smallest currency unit (e.g. cents)

​
updated_at
string | null
Timestamp when the payment was last updated


example:


{
  "business_id": "<string>",
  "created_at": "2023-11-07T05:31:56Z",
  "currency": "AED",
  "customer": {
    "customer_id": "<string>",
    "email": "<string>",
    "name": "<string>"
  },
  "discount_id": "<string>",
  "disputes": [
    {
      "amount": "<string>",
      "business_id": "<string>",
      "created_at": "2023-11-07T05:31:56Z",
      "currency": "<string>",
      "dispute_id": "<string>",
      "dispute_stage": "pre_dispute",
      "dispute_status": "dispute_opened",
      "payment_id": "<string>"
    }
  ],
  "error_message": "<string>",
  "metadata": {},
  "payment_id": "<string>",
  "payment_link": "<string>",
  "payment_method": "<string>",
  "payment_method_type": "<string>",
  "product_cart": [
    {
      "product_id": "<string>",
      "quantity": 1
    }
  ],
  "refunds": [
    {
      "amount": 123,
      "business_id": "<string>",
      "created_at": "2023-11-07T05:31:56Z",
      "currency": "AED",
      "payment_id": "<string>",
      "reason": "<string>",
      "refund_id": "<string>",
      "status": "succeeded"
    }
  ],
  "status": "succeeded",
  "subscription_id": "<string>",
  "tax": 123,
  "total_amount": 123,
  "updated_at": "2023-11-07T05:31:56Z"
}