import './groupDashboard.html'

Template.groupDashboard.onCreated(function() {
    // TODO:  Go through our app and figure out which subscription should be app level (Meteor.subscribe)
    //        and which ones should be Template level (this.subscribe/Template.instance().subscribe)
    Meteor.subscribe('userGroups');
    Tracker.autorun(() => {
        var taskIds = UserTasks.find().map( function(item) {return item.task_id;});
        console.log(taskIds);
        Meteor.subscribe('tasksAndDetails', taskIds);
    } )

})

Template.groupDashboard.helpers({
    getGroupFromGroupId() {
        const groupId = Template.instance().data.groupId;
        console.log("Finding group for " + groupId);
        const group = UserGroups.findOne(new Mongo.ObjectID(groupId));
        return group;
    }
});