import { FindTaskDetailFromTask } from '../../../lib/common.js'

import './groupDashboard.html'

function getGroupFromGroupId(groupId) {
        return UserGroups.findOne(new Mongo.ObjectID(groupId));    
}

function getGroupTasks(groupId) {
    var tasks = Tasks.find({group_id: new Mongo.ObjectID(groupId)});

    var retval = tasks.map(task => {
        var mapRetval = null;

        var taskDetail = FindTaskDetailFromTask(task)
        if (taskDetail) { 
            mapRetval = {
                task: task,
                taskDetail: taskDetail 
            }
        }

        var userTask = UserTasks.findOne({task_id: task._id});
        if (userTask) {
            mapRetval.userTask = userTask;
        }

        return mapRetval;
    }).filter( function(item) { return item != null} );

    return retval;
}

Template.groupDashboard.onCreated(function() {
    // TODO:  Go through our app and figure out which subscription should be app level (Meteor.subscribe)
    //        and which ones should be Template level (this.subscribe/Template.instance().subscribe)
    const groupId = Template.instance().data.groupId;

    Meteor.subscribe('userGroups');
    Meteor.subscribe('userTasks');
    Meteor.subscribe('tasksByGroup', new Mongo.ObjectID(groupId));
    Tracker.autorun(() => {
        var taskIds = Tasks.find().map( function(item) {return item._id;});
        console.log(taskIds);
        Meteor.subscribe('tasksAndDetails', taskIds);
    } )

})

Template.groupDashboard.helpers({
    getGroupFromGroupId() {
        const groupId = Template.instance().data.groupId;
        return getGroupFromGroupId(groupId);
    },

    getGroupTasks() {
        const groupId = Template.instance().data.groupId;
        return getGroupTasks(groupId);
    }

});

Template.groupTasks.helpers({
    addUsertaskToContextIfPresent() {
        const {task, taskDetail} = Template.instance().data.context;
    }
})

Template.groupDashboardNav.onCreated(function() {
    this.currentTab = new ReactiveVar("groupTasks");
})

Template.groupDashboardNav.helpers({
    tab: function() {
        return Template.instance().currentTab.get();
    },
    tabData: function () {
        var tab = Template.instance().currentTab.get();
        var groupId = Template.instance().data.groupId;

        var data = {
            "groupTasks" : {taskContexts : getGroupTasks(groupId) },
            "displayBlogTopicsByGroupId": {groupId: groupId}
        }

        return data[tab]; 
    }
})

Template.groupDashboardNav.events({
    'click .nav-tabs li': function(evt, tmpl) {
        var currentTab = $(event.target).closest('li');
        currentTab.addClass( "active" );
        $(".nav-tabs li").not(currentTab).removeClass("active");
        tmpl.currentTab.set(currentTab.data("template"));
    }
})
