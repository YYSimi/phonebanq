import '../ui/body.js'
import '../ui/home.js'
import '../ui/navigation.js'
import '../ui/about.js'
import '../ui/stringAssets.js'

import '../ui/userXpWidgets.js'
import '../ui/userSettings.js'

import '../ui/tasks/completedTasks.js'
import '../ui/tasks/anonymousTasks.js'
import '../ui/tasks/myTasks.js'
import '../ui/tasks/newTask.js'
import '../ui/tasks/tasksAdmin.js'
import '../ui/tasks/phoneTask.js'
import '../ui/tasks/freeformTask.js'

Router.configure({
   layoutTemplate: 'main' 
});

Router.route('/about', {
    name: 'about'
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

Router.route('/newTask', {
    name: 'newTask'
});

Router.route('/tasksAdmin', {
    name: 'tasksAdmin'
});

Router.route('/groupsAdmin', {
    name: 'groupsAdmin'
});

Router.route('/', {
    name: 'home'
})
