# ⚡ Quick IP Whitelist Fix (30 seconds)

I've opened the MongoDB Atlas Network Access page for you.

## Just 3 Clicks:

1. **Click** "Add IP Address" button (top right)
2. **Click** "Allow Access from Anywhere" button (adds 0.0.0.0/0)
3. **Click** "Confirm"

**That's it!** Wait 1-2 minutes, then try registering again.

---

## Why This Works

- Vercel uses dynamic IP addresses that change
- Adding `0.0.0.0/0` allows all IPs (including Vercel)
- This is standard for serverless deployments

## After Adding

✅ Wait 1-2 minutes for changes to propagate  
✅ Try registering on your app again  
✅ It should work now!

