/* globals Vue */

// create a root instance
var App = new Vue({
  el: '#app',
  data: {
    uploadedFiles: [], // my list for the v-for
    fileProgress: 0, // global progress
    allFilesUploaded: false // is everything done?
  },
  events: {
    onFileClick: function(file) {
      console.log('onFileClick', file);
    },
    onFileChange: function(file) {
      console.log('onFileChange', file);
      // here is where we update our view
      this.fileProgress = 0;
      this.allFilesUploaded = false;
    },
    beforeFileUpload: function(file) {
      // called when the upload handler is called
      console.log('beforeFileUpload', file);
    },
    afterFileUpload: function(file) {
      // called after the xhr.send() at the end of the upload handler
      console.log('afterFileUpload', file);
    },
    onFileProgress: function(progress) {
      console.log('onFileProgress', progress);
      // update our progress bar
      this.fileProgress = progress.percent;
    },
    onFileUpload: function(file, res) {
      console.log('onFileUpload', file, res);
      // update our list
      this.uploadedFiles.push(file);
    },
    onFileError: function(file, res) {
      console.error('onFileError', file, res);
    },
    onAllFilesUploaded: function(files) {
      console.log('onAllFilesUploaded', files);
      // everything is done!
      this.allFilesUploaded = true;
    }
  }
});