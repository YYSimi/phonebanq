import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './navigation.js'
import './body.html';

Template.main.helpers({
    fHasNewTaskPermissions() {
        var user = Meteor.user();
        // TODO: Move this check into a library call.  Code duplication!
        return user && user.profile && user.profile.permissions && user.profile.permissions.registerNewTasks;
    }

    // TODO:  Make sure that the test version of this site is visually distinct from the live one (e.g. give test a red background)
})