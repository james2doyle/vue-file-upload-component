# vue-file-upload-component

A simple file upload component for Vue.js. Emits events for XHR Upload Progress for nice progress bars.

I came up with the original idea when looking at [this repo](https://github.com/tj/s3.js). I knew I wanted a nice component with upload progress and so I copied some code from that library.

### Install

Available through npm as `vue-file-upload-component`. Or include as an inline script, like in `example.html`.

### Demo

![](http://cl.ly/image/3k2M2I0f4417/Screen%20Recording%202015-12-04%20at%2008.58%20AM.gif)

In order to use the demo, you need to have PHP setup and this project running under a server. There is a script in the root called `upload.php`, which is a simple script to handle single file uploads. Most likely you will have your own way of handling files.

### Setting Headers

You can set headers for the submission by using the attribute `v-bind:headers="xhrHeaders"`. `xhrHeaders` may look something like this:

```json
// ... Vue stuff above
data: {
  xhrHeaders: {
    "X-CSRF-TOKEN": "32charactersOfRandomStringNoise!"
  }
},
// ... more stuff below
```

You can set many headers in the object.

### Caveats

This upload script only uploads 1 file at a time. The upload handler uses `Promises` internally to know when all the files are uploaded.

If you are using Internet Explorer, you will probably need a polyfill. I have [used this one before](https://github.com/getify/native-promise-only) and it is small and well tested.

You also need [support for FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) but it has higher support than `Promises` so you are probably fine.
