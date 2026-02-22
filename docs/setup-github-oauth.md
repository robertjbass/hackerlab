# GitHub OAuth Setup

This guide walks through configuring GitHub OAuth for the Hackerlab project. You will create an OAuth App in GitHub and configure the credentials in your `.env` file.

## Prerequisites

- A GitHub account
- Admin access to the GitHub account or organization where the OAuth App will live

## Step 1: Create a New OAuth App

1. Go to [GitHub Settings](https://github.com/settings/profile)
2. In the left sidebar, scroll to the bottom and click **Developer settings**
3. Click **OAuth Apps** in the left sidebar
4. Click **New OAuth App**

## Step 2: Fill in Application Details

| Field | Local Development | Production |
|---|---|---|
| **Application name** | Hackerlab Dev | Hackerlab |
| **Homepage URL** | `http://localhost:3000` | `https://yourdomain.com` |
| **Authorization callback URL** | `http://localhost:3000/api/auth/callback/github` | `https://yourdomain.com/api/auth/callback/github` |

- **Application description** is optional but recommended
- Click **Register application**

## Step 3: Generate a Client Secret

1. After registering, you will see the application's settings page
2. Copy the **Client ID** (displayed at the top)
3. Click **Generate a new client secret**
4. Copy the client secret immediately -- it will only be shown once

## Step 4: Configure Environment Variables

Add the credentials to your `.env` file:

```env
GITHUB_CLIENT_ID=your-client-id-here
GITHUB_CLIENT_SECRET=your-client-secret-here
```

## Important Differences from Google OAuth

### OAuth Apps vs GitHub Apps

GitHub offers two types of integrations:

- **OAuth Apps**: Simple authentication flow, suitable for "Sign in with GitHub" use cases. This is what Hackerlab uses.
- **GitHub Apps**: More granular permissions, webhooks, and installation-level access. Overkill for basic auth.

Use OAuth Apps unless you need repository-level permissions or webhook integrations.

### One Callback URL per App

Unlike Google (which allows multiple redirect URIs per OAuth client), GitHub OAuth Apps support **only one callback URL per app**. This means you need a separate OAuth App for each environment:

- **Hackerlab Dev** with callback `http://localhost:3000/api/auth/callback/github`
- **Hackerlab Staging** with callback `https://staging.yourdomain.com/api/auth/callback/github`
- **Hackerlab Prod** with callback `https://yourdomain.com/api/auth/callback/github`

Each app will have its own Client ID and Client Secret. Set the appropriate pair in each environment's `.env`.

### Email Visibility

Hackerlab uses email as the canonical user identity. For GitHub OAuth to work correctly, the user must have an accessible email address. There are two scenarios to be aware of:

- **Public email set**: If the user has a public email on their GitHub profile, it is returned automatically.
- **No public email**: If the user's email is private, the Auth.js GitHub provider requests the `user:email` scope by default and retrieves the primary verified email from the GitHub API.

In rare cases where a user has no verified email on GitHub, authentication will fail.

### Organization Restrictions

Some GitHub organizations restrict which OAuth Apps their members can authorize. If users from a specific org cannot sign in:

1. An org admin must go to **Organization Settings** > **Third-party access**
2. Find the OAuth App and approve it, or change the policy to allow all OAuth Apps

This only applies to users authenticating from organization-managed accounts.

## Vercel Preview Deployments

Since GitHub allows only one callback URL per OAuth App, Vercel preview deployments with unique URLs cannot use the same OAuth App as production. Options:

- Create a dedicated OAuth App with a stable preview domain as the callback URL
- Use environment-specific OAuth credentials set in Vercel's preview environment variables
- Disable GitHub OAuth on preview deployments via an environment check
