Router.route('/.well-known/acme-challenge/' + process.env['SSL_CHALLENGE_URI_SEGMENT'], {where: 'server'}).get(function() {
    this.response.statusCode = 200;
    this.response.end(process.env['SSL_RESPONSE'])
});

Router.route('/feedback', function() {
  this.response.writeHead(302, {
    'Location': "https://docs.google.com/forms/d/e/1FAIpQLScE4nVYC-fgWEVEGeOIhdQX6RYss9Z2eN3vE9IHoBAaFx5_bw/viewform?c=0&w=1"
  });
  this.response.end();
}, {where: 'server'});

Router.route('/bugs', function() {
  this.response.writeHead(302, {
    'Location': "https://github.com/grassrootschampion/grassrootschampion-public/issues"
  });
  this.response.end();
}, {where: 'server'});