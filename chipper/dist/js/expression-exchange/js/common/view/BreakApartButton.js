// Copyright 2016-2022, University of Colorado Boulder

/**
 * button used for breaking things apart, supports a normal and color inverted appearance
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import scissorsShape from '../../../../sherpa/js/fontawesome-4/scissorsShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import expressionExchange from '../../expressionExchange.js';

// constants
const MARGIN = 3.5;
const ICON_WIDTH = 16; // in screen coordinates
const BLACK_SCISSORS_ICON = createIconNode(Color.BLACK);
const YELLOW_SCISSORS_ICON = createIconNode(PhetColorScheme.BUTTON_YELLOW);
class BreakApartButton extends RectangularPushButton {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      mode: 'normal' // valid values are 'normal' and 'inverted'
    }, options);

    // verify options are valid
    assert && assert(options.mode === 'normal' || options.mode === 'inverted', 'invalid mode option');
    const icon = options.mode === 'normal' ? BLACK_SCISSORS_ICON : YELLOW_SCISSORS_ICON;
    const iconNode = new Node({
      children: [icon]
    });

    // the following options can't be overridden, and are set here and then passed to the parent type below
    merge(options, {
      xMargin: MARGIN,
      yMargin: MARGIN,
      baseColor: options.mode === 'normal' ? PhetColorScheme.BUTTON_YELLOW : Color.BLACK,
      cursor: 'pointer',
      content: iconNode
    });
    super(options);

    // @private
    this.disposeBreakApartButton = () => {
      iconNode.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeBreakApartButton();
    super.dispose();
  }
}

/**
 * helper function for creating the icon node used on the button
 * @param {Color} color
 * @returns {Path}
 */
