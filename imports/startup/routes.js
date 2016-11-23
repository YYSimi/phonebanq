import '../ui/body.js';
import '../ui/mySenators.js'
import '../ui/navigation.js'
import '../ui/tasks/randomTask.js'
import '../ui/tasks/myTasks.js'

Router.configure({
   layoutTemplate: 'main' 
});

Router.route('/mySenators', {
    name: 'mySenators'
});

Router.route('/randomTask', {
    name: 'randomTask'
});

Router.route('/myTasks', {
    name: 'myTasks'
});

Router.route('/', {
    name: 'home',
    template: 'info'
})
