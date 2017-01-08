import { Template } from 'meteor/templating';

import './adminDashboard.html'

Template.adminDashboard.onCreated(() => {
    Meteor.subscribe('userGroups');
})

Template.adminDashboard.helpers({
    getMyAdminGroups() {
        // TODO:  This code is almost duplicated.  Figure out where to put it long-term. 
        const user = Meteor.user();

        const allGroupIds = _.reduce(['owner', 'admin', 'deputy'], function(memo, str) {
            return memo.concat(Roles.getGroupsForUser(user, str))
        }, []);

        const allGroupMongoIds = _.map(allGroupIds, function(id) {
            return new Mongo.ObjectID(id);
        })

        return UserGroups.find({ _id: {$in: allGroupMongoIds} });
    }
})