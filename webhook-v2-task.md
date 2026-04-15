Update the Shopify webhook to auto-create accounts instead of invite codes.

## Current behaviour
webhook creates an invite code and emails it to the student.

## New behaviour
For NEW students (email not in DB):
1. Create a User account with:
   - email: from Shopify order
   - name: from Shopify order (first_name + last_name)
   - tier: based on variant ID
   - role: "student"
   - password: set to empty string "" (they haven't set one yet)
   - A flag to indicate "needs password setup" — add a boolean field `needsPasswordSetup Boolean @default(false)` to User model
2. Send a branded email from program@brandscaling.co.za:
   - Subject: "Your account is ready — set your password"
   - Body: Tell them their account has been created, click the button to set their password
   - Button: links to https://program.brandscaling.co.za/welcome?email=ENCODED_EMAIL
3. Don't create invite codes anymore for new users

For EXISTING students (upgrade):
- Keep existing behaviour (upgrade tier, send upgrade confirmation email)
- Update the upgrade email button to link to https://program.brandscaling.co.za/login instead of the old jvr-brand-scaling.vercel.app URL

## Schema update
Add to User model in prisma/schema.prisma:
```
needsPasswordSetup Boolean @default(false)
```
Run: npx prisma db push && npx prisma generate

## Update /api/welcome/activate
The activate endpoint should:
- Find user by email
- If needsPasswordSetup is false AND user already has a real password → redirect to login instead
- Hash the new password and save
- Set needsPasswordSetup = false
- Auto-login: create a NextAuth session token (or just redirect to login with a success message)

Actually simpler: after activating, just redirect them to /login with a message "Password set! Sign in below."

## Keep invite codes working
The existing /register page with invite codes should still work for manual codes.
Just don't auto-generate codes from webhooks anymore.

## After changes:
- npm run build (fix errors)
- git add -A && git commit -m "feat: webhook auto-creates accounts, welcome page activation flow"
- git push origin main
- vercel --prod
- openclaw system event --text "Done: auto-account creation flow live" --mode now
