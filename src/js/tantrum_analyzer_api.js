export async function onInvoke(request, env) {
   const { payload } = await request.json();
   const body = JSON.parse(payload);
   const message = (body.message || '').toLowerCase();

   const highWords = ['cancel', 'terrible', 'garbage', 'ridiculous', 'unacceptable', 'furious', 'refund', 'hate', 'trash'];
   const midWords = ['disappointed', 'waiting', 'frustrated', 'unhappy', 'wow', 'sad', 'bad', 'ugly'];

   let level = 3;

   if (highWords.some(w => message.includes(w))) {
      level = 9;
   } 
   else if (midWords.some(w => message.includes(w))) {
      level = 6;
   }
   
   return Response.json({
      tantrum_level: level
   });
}