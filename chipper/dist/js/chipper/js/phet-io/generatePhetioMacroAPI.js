// Copyright 2019-2023, University of Colorado Boulder

/**
 * Launch an instance of the simulation using puppeteer, gather the PhET-iO API of the simulation,
 * see phetioEngine.getPhetioElementsBaseline
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

const puppeteer = require('puppeteer');
const _ = require('lodash');
const assert = require('assert');
const showCommandLineProgress = require('../common/showCommandLineProgress');
const withServer = require('../../../perennial-alias/js/common/withServer');

/**
 * Load each sim provided and get the
 * @param {string[]} repos
 * @param {Object} [options]
 * @returns {Promise.<Object.<string, Object>>} - keys are the repos, values are the APIs for each repo.
 */
const generatePhetioMacroAPI = async (repos, options) => {
  assert(repos.length === _.uniq(repos).length, 'repos should be unique');
  options = _.extend({
    fromBuiltVersion: false,
    // if the built file should be used to generate the API (otherwise uses unbuilt)
    chunkSize: 4,
    // split into chunks with (at most) this many elements per chunk
    showProgressBar: false,
    showMessagesFromSim: true
  }, options);
  repos.length > 1 && console.log('Generating PhET-iO API for repos:', repos.join(', '));
  return withServer(async port => {
    const browser = await puppeteer.launch({
      timeout: 120000,
      args: ['--disable-gpu',
      // Fork child processes directly to prevent orphaned chrome instances from lingering on sparky, https://github.com/phetsims/aqua/issues/150#issuecomment-1170140994
      '--no-zygote', '--no-sandbox']
    });
    const chunks = _.chunk(repos, options.chunkSize);
    const macroAPI = {};
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      options.showProgressBar && showCommandLineProgress(i / chunks.length, false);
      const promises = chunk.map(async repo => {
        const page = await browser.newPage();
        return new Promise(async (resolve, reject) => {
          // eslint-disable-line no-async-promise-executor

          let cleaned = false;
          // Returns whether we closed the page
          const cleanup = async () => {
            if (cleaned) {
              return false;
            }
            cleaned = true; // must be before the close to prevent cleaning from being done twice if errors occur from page close.

            clearTimeout(id);
            await page.close();
            return true;
          };

          // This is likely to occur in the middle of page.goto, so we need to be graceful to the fact that resolving
          // and closing the page will then cause an error in the page.goto call, see https://github.com/phetsims/perennial/issues/268#issuecomment-1382374092
          const cleanupAndResolve = async value => {
            if (await cleanup()) {
              resolve(value);
            }
          };
          const cleanupAndReject = async e => {
            if (await cleanup()) {
              reject(e);
            }
          };

          // Fail if this takes too long.  Doesn't need to be cleared since only the first resolve/reject is used
          const id = setTimeout(() => cleanupAndReject(new Error(`Timeout in generatePhetioMacroAPI for ${repo}`)), 120000);
          page.on('console', async msg => {
            const messageText = msg.text();
            if (messageText.indexOf('"phetioFullAPI": true,') >= 0) {
              const fullAPI = messageText;
              cleanupAndResolve({
                // to keep track of which repo this is for
                repo: repo,
                // For machine readability
                api: JSON.parse(fullAPI)
              });
            } else if (msg.type() === 'error') {
              const location = msg.location ? `:\n  ${msg.location().url}` : '';
              const message = messageText + location;
              console.error('Error from sim:', message);
            }
          });
          page.on('error', cleanupAndReject);
          page.on('pageerror', cleanupAndReject);
          const relativePath = options.fromBuiltVersion ? `build/phet-io/${repo}_all_phet-io.html` : `${repo}_en.html`;

          // NOTE: DUPLICATION ALERT: This random seed is copied wherever API comparison is done against the generated API. Don't change this
          // without looking for other usages of this random seed value.
          const url = `http://localhost:${port}/${repo}/${relativePath}?ea&brand=phet-io&phetioStandalone&phetioPrintAPI&randomSeed=332211&locales=*`;
          try {
            await page.goto(url, {
              timeout: 120000
            });
          } catch (e) {
            await cleanupAndReject(new Error(`page.goto failure: ${e}`));
          }
        });
      });
      const chunkResults = await Promise.allSettled(promises);
      chunkResults.forEach(chunkResult => {
        if (chunkResult.status === 'fulfilled') {
          assert(chunkResult.value.api instanceof Object, 'api expected from Promise results');
          macroAPI[chunkResult.value.repo] = chunkResult.value.api;
        } else {
          console.error('Error in fulfilling chunk Promise:', chunkResult.reason);
        }
      });
    }
    options.showProgressBar && showCommandLineProgress(1, true);
    await browser.close();
    return macroAPI;
  });
};

