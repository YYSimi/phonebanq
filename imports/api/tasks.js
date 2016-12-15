import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

import { PBTaskTypesEnum } from './taskClasses.js'

// MASSIVE TODO:  This is where all of the server calls go through.  Make sure that the calls are locked-down to...
//                    1)  Only allow authenticated/admin users to do auth/admin user things
//                    2)  Put at least some protection in around DB flooding/DoS attacks
// TODO 1 -- Do the aboe for Meteor Methods.
// TODO 2 -- DO the above for publications. 

// Handle publication for tasks.  TODO:  Is this the correct file for this?
if (Meteor.isServer) {
    Meteor.publish('userTasks', function() {
        return UserTasks.find({user_id : this.userId});
    });
    Meteor.publish('tasksAndDetails', function(taskIds) {
        check(taskIds, [Mongo.ObjectID]);
        var tasks = Tasks.find({ '_id': {$in: taskIds} });
        // TODO:  Figure out how to iterate automatically so we don't have to touch this code when adding a task type
        // TODO:  Filter, then map. Not visa-versa.
        var phoneTaskIds = tasks.map(function(item) { 
            if (item.task_type == "phone") { return new Mongo.ObjectID(item.task_detail_id) } // TODO:  Figure out when we use strs vs MongoIDs
            else { return null; }
        } ).filter( function (elt) {return elt != null } );
        var phoneTasks = PhoneTasks.find({ '_id': {$in: phoneTaskIds} });

        var freeformTaskIds = tasks.map(function(item) { 
            if (item.task_type == "freeform") { return new Mongo.ObjectID(item.task_detail_id) } // TODO:  Figure out when we use strs vs MongoIDs
            else { return null; }
        } ).filter( function (elt) {return elt != null } );
        var freeformTasks = FreeformTasks.find({ '_id': {$in: freeformTaskIds} });

        return [tasks, phoneTasks, freeformTasks];
    });
    Meteor.publish('senators', function() {
        return Senators.find();
    });
    Meteor.publish('representatives', function() {
        return Representatives.find();
    });
    Meteor.publish('adminTasks', function() {
        return Tasks.find({owner : this.userId});
    } );
    Meteor.publish('taskDetails', function( taggedTaskDetailIds ) {
        check(taggedTaskDetailIds, [{task_type: String, task_detail_id: String}]);

        // TODO:  Figure out how to iterate automatically so we don't have to touch this code when adding a task type
        // TODO:  Filter, then map. Not visa-versa.
        var phoneTaskIds = taggedTaskDetailIds.map(function(item) { 
            if (item.task_type == "phone") { return new Mongo.ObjectID(item.task_detail_id) }
            else { return null; }
        } ).filter( function (elt) {return elt != null } );
        var phoneTasks = PhoneTasks.find({ '_id': {$in: phoneTaskIds} });

        var freeformTaskIds = taggedTaskDetailIds.map(function(item) { 
            if (item.task_type == "freeform") { return new Mongo.ObjectID(item.task_detail_id) } // TODO:  Figure out when we use strs vs MongoIDs
            else { return null; }
        } ).filter( function (elt) {return elt != null } );
        var freeformTasks = FreeformTasks.find({ '_id': {$in: freeformTaskIds} });

        return [phoneTasks, freeformTasks];
    });
    Meteor.publish('topTasks', function() {
        var topTasks = Tasks.find({is_disabled: {$ne: true}}, {sort: {priority: -1}, limit:4})
        
       //TODO:  Function-out this task-detial-list-from-task stuff. 
        // TODO:  Figure out how to iterate automatically so we don't have to touch this code when adding a task type
        // TODO:  Filter, then map. Not visa-versa.
       var phoneTaskIds = topTasks.map(function(item) { 
            if (item.task_type == "phone") { return new Mongo.ObjectID(item.task_detail_id) } // TODO:  Figure out when we use strs vs MongoIDs
            else { return null; }
        } ).filter( function (elt) {return elt != null } );
        var phoneTasks = PhoneTasks.find({ '_id': {$in: phoneTaskIds} });

        var freeformTaskIds = topTasks.map(function(item) { 
            if (item.task_type == "freeform") { return new Mongo.ObjectID(item.task_detail_id) } // TODO:  Figure out when we use strs vs MongoIDs
            else { return null; }
        } ).filter( function (elt) {return elt != null } );
        var freeformTasks = FreeformTasks.find({ '_id': {$in: freeformTaskIds} });

        return [topTasks, phoneTasks, freeformTasks];
    })
}

