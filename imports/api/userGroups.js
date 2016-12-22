import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';

Meteor.methods({
    'userGoups.create'(userGroup){
        check(userGroup, {
            name: String,
            owner_id: String,
            admin_ids: [String],
            deputy_ids: [String]
        });

        var user = Meteor.user();
        if (!user || !user.profile || !user.profile.permissions || 
            !user.profile.permissions.manageUserGroups) {
            throw new Meteor.Error('not-authorized', "The logged-in user does not have permission to manage user groups.")
        }

        var owner = Meteor.users.findOne(userGroup.owner_id);
        if (!owner) {
            throw new Meteor.Error('invalid-argument', "The owner identified for this group does not exist");
        }

        userGroup.admin_ids.forEach(function(id) {
            var admin = Meteor.users.findOne(id);
            if (!admin) {
                throw new Meteor.Error('invalid-argument', "One of the admins specified does not exist.")
            }
        })

        userGroup.deputy_ids.forEach(function(id) {
            var deputy = Meteor.users.findOne(id);
            if (!deputy) {
                throw new Meteor.Error('invalid-argument', "One of the deputies specified does not exist.")
            }
        })

        UserGroups.insert(userGroup);
    }
})