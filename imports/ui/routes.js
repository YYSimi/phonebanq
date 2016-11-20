Router.configure({
   layoutTemplate: 'main' 
});

Router.route('/mySenators', {
    name: 'mySenators'
});

Router.route('/', {
    name: 'home',
    template: 'info'
})