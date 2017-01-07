import { Template } from 'meteor/templating';
import { Roles } from 'meteor/alanning:roles';

import './navigation.html';

Template.nav.helpers({
    fHasNewTaskPermissions() {
        var user = Meteor.user();
        // TODO: Move this check into a library call.  Code duplication!
        // TODO:  role review
        return Roles.userIsInRole(user, 'site-admin');
    },
    fHasManageGroupsPermissions() {
        var user = Meteor.user();
        // TODO: Move this check into a library call.  Code duplication!
        // TODO:  role review
        return Roles.userIsInRole(user, 'site-admin');
    },
    fIsThisRouteActive(routeName) {
        return Router.current().route.getName() === routeName;
    }
})