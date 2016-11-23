import { Template } from 'meteor/templating';

import './randomTask.html'
import '../../api/tasks.js'

Template.randomTask.helpers({
    test() { 
        Meteor.call('tasks.createRandom', Meteor.userId());
        return "Helpers test"}
})