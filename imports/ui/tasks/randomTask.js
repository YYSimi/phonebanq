import { Template } from 'meteor/templating';

import './randomTask.html'
import '../../api/tasks.js'

Template.randomTask.helpers({
    createRandom() {  //TODO: Move this method to someplace more sensible
        Meteor.call('tasks.createRandom');
    }
})