# INQAR Development TODO - Critical Fixes

## Phase 11: Remove Demo Content & Make Buttons Functional
- [x] Remove all demo placeholder buttons and content
- [x] Remove demo users from admin panel
- [x] Remove placeholder toggles from privacy settings
- [x] Ensure all interactive elements are real and functional

## Phase 12: Login/Signup Flow
- [x] Add login/signup UI on home page (OAuth via Manus)
- [x] Implement OAuth redirect flow
- [x] Add logout button in profile menu
- [x] Show auth state in navigation
- [x] Fix Supabase user creation with correct column names (snake_case)
- [x] Email/password authentication working with Supabase

## Phase 13: VIP Subscription - Real Stripe Integration
- [x] Fix "Apply for Government VIP" button - wire to backend
- [x] Fix "Upgrade to VIP" button - create Stripe checkout session
- [x] Show subscription status correctly
- [x] Display VIP benefits and features

## Phase 14: Admin Panel - Real Data
- [x] Show real users from database (not demo)
- [x] Show real posts for moderation
- [x] Show real VIP verification requests
- [x] Show real marketplace listings
- [x] Make admin actions functional (suspend, approve, reject)

## Phase 15: Settings Page - Instagram-like
- [x] Create comprehensive settings page
- [x] Account settings (username, email, phone)
- [x] Privacy settings (private account, who can message, etc)
- [x] Notification preferences
- [x] Blocked users list (needs backend implementation)
- [x] Security settings (password, 2FA)
- [x] Data and privacy
- [x] Help and support
- [x] Add settings button to profile page

## Phase 16: Supabase OAuth & Cloudflare Deployment
- [x] Configure Google OAuth in Supabase
- [x] Integrate Supabase authentication
- [x] Sync user data to Supabase database
- [x] Create wrangler.toml for Cloudflare Workers
- [x] Add deployment guide
- [x] Create auth callback page
