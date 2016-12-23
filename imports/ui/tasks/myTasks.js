import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { abbrState, FindTaskDetailFromTask, FindTaskFromUserTask, TimeDeltaToPrettyString } from '../../../lib/common.js'

import './myTasks.html'

Template.myTasks.onCreated(function () {
    this.subscribe('userGroups');
    this.autorun(() => {
        var taskIds = UserTasks.find().map( function(item) {return new Mongo.ObjectID(item.task_id);});
        this.subscribe('tasksAndDetails', taskIds);
    } )
});

// This is global so that we can use it as a helper.
// TODO:  Find a better way to do this.
function getUserTasks(groupName) {
    var group = null;
    if (groupName) {
        group = UserGroups.findOne({name: groupName});
        if (!group) {
            return [];
        }
    }

    var userTasks = UserTasks.find({ user_id: Meteor.userId(), is_completed: false, is_active: true });
    return userTasks.map(userTask => {
        var mapRetval = null;
        var task = FindTaskFromUserTask(userTask);
        if (task) { //The task might not exist in our local DB if our subscription hasn't updated yet
            var taskDetail = FindTaskDetailFromTask(task);
            if (taskDetail) {  //Ditto for task detail
                mapRetval =  {
                    userTask: userTask,
                    task: task,
                    taskDetail: taskDetail
                }
            }
        }
        return mapRetval;
    }).filter( function(elt) {return (elt != null && (group ? (elt.task.group === group._id._str) : true ) ) } );
}

Template.myTasks.helpers({
    getUserStateTasks(){
        state = Meteor.user().profile.state;
        if (state) {
            return getUserTasks(abbrState(state, "name"));
        }
    },
    getUserTasks(groupName) {
        return getUserTasks(groupName);
    }
});

Template.UserTask.helpers({
    hasTimeRemaining() {
      return this.context && this.context.userTask && this.context.userTask.lasts_until ? true : false;
    },
    timeRemaining() {
        return TimeDeltaToPrettyString(new Date(), this.context.userTask.lasts_until);
    },
    taskButtonsTemplateName() {
        return this.buttonsTemplate;
    },
    userPluralizedString() {
        var bHasExactlyOneCompletion = this.context && this.context.task && this.context.task.statistics && (this.context.task.statistics.completion_count === 1)
        return bHasExactlyOneCompletion ? "user" : "users";
    }
})

Template.ActiveTaskButtons.events({
    'click .js-task-success'() {
        
        //TODO:  re-enable animations.  They're not working properly at the moment.
        //$("#"+this.userTask._id).hide('slow', () => {
        //    console.log("Hiding succeeded");
        Meteor.call('userTasks.completeTask', this.userTask._id);
        //})
    },
    'click .js-task-hide'() {
        
        //TODO:  re-enable animations.  They're not working properly at the moment.
        //$("#"+this.userTask._id).hide('slow', () => {
        //    console.log("Hiding succeeded");
        Meteor.call('userTasks.cancelTask', this.userTask._id);
        //})
    },
    'click .js-task-hideForever'() {
        
        //TODO:  re-enable animations.  They're not working properly at the moment.
        //$("#"+this.userTask._id).hide('slow', () => {
        //    console.log("Hiding succeeded");
        Meteor.call('userTasks.hideTaskForever', this.userTask._id);
        //})
    },
});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
