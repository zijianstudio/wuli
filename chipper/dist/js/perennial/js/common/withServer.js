// Copyright 2017, University of Colorado Boulder

/**
 * A simple webserver that will serve the git root on a specific port for the duration of an async callback
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

const http = require('http');
const fs = require('fs');
const _ = require('lodash');
const winston = require('winston');

/**
 * A simple webserver that will serve the git root on a specific port for the duration of an async callback
 * @public
 *
 * @param {async function(port:number):*} asyncCallback
 * @param {Object} [options]
 * @returns {Promise<*>} - Returns the result of the asyncCallback
 */
module.exports = function (asyncCallback, options) {
  options = _.merge({
    path: '../',
    port: 0 // 0 means it will find an open port
  }, options);
  return new Promise((resolve, reject) => {
    // Consider using https://github.com/cloudhead/node-static or reading https://nodejs.org/en/knowledge/HTTP/servers/how-to-serve-static-files/
    const server = http.createServer((req, res) => {
      // Trim query string
      const tail = req.url.indexOf('?') >= 0 ? req.url.substring(0, req.url.indexOf('?')) : req.url;
      const fullPath = `${process.cwd()}/${options.path}${tail}`;

      // See https://gist.github.com/aolde/8104861
      const mimeTypes = {
        html: 'text/html',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        png: 'image/png',
        js: 'text/javascript',
        css: 'text/css',
        gif: 'image/gif',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        // needed to be added to support PhET sims.
        svg: 'image/svg+xml',
        json: 'application/json'
      };
      const fileExtension = fullPath.split('.').pop();
      let mimeType = mimeTypes[fileExtension];
      if (!mimeType && (fullPath.includes('active-runnables') || fullPath.includes('active-repos'))) {
        mimeType = 'text/plain';
      }
      if (!mimeType) {
        throw new Error(`unsupported mime type, please add above: ${fileExtension}`);
      }
      fs.readFile(fullPath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
        } else {
          res.writeHead(200, {
            'Content-Type': mimeType
          });
          res.end(data);
        }
      });
    });
    server.on('listening', async () => {
      const port = server.address().port;
      winston.debug('info', `Server listening on port ${port}`);
      let result;
      try {
        result = await asyncCallback(port);
      } catch (e) {
        reject(e);
      }
      server.close(() => {
        winston.debug('info', `Express stopped listening on port ${port}`);
        resolve(result);
      });
    });
    server.listen(options.port);
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJodHRwIiwicmVxdWlyZSIsImZzIiwiXyIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwiYXN5bmNDYWxsYmFjayIsIm9wdGlvbnMiLCJtZXJnZSIsInBhdGgiLCJwb3J0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzZXJ2ZXIiLCJjcmVhdGVTZXJ2ZXIiLCJyZXEiLCJyZXMiLCJ0YWlsIiwidXJsIiwiaW5kZXhPZiIsInN1YnN0cmluZyIsImZ1bGxQYXRoIiwicHJvY2VzcyIsImN3ZCIsIm1pbWVUeXBlcyIsImh0bWwiLCJqcGVnIiwianBnIiwicG5nIiwianMiLCJjc3MiLCJnaWYiLCJtcDMiLCJ3YXYiLCJzdmciLCJqc29uIiwiZmlsZUV4dGVuc2lvbiIsInNwbGl0IiwicG9wIiwibWltZVR5cGUiLCJpbmNsdWRlcyIsIkVycm9yIiwicmVhZEZpbGUiLCJlcnIiLCJkYXRhIiwid3JpdGVIZWFkIiwiZW5kIiwiSlNPTiIsInN0cmluZ2lmeSIsIm9uIiwiYWRkcmVzcyIsImRlYnVnIiwicmVzdWx0IiwiZSIsImNsb3NlIiwibGlzdGVuIl0sInNvdXJjZXMiOlsid2l0aFNlcnZlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBzaW1wbGUgd2Vic2VydmVyIHRoYXQgd2lsbCBzZXJ2ZSB0aGUgZ2l0IHJvb3Qgb24gYSBzcGVjaWZpYyBwb3J0IGZvciB0aGUgZHVyYXRpb24gb2YgYW4gYXN5bmMgY2FsbGJhY2tcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuY29uc3QgaHR0cCA9IHJlcXVpcmUoICdodHRwJyApO1xyXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcclxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcclxuXHJcbi8qKlxyXG4gKiBBIHNpbXBsZSB3ZWJzZXJ2ZXIgdGhhdCB3aWxsIHNlcnZlIHRoZSBnaXQgcm9vdCBvbiBhIHNwZWNpZmljIHBvcnQgZm9yIHRoZSBkdXJhdGlvbiBvZiBhbiBhc3luYyBjYWxsYmFja1xyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIEBwYXJhbSB7YXN5bmMgZnVuY3Rpb24ocG9ydDpudW1iZXIpOip9IGFzeW5jQ2FsbGJhY2tcclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTwqPn0gLSBSZXR1cm5zIHRoZSByZXN1bHQgb2YgdGhlIGFzeW5jQ2FsbGJhY2tcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIGFzeW5jQ2FsbGJhY2ssIG9wdGlvbnMgKSB7XHJcblxyXG4gIG9wdGlvbnMgPSBfLm1lcmdlKCB7XHJcbiAgICBwYXRoOiAnLi4vJyxcclxuICAgIHBvcnQ6IDAgLy8gMCBtZWFucyBpdCB3aWxsIGZpbmQgYW4gb3BlbiBwb3J0XHJcbiAgfSwgb3B0aW9ucyApO1xyXG5cclxuICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xyXG5cclxuXHJcbiAgICAvLyBDb25zaWRlciB1c2luZyBodHRwczovL2dpdGh1Yi5jb20vY2xvdWRoZWFkL25vZGUtc3RhdGljIG9yIHJlYWRpbmcgaHR0cHM6Ly9ub2RlanMub3JnL2VuL2tub3dsZWRnZS9IVFRQL3NlcnZlcnMvaG93LXRvLXNlcnZlLXN0YXRpYy1maWxlcy9cclxuICAgIGNvbnN0IHNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKCAoIHJlcSwgcmVzICkgPT4ge1xyXG5cclxuICAgICAgLy8gVHJpbSBxdWVyeSBzdHJpbmdcclxuICAgICAgY29uc3QgdGFpbCA9IHJlcS51cmwuaW5kZXhPZiggJz8nICkgPj0gMCA/IHJlcS51cmwuc3Vic3RyaW5nKCAwLCByZXEudXJsLmluZGV4T2YoICc/JyApICkgOiByZXEudXJsO1xyXG4gICAgICBjb25zdCBmdWxsUGF0aCA9IGAke3Byb2Nlc3MuY3dkKCl9LyR7b3B0aW9ucy5wYXRofSR7dGFpbH1gO1xyXG5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2FvbGRlLzgxMDQ4NjFcclxuICAgICAgY29uc3QgbWltZVR5cGVzID0ge1xyXG4gICAgICAgIGh0bWw6ICd0ZXh0L2h0bWwnLFxyXG4gICAgICAgIGpwZWc6ICdpbWFnZS9qcGVnJyxcclxuICAgICAgICBqcGc6ICdpbWFnZS9qcGVnJyxcclxuICAgICAgICBwbmc6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgIGpzOiAndGV4dC9qYXZhc2NyaXB0JyxcclxuICAgICAgICBjc3M6ICd0ZXh0L2NzcycsXHJcbiAgICAgICAgZ2lmOiAnaW1hZ2UvZ2lmJyxcclxuICAgICAgICBtcDM6ICdhdWRpby9tcGVnJyxcclxuICAgICAgICB3YXY6ICdhdWRpby93YXYnLFxyXG5cclxuICAgICAgICAvLyBuZWVkZWQgdG8gYmUgYWRkZWQgdG8gc3VwcG9ydCBQaEVUIHNpbXMuXHJcbiAgICAgICAgc3ZnOiAnaW1hZ2Uvc3ZnK3htbCcsXHJcbiAgICAgICAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nXHJcbiAgICAgIH07XHJcbiAgICAgIGNvbnN0IGZpbGVFeHRlbnNpb24gPSBmdWxsUGF0aC5zcGxpdCggJy4nICkucG9wKCk7XHJcbiAgICAgIGxldCBtaW1lVHlwZSA9IG1pbWVUeXBlc1sgZmlsZUV4dGVuc2lvbiBdO1xyXG5cclxuICAgICAgaWYgKCAhbWltZVR5cGUgJiYgKCBmdWxsUGF0aC5pbmNsdWRlcyggJ2FjdGl2ZS1ydW5uYWJsZXMnICkgfHwgZnVsbFBhdGguaW5jbHVkZXMoICdhY3RpdmUtcmVwb3MnICkgKSApIHtcclxuICAgICAgICBtaW1lVHlwZSA9ICd0ZXh0L3BsYWluJztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCAhbWltZVR5cGUgKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5zdXBwb3J0ZWQgbWltZSB0eXBlLCBwbGVhc2UgYWRkIGFib3ZlOiAke2ZpbGVFeHRlbnNpb259YCApO1xyXG4gICAgICB9XHJcbiAgICAgIGZzLnJlYWRGaWxlKCBmdWxsUGF0aCwgKCBlcnIsIGRhdGEgKSA9PiB7XHJcbiAgICAgICAgaWYgKCBlcnIgKSB7XHJcbiAgICAgICAgICByZXMud3JpdGVIZWFkKCA0MDQgKTtcclxuICAgICAgICAgIHJlcy5lbmQoIEpTT04uc3RyaW5naWZ5KCBlcnIgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHJlcy53cml0ZUhlYWQoIDIwMCwgeyAnQ29udGVudC1UeXBlJzogbWltZVR5cGUgfSApO1xyXG4gICAgICAgICAgcmVzLmVuZCggZGF0YSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gICAgc2VydmVyLm9uKCAnbGlzdGVuaW5nJywgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBwb3J0ID0gc2VydmVyLmFkZHJlc3MoKS5wb3J0O1xyXG4gICAgICB3aW5zdG9uLmRlYnVnKCAnaW5mbycsIGBTZXJ2ZXIgbGlzdGVuaW5nIG9uIHBvcnQgJHtwb3J0fWAgKTtcclxuXHJcbiAgICAgIGxldCByZXN1bHQ7XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHJlc3VsdCA9IGF3YWl0IGFzeW5jQ2FsbGJhY2soIHBvcnQgKTtcclxuICAgICAgfVxyXG4gICAgICBjYXRjaCggZSApIHtcclxuICAgICAgICByZWplY3QoIGUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc2VydmVyLmNsb3NlKCAoKSA9PiB7XHJcbiAgICAgICAgd2luc3Rvbi5kZWJ1ZyggJ2luZm8nLCBgRXhwcmVzcyBzdG9wcGVkIGxpc3RlbmluZyBvbiBwb3J0ICR7cG9ydH1gICk7XHJcblxyXG4gICAgICAgIHJlc29sdmUoIHJlc3VsdCApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc2VydmVyLmxpc3Rlbiggb3B0aW9ucy5wb3J0ICk7XHJcbiAgfSApO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQSxJQUFJLEdBQUdDLE9BQU8sQ0FBRSxNQUFPLENBQUM7QUFDOUIsTUFBTUMsRUFBRSxHQUFHRCxPQUFPLENBQUUsSUFBSyxDQUFDO0FBQzFCLE1BQU1FLENBQUMsR0FBR0YsT0FBTyxDQUFFLFFBQVMsQ0FBQztBQUM3QixNQUFNRyxPQUFPLEdBQUdILE9BQU8sQ0FBRSxTQUFVLENBQUM7O0FBRXBDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUksTUFBTSxDQUFDQyxPQUFPLEdBQUcsVUFBVUMsYUFBYSxFQUFFQyxPQUFPLEVBQUc7RUFFbERBLE9BQU8sR0FBR0wsQ0FBQyxDQUFDTSxLQUFLLENBQUU7SUFDakJDLElBQUksRUFBRSxLQUFLO0lBQ1hDLElBQUksRUFBRSxDQUFDLENBQUM7RUFDVixDQUFDLEVBQUVILE9BQVEsQ0FBQztFQUVaLE9BQU8sSUFBSUksT0FBTyxDQUFFLENBQUVDLE9BQU8sRUFBRUMsTUFBTSxLQUFNO0lBR3pDO0lBQ0EsTUFBTUMsTUFBTSxHQUFHZixJQUFJLENBQUNnQixZQUFZLENBQUUsQ0FBRUMsR0FBRyxFQUFFQyxHQUFHLEtBQU07TUFFaEQ7TUFDQSxNQUFNQyxJQUFJLEdBQUdGLEdBQUcsQ0FBQ0csR0FBRyxDQUFDQyxPQUFPLENBQUUsR0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHSixHQUFHLENBQUNHLEdBQUcsQ0FBQ0UsU0FBUyxDQUFFLENBQUMsRUFBRUwsR0FBRyxDQUFDRyxHQUFHLENBQUNDLE9BQU8sQ0FBRSxHQUFJLENBQUUsQ0FB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