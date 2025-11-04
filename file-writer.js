"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _fsExtra = require("fs-extra");

// copy from vires/utils/FileWriter.es
// we use outputJson instead of writeFile
// A stream of async file writing. `write` queues the task which will be executed
// after all tasks before are done.
// Every instance contains an independent queue.
// Usage:
// var fw = new FileWriter()
// var path = '/path/to/a/file'
// for (var i = 0; i < 100; i++) {
//   fw.write(path, (''+i).repeat(10000))
// }
class FileWriter {
  constructor() {
    this.write = (path, data, options, callback) => {
      this._queue.push([path, data, options, callback]);

      this._continueWriting();
    };

    this._continueWriting = async () => {
      if (this.writing) {
        setTimeout(this._continueWriting, 100); // FIXME: is this necessary ?

        return;
      }

      this.writing = true;

      while (this._queue.length) {
        const [path, data, options, callback] = this._queue.shift(); // eslint-disable-next-line no-await-in-loop


        const err = (0, _fsExtra.outputJsonSync)(path, data, options);

        if (callback) {
          callback(err);
        }
      }

      this.writing = false;
    };

    this.writing = false;
    this._queue = [];
  }

}

exports["default"] = FileWriter;
module.exports = exports.default;