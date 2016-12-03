import '../ui/body.js'
import '../ui/home.js'
import '../ui/mySenators.js'
import '../ui/myRepresentatives.js'
import '../ui/navigation.js'
import '../ui/about.js'

import '../ui/userSettings.js'

import '../ui/tasks/dailyCallPrompt.js'
import '../ui/tasks/weeklyCallPrompt.js'
import '../ui/tasks/completedTasks.js'
import '../ui/tasks/myTasks.js'


Router.configure({
   layoutTemplate: 'main' 
});

Router.route('/about', {
    name: 'about'
});

Router.route('/mySenators', {
    name: 'mySenators'
});

Router.route('/myRepresentatives', {
    name: 'myRepresentatives'
});

Router.route('/userSettings', {
    name: 'userSettings'
});

Router.route('/myTasks', {
    name: 'myTasks'
});

Router.route('/completedTasks', {
    name: 'completedTasks'
});

Router.route('/', {
    name: 'home'
})
