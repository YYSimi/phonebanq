import './userDashboard.html'

Template.userDashboard.onCreated(function () {
    Meteor.subscribe('senators');
    Meteor.subscribe('representatives');
})