// @public (read-only)
generatePhetioMacroAPI.apiVersion = '1.0.0-dev.0';

/**
 * @param {string[]} repos
 * @param {Object} [options]
 */
module.exports = generatePhetioMacroAPI;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwdXBwZXRlZXIiLCJyZXF1aXJlIiwiXyIsImFzc2VydCIsInNob3dDb21tYW5kTGluZVByb2dyZXNzIiwid2l0aFNlcnZlciIsImdlbmVyYXRlUGhldGlvTWFjcm9BUEkiLCJyZXBvcyIsIm9wdGlvbnMiLCJsZW5ndGgiLCJ1bmlxIiwiZXh0ZW5kIiwiZnJvbUJ1aWx0VmVyc2lvbiIsImNodW5rU2l6ZSIsInNob3dQcm9ncmVzc0JhciIsInNob3dNZXNzYWdlc0Zyb21TaW0iLCJjb25zb2xlIiwibG9nIiwiam9pbiIsInBvcnQiLCJicm93c2VyIiwibGF1bmNoIiwidGltZW91dCIsImFyZ3MiLCJjaHVua3MiLCJjaHVuayIsIm1hY3JvQVBJIiwiaSIsInByb21pc2VzIiwibWFwIiwicmVwbyIsInBhZ2UiLCJuZXdQYWdlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJjbGVhbmVkIiwiY2xlYW51cCIsImNsZWFyVGltZW91dCIsImlkIiwiY2xvc2UiLCJjbGVhbnVwQW5kUmVzb2x2ZSIsInZhbHVlIiwiY2xlYW51cEFuZFJlamVjdCIsImUiLCJzZXRUaW1lb3V0IiwiRXJyb3IiLCJvbiIsIm1zZyIsIm1lc3NhZ2VUZXh0IiwidGV4dCIsImluZGV4T2YiLCJmdWxsQVBJIiwiYXBpIiwiSlNPTiIsInBhcnNlIiwidHlwZSIsImxvY2F0aW9uIiwidXJsIiwibWVzc2FnZSIsImVycm9yIiwicmVsYXRpdmVQYXRoIiwiZ290byIsImNodW5rUmVzdWx0cyIsImFsbFNldHRsZWQiLCJmb3JFYWNoIiwiY2h1bmtSZXN1bHQiLCJzdGF0dXMiLCJPYmplY3QiLCJyZWFzb24iLCJhcGlWZXJzaW9uIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJzb3VyY2VzIjpbImdlbmVyYXRlUGhldGlvTWFjcm9BUEkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTGF1bmNoIGFuIGluc3RhbmNlIG9mIHRoZSBzaW11bGF0aW9uIHVzaW5nIHB1cHBldGVlciwgZ2F0aGVyIHRoZSBQaEVULWlPIEFQSSBvZiB0aGUgc2ltdWxhdGlvbixcclxuICogc2VlIHBoZXRpb0VuZ2luZS5nZXRQaGV0aW9FbGVtZW50c0Jhc2VsaW5lXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcblxyXG5jb25zdCBwdXBwZXRlZXIgPSByZXF1aXJlKCAncHVwcGV0ZWVyJyApO1xyXG5jb25zdCBfID0gcmVxdWlyZSggJ2xvZGFzaCcgKTtcclxuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcclxuY29uc3Qgc2hvd0NvbW1hbmRMaW5lUHJvZ3Jlc3MgPSByZXF1aXJlKCAnLi4vY29tbW9uL3Nob3dDb21tYW5kTGluZVByb2dyZXNzJyApO1xyXG5jb25zdCB3aXRoU2VydmVyID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vd2l0aFNlcnZlcicgKTtcclxuXHJcbi8qKlxyXG4gKiBMb2FkIGVhY2ggc2ltIHByb3ZpZGVkIGFuZCBnZXQgdGhlXHJcbiAqIEBwYXJhbSB7c3RyaW5nW119IHJlcG9zXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICogQHJldHVybnMge1Byb21pc2UuPE9iamVjdC48c3RyaW5nLCBPYmplY3Q+Pn0gLSBrZXlzIGFyZSB0aGUgcmVwb3MsIHZhbHVlcyBhcmUgdGhlIEFQSXMgZm9yIGVhY2ggcmVwby5cclxuICovXHJcbmNvbnN0IGdlbmVyYXRlUGhldGlvTWFjcm9BUEkgPSBhc3luYyAoIHJlcG9zLCBvcHRpb25zICkgPT4ge1xyXG5cclxuICBhc3NlcnQoIHJlcG9zLmxlbmd0aCA9PT0gXy51bmlxKCByZXBvcyApLmxlbmd0aCwgJ3JlcG9zIHNob3VsZCBiZSB1bmlxdWUnICk7XHJcblxyXG4gIG9wdGlvbnMgPSBfLmV4dGVuZCgge1xyXG4gICAgZnJvbUJ1aWx0VmVyc2lvbjogZmFsc2UsIC8vIGlmIHRoZSBidWlsdCBmaWxlIHNob3VsZCBiZSB1c2VkIHRvIGdlbmVyYXRlIHRoZSBBUEkgKG90aGVyd2lzZSB1c2VzIHVuYnVpbHQpXHJcbiAgICBjaHVua1NpemU6IDQsIC8vIHNwbGl0IGludG8gY2h1bmtzIHdpdGggKGF0IG1vc3QpIHRoaXMgbWFueSBlbGVtZW50cyBwZXIgY2h1bmtcclxuICAgIHNob3dQcm9ncmVzc0JhcjogZmFsc2UsXHJcbiAgICBzaG93TWVzc2FnZXNGcm9tU2ltOiB0cnVlXHJcbiAgfSwgb3B0aW9ucyApO1xyXG5cclxuICByZXBvcy5sZW5ndGggPiAxICYmIGNvbnNvbGUubG9nKCAnR2VuZXJhdGluZyBQaEVULWlPIEFQSSBmb3IgcmVwb3M6JywgcmVwb3Muam9pbiggJywgJyApICk7XHJcblxyXG4gIHJldHVybiB3aXRoU2VydmVyKCBhc3luYyBwb3J0ID0+IHtcclxuICAgIGNvbnN0IGJyb3dzZXIgPSBhd2FpdCBwdXBwZXRlZXIubGF1bmNoKCB7XHJcbiAgICAgIHRpbWVvdXQ6IDEyMDAwMCxcclxuICAgICAgYXJnczogW1xyXG4gICAgICAgICctLWRpc2FibGUtZ3B1JyxcclxuXHJcbiAgICAgICAgLy8gRm9yayBjaGlsZCBwcm9jZXNzZXMgZGlyZWN0bHkgdG8gcHJldmVudCBvcnBoYW5lZCBjaHJvbWUgaW5zdGFuY2VzIGZyb20gbGluZ2VyaW5nIG9uIHNwYXJreSwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FxdWEvaXNzdWVzLzE1MCNpc3N1ZWNvbW1lbnQtMTE3MDE0MDk5NFxyXG4gICAgICAgICctLW5vLXp5Z290ZScsXHJcbiAgICAgICAgJy0tbm8tc2FuZGJveCdcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgY2h1bmtzID0gXy5jaHVuayggcmVwb3MsIG9wdGlvbnMuY2h1bmtTaXplICk7XHJcblxyXG4gICAgY29uc3QgbWFjcm9BUEkgPSB7fTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaHVua3MubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGNodW5rID0gY2h1bmtzWyBpIF07XHJcbiAgICAgIG9wdGlvbnMuc2hvd1Byb2dyZXNzQmFyICYmIHNob3dDb21tYW5kTGluZVByb2dyZXNzKCBpIC8gY2h1bmtzLmxlbmd0aCwgZmFsc2UgKTtcclxuXHJcbiAgICAgIGNvbnN0IHByb21pc2VzID0gY2h1bmsubWFwKCBhc3luYyByZXBvID0+IHtcclxuICAgICAgICBjb25zdCBwYWdlID0gYXdhaXQgYnJvd3Nlci5uZXdQYWdlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMgKCByZXNvbHZlLCByZWplY3QgKSA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tYXN5bmMtcHJvbWlzZS1leGVjdXRvclxyXG5cclxuICAgICAgICAgIGxldCBjbGVhbmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAvLyBSZXR1cm5zIHdoZXRoZXIgd2UgY2xvc2VkIHRoZSBwYWdlXHJcbiAgICAgICAgICBjb25zdCBjbGVhbnVwID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIGNsZWFuZWQgKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgICAgICAgICBjbGVhbmVkID0gdHJ1ZTsgLy8gbXVzdCBiZSBiZWZvcmUgdGhlIGNsb3NlIHRvIHByZXZlbnQgY2xlYW5pbmcgZnJvbSBiZWluZyBkb25lIHR3aWNlIGlmIGVycm9ycyBvY2N1ciBmcm9tIHBhZ2UgY2xvc2UuXHJcblxyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoIGlkICk7XHJcbiAgICAgICAgICAgIGF3YWl0IHBhZ2UuY2xvc2UoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAvLyBUaGlzIGlzIGxpa2VseSB0byBvY2N1ciBpbiB0aGUgbWlkZGxlIG9mIHBhZ2UuZ290bywgc28gd2UgbmVlZCB0byBiZSBncmFjZWZ1bCB0byB0aGUgZmFjdCB0aGF0IHJlc29sdmluZ1xyXG4gICAgICAgICAgLy8gYW5kIGNsb3NpbmcgdGhlIHBhZ2Ugd2lsbCB0aGVuIGNhdXNlIGFuIGVycm9yIGluIHRoZSBwYWdlLmdvdG8gY2FsbCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZXJlbm5pYWwvaXNzdWVzLzI2OCNpc3N1ZWNvbW1lbnQtMTM4MjM3NDA5MlxyXG4gICAgICAgICAgY29uc3QgY2xlYW51cEFuZFJlc29sdmUgPSBhc3luYyB2YWx1ZSA9PiB7XHJcbiAgICAgICAgICAgIGlmICggYXdhaXQgY2xlYW51cCgpICkge1xyXG4gICAgICAgICAgICAgIHJlc29sdmUoIHZhbHVlICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBjb25zdCBjbGVhbnVwQW5kUmVqZWN0ID0gYXN5bmMgZSA9PiB7XHJcbiAgICAgICAgICAgIGlmICggYXdhaXQgY2xlYW51cCgpICkge1xyXG4gICAgICAgICAgICAgIHJlamVjdCggZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIC8vIEZhaWwgaWYgdGhpcyB0YWtlcyB0b28gbG9uZy4gIERvZXNuJ3QgbmVlZCB0byBiZSBjbGVhcmVkIHNpbmNlIG9ubHkgdGhlIGZpcnN0IHJlc29sdmUvcmVqZWN0IGlzIHVzZWRcclxuICAgICAgICAgIGNvbnN0IGlkID0gc2V0VGltZW91dCggKCkgPT4gY2xlYW51cEFuZFJlamVjdCggbmV3IEVycm9yKCBgVGltZW91dCBpbiBnZW5lcmF0ZVBoZXRpb01hY3JvQVBJIGZvciAke3JlcG99YCApICksIDEyMDAwMCApO1xyXG5cclxuICAgICAgICAgIHBhZ2Uub24oICdjb25zb2xlJywgYXN5bmMgbXNnID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbWVzc2FnZVRleHQgPSBtc2cudGV4dCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBtZXNzYWdlVGV4dC5pbmRleE9mKCAnXCJwaGV0aW9GdWxsQVBJXCI6IHRydWUsJyApID49IDAgKSB7XHJcblxyXG4gICAgICAgICAgICAgIGNvbnN0IGZ1bGxBUEkgPSBtZXNzYWdlVGV4dDtcclxuXHJcbiAgICAgICAgICAgICAgY2xlYW51cEFuZFJlc29sdmUoIHtcclxuICAgICAgICAgICAgICAgIC8vIHRvIGtlZXAgdHJhY2sgb2Ygd2hpY2ggcmVwbyB0aGlzIGlzIGZvclxyXG4gICAgICAgICAgICAgICAgcmVwbzogcmVwbyxcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBGb3IgbWFjaGluZSByZWFkYWJpbGl0eVxyXG4gICAgICAgICAgICAgICAgYXBpOiBKU09OLnBhcnNlKCBmdWxsQVBJIClcclxuICAgICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCBtc2cudHlwZSgpID09PSAnZXJyb3InICkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gbXNnLmxvY2F0aW9uID8gYDpcXG4gICR7bXNnLmxvY2F0aW9uKCkudXJsfWAgOiAnJztcclxuICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gbWVzc2FnZVRleHQgKyBsb2NhdGlvbjtcclxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCAnRXJyb3IgZnJvbSBzaW06JywgbWVzc2FnZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgcGFnZS5vbiggJ2Vycm9yJywgY2xlYW51cEFuZFJlamVjdCApO1xyXG4gICAgICAgICAgcGFnZS5vbiggJ3BhZ2VlcnJvcicsIGNsZWFudXBBbmRSZWplY3QgKTtcclxuXHJcbiAgICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBvcHRpb25zLmZyb21CdWlsdFZlcnNpb24gP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYGJ1aWxkL3BoZXQtaW8vJHtyZXBvfV9hbGxfcGhldC1pby5odG1sYCA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtyZXBvfV9lbi5odG1sYDtcclxuXHJcbiAgICAgICAgICAvLyBOT1RFOiBEVVBMSUNBVElPTiBBTEVSVDogVGhpcyByYW5kb20gc2VlZCBpcyBjb3BpZWQgd2hlcmV2ZXIgQVBJIGNvbXBhcmlzb24gaXMgZG9uZSBhZ2FpbnN0IHRoZSBnZW5lcmF0ZWQgQVBJLiBEb24ndCBjaGFuZ2UgdGhpc1xyXG4gICAgICAgICAgLy8gd2l0aG91dCBsb29raW5nIGZvciBvdGhlciB1c2FnZXMgb2YgdGhpcyByYW5kb20gc2VlZCB2YWx1ZS5cclxuICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vJHtyZXBvfS8ke3JlbGF0aXZlUGF0aH0/ZWEmYnJhbmQ9cGhldC1pbyZwaGV0aW9TdGFuZGFsb25lJnBoZXRpb1ByaW50QVBJJnJhbmRvbVNlZWQ9MzMyMjExJmxvY2FsZXM9KmA7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCBwYWdlLmdvdG8oIHVybCwge1xyXG4gICAgICAgICAgICAgIHRpbWVvdXQ6IDEyMDAwMFxyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYXRjaCggZSApIHtcclxuICAgICAgICAgICAgYXdhaXQgY2xlYW51cEFuZFJlamVjdCggbmV3IEVycm9yKCBgcGFnZS5nb3RvIGZhaWx1cmU6ICR7ZX1gICkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbnN0IGNodW5rUmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZCggcHJvbWlzZXMgKTtcclxuXHJcbiAgICAgIGNodW5rUmVzdWx0cy5mb3JFYWNoKCBjaHVua1Jlc3VsdCA9PiB7XHJcbiAgICAgICAgaWYgKCBjaHVua1Jlc3VsdC5zdGF0dXMgPT09ICdmdWxmaWxsZWQnICkge1xyXG4gICAgICAgICAgYXNzZXJ0KCBjaHVua1Jlc3VsdC52YWx1ZS5hcGkgaW5zdGFuY2VvZiBPYmplY3QsICdhcGkgZXhwZWN0ZWQgZnJvbSBQcm9taXNlIHJlc3VsdHMnICk7XHJcbiAgICAgICAgICBtYWNyb0FQSVsgY2h1bmtSZXN1bHQudmFsdWUucmVwbyBdID0gY2h1bmtSZXN1bHQudmFsdWUuYXBpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoICdFcnJvciBpbiBmdWxmaWxsaW5nIGNodW5rIFByb21pc2U6JywgY2h1bmtSZXN1bHQucmVhc29uICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgb3B0aW9ucy5zaG93UHJvZ3Jlc3NCYXIgJiYgc2hvd0NvbW1hbmRMaW5lUHJvZ3Jlc3MoIDEsIHRydWUgKTtcclxuXHJcbiAgICBhd2FpdCBicm93c2VyLmNsb3NlKCk7XHJcbiAgICByZXR1cm4gbWFjcm9BUEk7XHJcbiAgfSApO1xyXG59O1xyXG5cclxuLy8gQHB1YmxpYyAocmVhZC1vbmx5KVxyXG5nZW5lcmF0ZVBoZXRpb01hY3JvQVBJLmFwaVZlcnNpb24gPSAnMS4wLjAtZGV2LjAnO1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7c3RyaW5nW119IHJlcG9zXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZ2VuZXJhdGVQaGV0aW9NYWNyb0FQSTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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