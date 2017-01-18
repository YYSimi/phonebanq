import { FindTaskDetailFromTask } from '../../../lib/common.js'

import './groupDashboard.html'

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
        const group = UserGroups.findOne(new Mongo.ObjectID(groupId));
        return group;
    },

    getGroupTasks() {
        const groupId = Template.instance().data.groupId;
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

});

Template.groupTasks.helpers({
    addUsertaskToContextIfPresent() {
        const {task, taskDetail} = Template.instance().data.context;
    }
})
