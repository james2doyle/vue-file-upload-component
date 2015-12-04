/* globals FormData, Promise, Vue */

// define
var MyComponent = Vue.extend({
  template: '#file-upload',
  twoWay: true,
  props: ['name', 'action', 'accept', 'multiple'],
  data: function() {
    return {
      myFiles: []
    };
  },
  methods: {
    fileInputClick: function() {
      // click actually triggers after the file dialog opens
      this.$dispatch('onFileClick', this.myFiles);
    },
    fileInputChange: function() {
      // get the group of files assigned to this field
      this.myFiles = document.getElementById(this.name).files;
      this.$dispatch('onFileChange', this.myFiles);
    },
    _onProgress: function(e) {
      // this is an internal call in XHR to update the progress
      e.percent = (e.loaded / e.total) * 100;
      this.$dispatch('onFileProgress', e);
    },
    _handleUpload: function(file) {
      this.$dispatch('beforeFileUpload', file);
      var form = new FormData();
      var xhr = new XMLHttpRequest();
      try {
        form.append('Content-Type', file.type || 'application/octet-stream');
        // our request will have the file in the ['file'] key
        form.append('file', file);
      } catch (err) {
        this.$dispatch('onFileError', file, err);
        return;
      }

      return new Promise(function(resolve, reject) {

        xhr.upload.addEventListener('progress', this._onProgress, false);

        xhr.onreadystatechange = function() {
          if (xhr.readyState < 4) {
            return;
          }
          if (xhr.status < 400) {
            var res = JSON.parse(xhr.responseText);
            this.$dispatch('onFileUpload', file, res);
            resolve(file);
          } else {
            var err = new Error(xhr.responseText);
            err.status = xhr.status;
            err.statusText = xhr.statusText;
            this.$dispatch('onFileError', file, err);
            reject(err);
          }
        }.bind(this);

        xhr.onerror = function() {
          var err = new Error(xhr.responseText);
          err.status = xhr.status;
          err.statusText = xhr.statusText;
          this.$dispatch('onFileError', file, err);
          reject(err);
        }.bind(this);

        xhr.open('POST', this.action, true);
        xhr.send(form);
      }.bind(this));
    },
    fileUpload: function() {
      if(this.myFiles.length > 0) {
        var arrayOfPromises = Array.prototype.slice.call(this.myFiles, 0).map(function(file) {
          return this._handleUpload(file);
        }.bind(this));
        Promise.all(arrayOfPromises).then(function(allFiles) {
          this.$dispatch('onAllFilesUploaded', allFiles);
        }.bind(this)).catch(function(err) {
          this.$dispatch('onFileError', this.myFiles, err);
        }.bind(this));
      } else {
        var err = new Error("No files to upload for this field");
        this.$dispatch('onFileError', this.myFiles, err);
      }
    }
  }
});

// register
Vue.component('file-upload', MyComponent);

Vue.filter('prettyBytes', function (num) {
  // jacked from: https://github.com/sindresorhus/pretty-bytes
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number');
  }

  var exponent;
  var unit;
  var neg = num < 0;
  var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B';
  }

  exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
  num = (num / Math.pow(1000, exponent)).toFixed(2) * 1;
  unit = units[exponent];

  return (neg ? '-' : '') + num + ' ' + unit;
});

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
      console.log('beforeFileUpload', file);
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
      console.log('onFileError', file, res);
    },
    onAllFilesUploaded: function(files) {
      console.log('onAllFilesUploaded', files);
      // everything is done!
      this.allFilesUploaded = true;
    }
  }
});