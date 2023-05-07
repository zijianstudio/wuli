// Copyright 2013-2022, University of Colorado Boulder

/**
 * Label that appears on the beaker in a frosty, translucent frame.
 * Displays solute formula. Origin at top center.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Node, Rectangle, RichText } from '../../../../scenery/js/imports.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import molarity from '../../molarity.js';
import MolaritySymbols from '../MolaritySymbols.js';

// constants
const LABEL_SIZE = new Dimension2(180, 80);
const LABEL_FONT = new PhetFont({
  size: 28,
  weight: 'bold'
});
class BeakerLabelNode extends Node {
  /**
   * @param {MacroSolution} solution
   * @param {Tandem} tandem
   */
  constructor(solution, tandem) {
    super({
      tandem: tandem
    });
    const textNode = new RichText('?', {
      font: LABEL_FONT,
      maxWidth: 0.9 * LABEL_SIZE.width,
      tandem: tandem.createTandem('text')
    });
    const backgroundNode = new Rectangle(-LABEL_SIZE.width / 2, 0, LABEL_SIZE.width, LABEL_SIZE.height, 10, 10, {
      fill: new Color(255, 255, 255, 0.6),
      stroke: Color.LIGHT_GRAY,
      tandem: tandem.createTandem('backgroundNode')
    });
    this.addChild(backgroundNode);
    this.addChild(textNode);

    // label on the beaker
    const beakerLabelProperty = new DerivedProperty([solution.soluteProperty, solution.volumeProperty, solution.concentrationProperty], (solute, volume, concentration) => {
      let label;
      if (volume === 0) {
        label = '';
      } else if (concentration === 0) {
        label = MolaritySymbols.WATER;
      } else {
        label = solute.formula;
      }
      return label;
    }, {
      tandem: tandem.createTandem('beakerLabelProperty'),
      phetioValueType: StringIO
    });

    // update the label
    beakerLabelProperty.link(label => {
      textNode.string = label;
      // center formula in background
      textNode.centerX = backgroundNode.centerX;
      textNode.centerY = backgroundNode.centerY;
    });
  }
}
molarity.register('BeakerLabelNode', BeakerLabelNode);
export default BeakerLabelNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiUGhldEZvbnQiLCJDb2xvciIsIk5vZGUiLCJSZWN0YW5nbGUiLCJSaWNoVGV4dCIsIlN0cmluZ0lPIiwibW9sYXJpdHkiLCJNb2xhcml0eVN5bWJvbHMiLCJMQUJFTF9TSVpFIiwiTEFCRUxfRk9OVCIsInNpemUiLCJ3ZWlnaHQiLCJCZWFrZXJMYWJlbE5vZGUiLCJjb25zdHJ1Y3RvciIsInNvbHV0aW9uIiwidGFuZGVtIiwidGV4dE5vZGUiLCJmb250IiwibWF4V2lkdGgiLCJ3aWR0aCIsImNyZWF0ZVRhbmRlbSIsImJhY2tncm91bmROb2RlIiwiaGVpZ2h0IiwiZmlsbCIsInN0cm9rZSIsIkxJR0hUX0dSQVkiLCJhZGRDaGlsZCIsImJlYWtlckxhYmVsUHJvcGVydHkiLCJzb2x1dGVQcm9wZXJ0eSIsInZvbHVtZVByb3BlcnR5IiwiY29uY2VudHJhdGlvblByb3BlcnR5Iiwic29sdXRlIiwidm9sdW1lIiwiY29uY2VudHJhdGlvbiIsImxhYmVsIiwiV0FURVIiLCJmb3JtdWxhIiwicGhldGlvVmFsdWVUeXBlIiwibGluayIsInN0cmluZyIsImNlbnRlclgiLCJjZW50ZXJZIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCZWFrZXJMYWJlbE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTGFiZWwgdGhhdCBhcHBlYXJzIG9uIHRoZSBiZWFrZXIgaW4gYSBmcm9zdHksIHRyYW5zbHVjZW50IGZyYW1lLlxyXG4gKiBEaXNwbGF5cyBzb2x1dGUgZm9ybXVsYS4gT3JpZ2luIGF0IHRvcCBjZW50ZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBOb2RlLCBSZWN0YW5nbGUsIFJpY2hUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdHJpbmdJTy5qcyc7XHJcbmltcG9ydCBtb2xhcml0eSBmcm9tICcuLi8uLi9tb2xhcml0eS5qcyc7XHJcbmltcG9ydCBNb2xhcml0eVN5bWJvbHMgZnJvbSAnLi4vTW9sYXJpdHlTeW1ib2xzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBMQUJFTF9TSVpFID0gbmV3IERpbWVuc2lvbjIoIDE4MCwgODAgKTtcclxuY29uc3QgTEFCRUxfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyOCwgd2VpZ2h0OiAnYm9sZCcgfSApO1xyXG5cclxuY2xhc3MgQmVha2VyTGFiZWxOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNYWNyb1NvbHV0aW9ufSBzb2x1dGlvblxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc29sdXRpb24sIHRhbmRlbSApIHtcclxuXHJcbiAgICBzdXBlciggeyB0YW5kZW06IHRhbmRlbSB9ICk7XHJcblxyXG4gICAgY29uc3QgdGV4dE5vZGUgPSBuZXcgUmljaFRleHQoICc/Jywge1xyXG4gICAgICBmb250OiBMQUJFTF9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogMC45ICogTEFCRUxfU0laRS53aWR0aCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0gbmV3IFJlY3RhbmdsZSggLUxBQkVMX1NJWkUud2lkdGggLyAyLCAwLCBMQUJFTF9TSVpFLndpZHRoLCBMQUJFTF9TSVpFLmhlaWdodCwgMTAsIDEwLCB7XHJcbiAgICAgIGZpbGw6IG5ldyBDb2xvciggMjU1LCAyNTUsIDI1NSwgMC42ICksIHN0cm9rZTogQ29sb3IuTElHSFRfR1JBWSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmFja2dyb3VuZE5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBiYWNrZ3JvdW5kTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGV4dE5vZGUgKTtcclxuXHJcbiAgICAvLyBsYWJlbCBvbiB0aGUgYmVha2VyXHJcbiAgICBjb25zdCBiZWFrZXJMYWJlbFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBzb2x1dGlvbi5zb2x1dGVQcm9wZXJ0eSwgc29sdXRpb24udm9sdW1lUHJvcGVydHksIHNvbHV0aW9uLmNvbmNlbnRyYXRpb25Qcm9wZXJ0eSBdLFxyXG4gICAgICAoIHNvbHV0ZSwgdm9sdW1lLCBjb25jZW50cmF0aW9uICkgPT4ge1xyXG4gICAgICAgIGxldCBsYWJlbDtcclxuICAgICAgICBpZiAoIHZvbHVtZSA9PT0gMCApIHtcclxuICAgICAgICAgIGxhYmVsID0gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBjb25jZW50cmF0aW9uID09PSAwICkge1xyXG4gICAgICAgICAgbGFiZWwgPSBNb2xhcml0eVN5bWJvbHMuV0FURVI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgbGFiZWwgPSBzb2x1dGUuZm9ybXVsYTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxhYmVsO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmVha2VyTGFiZWxQcm9wZXJ0eScgKSxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IFN0cmluZ0lPXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIGxhYmVsXHJcbiAgICBiZWFrZXJMYWJlbFByb3BlcnR5LmxpbmsoIGxhYmVsID0+IHtcclxuICAgICAgdGV4dE5vZGUuc3RyaW5nID0gbGFiZWw7XHJcbiAgICAgIC8vIGNlbnRlciBmb3JtdWxhIGluIGJhY2tncm91bmRcclxuICAgICAgdGV4dE5vZGUuY2VudGVyWCA9IGJhY2tncm91bmROb2RlLmNlbnRlclg7XHJcbiAgICAgIHRleHROb2RlLmNlbnRlclkgPSBiYWNrZ3JvdW5kTm9kZS5jZW50ZXJZO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxubW9sYXJpdHkucmVnaXN0ZXIoICdCZWFrZXJMYWJlbE5vZGUnLCBCZWFrZXJMYWJlbE5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJlYWtlckxhYmVsTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxRQUFRLFFBQVEsbUNBQW1DO0FBQ3BGLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsUUFBUSxNQUFNLG1CQUFtQjtBQUN4QyxPQUFPQyxlQUFlLE1BQU0sdUJBQXVCOztBQUVuRDtBQUNBLE1BQU1DLFVBQVUsR0FBRyxJQUFJVCxVQUFVLENBQUUsR0FBRyxFQUFFLEVBQUcsQ0FBQztBQUM1QyxNQUFNVSxVQUFVLEdBQUcsSUFBSVQsUUFBUSxD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