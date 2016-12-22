import { UserGroup } from '../api/userGroupClasses.js'
import './groupsAdmin.html'

Template.createGroup.events({
    'submit form'(evt) {
        evt.preventDefault();
        var name = $('#group-name').val();
        var owner = $('#group-owner').find('.select-single-user').val();
        var admins = $('#group-administrators').find('.select-multiple-users').val();
        var deputies = $('#group-deputies').find('.select-multiple-users').val();

        var group = new UserGroup(name, owner, admins, deputies);
        console.log("Group creation submitted for group");
        console.log(group)

        Meteor.call('userGoups.create', group);
        return false;
    }
});