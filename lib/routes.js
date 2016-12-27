Router.route('/.well-known/acme-challenge/8a17Ixc5WsyOMimlM4WGZvcmnScd9C5wjzKjjwFKgmU', {where: 'server'}).get(function() {
    this.response.statusCode = 200;
    this.response.end("8a17Ixc5WsyOMimlM4WGZvcmnScd9C5wjzKjjwFKgmU.Fq9PUnCtrkMZ4ZZee0aLtFyrMrMd43P4R-2HditdIHg")
});