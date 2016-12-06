/* globals FormData, Promise, Vue */
// define
var FileUploadComponent = Vue.extend({
  template: '<div class="{{ class }}"><label for="{{ name }}"><input type="file" name="{{ name }}" id="{{ id || name }}" accept="{{ accept }}" v-on:click="fileInputClick" v-on:change="fileInputChange" multiple="{{ multiple }}"><slot></slot></label><button type="button" v-on:click="fileUpload">{{ buttonText }}</button></div>',
  props: {
    class: String,
    name: {
      type: String,
      required: true
    },
    id: String,
    action: {
      type: String,
      required: true
    },
    accept: String,
    multiple: String,
    headers: Object,
    method: String,
    buttonText: {
      type: String,
      default: 'Upload'
    }
  },
  data: function() {
    return {
      myFiles: [] // a container for the files in our field
    };
  },
  methods: {
    fileInputClick: function() {
      // click actually triggers after the file dialog opens
      this.$dispatch('onFileClick', this.myFiles);
    },
    fileInputChange: function() {
      // get the group of files assigned to this field
      var ident = this.id || this.name
      this.myFiles = document.getElementById(ident).files;
      this.$dispatch('onFileChange', this.myFiles);
    },
    fileUpload: function() {
      if(this.myFiles.length > 0) {
        // a hack to push all the Promises into a new array
        var arrayOfPromises = Array.prototype.slice.call(this.myFiles, 0).map(function(file) {
          return this._handleUpload(file);
        }.bind(this));
        // wait for everything to finish
        Promise.all(arrayOfPromises).then(function(allFiles) {
          this.$dispatch('onAllFilesUploaded', allFiles);
        }.bind(this)).catch(function(err) {
          this.$dispatch('onFileError', this.myFiles, err);
        }.bind(this));
      } else {
        // someone tried to upload without adding files
        var err = new Error("No files to upload for this field");
        this.$dispatch('onFileError', this.myFiles, err);
      }
    },
    _onProgress: function(e) {
      // this is an internal call in XHR to update the progress
      e.percent = (e.loaded / e.total) * 100;
      this.$dispatch('onFileProgress', e);
    },
    _handleUpload: function(file) {
      this.$dispatch('beforeFileUpload', file);
      var xhr = new XMLHttpRequest();
      return new Promise(function(resolve, reject) {

        xhr.upload.addEventListener('progress', this._onProgress, false);

        xhr.onreadystatechange = function() {
          if (xhr.readyState < 4) {
            return;
          }
          if (xhr.status < 400) {
            var res = this._parseResponse(xhr);
            this.$dispatch('onFileUpload', file, res);
            resolve(file);
          } else {
            var err = this._parseResponse(xhr);
            this.$dispatch('onFileError', file, err);
            reject(err);
          }
        }.bind(this);

        xhr.onerror = function() {
          var err = this._parseResponse(xhr);
          this.$dispatch('onFileError', file, err);
          reject(err);
        }.bind(this);

        xhr.open(this.method || "POST", this.action, true);
        if (this.headers) {
          for(var header in this.headers) {
            xhr.setRequestHeader(header, this.headers[header]);
          }
        }
        xhr.send(file);
        this.$dispatch('afterFileUpload', file);
      }.bind(this));
    },
    _parseResponse: function(xhr) {
      var resp;
      try {
        resp = JSON.parse(xhr.responseText);
      } catch (e) {
        resp = { responseText: xhr.responseText };
      }
      resp.status = xhr.status;
      resp.statusText = xhr.statusText;
      return resp;
    }
  }
});

// register
Vue.component('file-upload', FileUploadComponent);
