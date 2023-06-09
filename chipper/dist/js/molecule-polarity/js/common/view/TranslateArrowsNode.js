// Copyright 2014-2022, University of Colorado Boulder

/**
 * TranslateArrowsNode is a pair of arrows that are placed around an atom to indicate that the atom can be translated.
 * Shapes are created in global coordinates, so this Node's position should be (0,0).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Transform3 from '../../../../dot/js/Transform3.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import moleculePolarity from '../../moleculePolarity.js';
export default class TranslateArrowsNode extends Node {
  constructor(molecule, atom, providedOptions) {
    const options = optionize()({
      // SelfOptions
      length: 25,
      // relatively short, so we don't need curved arrows

      // NodeOptions
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    }, providedOptions);
    const leftArrowNode = new Path(null, {
      fill: atom.color,
      stroke: 'gray'
    });
    const rightArrowNode = new Path(null, {
      fill: atom.color,
      stroke: 'gray'
    });

    // create "normalized" shapes at (0,0) with no rotation
    const arrowShapeOptions = {
      headWidth: 30,
      headHeight: 15,
      tailWidth: 15
    };
    const radius = atom.diameter / 2;
    const spacing = 2;
    const leftArrow = new ArrowShape(-(radius + spacing), 0, -(radius + spacing + options.length), 0, arrowShapeOptions);
    const rightArrow = new ArrowShape(radius + spacing, 0, radius + spacing + options.length, 0, arrowShapeOptions);
    options.children = [leftArrowNode, rightArrowNode];

    // transform the arrow shapes to account for atom position and relationship to molecule position
    atom.positionProperty.link(() => {
      const v = molecule.position.minus(atom.positionProperty.value);
      const angle = v.angle - Math.PI / 2;
      const transform = new Transform3(Matrix3.translationFromVector(atom.positionProperty.value).timesMatrix(Matrix3.rotation2(angle)));
      leftArrowNode.shape = transform.transformShape(leftArrow);
      rightArrowNode.shape = transform.transformShape(rightArrow);
    });
    super(options);
  }
}
moleculePolarity.register('TranslateArrowsNode', TranslateArrowsNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiVHJhbnNmb3JtMyIsIm9wdGlvbml6ZSIsIkFycm93U2hhcGUiLCJOb2RlIiwiUGF0aCIsIm1vbGVjdWxlUG9sYXJpdHkiLCJUcmFuc2xhdGVBcnJvd3NOb2RlIiwiY29uc3RydWN0b3IiLCJtb2xlY3VsZSIsImF0b20iLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibGVuZ3RoIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb1JlYWRPbmx5IiwibGVmdEFycm93Tm9kZSIsImZpbGwiLCJjb2xvciIsInN0cm9rZSIsInJpZ2h0QXJyb3dOb2RlIiwiYXJyb3dTaGFwZU9wdGlvbnMiLCJoZWFkV2lkdGgiLCJoZWFkSGVpZ2h0IiwidGFpbFdpZHRoIiwicmFkaXVzIiwiZGlhbWV0ZXIiLCJzcGFjaW5nIiwibGVmdEFycm93IiwicmlnaHRBcnJvdyIsImNoaWxkcmVuIiwicG9zaXRpb25Qcm9wZXJ0eSIsImxpbmsiLCJ2IiwicG9zaXRpb24iLCJtaW51cyIsInZhbHVlIiwiYW5nbGUiLCJNYXRoIiwiUEkiLCJ0cmFuc2Zvcm0iLCJ0cmFuc2xhdGlvbkZyb21WZWN0b3IiLCJ0aW1lc01hdHJpeCIsInJvdGF0aW9uMiIsInNoYXBlIiwidHJhbnNmb3JtU2hhcGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRyYW5zbGF0ZUFycm93c05vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVHJhbnNsYXRlQXJyb3dzTm9kZSBpcyBhIHBhaXIgb2YgYXJyb3dzIHRoYXQgYXJlIHBsYWNlZCBhcm91bmQgYW4gYXRvbSB0byBpbmRpY2F0ZSB0aGF0IHRoZSBhdG9tIGNhbiBiZSB0cmFuc2xhdGVkLlxyXG4gKiBTaGFwZXMgYXJlIGNyZWF0ZWQgaW4gZ2xvYmFsIGNvb3JkaW5hdGVzLCBzbyB0aGlzIE5vZGUncyBwb3NpdGlvbiBzaG91bGQgYmUgKDAsMCkuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgVHJhbnNmb3JtMyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVHJhbnNmb3JtMy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrT3B0aW9uYWwgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tPcHRpb25hbC5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBBcnJvd1NoYXBlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9BcnJvd1NoYXBlLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgTm9kZU9wdGlvbnMsIFBhdGggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVQb2xhcml0eSBmcm9tICcuLi8uLi9tb2xlY3VsZVBvbGFyaXR5LmpzJztcclxuaW1wb3J0IEF0b20gZnJvbSAnLi4vbW9kZWwvQXRvbS5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZSBmcm9tICcuLi9tb2RlbC9Nb2xlY3VsZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGxlbmd0aD86IG51bWJlcjtcclxufTtcclxuXHJcbnR5cGUgVHJhbnNsYXRlQXJyb3dzTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmXHJcbiAgUGlja1JlcXVpcmVkPE5vZGVPcHRpb25zLCAndGFuZGVtJz4gJlxyXG4gIFBpY2tPcHRpb25hbDxOb2RlT3B0aW9ucywgJ3BpY2thYmxlJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmFuc2xhdGVBcnJvd3NOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9sZWN1bGU6IE1vbGVjdWxlLCBhdG9tOiBBdG9tLCBwcm92aWRlZE9wdGlvbnM6IFRyYW5zbGF0ZUFycm93c05vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8VHJhbnNsYXRlQXJyb3dzTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgbGVuZ3RoOiAyNSwgLy8gcmVsYXRpdmVseSBzaG9ydCwgc28gd2UgZG9uJ3QgbmVlZCBjdXJ2ZWQgYXJyb3dzXHJcblxyXG4gICAgICAvLyBOb2RlT3B0aW9uc1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb1JlYWRPbmx5OiB0cnVlIH1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGxlZnRBcnJvd05vZGUgPSBuZXcgUGF0aCggbnVsbCwgeyBmaWxsOiBhdG9tLmNvbG9yLCBzdHJva2U6ICdncmF5JyB9ICk7XHJcbiAgICBjb25zdCByaWdodEFycm93Tm9kZSA9IG5ldyBQYXRoKCBudWxsLCB7IGZpbGw6IGF0b20uY29sb3IsIHN0cm9rZTogJ2dyYXknIH0gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgXCJub3JtYWxpemVkXCIgc2hhcGVzIGF0ICgwLDApIHdpdGggbm8gcm90YXRpb25cclxuICAgIGNvbnN0IGFycm93U2hhcGVPcHRpb25zID0geyBoZWFkV2lkdGg6IDMwLCBoZWFkSGVpZ2h0OiAxNSwgdGFpbFdpZHRoOiAxNSB9O1xyXG4gICAgY29uc3QgcmFkaXVzID0gYXRvbS5kaWFtZXRlciAvIDI7XHJcbiAgICBjb25zdCBzcGFjaW5nID0gMjtcclxuICAgIGNvbnN0IGxlZnRBcnJvdyA9IG5ldyBBcnJvd1NoYXBlKCAtKCByYWRpdXMgKyBzcGFjaW5nICksIDAsIC0oIHJhZGl1cyArIHNwYWNpbmcgKyBvcHRpb25zLmxlbmd0aCApLCAwLCBhcnJvd1NoYXBlT3B0aW9ucyApO1xyXG4gICAgY29uc3QgcmlnaHRBcnJvdyA9IG5ldyBBcnJvd1NoYXBlKCAoIHJhZGl1cyArIHNwYWNpbmcgKSwgMCwgKCByYWRpdXMgKyBzcGFjaW5nICsgb3B0aW9ucy5sZW5ndGggKSwgMCwgYXJyb3dTaGFwZU9wdGlvbnMgKTtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBsZWZ0QXJyb3dOb2RlLCByaWdodEFycm93Tm9kZSBdO1xyXG5cclxuICAgIC8vIHRyYW5zZm9ybSB0aGUgYXJyb3cgc2hhcGVzIHRvIGFjY291bnQgZm9yIGF0b20gcG9zaXRpb24gYW5kIHJlbGF0aW9uc2hpcCB0byBtb2xlY3VsZSBwb3NpdGlvblxyXG4gICAgYXRvbS5wb3NpdGlvblByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgY29uc3QgdiA9IG1vbGVjdWxlLnBvc2l0aW9uLm1pbnVzKCBhdG9tLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgY29uc3QgYW5nbGUgPSB2LmFuZ2xlIC0gKCBNYXRoLlBJIC8gMiApO1xyXG4gICAgICBjb25zdCB0cmFuc2Zvcm0gPSBuZXcgVHJhbnNmb3JtMyggTWF0cml4My50cmFuc2xhdGlvbkZyb21WZWN0b3IoIGF0b20ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApLnRpbWVzTWF0cml4KCBNYXRyaXgzLnJvdGF0aW9uMiggYW5nbGUgKSApICk7XHJcbiAgICAgIGxlZnRBcnJvd05vZGUuc2hhcGUgPSB0cmFuc2Zvcm0udHJhbnNmb3JtU2hhcGUoIGxlZnRBcnJvdyApO1xyXG4gICAgICByaWdodEFycm93Tm9kZS5zaGFwZSA9IHRyYW5zZm9ybS50cmFuc2Zvcm1TaGFwZSggcmlnaHRBcnJvdyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5tb2xlY3VsZVBvbGFyaXR5LnJlZ2lzdGVyKCAnVHJhbnNsYXRlQXJyb3dzTm9kZScsIFRyYW5zbGF0ZUFycm93c05vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUc3RCxPQUFPQyxVQUFVLE1BQU0sMkNBQTJDO0FBQ2xFLFNBQVNDLElBQUksRUFBZUMsSUFBSSxRQUFRLG1DQUFtQztBQUMzRSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFZeEQsZUFBZSxNQUFNQyxtQkFBbUIsU0FBU0gsSUFBSSxDQUFDO0VBRTdDSSxXQUFXQSxDQUFFQyxRQUFrQixFQUFFQyxJQUFVLEVBQUVDLGVBQTJDLEVBQUc7SUFFaEcsTUFBTUMsT0FBTyxHQUFHVixTQUFTLENBQXVELENBQUMsQ0FBRTtNQUVqRjtNQUNBVyxNQUFNLEVBQUUsRUFBRTtNQUFFOztNQUVaO01BQ0FDLHNCQUFzQixFQUFFO1FBQUVDLGNBQWMsRUFBRTtNQUFLO0lBQ2pELENBQUMsRUFBRUosZUFBZ0IsQ0FBQztJQUVwQixNQUFNSyxhQUFhLEdBQUcsSUFBSVgsSUFBSSxDQUFFLElBQUksRUFBRTtNQUFFWSxJQUFJLEVBQUVQLElBQUksQ0FBQ1EsS0FBSztNQUFFQyxNQUFNLEVBQUU7SUFBTyxDQUFFLENBQUM7SUFDNUUsTUFBTUMsY0FBYyxHQUFHLElBQUlmLElBQUksQ0FBRSxJQUFJLEVBQUU7TUFBRVksSUFBSSxFQUFFUCxJQUFJLENBQUNRLEtBQUs7TUFBRUMsTUFBTSxFQUFFO0lBQU8sQ0FBRSxDQUFDOztJQUU3RTtJQUNBLE1BQU1FLGlCQUFpQixHQUFHO01BQUVDLFNBQVMsRUFBRSxFQUFFO01BQUVDLFVBQVUsRUFBRSxFQUFFO01BQUVDLFNBQVMsRUFBRTtJQUFHLENBQUM7SUFDMUUsTUFBTUMsTUFBTSxHQUFHZixJQUFJLENBQUNnQixRQUFRLEdBQUcsQ0FBQztJQUNoQyxNQUFNQyxPQUFPLEdBQUcsQ0FBQztJQUNqQixNQUFNQyxTQUFTLEdBQUcsSUFBSXpCLFVBQVUsQ0FBRSxFQUFHc0IsTUFBTSxHQUFHRSxPQUFPLENBQUUsRUFBRSxDQUFDLEVBQUUsRUFBR0YsTUFBTSxHQUFHRSxPQUFPLEdBQUdmLE9BQU8sQ0FBQ0MsTUFBTSxDQUFFLEVBQUUsQ0FBQyxFQUFFUSxpQkFBa0IsQ0FBQztJQUMxSCxNQUFNUSxVQUFVLEdBQUcsSUFBSTFCLFVBQVUsQ0FBSXNCLE1BQU0sR0FBR0UsT0FBTyxFQUFJLENBQUMsRUFBSUYsTUFBTSxHQUFHRSxPQUFPLEdBQUdmLE9BQU8sQ0FBQ0MsTUFBTSxFQUFJLENBQUMsRUFBRVEsaUJBQWtCLENBQUM7SUFFekhULE9BQU8sQ0FBQ2tCLFFBQVEsR0FBRyxDQUFFZCxhQUFhLEVBQUVJLGNBQWMsQ0FBRTs7SUFFcEQ7SUFDQVYsSUFBSSxDQUFDcUIsZ0JBQWdCLENBQUNDLElBQUksQ0FBRSxNQUFNO01BQ2hDLE1BQU1DLENBQUMsR0FBR3hCLFFBQVEsQ0FBQ3lCLFFBQVEsQ0FBQ0MsS0FBSyxDQUFFekIsSUFBSSxDQUFDcUIsZ0JBQWdCLENBQUNLLEtBQU0sQ0FBQztNQUNoRSxNQUFNQyxLQUFLLEdBQUdKLENBQUMsQ0FBQ0ksS0FBSyxHQUFLQyxJQUFJLENBQUNDLEVBQUUsR0FBRyxDQUFHO01BQ3ZDLE1BQU1DLFNBQVMsR0FBRyxJQUFJdkMsVUFBVSxDQUFFRCxPQUFPLENBQUN5QyxxQkFBcUIsQ0FBRS9CLElBQUksQ0FBQ3FCLGdCQUFnQixDQUFDSyxLQUFNLENBQUMsQ0FBQ00sV0FBVyxDQUFFMUMsT0FBTyxDQUFDMkMsU0FBUyxDQUFFTixLQUFNLENBQUUsQ0FBRSxDQUFDO01BQzFJckIsYUFBYSxDQUFDNEIsS0FBSyxHQUFHSixTQUFTLENBQUNLLGNBQWMsQ0FBRWpCLFNBQVUsQ0FBQztNQUMzRFIsY0FBYyxDQUFDd0IsS0FBSyxHQUFHSixTQUFTLENBQUNLLGNBQWMsQ0FBRWhCLFVBQVcsQ0FBQztJQUMvRCxDQUFFLENBQUM7SUFFSCxLQUFLLENBQUVqQixPQUFRLENBQUM7RUFDbEI7QUFDRjtBQUVBTixnQkFBZ0IsQ0FBQ3dDLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRXZDLG1CQUFvQixDQUFDIn0=