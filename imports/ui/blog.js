import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Roles } from 'meteor/alanning:roles'
import { IsLoaded } from '../api/isLoaded.js'

import { getWebsiteGroup } from '../../lib/common.js';


import './blog.html'

var quillContent; //TODO:  Globals.  Gross.  Attach it to the template maybe?
var quillComment; //TODO:  Globals.  Gross.  Attach it to the template maybe?

Template.postBlogTopic.onCreated(function () {
    var tmpl = Template.instance();
    Meteor.subscribe('userGroups');
});

Template.postBlogTopic.onRendered(function (){

    Tracker.autorun(function() {
        const user = Meteor.user();

        const allGroupIds = _.reduce(['owner', 'admin'], function(memo, str) {
            return memo.concat(Roles.getGroupsForUser(user, str))
        }, []);

        const allGroups = _.reduce(allGroupIds, function(memo, groupId) {
            var group = UserGroups.findOne(new Mongo.ObjectID(groupId));
            if (group) {
                return memo.concat(group);
            }
            return memo;
        }, [])
        
        allGroups.sort((a,b) => {return (a.name).localeCompare(b.name)}).forEach(function (group){
            $("#group").append("<option value=" + group._id + ">" + group.name + "</option>" ); 
        });
    });

    Tracker.autorun( () => {
        if (IsLoaded.getQuillJSLoaded()) {
            quillContent = new Quill('#content', {
                theme: 'snow'
            });
        }
    });
});

Template.postBlogTopic.events({
    'submit form'(evt){
        evt.preventDefault();

        $("#content").val(JSON.stringify(quillContent.getContents()))

        const post = {
            title : $('#title').val(),
            content : $('#content').val(),
            group_id : new Mongo.ObjectID($("#group").val())
        }

        console.log(post);

        Meteor.call('blogs.postTopic', post);
        return false;
    }
});

Template.displayBlogTopicsByGroupId.onCreated(function () {
    Meteor.subscribe('userGroups');
    Tracker.autorun(() => {
        if (getWebsiteGroup()) {
            Meteor.subscribe('blogTopicsByGroupId', getWebsiteGroup()._id);
        }
    });
});

// TODO:  Make this actually accept group IDs.  For now, it always displays the website group.
Template.displayBlogTopicsByGroupId.helpers({
    'getBlogTopicsFromGroupId'() {
        retval = [];
        if (getWebsiteGroup()) {
            retval = BlogTopics.find({group_id: getWebsiteGroup()._id}, {sort: {created_date: -1}}).fetch();
        }
        return retval;
    }
});

Template.displayBlogTopicById.onRendered(function () {
    Meteor.subscribe('blogTopic', new Mongo.ObjectID(Template.instance().data.topicId));
});

Template.displayBlogTopicById.helpers({
    getBlogTopicFromId() {
        return BlogTopics.findOne(new Mongo.ObjectID(Template.instance().data.topicId));
    }
});

Template.displayBlogTopic.onRendered(function() {
    if (Template.instance().data.topic) {
        Meteor.subscribe('findUsersByIds', [Template.instance().data.topic.user_id]);
    }
});

Template.displayBlogTopic.onRendered(function() {
    Tracker.autorun(() => {
        if (IsLoaded.getQuillJSLoaded()) {
            var quillContent = new Quill(this.find('.content'), {
                theme: 'snow',
                readOnly: true,
                modules: {
                    toolbar: false
                }
            });
        }

        if (this.data.topic) {
            quillContent.setContents(JSON.parse(this.data.topic.content));
        }
    });
})

Template.postBlogComment.onRendered(function() {
    Tracker.autorun( () => {
        if (IsLoaded.getQuillJSLoaded()) {
            quillComment = new Quill(Template.instance().find('#comment'), {
                theme: 'snow'
            });
        }
    });
})

Template.postBlogComment.events({
    'submit form'(evt, tmpl){
        evt.preventDefault();

        if (quillComment.getText().trim().length !== 0)
        {
            const comment = {
                content: JSON.stringify(quillComment.getContents()),
                topic_id: tmpl.data.topic._id
            }

            quillComment.setContents([]);
            Meteor.call('blogs.postComment', comment);
            return false;
        }
    }
});

Template.displayBlogComments.onCreated(function () {
    // We've probably already subscribed to the topic, but just in case...
    Meteor.subscribe('blogTopic', Template.instance().data.topic._id);
});

Template.displayBlogComments.helpers({
    getCommentCount() {
        return BlogComments.find({topic_id: Template.instance().data.topic._id}).count();
    },
    getBlogComments() {
        return BlogComments.find({topic_id: Template.instance().data.topic._id}, {sort: {created_date: 1}});
    }
});

Template.displayBlogComment.onRendered(function () {
    Tracker.autorun(() => {
        if (IsLoaded.getQuillJSLoaded()) {
                Template.instance().quillContent = new Quill(this.find('.quill-comment'), {
                theme: 'snow',
                readOnly: true,
                modules: {
                    toolbar: false
                }
            });
        }

        if (this.data && this.data.comment && this.data.comment.content) {
            Template.instance().quillContent.setContents(JSON.parse(this.data.comment.content));
        }
    });
});
