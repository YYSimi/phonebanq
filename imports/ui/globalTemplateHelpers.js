// This has no associated .html file.  It is a place where we register global template helpers.

Template.registerHelper('equals', function (a, b) {
    return a === b;
});

Template.registerHelper('findMySenators', function() {
    user = Meteor.user();
    retval = [];
    if (user) {
        if (user.profile && user.profile.congressInfo && user.profile.congressInfo.senate){
            retval = user.profile.congressInfo.senate.map(function (senatorId) { return Senators.findOne({bioguide_id : senatorId})} );
        }
    }
    else {  //TODO:  Structure this better.  Disgusting global action-at-a-distance.
        congresspeople = Session.get("congresspeople");
        if (congresspeople) {
            retval = congresspeople.senate.map(function (senatorId) { return Senators.findOne({bioguide_id : senatorId})} );;
        }
    }
    return retval;
});

Template.registerHelper('findMyRepresentatives', function() {
    user = Meteor.user();
    retval = [];
    if (user){
        if (user.profile && user.profile.congressInfo && user.profile.congressInfo.house){
            retval = user.profile.congressInfo.house.map(function (repId) {return Representatives.findOne({bioguide_id : repId})});
        }
    }
    else {  //TODO:  Structure this better.  Disgusting global action-at-a-distance.
        congresspeople = Session.get("congresspeople");
        if (congresspeople) {
            retval = congresspeople.house.map(function (repId) {return Representatives.findOne({bioguide_id : repId})});;
        }
    }
    return retval;
})

Template.registerHelper('getUsernameFromId', function(userId) {
    const user = Meteor.users.findOne(userId);
    const retval = user ? user.username : "Unknown user";
    return retval;
})