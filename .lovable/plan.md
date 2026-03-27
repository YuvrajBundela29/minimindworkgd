

## Update Razorpay Live API Keys

Your project already has `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` configured with test/fake values. We need to replace them with your real live keys.

### What I'll do

1. **Prompt you to enter your live `RAZORPAY_KEY_ID`** (starts with `rzp_live_...`) — this is the Key ID from your Razorpay Dashboard → API Keys
2. **Prompt you to enter your live `RAZORPAY_KEY_SECRET`** — the corresponding secret key

These are stored securely as backend secrets and are only accessible from server-side edge functions — never exposed to the browser or client code.

### What you need ready

From your Razorpay Dashboard → Settings → API Keys:
- **Key ID** — e.g. `rzp_live_xxxxxxxxxxxxxxx`
- **Key Secret** — shown only once when generated

### No code changes needed

The existing edge functions (`create-razorpay-order`, `verify-razorpay-payment`, `razorpay-webhook`) already read these secrets by name. Updating the values is all that's required to go live.

