// Copyright 2017-2022, University of Colorado Boulder

//TODO Moved here from litmus repository. Delete when 100% certain that we're not using JSmol. See https://github.com/phetsims/molecule-polarity/issues/15
/**
 * Scenery node that displays a JSmol viewer.
 * Jmol scripting language is documented at http://chemapps.stolaf.edu/jmol/docs
 *
 * This requires Jmol 14.2.4, which you must download and install separately. Instructions:
 *
 * 1. Download Jmol 14.2.4 from http://sourceforge.net/projects/jmol/files/Jmol/
 * 2. Expand the Jmol zip file, creating a directory named jmol-\<version number\>
 * 3. In the jmol directory, locate jsmol.zip.  Expand jsmol.zip, creating a directory named jsmol.
 * 4. Copy the jmol directory so that it is an immediate subdirectory of your working copy of litmus.
 * 5. Rename the directory to jmol-14.2.4
 *
 * WARNING #1: Changes to how a sim hmtl file is generated (including `molecule-polarity_en.hmtl`, the development
 * html file) made it impossible to manually add JSmol to the html file.  So before you can run this repository,
 * you'll need to figure out how to fix that.  This script needs to run after the 3rd-party libraries
 * (jquery in particular), and before any PhET-specific code:
 *
 * `<script type="text/javascript" src="jsmol-14.2.4/JSmol.min.nojq.js"></script>`
 *
 * WARNING #2: As soon as you add the jmol-14.2.4/ directory, you'll need to make sure that it is excluded from any
 * lint process.  It includes a lot of .js files, and they don't conform to PhET's lint standards.
 *
 * WARNING #3: JSmol 14.2.4 incorrectly identifies itself as 14.2.3 when Jmol._version is inspected in the debugger.
 *
 * WARNING #4: When this file was converted to TypeScript in 9/2022, it passed lint and tsc, but was not tested.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { Color, DOM } from '../../../../scenery/js/imports.js';
import MPColors from '../../common/MPColors.js';
import MPQueryParameters from '../../common/MPQueryParameters.js';
import moleculePolarity from '../../moleculePolarity.js';
import Element from '../model/Element.js';
import optionize from '../../../../phet-core/js/optionize.js';
// strings
const DELTA = '\u03B4';
const RESULT_TRUE = 'true';
const RESULT_FALSE = 'false';

// Opaque handle to the JSmol applet, so 'any' is an appropriate type.

// configuration for the JSmol object, called Info by convention

// Jmol is loaded via <script> in the .html file, this prevents lint from complaining the Jmol is undefined.
const Jmol = window['Jmol'];

// each Jmol object instance is given a new identifier, numbered sequentially
let instanceNumber = 0;

// identify a URL object, not standardized across browsers
const URL = window.URL || window.webkitURL || window;

// Script to run when the Jmol object has finished loading
const SCRIPT_INIT = 'set autobond off\n' + 'set frank off\n' +
// hide the Jmol logo
'set dipoleScale 0.75\n'; // so that molecular dipole isn't clipped by viewer or extend beyond isosurface

// Jmol actions to unbind, all except _rotate
const JmolActionValues = ['_clickFrank', '_depth', '_dragDrawObject', '_dragDrawPoint', '_dragLabel', '_dragSelected', '_navTranslate', '_pickAtom', '_pickIsosurface', '_pickLabel', '_pickMeasure', '_pickNavigate', '_pickPoint', '_popupMenu', '_reset', '_rotateSelected', '_rotateZ', '_rotateZorZoom', '_select', '_selectAndNot', '_selectNone', '_selectOr', '_selectToggle', '_selectToggleOr', '_setMeasure', '_slab', '_slabAndDepth', '_slideZoom', '_spinDrawObjectCCW', '_spinDrawObjectCW', '_swipe', '_translate', '_wheelZoom'];
export default class JSmolViewerNode extends DOM {
  // elements in the molecule displayed by the viewer

  constructor(moleculeProperty, viewProperties, providedOptions) {
    const options = optionize()({
      // SelfOptions
      viewerSize: new Dimension2(200, 200),
      viewerFill: 'white',
      viewerStroke: 'black',
      // {string} color of the viewer's background

      // DOMOptions
      preventTransform: true
    }, providedOptions);

    // Put the JSmol object in a div, sized to match the JSmol object
    const div = document.createElement('div');
    div.style.width = `${options.viewerSize.width}px`;
    div.style.height = `${options.viewerSize.height}px`;
    div.style.border = `1px solid ${options.viewerStroke}`;
    super(div, options);
    this.moleculeProperty = moleculeProperty;
    this.viewProperties = viewProperties;
    this.viewerSize = options.viewerSize;
    this.viewerFill = options.viewerFill;
    this.viewerStroke = options.viewerStroke;
    this.div = div;
    this.elementsProperty = new Property(null);

    // JSmol must be initialized after the sim is running
    this.applet = null;
  }
  isInitialized() {
    return this.applet !== null;
  }

  // Call this after the sim has started running
  initialize() {
    assert && assert(!this.isInitialized(), 'already initialized');

    // Called when the Jmol object has been created and is ready to receive commands
    const readyFunction = applet => {
      phet.log && phet.log('readyFunction');
      unbindActions(applet, JmolActionValues);
      this.moleculeProperty.link(molecule => {
        updateMolecule(applet, molecule, this.viewProperties);
        updateElements(applet, this.elementsProperty);
      });
      this.viewProperties.bondDipolesVisibleProperty.link(bondDipolesVisible => {
        updateDipoles(applet, bondDipolesVisible, this.viewProperties.molecularDipoleVisibleProperty.value);
      });
      this.viewProperties.molecularDipoleVisibleProperty.link(molecularDipoleVisible => {
        updateDipoles(applet, this.viewProperties.bondDipolesVisibleProperty.value, molecularDipoleVisible);
      });
      this.viewProperties.partialChargesVisibleProperty.link(partialChargesVisible => {
        updateLabels(applet, this.viewProperties.atomLabelsVisibleProperty.value, partialChargesVisible);
      });
      this.viewProperties.atomLabelsVisibleProperty.link(atomLabelsVisible => {
        updateLabels(applet, atomLabelsVisible, this.viewProperties.partialChargesVisibleProperty.value);
      });
      this.viewProperties.surfaceTypeProperty.link(surfaceType => {
        updateSurface(applet, surfaceType);
      });
    };

    // configuration for the JSmol object, called Info by convention
    const appletConfig = {
      color: toJmolColor(this.viewerFill),
      // background color of the JSmol object
      width: this.viewerSize.width,
      // width of the Jmol object in pixels or expressed as percent of its container width as a string in quotes: '100%'.
      height: this.viewerSize.height,
      // height, similar format as width
      debug: false,
      // Set this value to true if you are having problems getting your page to show the Jmol object
      j2sPath: 'jsmol-14.2.4/j2s',
      // path to the suite of JavaScript libraries needed for JSmol
      serverURL: 'jsmol-14.2.4/php/jsmol.php',
      // URL to be used for getting file data into non-Java modalities
      use: 'HTML5',
      // determines the various options to be tried (applet and surrogates) and the order in which to try them
      script: SCRIPT_INIT,
      // script to run when the Jmol object has finished loading
      readyFunction: readyFunction,
      // function to call when the Jmol object has been created and is ready to receive commands
      disableJ2SLoadMonitor: true,
      // disable display of messages in a single line, colored, at bottom-left of the page
      disableInitialConsole: true // avoids the display of messages in the Jmol panel while the Jmol object is being built initially
    };

    Jmol.setDocument(false); // tell Jmol not to add the viewer to our HTML document
    const appletId = `jmolApplet${instanceNumber++}`; // create a unique id for this viewer
    Jmol.getApplet(appletId, appletConfig); // creates window[appletId]

    this.applet = window[appletId]; // so that we don't pollute our code with window[appletId]

    this.div.innerHTML = Jmol.getAppletHtml(this.applet); // add the viewer's HTML fragment to this node's HTML element

    // TODO Why do we need to call this? See https://github.com/phetsims/molecule-polarity/issues/14
    this.applet._cover(false);
  }
}

// executes a JSmol script
function doScript(applet, script) {
  // use scriptWait (which is synchronous) so that we get status and can use evaluateVar elsewhere
  const status = Jmol.scriptWait(applet, script);
  phet.log && phet.log(`doScript, status=${status}`);
}

/**
 * Unbinds mouse actions from JSmol actions.
 */
function unbindActions(applet, actions) {
  let script = '';
  actions.forEach(action => {
    script += `unbind ${action}\n`;
  });
  doScript(applet, script);
}

/**
 * Converts to a JSmol color for the form '[r,g,b]'
 */
function toJmolColor(jSmolViewerColor) {
  const color = Color.toColor(jSmolViewerColor);
  return `[${color.red},${color.green},${color.blue}]`;
}

/**
 * Loads a molecule by URL, then sets things that must be reset whenever the molecule changes.
 */
function updateMolecule(applet, molecule, viewProperties) {
  phet.log && phet.log('updateMolecule');
  const url = URL.createObjectURL(new Blob([molecule.mol2Data], {
    type: 'text/plain',
    endings: 'native'
  }));

  // load molecule
  doScript(applet, `load ${url}`);

  // reset misc settings that don't persist
  doScript(applet, 'select oxygen; color [255,85,0]\n' +
  // colorblind red oxygen
  'select all\n' +
  // be polite to other commands that assume that everything is selected
  'wireframe 0.1\n' +
  // draw bonds as lines
  'spacefill 25%\n' +
  // render atoms as a percentage of the van der Waals radius
  'color bonds [128,128,128]\n' +
  // gray bonds
  'hover off'); // don't show atom label when hovering with mouse

  // reset sim-specific settings that don't persist
  updateDipoles(applet, viewProperties.bondDipolesVisibleProperty.value, viewProperties.molecularDipoleVisibleProperty.value);
  updateLabels(applet, viewProperties.atomLabelsVisibleProperty.value, viewProperties.partialChargesVisibleProperty.value);
  updateSurface(applet, viewProperties.surfaceTypeProperty.value);
}

