// Copyright 2017-2021, University of Colorado Boulder

const fs = require('fs');
const grunt = require('grunt');
const jpeg = require('jpeg-js'); // eslint-disable-line require-statement-match
const mipmapDownscale = require('../../../chipper/js/common/mipmapDownscale');
const pngjs = require('pngjs');

/**
 * Responsible for converting a single PNG/JPEG file to a structured list of mipmapped versions of it, each
 * at half the scale of the previous version.
 *
 * Level 0 is the original image, level 1 is a half-size image, level 2 is a quarter-size image, etc.
 *
 * For each level, a preferred encoding (PNG/JPEG) is determined. If the image doesn't need alpha information and
 * the JPEG base64 is smaller, the JPEG encoding will be used (PNG otherwise).
 *
 * The resulting object for each mipmap level will be of the form:
 * {
 *   width: {number} - width of the image provided by this level of detail
 *   height: {number} - width of the image provided by this level of detail
 *   data: {Buffer} - 1-dimensional row-major buffer holding RGBA information for the level as an array of bytes 0-255.
 *                    e.g. buffer[2] will be the blue component of the top-left pixel, buffer[4] is the red component
 *                    for the pixel to the right, etc.
 *   url: {string} - Data URL for the preferred image data
 *   buffer: {Buffer} - Raw bytes for the preferred image data (could be written to file and opened as an image)
 *   <pngURL, pngBuffer, jpgURL, jpgBuffer may also be available, but is not meant for general use>
 * }
 *
 * @param {string} filename
 * @param {number} maxLevel - An integer denoting the maximum level of detail that should be included, or -1 to include
 *                            all levels up to and including a 1x1 image.
 * @param {number} quality - An integer from 1-100 determining the quality of the image. Currently only used for the
 *                           JPEG encoding quality.
 * @returns {Promise} - Will be resolved with mipmaps: {Array} (consisting of the mipmap objects, mipmaps[0] will be level 0)
 */
