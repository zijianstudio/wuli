// Copyright 2018-2023, University of Colorado Boulder

/**
 * Runs all sims to get runtime information. Return the data object based on the sims run in master.
 *
 * Currently the data structure returned is an object where keys are the sims, and the value is an object where the
 * key is the component name i.e. `{{repoName}}/{{componentName}}, and the value is a list of dataURL images.
 *
 *
 * This file relies heavily on phet-core's `InstanceRegistry.js` to communicate with sims during runtime. To get data
 * and pictures about a component in the sim, that component will need to be registered, see ComboBox.js as an example. . .
 * Something like: `
 * // support for binder documentation, stripped out in builds and only runs when ?binder is specified
 * assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ComboBox', this );
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

// modules
const _ = require('lodash');
const assert = require('assert');
const fs = require('fs');
const puppeteer = require('puppeteer');
const withServer = require('../../perennial/js/common/withServer');

// Helper function to get the sim list from perennial
const getSims = function () {
  return fs.readFileSync(`${__dirname}/../../perennial/data/active-sims`).toString().trim().split('\n').map(sim => sim.trim());
};
module.exports = async commandLineSims => {
  return withServer(async port => {
    const baseURL = `http://localhost:${port}/`;
    const browser = await puppeteer.launch();
    const dataByComponent = {};
    const dataBySim = {};

    // override to generate based on only sims provided
    const sims = commandLineSims ? commandLineSims.split(',') : getSims();
    console.log('sims to load:', sims.join(', '));
    for (const sim of sims) {
      const page = await browser.newPage();
      await page.exposeFunction('updateComponentData', (simName, dataMap) => {
        assert(!dataBySim[sim], 'sim already exists?');
        dataBySim[sim] = {};
        const simObject = dataBySim[sim];
        simObject.name = sim;
        simObject.components = [];
        for (const component in dataMap) {
          if (dataMap.hasOwnProperty(component)) {
            if (!dataByComponent[component]) {
              dataByComponent[component] = {};
            }
            dataByComponent[component][simName] = dataMap[component];

            // fill in simulation based data
            simObject.components.push(component);
            simObject.components = _.uniq(simObject.components);
          }
        }
      });

      // log to our server from the browser
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.error(`${sim} PAGE ERROR:`, msg.text());
        } else {
          console.log(`${sim} PAGE LOG:`, msg.text());
        }
      });
      page.on('error', error => {
        console.error('PAGE ERROR:', error);
      });
      page.on('pageerror', error => {
        console.error('PAGE ERROR:', error);
      });

      // navigate to the sim page
      const url = `${baseURL}${sim}/${sim}_en.html?brand=phet&ea&postMessageOnLoad&binder`;
      console.log(`\nloading: ${sim}`);
      await page.goto(url);

      // Add a listener such that when the sim posts a message saying that it has loaded,
      // get the InstanceRegistry's mapping of components for this sim
      await page.evaluate(sim => {
        return new Promise((resolve, reject) => {
          window.addEventListener('message', event => {
            if (event.data) {
              try {
                const messageData = JSON.parse(event.data);
                if (messageData.type === 'load') {
                  console.log('loaded', sim);
                  if (phet.phetCore.InstanceRegistry) {
                    window.updateComponentData(sim, phet.phetCore.InstanceRegistry.map);
                    resolve();
                  } else {
                    console.error('InstanceRegistry not defined. This normally means no components are in this sim.');
                    resolve(undefined);
                  }
                }
              } catch (e) {
                // message isn't what we wanted it to be, so ignore it
                console.log('CAUGHT ERROR:', e.message);
              }
            } else {
              console.log('no data on message event');
            }
          });
          setTimeout(() => {
            console.log('sim load timeout, moving on');
            resolve(undefined);
          }, 20000);
        });
      }, sim);
      await page.close();
    }
    await browser.close();
    const outputObject = {
      components: dataByComponent,
      sims: dataBySim
    };

    // TODO: is this the best place for this? see https://github.com/phetsims/binder/issues/28
    // write data to a file so that we don't have to run this so often for quick iteration.
    fs.writeFileSync(`${__dirname}/../binderjson.json`, JSON.stringify(outputObject, null, 2));

    // TODO: is it weird to return an object that is by sim THEN by component. createHTML should probably take a data struture based on component at the top level. see https://github.com/phetsims/binder/issues/28
    return outputObject;
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsImFzc2VydCIsImZzIiwicHVwcGV0ZWVyIiwid2l0aFNlcnZlciIsImdldFNpbXMiLCJyZWFkRmlsZVN5bmMiLCJfX2Rpcm5hbWUiLCJ0b1N0cmluZyIsInRyaW0iLCJzcGxpdCIsIm1hcCIsInNpbSIsIm1vZHVsZSIsImV4cG9ydHMiLCJjb21tYW5kTGluZVNpbXMiLCJwb3J0IiwiYmFzZVVSTCIsImJyb3dzZXIiLCJsYXVuY2giLCJkYXRhQnlDb21wb25lbnQiLCJkYXRhQnlTaW0iLCJzaW1zIiwiY29uc29sZSIsImxvZyIsImpvaW4iLCJwYWdlIiwibmV3UGFnZSIsImV4cG9zZUZ1bmN0aW9uIiwic2ltTmFtZSIsImRhdGFNYXAiLCJzaW1PYmplY3QiLCJuYW1lIiwiY29tcG9uZW50cyIsImNvbXBvbmVudCIsImhhc093blByb3BlcnR5IiwicHVzaCIsInVuaXEiLCJvbiIsIm1zZyIsInR5cGUiLCJlcnJvciIsInRleHQiLCJ1cmwiLCJnb3RvIiwiZXZhbHVhdGUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImRhdGEiLCJtZXNzYWdlRGF0YSIsIkpTT04iLCJwYXJzZSIsInBoZXQiLCJwaGV0Q29yZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJ1cGRhdGVDb21wb25lbnREYXRhIiwidW5kZWZpbmVkIiwiZSIsIm1lc3NhZ2UiLCJzZXRUaW1lb3V0IiwiY2xvc2UiLCJvdXRwdXRPYmplY3QiLCJ3cml0ZUZpbGVTeW5jIiwic3RyaW5naWZ5Il0sInNvdXJjZXMiOlsiZ2V0RnJvbVNpbUluTWFzdGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJ1bnMgYWxsIHNpbXMgdG8gZ2V0IHJ1bnRpbWUgaW5mb3JtYXRpb24uIFJldHVybiB0aGUgZGF0YSBvYmplY3QgYmFzZWQgb24gdGhlIHNpbXMgcnVuIGluIG1hc3Rlci5cclxuICpcclxuICogQ3VycmVudGx5IHRoZSBkYXRhIHN0cnVjdHVyZSByZXR1cm5lZCBpcyBhbiBvYmplY3Qgd2hlcmUga2V5cyBhcmUgdGhlIHNpbXMsIGFuZCB0aGUgdmFsdWUgaXMgYW4gb2JqZWN0IHdoZXJlIHRoZVxyXG4gKiBrZXkgaXMgdGhlIGNvbXBvbmVudCBuYW1lIGkuZS4gYHt7cmVwb05hbWV9fS97e2NvbXBvbmVudE5hbWV9fSwgYW5kIHRoZSB2YWx1ZSBpcyBhIGxpc3Qgb2YgZGF0YVVSTCBpbWFnZXMuXHJcbiAqXHJcbiAqXHJcbiAqIFRoaXMgZmlsZSByZWxpZXMgaGVhdmlseSBvbiBwaGV0LWNvcmUncyBgSW5zdGFuY2VSZWdpc3RyeS5qc2AgdG8gY29tbXVuaWNhdGUgd2l0aCBzaW1zIGR1cmluZyBydW50aW1lLiBUbyBnZXQgZGF0YVxyXG4gKiBhbmQgcGljdHVyZXMgYWJvdXQgYSBjb21wb25lbnQgaW4gdGhlIHNpbSwgdGhhdCBjb21wb25lbnQgd2lsbCBuZWVkIHRvIGJlIHJlZ2lzdGVyZWQsIHNlZSBDb21ib0JveC5qcyBhcyBhbiBleGFtcGxlLiAuIC5cclxuICogU29tZXRoaW5nIGxpa2U6IGBcclxuICogLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXHJcbiAqIGFzc2VydCAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3N1bicsICdDb21ib0JveCcsIHRoaXMgKTtcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcblxyXG4vLyBtb2R1bGVzXHJcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xyXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xyXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcclxuY29uc3QgcHVwcGV0ZWVyID0gcmVxdWlyZSggJ3B1cHBldGVlcicgKTtcclxuY29uc3Qgd2l0aFNlcnZlciA9IHJlcXVpcmUoICcuLi8uLi9wZXJlbm5pYWwvanMvY29tbW9uL3dpdGhTZXJ2ZXInICk7XHJcblxyXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gZ2V0IHRoZSBzaW0gbGlzdCBmcm9tIHBlcmVubmlhbFxyXG5jb25zdCBnZXRTaW1zID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyggYCR7X19kaXJuYW1lfS8uLi8uLi9wZXJlbm5pYWwvZGF0YS9hY3RpdmUtc2ltc2AgKS50b1N0cmluZygpLnRyaW0oKS5zcGxpdCggJ1xcbicgKS5tYXAoIHNpbSA9PiBzaW0udHJpbSgpICk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGNvbW1hbmRMaW5lU2ltcyA9PiB7XHJcblxyXG4gIHJldHVybiB3aXRoU2VydmVyKCBhc3luYyBwb3J0ID0+IHtcclxuXHJcbiAgICBjb25zdCBiYXNlVVJMID0gYGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fS9gO1xyXG4gICAgY29uc3QgYnJvd3NlciA9IGF3YWl0IHB1cHBldGVlci5sYXVuY2goKTtcclxuXHJcbiAgICBjb25zdCBkYXRhQnlDb21wb25lbnQgPSB7fTtcclxuICAgIGNvbnN0IGRhdGFCeVNpbSA9IHt9O1xyXG5cclxuICAgIC8vIG92ZXJyaWRlIHRvIGdlbmVyYXRlIGJhc2VkIG9uIG9ubHkgc2ltcyBwcm92aWRlZFxyXG4gICAgY29uc3Qgc2ltcyA9IGNvbW1hbmRMaW5lU2ltcyA/IGNvbW1hbmRMaW5lU2ltcy5zcGxpdCggJywnICkgOiBnZXRTaW1zKCk7XHJcbiAgICBjb25zb2xlLmxvZyggJ3NpbXMgdG8gbG9hZDonLCBzaW1zLmpvaW4oICcsICcgKSApO1xyXG5cclxuICAgIGZvciAoIGNvbnN0IHNpbSBvZiBzaW1zICkge1xyXG5cclxuICAgICAgY29uc3QgcGFnZSA9IGF3YWl0IGJyb3dzZXIubmV3UGFnZSgpO1xyXG5cclxuICAgICAgYXdhaXQgcGFnZS5leHBvc2VGdW5jdGlvbiggJ3VwZGF0ZUNvbXBvbmVudERhdGEnLCAoIHNpbU5hbWUsIGRhdGFNYXAgKSA9PiB7XHJcbiAgICAgICAgYXNzZXJ0KCAhZGF0YUJ5U2ltWyBzaW0gXSwgJ3NpbSBhbHJlYWR5IGV4aXN0cz8nICk7XHJcblxyXG4gICAgICAgIGRhdGFCeVNpbVsgc2ltIF0gPSB7fTtcclxuICAgICAgICBjb25zdCBzaW1PYmplY3QgPSBkYXRhQnlTaW1bIHNpbSBdO1xyXG4gICAgICAgIHNpbU9iamVjdC5uYW1lID0gc2ltO1xyXG4gICAgICAgIHNpbU9iamVjdC5jb21wb25lbnRzID0gW107XHJcblxyXG4gICAgICAgIGZvciAoIGNvbnN0IGNvbXBvbmVudCBpbiBkYXRhTWFwICkge1xyXG4gICAgICAgICAgaWYgKCBkYXRhTWFwLmhhc093blByb3BlcnR5KCBjb21wb25lbnQgKSApIHtcclxuXHJcblxyXG4gICAgICAgICAgICBpZiAoICFkYXRhQnlDb21wb25lbnRbIGNvbXBvbmVudCBdICkge1xyXG4gICAgICAgICAgICAgIGRhdGFCeUNvbXBvbmVudFsgY29tcG9uZW50IF0gPSB7fTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZGF0YUJ5Q29tcG9uZW50WyBjb21wb25lbnQgXVsgc2ltTmFtZSBdID0gZGF0YU1hcFsgY29tcG9uZW50IF07XHJcblxyXG5cclxuICAgICAgICAgICAgLy8gZmlsbCBpbiBzaW11bGF0aW9uIGJhc2VkIGRhdGFcclxuICAgICAgICAgICAgc2ltT2JqZWN0LmNvbXBvbmVudHMucHVzaCggY29tcG9uZW50ICk7XHJcbiAgICAgICAgICAgIHNpbU9iamVjdC5jb21wb25lbnRzID0gXy51bmlxKCBzaW1PYmplY3QuY29tcG9uZW50cyApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gbG9nIHRvIG91ciBzZXJ2ZXIgZnJvbSB0aGUgYnJvd3NlclxyXG4gICAgICBwYWdlLm9uKCAnY29uc29sZScsIG1zZyA9PiB7XHJcbiAgICAgICAgaWYgKCBtc2cudHlwZSgpID09PSAnZXJyb3InICkge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvciggYCR7c2ltfSBQQUdFIEVSUk9SOmAsIG1zZy50ZXh0KCkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggYCR7c2ltfSBQQUdFIExPRzpgLCBtc2cudGV4dCgpICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBwYWdlLm9uKCAnZXJyb3InLCBlcnJvciA9PiB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvciggJ1BBR0UgRVJST1I6JywgZXJyb3IgKTtcclxuICAgICAgfSApO1xyXG4gICAgICBwYWdlLm9uKCAncGFnZWVycm9yJywgZXJyb3IgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoICdQQUdFIEVSUk9SOicsIGVycm9yICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIG5hdmlnYXRlIHRvIHRoZSBzaW0gcGFnZVxyXG4gICAgICBjb25zdCB1cmwgPSBgJHtiYXNlVVJMfSR7c2ltfS8ke3NpbX1fZW4uaHRtbD9icmFuZD1waGV0JmVhJnBvc3RNZXNzYWdlT25Mb2FkJmJpbmRlcmA7XHJcbiAgICAgIGNvbnNvbGUubG9nKCBgXFxubG9hZGluZzogJHtzaW19YCApO1xyXG4gICAgICBhd2FpdCBwYWdlLmdvdG8oIHVybCApO1xyXG5cclxuICAgICAgLy8gQWRkIGEgbGlzdGVuZXIgc3VjaCB0aGF0IHdoZW4gdGhlIHNpbSBwb3N0cyBhIG1lc3NhZ2Ugc2F5aW5nIHRoYXQgaXQgaGFzIGxvYWRlZCxcclxuICAgICAgLy8gZ2V0IHRoZSBJbnN0YW5jZVJlZ2lzdHJ5J3MgbWFwcGluZyBvZiBjb21wb25lbnRzIGZvciB0aGlzIHNpbVxyXG4gICAgICBhd2FpdCBwYWdlLmV2YWx1YXRlKCBzaW0gPT4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XHJcblxyXG4gICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtZXNzYWdlJywgZXZlbnQgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIGV2ZW50LmRhdGEgKSB7XHJcbiAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VEYXRhID0gSlNPTi5wYXJzZSggZXZlbnQuZGF0YSApO1xyXG4gICAgICAgICAgICAgICAgaWYgKCBtZXNzYWdlRGF0YS50eXBlID09PSAnbG9hZCcgKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnbG9hZGVkJywgc2ltICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICBpZiAoIHBoZXQucGhldENvcmUuSW5zdGFuY2VSZWdpc3RyeSApIHtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cudXBkYXRlQ29tcG9uZW50RGF0YSggc2ltLCBwaGV0LnBoZXRDb3JlLkluc3RhbmNlUmVnaXN0cnkubWFwICk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoICdJbnN0YW5jZVJlZ2lzdHJ5IG5vdCBkZWZpbmVkLiBUaGlzIG5vcm1hbGx5IG1lYW5zIG5vIGNvbXBvbmVudHMgYXJlIGluIHRoaXMgc2ltLicgKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCB1bmRlZmluZWQgKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBjYXRjaCggZSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBtZXNzYWdlIGlzbid0IHdoYXQgd2Ugd2FudGVkIGl0IHRvIGJlLCBzbyBpZ25vcmUgaXRcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnQ0FVR0hUIEVSUk9SOicsIGUubWVzc2FnZSApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ25vIGRhdGEgb24gbWVzc2FnZSBldmVudCcgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAgIHNldFRpbWVvdXQoICgpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coICdzaW0gbG9hZCB0aW1lb3V0LCBtb3Zpbmcgb24nICk7XHJcbiAgICAgICAgICAgIHJlc29sdmUoIHVuZGVmaW5lZCApO1xyXG4gICAgICAgICAgfSwgMjAwMDAgKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0sIHNpbSApO1xyXG4gICAgICBhd2FpdCBwYWdlLmNsb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXdhaXQgYnJvd3Nlci5jbG9zZSgpO1xyXG5cclxuICAgIGNvbnN0IG91dHB1dE9iamVjdCA9IHtcclxuICAgICAgY29tcG9uZW50czogZGF0YUJ5Q29tcG9uZW50LFxyXG4gICAgICBzaW1zOiBkYXRhQnlTaW1cclxuICAgIH07XHJcblxyXG4gICAgLy8gVE9ETzogaXMgdGhpcyB0aGUgYmVzdCBwbGFjZSBmb3IgdGhpcz8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iaW5kZXIvaXNzdWVzLzI4XHJcbiAgICAvLyB3cml0ZSBkYXRhIHRvIGEgZmlsZSBzbyB0aGF0IHdlIGRvbid0IGhhdmUgdG8gcnVuIHRoaXMgc28gb2Z0ZW4gZm9yIHF1aWNrIGl0ZXJhdGlvbi5cclxuICAgIGZzLndyaXRlRmlsZVN5bmMoIGAke19fZGlybmFtZX0vLi4vYmluZGVyanNvbi5qc29uYCwgSlNPTi5zdHJpbmdpZnkoIG91dHB1dE9iamVjdCwgbnVsbCwgMiApICk7XHJcblxyXG4gICAgLy8gVE9ETzogaXMgaXQgd2VpcmQgdG8gcmV0dXJuIGFuIG9iamVjdCB0aGF0IGlzIGJ5IHNpbSBUSEVOIGJ5IGNvbXBvbmVudC4gY3JlYXRlSFRNTCBzaG91bGQgcHJvYmFibHkgdGFrZSBhIGRhdGEgc3RydXR1cmUgYmFzZWQgb24gY29tcG9uZW50IGF0IHRoZSB0b3AgbGV2ZWwuIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYmluZGVyL2lzc3Vlcy8yOFxyXG4gICAgcmV0dXJuIG91dHB1dE9iamVjdDtcclxuICB9ICk7XHJcbn07XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0E7QUFDQSxNQUFNQSxDQUFDLEdBQUdDLE9BQU8sQ0FBRSxRQUFTLENBQUM7QUFDN0IsTUFBTUMsTUFBTSxHQUFHRCxPQUFPLENBQUUsUUFBUyxDQUFDO0FBQ2xDLE1BQU1FLEVBQUUsR0FBR0YsT0FBTyxDQUFFLElBQUssQ0FBQztBQUMxQixNQUFNRyxTQUFTLEdBQUdILE9BQU8sQ0FBRSxXQUFZLENBQUM7QUFDeEMsTUFBTUksVUFBVSxHQUFHSixPQUFPLENBQUUsc0NBQXVDLENBQUM7O0FBRXBFO0FBQ0EsTUFBTUssT0FBTyxHQUFHLFNBQUFBLENBQUEsRUFBVztFQUN6QixPQUFPSCxFQUFFLENBQUNJLFlBQVksQ0FBRyxHQUFFQyxTQUFVLG1DQUFtQyxDQUFDLENBQUNDLFFBQVEsQ0FBQyxDQUFDLENB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