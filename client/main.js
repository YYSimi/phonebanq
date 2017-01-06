import '../imports/startup/index.js'
import '../imports/ui/body.js';

Meteor.subscribe('userTasks');

Meteor.startup(function() {
    // Jquery-validation
    $.getScript('https://cdn.jsdelivr.net/jquery.validation/1.15.1/jquery.validate.min.js');

    // Select2
    $.getScript("https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/js/select2.min.js");

    // QuillJS
    $.getScript("https://cdn.quilljs.com/1.1.8/quill.min.js");
})