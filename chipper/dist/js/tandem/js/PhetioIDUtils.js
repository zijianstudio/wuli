// Copyright 2017-2022, University of Colorado Boulder

/**
 * Utilities for creating and manipulating the unique identifiers assigned to instrumented PhET-iO instances, aka
 * phetioIDs.
 *
 * Many of these functions' jsdoc is rendered and visible publicly to PhET-iO client. Those sections should be
 * marked, see top level comment in Client.js about private vs public documentation
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */
(function () {
  // define the phetio global
  window.phetio = window.phetio || {};

  // constants
  const SEPARATOR = '.';
  const GROUP_SEPARATOR = '_';
  const INTER_TERM_SEPARATOR = '-';
  const GENERAL_COMPONENT_NAME = 'general';
  const GLOBAL_COMPONENT_NAME = 'global';
  const HOME_SCREEN_COMPONENT_NAME = 'homeScreen';
  const MODEL_COMPONENT_NAME = 'model';
  const VIEW_COMPONENT_NAME = 'view';
  const COLORS_COMPONENT_NAME = 'colors';
  const CONTROLLER_COMPONENT_NAME = 'controller';
  const SCREEN_COMPONENT_NAME = 'Screen';

  /**
   * Helpful methods for manipulating phetioIDs. Used to minimize the amount of duplicated logic specific to the string
   * structure of the phetioID. Available in the main PhET-iO js import.
   * @namespace
   */
  window.phetio.PhetioIDUtils = {
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * Appends a component to an existing phetioID to create a new unique phetioID for the component.
     * @example
     * append( 'myScreen.myControlPanel', 'myComboBox' )
     * -->  'myScreen.myControlPanel.myComboBox'
     * @public
     * @param {string} phetioID - the ID of the PhET-iO element
     * @param {string|string[]} componentNames - the name or list of names to append to the ID
     * @returns {string} - the appended phetioID
     */
    append: function (phetioID, ...componentNames) {
      componentNames.forEach(componentName => {
        assert && assert(componentName.indexOf(SEPARATOR) === -1, `separator appears in componentName: ${componentName}`);
        phetioID += SEPARATOR + componentName;
      });
      return phetioID;
    },
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * Given a phetioID for a PhET-iO element, get the part of that ID that pertains to the component (basically the
     * tail piece).
     * @example
     * getComponentName( 'myScreen.myControlPanel.myComboBox' )
     * -->  'myComboBox'
     * @public
     * @param {string} phetioID - the ID of the PhET-iO element
     * @returns {string} - the component name
     */
    getComponentName: function (phetioID) {
      assert && assert(phetioID.length > 0);
      const indexOfLastSeparator = phetioID.lastIndexOf(SEPARATOR);
      if (indexOfLastSeparator === -1) {
        return phetioID;
      } else {
        return phetioID.substring(indexOfLastSeparator + 1, phetioID.length);
      }
    },
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * Given a phetioID for a PhET-iO element, get the phetioID of the parent component.
     * @example
     * getParentID( 'myScreen.myControlPanel.myComboBox' )
     * -->  'myScreen.myControlPanel'
     * @public
     * @param {string} phetioID - the ID of the PhET-iO element
     * @returns {string|null} - the phetioID of the parent, or null if there is no parent
     */
    getParentID: function (phetioID) {
      const indexOfLastSeparator = phetioID.lastIndexOf(SEPARATOR);
      return indexOfLastSeparator === -1 ? null : phetioID.substring(0, indexOfLastSeparator);
    },
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * Given a phetioID for a instrumented object, get a string that can be used to assign an ID to a DOM element
     * @param {string} phetioID - the ID of the PhET-iO element
     * @returns {string}
     * @public
     */
    getDOMElementID: function (phetioID) {
      return `phetioID:${phetioID}`;
    },
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * Get the screen id from the phetioID.
     * @example
     * getScreenID( 'sim.myScreen.model.property' )
     * --> sim.myScreen
     * getScreenID( 'sim.myScreen' )
     * --> sim.myScreen
     * getScreenID( 'sim.general.activeProperty' )
     * --> null
     * @param {string} phetioID
     * @returns {string|null} - null if there is no screen component name in the phetioID
     */
    getScreenID: function (phetioID) {
      const screenIDParts = [];
      const phetioIDParts = phetioID.split(SEPARATOR);
      for (let i = 0; i < phetioIDParts.length; i++) {
        const componentPart = phetioIDParts[i];
        screenIDParts.push(componentPart);
        const indexOfScreenMarker = componentPart.indexOf(SCREEN_COMPONENT_NAME);
        if (indexOfScreenMarker > 0 && indexOfScreenMarker + SCREEN_COMPONENT_NAME.length === componentPart.length) {
          // endsWith proxy
          return screenIDParts.join(SEPARATOR);
        }
      }
      return null;
    },
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * Get the index number from the component name of the component name provided.
     * @param {string} componentName
     * @returns {number}
     * @example
     * getGroupElementIndex( 'particle_1' )
     * --> 1
     * @public
     */
    getGroupElementIndex: function (componentName) {
      assert && assert(componentName.indexOf(window.phetio.PhetioIDUtils.GROUP_SEPARATOR) >= 0, 'component name for phetioID should have group element syntax');
      return Number(componentName.split(window.phetio.PhetioIDUtils.GROUP_SEPARATOR)[1]);
    },
    /**
     * Returns true if the potential ancestor is indeed an ancestor of the potential descendant, but not the same phetioID
     * @param {string} potentialAncestorPhetioID
     * @param {string} potentialDescendantPhetioID
     * @returns {boolean}
     * @public
     */
    isAncestor: function (potentialAncestorPhetioID, potentialDescendantPhetioID) {
      const ancestorComponents = potentialAncestorPhetioID.split(SEPARATOR);
      const descendantComponents = potentialDescendantPhetioID.split(SEPARATOR);
      for (let i = 0; i < ancestorComponents.length; i++) {
        if (ancestorComponents[i] !== descendantComponents[i]) {
          return false;
        }
      }

      // not the same child
      return potentialDescendantPhetioID !== potentialAncestorPhetioID;
    },
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * The separator used to piece together a phet-io ID.
     * @type {string}
     * @constant
     * @public
     */
    SEPARATOR: SEPARATOR,
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * The separator used to specify the count of a element in a group.
     * @type {string}
     * @constant
     * @public
     */
    GROUP_SEPARATOR: GROUP_SEPARATOR,
    /**
     * The separator used to specify terms in a phetioID that is used by another phetioID. For example:
     *
     * sim.general.view.sim-global-otherID
     *
     * @type {string}
     * @constant
     * @public
     */
    INTER_TERM_SEPARATOR: INTER_TERM_SEPARATOR,
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * The component name for the id section that holds phet-io elements general to all simulations.
     * @type {string}
     * @constant
     * @public
     */
    GENERAL_COMPONENT_NAME: GENERAL_COMPONENT_NAME,
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * The component name for the id section that holds simulation specific elements that don't belong in a screen.
     * @type {string}
     * @constant
     * @public
     */
    GLOBAL_COMPONENT_NAME: GLOBAL_COMPONENT_NAME,
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * The component name for the id section that holds the home screen.
     * @type {string}
     * @constant
     * @public
     */
    HOME_SCREEN_COMPONENT_NAME: HOME_SCREEN_COMPONENT_NAME,
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * The component name for an id section that holds model specific elements.
     * @type {string}
     * @constant
     * @public
     */
    MODEL_COMPONENT_NAME: MODEL_COMPONENT_NAME,
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * The component name for an id section that holds view specific elements.
     * @type {string}
     * @constant
     * @public
     */
    VIEW_COMPONENT_NAME: VIEW_COMPONENT_NAME,
    // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
    /**
     * The component name for an id section that holds controller specific elements.
     * @type {string}
     * @constant
     * @public
     */
    CONTROLLER_COMPONENT_NAME: CONTROLLER_COMPONENT_NAME,
    /**
     * The component name for a section that holds colors
     * @type {string}
     * @constant
     * @public
     */
    COLORS_COMPONENT_NAME: COLORS_COMPONENT_NAME
  };
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ3aW5kb3ciLCJwaGV0aW8iLCJTRVBBUkFUT1IiLCJHUk9VUF9TRVBBUkFUT1IiLCJJTlRFUl9URVJNX1NFUEFSQVRPUiIsIkdFTkVSQUxfQ09NUE9ORU5UX05BTUUiLCJHTE9CQUxfQ09NUE9ORU5UX05BTUUiLCJIT01FX1NDUkVFTl9DT01QT05FTlRfTkFNRSIsIk1PREVMX0NPTVBPTkVOVF9OQU1FIiwiVklFV19DT01QT05FTlRfTkFNRSIsIkNPTE9SU19DT01QT05FTlRfTkFNRSIsIkNPTlRST0xMRVJfQ09NUE9ORU5UX05BTUUiLCJTQ1JFRU5fQ09NUE9ORU5UX05BTUUiLCJQaGV0aW9JRFV0aWxzIiwiYXBwZW5kIiwicGhldGlvSUQiLCJjb21wb25lbnROYW1lcyIsImZvckVhY2giLCJjb21wb25lbnROYW1lIiwiYXNzZXJ0IiwiaW5kZXhPZiIsImdldENvbXBvbmVudE5hbWUiLCJsZW5ndGgiLCJpbmRleE9mTGFzdFNlcGFyYXRvciIsImxhc3RJbmRleE9mIiwic3Vic3RyaW5nIiwiZ2V0UGFyZW50SUQiLCJnZXRET01FbGVtZW50SUQiLCJnZXRTY3JlZW5JRCIsInNjcmVlbklEUGFydHMiLCJwaGV0aW9JRFBhcnRzIiwic3BsaXQiLCJpIiwiY29tcG9uZW50UGFydCIsInB1c2giLCJpbmRleE9mU2NyZWVuTWFya2VyIiwiam9pbiIsImdldEdyb3VwRWxlbWVudEluZGV4IiwiTnVtYmVyIiwiaXNBbmNlc3RvciIsInBvdGVudGlhbEFuY2VzdG9yUGhldGlvSUQiLCJwb3RlbnRpYWxEZXNjZW5kYW50UGhldGlvSUQiLCJhbmNlc3RvckNvbXBvbmVudHMiLCJkZXNjZW5kYW50Q29tcG9uZW50cyJdLCJzb3VyY2VzIjpbIlBoZXRpb0lEVXRpbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVXRpbGl0aWVzIGZvciBjcmVhdGluZyBhbmQgbWFuaXB1bGF0aW5nIHRoZSB1bmlxdWUgaWRlbnRpZmllcnMgYXNzaWduZWQgdG8gaW5zdHJ1bWVudGVkIFBoRVQtaU8gaW5zdGFuY2VzLCBha2FcclxuICogcGhldGlvSURzLlxyXG4gKlxyXG4gKiBNYW55IG9mIHRoZXNlIGZ1bmN0aW9ucycganNkb2MgaXMgcmVuZGVyZWQgYW5kIHZpc2libGUgcHVibGljbHkgdG8gUGhFVC1pTyBjbGllbnQuIFRob3NlIHNlY3Rpb25zIHNob3VsZCBiZVxyXG4gKiBtYXJrZWQsIHNlZSB0b3AgbGV2ZWwgY29tbWVudCBpbiBDbGllbnQuanMgYWJvdXQgcHJpdmF0ZSB2cyBwdWJsaWMgZG9jdW1lbnRhdGlvblxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuKCBmdW5jdGlvbigpIHtcclxuICBcclxuXHJcbiAgLy8gZGVmaW5lIHRoZSBwaGV0aW8gZ2xvYmFsXHJcbiAgd2luZG93LnBoZXRpbyA9IHdpbmRvdy5waGV0aW8gfHwge307XHJcblxyXG4gIC8vIGNvbnN0YW50c1xyXG4gIGNvbnN0IFNFUEFSQVRPUiA9ICcuJztcclxuICBjb25zdCBHUk9VUF9TRVBBUkFUT1IgPSAnXyc7XHJcbiAgY29uc3QgSU5URVJfVEVSTV9TRVBBUkFUT1IgPSAnLSc7XHJcbiAgY29uc3QgR0VORVJBTF9DT01QT05FTlRfTkFNRSA9ICdnZW5lcmFsJztcclxuICBjb25zdCBHTE9CQUxfQ09NUE9ORU5UX05BTUUgPSAnZ2xvYmFsJztcclxuICBjb25zdCBIT01FX1NDUkVFTl9DT01QT05FTlRfTkFNRSA9ICdob21lU2NyZWVuJztcclxuICBjb25zdCBNT0RFTF9DT01QT05FTlRfTkFNRSA9ICdtb2RlbCc7XHJcbiAgY29uc3QgVklFV19DT01QT05FTlRfTkFNRSA9ICd2aWV3JztcclxuICBjb25zdCBDT0xPUlNfQ09NUE9ORU5UX05BTUUgPSAnY29sb3JzJztcclxuICBjb25zdCBDT05UUk9MTEVSX0NPTVBPTkVOVF9OQU1FID0gJ2NvbnRyb2xsZXInO1xyXG4gIGNvbnN0IFNDUkVFTl9DT01QT05FTlRfTkFNRSA9ICdTY3JlZW4nO1xyXG5cclxuICAvKipcclxuICAgKiBIZWxwZnVsIG1ldGhvZHMgZm9yIG1hbmlwdWxhdGluZyBwaGV0aW9JRHMuIFVzZWQgdG8gbWluaW1pemUgdGhlIGFtb3VudCBvZiBkdXBsaWNhdGVkIGxvZ2ljIHNwZWNpZmljIHRvIHRoZSBzdHJpbmdcclxuICAgKiBzdHJ1Y3R1cmUgb2YgdGhlIHBoZXRpb0lELiBBdmFpbGFibGUgaW4gdGhlIG1haW4gUGhFVC1pTyBqcyBpbXBvcnQuXHJcbiAgICogQG5hbWVzcGFjZVxyXG4gICAqL1xyXG4gIHdpbmRvdy5waGV0aW8uUGhldGlvSURVdGlscyA9IHtcclxuXHJcbiAgICAvLyBQcml2YXRlIERvYzogVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cclxuICAgIC8qKlxyXG4gICAgICogQXBwZW5kcyBhIGNvbXBvbmVudCB0byBhbiBleGlzdGluZyBwaGV0aW9JRCB0byBjcmVhdGUgYSBuZXcgdW5pcXVlIHBoZXRpb0lEIGZvciB0aGUgY29tcG9uZW50LlxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGFwcGVuZCggJ215U2NyZWVuLm15Q29udHJvbFBhbmVsJywgJ215Q29tYm9Cb3gnIClcclxuICAgICAqIC0tPiAgJ215U2NyZWVuLm15Q29udHJvbFBhbmVsLm15Q29tYm9Cb3gnXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGhldGlvSUQgLSB0aGUgSUQgb2YgdGhlIFBoRVQtaU8gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8c3RyaW5nW119IGNvbXBvbmVudE5hbWVzIC0gdGhlIG5hbWUgb3IgbGlzdCBvZiBuYW1lcyB0byBhcHBlbmQgdG8gdGhlIElEXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIHRoZSBhcHBlbmRlZCBwaGV0aW9JRFxyXG4gICAgICovXHJcbiAgICBhcHBlbmQ6IGZ1bmN0aW9uKCBwaGV0aW9JRCwgLi4uY29tcG9uZW50TmFtZXMgKSB7XHJcbiAgICAgIGNvbXBvbmVudE5hbWVzLmZvckVhY2goIGNvbXBvbmVudE5hbWUgPT4ge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbXBvbmVudE5hbWUuaW5kZXhPZiggU0VQQVJBVE9SICkgPT09IC0xLCBgc2VwYXJhdG9yIGFwcGVhcnMgaW4gY29tcG9uZW50TmFtZTogJHtjb21wb25lbnROYW1lfWAgKTtcclxuICAgICAgICBwaGV0aW9JRCArPSBTRVBBUkFUT1IgKyBjb21wb25lbnROYW1lO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHJldHVybiBwaGV0aW9JRDtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gUHJpdmF0ZSBEb2M6IFRoZSBiZWxvdyBqc2RvYyBpcyBwdWJsaWMgdG8gdGhlIFBoRVQtaU8gQVBJIGRvY3VtZW50YXRpb24uIENoYW5nZSB3aXNlbHkuXHJcbiAgICAvKipcclxuICAgICAqIEdpdmVuIGEgcGhldGlvSUQgZm9yIGEgUGhFVC1pTyBlbGVtZW50LCBnZXQgdGhlIHBhcnQgb2YgdGhhdCBJRCB0aGF0IHBlcnRhaW5zIHRvIHRoZSBjb21wb25lbnQgKGJhc2ljYWxseSB0aGVcclxuICAgICAqIHRhaWwgcGllY2UpLlxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGdldENvbXBvbmVudE5hbWUoICdteVNjcmVlbi5teUNvbnRyb2xQYW5lbC5teUNvbWJvQm94JyApXHJcbiAgICAgKiAtLT4gICdteUNvbWJvQm94J1xyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBoZXRpb0lEIC0gdGhlIElEIG9mIHRoZSBQaEVULWlPIGVsZW1lbnRcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gdGhlIGNvbXBvbmVudCBuYW1lXHJcbiAgICAgKi9cclxuICAgIGdldENvbXBvbmVudE5hbWU6IGZ1bmN0aW9uKCBwaGV0aW9JRCApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGhldGlvSUQubGVuZ3RoID4gMCApO1xyXG4gICAgICBjb25zdCBpbmRleE9mTGFzdFNlcGFyYXRvciA9IHBoZXRpb0lELmxhc3RJbmRleE9mKCBTRVBBUkFUT1IgKTtcclxuICAgICAgaWYgKCBpbmRleE9mTGFzdFNlcGFyYXRvciA9PT0gLTEgKSB7XHJcbiAgICAgICAgcmV0dXJuIHBoZXRpb0lEO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBwaGV0aW9JRC5zdWJzdHJpbmcoIGluZGV4T2ZMYXN0U2VwYXJhdG9yICsgMSwgcGhldGlvSUQubGVuZ3RoICk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLy8gUHJpdmF0ZSBEb2M6IFRoZSBiZWxvdyBqc2RvYyBpcyBwdWJsaWMgdG8gdGhlIFBoRVQtaU8gQVBJIGRvY3VtZW50YXRpb24uIENoYW5nZSB3aXNlbHkuXHJcbiAgICAvKipcclxuICAgICAqIEdpdmVuIGEgcGhldGlvSUQgZm9yIGEgUGhFVC1pTyBlbGVtZW50LCBnZXQgdGhlIHBoZXRpb0lEIG9mIHRoZSBwYXJlbnQgY29tcG9uZW50LlxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIGdldFBhcmVudElEKCAnbXlTY3JlZW4ubXlDb250cm9sUGFuZWwubXlDb21ib0JveCcgKVxyXG4gICAgICogLS0+ICAnbXlTY3JlZW4ubXlDb250cm9sUGFuZWwnXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGhldGlvSUQgLSB0aGUgSUQgb2YgdGhlIFBoRVQtaU8gZWxlbWVudFxyXG4gICAgICogQHJldHVybnMge3N0cmluZ3xudWxsfSAtIHRoZSBwaGV0aW9JRCBvZiB0aGUgcGFyZW50LCBvciBudWxsIGlmIHRoZXJlIGlzIG5vIHBhcmVudFxyXG4gICAgICovXHJcbiAgICBnZXRQYXJlbnRJRDogZnVuY3Rpb24oIHBoZXRpb0lEICkge1xyXG4gICAgICBjb25zdCBpbmRleE9mTGFzdFNlcGFyYXRvciA9IHBoZXRpb0lELmxhc3RJbmRleE9mKCBTRVBBUkFUT1IgKTtcclxuICAgICAgcmV0dXJuIGluZGV4T2ZMYXN0U2VwYXJhdG9yID09PSAtMSA/IG51bGwgOiBwaGV0aW9JRC5zdWJzdHJpbmcoIDAsIGluZGV4T2ZMYXN0U2VwYXJhdG9yICk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFByaXZhdGUgRG9jOiBUaGUgYmVsb3cganNkb2MgaXMgcHVibGljIHRvIHRoZSBQaEVULWlPIEFQSSBkb2N1bWVudGF0aW9uLiBDaGFuZ2Ugd2lzZWx5LlxyXG4gICAgLyoqXHJcbiAgICAgKiBHaXZlbiBhIHBoZXRpb0lEIGZvciBhIGluc3RydW1lbnRlZCBvYmplY3QsIGdldCBhIHN0cmluZyB0aGF0IGNhbiBiZSB1c2VkIHRvIGFzc2lnbiBhbiBJRCB0byBhIERPTSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGhldGlvSUQgLSB0aGUgSUQgb2YgdGhlIFBoRVQtaU8gZWxlbWVudFxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgZ2V0RE9NRWxlbWVudElEOiBmdW5jdGlvbiggcGhldGlvSUQgKSB7XHJcbiAgICAgIHJldHVybiBgcGhldGlvSUQ6JHtwaGV0aW9JRH1gO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBQcml2YXRlIERvYzogVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBzY3JlZW4gaWQgZnJvbSB0aGUgcGhldGlvSUQuXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogZ2V0U2NyZWVuSUQoICdzaW0ubXlTY3JlZW4ubW9kZWwucHJvcGVydHknIClcclxuICAgICAqIC0tPiBzaW0ubXlTY3JlZW5cclxuICAgICAqIGdldFNjcmVlbklEKCAnc2ltLm15U2NyZWVuJyApXHJcbiAgICAgKiAtLT4gc2ltLm15U2NyZWVuXHJcbiAgICAgKiBnZXRTY3JlZW5JRCggJ3NpbS5nZW5lcmFsLmFjdGl2ZVByb3BlcnR5JyApXHJcbiAgICAgKiAtLT4gbnVsbFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBoZXRpb0lEXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9IC0gbnVsbCBpZiB0aGVyZSBpcyBubyBzY3JlZW4gY29tcG9uZW50IG5hbWUgaW4gdGhlIHBoZXRpb0lEXHJcbiAgICAgKi9cclxuICAgIGdldFNjcmVlbklEOiBmdW5jdGlvbiggcGhldGlvSUQgKSB7XHJcbiAgICAgIGNvbnN0IHNjcmVlbklEUGFydHMgPSBbXTtcclxuICAgICAgY29uc3QgcGhldGlvSURQYXJ0cyA9IHBoZXRpb0lELnNwbGl0KCBTRVBBUkFUT1IgKTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGhldGlvSURQYXJ0cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBjb21wb25lbnRQYXJ0ID0gcGhldGlvSURQYXJ0c1sgaSBdO1xyXG4gICAgICAgIHNjcmVlbklEUGFydHMucHVzaCggY29tcG9uZW50UGFydCApO1xyXG4gICAgICAgIGNvbnN0IGluZGV4T2ZTY3JlZW5NYXJrZXIgPSBjb21wb25lbnRQYXJ0LmluZGV4T2YoIFNDUkVFTl9DT01QT05FTlRfTkFNRSApO1xyXG4gICAgICAgIGlmICggaW5kZXhPZlNjcmVlbk1hcmtlciA+IDAgJiYgaW5kZXhPZlNjcmVlbk1hcmtlciArIFNDUkVFTl9DT01QT05FTlRfTkFNRS5sZW5ndGggPT09IGNvbXBvbmVudFBhcnQubGVuZ3RoICkgeyAvLyBlbmRzV2l0aCBwcm94eVxyXG4gICAgICAgICAgcmV0dXJuIHNjcmVlbklEUGFydHMuam9pbiggU0VQQVJBVE9SICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBQcml2YXRlIERvYzogVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBpbmRleCBudW1iZXIgZnJvbSB0aGUgY29tcG9uZW50IG5hbWUgb2YgdGhlIGNvbXBvbmVudCBuYW1lIHByb3ZpZGVkLlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbXBvbmVudE5hbWVcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogZ2V0R3JvdXBFbGVtZW50SW5kZXgoICdwYXJ0aWNsZV8xJyApXHJcbiAgICAgKiAtLT4gMVxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBnZXRHcm91cEVsZW1lbnRJbmRleDogZnVuY3Rpb24oIGNvbXBvbmVudE5hbWUgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbXBvbmVudE5hbWUuaW5kZXhPZiggd2luZG93LnBoZXRpby5QaGV0aW9JRFV0aWxzLkdST1VQX1NFUEFSQVRPUiApID49IDAsXHJcbiAgICAgICAgJ2NvbXBvbmVudCBuYW1lIGZvciBwaGV0aW9JRCBzaG91bGQgaGF2ZSBncm91cCBlbGVtZW50IHN5bnRheCcgKTtcclxuICAgICAgcmV0dXJuIE51bWJlciggY29tcG9uZW50TmFtZS5zcGxpdCggd2luZG93LnBoZXRpby5QaGV0aW9JRFV0aWxzLkdST1VQX1NFUEFSQVRPUiApWyAxIF0gKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHBvdGVudGlhbCBhbmNlc3RvciBpcyBpbmRlZWQgYW4gYW5jZXN0b3Igb2YgdGhlIHBvdGVudGlhbCBkZXNjZW5kYW50LCBidXQgbm90IHRoZSBzYW1lIHBoZXRpb0lEXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcG90ZW50aWFsQW5jZXN0b3JQaGV0aW9JRFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBvdGVudGlhbERlc2NlbmRhbnRQaGV0aW9JRFxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIGlzQW5jZXN0b3I6IGZ1bmN0aW9uKCBwb3RlbnRpYWxBbmNlc3RvclBoZXRpb0lELCBwb3RlbnRpYWxEZXNjZW5kYW50UGhldGlvSUQgKSB7XHJcbiAgICAgIGNvbnN0IGFuY2VzdG9yQ29tcG9uZW50cyA9IHBvdGVudGlhbEFuY2VzdG9yUGhldGlvSUQuc3BsaXQoIFNFUEFSQVRPUiApO1xyXG4gICAgICBjb25zdCBkZXNjZW5kYW50Q29tcG9uZW50cyA9IHBvdGVudGlhbERlc2NlbmRhbnRQaGV0aW9JRC5zcGxpdCggU0VQQVJBVE9SICk7XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGFuY2VzdG9yQ29tcG9uZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBpZiAoIGFuY2VzdG9yQ29tcG9uZW50c1sgaSBdICE9PSBkZXNjZW5kYW50Q29tcG9uZW50c1sgaSBdICkge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbm90IHRoZSBzYW1lIGNoaWxkXHJcbiAgICAgIHJldHVybiBwb3RlbnRpYWxEZXNjZW5kYW50UGhldGlvSUQgIT09IHBvdGVudGlhbEFuY2VzdG9yUGhldGlvSUQ7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFByaXZhdGUgRG9jOiBUaGUgYmVsb3cganNkb2MgaXMgcHVibGljIHRvIHRoZSBQaEVULWlPIEFQSSBkb2N1bWVudGF0aW9uLiBDaGFuZ2Ugd2lzZWx5LlxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2VwYXJhdG9yIHVzZWQgdG8gcGllY2UgdG9nZXRoZXIgYSBwaGV0LWlvIElELlxyXG4gICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAqIEBjb25zdGFudFxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBTRVBBUkFUT1I6IFNFUEFSQVRPUixcclxuXHJcbiAgICAvLyBQcml2YXRlIERvYzogVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHNlcGFyYXRvciB1c2VkIHRvIHNwZWNpZnkgdGhlIGNvdW50IG9mIGEgZWxlbWVudCBpbiBhIGdyb3VwLlxyXG4gICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAqIEBjb25zdGFudFxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBHUk9VUF9TRVBBUkFUT1I6IEdST1VQX1NFUEFSQVRPUixcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBzZXBhcmF0b3IgdXNlZCB0byBzcGVjaWZ5IHRlcm1zIGluIGEgcGhldGlvSUQgdGhhdCBpcyB1c2VkIGJ5IGFub3RoZXIgcGhldGlvSUQuIEZvciBleGFtcGxlOlxyXG4gICAgICpcclxuICAgICAqIHNpbS5nZW5lcmFsLnZpZXcuc2ltLWdsb2JhbC1vdGhlcklEXHJcbiAgICAgKlxyXG4gICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAqIEBjb25zdGFudFxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBJTlRFUl9URVJNX1NFUEFSQVRPUjogSU5URVJfVEVSTV9TRVBBUkFUT1IsXHJcblxyXG4gICAgLy8gUHJpdmF0ZSBEb2M6IFRoZSBiZWxvdyBqc2RvYyBpcyBwdWJsaWMgdG8gdGhlIFBoRVQtaU8gQVBJIGRvY3VtZW50YXRpb24uIENoYW5nZSB3aXNlbHkuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjb21wb25lbnQgbmFtZSBmb3IgdGhlIGlkIHNlY3Rpb24gdGhhdCBob2xkcyBwaGV0LWlvIGVsZW1lbnRzIGdlbmVyYWwgdG8gYWxsIHNpbXVsYXRpb25zLlxyXG4gICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAqIEBjb25zdGFudFxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBHRU5FUkFMX0NPTVBPTkVOVF9OQU1FOiBHRU5FUkFMX0NPTVBPTkVOVF9OQU1FLFxyXG5cclxuICAgIC8vIFByaXZhdGUgRG9jOiBUaGUgYmVsb3cganNkb2MgaXMgcHVibGljIHRvIHRoZSBQaEVULWlPIEFQSSBkb2N1bWVudGF0aW9uLiBDaGFuZ2Ugd2lzZWx5LlxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY29tcG9uZW50IG5hbWUgZm9yIHRoZSBpZCBzZWN0aW9uIHRoYXQgaG9sZHMgc2ltdWxhdGlvbiBzcGVjaWZpYyBlbGVtZW50cyB0aGF0IGRvbid0IGJlbG9uZyBpbiBhIHNjcmVlbi5cclxuICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgKiBAY29uc3RhbnRcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgR0xPQkFMX0NPTVBPTkVOVF9OQU1FOiBHTE9CQUxfQ09NUE9ORU5UX05BTUUsXHJcblxyXG4gICAgLy8gUHJpdmF0ZSBEb2M6IFRoZSBiZWxvdyBqc2RvYyBpcyBwdWJsaWMgdG8gdGhlIFBoRVQtaU8gQVBJIGRvY3VtZW50YXRpb24uIENoYW5nZSB3aXNlbHkuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjb21wb25lbnQgbmFtZSBmb3IgdGhlIGlkIHNlY3Rpb24gdGhhdCBob2xkcyB0aGUgaG9tZSBzY3JlZW4uXHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICogQGNvbnN0YW50XHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIEhPTUVfU0NSRUVOX0NPTVBPTkVOVF9OQU1FOiBIT01FX1NDUkVFTl9DT01QT05FTlRfTkFNRSxcclxuXHJcbiAgICAvLyBQcml2YXRlIERvYzogVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNvbXBvbmVudCBuYW1lIGZvciBhbiBpZCBzZWN0aW9uIHRoYXQgaG9sZHMgbW9kZWwgc3BlY2lmaWMgZWxlbWVudHMuXHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICogQGNvbnN0YW50XHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIE1PREVMX0NPTVBPTkVOVF9OQU1FOiBNT0RFTF9DT01QT05FTlRfTkFNRSxcclxuXHJcbiAgICAvLyBQcml2YXRlIERvYzogVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNvbXBvbmVudCBuYW1lIGZvciBhbiBpZCBzZWN0aW9uIHRoYXQgaG9sZHMgdmlldyBzcGVjaWZpYyBlbGVtZW50cy5cclxuICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgKiBAY29uc3RhbnRcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgVklFV19DT01QT05FTlRfTkFNRTogVklFV19DT01QT05FTlRfTkFNRSxcclxuXHJcbiAgICAvLyBQcml2YXRlIERvYzogVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNvbXBvbmVudCBuYW1lIGZvciBhbiBpZCBzZWN0aW9uIHRoYXQgaG9sZHMgY29udHJvbGxlciBzcGVjaWZpYyBlbGVtZW50cy5cclxuICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgKiBAY29uc3RhbnRcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgQ09OVFJPTExFUl9DT01QT05FTlRfTkFNRTogQ09OVFJPTExFUl9DT01QT05FTlRfTkFNRSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjb21wb25lbnQgbmFtZSBmb3IgYSBzZWN0aW9uIHRoYXQgaG9sZHMgY29sb3JzXHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICogQGNvbnN0YW50XHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIENPTE9SU19DT01QT05FTlRfTkFNRTogQ09MT1JTX0NPTVBPTkVOVF9OQU1FXHJcbiAgfTtcclxufSApKCk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUUsWUFBVztFQUdYO0VBQ0FBLE1BQU0sQ0FBQ0MsTUFBTSxHQUFHRCxNQUFNLENBQUNDLE1BQU0sSUFBSSxDQUFDLENBQUM7O0VBRW5DO0VBQ0EsTUFBTUMsU0FBUyxHQUFHLEdBQUc7RUFDckIsTUFBTUMsZUFBZSxHQUFHLEdBQUc7RUFDM0IsTUFBTUMsb0JBQW9CLEdBQUcsR0FBRztFQUNoQyxNQUFNQyxzQkFBc0IsR0FBRyxTQUFTO0VBQ3hDLE1BQU1DLHFCQUFxQixHQUFHLFFBQVE7RUFDdEMsTUFBTUMsMEJBQTBCLEdBQUcsWUFBWTtFQUMvQyxNQUFNQyxvQkFBb0IsR0FBRyxPQUFPO0VBQ3BDLE1BQU1DLG1CQUFtQixHQUFHLE1BQU07RUFDbEMsTUFBTUMscUJBQXFCLEdBQUcsUUFBUTtFQUN0QyxNQUFNQyx5QkFBeUIsR0FBRyxZQUFZO0VBQzlDLE1BQU1DLHFCQUFxQixHQUFHLFFBQVE7O0VBRXRDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRVosTUFBTSxDQUFDQyxNQUFNLENBQUNZLGFBQWEsR0FBRztJQUU1QjtJQUNBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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