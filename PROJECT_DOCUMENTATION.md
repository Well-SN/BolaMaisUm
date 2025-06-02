# Street Queue - Technical Documentation

## Project Overview
Street Queue is a real-time 3v3 basketball game management system built with React, TypeScript, and Supabase.

## Database Structure

### Tables
1. `players`
   - `id` (UUID, primary key)
   - `name` (text)
   - `created_at` (timestamp)

2. `teams`
   - `id` (UUID, primary key)
   - `name` (text)
   - `is_playing` (boolean)
   - `created_at` (timestamp)

3. `team_players`
   - `team_id` (UUID, foreign key to teams)
   - `player_id` (UUID, foreign key to players)
   - `created_at` (timestamp)

4. `current_game`
   - `id` (UUID, primary key)
   - `team_a_id` (UUID, foreign key to teams)
   - `team_b_id` (UUID, foreign key to teams)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

## Project Structure

### Core Components
- `GameContext.tsx`: Central state management using React Context
- `Header.tsx`: App header with reset functionality
- `PlayerRegistration.tsx`: Player registration form
- `TeamDisplay.tsx`: Team card component
- `CurrentGame.tsx`: Current game display
- `QueueDisplay.tsx`: Team queue management

### State Management
- Uses React Context for global state
- Real-time sync with Supabase
- Automatic team cleanup when empty
- Persistent game state across sessions

### Data Flow
1. User actions trigger dispatch functions
2. Context reducer updates local state
3. Changes sync to Supabase
4. Real-time subscriptions update all connected clients

## Deployment Guide

### Database Setup
1. Create a Supabase project at https://supabase.com
2. Execute the SQL schema provided in the project
3. Copy the project URL and anon key
4. Update `src/lib/supabase.ts` with your credentials

### Frontend Deployment
1. Choose a hosting platform (e.g., Netlify, Vercel)
2. Connect your repository
3. Set environment variables:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Deploy using the build command: `npm run build`

### Domain Setup
1. Purchase a domain from your preferred registrar
2. Add domain to your hosting platform
3. Configure DNS settings as per platform instructions
4. Enable SSL certificate

## Security Considerations
- Admin password for reset functionality
- Row Level Security (RLS) in Supabase
- Real-time subscription authentication
- Data validation on both client and server

## Maintenance
- Regular database backups
- Monitor Supabase usage
- Update dependencies
- Check error logs
- Test real-time functionality

## Troubleshooting
- Check Supabase connection
- Verify environment variables
- Monitor browser console
- Check network requests
- Validate database permissions