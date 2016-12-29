import '../ui/body.js'
import '../ui/home.js'
import '../ui/navigation.js'
import '../ui/welcome.js'
import '../ui/about.js'
import '../ui/stringAssets.js'

import '../ui/findUserWidgets.js'
import '../ui/userXpWidgets.js'
import '../ui/userSettings.js'

import '../ui/tasks/completedTasks.js'
import '../ui/tasks/anonymousTasks.js'
import '../ui/tasks/myTasks.js'
import '../ui/tasks/newTask.js'
import '../ui/tasks/tasksAdmin.js'
import '../ui/tasks/phoneTask.js'
import '../ui/tasks/freeformTask.js'

import '../ui/groupsAdmin.js';

Router.configure({
   layoutTemplate: 'main'
});

Router.configure({
    layoutTemplate: 'mainNoContainer'
})

Router.route('/about', {
    name: 'about',
    layoutTemplate: 'main'
});

Router.route('/userSettings', {
    name: 'userSettings',
    layoutTemplate: 'main'

});

Router.route('/myTasks', {
    name: 'myTasks',
    layoutTemplate: 'main'

});

Router.route('/completedTasks', {
    name: 'completedTasks',
    layoutTemplate: 'main'

});

Router.route('/newTask', {
    name: 'newTask',
    layoutTemplate: 'main'

});

Router.route('/tasksAdmin', {
    name: 'tasksAdmin',
    layoutTemplate: 'main'

});

Router.route('/groupsAdmin', {
    name: 'groupsAdmin',
    layoutTemplate: 'main'

});

Router.route('/', {
    name: 'welcome',
    layoutTemplate: 'mainNoContainer'

})

Router.route('/welcome', {
    name: 'welcome',
    layoutTemplate: 'mainNoContainer'
})

Router.onRun(function () {
    $('a[href="' + '/' + Router.current().route.getName() + '"]').parents('li,ul').addClass('active');
    this.next();
})

Router.onStop(function() {
    $('a[href="' + '/' + Router.current().route.getName()  + '"]').parents('li,ul').removeClass('active');
})