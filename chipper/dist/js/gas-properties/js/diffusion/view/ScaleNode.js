// Copyright 2019-2022, University of Colorado Boulder

/**
 * ScaleNode displays the scale that appears along the bottom of the container in the Diffusion screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import GasPropertiesColors from '../../common/GasPropertiesColors.js';
import gasProperties from '../../gasProperties.js';
import GasPropertiesStrings from '../../GasPropertiesStrings.js';

// constants
const TICK_LENGTH = 16; // view coordinates
const TICK_INTERVAL = 1; // nm

export default class ScaleNode extends Node {
  /**
   * @param containerWidth - the container width, in pm
   * @param modelViewTransform
   * @param providedOptions
   */
  constructor(containerWidth, modelViewTransform, providedOptions) {
    assert && assert(Number.isInteger(containerWidth) && containerWidth > 0);
    const options = optionize()({
      // because we're setting options.children below
    }, providedOptions);
    const pmTickInterval = TICK_INTERVAL * 1000; // adjusted for nm to pm
    const dx = modelViewTransform.modelToViewDeltaX(pmTickInterval); // pm
    const numberOfTicks = containerWidth / pmTickInterval;

    // One shape to describe all ticks
    const ticksShape = new Shape();
    for (let i = 0; i <= numberOfTicks; i++) {
      ticksShape.moveTo(i * dx, 0).lineTo(i * dx, TICK_LENGTH);
    }
    const ticksPath = new Path(ticksShape, {
      stroke: GasPropertiesColors.scaleColorProperty,
      lineWidth: 1
    });

    // '1 nm' label
    const labelNode = new Text(new PatternStringProperty(GasPropertiesStrings.valueUnitsStringProperty, {
      value: TICK_INTERVAL,
      units: GasPropertiesStrings.nanometersStringProperty
    }), {
      font: new PhetFont(12),
      fill: GasPropertiesColors.scaleColorProperty,
      maxWidth: 0.85 * dx
    });
    labelNode.boundsProperty.link(bounds => {
      labelNode.centerX = dx / 2;
      labelNode.top = ticksPath.bottom;
    });

    // double-headed arrow
    const arrowNode = new ArrowNode(0, 0, dx, 0, {
      doubleHead: true,
      tailWidth: 0.5,
      headHeight: 6,
      headWidth: 6,
      fill: GasPropertiesColors.scaleColorProperty,
      stroke: null,
      centerX: dx / 2,
      centerY: TICK_LENGTH / 2
    });
    options.children = [ticksPath, labelNode, arrowNode];
    super(options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
gasProperties.register('ScaleNode', ScaleNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJTaGFwZSIsIm9wdGlvbml6ZSIsIkFycm93Tm9kZSIsIlBoZXRGb250IiwiTm9kZSIsIlBhdGgiLCJUZXh0IiwiR2FzUHJvcGVydGllc0NvbG9ycyIsImdhc1Byb3BlcnRpZXMiLCJHYXNQcm9wZXJ0aWVzU3RyaW5ncyIsIlRJQ0tfTEVOR1RIIiwiVElDS19JTlRFUlZBTCIsIlNjYWxlTm9kZSIsImNvbnN0cnVjdG9yIiwiY29udGFpbmVyV2lkdGgiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJvcHRpb25zIiwicG1UaWNrSW50ZXJ2YWwiLCJkeCIsIm1vZGVsVG9WaWV3RGVsdGFYIiwibnVtYmVyT2ZUaWNrcyIsInRpY2tzU2hhcGUiLCJpIiwibW92ZVRvIiwibGluZVRvIiwidGlja3NQYXRoIiwic3Ryb2tlIiwic2NhbGVDb2xvclByb3BlcnR5IiwibGluZVdpZHRoIiwibGFiZWxOb2RlIiwidmFsdWVVbml0c1N0cmluZ1Byb3BlcnR5IiwidmFsdWUiLCJ1bml0cyIsIm5hbm9tZXRlcnNTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJmaWxsIiwibWF4V2lkdGgiLCJib3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJib3VuZHMiLCJjZW50ZXJYIiwidG9wIiwiYm90dG9tIiwiYXJyb3dOb2RlIiwiZG91YmxlSGVhZCIsInRhaWxXaWR0aCIsImhlYWRIZWlnaHQiLCJoZWFkV2lkdGgiLCJjZW50ZXJZIiwiY2hpbGRyZW4iLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTY2FsZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2NhbGVOb2RlIGRpc3BsYXlzIHRoZSBzY2FsZSB0aGF0IGFwcGVhcnMgYWxvbmcgdGhlIGJvdHRvbSBvZiB0aGUgY29udGFpbmVyIGluIHRoZSBEaWZmdXNpb24gc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQYXR0ZXJuU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9QYXR0ZXJuU3RyaW5nUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucywgUGF0aCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9HYXNQcm9wZXJ0aWVzQ29sb3JzLmpzJztcclxuaW1wb3J0IGdhc1Byb3BlcnRpZXMgZnJvbSAnLi4vLi4vZ2FzUHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBHYXNQcm9wZXJ0aWVzU3RyaW5ncyBmcm9tICcuLi8uLi9HYXNQcm9wZXJ0aWVzU3RyaW5ncy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVElDS19MRU5HVEggPSAxNjsgLy8gdmlldyBjb29yZGluYXRlc1xyXG5jb25zdCBUSUNLX0lOVEVSVkFMID0gMTsgLy8gbm1cclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBTY2FsZU5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlVHJhbnNsYXRpb25PcHRpb25zICYgUGlja1JlcXVpcmVkPE5vZGVPcHRpb25zLCAndGFuZGVtJyB8ICd2aXNpYmxlUHJvcGVydHknPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjYWxlTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gY29udGFpbmVyV2lkdGggLSB0aGUgY29udGFpbmVyIHdpZHRoLCBpbiBwbVxyXG4gICAqIEBwYXJhbSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb250YWluZXJXaWR0aDogbnVtYmVyLCBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsIHByb3ZpZGVkT3B0aW9uczogU2NhbGVOb2RlT3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIGNvbnRhaW5lcldpZHRoICkgJiYgY29udGFpbmVyV2lkdGggPiAwICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTY2FsZU5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuICAgICAgLy8gYmVjYXVzZSB3ZSdyZSBzZXR0aW5nIG9wdGlvbnMuY2hpbGRyZW4gYmVsb3dcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHBtVGlja0ludGVydmFsID0gVElDS19JTlRFUlZBTCAqIDEwMDA7IC8vIGFkanVzdGVkIGZvciBubSB0byBwbVxyXG4gICAgY29uc3QgZHggPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVgoIHBtVGlja0ludGVydmFsICk7IC8vIHBtXHJcbiAgICBjb25zdCBudW1iZXJPZlRpY2tzID0gY29udGFpbmVyV2lkdGggLyBwbVRpY2tJbnRlcnZhbDtcclxuXHJcbiAgICAvLyBPbmUgc2hhcGUgdG8gZGVzY3JpYmUgYWxsIHRpY2tzXHJcbiAgICBjb25zdCB0aWNrc1NoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPD0gbnVtYmVyT2ZUaWNrczsgaSsrICkge1xyXG4gICAgICB0aWNrc1NoYXBlLm1vdmVUbyggaSAqIGR4LCAwICkubGluZVRvKCBpICogZHgsIFRJQ0tfTEVOR1RIICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdGlja3NQYXRoID0gbmV3IFBhdGgoIHRpY2tzU2hhcGUsIHtcclxuICAgICAgc3Ryb2tlOiBHYXNQcm9wZXJ0aWVzQ29sb3JzLnNjYWxlQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgbGluZVdpZHRoOiAxXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gJzEgbm0nIGxhYmVsXHJcbiAgICBjb25zdCBsYWJlbE5vZGUgPSBuZXcgVGV4dCggbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggR2FzUHJvcGVydGllc1N0cmluZ3MudmFsdWVVbml0c1N0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIHZhbHVlOiBUSUNLX0lOVEVSVkFMLFxyXG4gICAgICB1bml0czogR2FzUHJvcGVydGllc1N0cmluZ3MubmFub21ldGVyc1N0cmluZ1Byb3BlcnR5XHJcbiAgICB9ICksIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApLFxyXG4gICAgICBmaWxsOiBHYXNQcm9wZXJ0aWVzQ29sb3JzLnNjYWxlQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgbWF4V2lkdGg6IDAuODUgKiBkeFxyXG4gICAgfSApO1xyXG4gICAgbGFiZWxOb2RlLmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICAgIGxhYmVsTm9kZS5jZW50ZXJYID0gZHggLyAyO1xyXG4gICAgICBsYWJlbE5vZGUudG9wID0gdGlja3NQYXRoLmJvdHRvbTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBkb3VibGUtaGVhZGVkIGFycm93XHJcbiAgICBjb25zdCBhcnJvd05vZGUgPSBuZXcgQXJyb3dOb2RlKCAwLCAwLCBkeCwgMCwge1xyXG4gICAgICBkb3VibGVIZWFkOiB0cnVlLFxyXG4gICAgICB0YWlsV2lkdGg6IDAuNSxcclxuICAgICAgaGVhZEhlaWdodDogNixcclxuICAgICAgaGVhZFdpZHRoOiA2LFxyXG4gICAgICBmaWxsOiBHYXNQcm9wZXJ0aWVzQ29sb3JzLnNjYWxlQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgc3Ryb2tlOiBudWxsLFxyXG4gICAgICBjZW50ZXJYOiBkeCAvIDIsXHJcbiAgICAgIGNlbnRlclk6IFRJQ0tfTEVOR1RIIC8gMlxyXG4gICAgfSApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHRpY2tzUGF0aCwgbGFiZWxOb2RlLCBhcnJvd05vZGUgXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmdhc1Byb3BlcnRpZXMucmVnaXN0ZXIoICdTY2FsZU5vZGUnLCBTY2FsZU5vZGUgKTsi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