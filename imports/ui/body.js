import { Template } from 'meteor/templating';
import { Roles } from 'meteor/alanning:roles';

import './navigation.js'
import './body.html';

Template.main.helpers({
    fHasNewTaskPermissions() {
        var user = Meteor.user();
        // TODO: Move this check into a library call.  Code duplication!
        // TODO:  role review
        return Roles.userIsInRole(user, 'site-admin');
    }

    // TODO:  Make sure that the test version of this site is visually distinct from the live one (e.g. give test a red background)
})