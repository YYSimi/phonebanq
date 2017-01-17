import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import { FindTaskDetailFromTask, FindTaskFromUserTask, TimeDeltaToPrettyString } from '../../../lib/common.js'
import { PBTaskTypesEnum } from '../../api/taskClasses.js'


import './myTasks.html'

Template.myTasks.onCreated(function () {
    this.subscribe('userGroups');
    this.autorun(() => {
        var taskIds = UserTasks.find().map( function(item) {return item.task_id;});
        console.log(taskIds);
        this.subscribe('tasksAndDetails', taskIds);
    } )
});

Template.UserTasks.helpers({
    hasUserTasks() {
        if (Template.instance().data.length > 0) {
            return true;
        }
        return false;
    }
})