import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

// Handle publication for tasks.  TODO:  Is this the correct file for this?


if (Meteor.isServer) {
    Meteor.publish('userTasks', function() {
        return UserTasks.find({user_id : this.userId});
    });
    Meteor.publish('tasksAndDetails', function(taskIds) {
        check(taskIds, [Mongo.ObjectID]);
        var tasks = Tasks.find({ '_id': {$in: taskIds} });
        var phoneTaskIds = tasks.map(function(item) { 
            if (item.task_type == "phone") { return new Mongo.ObjectID(item.task_detail_id) } // TODO:  Figure out when we use strs vs MongoIDs
            else { return null; }
        } ).filter( function (elt) {return elt != null } );
        var phoneTasks = PhoneTasks.find({ '_id': {$in: phoneTaskIds} });

        return [tasks, phoneTasks];
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
        var phoneTaskIds = taggedTaskDetailIds.map(function(item) { 
            if (item.task_type == "phone") { return new Mongo.ObjectID(item.task_detail_id) }
            else { return null; }
        } ).filter( function (elt) {return elt != null } );

        var phoneTasks = PhoneTasks.find({ '_id': {$in: phoneTaskIds} });

        return phoneTasks;
    });
    Meteor.publish('overpublishedTasksAndDetails', function() {
        return [Tasks.find(), PhoneTasks.find()];
    })
}

// TODO:  Research if you should convert all Meteor.user()/Meteor.userId calls to this.user
Meteor.methods({
    // TODO:  Data validation!
    // TODO:  _Definitely_ make task DB management a different API/class than userTask management.
    'tasks.registerNewTask'(task, phoneTask){
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

        check(phoneTask,
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

        var user = Meteor.user();
        if (!user || !user.profile || !user.profile.permissions || 
        !user.profile.permissions.registerNewTasks) {
            throw new Meteor.Error('not-authorized', "The logged-in user does not have permission to make new tasks.")
        }

        // TODO:  Make this work for task types other than phone!
        // TODO:  Take out all manual references to phone task strings!
        task.owner = this.userId;
        task.task_type = "phone"
        Tasks.insert(task, function(err, taskId) {
            if (err) { console.log(err); }
            else {
                console.log(taskId);
                phoneTask.parent_task_id = taskId._str;
                PhoneTasks.insert(phoneTask, function(err, phoneTaskId) {
                    if (err) { console.log(err) }
                    else {
                        Tasks.update(taskId, {$set : {task_detail_id : phoneTaskId._str}})
                    }
                });
            }
        })
    },

    'tasks.disableTask'(taskId) {
        check(taskId, Mongo.ObjectID)
        var user = Meteor.user();
        task = Tasks.findOne(taskId);
        if (task && task.owner == user._id) {
            console.log("disabling task")
            Tasks.update(taskId, {$set : { is_disabled : true}})
        }
    },

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

    'tasks.cancelTask'(userTaskId) {
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
        }

        // TODO:  Make class-like interface that pairs the remove and update call together.
        UserTasks.remove(userTaskId);

        if (userTask.is_active) {
            Meteor.users.update(userId, {$inc: {"statistics.activeTasks": -1} });
        }

    },

    // TODO:  Create a class-like interface for managing UserTasks, then have the Meteor methods call directly into the class.

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
            { $set: { "is_active" : "false",  "never_show_again" : true} }
        );

        if (userTask.is_active) {
            Meteor.users.update(userId, {$inc: {"statistics.activeTasks": -1} });
        }

    }
})