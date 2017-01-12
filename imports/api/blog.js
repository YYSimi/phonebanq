import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Match, check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';

Meteor.methods({
    'blogs.postTopic'(topic){
        check(topic, {
            title: String,
            content: String,
            task_id: Match.Maybe(Mongo.ObjectID),
            group_id: Mongo.ObjectID
        });

        const user = Meteor.user();

        topic.user_id = user._id;
        topic.created_date = new Date();
        topic.updated_date = new Date();

        if (!Roles.userIsInRole(user, ['owner', 'admin'], topic.group_id._str)) {
            throw new Meteor.Error('not-authrized', 'The logged in user does not have permission to post a new topic');
        }

        const group = UserGroups.findOne(topic.group_id);
        if (!group) {
            throw new Meteor.Error('bad-parameter', "The provided group does not exist");
        }

        BlogTopics.insert(topic);
    }
});