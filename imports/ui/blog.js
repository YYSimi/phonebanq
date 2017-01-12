import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Roles } from 'meteor/alanning:roles'
import { IsLoaded } from '../api/isLoaded.js'

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
})

Template.displayBlogTopicById.onRendered(function () {
    console.log(Template.instance().data.topicId);
    Meteor.subscribe('blogTopic', new Mongo.ObjectID(Template.instance().data.topicId));
})

Template.displayBlogTopicById.helpers({
    getBlogTopicFromId() {
        return BlogTopics.findOne(new Mongo.ObjectID(Template.instance().data.topicId));
    }
})

Template.displayBlogTopic.onRendered(function() {
    Tracker.autorun(() => {
        console.log(this);
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

Template.newCommentForm.onRendered(function() {
    Tracker.autorun( () => {
        if (IsLoaded.getQuillJSLoaded()) {
            quillComment = new Quill(Template.instance().find('#comment'), {
                theme: 'snow'
            });
        }
    });
})

Template.newCommentForm.events({
    'submit form'(evt, tmpl){
        evt.preventDefault();

        tmpl.$("#comment").val(JSON.stringify(quillComment.getContents()))

        const comment = {
            content: tmpl.$('#comment').val(),
            topic_id: tmpl.data.topic._id
        }

        Meteor.call('blogs.postComment', comment);
        return false;
    }
})