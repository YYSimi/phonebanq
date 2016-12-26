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
    UserTasks._ensureIndex({user_id: 1});
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
    // TODO:  Do we index this for the admin/deputy array?
    // Probably not, but think about it as you learn more about Mongodb.
    // The current design is to store all groups the user manages in any way
    // with the user, then use that to query the relevant groups rather than
    // keeping an index on the table directly.  Shoud we even be indexing
    // for the owner?  Also probably not, but it's a low-overhead index and we'll keep it
    // for now, until we revisit this issue.
    UserGroups._ensureIndex({owner_id: 1});
})
