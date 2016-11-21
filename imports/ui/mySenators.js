import { Template } from 'meteor/templating';
  
import './mySenators.html';

Template.mySenators.helpers({
    senators : Senators.find({state: "WA"}),
    nSenators : Senators.find({state: "WA"}).count(),
})