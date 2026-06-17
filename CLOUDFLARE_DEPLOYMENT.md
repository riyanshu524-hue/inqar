# INQAR Cloudflare Workers Deployment Guide

## Prerequisites

1. **Cloudflare Account**: Sign up at https://dash.cloudflare.com/
2. **Wrangler CLI**: Install globally with `npm install -g wrangler`
3. **Domain**: Register or connect a domain to Cloudflare
4. **Environment Variables**: All secrets configured

## Step 1: Install Wrangler

```bash
npm install -g wrangler
# or
pnpm add -g wrangler
```

## Step 2: Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate your Cloudflare account.

## Step 3: Configure Environment Variables

Update `wrangler.toml` with your actual values:

```toml
[env.production]
name = "inqar-production"
routes = [
  { pattern = "yourdomain.com/*", zone_id = "YOUR_ZONE_ID" }
]
```

Get your Zone ID from Cloudflare dashboard → Your Domain → Overview (bottom right)

## Step 4: Set Secrets

Set environment variables in Cloudflare Workers:

```bash
# Development
wrangler secret put SUPABASE_URL --env development
wrangler secret put SUPABASE_ANON_KEY --env development
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env development
wrangler secret put VITE_SUPABASE_PUBLISHABLE_KEY --env development
wrangler secret put JWT_SECRET --env development
wrangler secret put VITE_APP_ID --env development
wrangler secret put OAUTH_SERVER_URL --env development
wrangler secret put OWNER_OPEN_ID --env development
wrangler secret put BUILT_IN_FORGE_API_URL --env development
wrangler secret put BUILT_IN_FORGE_API_KEY --env development
wrangler secret put STRIPE_SECRET_KEY --env development
wrangler secret put STRIPE_WEBHOOK_SECRET --env development
wrangler secret put VITE_STRIPE_PUBLISHABLE_KEY --env development

# Production (repeat with --env production)
wrangler secret put SUPABASE_URL --env production
# ... repeat for all secrets
```

## Step 5: Create KV Namespace (for session storage)

```bash
# Create KV namespace
wrangler kv:namespace create "SESSIONS"
wrangler kv:namespace create "SESSIONS" --preview

# Update wrangler.toml with the returned IDs
```

## Step 6: Build the Project

```bash
pnpm build
```

This creates the `dist/` folder with your compiled app.

## Step 7: Deploy to Cloudflare Workers

### Development (Preview)

```bash
wrangler deploy --env development
```

### Production

```bash
wrangler deploy --env production
```

## Step 8: Configure Custom Domain

1. Go to Cloudflare Dashboard → Your Domain
2. Workers & Pages → Your Worker
3. Settings → Domains & Routes
4. Add your custom domain

## Step 9: Set Up OAuth Redirect URLs

Update your Supabase Google OAuth settings:

**Authorized redirect URIs:**
- `https://yourdomain.com/auth/callback`
- `https://yourdomain.com/auth/v1/callback`

Update Manus OAuth settings:
- Redirect URI: `https://yourdomain.com/api/oauth/callback`

## Step 10: Monitor Deployment

```bash
# View real-time logs
wrangler tail --env production

# View deployment history
wrangler deployments list
```

## Troubleshooting

### Issue: "Cannot find module"
**Solution**: Ensure all dependencies are in `package.json` and run `pnpm install`

### Issue: "Secrets not found"
**Solution**: Verify secrets are set with `wrangler secret list --env production`

### Issue: "Database connection failed"
**Solution**: Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct

### Issue: "OAuth redirect mismatch"
**Solution**: Ensure redirect URIs in Supabase and Manus match your deployed domain

## Performance Tips

1. **Enable Caching**: Configure cache headers in your Express app
2. **Use KV for Sessions**: Store session data in Cloudflare KV instead of memory
3. **Optimize Bundle Size**: Remove unused dependencies
4. **Enable Compression**: Gzip responses for faster delivery

## Rollback

```bash
# View deployment history
wrangler deployments list

# Rollback to previous version
wrangler rollback --env production
```

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- [Supabase Deployment Guide](https://supabase.com/docs/guides/hosting/overview)
- [Express on Cloudflare Workers](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)

## Support

For issues with:
- **Cloudflare Workers**: https://community.cloudflare.com/
- **Supabase**: https://github.com/supabase/supabase/discussions
- **INQAR**: Check the project README
