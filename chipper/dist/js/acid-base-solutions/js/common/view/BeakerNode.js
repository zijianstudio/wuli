// Copyright 2014-2022, University of Colorado Boulder

/**
 * Visual representation of a beaker that is filled to the top with a solution.
 * Ticks on the right edge of the beaker. Origin is at the bottom center.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import acidBaseSolutions from '../../acidBaseSolutions.js';
import AcidBaseSolutionsStrings from '../../AcidBaseSolutionsStrings.js';
// constants
const MAJOR_TICK_LENGTH = 25;
const MINOR_TICK_LENGTH = 10;
const MINOR_TICKS_PER_MAJOR_TICK = 5;
const MINOR_TICK_SPACING = 0.1; // L
const RIM_OFFSET = 10;
const TICK_LABEL_X_SPACING = 5;
export default class BeakerNode extends Node {
  constructor(beaker, tandem) {
    const BEAKER_WIDTH = beaker.size.width;
    const BEAKER_HEIGHT = beaker.size.height;

    // water, starting from upper left
    const waterShape = new Shape().lineTo(-BEAKER_WIDTH / 2, -BEAKER_HEIGHT).lineTo(-BEAKER_WIDTH / 2, 0).lineTo(BEAKER_WIDTH / 2, 0).lineTo(BEAKER_WIDTH / 2, -BEAKER_HEIGHT);
    const waterPath = new Path(waterShape, {
      fill: 'rgba( 193, 222, 227, 0.7 )'
    });

    // beaker, starting from upper left
    const beakerShape = new Shape().moveTo(-BEAKER_WIDTH / 2 - RIM_OFFSET, -BEAKER_HEIGHT - RIM_OFFSET).lineTo(-BEAKER_WIDTH / 2, -BEAKER_HEIGHT).lineTo(-BEAKER_WIDTH / 2, 0).lineTo(BEAKER_WIDTH / 2, 0).lineTo(BEAKER_WIDTH / 2, -BEAKER_HEIGHT).lineTo(BEAKER_WIDTH / 2 + RIM_OFFSET, -BEAKER_HEIGHT - RIM_OFFSET);
    const beakerPath = new Path(beakerShape, {
      stroke: 'black',
      lineWidth: 3,
      lineCap: 'round',
      lineJoin: 'round'
    });

    // horizontal tick marks, right edge, from bottom up
    const NUMBER_OF_TICKS = Utils.roundSymmetric(1 / MINOR_TICK_SPACING);
    const deltaY = BEAKER_HEIGHT / NUMBER_OF_TICKS;
    let isMajorTick;
    let y;
    let leftX;
    let rightX;
    let tickPath;
    const tickPaths = [];
    for (let i = 1; i <= NUMBER_OF_TICKS; i++) {
      isMajorTick = i % MINOR_TICKS_PER_MAJOR_TICK === 0;
      y = -(i * deltaY);
      leftX = BEAKER_WIDTH / 2;
      rightX = leftX - (isMajorTick ? MAJOR_TICK_LENGTH : MINOR_TICK_LENGTH);
      tickPath = new Path(new Shape().moveTo(leftX, y).lineTo(rightX, y), {
        stroke: 'black',
        lineWidth: 1.5,
        lineCap: 'round',
        lineJoin: 'bevel'
      });
      tickPaths.push(tickPath);
    }
    const tickMarkNodes = new Node({
      children: tickPaths,
      tandem: tandem.createTandem('tickMarkNodes')
    });

    // major tick label at '1L'
    const majorTickStringProperty = new DerivedProperty([AcidBaseSolutionsStrings.pattern['0value']['1unitsStringProperty'], AcidBaseSolutionsStrings.litersStringProperty], (patternString, unitsString) => StringUtils.format(patternString, '1', unitsString));
    const majorTickText = new Text(majorTickStringProperty, {
      font: new PhetFont(18),
      fill: 'black',
      maxWidth: 65
    });
    tickMarkNodes.addChild(majorTickText);
    majorTickText.boundsProperty.link(bounds => {
      majorTickText.right = BEAKER_WIDTH / 2 - MAJOR_TICK_LENGTH - TICK_LABEL_X_SPACING;
      majorTickText.centerY = -deltaY * NUMBER_OF_TICKS;
    });
    super({
      children: [waterPath, beakerPath, tickMarkNodes],
      translation: beaker.position,
      pickable: false,
      tandem: tandem
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * Creates an icon of the beaker.
   */
  static createIcon(width, height) {
    const lipOffset = 0.1 * width;
    return new Node({
      children: [
      // water
      new Rectangle(0, 0, width, height, {
        fill: 'rgb( 213, 231, 233 )'
      }),
      // beaker
      new Path(new Shape().moveTo(-lipOffset, -lipOffset).lineTo(0, 0).lineTo(0, height).lineTo(width, height).lineTo(width, 0).lineTo(width + lipOffset, -lipOffset), {
        stroke: 'black',
        lineWidth: 1.5
      })]
    });
  }
}
acidBaseSolutions.register('BeakerNode', BeakerNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJVdGlscyIsIlNoYXBlIiwiU3RyaW5nVXRpbHMiLCJQaGV0Rm9udCIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiVGV4dCIsImFjaWRCYXNlU29sdXRpb25zIiwiQWNpZEJhc2VTb2x1dGlvbnNTdHJpbmdzIiwiTUFKT1JfVElDS19MRU5HVEgiLCJNSU5PUl9USUNLX0xFTkdUSCIsIk1JTk9SX1RJQ0tTX1BFUl9NQUpPUl9USUNLIiwiTUlOT1JfVElDS19TUEFDSU5HIiwiUklNX09GRlNFVCIsIlRJQ0tfTEFCRUxfWF9TUEFDSU5HIiwiQmVha2VyTm9kZSIsImNvbnN0cnVjdG9yIiwiYmVha2VyIiwidGFuZGVtIiwiQkVBS0VSX1dJRFRIIiwic2l6ZSIsIndpZHRoIiwiQkVBS0VSX0hFSUdIVCIsImhlaWdodCIsIndhdGVyU2hhcGUiLCJsaW5lVG8iLCJ3YXRlclBhdGgiLCJmaWxsIiwiYmVha2VyU2hhcGUiLCJtb3ZlVG8iLCJiZWFrZXJQYXRoIiwic3Ryb2tlIiwibGluZVdpZHRoIiwibGluZUNhcCIsImxpbmVKb2luIiwiTlVNQkVSX09GX1RJQ0tTIiwicm91bmRTeW1tZXRyaWMiLCJkZWx0YVkiLCJpc01ham9yVGljayIsInkiLCJsZWZ0WCIsInJpZ2h0WCIsInRpY2tQYXRoIiwidGlja1BhdGhzIiwiaSIsInB1c2giLCJ0aWNrTWFya05vZGVzIiwiY2hpbGRyZW4iLCJjcmVhdGVUYW5kZW0iLCJtYWpvclRpY2tTdHJpbmdQcm9wZXJ0eSIsInBhdHRlcm4iLCJsaXRlcnNTdHJpbmdQcm9wZXJ0eSIsInBhdHRlcm5TdHJpbmciLCJ1bml0c1N0cmluZyIsImZvcm1hdCIsIm1ham9yVGlja1RleHQiLCJmb250IiwibWF4V2lkdGgiLCJhZGRDaGlsZCIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsImJvdW5kcyIsInJpZ2h0IiwiY2VudGVyWSIsInRyYW5zbGF0aW9uIiwicG9zaXRpb24iLCJwaWNrYWJsZSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJjcmVhdGVJY29uIiwibGlwT2Zmc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCZWFrZXJOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpc3VhbCByZXByZXNlbnRhdGlvbiBvZiBhIGJlYWtlciB0aGF0IGlzIGZpbGxlZCB0byB0aGUgdG9wIHdpdGggYSBzb2x1dGlvbi5cclxuICogVGlja3Mgb24gdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGJlYWtlci4gT3JpZ2luIGlzIGF0IHRoZSBib3R0b20gY2VudGVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFuZHJleSBaZWxlbmtvdiAoTWxlYXJuZXIpXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGFjaWRCYXNlU29sdXRpb25zIGZyb20gJy4uLy4uL2FjaWRCYXNlU29sdXRpb25zLmpzJztcclxuaW1wb3J0IEFjaWRCYXNlU29sdXRpb25zU3RyaW5ncyBmcm9tICcuLi8uLi9BY2lkQmFzZVNvbHV0aW9uc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgQmVha2VyIGZyb20gJy4uL21vZGVsL0JlYWtlci5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFKT1JfVElDS19MRU5HVEggPSAyNTtcclxuY29uc3QgTUlOT1JfVElDS19MRU5HVEggPSAxMDtcclxuY29uc3QgTUlOT1JfVElDS1NfUEVSX01BSk9SX1RJQ0sgPSA1O1xyXG5jb25zdCBNSU5PUl9USUNLX1NQQUNJTkcgPSAwLjE7IC8vIExcclxuY29uc3QgUklNX09GRlNFVCA9IDEwO1xyXG5jb25zdCBUSUNLX0xBQkVMX1hfU1BBQ0lORyA9IDU7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCZWFrZXJOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYmVha2VyOiBCZWFrZXIsIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IEJFQUtFUl9XSURUSCA9IGJlYWtlci5zaXplLndpZHRoO1xyXG4gICAgY29uc3QgQkVBS0VSX0hFSUdIVCA9IGJlYWtlci5zaXplLmhlaWdodDtcclxuXHJcbiAgICAvLyB3YXRlciwgc3RhcnRpbmcgZnJvbSB1cHBlciBsZWZ0XHJcbiAgICBjb25zdCB3YXRlclNoYXBlID0gbmV3IFNoYXBlKCkubGluZVRvKCAtQkVBS0VSX1dJRFRIIC8gMiwgLUJFQUtFUl9IRUlHSFQgKVxyXG4gICAgICAubGluZVRvKCAtQkVBS0VSX1dJRFRIIC8gMiwgMCApXHJcbiAgICAgIC5saW5lVG8oIEJFQUtFUl9XSURUSCAvIDIsIDAgKVxyXG4gICAgICAubGluZVRvKCBCRUFLRVJfV0lEVEggLyAyLCAtQkVBS0VSX0hFSUdIVCApO1xyXG4gICAgY29uc3Qgd2F0ZXJQYXRoID0gbmV3IFBhdGgoIHdhdGVyU2hhcGUsIHtcclxuICAgICAgZmlsbDogJ3JnYmEoIDE5MywgMjIyLCAyMjcsIDAuNyApJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGJlYWtlciwgc3RhcnRpbmcgZnJvbSB1cHBlciBsZWZ0XHJcbiAgICBjb25zdCBiZWFrZXJTaGFwZSA9IG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG8oIC1CRUFLRVJfV0lEVEggLyAyIC0gUklNX09GRlNFVCwgLUJFQUtFUl9IRUlHSFQgLSBSSU1fT0ZGU0VUIClcclxuICAgICAgLmxpbmVUbyggLUJFQUtFUl9XSURUSCAvIDIsIC1CRUFLRVJfSEVJR0hUIClcclxuICAgICAgLmxpbmVUbyggLUJFQUtFUl9XSURUSCAvIDIsIDAgKVxyXG4gICAgICAubGluZVRvKCBCRUFLRVJfV0lEVEggLyAyLCAwIClcclxuICAgICAgLmxpbmVUbyggQkVBS0VSX1dJRFRIIC8gMiwgLUJFQUtFUl9IRUlHSFQgKVxyXG4gICAgICAubGluZVRvKCAoIEJFQUtFUl9XSURUSCAvIDIgKSArIFJJTV9PRkZTRVQsIC1CRUFLRVJfSEVJR0hUIC0gUklNX09GRlNFVCApO1xyXG4gICAgY29uc3QgYmVha2VyUGF0aCA9IG5ldyBQYXRoKCBiZWFrZXJTaGFwZSwge1xyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGxpbmVXaWR0aDogMyxcclxuICAgICAgbGluZUNhcDogJ3JvdW5kJyxcclxuICAgICAgbGluZUpvaW46ICdyb3VuZCdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBob3Jpem9udGFsIHRpY2sgbWFya3MsIHJpZ2h0IGVkZ2UsIGZyb20gYm90dG9tIHVwXHJcbiAgICBjb25zdCBOVU1CRVJfT0ZfVElDS1MgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggMSAvIE1JTk9SX1RJQ0tfU1BBQ0lORyApO1xyXG4gICAgY29uc3QgZGVsdGFZID0gQkVBS0VSX0hFSUdIVCAvIE5VTUJFUl9PRl9USUNLUztcclxuICAgIGxldCBpc01ham9yVGljaztcclxuICAgIGxldCB5O1xyXG4gICAgbGV0IGxlZnRYO1xyXG4gICAgbGV0IHJpZ2h0WDtcclxuICAgIGxldCB0aWNrUGF0aDtcclxuICAgIGNvbnN0IHRpY2tQYXRocyA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSAxOyBpIDw9IE5VTUJFUl9PRl9USUNLUzsgaSsrICkge1xyXG5cclxuICAgICAgaXNNYWpvclRpY2sgPSAoIGkgJSBNSU5PUl9USUNLU19QRVJfTUFKT1JfVElDSyA9PT0gMCApO1xyXG4gICAgICB5ID0gLSggaSAqIGRlbHRhWSApO1xyXG4gICAgICBsZWZ0WCA9IEJFQUtFUl9XSURUSCAvIDI7XHJcbiAgICAgIHJpZ2h0WCA9IGxlZnRYIC0gKCBpc01ham9yVGljayA/IE1BSk9SX1RJQ0tfTEVOR1RIIDogTUlOT1JfVElDS19MRU5HVEggKTtcclxuXHJcbiAgICAgIHRpY2tQYXRoID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpLm1vdmVUbyggbGVmdFgsIHkgKS5saW5lVG8oIHJpZ2h0WCwgeSApLCB7XHJcbiAgICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICAgIGxpbmVXaWR0aDogMS41LFxyXG4gICAgICAgIGxpbmVDYXA6ICdyb3VuZCcsXHJcbiAgICAgICAgbGluZUpvaW46ICdiZXZlbCdcclxuICAgICAgfSApO1xyXG4gICAgICB0aWNrUGF0aHMucHVzaCggdGlja1BhdGggKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHRpY2tNYXJrTm9kZXMgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogdGlja1BhdGhzLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aWNrTWFya05vZGVzJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbWFqb3IgdGljayBsYWJlbCBhdCAnMUwnXHJcbiAgICBjb25zdCBtYWpvclRpY2tTdHJpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgQWNpZEJhc2VTb2x1dGlvbnNTdHJpbmdzLnBhdHRlcm5bICcwdmFsdWUnIF1bICcxdW5pdHNTdHJpbmdQcm9wZXJ0eScgXSwgQWNpZEJhc2VTb2x1dGlvbnNTdHJpbmdzLmxpdGVyc1N0cmluZ1Byb3BlcnR5IF0sXHJcbiAgICAgICggcGF0dGVyblN0cmluZywgdW5pdHNTdHJpbmcgKSA9PiBTdHJpbmdVdGlscy5mb3JtYXQoIHBhdHRlcm5TdHJpbmcsICcxJywgdW5pdHNTdHJpbmcgKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IG1ham9yVGlja1RleHQgPSBuZXcgVGV4dCggbWFqb3JUaWNrU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxOCApLFxyXG4gICAgICBmaWxsOiAnYmxhY2snLFxyXG4gICAgICBtYXhXaWR0aDogNjVcclxuICAgIH0gKTtcclxuICAgIHRpY2tNYXJrTm9kZXMuYWRkQ2hpbGQoIG1ham9yVGlja1RleHQgKTtcclxuXHJcbiAgICBtYWpvclRpY2tUZXh0LmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICAgIG1ham9yVGlja1RleHQucmlnaHQgPSBCRUFLRVJfV0lEVEggLyAyIC0gTUFKT1JfVElDS19MRU5HVEggLSBUSUNLX0xBQkVMX1hfU1BBQ0lORztcclxuICAgICAgbWFqb3JUaWNrVGV4dC5jZW50ZXJZID0gLWRlbHRhWSAqIE5VTUJFUl9PRl9USUNLUztcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBjaGlsZHJlbjogWyB3YXRlclBhdGgsIGJlYWtlclBhdGgsIHRpY2tNYXJrTm9kZXMgXSxcclxuICAgICAgdHJhbnNsYXRpb246IGJlYWtlci5wb3NpdGlvbixcclxuICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYW4gaWNvbiBvZiB0aGUgYmVha2VyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlSWNvbiggd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogTm9kZSB7XHJcbiAgICBjb25zdCBsaXBPZmZzZXQgPSAwLjEgKiB3aWR0aDtcclxuICAgIHJldHVybiBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG5cclxuICAgICAgICAvLyB3YXRlclxyXG4gICAgICAgIG5ldyBSZWN0YW5nbGUoIDAsIDAsIHdpZHRoLCBoZWlnaHQsIHsgZmlsbDogJ3JnYiggMjEzLCAyMzEsIDIzMyApJyB9ICksXHJcblxyXG4gICAgICAgIC8vIGJlYWtlclxyXG4gICAgICAgIG5ldyBQYXRoKCBuZXcgU2hhcGUoKVxyXG4gICAgICAgICAgICAubW92ZVRvKCAtbGlwT2Zmc2V0LCAtbGlwT2Zmc2V0IClcclxuICAgICAgICAgICAgLmxpbmVUbyggMCwgMCApXHJcbiAgICAgICAgICAgIC5saW5lVG8oIDAsIGhlaWdodCApXHJcbiAgICAgICAgICAgIC5saW5lVG8oIHdpZHRoLCBoZWlnaHQgKVxyXG4gICAgICAgICAgICAubGluZVRvKCB3aWR0aCwgMCApXHJcbiAgICAgICAgICAgIC5saW5lVG8oIHdpZHRoICsgbGlwT2Zmc2V0LCAtbGlwT2Zmc2V0ICksXHJcbiAgICAgICAgICB7IHN0cm9rZTogJ2JsYWNrJywgbGluZVdpZHRoOiAxLjUgfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmFjaWRCYXNlU29sdXRpb25zLnJlZ2lzdGVyKCAnQmVha2VyTm9kZScsIEJlYWtlck5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUUvRSxPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7QUFDMUQsT0FBT0Msd0JBQXdCLE1BQU0sbUNBQW1DO0FBR3hFO0FBQ0EsTUFBTUMsaUJBQWlCLEdBQUcsRUFBRTtBQUM1QixNQUFNQyxpQkFBaUIsR0FBRyxFQUFFO0FBQzVCLE1BQU1DLDBCQUEwQixHQUFHLENBQUM7QUFDcEMsTUFBTUMsa0JBQWtCLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDaEMsTUFBTUMsVUFBVSxHQUFHLEVBQUU7QUFDckIsTUFBTUMsb0JBQW9CLEdBQUcsQ0FBQztBQUU5QixlQUFlLE1BQU1DLFVBQVUsU0FBU1osSUFBSSxDQUFDO0VBRXBDYSxXQUFXQSxDQUFFQyxNQUFjLEVBQUVDLE1BQWMsRUFBRztJQUVuRCxNQUFNQyxZQUFZLEdBQUdGLE1BQU0sQ0FBQ0csSUFBSSxDQUFDQyxLQUFLO0lBQ3RDLE1BQU1DLGFBQWEsR0FBR0wsTUFBTSxDQUFDRyxJQUFJLENBQUNHLE1BQU07O0lBRXhDO0lBQ0EsTUFBTUMsVUFBVSxHQUFHLElBQUl4QixLQUFLLENBQUMsQ0FBQyxDQUFDeUIsTUFBTSxDQUFFLENBQUNOLFlBQVksR0FBRyxDQUFDLEVBQUUsQ0FBQ0csYUFBYyxDQUFDLENBQ3ZFRyxNQUFNLENBQUUsQ0FBQ04sWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FDOUJNLE1BQU0sQ0FBRU4sWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFFLENBQUMsQ0FDN0JNLE1BQU0sQ0FBRU4sWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFDRyxhQUFjLENBQUM7SUFDN0MsTUFBTUksU0FBUyxHQUFHLElBQUl0QixJQUFJLENBQUVvQixVQUFVLEVBQUU7TUFDdENHLElBQUksRUFBRTtJQUNSLENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1DLFdBQVcsR0FBRyxJQUFJNUIsS0FBSyxDQUFDLENBQUMsQ0FDNUI2QixNQUFNLENBQUUsQ0FBQ1YsWUFBWSxHQUFHLENBQUMsR0FBR04sVUFBVSxFQUFFLENBQUNTLGFBQWEsR0FBR1QsVUFBVyxDQUFDLENBQ3JFWSxNQUFNLENBQUUsQ0FBQ04sWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFDRyxhQUFjLENBQUMsQ0FDM0NHLE1BQU0sQ0FBRSxDQUFDTixZQUFZLEdBQUcsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUM5Qk0sTUFBTSxDQUFFTixZQUFZLEdBQUcsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUM3Qk0sTUFBTSxDQUFFTixZQUFZLEdBQUcsQ0FBQyxFQUFFLENBQUNHLGFBQWMsQ0FBQyxDQUMxQ0csTUFBTSxDQUFJTixZQUFZLEdBQUcsQ0FBQyxHQUFLTixVQUFVLEVBQUUsQ0FBQ1MsYUFBYSxHQUFHVCxVQUFXLENBQUM7SUFDM0UsTUFBTWlCLFVBQVUsR0FBRyxJQUFJMUIsSUFBSSxDQUFFd0IsV0FBVyxFQUFFO01BQ3hDRyxNQUFNLEVBQUUsT0FBTztNQUNmQyxTQUFTLEVBQUUsQ0FBQztNQUNaQyxPQUFPLEVBQUUsT0FBTztNQUNoQkMsUUFBUSxFQUFFO0lBQ1osQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTUMsZUFBZSxHQUFHcEMsS0FBSyxDQUFDcUMsY0FBYyxDQUFFLENBQUMsR0FBR3hCLGtCQUFtQixDQUFDO0lBQ3RFLE1BQU15QixNQUFNLEdBQUdmLGFBQWEsR0FBR2EsZUFBZTtJQUM5QyxJQUFJRyxXQUFXO0lBQ2YsSUFBSUMsQ0FBQztJQUNMLElBQUlDLEtBQUs7SUFDVCxJQUFJQyxNQUFNO0lBQ1YsSUFBSUMsUUFBUTtJQUNaLE1BQU1DLFNBQVMsR0FBRyxFQUFFO0lBQ3BCLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxJQUFJVCxlQUFlLEVBQUVTLENBQUMsRUFBRSxFQUFHO01BRTNDTixXQUFXLEdBQUtNLENBQUMsR0FBR2pDLDBCQUEwQixLQUFLLENBQUc7TUFDdEQ0QixDQUFDLEdBQUcsRUFBR0ssQ0FBQyxHQUFHUCxNQUFNLENBQUU7TUFDbkJHLEtBQUssR0FBR3JCLFlBQVksR0FBRyxDQUFDO01BQ3hCc0IsTUFBTSxHQUFHRCxLQUFLLElBQUtGLFdBQVcsR0FBRzdCLGlCQUFpQixHQUFHQyxpQkFBaUIsQ0FBRTtNQUV4RWdDLFFBQVEsR0FBRyxJQUFJdEMsSUFBSSxDQUFFLElBQUlKLEtBQUssQ0FBQyxDQUFDLENBQUM2QixNQUFNLENBQUVXLEtBQUssRUFBRUQsQ0FBRSxDQUFDLENBQUNkLE1BQU0sQ0FBRWdCLE1BQU0sRUFBRUYsQ0FBRSxDQUFDLEVBQUU7UUFDdkVSLE1BQU0sRUFBRSxPQUFPO1FBQ2ZDLFNBQVMsRUFBRSxHQUFHO1FBQ2RDLE9BQU8sRUFBRSxPQUFPO1FBQ2hCQyxRQUFRLEVBQUU7TUFDWixDQUFFLENBQUM7TUFDSFMsU0FBUyxDQUFDRSxJQUFJLENBQUVILFFBQVMsQ0FBQztJQUM1QjtJQUNBLE1BQU1JLGFBQWEsR0FBRyxJQUFJM0MsSUFBSSxDQUFFO01BQzlCNEMsUUFBUSxFQUFFSixTQUFTO01BQ25CekIsTUFBTSxFQUFFQSxNQUFNLENBQUM4QixZQUFZLENBQUUsZUFBZ0I7SUFDL0MsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTUMsdUJBQXVCLEdBQUcsSUFBSW5ELGVBQWUsQ0FDakQsQ0FBRVUsd0JBQXdCLENBQUMwQyxPQUFPLENBQUUsUUFBUSxDQUFFLENBQUUsc0JBQXNCLENBQUUsRUFBRTFDLHdCQUF3QixDQUFDMkMsb0JBQW9CLENBQUUsRUFDekgsQ0FBRUMsYUFBYSxFQUFFQyxXQUFXLEtBQU1wRCxXQUFXLENBQUNxRCxNQUFNLENBQUVGLGFBQWEsRUFBRSxHQUFHLEVBQUVDLFdBQVksQ0FDeEYsQ0FBQztJQUNELE1BQU1FLGFBQWEsR0FBRyxJQUFJakQsSUFBSSxDQUFFMkMsdUJBQXVCLEVBQUU7TUFDdkRPLElBQUksRUFBRSxJQUFJdEQsUUFBUSxDQUFFLEVBQUcsQ0FBQztNQUN4QnlCLElBQUksRUFBRSxPQUFPO01BQ2I4QixRQUFRLEVBQUU7SUFDWixDQUFFLENBQUM7SUFDSFgsYUFBYSxDQUFDWSxRQUFRLENBQUVILGFBQWMsQ0FBQztJQUV2Q0EsYUFBYSxDQUFDSSxjQUFjLENBQUNDLElBQUksQ0FBRUMsTUFBTSxJQUFJO01BQzNDTixhQUFhLENBQUNPLEtBQUssR0FBRzNDLFlBQVksR0FBRyxDQUFDLEdBQUdWLGlCQUFpQixHQUFHSyxvQkFBb0I7TUFDakZ5QyxhQUFhLENBQUNRLE9BQU8sR0FBRyxDQUFDMUIsTUFBTSxHQUFHRixlQUFlO0lBQ25ELENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRTtNQUNMWSxRQUFRLEVBQUUsQ0FBRXJCLFNBQVMsRUFBRUksVUFBVSxFQUFFZ0IsYUFBYSxDQUFFO01BQ2xEa0IsV0FBVyxFQUFFL0MsTUFBTSxDQUFDZ0QsUUFBUTtNQUM1QkMsUUFBUSxFQUFFLEtBQUs7TUFDZmhELE1BQU0sRUFBRUE7SUFDVixDQUFFLENBQUM7RUFDTDtFQUVnQmlELE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7O0VBRUE7QUFDRjtBQUNBO0VBQ0UsT0FBY0UsVUFBVUEsQ0FBRWhELEtBQWEsRUFBRUUsTUFBYyxFQUFTO0lBQzlELE1BQU0rQyxTQUFTLEdBQUcsR0FBRyxHQUFHakQsS0FBSztJQUM3QixPQUFPLElBQUlsQixJQUFJLENBQUU7TUFDZjRDLFFBQVEsRUFBRTtNQUVSO01BQ0EsSUFBSTFDLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFZ0IsS0FBSyxFQUFFRSxNQUFNLEVBQUU7UUFBRUksSUFBSSxFQUFFO01BQXVCLENBQUUsQ0FBQztNQUV0RTtNQUNBLElBQUl2QixJQUFJLENBQUUsSUFBSUosS0FBSyxDQUFDLENBQUMsQ0FDaEI2QixNQUFNLENBQUUsQ0FBQ3lDLFNBQVMsRUFBRSxDQUFDQSxTQUFVLENBQUMsQ0FDaEM3QyxNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUNkQSxNQUFNLENBQUUsQ0FBQyxFQUFFRixNQUFPLENBQUMsQ0FDbkJFLE1BQU0sQ0FBRUosS0FBSyxFQUFFRSxNQUFPLENBQUMsQ0FDdkJFLE1BQU0sQ0FBRUosS0FBSyxFQUFFLENBQUUsQ0FBQyxDQUNsQkksTUFBTSxDQUFFSixLQUFLLEdBQUdpRCxTQUFTLEVBQUUsQ0FBQ0EsU0FBVSxDQUFDLEVBQzFDO1FBQUV2QyxNQUFNLEVBQUUsT0FBTztRQUFFQyxTQUFTLEVBQUU7TUFBSSxDQUFFLENBQUM7SUFFM0MsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBekIsaUJBQWlCLENBQUNnRSxRQUFRLENBQUUsWUFBWSxFQUFFeEQsVUFBVyxDQUFDIn0=