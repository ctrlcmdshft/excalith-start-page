# Secure Session-Based Authentication Implementation

## What Changed

✅ **Secure server-side authentication** has been implemented to prevent unauthorized access to your links and settings.

## Security Improvements

### Before:
- ❌ Settings and links loaded from `localStorage` before authentication
- ❌ Anyone could view links via browser console: `localStorage.getItem("settings")`
- ❌ Password only controlled UI visibility, not data access

### After:
- ✅ Settings only sent from server after successful authentication
- ✅ Encrypted session cookies manage authentication state
- ✅ All API endpoints check authentication before returning sensitive data
- ✅ Links are never exposed client-side without authentication

## Files Created/Modified

### New Files:
1. **`src/lib/session.js`** - Session management utilities using iron-session
2. **`src/pages/api/auth/login.js`** - Login endpoint that creates authenticated sessions
3. **`src/pages/api/auth/logout.js`** - Logout endpoint to destroy sessions

### Modified Files:
1. **`src/pages/api/loadSettings.js`** - Now checks authentication before returning settings
2. **`src/components/PasswordProtection.js`** - Uses login API to create server-side session
3. **`src/context/settings.js`** - Only loads settings after authentication when password is enabled
4. **`.env.local`** - Added `SESSION_SECRET` environment variable

## Setup for Vercel Deployment

### 1. Generate a Secure Session Secret

Run this command to generate a cryptographically secure secret:

```powershell
# Windows PowerShell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Or use this online: https://generate-secret.vercel.app/32

### 2. Add to Vercel Environment Variables

In your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `SESSION_SECRET`
   - **Value**: [Your generated secret from step 1]
   - **Environments**: Production, Preview, Development

### 3. Redeploy

After adding the environment variable, redeploy your app for the changes to take effect.

## Testing

1. **Test locally**: Make sure `.env.local` has `SESSION_SECRET` set
2. **Clear your browser**: Clear cookies and localStorage to test fresh
3. **Try accessing without password**: Links should NOT be visible in console
4. **Log in**: Enter password and verify access works
5. **Check session persistence**: Refresh page - should stay logged in

## How It Works

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. User enters password
       ▼
┌─────────────────────┐
│  /api/auth/login    │
│  - Verifies password│
│  - Creates session  │
│  - Sets cookie      │
└──────┬──────────────┘
       │ 2. Encrypted cookie stored
       ▼
┌─────────────────────┐
│ /api/loadSettings   │
│ - Checks cookie     │
│ - Validates session │
│ - Returns data      │
└──────┬──────────────┘
       │ 3. Settings sent to browser
       ▼
┌─────────────┐
│ Terminal UI │
│ (with links)│
└─────────────┘
```

## Security Notes

- Sessions stored in **encrypted cookies** (not localStorage)
- Cookies are **httpOnly** (not accessible via JavaScript)
- Cookies are **secure** in production (HTTPS only)
- Session expires after **7 days** of inactivity
- No sensitive data ever stored client-side before authentication

## Need Help?

If you encounter issues:
1. Verify `SESSION_SECRET` is set in Vercel
2. Check browser console for errors
3. Verify password is configured in `data/password.json`
4. Clear browser cookies and try again
