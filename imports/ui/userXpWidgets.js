import { Template } from 'meteor/templating';

import './userXpWidgets.html';

// TODO:  Move the leveling system into its own file.

var levelXpReqs = [0, 1, 5, 10, 20, 50] //levelXpReqs[i] is the _Total_ xp required to reach level i.

function getXpReqForNextLevel() {
    currentLevel = getCurrentLevel();
    return levelXpReqs[currentLevel+1] - levelXpReqs[currentLevel];
}

function getXpIntoCurrentLevel() {
    currentLevel = getCurrentLevel();
    return getCurrentXp() - levelXpReqs[currentLevel];
}

function getCurrentXp() {
    retval = 0;
    user = Meteor.user();
    if (user && user.profile && user.profile.progression && user.profile.progression.xp) {
        userXp = user.profile.progression.xp
        if (userXp < 0) {userXp = 0;}
        retval = userXp;
    }
    return retval;
}

function getCurrentLevel() {
    var currentXp = getCurrentXp();
    var i = -1;
    levelXpReqs.forEach( (xpNeeded) => {
        if (xpNeeded <= currentXp) {++i}
    })

    return i;
}

Template.userXpBar.helpers({
    currentLevelXp() { 
        return getXpIntoCurrentLevel();
    },

    currentLevelPercent() {
        console.log("clp = " + Math.floor(getCurrentXp()*100/ getXpReqForNextLevel()))
        return Math.floor(getXpIntoCurrentLevel()*100/ getXpReqForNextLevel());
    },

    xpReqForNextLevel() {
        return getXpReqForNextLevel();
    },

    currentLevel() {
        return getCurrentLevel();
    }
})