# Get Subscription Detail

> Get detailed information about a specific subscription.

## OpenAPI

````yaml get /subscriptions/{subscription_id}
paths:
  path: /subscriptions/{subscription_id}
  method: get
  servers:
    - url: https://test.dodopayments.com/
      description: Test Mode Server Host
    - url: https://live.dodopayments.com/
      description: Live Mode Server Host
  request:
    security:
      - title: API KEY
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
          cookie: {}
    parameters:
      path:
        subscription_id:
          schema:
            - type: string
              required: true
              description: Subscription Id
      query: {}
      header: {}
      cookie: {}
    body: {}
    codeSamples:
      - lang: JavaScript
        source: |-
          import DodoPayments from 'dodopayments';

          const client = new DodoPayments({
            bearerToken: process.env['DODO_PAYMENTS_API_KEY'], // This is the default and can be omitted
          });

          async function main() {
            const subscription = await client.subscriptions.retrieve('subscription_id');

            console.log(subscription.product_id);
          }

          main();
      - lang: Python
        source: |-
          import os
          from dodopayments import DodoPayments

          client = DodoPayments(
              bearer_token=os.environ.get("DODO_PAYMENTS_API_KEY"),  # This is the default and can be omitted
          )
          subscription = client.subscriptions.retrieve(
              "subscription_id",
          )
          print(subscription.product_id)
      - lang: Go
        source: |
          package main

          import (
            "context"
            "fmt"

            "github.com/dodopayments/dodopayments-go"
            "github.com/dodopayments/dodopayments-go/option"
          )

          func main() {
            client := dodopayments.NewClient(
              option.WithBearerToken("My Bearer Token"), // defaults to os.LookupEnv("DODO_PAYMENTS_API_KEY")
            )
            subscription, err := client.Subscriptions.Get(context.TODO(), "subscription_id")
            if err != nil {
              panic(err.Error())
            }
            fmt.Printf("%+v\n", subscription.ProductID)
          }
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              billing:
                allOf:
                  - $ref: '#/components/schemas/BillingAddress'
              cancelled_at:
                allOf:
                  - type: string
                    format: date-time
                    description: Cancelled timestamp if the subscription is cancelled
                    nullable: true
              created_at:
                allOf:
                  - type: string
                    format: date-time
                    description: Timestamp when the subscription was created
              currency:
                allOf:
                  - $ref: '#/components/schemas/Currency'
              customer:
                allOf:
                  - $ref: '#/components/schemas/CustomerLimitedDetailsResponse'
              discount_id:
                allOf:
                  - type: string
                    description: The discount id if discount is applied
                    nullable: true
              metadata:
                allOf:
                  - $ref: '#/components/schemas/Metadata'
              next_billing_date:
                allOf:
                  - type: string
                    format: date-time
                    description: Timestamp of the next scheduled billing
              payment_frequency_count:
                allOf:
                  - type: integer
                    format: int32
                    description: Number of payment frequency intervals
              payment_frequency_interval:
                allOf:
                  - $ref: '#/components/schemas/TimeInterval'
              product_id:
                allOf:
                  - type: string
                    description: >-
                      Identifier of the product associated with this
                      subscription
              quantity:
                allOf:
                  - type: integer
                    format: int32
                    description: Number of units/items included in the subscription
              recurring_pre_tax_amount:
                allOf:
                  - type: integer
                    format: int32
                    description: >-
                      Amount charged before tax for each recurring payment in
                      smallest currency unit (e.g. cents)
              status:
                allOf:
                  - $ref: '#/components/schemas/SubscriptionStatus'
              subscription_id:
                allOf:
                  - type: string
                    description: Unique identifier for the subscription
              subscription_period_count:
                allOf:
                  - type: integer
                    format: int32
                    description: Number of subscription period intervals
              subscription_period_interval:
                allOf:
                  - $ref: '#/components/schemas/TimeInterval'
              tax_inclusive:
                allOf:
                  - type: boolean
                    description: Indicates if the recurring_pre_tax_amount is tax inclusive
              trial_period_days:
                allOf:
                  - type: integer
                    format: int32
                    description: Number of days in the trial period (0 if no trial)
            description: Response struct representing subscription details
            requiredProperties:
              - subscription_id
              - recurring_pre_tax_amount
              - tax_inclusive
              - currency
              - status
              - created_at
              - product_id
              - quantity
              - trial_period_days
              - subscription_period_interval
              - payment_frequency_interval
              - subscription_period_count
              - payment_frequency_count
              - next_billing_date
              - customer
              - metadata
              - billing
        examples:
          example:
            value:
              billing:
                city: <string>
                country: AF
                state: <string>
                street: <string>
                zipcode: <string>
              cancelled_at: '2023-11-07T05:31:56Z'
              created_at: '2023-11-07T05:31:56Z'
              currency: AED
              customer:
                customer_id: <string>
                email: <string>
                name: <string>
              discount_id: <string>
              metadata: {}
              next_billing_date: '2023-11-07T05:31:56Z'
              payment_frequency_count: 123
              payment_frequency_interval: Day
              product_id: <string>
              quantity: 123
              recurring_pre_tax_amount: 123
              status: pending
              subscription_id: <string>
              subscription_period_count: 123
              subscription_period_interval: Day
              tax_inclusive: true
              trial_period_days: 123
        description: ''
  deprecated: false
  type: path
