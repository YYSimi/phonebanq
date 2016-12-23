import { ReactiveVar } from 'meteor/reactive-var'
import { Mongo } from 'meteor/mongo';

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
        return UserGroups.find({}, {sort: {name: 1} });
    }
});

Template.manageNewGroup.events({
    'click .js-new-group'(evt, template){
        template.$('.new-group-menu').show(200);
    }
})

Template.updateGroup.helpers({
    getOwner() {
        return Meteor.users.findOne(this.owner_id);
    },
    getAdmins() {
        if (this.admin_ids) {
            return Meteor.users.find({ '_id': {$in: this.admin_ids} })
        }
        return [];
    },
    getDeputies() {
        if (this.deputy_ids) {
            return Meteor.users.find({ '_id': {$in: this.deputy_ids} })
        }
        return [];
    }

})

Template.updateGroup.events({
    'submit form'(evt) {
        evt.preventDefault();
        var name = $('#group-name').val();
        var owner = $('#group-owner').find('.select-single-user').val();
        var admins = $('#group-administrators').find('.select-multiple-users').val();
        var deputies = $('#group-deputies').find('.select-multiple-users').val();

        var group = new UserGroup(name, owner, admins, deputies);
        console.log("Group creation submitted for group");
        console.log(group);

        Meteor.call('userGroups.create', group);
        return false;
    }
});

Template.manageGroups.onCreated(function() {
    this.memberUserIds = new ReactiveVar([]);
    this.group = new ReactiveVar({});
    Tracker.autorun(() => {
        Meteor.subscribe('findUsersByIds', this.memberUserIds.get())
    })
})

Template.manageGroups.helpers({
    generateButtonId(group) {
        return "edit-group-btn-" + group._id;
    },
    fHasGroup() {
        return !_.isEmpty(Template.instance().group.get());        
    },
    getGroup() {
        return Template.instance().group.get();
    }
})

Template.manageGroups.events({
    'click .js-edit-group': (evt, template) => {
        console.log("click!");
        var groupId = evt.currentTarget.attributes['data-group-id'].value;
        var group = UserGroups.findOne(new Mongo.ObjectID(groupId));
        if (group) {
            console.log(group);
            var memberIds = [group.owner_id];
            memberIds = memberIds.concat(group.admin_ids).concat(group.deputy_ids);
            template.memberUserIds.set(memberIds);
            template.group.set(group);
        }
    },
    'click .js-view-group'(evt){
        console.log("click!")
        console.log(evt);
    }
})

Template.manageGroups.onRendered(function() {
    this.$('[data-toggle="tooltip"]').tooltip();
})