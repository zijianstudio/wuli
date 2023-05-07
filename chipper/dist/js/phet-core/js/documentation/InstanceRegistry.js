// Copyright 2018-2022, University of Colorado Boulder

/**
 * Tracks object allocations for reporting using binder.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import phetCore from '../phetCore.js';

// constants
const map = {};
class InstanceRegistry {
  /**
   * Adds a screenshot of the given scenery Node
   * @param {string} repoName
   * @param {string} typeName
   * @param {../../../scenery/js/nodes/Node} instance
   * @public
   */
  static registerDataURL(repoName, typeName, instance) {
    if (phet.chipper.queryParameters.binder) {
      // Create the map if we haven't seen that component type before
      const key = `${repoName}/${typeName}`;
      map[key] = map[key] || [];
      try {
        instance.toDataURL(dataURL => {
          map[key].push(dataURL);
        });
      } catch (e) {

        // Ignore nodes that don't draw anything
        // TODO https://github.com/phetsims/phet-core/issues/80 is this masking a problem?
      }
    }
  }
}

/**
 * @public (read-only) - used by puppeteer in binder
 */
InstanceRegistry.map = map;
phetCore.register('InstanceRegistry', InstanceRegistry);
export default InstanceRegistry;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsIm1hcCIsIkluc3RhbmNlUmVnaXN0cnkiLCJyZWdpc3RlckRhdGFVUkwiLCJyZXBvTmFtZSIsInR5cGVOYW1lIiwiaW5zdGFuY2UiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsImtleSIsInRvRGF0YVVSTCIsImRhdGFVUkwiLCJwdXNoIiwiZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSW5zdGFuY2VSZWdpc3RyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUcmFja3Mgb2JqZWN0IGFsbG9jYXRpb25zIGZvciByZXBvcnRpbmcgdXNpbmcgYmluZGVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuLi9waGV0Q29yZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgbWFwID0ge307XHJcblxyXG5jbGFzcyBJbnN0YW5jZVJlZ2lzdHJ5IHtcclxuICAvKipcclxuICAgKiBBZGRzIGEgc2NyZWVuc2hvdCBvZiB0aGUgZ2l2ZW4gc2NlbmVyeSBOb2RlXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlcG9OYW1lXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVOYW1lXHJcbiAgICogQHBhcmFtIHsuLi8uLi8uLi9zY2VuZXJ5L2pzL25vZGVzL05vZGV9IGluc3RhbmNlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0YXRpYyByZWdpc3RlckRhdGFVUkwoIHJlcG9OYW1lLCB0eXBlTmFtZSwgaW5zdGFuY2UgKSB7XHJcbiAgICBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuYmluZGVyICkge1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgaWYgd2UgaGF2ZW4ndCBzZWVuIHRoYXQgY29tcG9uZW50IHR5cGUgYmVmb3JlXHJcbiAgICAgIGNvbnN0IGtleSA9IGAke3JlcG9OYW1lfS8ke3R5cGVOYW1lfWA7XHJcbiAgICAgIG1hcFsga2V5IF0gPSBtYXBbIGtleSBdIHx8IFtdO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpbnN0YW5jZS50b0RhdGFVUkwoIGRhdGFVUkwgPT4ge1xyXG4gICAgICAgICAgbWFwWyBrZXkgXS5wdXNoKCBkYXRhVVJMICk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICAgIGNhdGNoKCBlICkge1xyXG5cclxuICAgICAgICAvLyBJZ25vcmUgbm9kZXMgdGhhdCBkb24ndCBkcmF3IGFueXRoaW5nXHJcbiAgICAgICAgLy8gVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1jb3JlL2lzc3Vlcy84MCBpcyB0aGlzIG1hc2tpbmcgYSBwcm9ibGVtP1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQHB1YmxpYyAocmVhZC1vbmx5KSAtIHVzZWQgYnkgcHVwcGV0ZWVyIGluIGJpbmRlclxyXG4gKi9cclxuSW5zdGFuY2VSZWdpc3RyeS5tYXAgPSBtYXA7XHJcblxyXG5waGV0Q29yZS5yZWdpc3RlciggJ0luc3RhbmNlUmVnaXN0cnknLCBJbnN0YW5jZVJlZ2lzdHJ5ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBJbnN0YW5jZVJlZ2lzdHJ5OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sZ0JBQWdCOztBQUVyQztBQUNBLE1BQU1DLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFFZCxNQUFNQyxnQkFBZ0IsQ0FBQztFQUNyQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9DLGVBQWVBLENBQUVDLFFBQVEsRUFBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUc7SUFDckQsSUFBS0MsSUFBSSxDQUFDQyxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsTUFBTSxFQUFHO01BRXpDO01BQ0EsTUFBTUMsR0FBRyxHQUFJLEdBQUVQLFFBQVMsSUFBR0MsUUFBUyxFQUFDO01BQ3JDSixHQUFHLENBQUVVLEdBQUcsQ0FBRSxHQUFHVixHQUFHLENBQUVVLEdBQUcsQ0FBRSxJQUFJLEVBQUU7TUFFN0IsSUFBSTtRQUNGTCxRQUFRLENBQUNNLFNBQVMsQ0FBRUMsT0FBTyxJQUFJO1VBQzdCWixHQUFHLENBQUVVLEdBQUcsQ0FBRSxDQUFDRyxJQUFJLENBQUVELE9BQVEsQ0FBQztRQUM1QixDQUFFLENBQUM7TUFDTCxDQUFDLENBQ0QsT0FBT0UsQ0FBQyxFQUFHOztRQUVUO1FBQ0E7TUFBQTtJQUVKO0VBQ0Y7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQWIsZ0JBQWdCLENBQUNELEdBQUcsR0FBR0EsR0FBRztBQUUxQkQsUUFBUSxDQUFDZ0IsUUFBUSxDQUFFLGtCQUFrQixFQUFFZCxnQkFBaUIsQ0FBQztBQUV6RCxlQUFlQSxnQkFBZ0IifQ==