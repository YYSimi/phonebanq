export var indexCallbacks = function() {
    var callbacks = [];

    return {
        registerCallback(callback) {
            callbacks.push(callback);
        },
        executeCallbacks() {
            callbacks.forEach((fn) => {
                fn();
            })
        }
    }
}();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BIG 'OL WARNING:
//
// We're using MongoDB's id generation for our tables, because doing so will make things much easier 
// if/when we use non-meteor tools to interact with our DB.
//
// _Unfortunately_ the built-in Meteor Accounts package (which we don't want to re-implement), forces user 
// accounts to use Meteor-style IDs (which are just strings).  Ruh-roh.
// See https://github.com/meteor/meteor/issues/1834.
//
// For now, we'll treat userIds and all other IDs separately.  This is error prone, however, so once we become
// more familiar with database design and the pros/cons of each strategy, we will look into either forking the users
// module, migrating the DB to use meteor IDs everywhere, or making a firm commitment to live with the limitation. 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// TODO:  Similar to the above, we need to standardize on a format when storing ObjectIDs in the database (particularly since
// OIDs are often converted to strings when used in HTML selectors).  Right now, some things are stored as OIDs, some things are
// stored as strings, since we didn't understand that limitation when we created this app.  In the near future, we will standardize,
// most likely on storing OIDs everywhere, and we will write DB migration code to do so as our first migration test!

// TODO:  Figure out if we need to deny change permissions on the user collection.  See https://dweldon.silvrback.com/common-mistakes

Senators = new Mongo.Collection("senators", { idGeneration: 'MONGO' });
indexCallbacks.registerCallback(() => {
    Senators._ensureIndex({ state: 1});
    Senators._ensureIndex({ bioguide_id: 1});
})

Representatives = new Mongo.Collection("representatives", { idGeneration: 'MONGO' });
indexCallbacks.registerCallback(() => {
    Representatives._ensureIndex({ state: 1, district: 1});
    Representatives._ensureIndex({ bioguide_id: 1});
})

CustomCallers = new Mongo.Collection("customCallers", { idGeneration: 'MONGO' });
indexCallbacks.registerCallback(() => {
})

UserTasks = new Mongo.Collection("userTasks", { idGeneration: 'MONGO' });
indexCallbacks.registerCallback(() => {
    UserTasks._ensureIndex({user_id: 1, group_id: 1});
    UserTasks._ensureIndex({task_id: 1});
})

Tasks = new Mongo.Collection("tasks", { idGeneration: 'MONGO' });
indexCallbacks.registerCallback(() => {
    Tasks._ensureIndex({ task_type: 1});
    Tasks._ensureIndex({ owner: 1});
    Tasks._ensureIndex({ task_detail_id: 1});
    Tasks._ensureIndex({ group: 1, priority: -1}); //TODO:  Figure out exact task priority mechanism.
})

PhoneTasks = new Mongo.Collection("phoneTasks", { idGeneration: 'MONGO' });
indexCallbacks.registerCallback(() => {
    PhoneTasks._ensureIndex({ parent_task_id: 1 });
})

FreeformTasks = new Mongo.Collection("freeformTasks", { idGeneration: 'MONGO' });
indexCallbacks.registerCallback(() => {
    FreeformTasks._ensureIndex({ parent_task_id: 1});
})

TaskStatistics = new Mongo.Collection("taskStatistics", { idGeneration: 'MONGO' });
indexCallbacks.registerCallback(() => {
})

UserGroups = new Mongo.Collection("userGroups", { idGeneration: 'MONGO'});
indexCallbacks.registerCallback(() => {
    UserGroups._ensureIndex({name: 1});

    // TODO:  Do we index this for the admin/deputy array?
    // Probably not, but think about it as you learn more about Mongodb.
    // The current design is to store all groups the user manages in any way
    // with the user, then use that to query the relevant groups rather than
    // keeping an index on the table directly.  Shoud we even be indexing
    // for the owner?  Also probably not, but it's a low-overhead index and we'll keep it
    // for now, until we revisit this issue.
    UserGroups._ensureIndex({owner_id: 1});
})

BlogTopics = new Mongo.Collection("blogTopics", { idGeneration: 'MONGO'})
indexCallbacks.registerCallback(() => {
    BlogTopics._ensureIndex({group_id: 1})
})

BlogComments = new Mongo.Collection("blogComments", { idGeneration: 'MONGO'})
indexCallbacks.registerCallback(() => {
    BlogComments._ensureIndex({topic_id: 1})
})