function createIconNode(color) {
  const iconNode = new Path(scissorsShape, {
    rotation: -Math.PI / 2,
    // make scissors point up
    fill: color
  });
  iconNode.setScaleMagnitude(ICON_WIDTH / iconNode.width);
  return iconNode;
}
expressionExchange.register('BreakApartButton', BreakApartButton);
export default BreakApartButton;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRDb2xvclNjaGVtZSIsIkNvbG9yIiwiTm9kZSIsIlBhdGgiLCJzY2lzc29yc1NoYXBlIiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiZXhwcmVzc2lvbkV4Y2hhbmdlIiwiTUFSR0lOIiwiSUNPTl9XSURUSCIsIkJMQUNLX1NDSVNTT1JTX0lDT04iLCJjcmVhdGVJY29uTm9kZSIsIkJMQUNLIiwiWUVMTE9XX1NDSVNTT1JTX0lDT04iLCJCVVRUT05fWUVMTE9XIiwiQnJlYWtBcGFydEJ1dHRvbiIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIm1vZGUiLCJhc3NlcnQiLCJpY29uIiwiaWNvbk5vZGUiLCJjaGlsZHJlbiIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiYmFzZUNvbG9yIiwiY3Vyc29yIiwiY29udGVudCIsImRpc3Bvc2VCcmVha0FwYXJ0QnV0dG9uIiwiZGlzcG9zZSIsImNvbG9yIiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJmaWxsIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJ3aWR0aCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQnJlYWtBcGFydEJ1dHRvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBidXR0b24gdXNlZCBmb3IgYnJlYWtpbmcgdGhpbmdzIGFwYXJ0LCBzdXBwb3J0cyBhIG5vcm1hbCBhbmQgY29sb3IgaW52ZXJ0ZWQgYXBwZWFyYW5jZVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHNjaXNzb3JzU2hhcGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hlcnBhL2pzL2ZvbnRhd2Vzb21lLTQvc2Npc3NvcnNTaGFwZS5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IGV4cHJlc3Npb25FeGNoYW5nZSBmcm9tICcuLi8uLi9leHByZXNzaW9uRXhjaGFuZ2UuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1BUkdJTiA9IDMuNTtcclxuY29uc3QgSUNPTl9XSURUSCA9IDE2OyAvLyBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuY29uc3QgQkxBQ0tfU0NJU1NPUlNfSUNPTiA9IGNyZWF0ZUljb25Ob2RlKCBDb2xvci5CTEFDSyApO1xyXG5jb25zdCBZRUxMT1dfU0NJU1NPUlNfSUNPTiA9IGNyZWF0ZUljb25Ob2RlKCBQaGV0Q29sb3JTY2hlbWUuQlVUVE9OX1lFTExPVyApO1xyXG5cclxuY2xhc3MgQnJlYWtBcGFydEJ1dHRvbiBleHRlbmRzIFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgbW9kZTogJ25vcm1hbCcgLy8gdmFsaWQgdmFsdWVzIGFyZSAnbm9ybWFsJyBhbmQgJ2ludmVydGVkJ1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHZlcmlmeSBvcHRpb25zIGFyZSB2YWxpZFxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5tb2RlID09PSAnbm9ybWFsJyB8fCBvcHRpb25zLm1vZGUgPT09ICdpbnZlcnRlZCcsICdpbnZhbGlkIG1vZGUgb3B0aW9uJyApO1xyXG5cclxuICAgIGNvbnN0IGljb24gPSBvcHRpb25zLm1vZGUgPT09ICdub3JtYWwnID8gQkxBQ0tfU0NJU1NPUlNfSUNPTiA6IFlFTExPV19TQ0lTU09SU19JQ09OO1xyXG4gICAgY29uc3QgaWNvbk5vZGUgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBpY29uIF0gfSApO1xyXG5cclxuICAgIC8vIHRoZSBmb2xsb3dpbmcgb3B0aW9ucyBjYW4ndCBiZSBvdmVycmlkZGVuLCBhbmQgYXJlIHNldCBoZXJlIGFuZCB0aGVuIHBhc3NlZCB0byB0aGUgcGFyZW50IHR5cGUgYmVsb3dcclxuICAgIG1lcmdlKCBvcHRpb25zLCB7XHJcbiAgICAgIHhNYXJnaW46IE1BUkdJTixcclxuICAgICAgeU1hcmdpbjogTUFSR0lOLFxyXG4gICAgICBiYXNlQ29sb3I6IG9wdGlvbnMubW9kZSA9PT0gJ25vcm1hbCcgPyBQaGV0Q29sb3JTY2hlbWUuQlVUVE9OX1lFTExPVyA6IENvbG9yLkJMQUNLLFxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgY29udGVudDogaWNvbk5vZGVcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmRpc3Bvc2VCcmVha0FwYXJ0QnV0dG9uID0gKCkgPT4ge1xyXG4gICAgICBpY29uTm9kZS5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VCcmVha0FwYXJ0QnV0dG9uKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogaGVscGVyIGZ1bmN0aW9uIGZvciBjcmVhdGluZyB0aGUgaWNvbiBub2RlIHVzZWQgb24gdGhlIGJ1dHRvblxyXG4gKiBAcGFyYW0ge0NvbG9yfSBjb2xvclxyXG4gKiBAcmV0dXJucyB7UGF0aH1cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUljb25Ob2RlKCBjb2xvciApIHtcclxuICBjb25zdCBpY29uTm9kZSA9IG5ldyBQYXRoKCBzY2lzc29yc1NoYXBlLCB7XHJcbiAgICByb3RhdGlvbjogLU1hdGguUEkgLyAyLCAvLyBtYWtlIHNjaXNzb3JzIHBvaW50IHVwXHJcbiAgICBmaWxsOiBjb2xvclxyXG4gIH0gKTtcclxuICBpY29uTm9kZS5zZXRTY2FsZU1hZ25pdHVkZSggSUNPTl9XSURUSCAvIGljb25Ob2RlLndpZHRoICk7XHJcbiAgcmV0dXJuIGljb25Ob2RlO1xyXG59XHJcblxyXG5leHByZXNzaW9uRXhjaGFuZ2UucmVnaXN0ZXIoICdCcmVha0FwYXJ0QnV0dG9uJywgQnJlYWtBcGFydEJ1dHRvbiApO1xyXG5leHBvcnQgZGVmYXVsdCBCcmVha0FwYXJ0QnV0dG9uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JFLE9BQU9DLGFBQWEsTUFBTSxzREFBc0Q7QUFDaEYsT0FBT0MscUJBQXFCLE1BQU0scURBQXFEO0FBQ3ZGLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2Qjs7QUFFNUQ7QUFDQSxNQUFNQyxNQUFNLEdBQUcsR0FBRztBQUNsQixNQUFNQyxVQUFVLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDdkIsTUFBTUMsbUJBQW1CLEdBQUdDLGNBQWMsQ0FBRVQsS0FBSyxDQUFDVSxLQUFNLENBQUM7QUFDekQsTUFBTUMsb0JBQW9CLEdBQUdGLGNBQWMsQ0FBRVYsZUFBZSxDQUFDYSxhQUFjLENBQUM7QUFFNUUsTUFBTUMsZ0JBQWdCLFNBQVNULHFCQUFxQixDQUFDO0VBRW5EO0FBQ0Y7QUFDQTtFQUNFVSxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckJBLE9BQU8sR0FBR2pCLEtBQUssQ0FBRTtNQUNma0IsSUFBSSxFQUFFLFFBQVEsQ0FBQztJQUNqQixDQUFDLEVBQUVELE9BQVEsQ0FBQzs7SUFFWjtJQUNBRSxNQUFNLElBQUlBLE1BQU0sQ0FBRUYsT0FBTyxDQUFDQyxJQUFJLEtBQUssUUFBUSxJQUFJRCxPQUFPLENBQUNDLElBQUksS0FBSyxVQUFVLEVBQUUscUJBQXNCLENBQUM7SUFFbkcsTUFBTUUsSUFBSSxHQUFHSCxPQUFPLENBQUNDLElBQUksS0FBSyxRQUFRLEdBQUdSLG1CQUFtQixHQUFHRyxvQkFBb0I7SUFDbkYsTUFBTVEsUUFBUSxHQUFHLElBQUlsQixJQUFJLENBQUU7TUFBRW1CLFFBQVEsRUFBRSxDQUFFRixJQUFJO0lBQUcsQ0FBRSxDQUFDOztJQUVuRDtJQUNBcEIsS0FBSyxDQUFFaUIsT0FBTyxFQUFFO01BQ2RNLE9BQU8sRUFBRWYsTUFBTTtNQUNmZ0IsT0FBTyxFQUFFaEIsTUFBTTtNQUNmaUIsU0FBUyxFQUFFUixPQUFPLENBQUNDLElBQUksS0FBSyxRQUFRLEdBQUdqQixlQUFlLENBQUNhLGFBQWEsR0FBR1osS0FBSyxDQUFDVSxLQUFLO01BQ2xGYyxNQUFNLEVBQUUsU0FBUztNQUNqQkMsT0FBTyxFQUFFTjtJQUNYLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRUosT0FBUSxDQUFDOztJQUVoQjtJQUNBLElBQUksQ0FBQ1csdUJBQXVCLEdBQUcsTUFBTTtNQUNuQ1AsUUFBUSxDQUFDUSxPQUFPLENBQUMsQ0FBQztJQUNwQixDQUFDO0VBQ0g7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUEsT0FBT0EsQ0FBQSxFQUFHO0lBQ1IsSUFBSSxDQUFDRCx1QkFBdUIsQ0FBQyxDQUFDO0lBQzlCLEtBQUssQ0FBQ0MsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU2xCLGNBQWNBLENBQUVtQixLQUFLLEVBQUc7RUFDL0IsTUFBTVQsUUFBUSxHQUFHLElBQUlqQixJQUFJLENBQUVDLGFBQWEsRUFBRTtJQUN4QzBCLFFBQVEsRUFBRSxDQUFDQyxJQUFJLENBQUNDLEVBQUUsR0FBRyxDQUFDO0lBQUU7SUFDeEJDLElBQUksRUFBRUo7RUFDUixDQUFFLENBQUM7RUFDSFQsUUFBUSxDQUFDYyxpQkFBaUIsQ0FBRTFCLFVBQVUsR0FBR1ksUUFBUSxDQUFDZSxLQUFNLENBQUM7RUFDekQsT0FBT2YsUUFBUTtBQUNqQjtBQUVBZCxrQkFBa0IsQ0FBQzhCLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRXRCLGdCQUFpQixDQUFDO0FBQ25FLGVBQWVBLGdCQUFnQiJ9