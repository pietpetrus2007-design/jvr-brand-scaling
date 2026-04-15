Build a /welcome page for JvR Brand Scaling platform.

## Purpose
Students land here after paying on Shopify. They set a password to activate their account.
The webhook has already created their account (or will create it). They just need to set a password.

## Page: /welcome

### How it works
1. Student arrives at /welcome (from Shopify Thank You page button)
2. Page shows a clean "Welcome! Activate your account" screen
3. They enter:
   - Email (the one they used on Shopify)
   - Password (new password they're setting)
   - Confirm password
4. On submit:
   - Check if a user with that email exists (created by webhook)
   - If yes: set their password and log them in → redirect to /dashboard
   - If no: show error "Account not found. Please wait 1-2 minutes and try again, or contact support."
5. If logged in successfully → redirect to /dashboard

### API: POST /api/welcome/activate
- Body: { email, password }
- Find user by email
- If not found: return error
- Hash password and update user
- Return success

### Page design
- Full page, black background, orange accents
- Logo at top: "JvR Brand Scaling"
- Card in center:
  - Title: "Welcome to the Program 🎉"
  - Subtitle: "Your payment was confirmed. Set your password to access your course."
  - Email input (pre-filled if ?email= param in URL)
  - Password input
  - Confirm password input
  - Big orange "Activate Account" button
  - Below: "Already have an account? Sign in" link → /login

### Add to navigation
No nav needed on this page — it's a standalone activation page.

### After building
- npm run build (fix errors)
- git add -A && git commit -m "feat: /welcome activation page for post-purchase"
- git push origin main
- vercel --prod
- openclaw system event --text "Done: welcome page deployed" --mode now
