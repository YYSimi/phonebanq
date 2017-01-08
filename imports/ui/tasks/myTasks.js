import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { abbrState, FindTaskDetailFromTask, FindTaskFromUserTask, TimeDeltaToPrettyString } from '../../../lib/common.js'
import { PBTaskTypesEnum } from '../../api/taskClasses.js'


import './myTasks.html'

function getUserStateName() {
    state = Meteor.user().profile.state;
    return abbrState(state, "name");
}

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
    var retval =  userTasks.map(userTask => {
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
    return retval;
}

Template.myTasks.helpers({
    getUserStateName(){
        return getUserStateName();
    },
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

Template.UserTasks.helpers({
    hasUserTasks() {
        if (Template.instance().data.length > 0) {
            return true;
        }
        return false;
    }
})