components:
  schemas:
    BillingAddress:
      type: object
      required:
        - country
        - state
        - city
        - street
        - zipcode
      properties:
        city:
          type: string
          description: City name
        country:
          $ref: '#/components/schemas/CountryCodeAlpha2'
        state:
          type: string
          description: State or province name
        street:
          type: string
          description: >-
            Street address including house number and unit/apartment if
            applicable
        zipcode:
          type: string
          description: Postal code or ZIP code
    CountryCodeAlpha2:
      type: string
      description: ISO country code alpha2 variant
      enum:
        - AF
        - AX
        - AL
        - DZ
        - AS
        - AD
        - AO
        - AI
        - AQ
        - AG
        - AR
        - AM
        - AW
        - AU
        - AT
        - AZ
        - BS
        - BH
        - BD
        - BB
        - BY
        - BE
        - BZ
        - BJ
        - BM
        - BT
        - BO
        - BQ
        - BA
        - BW
        - BV
        - BR
        - IO
        - BN
        - BG
        - BF
        - BI
        - KH
        - CM
        - CA
        - CV
        - KY
        - CF
        - TD
        - CL
        - CN
        - CX
        - CC
        - CO
        - KM
        - CG
        - CD
        - CK
        - CR
        - CI
        - HR
        - CU
        - CW
        - CY
        - CZ
        - DK
        - DJ
        - DM
        - DO
        - EC
        - EG
        - SV
        - GQ
        - ER
        - EE
        - ET
        - FK
        - FO
        - FJ
        - FI
        - FR
        - GF
        - PF
        - TF
        - GA
        - GM
        - GE
        - DE
        - GH
        - GI
        - GR
        - GL
        - GD
        - GP
        - GU
        - GT
        - GG
        - GN
        - GW
        - GY
        - HT
        - HM
        - VA
        - HN
        - HK
        - HU
        - IS
        - IN
        - ID
        - IR
        - IQ
        - IE
        - IM
        - IL
        - IT
        - JM
        - JP
        - JE
        - JO
        - KZ
        - KE
        - KI
        - KP
        - KR
        - KW
        - KG
        - LA
        - LV
        - LB
        - LS
        - LR
        - LY
        - LI
        - LT
        - LU
        - MO
        - MK
        - MG
        - MW
        - MY
        - MV
        - ML
        - MT
        - MH
        - MQ
        - MR
        - MU
        - YT
        - MX
        - FM
        - MD
        - MC
        - MN
        - ME
        - MS
        - MA
        - MZ
        - MM
        - NA
        - NR
        - NP
        - NL
        - NC
        - NZ
        - NI
        - NE
        - NG
        - NU
        - NF
        - MP
        - 'NO'
        - OM
        - PK
        - PW
        - PS
        - PA
        - PG
        - PY
        - PE
        - PH
        - PN
        - PL
        - PT
        - PR
        - QA
        - RE
        - RO
        - RU
        - RW
        - BL
        - SH
        - KN
        - LC
        - MF
        - PM
        - VC
        - WS
        - SM
        - ST
        - SA
        - SN
        - RS
        - SC
        - SL
        - SG
        - SX
        - SK
        - SI
        - SB
        - SO
        - ZA
        - GS
        - SS
        - ES
        - LK
        - SD
        - SR
        - SJ
        - SZ
        - SE
        - CH
        - SY
        - TW
        - TJ
        - TZ
        - TH
        - TL
        - TG
        - TK
        - TO
        - TT
        - TN
        - TR
        - TM
        - TC
        - TV
        - UG
        - UA
        - AE
        - GB
        - UM
        - US
        - UY
        - UZ
        - VU
        - VE
        - VN
        - VG
        - VI
        - WF
        - EH
        - YE
        - ZM
        - ZW
    Currency:
      type: string
      enum:
        - AED
        - ALL
        - AMD
        - ANG
        - AOA
        - ARS
        - AUD
        - AWG
        - AZN
        - BAM
        - BBD
        - BDT
        - BGN
        - BHD
        - BIF
        - BMD
        - BND
        - BOB
        - BRL
        - BSD
        - BWP
        - BYN
        - BZD
        - CAD
        - CHF
        - CLP
        - CNY
        - COP
        - CRC
        - CUP
        - CVE
        - CZK
        - DJF
        - DKK
        - DOP
        - DZD
        - EGP
        - ETB
        - EUR
        - FJD
        - FKP
        - GBP
        - GEL
        - GHS
        - GIP
        - GMD
        - GNF
        - GTQ
        - GYD
        - HKD
        - HNL
        - HRK
        - HTG
        - HUF
        - IDR
        - ILS
        - INR
        - IQD
        - JMD
        - JOD
        - JPY
        - KES
        - KGS
        - KHR
        - KMF
        - KRW
        - KWD
        - KYD
        - KZT
        - LAK
        - LBP
        - LKR
        - LRD
        - LSL
        - LYD
        - MAD
        - MDL
        - MGA
        - MKD
        - MMK
        - MNT
        - MOP
        - MRU
        - MUR
        - MVR
        - MWK
        - MXN
        - MYR
        - MZN
        - NAD
        - NGN
        - NIO
        - NOK
        - NPR
        - NZD
        - OMR
        - PAB
        - PEN
        - PGK
        - PHP
        - PKR
        - PLN
        - PYG
        - QAR
        - RON
        - RSD
        - RUB
        - RWF
        - SAR
        - SBD
        - SCR
        - SEK
        - SGD
        - SHP
        - SLE
        - SLL
        - SOS
        - SRD
        - SSP
        - STN
        - SVC
        - SZL
        - THB
        - TND
        - TOP
        - TRY
        - TTD
        - TWD
        - TZS
        - UAH
        - UGX
        - USD
        - UYU
        - UZS
        - VES
        - VND
        - VUV
        - WST
        - XAF
        - XCD
        - XOF
        - XPF
        - YER
        - ZAR
        - ZMW
    CustomerLimitedDetailsResponse:
      type: object
      required:
        - customer_id
        - name
        - email
      properties:
        customer_id:
          type: string
          description: Unique identifier for the customer
        email:
          type: string
          description: Email address of the customer
        name:
          type: string
          description: Full name of the customer
    Metadata:
      type: object
      additionalProperties:
        type: string
    SubscriptionStatus:
      type: string
      enum:
        - pending
        - active
        - on_hold
        - paused
        - cancelled
        - failed
        - expired
    TimeInterval:
      type: string
      enum:
        - Day
        - Week
        - Month
        - Year

````