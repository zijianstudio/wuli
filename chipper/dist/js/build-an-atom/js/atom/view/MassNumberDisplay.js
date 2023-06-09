// Copyright 2013-2023, University of Colorado Boulder

/**
 * Type that portrays the current mass number in the view.  It consists of
 * a graphical representation of a scale with a numerical display on it.
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Image, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import scale_png from '../../../images/scale_png.js';
import buildAnAtom from '../../buildAnAtom.js';

// constants
const WIDTH = 122; // In screen coords, which are roughly pixels, empirically determined.
const READOUT_SIZE = new Dimension2(WIDTH * 0.25, WIDTH * 0.165); // In screen coords, which are roughly pixels.

class MassNumberDisplay extends Node {
  /**
   * @param {NumberAtom} numberAtom
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(numberAtom, tandem, options) {
    super({
      tandem: tandem
    });

    // Add the background image, i.e. the scale.
    const scaleImage = new Image(scale_png, {
      tandem: tandem.createTandem('scaleImage')
    });
    scaleImage.scale(WIDTH / scaleImage.width); // Scale to the targeted width.
    this.addChild(scaleImage);

    // Add the numerical readout window.
    const readoutBackground = new Rectangle(0, 0, READOUT_SIZE.width, READOUT_SIZE.height, 4, 4, {
      fill: 'white',
      stroke: 'black',
      lineWidth: 1,
      // Position is based on the background image, and may need tweaking if the image is changed.
      bottom: scaleImage.bottom - 6,
      centerX: scaleImage.centerX,
      tandem: tandem.createTandem('readoutBackground')
    });
    this.addChild(readoutBackground);

    // placeholder text value, will be changed later
    const numericalText = new Text(' ', {
      font: new PhetFont({
        size: 24,
        weight: 'bold'
      }),
      tandem: tandem.createTandem('numericalText')
    });
    readoutBackground.addChild(numericalText);

    // Add the listeners that will update the numerical display when the charge changes.
    numberAtom.massNumberProperty.link(massNumber => {
      const newText = `${massNumber}`; // cast to a string explicitly just in case
      if (newText !== numericalText.string) {
        numericalText.string = newText;
        numericalText.resetTransform();
        numericalText.scale(Math.min(READOUT_SIZE.height * 0.9 / numericalText.height, READOUT_SIZE.width * 0.9 / numericalText.width));
        numericalText.center = new Vector2(READOUT_SIZE.width / 2, READOUT_SIZE.height / 2);
      }
    });
    this.mutate(options);
  }
}
buildAnAtom.register('MassNumberDisplay', MassNumberDisplay);
export default MassNumberDisplay;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVmVjdG9yMiIsIlBoZXRGb250IiwiSW1hZ2UiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiVGV4dCIsInNjYWxlX3BuZyIsImJ1aWxkQW5BdG9tIiwiV0lEVEgiLCJSRUFET1VUX1NJWkUiLCJNYXNzTnVtYmVyRGlzcGxheSIsImNvbnN0cnVjdG9yIiwibnVtYmVyQXRvbSIsInRhbmRlbSIsIm9wdGlvbnMiLCJzY2FsZUltYWdlIiwiY3JlYXRlVGFuZGVtIiwic2NhbGUiLCJ3aWR0aCIsImFkZENoaWxkIiwicmVhZG91dEJhY2tncm91bmQiLCJoZWlnaHQiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiYm90dG9tIiwiY2VudGVyWCIsIm51bWVyaWNhbFRleHQiLCJmb250Iiwic2l6ZSIsIndlaWdodCIsIm1hc3NOdW1iZXJQcm9wZXJ0eSIsImxpbmsiLCJtYXNzTnVtYmVyIiwibmV3VGV4dCIsInN0cmluZyIsInJlc2V0VHJhbnNmb3JtIiwiTWF0aCIsIm1pbiIsImNlbnRlciIsIm11dGF0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWFzc051bWJlckRpc3BsYXkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVHlwZSB0aGF0IHBvcnRyYXlzIHRoZSBjdXJyZW50IG1hc3MgbnVtYmVyIGluIHRoZSB2aWV3LiAgSXQgY29uc2lzdHMgb2ZcclxuICogYSBncmFwaGljYWwgcmVwcmVzZW50YXRpb24gb2YgYSBzY2FsZSB3aXRoIGEgbnVtZXJpY2FsIGRpc3BsYXkgb24gaXQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBJbWFnZSwgTm9kZSwgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHNjYWxlX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvc2NhbGVfcG5nLmpzJztcclxuaW1wb3J0IGJ1aWxkQW5BdG9tIGZyb20gJy4uLy4uL2J1aWxkQW5BdG9tLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBXSURUSCA9IDEyMjsgLy8gSW4gc2NyZWVuIGNvb3Jkcywgd2hpY2ggYXJlIHJvdWdobHkgcGl4ZWxzLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkLlxyXG5jb25zdCBSRUFET1VUX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggV0lEVEggKiAwLjI1LCBXSURUSCAqIDAuMTY1ICk7IC8vIEluIHNjcmVlbiBjb29yZHMsIHdoaWNoIGFyZSByb3VnaGx5IHBpeGVscy5cclxuXHJcbmNsYXNzIE1hc3NOdW1iZXJEaXNwbGF5IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyQXRvbX0gbnVtYmVyQXRvbVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG51bWJlckF0b20sIHRhbmRlbSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlciggeyB0YW5kZW06IHRhbmRlbSB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBiYWNrZ3JvdW5kIGltYWdlLCBpLmUuIHRoZSBzY2FsZS5cclxuICAgIGNvbnN0IHNjYWxlSW1hZ2UgPSBuZXcgSW1hZ2UoIHNjYWxlX3BuZywgeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzY2FsZUltYWdlJyApIH0gKTtcclxuICAgIHNjYWxlSW1hZ2Uuc2NhbGUoIFdJRFRIIC8gc2NhbGVJbWFnZS53aWR0aCApOyAvLyBTY2FsZSB0byB0aGUgdGFyZ2V0ZWQgd2lkdGguXHJcbiAgICB0aGlzLmFkZENoaWxkKCBzY2FsZUltYWdlICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBudW1lcmljYWwgcmVhZG91dCB3aW5kb3cuXHJcbiAgICBjb25zdCByZWFkb3V0QmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIFJFQURPVVRfU0laRS53aWR0aCwgUkVBRE9VVF9TSVpFLmhlaWdodCwgNCwgNCwge1xyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGxpbmVXaWR0aDogMSxcclxuICAgICAgLy8gUG9zaXRpb24gaXMgYmFzZWQgb24gdGhlIGJhY2tncm91bmQgaW1hZ2UsIGFuZCBtYXkgbmVlZCB0d2Vha2luZyBpZiB0aGUgaW1hZ2UgaXMgY2hhbmdlZC5cclxuICAgICAgYm90dG9tOiBzY2FsZUltYWdlLmJvdHRvbSAtIDYsXHJcbiAgICAgIGNlbnRlclg6IHNjYWxlSW1hZ2UuY2VudGVyWCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVhZG91dEJhY2tncm91bmQnIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlYWRvdXRCYWNrZ3JvdW5kICk7XHJcblxyXG4gICAgLy8gcGxhY2Vob2xkZXIgdGV4dCB2YWx1ZSwgd2lsbCBiZSBjaGFuZ2VkIGxhdGVyXHJcbiAgICBjb25zdCBudW1lcmljYWxUZXh0ID0gbmV3IFRleHQoICcgJywge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMjQsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVtZXJpY2FsVGV4dCcgKVxyXG4gICAgfSApO1xyXG4gICAgcmVhZG91dEJhY2tncm91bmQuYWRkQ2hpbGQoIG51bWVyaWNhbFRleHQgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGxpc3RlbmVycyB0aGF0IHdpbGwgdXBkYXRlIHRoZSBudW1lcmljYWwgZGlzcGxheSB3aGVuIHRoZSBjaGFyZ2UgY2hhbmdlcy5cclxuICAgIG51bWJlckF0b20ubWFzc051bWJlclByb3BlcnR5LmxpbmsoIG1hc3NOdW1iZXIgPT4ge1xyXG4gICAgICBjb25zdCBuZXdUZXh0ID0gYCR7bWFzc051bWJlcn1gOyAvLyBjYXN0IHRvIGEgc3RyaW5nIGV4cGxpY2l0bHkganVzdCBpbiBjYXNlXHJcbiAgICAgIGlmICggbmV3VGV4dCAhPT0gbnVtZXJpY2FsVGV4dC5zdHJpbmcgKSB7XHJcbiAgICAgICAgbnVtZXJpY2FsVGV4dC5zdHJpbmcgPSBuZXdUZXh0O1xyXG5cclxuICAgICAgICBudW1lcmljYWxUZXh0LnJlc2V0VHJhbnNmb3JtKCk7XHJcbiAgICAgICAgbnVtZXJpY2FsVGV4dC5zY2FsZSggTWF0aC5taW4oIFJFQURPVVRfU0laRS5oZWlnaHQgKiAwLjkgLyBudW1lcmljYWxUZXh0LmhlaWdodCxcclxuICAgICAgICAgIFJFQURPVVRfU0laRS53aWR0aCAqIDAuOSAvIG51bWVyaWNhbFRleHQud2lkdGggKSApO1xyXG4gICAgICAgIG51bWVyaWNhbFRleHQuY2VudGVyID0gbmV3IFZlY3RvcjIoIFJFQURPVVRfU0laRS53aWR0aCAvIDIsIFJFQURPVVRfU0laRS5oZWlnaHQgLyAyICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuYnVpbGRBbkF0b20ucmVnaXN0ZXIoICdNYXNzTnVtYmVyRGlzcGxheScsIE1hc3NOdW1iZXJEaXNwbGF5ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNYXNzTnVtYmVyRGlzcGxheTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9B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