// Copyright 2015-2022, University of Colorado Boulder

/**
 * Scenery Node representing grid lines (located in the model) with major and minor lines.
 * A double arrow indicates the length scale of the grid.
 *
 * @author Martin Veillette (Berea College)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsStrings from '../../ChargesAndFieldsStrings.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';

// constants related to text
const FONT = ChargesAndFieldsConstants.GRID_LABEL_FONT;

// constants
const MINOR_GRIDLINES_PER_MAJOR_GRIDLINE = ChargesAndFieldsConstants.MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
const MAJOR_GRIDLINE_LINEWIDTH = 2;
const MINOR_GRIDLINE_LINEWIDTH = 1;
const ARROW_LENGTH = 1; // in model coordinates
const ARROW_POSITION = new Vector2(2, -2.20); // top left position in model coordinates

const oneMeterString = ChargesAndFieldsStrings.oneMeter;
class GridNode extends Node {
  /**
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Bounds2>} boundsProperty - bounds in model coordinates
   * @param {Property.<boolean>} isGridVisibleProperty
   * @param {Property.<boolean>} areValuesVisibleProperty
   * @param {Tandem} tandem
   */
  constructor(modelViewTransform, boundsProperty, isGridVisibleProperty, areValuesVisibleProperty, tandem) {
    super();
    const gridLinesParent = new Node();

    // separation in model coordinates of the major grid lines
    const majorDeltaX = ChargesAndFieldsConstants.GRID_MAJOR_SPACING;
    const majorDeltaY = majorDeltaX; // we want a square grid

    // separation in model coordinates of the minor grid lines
    const deltaX = majorDeltaX / MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;
    const deltaY = majorDeltaY / MINOR_GRIDLINES_PER_MAJOR_GRIDLINE;

    // the following variables are integers
    const minI = Math.ceil(boundsProperty.get().minX / deltaX);
    const maxI = Math.floor(boundsProperty.get().maxX / deltaX);
    const minJ = Math.ceil(boundsProperty.get().minY / deltaY);
    const maxJ = Math.floor(boundsProperty.get().maxY / deltaY);
    let i; // {number} an integer
    let j; // {number} an integer
    let isMajorGridLine; // {boolean}
    const majorGridLinesShape = new Shape();
    const minorGridLinesShape = new Shape();

    // vertical gridLines
    for (i = minI; i <= maxI; i++) {
      isMajorGridLine = i % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0;
      if (isMajorGridLine) {
        majorGridLinesShape.moveTo(i * deltaX, minJ * deltaY).verticalLineTo(maxJ * deltaY);
      } else {
        minorGridLinesShape.moveTo(i * deltaX, minJ * deltaY).verticalLineTo(maxJ * deltaY);
      }
    }

    // horizontal gridLines
    for (j = minJ; j <= maxJ; j++) {
      isMajorGridLine = j % MINOR_GRIDLINES_PER_MAJOR_GRIDLINE === 0;
      if (isMajorGridLine) {
        majorGridLinesShape.moveTo(minI * deltaX, j * deltaY).horizontalLineTo(maxI * deltaX);
      } else {
        minorGridLinesShape.moveTo(minI * deltaX, j * deltaY).horizontalLineTo(maxI * deltaX);
      }
    }
    const majorGridLinesPath = new Path(modelViewTransform.modelToViewShape(majorGridLinesShape), {
      lineWidth: MAJOR_GRIDLINE_LINEWIDTH,
      lineCap: 'butt',
      lineJoin: 'bevel',
      stroke: ChargesAndFieldsColors.gridStrokeProperty,
      tandem: tandem.createTandem('majorGridLinesPath')
    });
    const minorGridLinesPath = new Path(modelViewTransform.modelToViewShape(minorGridLinesShape), {
      lineWidth: MINOR_GRIDLINE_LINEWIDTH,
      lineCap: 'butt',
      lineJoin: 'bevel',
      stroke: ChargesAndFieldsColors.gridStrokeProperty,
      tandem: tandem.createTandem('minorGridLinesPath')
    });

    // Create the one-meter double headed arrow representation
    const arrowShape = new ArrowShape(0, 0, modelViewTransform.modelToViewDeltaX(ARROW_LENGTH), 0, {
      doubleHead: true
    });
    const arrowPath = new Path(arrowShape, {
      fill: ChargesAndFieldsColors.gridLengthScaleArrowFillProperty,
      stroke: ChargesAndFieldsColors.gridLengthScaleArrowStrokeProperty,
      tandem: tandem.createTandem('arrowPath')
    });

    // Create and add the text (legend) accompanying the double headed arrow
    const legendText = new Text(oneMeterString, {
      fill: ChargesAndFieldsColors.gridTextFillProperty,
      font: FONT,
      tandem: tandem.createTandem('legendText')
    });

    // add all the nodes
    gridLinesParent.addChild(minorGridLinesPath);
    gridLinesParent.addChild(majorGridLinesPath);
    this.addChild(gridLinesParent);
    this.addChild(arrowPath);
    this.addChild(legendText);

    // layout
    arrowPath.top = modelViewTransform.modelToViewY(ARROW_POSITION.y); // empirically determined such that the electric field arrows do not overlap with it
    arrowPath.left = modelViewTransform.modelToViewX(ARROW_POSITION.x); // should be set to an integer value such that it spans two majorGridLines
    legendText.centerX = arrowPath.centerX;
    legendText.top = arrowPath.bottom;

    // Show/ Hide the arrow
    // no need to unlink, present for the lifetime of the simulation
    areValuesVisibleProperty.link(isVisible => {
      arrowPath.visible = isVisible;
      legendText.visible = isVisible;
    });

    // Show/ Hide the grid
    // no need to unlink, present for the lifetime of the simulation
    isGridVisibleProperty.link(isVisible => {
      this.visible = isVisible;
    });
  }
}
chargesAndFields.register('GridNode', GridNode);
export default GridNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2hhcGUiLCJBcnJvd1NoYXBlIiwiTm9kZSIsIlBhdGgiLCJUZXh0IiwiY2hhcmdlc0FuZEZpZWxkcyIsIkNoYXJnZXNBbmRGaWVsZHNTdHJpbmdzIiwiQ2hhcmdlc0FuZEZpZWxkc0NvbG9ycyIsIkNoYXJnZXNBbmRGaWVsZHNDb25zdGFudHMiLCJGT05UIiwiR1JJRF9MQUJFTF9GT05UIiwiTUlOT1JfR1JJRExJTkVTX1BFUl9NQUpPUl9HUklETElORSIsIk1BSk9SX0dSSURMSU5FX0xJTkVXSURUSCIsIk1JTk9SX0dSSURMSU5FX0xJTkVXSURUSCIsIkFSUk9XX0xFTkdUSCIsIkFSUk9XX1BPU0lUSU9OIiwib25lTWV0ZXJTdHJpbmciLCJvbmVNZXRlciIsIkdyaWROb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJib3VuZHNQcm9wZXJ0eSIsImlzR3JpZFZpc2libGVQcm9wZXJ0eSIsImFyZVZhbHVlc1Zpc2libGVQcm9wZXJ0eSIsInRhbmRlbSIsImdyaWRMaW5lc1BhcmVudCIsIm1ham9yRGVsdGFYIiwiR1JJRF9NQUpPUl9TUEFDSU5HIiwibWFqb3JEZWx0YVkiLCJkZWx0YVgiLCJkZWx0YVkiLCJtaW5JIiwiTWF0aCIsImNlaWwiLCJnZXQiLCJtaW5YIiwibWF4SSIsImZsb29yIiwibWF4WCIsIm1pbkoiLCJtaW5ZIiwibWF4SiIsIm1heFkiLCJpIiwiaiIsImlzTWFqb3JHcmlkTGluZSIsIm1ham9yR3JpZExpbmVzU2hhcGUiLCJtaW5vckdyaWRMaW5lc1NoYXBlIiwibW92ZVRvIiwidmVydGljYWxMaW5lVG8iLCJob3Jpem9udGFsTGluZVRvIiwibWFqb3JHcmlkTGluZXNQYXRoIiwibW9kZWxUb1ZpZXdTaGFwZSIsImxpbmVXaWR0aCIsImxpbmVDYXAiLCJsaW5lSm9pbiIsInN0cm9rZSIsImdyaWRTdHJva2VQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsIm1pbm9yR3JpZExpbmVzUGF0aCIsImFycm93U2hhcGUiLCJtb2RlbFRvVmlld0RlbHRhWCIsImRvdWJsZUhlYWQiLCJhcnJvd1BhdGgiLCJmaWxsIiwiZ3JpZExlbmd0aFNjYWxlQXJyb3dGaWxsUHJvcGVydHkiLCJncmlkTGVuZ3RoU2NhbGVBcnJvd1N0cm9rZVByb3BlcnR5IiwibGVnZW5kVGV4dCIsImdyaWRUZXh0RmlsbFByb3BlcnR5IiwiZm9udCIsImFkZENoaWxkIiwidG9wIiwibW9kZWxUb1ZpZXdZIiwieSIsImxlZnQiLCJtb2RlbFRvVmlld1giLCJ4IiwiY2VudGVyWCIsImJvdHRvbSIsImxpbmsiLCJpc1Zpc2libGUiLCJ2aXNpYmxlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHcmlkTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY2VuZXJ5IE5vZGUgcmVwcmVzZW50aW5nIGdyaWQgbGluZXMgKGxvY2F0ZWQgaW4gdGhlIG1vZGVsKSB3aXRoIG1ham9yIGFuZCBtaW5vciBsaW5lcy5cclxuICogQSBkb3VibGUgYXJyb3cgaW5kaWNhdGVzIHRoZSBsZW5ndGggc2NhbGUgb2YgdGhlIGdyaWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZSAoQmVyZWEgQ29sbGVnZSlcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFycm93U2hhcGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93U2hhcGUuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBQYXRoLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGNoYXJnZXNBbmRGaWVsZHMgZnJvbSAnLi4vLi4vY2hhcmdlc0FuZEZpZWxkcy5qcyc7XHJcbmltcG9ydCBDaGFyZ2VzQW5kRmllbGRzU3RyaW5ncyBmcm9tICcuLi8uLi9DaGFyZ2VzQW5kRmllbGRzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBDaGFyZ2VzQW5kRmllbGRzQ29sb3JzIGZyb20gJy4uL0NoYXJnZXNBbmRGaWVsZHNDb2xvcnMuanMnO1xyXG5pbXBvcnQgQ2hhcmdlc0FuZEZpZWxkc0NvbnN0YW50cyBmcm9tICcuLi9DaGFyZ2VzQW5kRmllbGRzQ29uc3RhbnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50cyByZWxhdGVkIHRvIHRleHRcclxuY29uc3QgRk9OVCA9IENoYXJnZXNBbmRGaWVsZHNDb25zdGFudHMuR1JJRF9MQUJFTF9GT05UO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1JTk9SX0dSSURMSU5FU19QRVJfTUFKT1JfR1JJRExJTkUgPSBDaGFyZ2VzQW5kRmllbGRzQ29uc3RhbnRzLk1JTk9SX0dSSURMSU5FU19QRVJfTUFKT1JfR1JJRExJTkU7XHJcbmNvbnN0IE1BSk9SX0dSSURMSU5FX0xJTkVXSURUSCA9IDI7XHJcbmNvbnN0IE1JTk9SX0dSSURMSU5FX0xJTkVXSURUSCA9IDE7XHJcbmNvbnN0IEFSUk9XX0xFTkdUSCA9IDE7IC8vIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbmNvbnN0IEFSUk9XX1BPU0lUSU9OID0gbmV3IFZlY3RvcjIoIDIsIC0yLjIwICk7IC8vIHRvcCBsZWZ0IHBvc2l0aW9uIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcblxyXG5jb25zdCBvbmVNZXRlclN0cmluZyA9IENoYXJnZXNBbmRGaWVsZHNTdHJpbmdzLm9uZU1ldGVyO1xyXG5cclxuY2xhc3MgR3JpZE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxCb3VuZHMyPn0gYm91bmRzUHJvcGVydHkgLSBib3VuZHMgaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gaXNHcmlkVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGFyZVZhbHVlc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICAgICAgICAgICBib3VuZHNQcm9wZXJ0eSxcclxuICAgICAgICAgICAgICAgaXNHcmlkVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICBhcmVWYWx1ZXNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgICAgICAgIHRhbmRlbSApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIGNvbnN0IGdyaWRMaW5lc1BhcmVudCA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgLy8gc2VwYXJhdGlvbiBpbiBtb2RlbCBjb29yZGluYXRlcyBvZiB0aGUgbWFqb3IgZ3JpZCBsaW5lc1xyXG4gICAgY29uc3QgbWFqb3JEZWx0YVggPSBDaGFyZ2VzQW5kRmllbGRzQ29uc3RhbnRzLkdSSURfTUFKT1JfU1BBQ0lORztcclxuICAgIGNvbnN0IG1ham9yRGVsdGFZID0gbWFqb3JEZWx0YVg7IC8vIHdlIHdhbnQgYSBzcXVhcmUgZ3JpZFxyXG5cclxuICAgIC8vIHNlcGFyYXRpb24gaW4gbW9kZWwgY29vcmRpbmF0ZXMgb2YgdGhlIG1pbm9yIGdyaWQgbGluZXNcclxuICAgIGNvbnN0IGRlbHRhWCA9IG1ham9yRGVsdGFYIC8gTUlOT1JfR1JJRExJTkVTX1BFUl9NQUpPUl9HUklETElORTtcclxuICAgIGNvbnN0IGRlbHRhWSA9IG1ham9yRGVsdGFZIC8gTUlOT1JfR1JJRExJTkVTX1BFUl9NQUpPUl9HUklETElORTtcclxuXHJcbiAgICAvLyB0aGUgZm9sbG93aW5nIHZhcmlhYmxlcyBhcmUgaW50ZWdlcnNcclxuICAgIGNvbnN0IG1pbkkgPSBNYXRoLmNlaWwoIGJvdW5kc1Byb3BlcnR5LmdldCgpLm1pblggLyBkZWx0YVggKTtcclxuICAgIGNvbnN0IG1heEkgPSBNYXRoLmZsb29yKCBib3VuZHNQcm9wZXJ0eS5nZXQoKS5tYXhYIC8gZGVsdGFYICk7XHJcbiAgICBjb25zdCBtaW5KID0gTWF0aC5jZWlsKCBib3VuZHNQcm9wZXJ0eS5nZXQoKS5taW5ZIC8gZGVsdGFZICk7XHJcbiAgICBjb25zdCBtYXhKID0gTWF0aC5mbG9vciggYm91bmRzUHJvcGVydHkuZ2V0KCkubWF4WSAvIGRlbHRhWSApO1xyXG5cclxuICAgIGxldCBpOyAvLyB7bnVtYmVyfSBhbiBpbnRlZ2VyXHJcbiAgICBsZXQgajsgLy8ge251bWJlcn0gYW4gaW50ZWdlclxyXG4gICAgbGV0IGlzTWFqb3JHcmlkTGluZTsgLy8ge2Jvb2xlYW59XHJcbiAgICBjb25zdCBtYWpvckdyaWRMaW5lc1NoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICBjb25zdCBtaW5vckdyaWRMaW5lc1NoYXBlID0gbmV3IFNoYXBlKCk7XHJcblxyXG4gICAgLy8gdmVydGljYWwgZ3JpZExpbmVzXHJcbiAgICBmb3IgKCBpID0gbWluSTsgaSA8PSBtYXhJOyBpKysgKSB7XHJcbiAgICAgIGlzTWFqb3JHcmlkTGluZSA9ICggaSAlIE1JTk9SX0dSSURMSU5FU19QRVJfTUFKT1JfR1JJRExJTkUgPT09IDAgKTtcclxuICAgICAgaWYgKCBpc01ham9yR3JpZExpbmUgKSB7XHJcbiAgICAgICAgbWFqb3JHcmlkTGluZXNTaGFwZS5tb3ZlVG8oIGkgKiBkZWx0YVgsIG1pbkogKiBkZWx0YVkgKS52ZXJ0aWNhbExpbmVUbyggbWF4SiAqIGRlbHRhWSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIG1pbm9yR3JpZExpbmVzU2hhcGUubW92ZVRvKCBpICogZGVsdGFYLCBtaW5KICogZGVsdGFZICkudmVydGljYWxMaW5lVG8oIG1heEogKiBkZWx0YVkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGhvcml6b250YWwgZ3JpZExpbmVzXHJcbiAgICBmb3IgKCBqID0gbWluSjsgaiA8PSBtYXhKOyBqKysgKSB7XHJcbiAgICAgIGlzTWFqb3JHcmlkTGluZSA9ICggaiAlIE1JTk9SX0dSSURMSU5FU19QRVJfTUFKT1JfR1JJRExJTkUgPT09IDAgKTtcclxuICAgICAgaWYgKCBpc01ham9yR3JpZExpbmUgKSB7XHJcbiAgICAgICAgbWFqb3JHcmlkTGluZXNTaGFwZS5tb3ZlVG8oIG1pbkkgKiBkZWx0YVgsIGogKiBkZWx0YVkgKS5ob3Jpem9udGFsTGluZVRvKCBtYXhJICogZGVsdGFYICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgbWlub3JHcmlkTGluZXNTaGFwZS5tb3ZlVG8oIG1pbkkgKiBkZWx0YVgsIGogKiBkZWx0YVkgKS5ob3Jpem9udGFsTGluZVRvKCBtYXhJICogZGVsdGFYICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtYWpvckdyaWRMaW5lc1BhdGggPSBuZXcgUGF0aCggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3U2hhcGUoIG1ham9yR3JpZExpbmVzU2hhcGUgKSwge1xyXG4gICAgICBsaW5lV2lkdGg6IE1BSk9SX0dSSURMSU5FX0xJTkVXSURUSCxcclxuICAgICAgbGluZUNhcDogJ2J1dHQnLFxyXG4gICAgICBsaW5lSm9pbjogJ2JldmVsJyxcclxuICAgICAgc3Ryb2tlOiBDaGFyZ2VzQW5kRmllbGRzQ29sb3JzLmdyaWRTdHJva2VQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWFqb3JHcmlkTGluZXNQYXRoJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbWlub3JHcmlkTGluZXNQYXRoID0gbmV3IFBhdGgoIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1NoYXBlKCBtaW5vckdyaWRMaW5lc1NoYXBlICksIHtcclxuICAgICAgbGluZVdpZHRoOiBNSU5PUl9HUklETElORV9MSU5FV0lEVEgsXHJcbiAgICAgIGxpbmVDYXA6ICdidXR0JyxcclxuICAgICAgbGluZUpvaW46ICdiZXZlbCcsXHJcbiAgICAgIHN0cm9rZTogQ2hhcmdlc0FuZEZpZWxkc0NvbG9ycy5ncmlkU3Ryb2tlUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21pbm9yR3JpZExpbmVzUGF0aCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgb25lLW1ldGVyIGRvdWJsZSBoZWFkZWQgYXJyb3cgcmVwcmVzZW50YXRpb25cclxuICAgIGNvbnN0IGFycm93U2hhcGUgPSBuZXcgQXJyb3dTaGFwZSggMCwgMCwgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBBUlJPV19MRU5HVEggKSwgMCwgeyBkb3VibGVIZWFkOiB0cnVlIH0gKTtcclxuICAgIGNvbnN0IGFycm93UGF0aCA9IG5ldyBQYXRoKCBhcnJvd1NoYXBlLCB7XHJcbiAgICAgIGZpbGw6IENoYXJnZXNBbmRGaWVsZHNDb2xvcnMuZ3JpZExlbmd0aFNjYWxlQXJyb3dGaWxsUHJvcGVydHksXHJcbiAgICAgIHN0cm9rZTogQ2hhcmdlc0FuZEZpZWxkc0NvbG9ycy5ncmlkTGVuZ3RoU2NhbGVBcnJvd1N0cm9rZVByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhcnJvd1BhdGgnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgdGV4dCAobGVnZW5kKSBhY2NvbXBhbnlpbmcgdGhlIGRvdWJsZSBoZWFkZWQgYXJyb3dcclxuICAgIGNvbnN0IGxlZ2VuZFRleHQgPSBuZXcgVGV4dCggb25lTWV0ZXJTdHJpbmcsIHtcclxuICAgICAgZmlsbDogQ2hhcmdlc0FuZEZpZWxkc0NvbG9ycy5ncmlkVGV4dEZpbGxQcm9wZXJ0eSxcclxuICAgICAgZm9udDogRk9OVCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGVnZW5kVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCBhbGwgdGhlIG5vZGVzXHJcbiAgICBncmlkTGluZXNQYXJlbnQuYWRkQ2hpbGQoIG1pbm9yR3JpZExpbmVzUGF0aCApO1xyXG4gICAgZ3JpZExpbmVzUGFyZW50LmFkZENoaWxkKCBtYWpvckdyaWRMaW5lc1BhdGggKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGdyaWRMaW5lc1BhcmVudCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYXJyb3dQYXRoICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBsZWdlbmRUZXh0ICk7XHJcblxyXG4gICAgLy8gbGF5b3V0XHJcbiAgICBhcnJvd1BhdGgudG9wID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggQVJST1dfUE9TSVRJT04ueSApOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHN1Y2ggdGhhdCB0aGUgZWxlY3RyaWMgZmllbGQgYXJyb3dzIGRvIG5vdCBvdmVybGFwIHdpdGggaXRcclxuICAgIGFycm93UGF0aC5sZWZ0ID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggQVJST1dfUE9TSVRJT04ueCApOyAvLyBzaG91bGQgYmUgc2V0IHRvIGFuIGludGVnZXIgdmFsdWUgc3VjaCB0aGF0IGl0IHNwYW5zIHR3byBtYWpvckdyaWRMaW5lc1xyXG4gICAgbGVnZW5kVGV4dC5jZW50ZXJYID0gYXJyb3dQYXRoLmNlbnRlclg7XHJcbiAgICBsZWdlbmRUZXh0LnRvcCA9IGFycm93UGF0aC5ib3R0b207XHJcblxyXG4gICAgLy8gU2hvdy8gSGlkZSB0aGUgYXJyb3dcclxuICAgIC8vIG5vIG5lZWQgdG8gdW5saW5rLCBwcmVzZW50IGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbXVsYXRpb25cclxuICAgIGFyZVZhbHVlc1Zpc2libGVQcm9wZXJ0eS5saW5rKCBpc1Zpc2libGUgPT4ge1xyXG4gICAgICBhcnJvd1BhdGgudmlzaWJsZSA9IGlzVmlzaWJsZTtcclxuICAgICAgbGVnZW5kVGV4dC52aXNpYmxlID0gaXNWaXNpYmxlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFNob3cvIEhpZGUgdGhlIGdyaWRcclxuICAgIC8vIG5vIG5lZWQgdG8gdW5saW5rLCBwcmVzZW50IGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbXVsYXRpb25cclxuICAgIGlzR3JpZFZpc2libGVQcm9wZXJ0eS5saW5rKCBpc1Zpc2libGUgPT4ge1xyXG4gICAgICB0aGlzLnZpc2libGUgPSBpc1Zpc2libGU7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5jaGFyZ2VzQW5kRmllbGRzLnJlZ2lzdGVyKCAnR3JpZE5vZGUnLCBHcmlkTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBHcmlkTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsVUFBVSxNQUFNLDJDQUEyQztBQUNsRSxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNwRSxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsdUJBQXVCLE1BQU0sa0NBQWtDO0FBQ3RFLE9BQU9DLHNCQUFzQixNQUFNLDhCQUE4QjtBQUNqRSxPQUFPQyx5QkFBeUIsTUFBTSxpQ0FBaUM7O0FBRXZFO0FBQ0EsTUFBTUMsSUFBSSxHQUFHRCx5QkFBeUIsQ0FBQ0UsZUFBZTs7QUFFdEQ7QUFDQSxNQUFNQyxrQ0FBa0MsR0FBR0gseUJBQXlCLENBQUNHLGtDQUFrQztBQUN2RyxNQUFNQyx3QkFB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