// TODO:  Research if you should convert all Meteor.user()/Meteor.userId calls to this.user
Meteor.methods({
    // TODO:  Data validation!
    // TODO:  _Definitely_ make task DB management a different API/class than userTask management.
    'tasks.registerNewTask'(task, taskDetail){
        console.log(task);
        // TODO:  If constructor-based matching after Meteor.call starts working in future versions of meteor, use that instead.
        check(task,
        {
            tiny_description: String,
            brief_description: String,
            start_date: Date,
            end_date: Date,
            task_type: String,
            issues: [String],
            priority: Number,
            xp_value: Number,
        });

        // TODO:  All of this ugly switch stuff needs to become object-oriented.
        switch (task.task_type) {
            case PBTaskTypesEnum.phone:
                check(taskDetail,
                {
                    general_script: Match.Maybe(String),
                    supporter_script: Match.Maybe(String),
                    opposition_script: Match.Maybe(String),
                    notes: String,
                    call_my_national_senators: Boolean,
                    call_my_national_representatives: Boolean,
                    call_custom_senators: [String],
                    call_custom_representatives: [String],
                    call_custom: [String],
                });
                break;
            case PBTaskTypesEnum.freeform:
                check(taskDetail,
                {
                    instructions: String,
                    notes: String
                });
                break;
            default:
                throw new Meteor.Error("invalid-parameter", "The given task detail does not match the specified task type ") // TODO:  figure out how check_fail works.
        }

        var user = Meteor.user();
        if (!user || !user.profile || !user.profile.permissions || 
        !user.profile.permissions.registerNewTasks) {
            throw new Meteor.Error('not-authorized', "The logged-in user does not have permission to make new tasks.")
        }

        // TODO:  Make this work for task types other than phone!
        // TODO:  Take out all manual references to phone task strings!
        task.owner = this.userId;
        Tasks.insert(task, function(err, taskId) {
            if (err) { console.log(err); }
            else {
                taskDetail.parent_task_id = taskId._str;
                switch(task.task_type) {
                    case PBTaskTypesEnum.phone:
                        PhoneTasks.insert(taskDetail, function(err, taskDetailId) {
                            if (err) { console.log(err) }
                            else {
                                Tasks.update(taskId, {$set : {task_detail_id : taskDetailId._str}})
                            }
                        });
                        break;
                    case PBTaskTypesEnum.freeform:
                        FreeformTasks.insert(taskDetail, function(err, taskDetailId) {
                            if (err) { console.log(err) }
                            else {
                                Tasks.update(taskId, {$set : {task_detail_id : taskDetailId._str}})
                            }
                        });
                        break;
                    default:
                        throw new Meteor.Error("invalid-parameter", "The given task detail does not match the specified task type") // TODO:  figure out how check_fail works.
                }
            }
        })
    },

    // Stops a task from being given to any additional users.
    'tasks.disableTask'(taskId) {
        check(taskId, Mongo.ObjectID)
        var user = Meteor.user();
        task = Tasks.findOne(taskId);
        if (task && task.owner == user._id) {
            console.log("disabling task")
            Tasks.update(taskId, {$set : { is_disabled : true}})
        }
    },

    // Completes a task and moves it off of the active task list
    'tasks.completeTask'(userTaskId) {
        check(userTaskId, Mongo.ObjectID); // TODO:  Figure out MongoId vs String relationship in collections.
        console.log('completing task ' + userTaskId );
       
        userTask = UserTasks.findOne(userTaskId);
        var userId = Meteor.userId();
        var user = Meteor.user();
       
        if (userId != userTask.user_id) {
            throw new Meteor.Error('not-autherized', "The logged-in user does not own this task.");
        }

        task = Tasks.findOne(new Mongo.ObjectID(userTask.task_id));
        if (!task) {
            throw new Meteor.Error('bad-state', "The associated task does not exist")
        }

        // TODO:  Don't get the user object here.  Just atomically increment the XP value.
        if (!userTask.is_completed) {
            var currentXp = 0;
            if (user && user.profile && user.profile.progression && user.profile.progression.xp) {
                currentXp = user.profile.progression.xp;
            }
            var taskXp = task.xp_value || 1;    //TODO:  Make a file that stores default values for DB not-fully-initialized DB elements.
            var newXp = currentXp + taskXp;
            Meteor.users.update(userId, {$set : {"profile.progression.xp" : newXp}})
        }

        UserTasks.update(userTaskId, { $set: {is_completed : true, is_active:false } });

        if (userTask.is_active) {
            Meteor.users.update(userId, {$inc: {"statistics.activeTasks": -1} });
        }

    },

    // Removes a task from the active task list.
    'tasks.cancelTask'(userTaskId) {
        check(userTaskId, Mongo.ObjectID); // TODO:  Figure out MongoId vs String relationship in collections.
        console.log('cancelling task ' + userTaskId );
        
        var userTask = UserTasks.findOne(userTaskId);
        var user = Meteor.user();
        var userId = Meteor.userId();
        
        if (userId != userTask.user_id) {
            throw new Meteor.Error('not-autherized', "The logged-in user does not own this task.");
        }
        
        task = Tasks.findOne(new Mongo.ObjectID(userTask.task_id));
        if (!task) {
            throw new Meteor.Error('bad-state', "The associated task does not exist")
        }

        // TODO:  Make class-like interface that pairs the remove and update call together.
        if (userTask.is_active) {
            UserTasks.update(
                { _id: userTaskId },
                { $set: { "is_active" : false} }
            );
            Meteor.users.update(userId, {$inc: {"statistics.activeTasks": -1} });
        }
    },

    // Moves a task back to the active task list and marks it as not completed.
    // TODO:  Think through the details of this use case.  e.g. Do we change the expiry date? 
    'tasks.unCompleteTask'(userTaskId) {
        check(userTaskId, Mongo.ObjectID); // TODO:  Figure out MongoId vs String relationship in collections.
        console.log('uncompleting task ' + userTaskId );
        
        var userTask = UserTasks.findOne(userTaskId);
        var user = Meteor.user();
        var userId = Meteor.userId();
        
        if (userId != userTask.user_id) {
            throw new Meteor.Error('not-autherized', "The logged-in user does not own this task.");
        }
        
        task = Tasks.findOne(new Mongo.ObjectID(userTask.task_id));
        if (!task) {
            throw new Meteor.Error('bad-state', "The associated task does not exist")
        }

        // TODO:  Don't get the user object here.  Just atomically increment the XP value.
        if (userTask.is_completed) {
            var currentXp = 0;
            if (user && user.profile && user.profile.progression && user.profile.progression.xp) {
                currentXp = user.profile.progression.xp;
            }
            var taskXp = task.xp_value || 1;    //TODO:  Make a file that stores default values for DB not-fully-initialized DB elements.
            var newXp = currentXp - taskXp;
            Meteor.users.update(userId, {$set : {"profile.progression.xp" : newXp}})

           if (!userTask.is_active) {
                UserTasks.update(
                    { _id: userTaskId },
                    { $set: { "is_active" : true, "is_completed": false} }
                );
                Meteor.users.update(userId, {$inc: {"statistics.activeTasks": 1} });
            }

        }

    },

    // TODO:  Create a class-like interface for managing UserTasks, then have the Meteor methods call directly into the class.

    // This user will never again see the given task.
    'tasks.hideTaskForever'(userTaskId) {
        check(userTaskId, Mongo.ObjectID); // TODO:  Be more specific about the kind of object.  Figure out MongoId vs String relationship in collections.
        userTask = UserTasks.findOne(userTaskId);
        var userId = Meteor.userId();
        if (userId != userTask.user_id) {
            throw new Meteor.Error('not-autherized', "The logged-in user does not own this task.");
        }
        
        // TODO:  Really, create a class-like interface to pair these two calls together.
        UserTasks.update(
            { _id: userTaskId },
            { $set: { "is_active" : false,  "never_show_again" : true} }
        );

        if (userTask.is_active) {
            Meteor.users.update(userId, {$inc: {"statistics.activeTasks": -1} });
        }

    }
})