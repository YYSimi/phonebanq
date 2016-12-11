import './phoneTask.html'
import '../../api/tasks.js'

Template.authenticatedUserNewTask.onCreated(function () {
    Meteor.subscribe('senators');
    Meteor.subscribe('representatives');
});

Template.PhoneTask.helpers({
    findCustomSenators() {
        if (this.call_custom_senators) {
            return this.call_custom_senators.map( (bgId) => {
                return Senators.findOne({bioguide_id : bgId});
            })
        }
    },
    findCustomRepresentatives() {
        if (this.call_custom_representatives) {
            return this.call_custom_representatives.map( (bgId) => {
                return Representatives.findOne({bioguide_id : bgId});
            })
        }
    }
})