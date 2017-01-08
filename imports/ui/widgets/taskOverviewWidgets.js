import './taskOverviewWidgets.html'

Template.taskOverviewByGroupRow.onCreated(() => {
    Meteor.subscribe('tasksByGroup', Template.instance().data.group._id);
})

Template.taskOverviewByGroupRow.helpers({
    getTasksFromGroup(){
        return Tasks.find({group: Template.instance().data.group._id._str });
    }
})
