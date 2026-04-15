Fix the 1-on-1 private chat for admin in CommunityView.tsx to be WhatsApp-style.

## Current behavior
When admin is in the "1-on-1 with JvR" room, messages are grouped by student in one scrollable list. Admin can't select individual students to reply to.

## Required behavior
When admin is in the "1-on-1 with JvR" room:
- Show a student sidebar on the LEFT (within the chat area, not the room sidebar)
- List each mentorship student who has sent at least one message
- Click on a student → show their private thread on the RIGHT
- Admin can type and send a reply in that thread (targetUserId = selected student's id)
- Unread indicator (dot) if student has sent new messages since admin last replied

For students (non-admin) in the private room:
- Just show their own thread with admin — no changes needed

## Implementation

In CommunityView.tsx, when `isAdmin && activeRoom === 'private'`:

Replace the current grouped view with this layout inside the main content area:
```
[Student List Sidebar (200px)] | [Selected Thread]
```

State needed:
- `selectedStudentId: string | null` — which student thread is open
- Messages fetched include all private messages (admin sees all)

Student list sidebar:
- Each student who has messages: show avatar + name + last message preview + time
- Click → set selectedStudentId
- Active student: orange left border highlight
- "No conversations yet" if empty

Thread view (right side):
- Shows messages between admin and selectedStudentId only:
  - Messages where userId === selectedStudentId
  - Messages where userId === adminId AND targetUserId === selectedStudentId
- Admin reply input at bottom, sends with targetUserId = selectedStudentId
- Shows student name as thread header

This should feel like iMessage/WhatsApp — pick a person, see your conversation.

## Keep existing student view unchanged
For non-admin users, the private room just shows their own thread (no changes).

After fixing:
- npm run build (fix errors)
- git add -A && git commit -m "feat: WhatsApp-style admin private chat"
- git push origin main
- vercel --prod
- openclaw system event --text "Done: WhatsApp admin chat deployed" --mode now
