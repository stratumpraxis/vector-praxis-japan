# Vector Winner Amplification Gate

Status: scaffolded

This file reserves the implementation surface for Vector's Winner Amplification Gate.

Principle:
PUBLISHED != WINNER

State progression:
PREPARED -> PUBLISHED -> TRAFFIC_CONFIRMED -> BUYER_ACTION -> CHECKOUT -> PURCHASED -> WINNER

A post becomes eligible for amplification only when downstream evidence supports it.

Required evidence keys:
- platform
- post_id
- post_url
- published_at
- destination_url
- utm_source
- utm_medium
- utm_campaign
- utm_content
- route_id
- asset_id
- workflow_run_id
- copy_hash
- publish_status
- traffic_status
- buyer_action_status
- checkout_status
- purchase_status
- winner_status

Amplification rule:
- Reach only: do not amplify
- Destination click: hook candidate
- Paid product view: message-match candidate
- Checkout reached: strong winner candidate
- Purchase confirmed: winner

Winner output target:
1 winner -> 5-20 controlled variants

Variants should keep the same offer and route_id while varying hook/problem/evidence/CTA/timing via distinct asset_id and utm_content values.
