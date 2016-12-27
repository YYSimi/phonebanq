Router.route('/.well-known/acme-challenge/' + process.env['SSL_CHALLENGE_URI_SEGMENT'], {where: 'server'}).get(function() {
    this.response.statusCode = 200;
    this.response.end(process.env['SSL_RESPONSE'])
});