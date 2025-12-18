# Password Protection Setup

This start page includes optional password protection that can be enabled by setting an environment variable.

## How It Works

- **Production (Vercel)**: Uses `STARTPAGE_PASSWORD_HASH` environment variable
- **Development**: Falls back to local `data/.password.json` file (gitignored)
- **Security**: SHA-256 password hashing, no emergency backdoors
- **Session**: Authentication stored in sessionStorage (cleared on browser close)

## Setting Up Password Protection

### Step 1: Generate Password Hash

Run this in your browser console or Node.js:

```javascript
// Browser Console:
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Then run:
hashPassword('your-password-here').then(console.log)
```

```javascript
// Node.js:
const crypto = require('crypto')
const hash = crypto.createHash('sha256').update('your-password-here').digest('hex')
console.log(hash)
```

### Step 2: Set Environment Variable on Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `STARTPAGE_PASSWORD_HASH`
   - **Value**: The hash you generated in Step 1
   - **Environments**: Production, Preview, Development (select all)
4. Click **Save**
5. Redeploy your project

### Step 3: Test

1. Visit your deployed start page
2. You should see a password prompt
3. Enter your original password (not the hash)
4. After authentication, you can use the `lock` command to lock the page again

## Local Development

For local development, the app will fall back to `data/.password.json`:

```json
{
  "enabled": true,
  "passwordHash": "your-sha256-hash-here"
}
```

This file is gitignored to prevent accidentally committing passwords.

## Commands

- `lock` - Lock the start page (requires password to unlock)

## Security Notes

- ✅ SHA-256 hashing (one-way, cannot be reversed)
- ✅ No password stored in plain text
- ✅ No emergency backdoors or reset codes
- ✅ Session-based authentication (cleared on browser close)
- ✅ Environment variables never exposed to client
- ⚠️ If you forget your password, update the `STARTPAGE_PASSWORD_HASH` environment variable in Vercel dashboard
- ⚠️ This is client-side authentication suitable for personal use, not enterprise security

## Disabling Password Protection

To disable password protection:

1. Go to Vercel dashboard → Settings → Environment Variables
2. Delete the `STARTPAGE_PASSWORD_HASH` variable
3. Redeploy your project

Or for local development, delete `data/.password.json`
