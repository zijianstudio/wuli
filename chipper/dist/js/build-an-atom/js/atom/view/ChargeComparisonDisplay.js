// Copyright 2013-2022, University of Colorado Boulder

/**
 * A node that presents a comparison of the protons and electrons in an atom in order to make the net charge apparent.
 *
 * @author John Blanco
 */

import { Shape } from '../../../../kite/js/imports.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import buildAnAtom from '../../buildAnAtom.js';
import BuildAnAtomModel from '../../common/model/BuildAnAtomModel.js';

// constants
const SYMBOL_WIDTH = 12;
const VERTICAL_INSET = 5;
const INTER_SYMBOL_DISTANCE = SYMBOL_WIDTH * 0.4;
const SYMBOL_LINE_WIDTH = SYMBOL_WIDTH * 0.3;
class ChargeComparisonDisplay extends Node {
  /**
   * @param {ParticleAtom} particleAtom - model representation of the atom
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(particleAtom, tandem, options) {
    super({
      tandem: tandem
    });
    const MAX_CHARGE = BuildAnAtomModel.MAX_CHARGE;
    let i;

    // Parent node for all symbols.
    const symbolLayer = new Node({
      tandem: tandem.createTandem('symbolLayer')
    });
    const minusSymbolShape = new Shape();
    minusSymbolShape.moveTo(-SYMBOL_WIDTH / 2, -SYMBOL_LINE_WIDTH / 2);
    minusSymbolShape.lineTo(SYMBOL_WIDTH / 2, -SYMBOL_LINE_WIDTH / 2);
    minusSymbolShape.lineTo(SYMBOL_WIDTH / 2, SYMBOL_LINE_WIDTH / 2);
    minusSymbolShape.lineTo(-SYMBOL_WIDTH / 2, SYMBOL_LINE_WIDTH / 2);
    minusSymbolShape.close();
    const minusSymbolPath = new Path(minusSymbolShape, {
      stroke: 'black',
      lineWidth: 1,
      fill: 'rgb( 100, 100, 255 )',
      left: INTER_SYMBOL_DISTANCE / 2,
      centerY: VERTICAL_INSET + SYMBOL_WIDTH * 1.5
    });
    const minuses = [];
    for (i = 0; i < MAX_CHARGE; i++) {
      const minusSymbol = new Node({
        children: [minusSymbolPath],
        x: i * (SYMBOL_WIDTH + INTER_SYMBOL_DISTANCE)
      });
      minuses.push(minusSymbol);
      symbolLayer.addChild(minusSymbol);
    }
    const plusSymbolShape = new Shape();
    plusSymbolShape.moveTo(-SYMBOL_LINE_WIDTH / 2, -SYMBOL_LINE_WIDTH / 2);
    plusSymbolShape.lineTo(-SYMBOL_LINE_WIDTH / 2, -SYMBOL_WIDTH / 2);
    plusSymbolShape.lineTo(SYMBOL_LINE_WIDTH / 2, -SYMBOL_WIDTH / 2);
    plusSymbolShape.lineTo(SYMBOL_LINE_WIDTH / 2, -SYMBOL_LINE_WIDTH / 2);
    plusSymbolShape.lineTo(SYMBOL_WIDTH / 2, -SYMBOL_LINE_WIDTH / 2);
    plusSymbolShape.lineTo(SYMBOL_WIDTH / 2, SYMBOL_LINE_WIDTH / 2);
    plusSymbolShape.lineTo(SYMBOL_LINE_WIDTH / 2, SYMBOL_LINE_WIDTH / 2);
    plusSymbolShape.lineTo(SYMBOL_LINE_WIDTH / 2, SYMBOL_WIDTH / 2);
    plusSymbolShape.lineTo(-SYMBOL_LINE_WIDTH / 2, SYMBOL_WIDTH / 2);
    plusSymbolShape.lineTo(-SYMBOL_LINE_WIDTH / 2, SYMBOL_LINE_WIDTH / 2);
    plusSymbolShape.lineTo(-SYMBOL_WIDTH / 2, SYMBOL_LINE_WIDTH / 2);
    plusSymbolShape.lineTo(-SYMBOL_WIDTH / 2, -SYMBOL_LINE_WIDTH / 2);
    plusSymbolShape.close();
    const plusSymbolPath = new Path(plusSymbolShape, {
      stroke: 'black',
      lineWidth: 1,
      fill: PhetColorScheme.RED_COLORBLIND,
      left: INTER_SYMBOL_DISTANCE / 2,
      centerY: VERTICAL_INSET + SYMBOL_WIDTH / 2
    });
    const plusses = [];
    for (i = 0; i < MAX_CHARGE; i++) {
      const plusSymbol = new Node({
        children: [plusSymbolPath],
        x: i * (SYMBOL_WIDTH + INTER_SYMBOL_DISTANCE)
      });
      plusses.push(plusSymbol);
      symbolLayer.addChild(plusSymbol);
    }

    // width will be changed dynamically, all of the others will remain static
    const matchBox = new Rectangle(0, 0, INTER_SYMBOL_DISTANCE / 2, 2 * SYMBOL_WIDTH + 2 * VERTICAL_INSET, 4, 4, {
      lineWidth: 1,
      stroke: 'black',
      visible: false,
      tandem: tandem.createTandem('matchBox')
    });
    symbolLayer.addChild(matchBox);

    // Function that updates that displayed charge.
    const update = atom => {
      // toggle plus visibility
      for (let numProtons = 0; numProtons < MAX_CHARGE; numProtons++) {
        plusses[numProtons].visible = numProtons < atom.protonCountProperty.get();
      }

      // toggle minus visibility
      for (let numElectrons = 0; numElectrons < MAX_CHARGE; numElectrons++) {
        minuses[numElectrons].visible = numElectrons < atom.electronCountProperty.get();
      }

      // matching box
      const numMatchedSymbols = Math.min(atom.protonCountProperty.get(), atom.electronCountProperty.get());
      matchBox.visible = numMatchedSymbols > 0;
      matchBox.rectWidth = INTER_SYMBOL_DISTANCE / 2 + numMatchedSymbols * SYMBOL_WIDTH + (numMatchedSymbols - 0.5) * INTER_SYMBOL_DISTANCE;
    };

    // Workaround for issue where position can't be set if no bounds exist.
    this.addChild(new Rectangle(0, 0, SYMBOL_WIDTH, 2 * SYMBOL_WIDTH + 2 * VERTICAL_INSET, 0, 0, {
      fill: 'rgba( 0, 0, 0, 0 )'
    }));

    // Hook up the update function.
    particleAtom.particleCountProperty.link(() => {
      update(particleAtom);
    });
    this.addChild(symbolLayer); // added at the end so we have faster startup times

    this.mutate(options);
  }
}
buildAnAtom.register('ChargeComparisonDisplay', ChargeComparisonDisplay);
export default ChargeComparisonDisplay;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIlBoZXRDb2xvclNjaGVtZSIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiYnVpbGRBbkF0b20iLCJCdWlsZEFuQXRvbU1vZGVsIiwiU1lNQk9MX1dJRFRIIiwiVkVSVElDQUxfSU5TRVQiLCJJTlRFUl9TWU1CT0xfRElTVEFOQ0UiLCJTWU1CT0xfTElORV9XSURUSCIsIkNoYXJnZUNvbXBhcmlzb25EaXNwbGF5IiwiY29uc3RydWN0b3IiLCJwYXJ0aWNsZUF0b20iLCJ0YW5kZW0iLCJvcHRpb25zIiwiTUFYX0NIQVJHRSIsImkiLCJzeW1ib2xMYXllciIsImNyZWF0ZVRhbmRlbSIsIm1pbnVzU3ltYm9sU2hhcGUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJjbG9zZSIsIm1pbnVzU3ltYm9sUGF0aCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImZpbGwiLCJsZWZ0IiwiY2VudGVyWSIsIm1pbnVzZXMiLCJtaW51c1N5bWJvbCIsImNoaWxkcmVuIiwieCIsInB1c2giLCJhZGRDaGlsZCIsInBsdXNTeW1ib2xTaGFwZSIsInBsdXNTeW1ib2xQYXRoIiwiUkVEX0NPTE9SQkxJTkQiLCJwbHVzc2VzIiwicGx1c1N5bWJvbCIsIm1hdGNoQm94IiwidmlzaWJsZSIsInVwZGF0ZSIsImF0b20iLCJudW1Qcm90b25zIiwicHJvdG9uQ291bnRQcm9wZXJ0eSIsImdldCIsIm51bUVsZWN0cm9ucyIsImVsZWN0cm9uQ291bnRQcm9wZXJ0eSIsIm51bU1hdGNoZWRTeW1ib2xzIiwiTWF0aCIsIm1pbiIsInJlY3RXaWR0aCIsInBhcnRpY2xlQ291bnRQcm9wZXJ0eSIsImxpbmsiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNoYXJnZUNvbXBhcmlzb25EaXNwbGF5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbm9kZSB0aGF0IHByZXNlbnRzIGEgY29tcGFyaXNvbiBvZiB0aGUgcHJvdG9ucyBhbmQgZWxlY3Ryb25zIGluIGFuIGF0b20gaW4gb3JkZXIgdG8gbWFrZSB0aGUgbmV0IGNoYXJnZSBhcHBhcmVudC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBoZXRDb2xvclNjaGVtZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldENvbG9yU2NoZW1lLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJ1aWxkQW5BdG9tIGZyb20gJy4uLy4uL2J1aWxkQW5BdG9tLmpzJztcclxuaW1wb3J0IEJ1aWxkQW5BdG9tTW9kZWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0J1aWxkQW5BdG9tTW9kZWwuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNZTUJPTF9XSURUSCA9IDEyO1xyXG5jb25zdCBWRVJUSUNBTF9JTlNFVCA9IDU7XHJcbmNvbnN0IElOVEVSX1NZTUJPTF9ESVNUQU5DRSA9IFNZTUJPTF9XSURUSCAqIDAuNDtcclxuY29uc3QgU1lNQk9MX0xJTkVfV0lEVEggPSBTWU1CT0xfV0lEVEggKiAwLjM7XHJcblxyXG5jbGFzcyBDaGFyZ2VDb21wYXJpc29uRGlzcGxheSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1BhcnRpY2xlQXRvbX0gcGFydGljbGVBdG9tIC0gbW9kZWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGF0b21cclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwYXJ0aWNsZUF0b20sIHRhbmRlbSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlciggeyB0YW5kZW06IHRhbmRlbSB9ICk7XHJcblxyXG4gICAgY29uc3QgTUFYX0NIQVJHRSA9IEJ1aWxkQW5BdG9tTW9kZWwuTUFYX0NIQVJHRTtcclxuICAgIGxldCBpO1xyXG5cclxuICAgIC8vIFBhcmVudCBub2RlIGZvciBhbGwgc3ltYm9scy5cclxuICAgIGNvbnN0IHN5bWJvbExheWVyID0gbmV3IE5vZGUoIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3ltYm9sTGF5ZXInICkgfSApO1xyXG5cclxuICAgIGNvbnN0IG1pbnVzU3ltYm9sU2hhcGUgPSBuZXcgU2hhcGUoKTtcclxuICAgIG1pbnVzU3ltYm9sU2hhcGUubW92ZVRvKCAtU1lNQk9MX1dJRFRIIC8gMiwgLVNZTUJPTF9MSU5FX1dJRFRIIC8gMiApO1xyXG4gICAgbWludXNTeW1ib2xTaGFwZS5saW5lVG8oIFNZTUJPTF9XSURUSCAvIDIsIC1TWU1CT0xfTElORV9XSURUSCAvIDIgKTtcclxuICAgIG1pbnVzU3ltYm9sU2hhcGUubGluZVRvKCBTWU1CT0xfV0lEVEggLyAyLCBTWU1CT0xfTElORV9XSURUSCAvIDIgKTtcclxuICAgIG1pbnVzU3ltYm9sU2hhcGUubGluZVRvKCAtU1lNQk9MX1dJRFRIIC8gMiwgU1lNQk9MX0xJTkVfV0lEVEggLyAyICk7XHJcbiAgICBtaW51c1N5bWJvbFNoYXBlLmNsb3NlKCk7XHJcblxyXG4gICAgY29uc3QgbWludXNTeW1ib2xQYXRoID0gbmV3IFBhdGgoIG1pbnVzU3ltYm9sU2hhcGUsIHtcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgIGZpbGw6ICdyZ2IoIDEwMCwgMTAwLCAyNTUgKScsXHJcbiAgICAgIGxlZnQ6IElOVEVSX1NZTUJPTF9ESVNUQU5DRSAvIDIsXHJcbiAgICAgIGNlbnRlclk6IFZFUlRJQ0FMX0lOU0VUICsgU1lNQk9MX1dJRFRIICogMS41XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbWludXNlcyA9IFtdO1xyXG4gICAgZm9yICggaSA9IDA7IGkgPCBNQVhfQ0hBUkdFOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IG1pbnVzU3ltYm9sID0gbmV3IE5vZGUoIHtcclxuICAgICAgICBjaGlsZHJlbjogWyBtaW51c1N5bWJvbFBhdGggXSxcclxuICAgICAgICB4OiBpICogKCBTWU1CT0xfV0lEVEggKyBJTlRFUl9TWU1CT0xfRElTVEFOQ0UgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIG1pbnVzZXMucHVzaCggbWludXNTeW1ib2wgKTtcclxuICAgICAgc3ltYm9sTGF5ZXIuYWRkQ2hpbGQoIG1pbnVzU3ltYm9sICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGx1c1N5bWJvbFNoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICBwbHVzU3ltYm9sU2hhcGUubW92ZVRvKCAtU1lNQk9MX0xJTkVfV0lEVEggLyAyLCAtU1lNQk9MX0xJTkVfV0lEVEggLyAyICk7XHJcbiAgICBwbHVzU3ltYm9sU2hhcGUubGluZVRvKCAtU1lNQk9MX0xJTkVfV0lEVEggLyAyLCAtU1lNQk9MX1dJRFRIIC8gMiApO1xyXG4gICAgcGx1c1N5bWJvbFNoYXBlLmxpbmVUbyggU1lNQk9MX0xJTkVfV0lEVEggLyAyLCAtU1lNQk9MX1dJRFRIIC8gMiApO1xyXG4gICAgcGx1c1N5bWJvbFNoYXBlLmxpbmVUbyggU1lNQk9MX0xJTkVfV0lEVEggLyAyLCAtU1lNQk9MX0xJTkVfV0lEVEggLyAyICk7XHJcbiAgICBwbHVzU3ltYm9sU2hhcGUubGluZVRvKCBTWU1CT0xfV0lEVEggLyAyLCAtU1lNQk9MX0xJTkVfV0lEVEggLyAyICk7XHJcbiAgICBwbHVzU3ltYm9sU2hhcGUubGluZVRvKCBTWU1CT0xfV0lEVEggLyAyLCBTWU1CT0xfTElORV9XSURUSCAvIDIgKTtcclxuICAgIHBsdXNTeW1ib2xTaGFwZS5saW5lVG8oIFNZTUJPTF9MSU5FX1dJRFRIIC8gMiwgU1lNQk9MX0xJTkVfV0lEVEggLyAyICk7XHJcbiAgICBwbHVzU3ltYm9sU2hhcGUubGluZVRvKCBTWU1CT0xfTElORV9XSURUSCAvIDIsIFNZTUJPTF9XSURUSCAvIDIgKTtcclxuICAgIHBsdXNTeW1ib2xTaGFwZS5saW5lVG8oIC1TWU1CT0xfTElORV9XSURUSCAvIDIsIFNZTUJPTF9XSURUSCAvIDIgKTtcclxuICAgIHBsdXNTeW1ib2xTaGFwZS5saW5lVG8oIC1TWU1CT0xfTElORV9XSURUSCAvIDIsIFNZTUJPTF9MSU5FX1dJRFRIIC8gMiApO1xyXG4gICAgcGx1c1N5bWJvbFNoYXBlLmxpbmVUbyggLVNZTUJPTF9XSURUSCAvIDIsIFNZTUJPTF9MSU5FX1dJRFRIIC8gMiApO1xyXG4gICAgcGx1c1N5bWJvbFNoYXBlLmxpbmVUbyggLVNZTUJPTF9XSURUSCAvIDIsIC1TWU1CT0xfTElORV9XSURUSCAvIDIgKTtcclxuICAgIHBsdXNTeW1ib2xTaGFwZS5jbG9zZSgpO1xyXG5cclxuICAgIGNvbnN0IHBsdXNTeW1ib2xQYXRoID0gbmV3IFBhdGgoIHBsdXNTeW1ib2xTaGFwZSwge1xyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGxpbmVXaWR0aDogMSxcclxuICAgICAgZmlsbDogUGhldENvbG9yU2NoZW1lLlJFRF9DT0xPUkJMSU5ELFxyXG4gICAgICBsZWZ0OiBJTlRFUl9TWU1CT0xfRElTVEFOQ0UgLyAyLFxyXG4gICAgICBjZW50ZXJZOiBWRVJUSUNBTF9JTlNFVCArIFNZTUJPTF9XSURUSCAvIDJcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBwbHVzc2VzID0gW107XHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IE1BWF9DSEFSR0U7IGkrKyApIHtcclxuICAgICAgY29uc3QgcGx1c1N5bWJvbCA9IG5ldyBOb2RlKCB7XHJcbiAgICAgICAgY2hpbGRyZW46IFsgcGx1c1N5bWJvbFBhdGggXSxcclxuICAgICAgICB4OiBpICogKCBTWU1CT0xfV0lEVEggKyBJTlRFUl9TWU1CT0xfRElTVEFOQ0UgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHBsdXNzZXMucHVzaCggcGx1c1N5bWJvbCApO1xyXG4gICAgICBzeW1ib2xMYXllci5hZGRDaGlsZCggcGx1c1N5bWJvbCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHdpZHRoIHdpbGwgYmUgY2hhbmdlZCBkeW5hbWljYWxseSwgYWxsIG9mIHRoZSBvdGhlcnMgd2lsbCByZW1haW4gc3RhdGljXHJcbiAgICBjb25zdCBtYXRjaEJveCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIElOVEVSX1NZTUJPTF9ESVNUQU5DRSAvIDIsIDIgKiBTWU1CT0xfV0lEVEggKyAyICogVkVSVElDQUxfSU5TRVQsIDQsIDQsIHtcclxuICAgICAgbGluZVdpZHRoOiAxLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYXRjaEJveCcgKVxyXG4gICAgfSApO1xyXG4gICAgc3ltYm9sTGF5ZXIuYWRkQ2hpbGQoIG1hdGNoQm94ICk7XHJcblxyXG4gICAgLy8gRnVuY3Rpb24gdGhhdCB1cGRhdGVzIHRoYXQgZGlzcGxheWVkIGNoYXJnZS5cclxuICAgIGNvbnN0IHVwZGF0ZSA9IGF0b20gPT4ge1xyXG5cclxuICAgICAgLy8gdG9nZ2xlIHBsdXMgdmlzaWJpbGl0eVxyXG4gICAgICBmb3IgKCBsZXQgbnVtUHJvdG9ucyA9IDA7IG51bVByb3RvbnMgPCBNQVhfQ0hBUkdFOyBudW1Qcm90b25zKysgKSB7XHJcbiAgICAgICAgcGx1c3Nlc1sgbnVtUHJvdG9ucyBdLnZpc2libGUgPSBudW1Qcm90b25zIDwgYXRvbS5wcm90b25Db3VudFByb3BlcnR5LmdldCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0b2dnbGUgbWludXMgdmlzaWJpbGl0eVxyXG4gICAgICBmb3IgKCBsZXQgbnVtRWxlY3Ryb25zID0gMDsgbnVtRWxlY3Ryb25zIDwgTUFYX0NIQVJHRTsgbnVtRWxlY3Ryb25zKysgKSB7XHJcbiAgICAgICAgbWludXNlc1sgbnVtRWxlY3Ryb25zIF0udmlzaWJsZSA9IG51bUVsZWN0cm9ucyA8IGF0b20uZWxlY3Ryb25Db3VudFByb3BlcnR5LmdldCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBtYXRjaGluZyBib3hcclxuICAgICAgY29uc3QgbnVtTWF0Y2hlZFN5bWJvbHMgPSBNYXRoLm1pbiggYXRvbS5wcm90b25Db3VudFByb3BlcnR5LmdldCgpLCBhdG9tLmVsZWN0cm9uQ291bnRQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICBtYXRjaEJveC52aXNpYmxlID0gbnVtTWF0Y2hlZFN5bWJvbHMgPiAwO1xyXG4gICAgICBtYXRjaEJveC5yZWN0V2lkdGggPSBJTlRFUl9TWU1CT0xfRElTVEFOQ0UgLyAyICsgKCBudW1NYXRjaGVkU3ltYm9scyAqIFNZTUJPTF9XSURUSCApICsgKCAoIG51bU1hdGNoZWRTeW1ib2xzIC0gMC41ICkgKiBJTlRFUl9TWU1CT0xfRElTVEFOQ0UgKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gV29ya2Fyb3VuZCBmb3IgaXNzdWUgd2hlcmUgcG9zaXRpb24gY2FuJ3QgYmUgc2V0IGlmIG5vIGJvdW5kcyBleGlzdC5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBSZWN0YW5nbGUoIDAsIDAsIFNZTUJPTF9XSURUSCwgMiAqIFNZTUJPTF9XSURUSCArIDIgKiBWRVJUSUNBTF9JTlNFVCwgMCwgMCwge1xyXG4gICAgICBmaWxsOiAncmdiYSggMCwgMCwgMCwgMCApJ1xyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gSG9vayB1cCB0aGUgdXBkYXRlIGZ1bmN0aW9uLlxyXG4gICAgcGFydGljbGVBdG9tLnBhcnRpY2xlQ291bnRQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIHVwZGF0ZSggcGFydGljbGVBdG9tICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggc3ltYm9sTGF5ZXIgKTsgLy8gYWRkZWQgYXQgdGhlIGVuZCBzbyB3ZSBoYXZlIGZhc3RlciBzdGFydHVwIHRpbWVzXHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQW5BdG9tLnJlZ2lzdGVyKCAnQ2hhcmdlQ29tcGFyaXNvbkRpc3BsYXknLCBDaGFyZ2VDb21wYXJpc29uRGlzcGxheSApO1xyXG5leHBvcnQgZGVmYXVsdCBDaGFyZ2VDb21wYXJpc29uRGlzcGxheTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLFFBQVEsbUNBQW1DO0FBQ3pFLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0MsZ0JBQWdCLE1BQU0sd0NBQXdDOztBQUVyRTtBQUNBLE1BQU1DLFlBQVksR0FBRyxFQUFFO0FBQ3ZCLE1BQU1DLGNBQWMsR0FBRyxDQUFDO0FBQ3hCLE1BQU1DLHFCQUFxQixHQUFHRixZQUFZLEdBQUcsR0FBRztBQUNoRCxNQUFNRyxpQkFBaUIsR0FBR0gsWUFBWSxHQUFHLEdBQUc7QUFFNUMsTUFBTUksdUJBQXVCLFNBQVNULElBQUksQ0FBQztFQUV6QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VVLFdBQVdBLENBQUVDLFlBQVksRUFBRUMsTUFBTSxFQUFFQyxPQUFPLEVBQUc7SUFFM0MsS0FBSyxDQUFFO01BQUVELE1BQU0sRUFBRUE7SUFBTyxDQUFFLENBQUM7SUFFM0IsTUFBTUUsVUFBVSxHQUFHVixnQkFBZ0IsQ0FBQ1UsVUFBVTtJQUM5QyxJQUFJQyxDQUFDOztJQUVMO0lBQ0EsTUFBTUMsV0FBVyxHQUFHLElBQUloQixJQUFJLENBQUU7TUFBRVksTUFBTSxFQUFFQSxNQUFNLENB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