import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create a Supabase client with the service role key
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Verify the user is authenticated and is an admin
        const authHeader = req.headers.get('Authorization')!
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Check if user is admin
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return new Response(
                JSON.stringify({ error: 'Forbidden: Admin access required' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get all profiles
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('id, name, role')

        if (profilesError) {
            throw profilesError
        }

        // Get all auth users
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()

        if (authError) {
            throw authError
        }

        // Map auth users by ID for quick lookup
        const authUsersMap = new Map(authData.users.map(user => [user.id, user]))

        // Combine profiles with email from auth
        const users = profiles.map(profile => ({
            ...profile,
            email: authUsersMap.get(profile.id)?.email || 'N/A',
        }))

        return new Response(
            JSON.stringify({ users }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
