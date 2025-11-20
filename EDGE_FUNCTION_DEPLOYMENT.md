# Déploiement de l'Edge Function `list-users`

## 📋 Instructions pas à pas

### Étape 1 : Accéder aux Edge Functions dans Supabase

1. Ouvrez votre [Dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet CEL-U13
3. Dans le menu de gauche, cliquez sur **"Edge Functions"**

### Étape 2 : Créer la fonction

1. Cliquez sur **"Create a new function"** ou **"Deploy new function"**
2. Nom de la fonction : `list-users`
3. Copiez-collez le code suivant :

```typescript
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
```

4. Cliquez sur **"Deploy"** ou **"Save"**

### Étape 3 : Vérifier le déploiement

Une fois déployée, la fonction sera accessible à l'URL :
```
https://[votre-projet-id].supabase.co/functions/v1/list-users
```

### Étape 4 : Mettre à jour le code frontend

Le fichier `src/lib/storage.js` doit être modifié pour utiliser cette fonction. Voici la modification à apporter :

**Remplacer la fonction `getUsers` (lignes 1129-1153) par :**

```javascript
export const getUsers = async () => {
  const { data, error } = await supabase.functions.invoke('list-users');
  
  if (error) {
    console.error('Fetch error from list-users function:', error);
    throw new Error(error.message || 'Failed to fetch users');
  }

  if (data.error) {
    console.error('Error from list-users function:', data.error);
    throw new Error(data.error);
  }

  return data.users;
};
```

### ✅ Test

Après le déploiement :
1. Rafraîchissez votre application
2. Accédez à `/admin-users`
3. La liste des utilisateurs devrait s'afficher correctement

---

## 🔧 Dépannage

Si vous rencontrez des erreurs :
- Vérifiez que la fonction est bien déployée dans le dashboard
- Vérifiez les logs de la fonction dans l'onglet "Logs" du dashboard
- Assurez-vous que votre compte a bien le rôle "admin" dans la table `profiles`
