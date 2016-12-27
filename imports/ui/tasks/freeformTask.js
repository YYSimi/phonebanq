import './freeformTask.html'

Template.FreeformTask.onRendered(function() {
    var instructionsQuill = new Quill(this.find('.instructions'), {
        theme: 'snow',
        readOnly: true,
        modules: {
            toolbar: false
        }
    });
    
    if (this.data.instructions) {
        var delta = JSON.parse(this.data.instructions);
         instructionsQuill.setContents(delta);
    }

    var notesQuill = new Quill(this.find('.notes'), {
        theme: 'snow',
        readOnly: true,
        modules: {
            toolbar: false
        }
    });
    
    if (this.data.notes) {
        var delta = JSON.parse(this.data.notes);
        notesQuill.setContents(delta);
    }
    
})