module.exports = function createMipmap(filename, maxLevel, quality) {
  return new Promise((resolve, reject) => {
    const mipmaps = [];

    // kick everything off
    const suffix = filename.slice(-4);
    if (suffix === '.jpg') {
      loadJPEG();
    } else if (suffix === '.png') {
      loadPNG();
    } else {
      reject(new Error(`unknown image type: ${filename}`));
    }

    // Loads / decodes the initial JPEG image, and when done proceeds to the mipmapping
    function loadJPEG() {
      const imageData = jpeg.decode(fs.readFileSync(filename));
      mipmaps.push({
        data: imageData.data,
        width: imageData.width,
        height: imageData.height
      });
      startMipmapCreation();
    }

    // Loads / decodes the initial PNG image, and when done proceeds to the mipmapping
    function loadPNG() {
      const src = fs.createReadStream(filename);
      const basePNG = new pngjs.PNG({
        // if we need a specific filter type, put it here
      });
      basePNG.on('error', err => {
        reject(err);
      });
      basePNG.on('parsed', () => {
        mipmaps.push({
          data: basePNG.data,
          width: basePNG.width,
          height: basePNG.height
        });
        startMipmapCreation();
      });

      // pass the stream to pngjs
      src.pipe(basePNG);
    }

    /**
     * @param {Buffer} data - Should have 4*width*height elements
     * @param {number} width
     * @param {number} height
     * @param {number} quality - Out of 100
     * @param {function} callback - function( buffer )
     */
    function outputJPEG(data, width, height, quality, callback) {
      const encodedOuput = jpeg.encode({
        data: data,
        width: width,
        height: height
      }, quality);
      callback(encodedOuput.data);
    }

    /**
     * @param {Buffer} data - Should have 4*width*height elements
     * @param {number} width
     * @param {number} height
     * @param {function} callback - function( buffer )
     */
    function outputPNG(data, width, height, callback) {
      // provides width/height so it is initialized with the correct-size buffer
      const png = new pngjs.PNG({
        width: width,
        height: height
      });

      // copy our image data into the pngjs.PNG's data buffer;
      data.copy(png.data, 0, 0, data.length);

      // will concatenate the buffers from the stream into one once it is finished
      const buffers = [];
      png.on('data', buffer => {
        buffers.push(buffer);
      });
      png.on('end', () => {
        const buffer = Buffer.concat(buffers);
        callback(buffer);
      });
      png.on('error', err => {
        reject(err);
      });

      // kick off the encoding of the PNG
      png.pack();
    }

    // called when our mipmap[0] level is loaded by decoding the main image (creates the mipmap levels)
    function startMipmapCreation() {
      // When reduced to 0, we'll be done with encoding (and can call our callback). Needed because they are asynchronous.
      let encodeCounter = 1;

      // Alpha detection on the level-0 image to see if we can swap jpg for png
      let hasAlpha = false;
      for (let i = 3; i < mipmaps[0].data.length; i += 4) {
        if (mipmaps[0].data[i] < 255) {
          hasAlpha = true;
          break;
        }
      }

      // called when all of encoding is complete
      function encodingComplete() {
        grunt.log.debug(`mipmapped ${filename}${maxLevel >= 0 ? ` to level ${maxLevel}` : ''} with quality: ${quality}`);
        for (let level = 0; level < mipmaps.length; level++) {
          // for now, make .url point to the smallest of the two (unless we have an alpha channel need)
          const usePNG = hasAlpha || mipmaps[level].jpgURL.length > mipmaps[level].pngURL.length;
          mipmaps[level].url = usePNG ? mipmaps[level].pngURL : mipmaps[level].jpgURL;
          mipmaps[level].buffer = usePNG ? mipmaps[level].pngBuffer : mipmaps[level].jpgBuffer;
          grunt.log.debug(`level ${level} (${usePNG ? 'PNG' : 'JPG'} ${mipmaps[level].width}x${mipmaps[level].height}) base64: ${mipmaps[level].url.length} bytes `);
        }
        resolve(mipmaps);
      }

      // kicks off asynchronous encoding for a specific level
      function encodeLevel(level) {
        encodeCounter++;
        outputPNG(mipmaps[level].data, mipmaps[level].width, mipmaps[level].height, buffer => {
          mipmaps[level].pngBuffer = buffer;
          mipmaps[level].pngURL = `data:image/png;base64,${buffer.toString('base64')}`;
          if (--encodeCounter === 0) {
            encodingComplete();
          }
        });

        // only encode JPEG if it has no alpha
        if (!hasAlpha) {
          encodeCounter++;
          outputJPEG(mipmaps[level].data, mipmaps[level].width, mipmaps[level].height, quality, buffer => {
            mipmaps[level].jpgBuffer = buffer;
            mipmaps[level].jpgURL = `data:image/jpeg;base64,${buffer.toString('base64')}`;
            if (--encodeCounter === 0) {
              encodingComplete();
            }
          });
        }
      }

      // encode all levels, and compute rasters for levels 1-N
      encodeLevel(0);
      function finestMipmap() {
        return mipmaps[mipmaps.length - 1];
      }

      // bail if we already have a 1x1 image, or if we reach the maxLevel (recall maxLevel===-1 means no maximum level)
      // eslint-disable-next-line no-unmodified-loop-condition
      while ((mipmaps.length - 1 < maxLevel || maxLevel < 0) && (finestMipmap().width > 1 || finestMipmap().height > 1)) {
        const level = mipmaps.length;
        mipmaps.push(mipmapDownscale(finestMipmap(), (width, height) => {
          return Buffer.alloc(4 * width * height);
        }));
        encodeLevel(level);
      }

      // just in case everything happened synchronously
      if (--encodeCounter === 0) {
        encodingComplete();
      }
    }
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJncnVudCIsImpwZWciLCJtaXBtYXBEb3duc2NhbGUiLCJwbmdqcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJjcmVhdGVNaXBtYXAiLCJmaWxlbmFtZSIsIm1heExldmVsIiwicXVhbGl0eSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwibWlwbWFwcyIsInN1ZmZpeCIsInNsaWNlIiwibG9hZEpQRUciLCJsb2FkUE5HIiwiRXJyb3IiLCJpbWFnZURhdGEiLCJkZWNvZGUiLCJyZWFkRmlsZVN5bmMiLCJwdXNoIiwiZGF0YSIsIndpZHRoIiwiaGVpZ2h0Iiwic3RhcnRNaXBtYXBDcmVhdGlvbiIsInNyYyIsImNyZWF0ZVJlYWRTdHJlYW0iLCJiYXNlUE5HIiwiUE5HIiwib24iLCJlcnIiLCJwaXBlIiwib3V0cHV0SlBFRyIsImNhbGxiYWNrIiwiZW5jb2RlZE91cHV0IiwiZW5jb2RlIiwib3V0cHV0UE5HIiwicG5nIiwiY29weSIsImxlbmd0aCIsImJ1ZmZlcnMiLCJidWZmZXIiLCJCdWZmZXIiLCJjb25jYXQiLCJwYWNrIiwiZW5jb2RlQ291bnRlciIsImhhc0FscGhhIiwiaSIsImVuY29kaW5nQ29tcGxldGUiLCJsb2ciLCJkZWJ1ZyIsImxldmVsIiwidXNlUE5HIiwianBnVVJMIiwicG5nVVJMIiwidXJsIiwicG5nQnVmZmVyIiwianBnQnVmZmVyIiwiZW5jb2RlTGV2ZWwiLCJ0b1N0cmluZyIsImZpbmVzdE1pcG1hcCIsImFsbG9jIl0sInNvdXJjZXMiOlsiY3JlYXRlTWlwbWFwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuXHJcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xyXG5jb25zdCBncnVudCA9IHJlcXVpcmUoICdncnVudCcgKTtcclxuY29uc3QganBlZyA9IHJlcXVpcmUoICdqcGVnLWpzJyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlcXVpcmUtc3RhdGVtZW50LW1hdGNoXHJcbmNvbnN0IG1pcG1hcERvd25zY2FsZSA9IHJlcXVpcmUoICcuLi8uLi8uLi9jaGlwcGVyL2pzL2NvbW1vbi9taXBtYXBEb3duc2NhbGUnICk7XHJcbmNvbnN0IHBuZ2pzID0gcmVxdWlyZSggJ3BuZ2pzJyApO1xyXG5cclxuLyoqXHJcbiAqIFJlc3BvbnNpYmxlIGZvciBjb252ZXJ0aW5nIGEgc2luZ2xlIFBORy9KUEVHIGZpbGUgdG8gYSBzdHJ1Y3R1cmVkIGxpc3Qgb2YgbWlwbWFwcGVkIHZlcnNpb25zIG9mIGl0LCBlYWNoXHJcbiAqIGF0IGhhbGYgdGhlIHNjYWxlIG9mIHRoZSBwcmV2aW91cyB2ZXJzaW9uLlxyXG4gKlxyXG4gKiBMZXZlbCAwIGlzIHRoZSBvcmlnaW5hbCBpbWFnZSwgbGV2ZWwgMSBpcyBhIGhhbGYtc2l6ZSBpbWFnZSwgbGV2ZWwgMiBpcyBhIHF1YXJ0ZXItc2l6ZSBpbWFnZSwgZXRjLlxyXG4gKlxyXG4gKiBGb3IgZWFjaCBsZXZlbCwgYSBwcmVmZXJyZWQgZW5jb2RpbmcgKFBORy9KUEVHKSBpcyBkZXRlcm1pbmVkLiBJZiB0aGUgaW1hZ2UgZG9lc24ndCBuZWVkIGFscGhhIGluZm9ybWF0aW9uIGFuZFxyXG4gKiB0aGUgSlBFRyBiYXNlNjQgaXMgc21hbGxlciwgdGhlIEpQRUcgZW5jb2Rpbmcgd2lsbCBiZSB1c2VkIChQTkcgb3RoZXJ3aXNlKS5cclxuICpcclxuICogVGhlIHJlc3VsdGluZyBvYmplY3QgZm9yIGVhY2ggbWlwbWFwIGxldmVsIHdpbGwgYmUgb2YgdGhlIGZvcm06XHJcbiAqIHtcclxuICogICB3aWR0aDoge251bWJlcn0gLSB3aWR0aCBvZiB0aGUgaW1hZ2UgcHJvdmlkZWQgYnkgdGhpcyBsZXZlbCBvZiBkZXRhaWxcclxuICogICBoZWlnaHQ6IHtudW1iZXJ9IC0gd2lkdGggb2YgdGhlIGltYWdlIHByb3ZpZGVkIGJ5IHRoaXMgbGV2ZWwgb2YgZGV0YWlsXHJcbiAqICAgZGF0YToge0J1ZmZlcn0gLSAxLWRpbWVuc2lvbmFsIHJvdy1tYWpvciBidWZmZXIgaG9sZGluZyBSR0JBIGluZm9ybWF0aW9uIGZvciB0aGUgbGV2ZWwgYXMgYW4gYXJyYXkgb2YgYnl0ZXMgMC0yNTUuXHJcbiAqICAgICAgICAgICAgICAgICAgICBlLmcuIGJ1ZmZlclsyXSB3aWxsIGJlIHRoZSBibHVlIGNvbXBvbmVudCBvZiB0aGUgdG9wLWxlZnQgcGl4ZWwsIGJ1ZmZlcls0XSBpcyB0aGUgcmVkIGNvbXBvbmVudFxyXG4gKiAgICAgICAgICAgICAgICAgICAgZm9yIHRoZSBwaXhlbCB0byB0aGUgcmlnaHQsIGV0Yy5cclxuICogICB1cmw6IHtzdHJpbmd9IC0gRGF0YSBVUkwgZm9yIHRoZSBwcmVmZXJyZWQgaW1hZ2UgZGF0YVxyXG4gKiAgIGJ1ZmZlcjoge0J1ZmZlcn0gLSBSYXcgYnl0ZXMgZm9yIHRoZSBwcmVmZXJyZWQgaW1hZ2UgZGF0YSAoY291bGQgYmUgd3JpdHRlbiB0byBmaWxlIGFuZCBvcGVuZWQgYXMgYW4gaW1hZ2UpXHJcbiAqICAgPHBuZ1VSTCwgcG5nQnVmZmVyLCBqcGdVUkwsIGpwZ0J1ZmZlciBtYXkgYWxzbyBiZSBhdmFpbGFibGUsIGJ1dCBpcyBub3QgbWVhbnQgZm9yIGdlbmVyYWwgdXNlPlxyXG4gKiB9XHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gbWF4TGV2ZWwgLSBBbiBpbnRlZ2VyIGRlbm90aW5nIHRoZSBtYXhpbXVtIGxldmVsIG9mIGRldGFpbCB0aGF0IHNob3VsZCBiZSBpbmNsdWRlZCwgb3IgLTEgdG8gaW5jbHVkZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGwgbGV2ZWxzIHVwIHRvIGFuZCBpbmNsdWRpbmcgYSAxeDEgaW1hZ2UuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBxdWFsaXR5IC0gQW4gaW50ZWdlciBmcm9tIDEtMTAwIGRldGVybWluaW5nIHRoZSBxdWFsaXR5IG9mIHRoZSBpbWFnZS4gQ3VycmVudGx5IG9ubHkgdXNlZCBmb3IgdGhlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgSlBFRyBlbmNvZGluZyBxdWFsaXR5LlxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gLSBXaWxsIGJlIHJlc29sdmVkIHdpdGggbWlwbWFwczoge0FycmF5fSAoY29uc2lzdGluZyBvZiB0aGUgbWlwbWFwIG9iamVjdHMsIG1pcG1hcHNbMF0gd2lsbCBiZSBsZXZlbCAwKVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVNaXBtYXAoIGZpbGVuYW1lLCBtYXhMZXZlbCwgcXVhbGl0eSApIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xyXG4gICAgY29uc3QgbWlwbWFwcyA9IFtdO1xyXG5cclxuICAgIC8vIGtpY2sgZXZlcnl0aGluZyBvZmZcclxuICAgIGNvbnN0IHN1ZmZpeCA9IGZpbGVuYW1lLnNsaWNlKCAtNCApO1xyXG4gICAgaWYgKCBzdWZmaXggPT09ICcuanBnJyApIHtcclxuICAgICAgbG9hZEpQRUcoKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBzdWZmaXggPT09ICcucG5nJyApIHtcclxuICAgICAgbG9hZFBORygpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJlamVjdCggbmV3IEVycm9yKCBgdW5rbm93biBpbWFnZSB0eXBlOiAke2ZpbGVuYW1lfWAgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvYWRzIC8gZGVjb2RlcyB0aGUgaW5pdGlhbCBKUEVHIGltYWdlLCBhbmQgd2hlbiBkb25lIHByb2NlZWRzIHRvIHRoZSBtaXBtYXBwaW5nXHJcbiAgICBmdW5jdGlvbiBsb2FkSlBFRygpIHtcclxuICAgICAgY29uc3QgaW1hZ2VEYXRhID0ganBlZy5kZWNvZGUoIGZzLnJlYWRGaWxlU3luYyggZmlsZW5hbWUgKSApO1xyXG5cclxuICAgICAgbWlwbWFwcy5wdXNoKCB7XHJcbiAgICAgICAgZGF0YTogaW1hZ2VEYXRhLmRhdGEsXHJcbiAgICAgICAgd2lkdGg6IGltYWdlRGF0YS53aWR0aCxcclxuICAgICAgICBoZWlnaHQ6IGltYWdlRGF0YS5oZWlnaHRcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgc3RhcnRNaXBtYXBDcmVhdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvYWRzIC8gZGVjb2RlcyB0aGUgaW5pdGlhbCBQTkcgaW1hZ2UsIGFuZCB3aGVuIGRvbmUgcHJvY2VlZHMgdG8gdGhlIG1pcG1hcHBpbmdcclxuICAgIGZ1bmN0aW9uIGxvYWRQTkcoKSB7XHJcbiAgICAgIGNvbnN0IHNyYyA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0oIGZpbGVuYW1lICk7XHJcblxyXG4gICAgICBjb25zdCBiYXNlUE5HID0gbmV3IHBuZ2pzLlBORygge1xyXG4gICAgICAgIC8vIGlmIHdlIG5lZWQgYSBzcGVjaWZpYyBmaWx0ZXIgdHlwZSwgcHV0IGl0IGhlcmVcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgYmFzZVBORy5vbiggJ2Vycm9yJywgZXJyID0+IHtcclxuICAgICAgICByZWplY3QoIGVyciApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBiYXNlUE5HLm9uKCAncGFyc2VkJywgKCkgPT4ge1xyXG4gICAgICAgIG1pcG1hcHMucHVzaCgge1xyXG4gICAgICAgICAgZGF0YTogYmFzZVBORy5kYXRhLFxyXG4gICAgICAgICAgd2lkdGg6IGJhc2VQTkcud2lkdGgsXHJcbiAgICAgICAgICBoZWlnaHQ6IGJhc2VQTkcuaGVpZ2h0XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBzdGFydE1pcG1hcENyZWF0aW9uKCk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIHBhc3MgdGhlIHN0cmVhbSB0byBwbmdqc1xyXG4gICAgICBzcmMucGlwZSggYmFzZVBORyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtCdWZmZXJ9IGRhdGEgLSBTaG91bGQgaGF2ZSA0KndpZHRoKmhlaWdodCBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcXVhbGl0eSAtIE91dCBvZiAxMDBcclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gZnVuY3Rpb24oIGJ1ZmZlciApXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIG91dHB1dEpQRUcoIGRhdGEsIHdpZHRoLCBoZWlnaHQsIHF1YWxpdHksIGNhbGxiYWNrICkge1xyXG4gICAgICBjb25zdCBlbmNvZGVkT3VwdXQgPSBqcGVnLmVuY29kZSgge1xyXG4gICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgd2lkdGg6IHdpZHRoLFxyXG4gICAgICAgIGhlaWdodDogaGVpZ2h0XHJcbiAgICAgIH0sIHF1YWxpdHkgKTtcclxuICAgICAgY2FsbGJhY2soIGVuY29kZWRPdXB1dC5kYXRhICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge0J1ZmZlcn0gZGF0YSAtIFNob3VsZCBoYXZlIDQqd2lkdGgqaGVpZ2h0IGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gZnVuY3Rpb24oIGJ1ZmZlciApXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIG91dHB1dFBORyggZGF0YSwgd2lkdGgsIGhlaWdodCwgY2FsbGJhY2sgKSB7XHJcbiAgICAgIC8vIHByb3ZpZGVzIHdpZHRoL2hlaWdodCBzbyBpdCBpcyBpbml0aWFsaXplZCB3aXRoIHRoZSBjb3JyZWN0LXNpemUgYnVmZmVyXHJcbiAgICAgIGNvbnN0IHBuZyA9IG5ldyBwbmdqcy5QTkcoIHtcclxuICAgICAgICB3aWR0aDogd2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHRcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gY29weSBvdXIgaW1hZ2UgZGF0YSBpbnRvIHRoZSBwbmdqcy5QTkcncyBkYXRhIGJ1ZmZlcjtcclxuICAgICAgZGF0YS5jb3B5KCBwbmcuZGF0YSwgMCwgMCwgZGF0YS5sZW5ndGggKTtcclxuXHJcbiAgICAgIC8vIHdpbGwgY29uY2F0ZW5hdGUgdGhlIGJ1ZmZlcnMgZnJvbSB0aGUgc3RyZWFtIGludG8gb25lIG9uY2UgaXQgaXMgZmluaXNoZWRcclxuICAgICAgY29uc3QgYnVmZmVycyA9IFtdO1xyXG4gICAgICBwbmcub24oICdkYXRhJywgYnVmZmVyID0+IHtcclxuICAgICAgICBidWZmZXJzLnB1c2goIGJ1ZmZlciApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHBuZy5vbiggJ2VuZCcsICgpID0+IHtcclxuICAgICAgICBjb25zdCBidWZmZXIgPSBCdWZmZXIuY29uY2F0KCBidWZmZXJzICk7XHJcblxyXG4gICAgICAgIGNhbGxiYWNrKCBidWZmZXIgKTtcclxuICAgICAgfSApO1xyXG4gICAgICBwbmcub24oICdlcnJvcicsIGVyciA9PiB7XHJcbiAgICAgICAgcmVqZWN0KCBlcnIgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8ga2ljayBvZmYgdGhlIGVuY29kaW5nIG9mIHRoZSBQTkdcclxuICAgICAgcG5nLnBhY2soKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjYWxsZWQgd2hlbiBvdXIgbWlwbWFwWzBdIGxldmVsIGlzIGxvYWRlZCBieSBkZWNvZGluZyB0aGUgbWFpbiBpbWFnZSAoY3JlYXRlcyB0aGUgbWlwbWFwIGxldmVscylcclxuICAgIGZ1bmN0aW9uIHN0YXJ0TWlwbWFwQ3JlYXRpb24oKSB7XHJcbiAgICAgIC8vIFdoZW4gcmVkdWNlZCB0byAwLCB3ZSdsbCBiZSBkb25lIHdpdGggZW5jb2RpbmcgKGFuZCBjYW4gY2FsbCBvdXIgY2FsbGJhY2spLiBOZWVkZWQgYmVjYXVzZSB0aGV5IGFyZSBhc3luY2hyb25vdXMuXHJcbiAgICAgIGxldCBlbmNvZGVDb3VudGVyID0gMTtcclxuXHJcbiAgICAgIC8vIEFscGhhIGRldGVjdGlvbiBvbiB0aGUgbGV2ZWwtMCBpbWFnZSB0byBzZWUgaWYgd2UgY2FuIHN3YXAganBnIGZvciBwbmdcclxuICAgICAgbGV0IGhhc0FscGhhID0gZmFsc2U7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMzsgaSA8IG1pcG1hcHNbIDAgXS5kYXRhLmxlbmd0aDsgaSArPSA0ICkge1xyXG4gICAgICAgIGlmICggbWlwbWFwc1sgMCBdLmRhdGFbIGkgXSA8IDI1NSApIHtcclxuICAgICAgICAgIGhhc0FscGhhID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gY2FsbGVkIHdoZW4gYWxsIG9mIGVuY29kaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgIGZ1bmN0aW9uIGVuY29kaW5nQ29tcGxldGUoKSB7XHJcbiAgICAgICAgZ3J1bnQubG9nLmRlYnVnKCBgbWlwbWFwcGVkICR7ZmlsZW5hbWV9JHttYXhMZXZlbCA+PSAwID8gYCB0byBsZXZlbCAke21heExldmVsfWAgOiAnJ30gd2l0aCBxdWFsaXR5OiAke3F1YWxpdHl9YCApO1xyXG5cclxuICAgICAgICBmb3IgKCBsZXQgbGV2ZWwgPSAwOyBsZXZlbCA8IG1pcG1hcHMubGVuZ3RoOyBsZXZlbCsrICkge1xyXG4gICAgICAgICAgLy8gZm9yIG5vdywgbWFrZSAudXJsIHBvaW50IHRvIHRoZSBzbWFsbGVzdCBvZiB0aGUgdHdvICh1bmxlc3Mgd2UgaGF2ZSBhbiBhbHBoYSBjaGFubmVsIG5lZWQpXHJcbiAgICAgICAgICBjb25zdCB1c2VQTkcgPSBoYXNBbHBoYSB8fCBtaXBtYXBzWyBsZXZlbCBdLmpwZ1VSTC5sZW5ndGggPiBtaXBtYXBzWyBsZXZlbCBdLnBuZ1VSTC5sZW5ndGg7XHJcbiAgICAgICAgICBtaXBtYXBzWyBsZXZlbCBdLnVybCA9IHVzZVBORyA/IG1pcG1hcHNbIGxldmVsIF0ucG5nVVJMIDogbWlwbWFwc1sgbGV2ZWwgXS5qcGdVUkw7XHJcbiAgICAgICAgICBtaXBtYXBzWyBsZXZlbCBdLmJ1ZmZlciA9IHVzZVBORyA/IG1pcG1hcHNbIGxldmVsIF0ucG5nQnVmZmVyIDogbWlwbWFwc1sgbGV2ZWwgXS5qcGdCdWZmZXI7XHJcblxyXG4gICAgICAgICAgZ3J1bnQubG9nLmRlYnVnKCBgbGV2ZWwgJHtsZXZlbH0gKCR7dXNlUE5HID8gJ1BORycgOiAnSlBHJ30gJHtcclxuICAgICAgICAgICAgbWlwbWFwc1sgbGV2ZWwgXS53aWR0aH14JHttaXBtYXBzWyBsZXZlbCBdLmhlaWdodH0pIGJhc2U2NDogJHtcclxuICAgICAgICAgICAgbWlwbWFwc1sgbGV2ZWwgXS51cmwubGVuZ3RofSBieXRlcyBgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXNvbHZlKCBtaXBtYXBzICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGtpY2tzIG9mZiBhc3luY2hyb25vdXMgZW5jb2RpbmcgZm9yIGEgc3BlY2lmaWMgbGV2ZWxcclxuICAgICAgZnVuY3Rpb24gZW5jb2RlTGV2ZWwoIGxldmVsICkge1xyXG4gICAgICAgIGVuY29kZUNvdW50ZXIrKztcclxuICAgICAgICBvdXRwdXRQTkcoIG1pcG1hcHNbIGxldmVsIF0uZGF0YSwgbWlwbWFwc1sgbGV2ZWwgXS53aWR0aCwgbWlwbWFwc1sgbGV2ZWwgXS5oZWlnaHQsIGJ1ZmZlciA9PiB7XHJcbiAgICAgICAgICBtaXBtYXBzWyBsZXZlbCBdLnBuZ0J1ZmZlciA9IGJ1ZmZlcjtcclxuICAgICAgICAgIG1pcG1hcHNbIGxldmVsIF0ucG5nVVJMID0gYGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwke2J1ZmZlci50b1N0cmluZyggJ2Jhc2U2NCcgKX1gO1xyXG4gICAgICAgICAgaWYgKCAtLWVuY29kZUNvdW50ZXIgPT09IDAgKSB7XHJcbiAgICAgICAgICAgIGVuY29kaW5nQ29tcGxldGUoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIG9ubHkgZW5jb2RlIEpQRUcgaWYgaXQgaGFzIG5vIGFscGhhXHJcbiAgICAgICAgaWYgKCAhaGFzQWxwaGEgKSB7XHJcbiAgICAgICAgICBlbmNvZGVDb3VudGVyKys7XHJcbiAgICAgICAgICBvdXRwdXRKUEVHKCBtaXBtYXBzWyBsZXZlbCBdLmRhdGEsIG1pcG1hcHNbIGxldmVsIF0ud2lkdGgsIG1pcG1hcHNbIGxldmVsIF0uaGVpZ2h0LCBxdWFsaXR5LCBidWZmZXIgPT4ge1xyXG4gICAgICAgICAgICBtaXBtYXBzWyBsZXZlbCBdLmpwZ0J1ZmZlciA9IGJ1ZmZlcjtcclxuICAgICAgICAgICAgbWlwbWFwc1sgbGV2ZWwgXS5qcGdVUkwgPSBgZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwke2J1ZmZlci50b1N0cmluZyggJ2Jhc2U2NCcgKX1gO1xyXG4gICAgICAgICAgICBpZiAoIC0tZW5jb2RlQ291bnRlciA9PT0gMCApIHtcclxuICAgICAgICAgICAgICBlbmNvZGluZ0NvbXBsZXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGVuY29kZSBhbGwgbGV2ZWxzLCBhbmQgY29tcHV0ZSByYXN0ZXJzIGZvciBsZXZlbHMgMS1OXHJcbiAgICAgIGVuY29kZUxldmVsKCAwICk7XHJcblxyXG4gICAgICBmdW5jdGlvbiBmaW5lc3RNaXBtYXAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG1pcG1hcHNbIG1pcG1hcHMubGVuZ3RoIC0gMSBdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBiYWlsIGlmIHdlIGFscmVhZHkgaGF2ZSBhIDF4MSBpbWFnZSwgb3IgaWYgd2UgcmVhY2ggdGhlIG1heExldmVsIChyZWNhbGwgbWF4TGV2ZWw9PT0tMSBtZWFucyBubyBtYXhpbXVtIGxldmVsKVxyXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5tb2RpZmllZC1sb29wLWNvbmRpdGlvblxyXG4gICAgICB3aGlsZSAoICggbWlwbWFwcy5sZW5ndGggLSAxIDwgbWF4TGV2ZWwgfHwgbWF4TGV2ZWwgPCAwICkgJiYgKCBmaW5lc3RNaXBtYXAoKS53aWR0aCA+IDEgfHwgZmluZXN0TWlwbWFwKCkuaGVpZ2h0ID4gMSApICkge1xyXG4gICAgICAgIGNvbnN0IGxldmVsID0gbWlwbWFwcy5sZW5ndGg7XHJcbiAgICAgICAgbWlwbWFwcy5wdXNoKCBtaXBtYXBEb3duc2NhbGUoIGZpbmVzdE1pcG1hcCgpLCAoIHdpZHRoLCBoZWlnaHQgKSA9PiB7XHJcbiAgICAgICAgICByZXR1cm4gQnVmZmVyLmFsbG9jKCA0ICogd2lkdGggKiBoZWlnaHQgKTtcclxuICAgICAgICB9ICkgKTtcclxuICAgICAgICBlbmNvZGVMZXZlbCggbGV2ZWwgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8ganVzdCBpbiBjYXNlIGV2ZXJ5dGhpbmcgaGFwcGVuZWQgc3luY2hyb25vdXNseVxyXG4gICAgICBpZiAoIC0tZW5jb2RlQ291bnRlciA9PT0gMCApIHtcclxuICAgICAgICBlbmNvZGluZ0NvbXBsZXRlKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9ICk7XHJcbn07XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBR0EsTUFBTUEsRUFBRSxHQUFHQyxPQUFPLENBQUUsSUFBSyxDQUFDO0FBQzFCLE1BQU1DLEtBQUssR0FBR0QsT0FBTyxDQUFFLE9BQVEsQ0FBQztBQUNoQyxNQUFNRSxJQUFJLEdBQUdGLE9BQU8sQ0FBRSxTQUFVLENBQUMsQ0FBQyxDQUFDO0FBQ25DLE1BQU1HLGVBQWUsR0FBR0gsT0FBTyxDQUFFLDRDQUE2QyxDQUFDO0FBQy9FLE1BQU1JLEtBQUssR0FBR0osT0FBTyxDQUFFLE9BQVEsQ0FBQzs7QUFFaEM7QUFDQTtBQUNBO0FB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