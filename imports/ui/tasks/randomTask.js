import { Template } from 'meteor/templating';

import './randomTask.html'
import '../../api/tasks.js'

Template.randomTask.helpers({
    test() {console.log(Meteor.call('tasks.createNew', 12345)); return "Helpers test"}
})