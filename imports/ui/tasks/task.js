import './task.html'

import { abbrState, FindTaskDetailFromTask, FindTaskFromUserTask, TimeDeltaToPrettyString } from '../../../lib/common.js'
import { PBTaskTypesEnum } from '../../api/taskClasses.js'

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
    },
    // TODO:  Put this somewhere reusable.
    getTaskGylphName() {
        var retval = ""
        switch (this.context.task.task_type) {
            case PBTaskTypesEnum.phone:
                retval = "glyphicon-earphone";
                break;
            case PBTaskTypesEnum.freeform:
                retval = "glyphicon-list-alt"
                break;
            default:
                throw "Error:  Task type has no registered logo"
                break;
        }
        return retval;
    },
    fIsCompleted() {
        return this.context && this.context.userTask && this.context.userTask.is_completed;
    }
})

Template.UserTask.onRendered(() => {
    Template.instance().$('.btn').tooltip();
})

Template.registerHelper('equals', function (a, b) {
    return a === b;
});

Template.rawTaskButtons.events({
    'click .js-task-createAndSuccess'() {
        task = Template.instance().data.task;
        userTask = Template.instance().data.userTask;
        
        // If no usertask was passed in, create a new one.
        if (!userTask) {
            Meteor.call('userTasks.createUserTask', task._id);
            userTask = UserTasks.findOne({task_id: task._id});
        }

        // Either way, complete the task.
        if (userTask) {
            Meteor.call('userTasks.completeTask', userTask._id);
        }

        else {
            console.log("No UserTask Found");
        }
    }
});

Template.UserTaskButtons.events({
    'click .js-task-success'() {
        
        //TODO:  re-enable animations.  They're not working properly at the moment.
        //$("#"+this.userTask._id._str).hide('slow', () => {
        //    console.log("Hiding succeeded");
        Meteor.call('userTasks.completeTask', this.userTask._id);
        //})
    },
    'click .js-task-hide'() {
        
        //TODO:  re-enable animations.  They're not working properly at the moment.
        //$("#"+this.userTask._id._str).hide('slow', () => {
        //    console.log("Hiding succeeded");
        Meteor.call('userTasks.cancelTask', this.userTask._id);
        //})
    },
    'click .js-task-hideForever'() {
        
        //TODO:  re-enable animations.  They're not working properly at the moment.
        //$("#"+this.userTask._id._str).hide('slow', () => {
        //    console.log("Hiding succeeded");
        Meteor.call('userTasks.hideTaskForever', this.userTask._id);
        //})
    },
});