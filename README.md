# 💬 Zesty Chat

A simple public chat app using **Next.js + Supabase + Tailwind CSS**  
✅ Realtime messages  
✅ Report button for moderation  
✅ Auto IP capture for banning logic  
✅ Deployed on Vercel (free)

### Setup

1. Create a Supabase project
2. Run this SQL in Supabase SQL Editor:

```sql
create table messages (
  id bigint generated always as identity primary key,
  text text,
  ip text,
  inserted_at timestamp with time zone default timezone('utc'::text, now())
);

create table reports (
  id bigint generated always as identity primary key,
  message_id bigint references messages(id),
  ip text,
  reported_at timestamp with time zone default timezone('utc'::text, now())
);
