import { Template } from 'meteor/templating';

import './userXpWidgets.html';

// TODO:  Move the leveling system into its own file.

var levelXpReqs = [0, 1, 5, 10, 20, 50] //levelXpReqs[i] is the _Total_ xp required to reach level i.

var displayedLevel = new ReactiveVar(-1);
var fLevelUpAnimationPlaying = false;

function getXpReqForNextLevel() {
    var currentLevel = getCurrentLevel();
    return levelXpReqs[currentLevel+1] - levelXpReqs[currentLevel];
}

function getXpIntoCurrentLevel() {
    var currentLevel = getCurrentLevel();
    return getCurrentXp() - levelXpReqs[currentLevel];
}

function getCurrentXp() {
    var retval = 0;
    var user = Meteor.user();
    if (user && user.profile && user.profile.progression && user.profile.progression.xp) {
        userXp = user.profile.progression.xp
        if (userXp < 0) {userXp = 0;}
        retval = userXp;
    }
    return retval;
}

function getCurrentLevel() {
    var currentXp = getCurrentXp();
    var lastDisplayedLevel = displayedLevel.get();
    var currentLevel = -1;
    levelXpReqs.forEach( (xpNeeded) => {
        if (xpNeeded <= currentXp) {++currentLevel}
    })
    // Haven't displayed any level yet, so just go to the current level.
    if (lastDisplayedLevel == -1) {
        displayedLevel.set(currentLevel);
    }
    // Don't immediately update the displayed level -- give the XP bar a chance to fill and animate.
    else if (lastDisplayedLevel != currentLevel) {
        var levelUpAnimationDuration = 1000;
        if (!fLevelUpAnimationPlaying) {
            fLevelUpAnimationPlaying = true;
            setTimeout(function() {
                displayedLevel.set(currentLevel);
                fLevelUpAnimationPlaying = false;
            },
                levelUpAnimationDuration);
        }
    }

    return displayedLevel.get();
}

Template.userXpBar.helpers({
    currentLevelXp() { 
        return getXpIntoCurrentLevel();
    },

    currentLevelPercent() {
        return Math.floor(getXpIntoCurrentLevel()*100/ getXpReqForNextLevel());
    },

    xpReqForNextLevel() {
        return getXpReqForNextLevel();
    },

    currentLevel() {
        return getCurrentLevel();
    }
})