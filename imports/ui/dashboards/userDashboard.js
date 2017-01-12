import './userDashboard.html'

Template.userDashboard.onCreated(function () {
    Meteor.subscribe('senators');
    Meteor.subscribe('representatives');
})

Template.userDashboardNav.helpers({
    fIsThisRouteActive(routeName) {
        return Router.current().route.getName() === routeName;
    }
})