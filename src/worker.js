// One address for the site: www.turgunboev.com -> turgunboev.com (permanent redirect).
// Everything else is served straight from the static files in ./public.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.turgunboev.com') {
      url.hostname = 'turgunboev.com';
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  }
};
