import { Template } from 'meteor/templating';
 
//import { Tasks } from '../api/tasks.js';
 
import './mySenators.html';

Template.mySenators.helpers({
    senators : Senators.find({state: "WA"}),
    nSenators : Senators.find({state: "WA"}).count(),
})