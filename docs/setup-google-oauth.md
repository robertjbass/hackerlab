# Google OAuth Setup

This guide walks through configuring Google OAuth for the Hackerlab project. You will create an OAuth 2.0 client in Google Cloud Console and configure the credentials in your `.env` file.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com)

## Step 1: Create or Select a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown in the top navigation bar
3. Click **New Project** (or select an existing one)
4. Enter a project name and click **Create**

## Step 2: Enable the People API

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for **Google People API**
3. Click on it and press **Enable**

Note: The Google+ API is deprecated. Use the People API instead.

## Step 3: Configure the OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** as the user type (unless you have a Google Workspace org and only need internal users)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: Your application name
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **Save and Continue**
6. On the **Scopes** screen, click **Add or Remove Scopes** and add:
   - `email`
   - `profile`
   - `openid`
7. Click **Save and Continue**
8. On the **Test users** screen, add any Google accounts that need access during testing
9. Click **Save and Continue**, then **Back to Dashboard**

## Step 4: Create OAuth Client Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application** as the application type
4. Enter a name (e.g., "Hackerlab Dev" or "Hackerlab Prod")

### Authorized JavaScript Origins

Add the origins where your app runs:

| Environment | Origin |
|---|---|
| Local development | `http://localhost:3000` |
| Production | `https://yourdomain.com` |

### Authorized Redirect URIs

Add the Auth.js callback URL for each environment:

| Environment | Redirect URI |
|---|---|
| Local development | `http://localhost:3000/api/auth/callback/google` |
| Production | `https://yourdomain.com/api/auth/callback/google` |

5. Click **Create**
6. Copy the **Client ID** and **Client Secret** from the confirmation dialog

## Step 5: Configure Environment Variables

Add the credentials to your `.env` file:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

## Pitfalls and Common Issues

### redirect_uri_mismatch

This is the most common error. The redirect URI in your OAuth client configuration must match the callback URL **exactly**:

- No trailing slash (`/api/auth/callback/google` not `/api/auth/callback/google/`)
- Correct protocol (`http` for localhost, `https` for production)
- Correct port (include `:3000` for local dev if applicable)
- Case-sensitive path matching

### Testing vs Published Mode

When the OAuth consent screen is in **Testing** mode:

- Only users listed as test users can sign in
- Other users will see a "This app is blocked" or "Access denied" error
- You can add up to 100 test users

To allow any Google user to sign in, submit the app for **verification** and publish it. For internal tools or projects where you control who signs in, testing mode with explicitly added test users is fine.

### No Wildcard Redirect URIs

Google does not support wildcard patterns in redirect URIs. You cannot use `https://*.yourdomain.com/api/auth/callback/google`. Every redirect URI must be an exact match.

### Separate OAuth Apps per Environment

You need a separate OAuth client (or separate redirect URIs within the same client) for each environment:

- **Local development**: `http://localhost:3000`
- **Staging/Preview**: `https://staging.yourdomain.com`
- **Production**: `https://yourdomain.com`

A single OAuth client can have multiple authorized redirect URIs, so you can add all environments to one client for convenience. However, separate clients per environment are cleaner and avoid accidentally leaking production credentials into development.

### Preview Deployments

Vercel preview deployments generate unique URLs (e.g., `https://myapp-abc123-team.vercel.app`) that cannot be pre-registered as redirect URIs. Options:

- **Stable preview domain**: Configure a fixed preview domain in Vercel (e.g., `https://preview.yourdomain.com`) and add it to your OAuth client
- **Skip OAuth for previews**: Use a feature flag or environment check to disable OAuth on preview deployments
- **Wildcard subdomain with a proxy**: Not supported by Google directly, but you could use a reverse proxy with a stable callback URL

### Email Scope

The Auth.js Google provider requests `openid email profile` scopes. If a user's Google account does not have an email address (rare but possible with some Google Workspace configurations), authentication will fail because the Hackerlab auth flow requires an email as the canonical identity.
