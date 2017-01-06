// TODO:  Is the client directory really the right place for this file?

import { ReactiveVar } from 'meteor/reactive-var'

export var IsLoaded = function () {
    var fQuillJsLoaded = new ReactiveVar(false);
    var fJqueryValidatorLoaded = new ReactiveVar(false);
    var fSelect2Loaded = new ReactiveVar(false);

    return {
        getQuillJSLoaded() { return fQuillJsLoaded.get(); },
        setQuillJSLoaded(fIsLoaded) { fQuillJsLoaded.set(fIsLoaded); },

        getJqueryValidatorLoaded() { return fJqueryValidatorLoaded.get() },
        setJqueryValidatorLoaded(fIsLoaded) { fJqueryValidatorLoaded.set(fIsLoaded) },

        getSelect2Loaded() { return fSelect2Loaded.get(); },
        setSelect2Loaded(fIsLoaded) { fSelect2Loaded.set(fIsLoaded) },
    }
}();