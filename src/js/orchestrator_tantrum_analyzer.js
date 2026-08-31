export async function onInvoke(request, env) {
   try {
      const tokenRes = await fetch('https://api.glia.com/operator_authentication/tokens', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            api_key_id: env.GLIA_API_KEY_ID,
            api_key_secret: env.GLIA_API_KEY_SECRET
         })
      });

      if (!tokenRes.ok) {
         const tokenError = await tokenRes.text();
         return Response.json({
            // Forzamos el error en un solo string
            error: `Token Fetch Error | Status: ${tokenRes.status} | Details: ${tokenError}`
         }, {
            status: 401
         });
      }

      const { token } = await tokenRes.json();
      const { payload } = await request.json();

      const body = JSON.parse(payload);
      const { message, is_vip } = body;

      const analyzerRes = await fetch('https://api.glia.com/integrations/b993e1fb-9f28-4c8d-ac36-c31d71405630/endpoint', {
         method: 'POST',
         headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            message
         })
      });
      
      if (!analyzerRes.ok) {
         const errorDetails = await analyzerRes.text(); 
         
         return Response.json({
            // Metemos todo el texto de la respuesta fallida directamente aquí
            error: `Analyzer API failed | Status: ${analyzerRes.status} | Upstream Response: ${errorDetails}`
         }, {
            status: 502
         });
      }

      const result = await analyzerRes.json();
      const level = result.tantrum_level;

      if (level >= 9 && is_vip) return Response.json({
         alert: '🔴 ALERT: Offer VIP apology and $50 credit',
         tantrum_level: level
      });

      if (level >= 9) return Response.json({
         alert: '🟡 ALERT: Keep calm and use the complaint script',
         tantrum_level: level
      });

      if (level >= 6) return Response.json({
         alert: '🟠 ALERT: Member is frustrated, proactive check-in recommended',
         tantrum_level: level
      });

      return Response.json({
         alert: '✅ Member seems calm. No escalation needed.',
         tantrum_level: level
      });

   } catch (error) {
      return Response.json({
         // También forzamos cualquier error de código (ej. un JSON mal formado) en el string
         error: `Internal Execution Error: ${error.message}`
      }, {
         status: 500
      });
   }
}