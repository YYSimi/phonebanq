// This has no associated .html file.  It is a place where we register global template helpers.

import { abbrState, FindTaskDetailFromTask, FindTaskFromUserTask } from '../../lib/common.js'
import { Roles } from 'meteor/alanning:roles';

function fUserHasRolesInSomeGroup(roles) {
    var user = Meteor.user();

    const allGroupIds = _.reduce(roles, function(memo, str) {
        return memo.concat(Roles.getGroupsForUser(user, str))
    }, []);

    return allGroupIds.length !== 0;
}

function fHasNewTaskPermissions() {
    return fUserHasRolesInSomeGroup(['site-admin', 'owner', 'admin', 'deputy'])
}

function fHasManageGroupsPermissions() {
    return Roles.userIsInRole(Meteor.user(), 'site-admin');
}

function fHasBlogPostPermissions() {
    return fUserHasRolesInSomeGroup(['site-admin', 'owner', 'admin'])
}

Template.registerHelper('fNeedsAdminMenu', function() {
    return fHasNewTaskPermissions() || fHasManageGroupsPermissions() || fHasBlogPostPermissions();
});

Template.registerHelper('fHasNewTaskPermissions', function() {
    return fHasNewTaskPermissions();
});

Template.registerHelper('fHasManageGroupsPermissions', function() {
    return fHasManageGroupsPermissions();
});

Template.registerHelper('fHasBlogPostPermissions', function() {
    return fHasBlogPostPermissions();
});


Template.registerHelper('equals', function (a, b) {
    return a === b;
});

Template.registerHelper('findMySenators', function() {
    user = Meteor.user();
    retval = [];
    if (user) {
        if (user.profile && user.profile.congressInfo && user.profile.congressInfo.senate){
            retval = user.profile.congressInfo.senate.map(function (senatorId) { return Senators.findOne({bioguide_id : senatorId})} );
        }
    }
    else {  //TODO:  Structure this better.  Disgusting global action-at-a-distance.
        congresspeople = Session.get("congresspeople");
        if (congresspeople) {
            retval = congresspeople.senate.map(function (senatorId) { return Senators.findOne({bioguide_id : senatorId})} );;
        }
    }
    return retval;
});

Template.registerHelper('findMyRepresentatives', function() {
    user = Meteor.user();
    retval = [];
    if (user){
        if (user.profile && user.profile.congressInfo && user.profile.congressInfo.house){
            retval = user.profile.congressInfo.house.map(function (repId) {return Representatives.findOne({bioguide_id : repId})});
        }
    }
    else {  //TODO:  Structure this better.  Disgusting global action-at-a-distance.
        congresspeople = Session.get("congresspeople");
        if (congresspeople) {
            retval = congresspeople.house.map(function (repId) {return Representatives.findOne({bioguide_id : repId})});;
        }
    }
    return retval;
})

Template.registerHelper('getUsernameFromId', function(userId) {
    const user = Meteor.users.findOne(userId);
    const retval = user ? user.username : "Unknown user";
    return retval;
})

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
    }).filter( function(elt) {return (elt != null && (group ? (_.isEqual(elt.task.group_id, group._id)) : true ) ) } );
    return retval;
}

function getUserStateName() {
    state = Meteor.user().profile.state;
    return abbrState(state, "name");
}

Template.registerHelper('getUserStateName', function() {
    return getUserStateName();
});

Template.registerHelper('getUserStateTasks', function() {
    state = Meteor.user().profile.state;
    if (state) {
        return getUserTasks(abbrState(state, "name"));
    }
});

Template.registerHelper('getUserTasks', function(groupName) {
    return getUserTasks(groupName);
});