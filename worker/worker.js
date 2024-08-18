// Check requests for a pre-shared secret
const hasValidHeader = (request, env) => {
    return request.headers.get("X-CF-Secret") === env.AUTH_KEY_SECRET;
  };
  
  function authorizeRequest(request, env) {
    switch (request.method) {
      case "PUT":    
        return hasValidHeader(request, env);
      default:
        return false;
    }
  }
  
  export default {
    async fetch(request, env) {
      
      if (!authorizeRequest(request, env)) {
        return new Response("Forbidden", { status: 403 });
      }
  
      switch (request.method) {
        case "PUT":
          const formData = await request.formData();
          const file = formData.get('file');
          console.log({file});
          const fileName = file.name; 
          console.log({fileName});
    
          await env.MY_BUCKET.put(fileName, file.stream());
  
          return new Response(`Put File ${fileName} successfully!`);
  
        default:
          return new Response("Method Not Allowed", {
            status: 405,
            headers: {
              Allow: "PUT",
            },
          });
      }
    },
  };