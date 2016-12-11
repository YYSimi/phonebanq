import { Template } from 'meteor/templating';
  
import './navigation.html';

Template.nav.helpers({
    fHasNewTaskPermissions() {
        var user = Meteor.user();
        // TODO: Move this check into a library call.  Code duplication!
        return user && user.profile && user.profile.permissions && user.profile.permissions.registerNewTasks;
    }
})