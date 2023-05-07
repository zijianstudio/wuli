// Copyright 2019-2022, University of Colorado Boulder

/**
 * Panel content for showing/hiding various arrows/readouts.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusMinusZoomButtonGroup from '../../../../scenery-phet/js/PlusMinusZoomButtonGroup.js';
import { FlowBox, GridBox, Text, VBox, HSeparator } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';

// constants
const arrowSpacing = 15;
const maxWidth = 200;
const arrowLength = 60;
const arrowOptions = {
  stroke: null,
  headWidth: 15,
  headHeight: 15,
  tailWidth: 4
};
const labelOptions = {
  font: new PhetFont(14),
  maxWidth: maxWidth
};
const checkboxOptions = {
  boxWidth: 17
};
const checkboxSpacing = 5;
export default class DisplayOptionsNode extends VBox {
  constructor(model, options) {
    super(combineOptions({
      spacing: 10,
      align: 'left',
      children: [new Text(DensityBuoyancyCommonStrings.forcesStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: maxWidth
      }), new FlowBox({
        orientation: 'vertical',
        spacing: 8,
        align: 'left',
        children: [new GridBox({
          xSpacing: arrowSpacing,
          ySpacing: 10,
          xAlign: 'left',
          children: [
          // Gravity
          new Checkbox(model.showGravityForceProperty, new Text(DensityBuoyancyCommonStrings.gravity.nameStringProperty, labelOptions), combineOptions({
            layoutOptions: {
              column: 0,
              row: 0
            }
          }, checkboxOptions)), new ArrowNode(0, 0, arrowLength, 0, combineOptions({
            layoutOptions: {
              column: 1,
              row: 0
            },
            fill: DensityBuoyancyCommonColors.gravityForceProperty
          }, arrowOptions)),
          // Buoyancy
          new Checkbox(model.showBuoyancyForceProperty, new Text(DensityBuoyancyCommonStrings.buoyancyStringProperty, labelOptions), combineOptions({
            layoutOptions: {
              column: 0,
              row: 1
            }
          }, checkboxOptions)), new ArrowNode(0, 0, arrowLength, 0, combineOptions({
            layoutOptions: {
              column: 1,
              row: 1
            },
            fill: DensityBuoyancyCommonColors.buoyancyForceProperty
          }, arrowOptions)),
          // Contact
          new Checkbox(model.showContactForceProperty, new Text(DensityBuoyancyCommonStrings.contactStringProperty, labelOptions), combineOptions({
            layoutOptions: {
              column: 0,
              row: 2
            }
          }, checkboxOptions)), new ArrowNode(0, 0, arrowLength, 0, combineOptions({
            layoutOptions: {
              column: 1,
              row: 2
            },
            fill: DensityBuoyancyCommonColors.contactForceProperty
          }, arrowOptions)),
          // Vector scale
          new Text(DensityBuoyancyCommonStrings.vectorScaleStringProperty, combineOptions({
            layoutOptions: {
              column: 0,
              row: 3
            }
          }, labelOptions)), new PlusMinusZoomButtonGroup(model.forceScaleProperty, {
            layoutOptions: {
              column: 1,
              row: 3,
              xAlign: 'center'
            },
            orientation: 'horizontal',
            applyZoomIn: scale => scale * 2,
            applyZoomOut: scale => scale / 2
          })]
        }), new HSeparator(), new VBox({
          spacing: checkboxSpacing,
          align: 'left',
          children: [new Checkbox(model.showMassesProperty, new Text(DensityBuoyancyCommonStrings.massesStringProperty, labelOptions), checkboxOptions), new Checkbox(model.showForceValuesProperty, new Text(DensityBuoyancyCommonStrings.forceValuesStringProperty, labelOptions), checkboxOptions)]
        })]
      })]
    }, options));
  }
}
densityBuoyancyCommon.register('DisplayOptionsNode', DisplayOptionsNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBcnJvd05vZGUiLCJQaGV0Rm9udCIsIlBsdXNNaW51c1pvb21CdXR0b25Hcm91cCIsIkZsb3dCb3giLCJHcmlkQm94IiwiVGV4dCIsIlZCb3giLCJIU2VwYXJhdG9yIiwiQ2hlY2tib3giLCJkZW5zaXR5QnVveWFuY3lDb21tb24iLCJEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzIiwiRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzIiwiRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzIiwiY29tYmluZU9wdGlvbnMiLCJhcnJvd1NwYWNpbmciLCJtYXhXaWR0aCIsImFycm93TGVuZ3RoIiwiYXJyb3dPcHRpb25zIiwic3Ryb2tlIiwiaGVhZFdpZHRoIiwiaGVhZEhlaWdodCIsInRhaWxXaWR0aCIsImxhYmVsT3B0aW9ucyIsImZvbnQiLCJjaGVja2JveE9wdGlvbnMiLCJib3hXaWR0aCIsImNoZWNrYm94U3BhY2luZyIsIkRpc3BsYXlPcHRpb25zTm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJvcHRpb25zIiwic3BhY2luZyIsImFsaWduIiwiY2hpbGRyZW4iLCJmb3JjZXNTdHJpbmdQcm9wZXJ0eSIsIlRJVExFX0ZPTlQiLCJvcmllbnRhdGlvbiIsInhTcGFjaW5nIiwieVNwYWNpbmciLCJ4QWxpZ24iLCJzaG93R3Jhdml0eUZvcmNlUHJvcGVydHkiLCJncmF2aXR5IiwibmFtZVN0cmluZ1Byb3BlcnR5IiwibGF5b3V0T3B0aW9ucyIsImNvbHVtbiIsInJvdyIsImZpbGwiLCJncmF2aXR5Rm9yY2VQcm9wZXJ0eSIsInNob3dCdW95YW5jeUZvcmNlUHJvcGVydHkiLCJidW95YW5jeVN0cmluZ1Byb3BlcnR5IiwiYnVveWFuY3lGb3JjZVByb3BlcnR5Iiwic2hvd0NvbnRhY3RGb3JjZVByb3BlcnR5IiwiY29udGFjdFN0cmluZ1Byb3BlcnR5IiwiY29udGFjdEZvcmNlUHJvcGVydHkiLCJ2ZWN0b3JTY2FsZVN0cmluZ1Byb3BlcnR5IiwiZm9yY2VTY2FsZVByb3BlcnR5IiwiYXBwbHlab29tSW4iLCJzY2FsZSIsImFwcGx5Wm9vbU91dCIsInNob3dNYXNzZXNQcm9wZXJ0eSIsIm1hc3Nlc1N0cmluZ1Byb3BlcnR5Iiwic2hvd0ZvcmNlVmFsdWVzUHJvcGVydHkiLCJmb3JjZVZhbHVlc1N0cmluZ1Byb3BlcnR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEaXNwbGF5T3B0aW9uc05vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUGFuZWwgY29udGVudCBmb3Igc2hvd2luZy9oaWRpbmcgdmFyaW91cyBhcnJvd3MvcmVhZG91dHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQXJyb3dOb2RlLCB7IEFycm93Tm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBQbHVzTWludXNab29tQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BsdXNNaW51c1pvb21CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCB7IEZsb3dCb3gsIEdyaWRCb3gsIFRleHQsIFRleHRPcHRpb25zLCBWQm94LCBWQm94T3B0aW9ucywgSFNlcGFyYXRvciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDaGVja2JveCwgeyBDaGVja2JveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgZGVuc2l0eUJ1b3lhbmN5Q29tbW9uIGZyb20gJy4uLy4uL2RlbnNpdHlCdW95YW5jeUNvbW1vbi5qcyc7XHJcbmltcG9ydCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzIGZyb20gJy4uLy4uL0RlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzIGZyb20gJy4uL0RlbnNpdHlCdW95YW5jeUNvbW1vbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMgZnJvbSAnLi9EZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMuanMnO1xyXG5pbXBvcnQgRGVuc2l0eUJ1b3lhbmN5TW9kZWwgZnJvbSAnLi4vbW9kZWwvRGVuc2l0eUJ1b3lhbmN5TW9kZWwuanMnO1xyXG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IGFycm93U3BhY2luZyA9IDE1O1xyXG5jb25zdCBtYXhXaWR0aCA9IDIwMDtcclxuY29uc3QgYXJyb3dMZW5ndGggPSA2MDtcclxuY29uc3QgYXJyb3dPcHRpb25zID0ge1xyXG4gIHN0cm9rZTogbnVsbCxcclxuICBoZWFkV2lkdGg6IDE1LFxyXG4gIGhlYWRIZWlnaHQ6IDE1LFxyXG4gIHRhaWxXaWR0aDogNFxyXG59O1xyXG5jb25zdCBsYWJlbE9wdGlvbnMgPSB7XHJcbiAgZm9udDogbmV3IFBoZXRGb250KCAxNCApLFxyXG4gIG1heFdpZHRoOiBtYXhXaWR0aFxyXG59O1xyXG5jb25zdCBjaGVja2JveE9wdGlvbnMgPSB7XHJcbiAgYm94V2lkdGg6IDE3XHJcbn07XHJcbmNvbnN0IGNoZWNrYm94U3BhY2luZyA9IDU7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwbGF5T3B0aW9uc05vZGUgZXh0ZW5kcyBWQm94IHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBEZW5zaXR5QnVveWFuY3lNb2RlbCwgb3B0aW9ucz86IFZCb3hPcHRpb25zICkge1xyXG5cclxuICAgIHN1cGVyKCBjb21iaW5lT3B0aW9uczxWQm94T3B0aW9ucz4oIHtcclxuICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFRleHQoIERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MuZm9yY2VzU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICAgIGZvbnQ6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbnN0YW50cy5USVRMRV9GT05ULFxyXG4gICAgICAgICAgbWF4V2lkdGg6IG1heFdpZHRoXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBGbG93Qm94KCB7XHJcbiAgICAgICAgICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJyxcclxuICAgICAgICAgIHNwYWNpbmc6IDgsXHJcbiAgICAgICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgbmV3IEdyaWRCb3goIHtcclxuICAgICAgICAgICAgICB4U3BhY2luZzogYXJyb3dTcGFjaW5nLFxyXG4gICAgICAgICAgICAgIHlTcGFjaW5nOiAxMCxcclxuICAgICAgICAgICAgICB4QWxpZ246ICdsZWZ0JyxcclxuICAgICAgICAgICAgICBjaGlsZHJlbjogW1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdyYXZpdHlcclxuICAgICAgICAgICAgICAgIG5ldyBDaGVja2JveCggbW9kZWwuc2hvd0dyYXZpdHlGb3JjZVByb3BlcnR5LCBuZXcgVGV4dCggRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5ncmF2aXR5Lm5hbWVTdHJpbmdQcm9wZXJ0eSwgbGFiZWxPcHRpb25zICksIGNvbWJpbmVPcHRpb25zPENoZWNrYm94T3B0aW9ucz4oIHtcclxuICAgICAgICAgICAgICAgICAgbGF5b3V0T3B0aW9uczogeyBjb2x1bW46IDAsIHJvdzogMCB9XHJcbiAgICAgICAgICAgICAgICB9LCBjaGVja2JveE9wdGlvbnMgKSApLFxyXG4gICAgICAgICAgICAgICAgbmV3IEFycm93Tm9kZSggMCwgMCwgYXJyb3dMZW5ndGgsIDAsIGNvbWJpbmVPcHRpb25zPEFycm93Tm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgICAgICAgICAgICAgIGxheW91dE9wdGlvbnM6IHsgY29sdW1uOiAxLCByb3c6IDAgfSxcclxuICAgICAgICAgICAgICAgICAgZmlsbDogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzLmdyYXZpdHlGb3JjZVByb3BlcnR5XHJcbiAgICAgICAgICAgICAgICB9LCBhcnJvd09wdGlvbnMgKSApLFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEJ1b3lhbmN5XHJcbiAgICAgICAgICAgICAgICBuZXcgQ2hlY2tib3goIG1vZGVsLnNob3dCdW95YW5jeUZvcmNlUHJvcGVydHksIG5ldyBUZXh0KCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLmJ1b3lhbmN5U3RyaW5nUHJvcGVydHksIGxhYmVsT3B0aW9ucyApLCBjb21iaW5lT3B0aW9uczxDaGVja2JveE9wdGlvbnM+KCB7XHJcbiAgICAgICAgICAgICAgICAgIGxheW91dE9wdGlvbnM6IHsgY29sdW1uOiAwLCByb3c6IDEgfVxyXG4gICAgICAgICAgICAgICAgfSwgY2hlY2tib3hPcHRpb25zICkgKSxcclxuICAgICAgICAgICAgICAgIG5ldyBBcnJvd05vZGUoIDAsIDAsIGFycm93TGVuZ3RoLCAwLCBjb21iaW5lT3B0aW9uczxBcnJvd05vZGVPcHRpb25zPigge1xyXG4gICAgICAgICAgICAgICAgICBsYXlvdXRPcHRpb25zOiB7IGNvbHVtbjogMSwgcm93OiAxIH0sXHJcbiAgICAgICAgICAgICAgICAgIGZpbGw6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5idW95YW5jeUZvcmNlUHJvcGVydHlcclxuICAgICAgICAgICAgICAgIH0sIGFycm93T3B0aW9ucyApICksXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29udGFjdFxyXG4gICAgICAgICAgICAgICAgbmV3IENoZWNrYm94KCBtb2RlbC5zaG93Q29udGFjdEZvcmNlUHJvcGVydHksIG5ldyBUZXh0KCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLmNvbnRhY3RTdHJpbmdQcm9wZXJ0eSwgbGFiZWxPcHRpb25zICksIGNvbWJpbmVPcHRpb25zPENoZWNrYm94T3B0aW9ucz4oIHtcclxuICAgICAgICAgICAgICAgICAgbGF5b3V0T3B0aW9uczogeyBjb2x1bW46IDAsIHJvdzogMiB9XHJcbiAgICAgICAgICAgICAgICB9LCBjaGVja2JveE9wdGlvbnMgKSApLFxyXG4gICAgICAgICAgICAgICAgbmV3IEFycm93Tm9kZSggMCwgMCwgYXJyb3dMZW5ndGgsIDAsIGNvbWJpbmVPcHRpb25zPEFycm93Tm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgICAgICAgICAgICAgIGxheW91dE9wdGlvbnM6IHsgY29sdW1uOiAxLCByb3c6IDIgfSxcclxuICAgICAgICAgICAgICAgICAgZmlsbDogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzLmNvbnRhY3RGb3JjZVByb3BlcnR5XHJcbiAgICAgICAgICAgICAgICB9LCBhcnJvd09wdGlvbnMgKSApLFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFZlY3RvciBzY2FsZVxyXG4gICAgICAgICAgICAgICAgbmV3IFRleHQoIERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MudmVjdG9yU2NhbGVTdHJpbmdQcm9wZXJ0eSwgY29tYmluZU9wdGlvbnM8VGV4dE9wdGlvbnM+KCB7XHJcbiAgICAgICAgICAgICAgICAgIGxheW91dE9wdGlvbnM6IHsgY29sdW1uOiAwLCByb3c6IDMgfVxyXG4gICAgICAgICAgICAgICAgfSwgbGFiZWxPcHRpb25zICkgKSxcclxuICAgICAgICAgICAgICAgIG5ldyBQbHVzTWludXNab29tQnV0dG9uR3JvdXAoIG1vZGVsLmZvcmNlU2NhbGVQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgICAgICAgICBsYXlvdXRPcHRpb25zOiB7IGNvbHVtbjogMSwgcm93OiAzLCB4QWxpZ246ICdjZW50ZXInIH0sXHJcbiAgICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXHJcbiAgICAgICAgICAgICAgICAgIGFwcGx5Wm9vbUluOiAoIHNjYWxlOiBudW1iZXIgKSA9PiBzY2FsZSAqIDIsXHJcbiAgICAgICAgICAgICAgICAgIGFwcGx5Wm9vbU91dDogKCBzY2FsZTogbnVtYmVyICkgPT4gc2NhbGUgLyAyXHJcbiAgICAgICAgICAgICAgICB9IClcclxuICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0gKSxcclxuICAgICAgICAgICAgbmV3IEhTZXBhcmF0b3IoKSxcclxuICAgICAgICAgICAgbmV3IFZCb3goIHtcclxuICAgICAgICAgICAgICBzcGFjaW5nOiBjaGVja2JveFNwYWNpbmcsXHJcbiAgICAgICAgICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICAgICAgbmV3IENoZWNrYm94KCBtb2RlbC5zaG93TWFzc2VzUHJvcGVydHksIG5ldyBUZXh0KCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hc3Nlc1N0cmluZ1Byb3BlcnR5LCBsYWJlbE9wdGlvbnMgKSwgY2hlY2tib3hPcHRpb25zICksXHJcbiAgICAgICAgICAgICAgICBuZXcgQ2hlY2tib3goIG1vZGVsLnNob3dGb3JjZVZhbHVlc1Byb3BlcnR5LCBuZXcgVGV4dCggRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5mb3JjZVZhbHVlc1N0cmluZ1Byb3BlcnR5LCBsYWJlbE9wdGlvbnMgKSwgY2hlY2tib3hPcHRpb25zIClcclxuICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0gKVxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0gKVxyXG4gICAgICBdXHJcbiAgICB9LCBvcHRpb25zICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmRlbnNpdHlCdW95YW5jeUNvbW1vbi5yZWdpc3RlciggJ0Rpc3BsYXlPcHRpb25zTm9kZScsIERpc3BsYXlPcHRpb25zTm9kZSApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUE0QiwwQ0FBMEM7QUFDdEYsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyx3QkFBd0IsTUFBTSx5REFBeUQ7QUFDOUYsU0FBU0MsT0FBTyxFQUFFQyxPQUFPLEVBQUVDLElBQUksRUFBZUMsSUFBSSxFQUFlQyxVQUFVLFFBQVEsbUNBQW1DO0FBQ3RILE9BQU9DLFFBQVEsTUFBMkIsZ0NBQWdDO0FBQzFFLE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUNsRSxPQUFPQyw0QkFBNEIsTUFBTSx1Q0FBdUM7QUFDaEYsT0FBT0MsOEJBQThCLE1BQU0sc0NBQXNDO0FBQ2pGLE9BQU9DLDJCQUEyQixNQUFNLGtDQUFrQztBQUUxRSxTQUFTQyxjQUFjLFFBQVEsdUNBQXVDOztBQUV0RTtBQUNBLE1BQU1DLFlBQVksR0FBRyxFQUFFO0FBQ3ZCLE1BQU1DLFFBQVEsR0FBRyxHQUFHO0FBQ3BCLE1BQU1DLFdBQVcsR0FBRyxFQUFFO0FBQ3RCLE1BQU1DLFlBQVksR0FBRztFQUNuQkMsTUFBTSxFQUFFLElBQUk7RUFDWkMsU0FBUyxFQUFFLEVBQUU7RUFDYkMsVUFBVSxFQUFFLEVBQUU7RUFDZEMsU0FBUyxFQUFFO0FBQ2IsQ0FBQztBQUNELE1BQU1DLFlBQVksR0FBRztFQUNuQkMsSUFBSSxFQUFFLElBQUl0QixRQUFRLENBQUUsRUFBRyxDQUFDO0VBQ3hCYyxRQUFRLEVBQUVBO0FBQ1osQ0FBQztBQUNELE1BQU1TLGVBQWUsR0FBRztFQUN0QkMsUUFBUSxFQUFFO0FBQ1osQ0FBQztBQUNELE1B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