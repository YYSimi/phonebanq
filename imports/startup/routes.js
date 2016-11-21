import '../ui/body.js';
import '../ui/mySenators.js'
import '../ui/navigation.js'

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