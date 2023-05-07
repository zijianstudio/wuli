// Copyright 2018, University of Colorado Boulder

/**
 * Returns phet-io metadata from the production website
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const _ = require('lodash');
const winston = require('winston');
const axios = require('axios');

/**
 * Returns metadata from the production website.
 * @public
 *
 * @param {Object} [options]
 * @returns {Promise.<Object>} - Resolves with metadata object
 */
module.exports = async function (options) {
  options = _.extend({
    active: null,
    // {boolean|null} - If set, will only include active branches
    latest: null // {boolean|null} - If set, will only include active branches
  }, options);
  let metadataURL = 'https://phet.colorado.edu/services/metadata/phetio?';
  if (options.active !== null) {
    metadataURL += `&active=${options.active}`;
  }
  if (options.latest !== null) {
    metadataURL += `&latest=${options.latest}`;
  }
  winston.info(`getting phet-io metadata request with ${metadataURL}`);
  let response;
  try {
    response = await axios(metadataURL);
  } catch (e) {
    throw new Error(`metadata request failed with ${e}`);
  }
  if (response.status !== 200) {
    throw new Error(`metadata request failed with status ${response.status} ${response}`);
  } else {
    return response.data;
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsIndpbnN0b24iLCJheGlvcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJvcHRpb25zIiwiZXh0ZW5kIiwiYWN0aXZlIiwibGF0ZXN0IiwibWV0YWRhdGFVUkwiLCJpbmZvIiwicmVzcG9uc2UiLCJlIiwiRXJyb3IiLCJzdGF0dXMiLCJkYXRhIl0sInNvdXJjZXMiOlsic2ltUGhldGlvTWV0YWRhdGEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgcGhldC1pbyBtZXRhZGF0YSBmcm9tIHRoZSBwcm9kdWN0aW9uIHdlYnNpdGVcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xyXG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XHJcbmNvbnN0IGF4aW9zID0gcmVxdWlyZSggJ2F4aW9zJyApO1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgbWV0YWRhdGEgZnJvbSB0aGUgcHJvZHVjdGlvbiB3ZWJzaXRlLlxyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICogQHJldHVybnMge1Byb21pc2UuPE9iamVjdD59IC0gUmVzb2x2ZXMgd2l0aCBtZXRhZGF0YSBvYmplY3RcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIG9wdGlvbnMgKSB7XHJcbiAgb3B0aW9ucyA9IF8uZXh0ZW5kKCB7XHJcbiAgICBhY3RpdmU6IG51bGwsIC8vIHtib29sZWFufG51bGx9IC0gSWYgc2V0LCB3aWxsIG9ubHkgaW5jbHVkZSBhY3RpdmUgYnJhbmNoZXNcclxuICAgIGxhdGVzdDogbnVsbCAvLyB7Ym9vbGVhbnxudWxsfSAtIElmIHNldCwgd2lsbCBvbmx5IGluY2x1ZGUgYWN0aXZlIGJyYW5jaGVzXHJcbiAgfSwgb3B0aW9ucyApO1xyXG5cclxuICBsZXQgbWV0YWRhdGFVUkwgPSAnaHR0cHM6Ly9waGV0LmNvbG9yYWRvLmVkdS9zZXJ2aWNlcy9tZXRhZGF0YS9waGV0aW8/JztcclxuICBpZiAoIG9wdGlvbnMuYWN0aXZlICE9PSBudWxsICkge1xyXG4gICAgbWV0YWRhdGFVUkwgKz0gYCZhY3RpdmU9JHtvcHRpb25zLmFjdGl2ZX1gO1xyXG4gIH1cclxuICBpZiAoIG9wdGlvbnMubGF0ZXN0ICE9PSBudWxsICkge1xyXG4gICAgbWV0YWRhdGFVUkwgKz0gYCZsYXRlc3Q9JHtvcHRpb25zLmxhdGVzdH1gO1xyXG4gIH1cclxuXHJcbiAgd2luc3Rvbi5pbmZvKCBgZ2V0dGluZyBwaGV0LWlvIG1ldGFkYXRhIHJlcXVlc3Qgd2l0aCAke21ldGFkYXRhVVJMfWAgKTtcclxuICBsZXQgcmVzcG9uc2U7XHJcbiAgdHJ5IHtcclxuICAgIHJlc3BvbnNlID0gYXdhaXQgYXhpb3MoIG1ldGFkYXRhVVJMICk7XHJcbiAgfVxyXG4gIGNhdGNoKCBlICkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCBgbWV0YWRhdGEgcmVxdWVzdCBmYWlsZWQgd2l0aCAke2V9YCApO1xyXG4gIH1cclxuXHJcbiAgaWYgKCByZXNwb25zZS5zdGF0dXMgIT09IDIwMCApIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggYG1ldGFkYXRhIHJlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzfSAke3Jlc3BvbnNlfWAgKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICB9XHJcbn07XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQSxDQUFDLEdBQUdDLE9BQU8sQ0FBRSxRQUFTLENBQUM7QUFDN0IsTUFBTUMsT0FBTyxHQUFHRCxPQUFPLENBQUUsU0FBVSxDQUFDO0FBQ3BDLE1BQU1FLEtBQUssR0FBR0YsT0FBTyxDQUFFLE9BQVEsQ0FBQzs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUcsTUFBTSxDQUFDQyxPQUFPLEdBQUcsZ0JBQWdCQyxPQUFPLEVBQUc7RUFDekNBLE9BQU8sR0FBR04sQ0FBQyxDQUFDTyxNQUFNLENBQUU7SUFDbEJDLE1BQU0sRUFBRSxJQUFJO0lBQUU7SUFDZEMsTUFBTSxFQUFFLElBQUksQ0FBQztFQUNmLENBQUMsRUFBRUgsT0FBUSxDQUFDO0VBRVosSUFBSUksV0FBVyxHQUFHLHFEQUFxRDtFQUN2RSxJQUFLSixPQUFPLENBQUNFLE1BQU0sS0FBSyxJQUFJLEVBQUc7SUFDN0JFLFdBQVcsSUFBSyxXQUFVSixPQUFPLENBQUNFLE1BQU8sRUFBQztFQUM1QztFQUNBLElBQUtGLE9BQU8sQ0FBQ0csTUFBTSxLQUFLLElBQUksRUFBRztJQUM3QkMsV0FBVyxJQUFLLFdBQVVKLE9BQU8sQ0FBQ0csTUFBTyxFQUFDO0VBQzVDO0VBRUFQLE9BQU8sQ0FBQ1MsSUFBSSxDQUFHLHlDQUF3Q0QsV0FBWSxFQUFFLENBQUM7RUFDdEUsSUFBSUUsUUFBUTtFQUNaLElBQUk7SUFDRkEsUUFBUSxHQUFHLE1BQU1ULEtBQUssQ0FBRU8sV0FBWSxDQUFDO0VBQ3ZDLENBQUMsQ0FDRCxPQUFPRyxDQUFDLEVBQUc7SUFDVCxNQUFNLElBQUlDLEtBQUssQ0FBRyxnQ0FBK0JELENBQUUsRUFBRSxDQUFDO0VBQ3hEO0VBRUEsSUFBS0QsUUFBUSxDQUFDRyxNQUFNLEtBQUssR0FBRyxFQUFHO0lBQzdCLE1BQU0sSUFBSUQsS0FBSyxDQUFHLHVDQUFzQ0YsUUFBUSxDQUFDRyxNQUFPLElBQUdILFFBQVMsRUFBRSxDQUFDO0VBQ3pGLENBQUMsTUFDSTtJQUNILE9BQU9BLFFBQVEsQ0FBQ0ksSUFBSTtFQUN0QjtBQUNGLENBQUMifQ==