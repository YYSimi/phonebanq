import './phoneTask.html'
import '../../api/tasks.js'

Template.PhoneTask.onCreated(function () {
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
    },
    findMySenators() {
        user = Meteor.user();
        retval = [];
        if (user){
            user.profile.congressInfo.senate.forEach(function (senatorId) {retval.push(Senators.findOne({bioguide_id : senatorId}))});
        }
        return retval;
    },
    findMyRepresentatives() {
        user = Meteor.user();
        retval = [];
        if (user){
            user.profile.congressInfo.house.forEach(function (repId) {retval.push(Representatives.findOne({bioguide_id : repId}))});
        }
        return retval;
    }
})