/**
 * Updates the elements in the molecule that is currently displayed by the viewer.
 */
function updateElements(applet, elementsProperty) {
  /*
   * Returns a string where elemno and color are separated by newlines.
   * Each color is 3 components (rgb) surrounded by curly braces.
   * Eg, for HF: '1\n{255 255 255}\n9\n{144 224 80}\n'
   */
  let status = Jmol.evaluateVar(applet, 'script(\'' + 'n = {*}.length\n' + 'for ( i = 0; i < n; i++ ) {\n' + '    print {*}[i].elemno\n' + '    print {*}[i].color\n' + '}' + '\')');
  if (status === null || status === 'ERROR') {
    throw new Error(`JSmolViewerNode.updateElements, script error: ${status}`);
  }

  /*
   * Replace the special chars with spaces, to make this easier to parse.
   * Eg, for HF: '1 255 255 255 9 144 224 80 '
   */
  status = status.replace(/\n/g, ' ').replace(/{/g, '').replace(/}/g, '');
  phet.log && phet.log(`updateElements, status=${status}`);

  /*
   * Now that the tokens are separated by spaces, split the string into an array.
   * Eg, for HF: ['1','255','255','255','9','144','224','80']
   */
  const tokens = status.split(' ');
  assert && assert(tokens.length % 4 === 0, 'each element should have 4 tokens');

  // Convert the tokens to an array of {Element}.
  const elements = [];
  for (let i = 0; i < tokens.length; i = i + 4) {
    const elementNumber = Number(tokens[i]);
    const color = new Color(Number(tokens[i + 1]), Number(tokens[i + 2]), Number(tokens[i + 3]));
    elements.push(new Element(elementNumber, color));
  }
  elementsProperty.value = elements;
}

/**
 * When any dipole is visible, make the atoms and bonds translucent, so we can see the dipoles through them.
 */
function updateTranslucency(applet, bondDipolesVisible, molecularDipoleVisible) {
  phet.log && phet.log('updateTransparency');
  const arg = bondDipolesVisible || molecularDipoleVisible ? '0.25' : '0.0'; // 0.0=opaque, 1.0=transparent
  doScript(applet, `color atoms translucent ${arg}`);
  doScript(applet, `color bonds translucent ${arg}`);
}

/**
 * Updates visibility of dipoles.
 */
function updateDipoles(applet, bondDipolesVisible, molecularDipoleVisible) {
  phet.log && phet.log('updateDipoles');
  if (bondDipolesVisible) {
    doScript(applet, 'dipole bonds on width 0.05');
  } else {
    doScript(applet, 'dipole bonds off');
  }
  if (molecularDipoleVisible) {
    doScript(applet, 'dipole molecular on width 0.05');
  } else {
    doScript(applet, 'dipole molecular off');
  }
  updateTranslucency(applet, bondDipolesVisible, molecularDipoleVisible);
}

/**
 * Updates visibility of labels on the atoms, to show atom names, partial charges, or both.
 */
function updateLabels(applet, atomLabelsVisible, partialChargesVisible) {
  phet.log && phet.log('updateLabels');
  if (atomLabelsVisible || partialChargesVisible) {
    let args = '';
    if (atomLabelsVisible) {
      args += ' %[atomName]'; // show element and sequential atom index
    }

    if (partialChargesVisible) {
      if (atomLabelsVisible) {
        args += '|'; // line separator
      }

      args += `${DELTA}=%.2[partialCharge]`; // show partial charges
    }

    // Do this as a single script, or you'll see atom labels jump around.
    doScript(applet, `label ${args}\n` + 'set labelalignment center\n' +
    // center labels on atoms
    'set labeloffset 0 0\n' + 'color labels black\n' +
    // color for all labels
    'font labels 18 sanserif\n' // font for all labels
    );
  } else {
    doScript(applet, 'label off');
  }
}

/**
 * Updates the type of surface displayed.
 */
function updateSurface(applet, surfaceType) {
  phet.log && phet.log('updateSurface');
  const diatomic = isHomogeneousDiatomic(applet);
  if (surfaceType === 'electrostaticPotential') {
    if (MPQueryParameters.surfaceColor === 'ROYGB') {
      if (diatomic) {
        doScript(applet, `isosurface VDW color ${toJmolColor(MPColors.NEUTRAL_POTENTIAL)} translucent`);
      } else {
        doScript(applet, 'isosurface VDW map MEP translucent');
      }
    } else {
      // 'RWB'
      if (diatomic) {
        doScript(applet, 'isosurface VDW color white translucent');
      } else {
        doScript(applet, 'isosurface VDW map MEP colorscheme "RWB" translucent');
      }
    }
  } else if (surfaceType === 'electronDensity') {
    if (diatomic) {
      doScript(applet, `isosurface VDW color ${toJmolColor(MPColors.NEUTRAL_GRAY)} translucent`);
    } else {
      doScript(applet, 'isosurface VDW map MEP colorscheme "BW" translucent');
    }
  } else {
    // 'none'
    doScript(applet, 'isosurface off');
  }
}

/**
 * Determines if the current molecule is homogeneous diatomic (2 atoms of the same type.)
 */
