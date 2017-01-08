import '../ui/body.js'
import '../ui/navigation.js'
import '../ui/footer.js'
import '../ui/welcome.js'
import '../ui/ancillaryPages/about.js'
import '../ui/stringAssets.js'

import '../ui/widgets/findUserWidgets.js'
import '../ui/widgets/userXpWidgets.js'
import '../ui/widgets/fillerWidgets.js'
import '../ui/userSettings.js'
import '../ui/loginUi.js'

import '../ui/tasks/completedTasks.js'
import '../ui/tasks/anonymousTasks.js'
import '../ui/tasks/myTasks.js'
import '../ui/tasks/newTask.js'
import '../ui/tasks/tasksAdmin.js'
import '../ui/tasks/phoneTask.js'
import '../ui/tasks/freeformTask.js'

import '../ui/groupsAdmin.js';

import '../ui/ancillaryPages/licensing.js'
import '../ui/ancillaryPages/privacyPolicy.js'

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

Router.route('/licensing',{
    name: 'licensing',
    layoutTemplate: 'main'
});

Router.route('/privacy',{
    name: 'privacyPolicy',
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

Router.route('/editTask/:_id', {
    name: 'editTask',
    template: 'newTask',
    layoutTemplate: 'main',
    data: function() {return this.params._id}
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
    template: 'welcome',
    layoutTemplate: 'mainNoContainer'

})

Router.route('/welcome', {
    name: 'welcome',
    layoutTemplate: 'mainNoContainer'
})