Subscription Webhook Payload

Copy page

The payload sent to your webhook endpoint when a subscription is created or updated.

Response struct representing subscription details

​
billing
objectrequired

Show child attributes

​
created_at
stringrequired
Timestamp when the subscription was created

​
currency
enum<string>required
Available options: AED, ALL, AMD, ANG, AOA, ARS, AUD, AWG, AZN, BAM, BBD, BDT, BGN, BHD, BIF, BMD, BND, BOB, BRL, BSD, BWP, BYN, BZD, CAD, CHF, CLP, CNY, COP, CRC, CUP, CVE, CZK, DJF, DKK, DOP, DZD, EGP, ETB, EUR, FJD, FKP, GBP, GEL, GHS, GIP, GMD, GNF, GTQ, GYD, HKD, HNL, HRK, HTG, HUF, IDR, ILS, INR, IQD, JMD, JOD, JPY, KES, KGS, KHR, KMF, KRW, KWD, KYD, KZT, LAK, LBP, LKR, LRD, LSL, LYD, MAD, MDL, MGA, MKD, MMK, MNT, MOP, MRU, MUR, MVR, MWK, MXN, MYR, MZN, NAD, NGN, NIO, NOK, NPR, NZD, OMR, PAB, PEN, PGK, PHP, PKR, PLN, PYG, QAR, RON, RSD, RUB, RWF, SAR, SBD, SCR, SEK, SGD, SHP, SLE, SLL, SOS, SRD, SSP, STN, SVC, SZL, THB, TND, TOP, TRY, TTD, TWD, TZS, UAH, UGX, USD, UYU, UZS, VES, VND, VUV, WST, XAF, XCD, XOF, XPF, YER, ZAR, ZMW 
​
customer
objectrequired

Show child attributes

​
metadata
objectrequired

Show child attributes

​
next_billing_date
stringrequired
Timestamp of the next scheduled billing

​
payment_frequency_count
integerrequired
Number of payment frequency intervals

​
payment_frequency_interval
enum<string>required
Available options: Day, Week, Month, Year 
​
product_id
stringrequired
Identifier of the product associated with this subscription

​
quantity
integerrequired
Number of units/items included in the subscription

​
recurring_pre_tax_amount
integerrequired
Amount charged before tax for each recurring payment in smallest currency unit (e.g. cents)

​
status
enum<string>required
Available options: pending, active, on_hold, paused, cancelled, failed, expired 
​
subscription_id
stringrequired
Unique identifier for the subscription

​
subscription_period_count
integerrequired
Number of subscription period intervals

​
subscription_period_interval
enum<string>required
Available options: Day, Week, Month, Year 
​
tax_inclusive
booleanrequired
Indicates if the recurring_pre_tax_amount is tax inclusive

​
trial_period_days
integerrequired
Number of days in the trial period (0 if no trial)

​
cancelled_at
string | null
Cancelled timestamp if the subscription is cancelled

​
discount_id
string | null
The discount id if discount is applied


example:
{
  "billing": {
    "city": "<string>",
    "country": "AF",
    "state": "<string>",
    "street": "<string>",
    "zipcode": "<string>"
  },
  "cancelled_at": "2023-11-07T05:31:56Z",
  "created_at": "2023-11-07T05:31:56Z",
  "currency": "AED",
  "customer": {
    "customer_id": "<string>",
    "email": "<string>",
    "name": "<string>"
  },
  "discount_id": "<string>",
  "metadata": {},
  "next_billing_date": "2023-11-07T05:31:56Z",
  "payment_frequency_count": 123,
  "payment_frequency_interval": "Day",
  "product_id": "<string>",
  "quantity": 123,
  "recurring_pre_tax_amount": 123,
  "status": "pending",
  "subscription_id": "<string>",
  "subscription_period_count": 123,
  "subscription_period_interval": "Day",
  "tax_inclusive": true,
  "trial_period_days": 123
}