function isHomogeneousDiatomic(applet) {
  const status = Jmol.evaluateVar(applet, `${'script(\'' + 'numberOfAtoms = {*}.length\n' + 'homogeneousDiatomic = "'}${RESULT_TRUE}"\n` + 'if ( numberOfAtoms == 2 ) {\n' + '    firstElement = {*}[0].element\n' + '    for ( i = 0; i < numberOfAtoms; i++ ) {\n' + '        nextElement = {*}[i].element\n' + '        if ( firstElement != nextElement ) {\n' + `            homogeneousDiatomic = "${RESULT_FALSE}"\n` + '        }\n' + '    }\n' + '}\n' + 'else {\n' + `    homogeneousDiatomic = "${RESULT_FALSE}"\n` + '}\n' + 'print homogeneousDiatomic' + '\')');
  phet.log && phet.log(`isHomogeneousDiatomic, status=${status}`);
  if (status === null || status === 'ERROR') {
    throw new Error(`JSmolViewerNode.isHomogeneousDiatomic, script error: ${status}`);
  } else {
    return status === 'true';
  }
}
moleculePolarity.register('JSmolViewerNode', JSmolViewerNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJDb2xvciIsIkRPTSIsIk1QQ29sb3JzIiwiTVBRdWVyeVBhcmFtZXRlcnMiLCJtb2xlY3VsZVBvbGFyaXR5IiwiRWxlbWVudCIsIm9wdGlvbml6ZSIsIkRFTFRBIiwiUkVTVUxUX1RSVUUiLCJSRVNVTFRfRkFMU0UiLCJKbW9sIiwid2luZG93IiwiaW5zdGFuY2VOdW1iZXIiLCJVUkwiLCJ3ZWJraXRVUkwiLCJTQ1JJUFRfSU5JVCIsIkptb2xBY3Rpb25WYWx1ZXMiLCJKU21vbFZpZXdlck5vZGUiLCJjb25zdHJ1Y3RvciIsIm1vbGVjdWxlUHJvcGVydHkiLCJ2aWV3UHJvcGVydGllcyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ2aWV3ZXJTaXplIiwidmlld2VyRmlsbCIsInZpZXdlclN0cm9rZSIsInByZXZlbnRUcmFuc2Zvcm0iLCJkaXYiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsIndpZHRoIiwiaGVpZ2h0IiwiYm9yZGVyIiwiZWxlbWVudHNQcm9wZXJ0eSIsImFwcGxldCIsImlzSW5pdGlhbGl6ZWQiLCJpbml0aWFsaXplIiwiYXNzZXJ0IiwicmVhZHlGdW5jdGlvbiIsInBoZXQiLCJsb2ciLCJ1bmJpbmRBY3Rpb25zIiwibGluayIsIm1vbGVjdWxlIiwidXBkYXRlTW9sZWN1bGUiLCJ1cGRhdGVFbGVtZW50cyIsImJvbmREaXBvbGVzVmlzaWJsZVByb3BlcnR5IiwiYm9uZERpcG9sZXNWaXNpYmxlIiwidXBkYXRlRGlwb2xlcyIsIm1vbGVjdWxhckRpcG9sZVZpc2libGVQcm9wZXJ0eSIsInZhbHVlIiwibW9sZWN1bGFyRGlwb2xlVmlzaWJsZSIsInBhcnRpYWxDaGFyZ2VzVmlzaWJsZVByb3BlcnR5IiwicGFydGlhbENoYXJnZXNWaXNpYmxlIiwidXBkYXRlTGFiZWxzIiwiYXRvbUxhYmVsc1Zpc2libGVQcm9wZXJ0eSIsImF0b21MYWJlbHNWaXNpYmxlIiwic3VyZmFjZVR5cGVQcm9wZXJ0eSIsInN1cmZhY2VUeXBlIiwidXBkYXRlU3VyZmFjZSIsImFwcGxldENvbmZpZyIsImNvbG9yIiwidG9KbW9sQ29sb3IiLCJkZWJ1ZyIsImoyc1BhdGgiLCJzZXJ2ZXJVUkwiLCJ1c2UiLCJzY3JpcHQiLCJkaXNhYmxlSjJTTG9hZE1vbml0b3IiLCJkaXNhYmxlSW5pdGlhbENvbnNvbGUiLCJzZXREb2N1bWVudCIsImFwcGxldElkIiwiZ2V0QXBwbGV0IiwiaW5uZXJIVE1MIiwiZ2V0QXBwbGV0SHRtbCIsIl9jb3ZlciIsImRvU2NyaXB0Iiwic3RhdHVzIiwic2NyaXB0V2FpdCIsImFjdGlvbnMiLCJmb3JFYWNoIiwiYWN0aW9uIiwialNtb2xWaWV3ZXJDb2xvciIsInRvQ29sb3IiLCJyZWQiLCJncmVlbiIsImJsdWUiLCJ1cmwiLCJjcmVhdGVPYmplY3RVUkwiLCJCbG9iIiwibW9sMkRhdGEiLCJ0eXBlIiwiZW5kaW5ncyIsImV2YWx1YXRlVmFyIiwiRXJyb3IiLCJyZXBsYWNlIiwidG9rZW5zIiwic3BsaXQiLCJsZW5ndGgiLCJlbGVtZW50cyIsImkiLCJlbGVtZW50TnVtYmVyIiwiTnVtYmVyIiwicHVzaCIsInVwZGF0ZVRyYW5zbHVjZW5jeSIsImFyZyIsImFyZ3MiLCJkaWF0b21pYyIsImlzSG9tb2dlbmVvdXNEaWF0b21pYyIsInN1cmZhY2VDb2xvciIsIk5FVVRSQUxfUE9URU5USUFMIiwiTkVVVFJBTF9HUkFZIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJKU21vbFZpZXdlck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vL1RPRE8gTW92ZWQgaGVyZSBmcm9tIGxpdG11cyByZXBvc2l0b3J5LiBEZWxldGUgd2hlbiAxMDAlIGNlcnRhaW4gdGhhdCB3ZSdyZSBub3QgdXNpbmcgSlNtb2wuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbW9sZWN1bGUtcG9sYXJpdHkvaXNzdWVzLzE1XHJcbi8qKlxyXG4gKiBTY2VuZXJ5IG5vZGUgdGhhdCBkaXNwbGF5cyBhIEpTbW9sIHZpZXdlci5cclxuICogSm1vbCBzY3JpcHRpbmcgbGFuZ3VhZ2UgaXMgZG9jdW1lbnRlZCBhdCBodHRwOi8vY2hlbWFwcHMuc3RvbGFmLmVkdS9qbW9sL2RvY3NcclxuICpcclxuICogVGhpcyByZXF1aXJlcyBKbW9sIDE0LjIuNCwgd2hpY2ggeW91IG11c3QgZG93bmxvYWQgYW5kIGluc3RhbGwgc2VwYXJhdGVseS4gSW5zdHJ1Y3Rpb25zOlxyXG4gKlxyXG4gKiAxLiBEb3dubG9hZCBKbW9sIDE0LjIuNCBmcm9tIGh0dHA6Ly9zb3VyY2Vmb3JnZS5uZXQvcHJvamVjdHMvam1vbC9maWxlcy9KbW9sL1xyXG4gKiAyLiBFeHBhbmQgdGhlIEptb2wgemlwIGZpbGUsIGNyZWF0aW5nIGEgZGlyZWN0b3J5IG5hbWVkIGptb2wtXFw8dmVyc2lvbiBudW1iZXJcXD5cclxuICogMy4gSW4gdGhlIGptb2wgZGlyZWN0b3J5LCBsb2NhdGUganNtb2wuemlwLiAgRXhwYW5kIGpzbW9sLnppcCwgY3JlYXRpbmcgYSBkaXJlY3RvcnkgbmFtZWQganNtb2wuXHJcbiAqIDQuIENvcHkgdGhlIGptb2wgZGlyZWN0b3J5IHNvIHRoYXQgaXQgaXMgYW4gaW1tZWRpYXRlIHN1YmRpcmVjdG9yeSBvZiB5b3VyIHdvcmtpbmcgY29weSBvZiBsaXRtdXMuXHJcbiAqIDUuIFJlbmFtZSB0aGUgZGlyZWN0b3J5IHRvIGptb2wtMTQuMi40XHJcbiAqXHJcbiAqIFdBUk5JTkcgIzE6IENoYW5nZXMgdG8gaG93IGEgc2ltIGhtdGwgZmlsZSBpcyBnZW5lcmF0ZWQgKGluY2x1ZGluZyBgbW9sZWN1bGUtcG9sYXJpdHlfZW4uaG10bGAsIHRoZSBkZXZlbG9wbWVudFxyXG4gKiBodG1sIGZpbGUpIG1hZGUgaXQgaW1wb3NzaWJsZSB0byBtYW51YWxseSBhZGQgSlNtb2wgdG8gdGhlIGh0bWwgZmlsZS4gIFNvIGJlZm9yZSB5b3UgY2FuIHJ1biB0aGlzIHJlcG9zaXRvcnksXHJcbiAqIHlvdSdsbCBuZWVkIHRvIGZpZ3VyZSBvdXQgaG93IHRvIGZpeCB0aGF0LiAgVGhpcyBzY3JpcHQgbmVlZHMgdG8gcnVuIGFmdGVyIHRoZSAzcmQtcGFydHkgbGlicmFyaWVzXHJcbiAqIChqcXVlcnkgaW4gcGFydGljdWxhciksIGFuZCBiZWZvcmUgYW55IFBoRVQtc3BlY2lmaWMgY29kZTpcclxuICpcclxuICogYDxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiIHNyYz1cImpzbW9sLTE0LjIuNC9KU21vbC5taW4ubm9qcS5qc1wiPjwvc2NyaXB0PmBcclxuICpcclxuICogV0FSTklORyAjMjogQXMgc29vbiBhcyB5b3UgYWRkIHRoZSBqbW9sLTE0LjIuNC8gZGlyZWN0b3J5LCB5b3UnbGwgbmVlZCB0byBtYWtlIHN1cmUgdGhhdCBpdCBpcyBleGNsdWRlZCBmcm9tIGFueVxyXG4gKiBsaW50IHByb2Nlc3MuICBJdCBpbmNsdWRlcyBhIGxvdCBvZiAuanMgZmlsZXMsIGFuZCB0aGV5IGRvbid0IGNvbmZvcm0gdG8gUGhFVCdzIGxpbnQgc3RhbmRhcmRzLlxyXG4gKlxyXG4gKiBXQVJOSU5HICMzOiBKU21vbCAxNC4yLjQgaW5jb3JyZWN0bHkgaWRlbnRpZmllcyBpdHNlbGYgYXMgMTQuMi4zIHdoZW4gSm1vbC5fdmVyc2lvbiBpcyBpbnNwZWN0ZWQgaW4gdGhlIGRlYnVnZ2VyLlxyXG4gKlxyXG4gKiBXQVJOSU5HICM0OiBXaGVuIHRoaXMgZmlsZSB3YXMgY29udmVydGVkIHRvIFR5cGVTY3JpcHQgaW4gOS8yMDIyLCBpdCBwYXNzZWQgbGludCBhbmQgdHNjLCBidXQgd2FzIG5vdCB0ZXN0ZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBET00sIERPTU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTVBDb2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL01QQ29sb3JzLmpzJztcclxuaW1wb3J0IE1QUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uLy4uL2NvbW1vbi9NUFF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBtb2xlY3VsZVBvbGFyaXR5IGZyb20gJy4uLy4uL21vbGVjdWxlUG9sYXJpdHkuanMnO1xyXG5pbXBvcnQgRWxlbWVudCBmcm9tICcuLi9tb2RlbC9FbGVtZW50LmpzJztcclxuaW1wb3J0IFJlYWxNb2xlY3VsZSBmcm9tICcuLi9tb2RlbC9SZWFsTW9sZWN1bGUuanMnO1xyXG5pbXBvcnQgUmVhbE1vbGVjdWxlc1ZpZXdQcm9wZXJ0aWVzIGZyb20gJy4vUmVhbE1vbGVjdWxlc1ZpZXdQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IHsgU3VyZmFjZVR5cGUgfSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvU3VyZmFjZVR5cGUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcclxuXHJcbi8vIHN0cmluZ3NcclxuY29uc3QgREVMVEEgPSAnXFx1MDNCNCc7XHJcbmNvbnN0IFJFU1VMVF9UUlVFID0gJ3RydWUnO1xyXG5jb25zdCBSRVNVTFRfRkFMU0UgPSAnZmFsc2UnO1xyXG5cclxudHlwZSBXaW5kb3dLZXkgPSBrZXlvZiB0eXBlb2Ygd2luZG93O1xyXG5cclxuLy8gT3BhcXVlIGhhbmRsZSB0byB0aGUgSlNtb2wgYXBwbGV0LCBzbyAnYW55JyBpcyBhbiBhcHByb3ByaWF0ZSB0eXBlLlxyXG50eXBlIEFwcGxldElkID0gSW50ZW50aW9uYWxBbnk7XHJcblxyXG4vLyBjb25maWd1cmF0aW9uIGZvciB0aGUgSlNtb2wgb2JqZWN0LCBjYWxsZWQgSW5mbyBieSBjb252ZW50aW9uXHJcbnR5cGUgQXBwbGV0Q29uZmlnID0ge1xyXG4gIGNvbG9yOiBzdHJpbmcgfCBDb2xvcjsgLy8gYmFja2dyb3VuZCBjb2xvciBvZiB0aGUgSlNtb2wgb2JqZWN0XHJcbiAgd2lkdGg6IG51bWJlcjsgLy8gd2lkdGggb2YgdGhlIEptb2wgb2JqZWN0IGluIHBpeGVscyBvciBleHByZXNzZWQgYXMgcGVyY2VudCBvZiBpdHMgY29udGFpbmVyIHdpZHRoIGFzIGEgc3RyaW5nIGluIHF1b3RlczogJzEwMCUnLlxyXG4gIGhlaWdodDogbnVtYmVyOyAvLyBoZWlnaHQsIHNpbWlsYXIgZm9ybWF0IGFzIHdpZHRoXHJcbiAgZGVidWc6IGJvb2xlYW47IC8vIFNldCB0aGlzIHZhbHVlIHRvIHRydWUgaWYgeW91IGFyZSBoYXZpbmcgcHJvYmxlbXMgZ2V0dGluZyB5b3VyIHBhZ2UgdG8gc2hvdyB0aGUgSm1vbCBvYmplY3RcclxuICBqMnNQYXRoOiBzdHJpbmc7IC8vIHBhdGggdG8gdGhlIHN1aXRlIG9mIEphdmFTY3JpcHQgbGlicmFyaWVzIG5lZWRlZCBmb3IgSlNtb2xcclxuICBzZXJ2ZXJVUkw6IHN0cmluZzsgLy8gVVJMIHRvIGJlIHVzZWQgZm9yIGdldHRpbmcgZmlsZSBkYXRhIGludG8gbm9uLUphdmEgbW9kYWxpdGllc1xyXG4gIHVzZTogc3RyaW5nOyAvLyBkZXRlcm1pbmVzIHRoZSB2YXJpb3VzIG9wdGlvbnMgdG8gYmUgdHJpZWQgKGFwcGxldCBhbmQgc3Vycm9nYXRlcykgYW5kIHRoZSBvcmRlciBpbiB3aGljaCB0byB0cnkgdGhlbVxyXG4gIHNjcmlwdDogc3RyaW5nOyAvLyBzY3JpcHQgdG8gcnVuIHdoZW4gdGhlIEptb2wgb2JqZWN0IGhhcyBmaW5pc2hlZCBsb2FkaW5nXHJcbiAgcmVhZHlGdW5jdGlvbjogKCBhcHBsZXQ6IEFwcGxldElkICkgPT4gdm9pZDsgLy8gZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSBKbW9sIG9iamVjdCBoYXMgYmVlbiBjcmVhdGVkIGFuZCBpcyByZWFkeSB0byByZWNlaXZlIGNvbW1hbmRzXHJcbiAgZGlzYWJsZUoyU0xvYWRNb25pdG9yOiBib29sZWFuOyAvLyBkaXNhYmxlIGRpc3BsYXkgb2YgbWVzc2FnZXMgaW4gYSBzaW5nbGUgbGluZSwgY29sb3JlZCwgYXQgYm90dG9tLWxlZnQgb2YgdGhlIHBhZ2VcclxuICBkaXNhYmxlSW5pdGlhbENvbnNvbGU6IGJvb2xlYW47IC8vIGF2b2lkcyB0aGUgZGlzcGxheSBvZiBtZXNzYWdlcyBpbiB0aGUgSm1vbCBwYW5lbCB3aGlsZSB0aGUgSm1vbCBvYmplY3QgaXMgYmVpbmcgYnVpbHQgaW5pdGlhbGx5XHJcbn07XHJcblxyXG50eXBlIEptb2xUeXBlID0ge1xyXG4gIHNldERvY3VtZW50OiAoIGRvYzogYm9vbGVhbiApID0+IHZvaWQ7XHJcbiAgZ2V0QXBwbGV0OiAoIGFwcGxldElkOiBBcHBsZXRJZCwgYXBwbGV0Q29uZmlnOiBBcHBsZXRDb25maWcgKSA9PiB2b2lkO1xyXG4gIGdldEFwcGxldEh0bWw6ICggYXBwbGV0SWQ6IEFwcGxldElkICkgPT4gc3RyaW5nO1xyXG4gIHNjcmlwdFdhaXQ6ICggYXBwbGV0OiBBcHBsZXRJZCwgc2NyaXB0OiBzdHJpbmcgKSA9PiBzdHJpbmc7XHJcbiAgZXZhbHVhdGVWYXI6ICggYXBwbGV0OiBBcHBsZXRJZCwgc2NyaXB0OiBzdHJpbmcgKSA9PiBzdHJpbmc7XHJcbn07XHJcblxyXG4vLyBKbW9sIGlzIGxvYWRlZCB2aWEgPHNjcmlwdD4gaW4gdGhlIC5odG1sIGZpbGUsIHRoaXMgcHJldmVudHMgbGludCBmcm9tIGNvbXBsYWluaW5nIHRoZSBKbW9sIGlzIHVuZGVmaW5lZC5cclxuY29uc3QgSm1vbCA9IHdpbmRvd1sgJ0ptb2wnIGFzIFdpbmRvd0tleSBdIGFzIEptb2xUeXBlO1xyXG5cclxuLy8gZWFjaCBKbW9sIG9iamVjdCBpbnN0YW5jZSBpcyBnaXZlbiBhIG5ldyBpZGVudGlmaWVyLCBudW1iZXJlZCBzZXF1ZW50aWFsbHlcclxubGV0IGluc3RhbmNlTnVtYmVyID0gMDtcclxuXHJcbi8vIGlkZW50aWZ5IGEgVVJMIG9iamVjdCwgbm90IHN0YW5kYXJkaXplZCBhY3Jvc3MgYnJvd3NlcnNcclxuY29uc3QgVVJMID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMIHx8IHdpbmRvdztcclxuXHJcbi8vIFNjcmlwdCB0byBydW4gd2hlbiB0aGUgSm1vbCBvYmplY3QgaGFzIGZpbmlzaGVkIGxvYWRpbmdcclxuY29uc3QgU0NSSVBUX0lOSVQgPVxyXG4gICdzZXQgYXV0b2JvbmQgb2ZmXFxuJyArXHJcbiAgJ3NldCBmcmFuayBvZmZcXG4nICsgIC8vIGhpZGUgdGhlIEptb2wgbG9nb1xyXG4gICdzZXQgZGlwb2xlU2NhbGUgMC43NVxcbic7ICAvLyBzbyB0aGF0IG1vbGVjdWxhciBkaXBvbGUgaXNuJ3QgY2xpcHBlZCBieSB2aWV3ZXIgb3IgZXh0ZW5kIGJleW9uZCBpc29zdXJmYWNlXHJcblxyXG4vLyBKbW9sIGFjdGlvbnMgdG8gdW5iaW5kLCBhbGwgZXhjZXB0IF9yb3RhdGVcclxuY29uc3QgSm1vbEFjdGlvblZhbHVlcyA9IFtcclxuICAnX2NsaWNrRnJhbmsnLFxyXG4gICdfZGVwdGgnLFxyXG4gICdfZHJhZ0RyYXdPYmplY3QnLFxyXG4gICdfZHJhZ0RyYXdQb2ludCcsXHJcbiAgJ19kcmFnTGFiZWwnLFxyXG4gICdfZHJhZ1NlbGVjdGVkJyxcclxuICAnX25hdlRyYW5zbGF0ZScsXHJcbiAgJ19waWNrQXRvbScsXHJcbiAgJ19waWNrSXNvc3VyZmFjZScsXHJcbiAgJ19waWNrTGFiZWwnLFxyXG4gICdfcGlja01lYXN1cmUnLFxyXG4gICdfcGlja05hdmlnYXRlJyxcclxuICAnX3BpY2tQb2ludCcsXHJcbiAgJ19wb3B1cE1lbnUnLFxyXG4gICdfcmVzZXQnLFxyXG4gICdfcm90YXRlU2VsZWN0ZWQnLFxyXG4gICdfcm90YXRlWicsXHJcbiAgJ19yb3RhdGVab3Jab29tJyxcclxuICAnX3NlbGVjdCcsXHJcbiAgJ19zZWxlY3RBbmROb3QnLFxyXG4gICdfc2VsZWN0Tm9uZScsXHJcbiAgJ19zZWxlY3RPcicsXHJcbiAgJ19zZWxlY3RUb2dnbGUnLFxyXG4gICdfc2VsZWN0VG9nZ2xlT3InLFxyXG4gICdfc2V0TWVhc3VyZScsXHJcbiAgJ19zbGFiJyxcclxuICAnX3NsYWJBbmREZXB0aCcsXHJcbiAgJ19zbGlkZVpvb20nLFxyXG4gICdfc3BpbkRyYXdPYmplY3RDQ1cnLFxyXG4gICdfc3BpbkRyYXdPYmplY3RDVycsXHJcbiAgJ19zd2lwZScsXHJcbiAgJ190cmFuc2xhdGUnLFxyXG4gICdfd2hlZWxab29tJ1xyXG5dIGFzIGNvbnN0O1xyXG5cclxudHlwZSBKbW9sQWN0aW9uID0gKCB0eXBlb2YgSm1vbEFjdGlvblZhbHVlcyApW251bWJlcl07XHJcblxyXG50eXBlIEpTbW9sVmlld2VyQ29sb3IgPSBzdHJpbmcgfCBDb2xvcjtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgdmlld2VyU2l6ZT86IERpbWVuc2lvbjI7XHJcbiAgdmlld2VyRmlsbD86IEpTbW9sVmlld2VyQ29sb3I7XHJcbiAgdmlld2VyU3Ryb2tlPzogSlNtb2xWaWV3ZXJDb2xvcjtcclxufTtcclxuXHJcbnR5cGUgSlNtb2xWaWV3ZXJOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPERPTU9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEpTbW9sVmlld2VyTm9kZSBleHRlbmRzIERPTSB7XHJcblxyXG4gIC8vIGVsZW1lbnRzIGluIHRoZSBtb2xlY3VsZSBkaXNwbGF5ZWQgYnkgdGhlIHZpZXdlclxyXG4gIHB1YmxpYyByZWFkb25seSBlbGVtZW50c1Byb3BlcnR5OiBQcm9wZXJ0eTxFbGVtZW50W10gfCBudWxsPjtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBtb2xlY3VsZVByb3BlcnR5OiBQcm9wZXJ0eTxSZWFsTW9sZWN1bGU+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmlld1Byb3BlcnRpZXM6IFJlYWxNb2xlY3VsZXNWaWV3UHJvcGVydGllcztcclxuICBwcml2YXRlIHJlYWRvbmx5IHZpZXdlclNpemU6IERpbWVuc2lvbjI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSB2aWV3ZXJGaWxsOiBKU21vbFZpZXdlckNvbG9yO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmlld2VyU3Ryb2tlOiBKU21vbFZpZXdlckNvbG9yO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGl2OiBIVE1MRGl2RWxlbWVudDtcclxuICBwcml2YXRlIGFwcGxldDogQXBwbGV0SWQgfCBudWxsO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vbGVjdWxlUHJvcGVydHk6IFByb3BlcnR5PFJlYWxNb2xlY3VsZT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICB2aWV3UHJvcGVydGllczogUmVhbE1vbGVjdWxlc1ZpZXdQcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBKU21vbFZpZXdlck5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SlNtb2xWaWV3ZXJOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIERPTU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIHZpZXdlclNpemU6IG5ldyBEaW1lbnNpb24yKCAyMDAsIDIwMCApLFxyXG4gICAgICB2aWV3ZXJGaWxsOiAnd2hpdGUnLFxyXG4gICAgICB2aWV3ZXJTdHJva2U6ICdibGFjaycsIC8vIHtzdHJpbmd9IGNvbG9yIG9mIHRoZSB2aWV3ZXIncyBiYWNrZ3JvdW5kXHJcblxyXG4gICAgICAvLyBET01PcHRpb25zXHJcbiAgICAgIHByZXZlbnRUcmFuc2Zvcm06IHRydWVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFB1dCB0aGUgSlNtb2wgb2JqZWN0IGluIGEgZGl2LCBzaXplZCB0byBtYXRjaCB0aGUgSlNtb2wgb2JqZWN0XHJcbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xyXG4gICAgZGl2LnN0eWxlLndpZHRoID0gYCR7b3B0aW9ucy52aWV3ZXJTaXplLndpZHRofXB4YDtcclxuICAgIGRpdi5zdHlsZS5oZWlnaHQgPSBgJHtvcHRpb25zLnZpZXdlclNpemUuaGVpZ2h0fXB4YDtcclxuICAgIGRpdi5zdHlsZS5ib3JkZXIgPSBgMXB4IHNvbGlkICR7b3B0aW9ucy52aWV3ZXJTdHJva2V9YDtcclxuXHJcbiAgICBzdXBlciggZGl2LCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5tb2xlY3VsZVByb3BlcnR5ID0gbW9sZWN1bGVQcm9wZXJ0eTtcclxuICAgIHRoaXMudmlld1Byb3BlcnRpZXMgPSB2aWV3UHJvcGVydGllcztcclxuICAgIHRoaXMudmlld2VyU2l6ZSA9IG9wdGlvbnMudmlld2VyU2l6ZTtcclxuICAgIHRoaXMudmlld2VyRmlsbCA9IG9wdGlvbnMudmlld2VyRmlsbDtcclxuICAgIHRoaXMudmlld2VyU3Ryb2tlID0gb3B0aW9ucy52aWV3ZXJTdHJva2U7XHJcbiAgICB0aGlzLmRpdiA9IGRpdjtcclxuICAgIHRoaXMuZWxlbWVudHNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxFbGVtZW50W10gfCBudWxsPiggbnVsbCApO1xyXG5cclxuICAgIC8vIEpTbW9sIG11c3QgYmUgaW5pdGlhbGl6ZWQgYWZ0ZXIgdGhlIHNpbSBpcyBydW5uaW5nXHJcbiAgICB0aGlzLmFwcGxldCA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNJbml0aWFsaXplZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAoIHRoaXMuYXBwbGV0ICE9PSBudWxsICk7XHJcbiAgfVxyXG5cclxuICAvLyBDYWxsIHRoaXMgYWZ0ZXIgdGhlIHNpbSBoYXMgc3RhcnRlZCBydW5uaW5nXHJcbiAgcHVibGljIGluaXRpYWxpemUoKTogdm9pZCB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaXNJbml0aWFsaXplZCgpLCAnYWxyZWFkeSBpbml0aWFsaXplZCcgKTtcclxuXHJcbiAgICAvLyBDYWxsZWQgd2hlbiB0aGUgSm1vbCBvYmplY3QgaGFzIGJlZW4gY3JlYXRlZCBhbmQgaXMgcmVhZHkgdG8gcmVjZWl2ZSBjb21tYW5kc1xyXG4gICAgY29uc3QgcmVhZHlGdW5jdGlvbiA9ICggYXBwbGV0OiBBcHBsZXRJZCApID0+IHtcclxuICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coICdyZWFkeUZ1bmN0aW9uJyApO1xyXG5cclxuICAgICAgdW5iaW5kQWN0aW9ucyggYXBwbGV0LCBKbW9sQWN0aW9uVmFsdWVzICk7XHJcblxyXG4gICAgICB0aGlzLm1vbGVjdWxlUHJvcGVydHkubGluayggbW9sZWN1bGUgPT4ge1xyXG4gICAgICAgIHVwZGF0ZU1vbGVjdWxlKCBhcHBsZXQsIG1vbGVjdWxlLCB0aGlzLnZpZXdQcm9wZXJ0aWVzICk7XHJcbiAgICAgICAgdXBkYXRlRWxlbWVudHMoIGFwcGxldCwgdGhpcy5lbGVtZW50c1Byb3BlcnR5ICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMudmlld1Byb3BlcnRpZXMuYm9uZERpcG9sZXNWaXNpYmxlUHJvcGVydHkubGluayggYm9uZERpcG9sZXNWaXNpYmxlID0+IHtcclxuICAgICAgICB1cGRhdGVEaXBvbGVzKCBhcHBsZXQsIGJvbmREaXBvbGVzVmlzaWJsZSwgdGhpcy52aWV3UHJvcGVydGllcy5tb2xlY3VsYXJEaXBvbGVWaXNpYmxlUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgdGhpcy52aWV3UHJvcGVydGllcy5tb2xlY3VsYXJEaXBvbGVWaXNpYmxlUHJvcGVydHkubGluayggbW9sZWN1bGFyRGlwb2xlVmlzaWJsZSA9PiB7XHJcbiAgICAgICAgdXBkYXRlRGlwb2xlcyggYXBwbGV0LCB0aGlzLnZpZXdQcm9wZXJ0aWVzLmJvbmREaXBvbGVzVmlzaWJsZVByb3BlcnR5LnZhbHVlLCBtb2xlY3VsYXJEaXBvbGVWaXNpYmxlICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHRoaXMudmlld1Byb3BlcnRpZXMucGFydGlhbENoYXJnZXNWaXNpYmxlUHJvcGVydHkubGluayggcGFydGlhbENoYXJnZXNWaXNpYmxlID0+IHtcclxuICAgICAgICB1cGRhdGVMYWJlbHMoIGFwcGxldCwgdGhpcy52aWV3UHJvcGVydGllcy5hdG9tTGFiZWxzVmlzaWJsZVByb3BlcnR5LnZhbHVlLCBwYXJ0aWFsQ2hhcmdlc1Zpc2libGUgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgdGhpcy52aWV3UHJvcGVydGllcy5hdG9tTGFiZWxzVmlzaWJsZVByb3BlcnR5LmxpbmsoIGF0b21MYWJlbHNWaXNpYmxlID0+IHtcclxuICAgICAgICB1cGRhdGVMYWJlbHMoIGFwcGxldCwgYXRvbUxhYmVsc1Zpc2libGUsIHRoaXMudmlld1Byb3BlcnRpZXMucGFydGlhbENoYXJnZXNWaXNpYmxlUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgdGhpcy52aWV3UHJvcGVydGllcy5zdXJmYWNlVHlwZVByb3BlcnR5LmxpbmsoIHN1cmZhY2VUeXBlID0+IHtcclxuICAgICAgICB1cGRhdGVTdXJmYWNlKCBhcHBsZXQsIHN1cmZhY2VUeXBlICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gY29uZmlndXJhdGlvbiBmb3IgdGhlIEpTbW9sIG9iamVjdCwgY2FsbGVkIEluZm8gYnkgY29udmVudGlvblxyXG4gICAgY29uc3QgYXBwbGV0Q29uZmlnOiBBcHBsZXRDb25maWcgPSB7XHJcbiAgICAgIGNvbG9yOiB0b0ptb2xDb2xvciggdGhpcy52aWV3ZXJGaWxsICksIC8vIGJhY2tncm91bmQgY29sb3Igb2YgdGhlIEpTbW9sIG9iamVjdFxyXG4gICAgICB3aWR0aDogdGhpcy52aWV3ZXJTaXplLndpZHRoLCAvLyB3aWR0aCBvZiB0aGUgSm1vbCBvYmplY3QgaW4gcGl4ZWxzIG9yIGV4cHJlc3NlZCBhcyBwZXJjZW50IG9mIGl0cyBjb250YWluZXIgd2lkdGggYXMgYSBzdHJpbmcgaW4gcXVvdGVzOiAnMTAwJScuXHJcbiAgICAgIGhlaWdodDogdGhpcy52aWV3ZXJTaXplLmhlaWdodCwgLy8gaGVpZ2h0LCBzaW1pbGFyIGZvcm1hdCBhcyB3aWR0aFxyXG4gICAgICBkZWJ1ZzogZmFsc2UsIC8vIFNldCB0aGlzIHZhbHVlIHRvIHRydWUgaWYgeW91IGFyZSBoYXZpbmcgcHJvYmxlbXMgZ2V0dGluZyB5b3VyIHBhZ2UgdG8gc2hvdyB0aGUgSm1vbCBvYmplY3RcclxuICAgICAgajJzUGF0aDogJ2pzbW9sLTE0LjIuNC9qMnMnLCAvLyBwYXRoIHRvIHRoZSBzdWl0ZSBvZiBKYXZhU2NyaXB0IGxpYnJhcmllcyBuZWVkZWQgZm9yIEpTbW9sXHJcbiAgICAgIHNlcnZlclVSTDogJ2pzbW9sLTE0LjIuNC9waHAvanNtb2wucGhwJywgLy8gVVJMIHRvIGJlIHVzZWQgZm9yIGdldHRpbmcgZmlsZSBkYXRhIGludG8gbm9uLUphdmEgbW9kYWxpdGllc1xyXG4gICAgICB1c2U6ICdIVE1MNScsIC8vIGRldGVybWluZXMgdGhlIHZhcmlvdXMgb3B0aW9ucyB0byBiZSB0cmllZCAoYXBwbGV0IGFuZCBzdXJyb2dhdGVzKSBhbmQgdGhlIG9yZGVyIGluIHdoaWNoIHRvIHRyeSB0aGVtXHJcbiAgICAgIHNjcmlwdDogU0NSSVBUX0lOSVQsIC8vIHNjcmlwdCB0byBydW4gd2hlbiB0aGUgSm1vbCBvYmplY3QgaGFzIGZpbmlzaGVkIGxvYWRpbmdcclxuICAgICAgcmVhZHlGdW5jdGlvbjogcmVhZHlGdW5jdGlvbiwgLy8gZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSBKbW9sIG9iamVjdCBoYXMgYmVlbiBjcmVhdGVkIGFuZCBpcyByZWFkeSB0byByZWNlaXZlIGNvbW1hbmRzXHJcbiAgICAgIGRpc2FibGVKMlNMb2FkTW9uaXRvcjogdHJ1ZSwgLy8gZGlzYWJsZSBkaXNwbGF5IG9mIG1lc3NhZ2VzIGluIGEgc2luZ2xlIGxpbmUsIGNvbG9yZWQsIGF0IGJvdHRvbS1sZWZ0IG9mIHRoZSBwYWdlXHJcbiAgICAgIGRpc2FibGVJbml0aWFsQ29uc29sZTogdHJ1ZSAvLyBhdm9pZHMgdGhlIGRpc3BsYXkgb2YgbWVzc2FnZXMgaW4gdGhlIEptb2wgcGFuZWwgd2hpbGUgdGhlIEptb2wgb2JqZWN0IGlzIGJlaW5nIGJ1aWx0IGluaXRpYWxseVxyXG4gICAgfTtcclxuXHJcbiAgICBKbW9sLnNldERvY3VtZW50KCBmYWxzZSApOyAvLyB0ZWxsIEptb2wgbm90IHRvIGFkZCB0aGUgdmlld2VyIHRvIG91ciBIVE1MIGRvY3VtZW50XHJcbiAgICBjb25zdCBhcHBsZXRJZCA9IGBqbW9sQXBwbGV0JHtpbnN0YW5jZU51bWJlcisrfWA7IC8vIGNyZWF0ZSBhIHVuaXF1ZSBpZCBmb3IgdGhpcyB2aWV3ZXJcclxuICAgIEptb2wuZ2V0QXBwbGV0KCBhcHBsZXRJZCwgYXBwbGV0Q29uZmlnICk7IC8vIGNyZWF0ZXMgd2luZG93W2FwcGxldElkXVxyXG5cclxuICAgIHRoaXMuYXBwbGV0ID0gd2luZG93WyBhcHBsZXRJZCBhcyBXaW5kb3dLZXkgXTsgLy8gc28gdGhhdCB3ZSBkb24ndCBwb2xsdXRlIG91ciBjb2RlIHdpdGggd2luZG93W2FwcGxldElkXVxyXG5cclxuICAgIHRoaXMuZGl2LmlubmVySFRNTCA9IEptb2wuZ2V0QXBwbGV0SHRtbCggdGhpcy5hcHBsZXQgKTsgLy8gYWRkIHRoZSB2aWV3ZXIncyBIVE1MIGZyYWdtZW50IHRvIHRoaXMgbm9kZSdzIEhUTUwgZWxlbWVudFxyXG5cclxuICAgIC8vIFRPRE8gV2h5IGRvIHdlIG5lZWQgdG8gY2FsbCB0aGlzPyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL21vbGVjdWxlLXBvbGFyaXR5L2lzc3Vlcy8xNFxyXG4gICAgdGhpcy5hcHBsZXQuX2NvdmVyKCBmYWxzZSApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gZXhlY3V0ZXMgYSBKU21vbCBzY3JpcHRcclxuZnVuY3Rpb24gZG9TY3JpcHQoIGFwcGxldDogQXBwbGV0SWQsIHNjcmlwdDogc3RyaW5nICk6IHZvaWQge1xyXG4gIC8vIHVzZSBzY3JpcHRXYWl0ICh3aGljaCBpcyBzeW5jaHJvbm91cykgc28gdGhhdCB3ZSBnZXQgc3RhdHVzIGFuZCBjYW4gdXNlIGV2YWx1YXRlVmFyIGVsc2V3aGVyZVxyXG4gIGNvbnN0IHN0YXR1cyA9IEptb2wuc2NyaXB0V2FpdCggYXBwbGV0LCBzY3JpcHQgKTtcclxuICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYGRvU2NyaXB0LCBzdGF0dXM9JHtzdGF0dXN9YCApO1xyXG59XHJcblxyXG4vKipcclxuICogVW5iaW5kcyBtb3VzZSBhY3Rpb25zIGZyb20gSlNtb2wgYWN0aW9ucy5cclxuICovXHJcbmZ1bmN0aW9uIHVuYmluZEFjdGlvbnMoIGFwcGxldDogQXBwbGV0SWQsIGFjdGlvbnM6IHJlYWRvbmx5IEptb2xBY3Rpb25bXSApOiB2b2lkIHtcclxuICBsZXQgc2NyaXB0ID0gJyc7XHJcbiAgYWN0aW9ucy5mb3JFYWNoKCBhY3Rpb24gPT4ge1xyXG4gICAgc2NyaXB0ICs9IGB1bmJpbmQgJHthY3Rpb259XFxuYDtcclxuICB9ICk7XHJcbiAgZG9TY3JpcHQoIGFwcGxldCwgc2NyaXB0ICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb252ZXJ0cyB0byBhIEpTbW9sIGNvbG9yIGZvciB0aGUgZm9ybSAnW3IsZyxiXSdcclxuICovXHJcbmZ1bmN0aW9uIHRvSm1vbENvbG9yKCBqU21vbFZpZXdlckNvbG9yOiBKU21vbFZpZXdlckNvbG9yICk6IHN0cmluZyB7XHJcbiAgY29uc3QgY29sb3IgPSBDb2xvci50b0NvbG9yKCBqU21vbFZpZXdlckNvbG9yICk7XHJcbiAgcmV0dXJuIGBbJHtjb2xvci5yZWR9LCR7Y29sb3IuZ3JlZW59LCR7Y29sb3IuYmx1ZX1dYDtcclxufVxyXG5cclxuLyoqXHJcbiAqIExvYWRzIGEgbW9sZWN1bGUgYnkgVVJMLCB0aGVuIHNldHMgdGhpbmdzIHRoYXQgbXVzdCBiZSByZXNldCB3aGVuZXZlciB0aGUgbW9sZWN1bGUgY2hhbmdlcy5cclxuICovXHJcbmZ1bmN0aW9uIHVwZGF0ZU1vbGVjdWxlKCBhcHBsZXQ6IEFwcGxldElkLCBtb2xlY3VsZTogUmVhbE1vbGVjdWxlLCB2aWV3UHJvcGVydGllczogUmVhbE1vbGVjdWxlc1ZpZXdQcm9wZXJ0aWVzICk6IHZvaWQge1xyXG4gIHBoZXQubG9nICYmIHBoZXQubG9nKCAndXBkYXRlTW9sZWN1bGUnICk7XHJcblxyXG4gIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoIG5ldyBCbG9iKCBbIG1vbGVjdWxlLm1vbDJEYXRhIF0sIHsgdHlwZTogJ3RleHQvcGxhaW4nLCBlbmRpbmdzOiAnbmF0aXZlJyB9ICkgKTtcclxuXHJcbiAgLy8gbG9hZCBtb2xlY3VsZVxyXG4gIGRvU2NyaXB0KCBhcHBsZXQsIGBsb2FkICR7dXJsfWAgKTtcclxuXHJcbiAgLy8gcmVzZXQgbWlzYyBzZXR0aW5ncyB0aGF0IGRvbid0IHBlcnNpc3RcclxuICBkb1NjcmlwdCggYXBwbGV0LFxyXG4gICAgJ3NlbGVjdCBveHlnZW47IGNvbG9yIFsyNTUsODUsMF1cXG4nICsgLy8gY29sb3JibGluZCByZWQgb3h5Z2VuXHJcbiAgICAnc2VsZWN0IGFsbFxcbicgKyAvLyBiZSBwb2xpdGUgdG8gb3RoZXIgY29tbWFuZHMgdGhhdCBhc3N1bWUgdGhhdCBldmVyeXRoaW5nIGlzIHNlbGVjdGVkXHJcbiAgICAnd2lyZWZyYW1lIDAuMVxcbicgKyAvLyBkcmF3IGJvbmRzIGFzIGxpbmVzXHJcbiAgICAnc3BhY2VmaWxsIDI1JVxcbicgKyAgLy8gcmVuZGVyIGF0b21zIGFzIGEgcGVyY2VudGFnZSBvZiB0aGUgdmFuIGRlciBXYWFscyByYWRpdXNcclxuICAgICdjb2xvciBib25kcyBbMTI4LDEyOCwxMjhdXFxuJyArIC8vIGdyYXkgYm9uZHNcclxuICAgICdob3ZlciBvZmYnICk7IC8vIGRvbid0IHNob3cgYXRvbSBsYWJlbCB3aGVuIGhvdmVyaW5nIHdpdGggbW91c2VcclxuXHJcbiAgLy8gcmVzZXQgc2ltLXNwZWNpZmljIHNldHRpbmdzIHRoYXQgZG9uJ3QgcGVyc2lzdFxyXG4gIHVwZGF0ZURpcG9sZXMoIGFwcGxldCwgdmlld1Byb3BlcnRpZXMuYm9uZERpcG9sZXNWaXNpYmxlUHJvcGVydHkudmFsdWUsIHZpZXdQcm9wZXJ0aWVzLm1vbGVjdWxhckRpcG9sZVZpc2libGVQcm9wZXJ0eS52YWx1ZSApO1xyXG4gIHVwZGF0ZUxhYmVscyggYXBwbGV0LCB2aWV3UHJvcGVydGllcy5hdG9tTGFiZWxzVmlzaWJsZVByb3BlcnR5LnZhbHVlLCB2aWV3UHJvcGVydGllcy5wYXJ0aWFsQ2hhcmdlc1Zpc2libGVQcm9wZXJ0eS52YWx1ZSApO1xyXG4gIHVwZGF0ZVN1cmZhY2UoIGFwcGxldCwgdmlld1Byb3BlcnRpZXMuc3VyZmFjZVR5cGVQcm9wZXJ0eS52YWx1ZSApO1xyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlcyB0aGUgZWxlbWVudHMgaW4gdGhlIG1vbGVjdWxlIHRoYXQgaXMgY3VycmVudGx5IGRpc3BsYXllZCBieSB0aGUgdmlld2VyLlxyXG4gKi9cclxuZnVuY3Rpb24gdXBkYXRlRWxlbWVudHMoIGFwcGxldDogQXBwbGV0SWQsIGVsZW1lbnRzUHJvcGVydHk6IFByb3BlcnR5PEVsZW1lbnRbXSB8IG51bGw+ICk6IHZvaWQge1xyXG5cclxuICAvKlxyXG4gICAqIFJldHVybnMgYSBzdHJpbmcgd2hlcmUgZWxlbW5vIGFuZCBjb2xvciBhcmUgc2VwYXJhdGVkIGJ5IG5ld2xpbmVzLlxyXG4gICAqIEVhY2ggY29sb3IgaXMgMyBjb21wb25lbnRzIChyZ2IpIHN1cnJvdW5kZWQgYnkgY3VybHkgYnJhY2VzLlxyXG4gICAqIEVnLCBmb3IgSEY6ICcxXFxuezI1NSAyNTUgMjU1fVxcbjlcXG57MTQ0IDIyNCA4MH1cXG4nXHJcbiAgICovXHJcbiAgbGV0IHN0YXR1cyA9IEptb2wuZXZhbHVhdGVWYXIoIGFwcGxldCxcclxuICAgICdzY3JpcHQoXFwnJyArXHJcbiAgICAnbiA9IHsqfS5sZW5ndGhcXG4nICtcclxuICAgICdmb3IgKCBpID0gMDsgaSA8IG47IGkrKyApIHtcXG4nICtcclxuICAgICcgICAgcHJpbnQgeyp9W2ldLmVsZW1ub1xcbicgK1xyXG4gICAgJyAgICBwcmludCB7Kn1baV0uY29sb3JcXG4nICtcclxuICAgICd9JyArXHJcbiAgICAnXFwnKScgKTtcclxuICBpZiAoIHN0YXR1cyA9PT0gbnVsbCB8fCBzdGF0dXMgPT09ICdFUlJPUicgKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGBKU21vbFZpZXdlck5vZGUudXBkYXRlRWxlbWVudHMsIHNjcmlwdCBlcnJvcjogJHtzdGF0dXN9YCApO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBSZXBsYWNlIHRoZSBzcGVjaWFsIGNoYXJzIHdpdGggc3BhY2VzLCB0byBtYWtlIHRoaXMgZWFzaWVyIHRvIHBhcnNlLlxyXG4gICAqIEVnLCBmb3IgSEY6ICcxIDI1NSAyNTUgMjU1IDkgMTQ0IDIyNCA4MCAnXHJcbiAgICovXHJcbiAgc3RhdHVzID0gc3RhdHVzLnJlcGxhY2UoIC9cXG4vZywgJyAnICkucmVwbGFjZSggL3svZywgJycgKS5yZXBsYWNlKCAvfS9nLCAnJyApO1xyXG4gIHBoZXQubG9nICYmIHBoZXQubG9nKCBgdXBkYXRlRWxlbWVudHMsIHN0YXR1cz0ke3N0YXR1c31gICk7XHJcblxyXG4gIC8qXHJcbiAgICogTm93IHRoYXQgdGhlIHRva2VucyBhcmUgc2VwYXJhdGVkIGJ5IHNwYWNlcywgc3BsaXQgdGhlIHN0cmluZyBpbnRvIGFuIGFycmF5LlxyXG4gICAqIEVnLCBmb3IgSEY6IFsnMScsJzI1NScsJzI1NScsJzI1NScsJzknLCcxNDQnLCcyMjQnLCc4MCddXHJcbiAgICovXHJcbiAgY29uc3QgdG9rZW5zID0gc3RhdHVzLnNwbGl0KCAnICcgKTtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCB0b2tlbnMubGVuZ3RoICUgNCA9PT0gMCwgJ2VhY2ggZWxlbWVudCBzaG91bGQgaGF2ZSA0IHRva2VucycgKTtcclxuXHJcbiAgLy8gQ29udmVydCB0aGUgdG9rZW5zIHRvIGFuIGFycmF5IG9mIHtFbGVtZW50fS5cclxuICBjb25zdCBlbGVtZW50cyA9IFtdO1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkgPSBpICsgNCApIHtcclxuICAgIGNvbnN0IGVsZW1lbnROdW1iZXIgPSBOdW1iZXIoIHRva2Vuc1sgaSBdICk7XHJcbiAgICBjb25zdCBjb2xvciA9IG5ldyBDb2xvciggTnVtYmVyKCB0b2tlbnNbIGkgKyAxIF0gKSwgTnVtYmVyKCB0b2tlbnNbIGkgKyAyIF0gKSwgTnVtYmVyKCB0b2tlbnNbIGkgKyAzIF0gKSApO1xyXG4gICAgZWxlbWVudHMucHVzaCggbmV3IEVsZW1lbnQoIGVsZW1lbnROdW1iZXIsIGNvbG9yICkgKTtcclxuICB9XHJcbiAgZWxlbWVudHNQcm9wZXJ0eS52YWx1ZSA9IGVsZW1lbnRzO1xyXG59XHJcblxyXG4vKipcclxuICogV2hlbiBhbnkgZGlwb2xlIGlzIHZpc2libGUsIG1ha2UgdGhlIGF0b21zIGFuZCBib25kcyB0cmFuc2x1Y2VudCwgc28gd2UgY2FuIHNlZSB0aGUgZGlwb2xlcyB0aHJvdWdoIHRoZW0uXHJcbiAqL1xyXG5mdW5jdGlvbiB1cGRhdGVUcmFuc2x1Y2VuY3koIGFwcGxldDogQXBwbGV0SWQsIGJvbmREaXBvbGVzVmlzaWJsZTogYm9vbGVhbiwgbW9sZWN1bGFyRGlwb2xlVmlzaWJsZTogYm9vbGVhbiApOiB2b2lkIHtcclxuICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggJ3VwZGF0ZVRyYW5zcGFyZW5jeScgKTtcclxuICBjb25zdCBhcmcgPSAoIGJvbmREaXBvbGVzVmlzaWJsZSB8fCBtb2xlY3VsYXJEaXBvbGVWaXNpYmxlICkgPyAnMC4yNScgOiAnMC4wJzsgLy8gMC4wPW9wYXF1ZSwgMS4wPXRyYW5zcGFyZW50XHJcbiAgZG9TY3JpcHQoIGFwcGxldCwgYGNvbG9yIGF0b21zIHRyYW5zbHVjZW50ICR7YXJnfWAgKTtcclxuICBkb1NjcmlwdCggYXBwbGV0LCBgY29sb3IgYm9uZHMgdHJhbnNsdWNlbnQgJHthcmd9YCApO1xyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlcyB2aXNpYmlsaXR5IG9mIGRpcG9sZXMuXHJcbiAqL1xyXG5mdW5jdGlvbiB1cGRhdGVEaXBvbGVzKCBhcHBsZXQ6IEFwcGxldElkLCBib25kRGlwb2xlc1Zpc2libGU6IGJvb2xlYW4sIG1vbGVjdWxhckRpcG9sZVZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgcGhldC5sb2cgJiYgcGhldC5sb2coICd1cGRhdGVEaXBvbGVzJyApO1xyXG5cclxuICBpZiAoIGJvbmREaXBvbGVzVmlzaWJsZSApIHtcclxuICAgIGRvU2NyaXB0KCBhcHBsZXQsICdkaXBvbGUgYm9uZHMgb24gd2lkdGggMC4wNScgKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBkb1NjcmlwdCggYXBwbGV0LCAnZGlwb2xlIGJvbmRzIG9mZicgKTtcclxuICB9XHJcblxyXG4gIGlmICggbW9sZWN1bGFyRGlwb2xlVmlzaWJsZSApIHtcclxuICAgIGRvU2NyaXB0KCBhcHBsZXQsICdkaXBvbGUgbW9sZWN1bGFyIG9uIHdpZHRoIDAuMDUnICk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgZG9TY3JpcHQoIGFwcGxldCwgJ2RpcG9sZSBtb2xlY3VsYXIgb2ZmJyApO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlVHJhbnNsdWNlbmN5KCBhcHBsZXQsIGJvbmREaXBvbGVzVmlzaWJsZSwgbW9sZWN1bGFyRGlwb2xlVmlzaWJsZSApO1xyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlcyB2aXNpYmlsaXR5IG9mIGxhYmVscyBvbiB0aGUgYXRvbXMsIHRvIHNob3cgYXRvbSBuYW1lcywgcGFydGlhbCBjaGFyZ2VzLCBvciBib3RoLlxyXG4gKi9cclxuZnVuY3Rpb24gdXBkYXRlTGFiZWxzKCBhcHBsZXQ6IEFwcGxldElkLCBhdG9tTGFiZWxzVmlzaWJsZTogYm9vbGVhbiwgcGFydGlhbENoYXJnZXNWaXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xyXG4gIHBoZXQubG9nICYmIHBoZXQubG9nKCAndXBkYXRlTGFiZWxzJyApO1xyXG5cclxuICBpZiAoIGF0b21MYWJlbHNWaXNpYmxlIHx8IHBhcnRpYWxDaGFyZ2VzVmlzaWJsZSApIHtcclxuXHJcbiAgICBsZXQgYXJncyA9ICcnO1xyXG4gICAgaWYgKCBhdG9tTGFiZWxzVmlzaWJsZSApIHtcclxuICAgICAgYXJncyArPSAnICVbYXRvbU5hbWVdJzsgLy8gc2hvdyBlbGVtZW50IGFuZCBzZXF1ZW50aWFsIGF0b20gaW5kZXhcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHBhcnRpYWxDaGFyZ2VzVmlzaWJsZSApIHtcclxuICAgICAgaWYgKCBhdG9tTGFiZWxzVmlzaWJsZSApIHtcclxuICAgICAgICBhcmdzICs9ICd8JzsgLy8gbGluZSBzZXBhcmF0b3JcclxuICAgICAgfVxyXG4gICAgICBhcmdzICs9IGAke0RFTFRBfT0lLjJbcGFydGlhbENoYXJnZV1gOyAvLyBzaG93IHBhcnRpYWwgY2hhcmdlc1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERvIHRoaXMgYXMgYSBzaW5nbGUgc2NyaXB0LCBvciB5b3UnbGwgc2VlIGF0b20gbGFiZWxzIGp1bXAgYXJvdW5kLlxyXG4gICAgZG9TY3JpcHQoIGFwcGxldCxcclxuICAgICAgYGxhYmVsICR7YXJnc31cXG5gICtcclxuICAgICAgJ3NldCBsYWJlbGFsaWdubWVudCBjZW50ZXJcXG4nICsgLy8gY2VudGVyIGxhYmVscyBvbiBhdG9tc1xyXG4gICAgICAnc2V0IGxhYmVsb2Zmc2V0IDAgMFxcbicgK1xyXG4gICAgICAnY29sb3IgbGFiZWxzIGJsYWNrXFxuJyArICAgLy8gY29sb3IgZm9yIGFsbCBsYWJlbHNcclxuICAgICAgJ2ZvbnQgbGFiZWxzIDE4IHNhbnNlcmlmXFxuJyAgLy8gZm9udCBmb3IgYWxsIGxhYmVsc1xyXG4gICAgKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBkb1NjcmlwdCggYXBwbGV0LCAnbGFiZWwgb2ZmJyApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZXMgdGhlIHR5cGUgb2Ygc3VyZmFjZSBkaXNwbGF5ZWQuXHJcbiAqL1xyXG5mdW5jdGlvbiB1cGRhdGVTdXJmYWNlKCBhcHBsZXQ6IEFwcGxldElkLCBzdXJmYWNlVHlwZTogU3VyZmFjZVR5cGUgKTogdm9pZCB7XHJcbiAgcGhldC5sb2cgJiYgcGhldC5sb2coICd1cGRhdGVTdXJmYWNlJyApO1xyXG5cclxuICBjb25zdCBkaWF0b21pYyA9IGlzSG9tb2dlbmVvdXNEaWF0b21pYyggYXBwbGV0ICk7XHJcbiAgaWYgKCBzdXJmYWNlVHlwZSA9PT0gJ2VsZWN0cm9zdGF0aWNQb3RlbnRpYWwnICkge1xyXG4gICAgaWYgKCBNUFF1ZXJ5UGFyYW1ldGVycy5zdXJmYWNlQ29sb3IgPT09ICdST1lHQicgKSB7XHJcbiAgICAgIGlmICggZGlhdG9taWMgKSB7XHJcbiAgICAgICAgZG9TY3JpcHQoIGFwcGxldCwgYGlzb3N1cmZhY2UgVkRXIGNvbG9yICR7dG9KbW9sQ29sb3IoIE1QQ29sb3JzLk5FVVRSQUxfUE9URU5USUFMICl9IHRyYW5zbHVjZW50YCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGRvU2NyaXB0KCBhcHBsZXQsICdpc29zdXJmYWNlIFZEVyBtYXAgTUVQIHRyYW5zbHVjZW50JyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHsgLy8gJ1JXQidcclxuICAgICAgaWYgKCBkaWF0b21pYyApIHtcclxuICAgICAgICBkb1NjcmlwdCggYXBwbGV0LCAnaXNvc3VyZmFjZSBWRFcgY29sb3Igd2hpdGUgdHJhbnNsdWNlbnQnICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgZG9TY3JpcHQoIGFwcGxldCwgJ2lzb3N1cmZhY2UgVkRXIG1hcCBNRVAgY29sb3JzY2hlbWUgXCJSV0JcIiB0cmFuc2x1Y2VudCcgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBlbHNlIGlmICggc3VyZmFjZVR5cGUgPT09ICdlbGVjdHJvbkRlbnNpdHknICkge1xyXG4gICAgaWYgKCBkaWF0b21pYyApIHtcclxuICAgICAgZG9TY3JpcHQoIGFwcGxldCwgYGlzb3N1cmZhY2UgVkRXIGNvbG9yICR7dG9KbW9sQ29sb3IoIE1QQ29sb3JzLk5FVVRSQUxfR1JBWSApfSB0cmFuc2x1Y2VudGAgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBkb1NjcmlwdCggYXBwbGV0LCAnaXNvc3VyZmFjZSBWRFcgbWFwIE1FUCBjb2xvcnNjaGVtZSBcIkJXXCIgdHJhbnNsdWNlbnQnICk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGVsc2UgeyAvLyAnbm9uZSdcclxuICAgIGRvU2NyaXB0KCBhcHBsZXQsICdpc29zdXJmYWNlIG9mZicgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEZXRlcm1pbmVzIGlmIHRoZSBjdXJyZW50IG1vbGVjdWxlIGlzIGhvbW9nZW5lb3VzIGRpYXRvbWljICgyIGF0b21zIG9mIHRoZSBzYW1lIHR5cGUuKVxyXG4gKi9cclxuZnVuY3Rpb24gaXNIb21vZ2VuZW91c0RpYXRvbWljKCBhcHBsZXQ6IEFwcGxldElkICk6IGJvb2xlYW4ge1xyXG5cclxuICBjb25zdCBzdGF0dXMgPSBKbW9sLmV2YWx1YXRlVmFyKCBhcHBsZXQsXHJcbiAgICBgJHsnc2NyaXB0KFxcJycgK1xyXG4gICAgJ251bWJlck9mQXRvbXMgPSB7Kn0ubGVuZ3RoXFxuJyArXHJcbiAgICAnaG9tb2dlbmVvdXNEaWF0b21pYyA9IFwiJ30ke1JFU1VMVF9UUlVFfVwiXFxuYCArXHJcbiAgICAnaWYgKCBudW1iZXJPZkF0b21zID09IDIgKSB7XFxuJyArXHJcbiAgICAnICAgIGZpcnN0RWxlbWVudCA9IHsqfVswXS5lbGVtZW50XFxuJyArXHJcbiAgICAnICAgIGZvciAoIGkgPSAwOyBpIDwgbnVtYmVyT2ZBdG9tczsgaSsrICkge1xcbicgK1xyXG4gICAgJyAgICAgICAgbmV4dEVsZW1lbnQgPSB7Kn1baV0uZWxlbWVudFxcbicgK1xyXG4gICAgJyAgICAgICAgaWYgKCBmaXJzdEVsZW1lbnQgIT0gbmV4dEVsZW1lbnQgKSB7XFxuJyArXHJcbiAgICBgICAgICAgICAgICAgaG9tb2dlbmVvdXNEaWF0b21pYyA9IFwiJHtSRVNVTFRfRkFMU0V9XCJcXG5gICtcclxuICAgICcgICAgICAgIH1cXG4nICtcclxuICAgICcgICAgfVxcbicgK1xyXG4gICAgJ31cXG4nICtcclxuICAgICdlbHNlIHtcXG4nICtcclxuICAgIGAgICAgaG9tb2dlbmVvdXNEaWF0b21pYyA9IFwiJHtSRVNVTFRfRkFMU0V9XCJcXG5gICtcclxuICAgICd9XFxuJyArXHJcbiAgICAncHJpbnQgaG9tb2dlbmVvdXNEaWF0b21pYycgK1xyXG4gICAgJ1xcJyknICk7XHJcbiAgcGhldC5sb2cgJiYgcGhldC5sb2coIGBpc0hvbW9nZW5lb3VzRGlhdG9taWMsIHN0YXR1cz0ke3N0YXR1c31gICk7XHJcblxyXG4gIGlmICggc3RhdHVzID09PSBudWxsIHx8IHN0YXR1cyA9PT0gJ0VSUk9SJyApIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggYEpTbW9sVmlld2VyTm9kZS5pc0hvbW9nZW5lb3VzRGlhdG9taWMsIHNjcmlwdCBlcnJvcjogJHtzdGF0dXN9YCApO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHJldHVybiAoIHN0YXR1cyA9PT0gJ3RydWUnICk7XHJcbiAgfVxyXG59XHJcblxyXG5tb2xlY3VsZVBvbGFyaXR5LnJlZ2lzdGVyKCAnSlNtb2xWaWV3ZXJOb2RlJywgSlNtb2xWaWV3ZXJOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxTQUFTQyxLQUFLLEVBQUVDLEdBQUcsUUFBb0IsbUNBQW1DO0FBQzFFLE9BQU9DLFFBQVEsTUFBTSwwQkFBMEI7QUFDL0MsT0FBT0MsaUJBQWlCLE1BQU0sbUNBQW1DO0FBQ2pFLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxPQUFPLE1BQU0scUJBQXFCO0FBS3pDLE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFHN0Q7QUFDQSxNQUFNQyxLQUFLLEdBQUcsUUFBUTtBQUN0QixNQUFNQyxXQUFXLEdBQUcsTUFBTTtBQUMxQixNQUFNQyxZQUFZLEdBQUcsT0FBTzs7QUFJNUI7O0FBR0E7O0FBdUJBO0FBQ0EsTUFBTUMsSUFBSSxHQUFHQyxNQUFNLENBQUUsTUFBTSxDQUEyQjs7QUFFdEQ7QUFDQSxJQUFJQyxjQUFjLEdBQUcsQ0FBQzs7QUFFdEI7QUFDQSxNQUFNQyxHQUFHLEdBQUdGLE1BQU0sQ0FBQ0UsR0FBRyxJQUFJRixNQUFNLENBQUNHLFNBQVMsSUFBSUgsTUFBTTs7QUFFcEQ7QUFDQSxNQUFNSSxXQUFXLEdBQ2Ysb0JBQW9CLEdBQ3BCLGlCQUFpQjtBQUFJO0FBQ3JCLHdCQUF3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