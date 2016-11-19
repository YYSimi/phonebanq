import { Meteor } from 'meteor/meteor';

function populateSenators() {
    console.log(Senators.find().count());
}

Meteor.startup(() => {
    populateSenators();

});
