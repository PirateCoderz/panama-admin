export function buildCorsHeaders({
  // origins = [''],
  methods = ['GET','POST','PUT','DELETE','OPTIONS'],
  allowCredentials = false,
  allowHeaders = ['Content-Type','Authorization'],
}) {
  return {
    // Set dynamically per request in the route using the Origin header:
    'Access-Control-Allow-Origin': 'https://panamatravel.co.uk',
    'Access-Control-Allow-Methods': methods.join(','),
    'Access-Control-Allow-Headers': allowHeaders.join(','),
    ...(allowCredentials ? { 'Access-Control-Allow-Credentials': 'true' } : {}),
    'Vary': 'Origin',
  };
}