import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Roles } from 'meteor/alanning:roles'
import { IsLoaded } from '../api/isLoaded.js'

import './blog.html'

var quillContent;

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

