// Copyright 2018-2022, University of Colorado Boulder

/**
 * Main launch point for the documentation generation
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

const createHTMLString = require('./createHTMLString');
const fs = require('fs');
const fsExtra = require('fs-extra'); // eslint-disable-line require-statement-match
const getFromSimInMaster = require('./getFromSimInMaster');

// resolve image and doc paths as constants

// constants
const OUTPUT_FILE = `${__dirname}/../docs/index.html`;
const myArgs = process.argv.slice(2);
const commandLineSims = myArgs[0]; // Allow comma-separated list of sims

console.log(`streaming to ${OUTPUT_FILE}`);

// Copy image files
try {
  // TODO: this assumes we only need image from two repos, see https://github.com/phetsims/binder/issues/28
  fsExtra.copySync(`${__dirname}/../../sun/doc/images`, `${__dirname}/../docs/images/sun`);
  fsExtra.copySync(`${__dirname}/../../scenery-phet/images`, `${__dirname}/../docs/images/scenery-phet`);
} catch (err) {
  console.error(err);
  console.error('\x1b[37m'); // reset back to white text.
}

(async () => {
  // Run all sims, get a list of pictures for a sim for a component.
  const componentDataBySim = await getFromSimInMaster(commandLineSims);
  const HTML = createHTMLString(componentDataBySim);

  // fs.writeFileSync( 'binderjson.json', JSON.stringify( componentDataBySim, null, 2 ) );
  fs.writeFileSync(OUTPUT_FILE, HTML);
  console.log(`wrote final report to:  ${OUTPUT_FILE}`);
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVIVE1MU3RyaW5nIiwicmVxdWlyZSIsImZzIiwiZnNFeHRyYSIsImdldEZyb21TaW1Jbk1hc3RlciIsIk9VVFBVVF9GSUxFIiwiX19kaXJuYW1lIiwibXlBcmdzIiwicHJvY2VzcyIsImFyZ3YiLCJzbGljZSIsImNvbW1hbmRMaW5lU2ltcyIsImNvbnNvbGUiLCJsb2ciLCJjb3B5U3luYyIsImVyciIsImVycm9yIiwiY29tcG9uZW50RGF0YUJ5U2ltIiwiSFRNTCIsIndyaXRlRmlsZVN5bmMiXSwic291cmNlcyI6WyJnZW5lcmF0ZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGxhdW5jaCBwb2ludCBmb3IgdGhlIGRvY3VtZW50YXRpb24gZ2VuZXJhdGlvblxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuXHJcbmNvbnN0IGNyZWF0ZUhUTUxTdHJpbmcgPSByZXF1aXJlKCAnLi9jcmVhdGVIVE1MU3RyaW5nJyApO1xyXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcclxuY29uc3QgZnNFeHRyYSA9IHJlcXVpcmUoICdmcy1leHRyYScgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZXF1aXJlLXN0YXRlbWVudC1tYXRjaFxyXG5jb25zdCBnZXRGcm9tU2ltSW5NYXN0ZXIgPSByZXF1aXJlKCAnLi9nZXRGcm9tU2ltSW5NYXN0ZXInICk7XHJcblxyXG4vLyByZXNvbHZlIGltYWdlIGFuZCBkb2MgcGF0aHMgYXMgY29uc3RhbnRzXHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgT1VUUFVUX0ZJTEUgPSBgJHtfX2Rpcm5hbWV9Ly4uL2RvY3MvaW5kZXguaHRtbGA7XHJcblxyXG5jb25zdCBteUFyZ3MgPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoIDIgKTtcclxuXHJcbmNvbnN0IGNvbW1hbmRMaW5lU2ltcyA9IG15QXJnc1sgMCBdOyAvLyBBbGxvdyBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBzaW1zXHJcblxyXG5jb25zb2xlLmxvZyggYHN0cmVhbWluZyB0byAke09VVFBVVF9GSUxFfWAgKTtcclxuXHJcbi8vIENvcHkgaW1hZ2UgZmlsZXNcclxudHJ5IHtcclxuXHJcbiAgLy8gVE9ETzogdGhpcyBhc3N1bWVzIHdlIG9ubHkgbmVlZCBpbWFnZSBmcm9tIHR3byByZXBvcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iaW5kZXIvaXNzdWVzLzI4XHJcbiAgZnNFeHRyYS5jb3B5U3luYyggYCR7X19kaXJuYW1lfS8uLi8uLi9zdW4vZG9jL2ltYWdlc2AsIGAke19fZGlybmFtZX0vLi4vZG9jcy9pbWFnZXMvc3VuYCApO1xyXG4gIGZzRXh0cmEuY29weVN5bmMoIGAke19fZGlybmFtZX0vLi4vLi4vc2NlbmVyeS1waGV0L2ltYWdlc2AsIGAke19fZGlybmFtZX0vLi4vZG9jcy9pbWFnZXMvc2NlbmVyeS1waGV0YCApO1xyXG59XHJcbmNhdGNoKCBlcnIgKSB7XHJcbiAgY29uc29sZS5lcnJvciggZXJyICk7XHJcbiAgY29uc29sZS5lcnJvciggJ1xceDFiWzM3bScgKTsgLy8gcmVzZXQgYmFjayB0byB3aGl0ZSB0ZXh0LlxyXG59XHJcblxyXG4oIGFzeW5jICgpID0+IHtcclxuXHJcbiAgLy8gUnVuIGFsbCBzaW1zLCBnZXQgYSBsaXN0IG9mIHBpY3R1cmVzIGZvciBhIHNpbSBmb3IgYSBjb21wb25lbnQuXHJcbiAgY29uc3QgY29tcG9uZW50RGF0YUJ5U2ltID0gYXdhaXQgZ2V0RnJvbVNpbUluTWFzdGVyKCBjb21tYW5kTGluZVNpbXMgKTtcclxuXHJcbiAgY29uc3QgSFRNTCA9IGNyZWF0ZUhUTUxTdHJpbmcoIGNvbXBvbmVudERhdGFCeVNpbSApO1xyXG5cclxuICAvLyBmcy53cml0ZUZpbGVTeW5jKCAnYmluZGVyanNvbi5qc29uJywgSlNPTi5zdHJpbmdpZnkoIGNvbXBvbmVudERhdGFCeVNpbSwgbnVsbCwgMiApICk7XHJcbiAgZnMud3JpdGVGaWxlU3luYyggT1VUUFVUX0ZJTEUsIEhUTUwgKTtcclxuICBjb25zb2xlLmxvZyggYHdyb3RlIGZpbmFsIHJlcG9ydCB0bzogICR7T1VUUFVUX0ZJTEV9YCApO1xyXG59ICkoKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsTUFBTUEsZ0JBQWdCLEdBQUdDLE9BQU8sQ0FBRSxvQkFBcUIsQ0FBQztBQUN4RCxNQUFNQyxFQUFFLEdBQUdELE9BQU8sQ0FBRSxJQUFLLENBQUM7QUFDMUIsTUFBTUUsT0FBTyxHQUFHRixPQUFPLENBQUUsVUFBVyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNRyxrQkFBa0IsR0FBR0gsT0FBTyxDQUFFLHNCQUF1QixDQUFDOztBQUU1RDs7QUFFQTtBQUNBLE1BQU1JLFdBQVcsR0FBSSxHQUFFQyxTQUFVLHFCQUFvQjtBQUVyRCxNQUFNQyxNQUFNLEdBQUdDLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUUsQ0FBRSxDQUFDO0FBRXRDLE1BQU1DLGVBQWUsR0FBR0osTUFBTSxDQUFFLENBQUMsQ0FBRSxDQUFDLENBQUM7O0FBRXJDSyxPQUFPLENBQUNDLEdBQUcsQ0FBRyxnQkFBZVIsV0FBWSxFQUFFLENBQUM7O0FBRTVDO0FBQ0EsSUFBSTtFQUVGO0VBQ0FGLE9BQU8sQ0FBQ1csUUFBUSxDQUFHLEdBQUVSLFNBQVUsdUJBQXNCLEVBQUcsR0FBRUEsU0FBVSxxQkFBcUIsQ0FBQztFQUMxRkgsT0FBTyxDQUFDVyxRQUFRLENBQUcsR0FBRVIsU0FBVSw0QkFBMkIsRUFBRyxHQUFFQSxTQUFVLDhCQUE4QixDQUFDO0FBQzFHLENBQUMsQ0FDRCxPQUFPUyxHQUFHLEVBQUc7RUFDWEgsT0FBTyxDQUFDSSxLQUFLLENBQUVELEdBQUksQ0FBQztFQUNwQkgsT0FBTyxDQUFDSSxLQUFLLENBQUUsVUFBVyxDQUFDLENBQUMsQ0FBQztBQUMvQjs7QUFFQSxDQUFFLFlBQVk7RUFFWjtFQUNBLE1BQU1DLGtCQUFrQixHQUFHLE1BQU1iLGtCQUFrQixDQUFFTyxlQUFnQixDQUFDO0VBRXRFLE1BQU1PLElBQUksR0FBR2xCLGdCQUFnQixDQUFFaUIsa0JBQW1CLENBQUM7O0VBRW5EO0VBQ0FmLEVBQUUsQ0FBQ2lCLGFBQWEsQ0FBRWQsV0FBVyxFQUFFYSxJQUFLLENBQUM7RUFDckNOLE9BQU8sQ0FBQ0MsR0FBRyxDQUFHLDJCQUEwQlIsV0FBWSxFQUFFLENBQUM7QUFDekQsQ0FBQyxFQUFHLENBQUMifQ==