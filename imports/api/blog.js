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
    },

    'blogs.postComment'(comment){
        check(comment, {
            content: String,
            topic_id: Mongo.ObjectID
        });
        const user = Meteor.user();

        // TODO:  Figure out who is allowed to post comments.
        if (!user) {
            throw new Meteor.Error('not-authorized')
        }

        const topic = BlogTopics.findOne(comment.topic_id);
        if (!topic) {
            throw new Meteor.error('bad-parameter', "The provided topic does not exist");
        }

        comment.created_date = new Date();
        comment.updated_date = new Date();
        comment.user_id = user._id;
        comment.sequence_number = BlogComments.find({topic_id: comment.topic_id}).count() + 1;

        BlogComments.insert(comment);
    }
});