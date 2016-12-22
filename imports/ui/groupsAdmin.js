import { UserGroup } from '../api/userGroupClasses.js'
import './groupsAdmin.html'

Template.groupsAdmin.helpers({
    fHasManageGroupsPermissions() {
        var user = Meteor.user();
        // TODO: Move this check into a library call.  Code duplication!
        return user && user.profile && user.profile.permissions && user.profile.permissions.manageUserGroups;
    }
});

Template.manageGroups.onCreated(function () {
    Meteor.subscribe('userGroups');
});

Template.manageGroups.helpers({
    allGroups() {
        return UserGroups.find();
    }
});

Template.createGroup.events({
    'submit form'(evt) {
        evt.preventDefault();
        var name = $('#group-name').val();
        var owner = $('#group-owner').find('.select-single-user').val();
        var admins = $('#group-administrators').find('.select-multiple-users').val();
        var deputies = $('#group-deputies').find('.select-multiple-users').val();

        var group = new UserGroup(name, owner, admins, deputies);
        console.log("Group creation submitted for group");
        console.log(group);

        Meteor.call('userGoups.create', group);
        return false;
    }
});