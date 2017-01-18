import '../ui/globalTemplateHelpers.js'

import '../ui/body.js'
import '../ui/navigation.js'
import '../ui/footer.js'
import '../ui/welcome.js'
import '../ui/ancillaryPages/about.js'
import '../ui/stringAssets.js'
import '../ui/blog.js';

import '../ui/widgets/userInfoWidgets.js'
import '../ui/widgets/findUserWidgets.js'
import '../ui/widgets/userXpWidgets.js'
import '../ui/widgets/fillerWidgets.js'
import '../ui/widgets/taskOverviewWidgets.js'
import '../ui/widgets/congressionalInfoWidgets.js'
import '../ui/widgets/socialMediaWidgets.js'

import '../ui/dashboards/userDashboard.js'
import '../ui/dashboards/adminDashboard.js'
import '../ui/dashboards/groupDashboard.js'

import '../ui/userSettings.js'
import '../ui/loginUi.js'

import '../ui/tasks/task.js'
import '../ui/tasks/phoneTask.js'
import '../ui/tasks/freeformTask.js'
import '../ui/tasks/completedTasks.js'
import '../ui/tasks/anonymousTasks.js'
import '../ui/tasks/myTasks.js'
import '../ui/tasks/newTask.js'
import '../ui/tasks/tasksAdmin.js'

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
    layoutTemplate: 'mainLoginRequired'
});

Router.route('/myTasks', {
    name: 'myTasks',
    layoutTemplate: 'mainLoginRequired'
});

Router.route('/completedTasks', {
    name: 'completedTasks',
    layoutTemplate: 'mainLoginRequired'

});

Router.route('/newTask', {
    name: 'newTask',
    layoutTemplate: 'mainLoginRequired'
});

Router.route('/editTask/:_id', {
    name: 'editTask',
    template: 'newTask',
    layoutTemplate: 'main',
    data: function() {return this.params._id}
});

Router.route('/tasksAdmin', {
    name: 'tasksAdmin',
    layoutTemplate: 'mainLoginRequired'
});

Router.route('/blogs/postTopic', {
    name: 'postBlogTopic',
    layoutTemplate: 'mainLoginRequired',
});

Router.route('/blogs/siteBlog/', {
    name: 'viewSiteBlog',
    template: 'displayBlogTopicsByGroupId',
    layoutTemplate: 'main',
});

Router.route('/blogs/displayGroupBlog/:_id', {
    name: 'displayBlogTopicsByGroupId',
    layoutTemplate: 'main',
    data: function() {return {groupId: this.params._id} }
});

// TODO:  Use of _str is disgusting here.  Clean it up once we understand
//        Iron Router better.  For now, it's the _id._str that should be passed in.
Router.route('/blogs/displayTopic/:_str', {
    name: 'displayBlogTopicById',
    layoutTemplate: 'main',
    data: function() {return {topicId: this.params._str} }
});

Router.route('/groupsAdmin', {
    name: 'groupsAdmin',
    layoutTemplate: 'mainLoginRequired'
});

Router.route('/officials', {
    name: 'officials',
    template: 'officialRepresentationNav',
    layoutTemplate: 'mainLoginRequired'
})

Router.route('/userDashboard', {
    name: 'userDashboard',
    layoutTemplate: 'mainLoginRequired'
});

Router.route('/adminDashboard', {
    name: 'adminDashboard',
    layoutTemplate: 'mainLoginRequired'
});

Router.route('/groups/:_id', {
    name: 'groupDashboard',
    layoutTemplate: 'mainLoginRequired',
    data: function() {return {groupId: this.params._id }}
});

Router.route('/groups', {
    name: 'allGroupsDashboard',
    layoutTemplate: 'mainLoginRequired'
});

Router.route('/', {
    name: 'main',
    template: 'welcome',
    layoutTemplate: 'mainNoContainer'

})

Router.route('/welcome', {
    name: 'welcome',
    layoutTemplate: 'mainNoContainer'
})