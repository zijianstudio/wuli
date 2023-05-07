// Copyright 2013-2022, University of Colorado Boulder

/**
 * Node that shows the waving flag when the net force game is complete.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../../kite/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';
import ForcesAndMotionBasicsStrings from '../../ForcesAndMotionBasicsStrings.js';
const blueWinsString = ForcesAndMotionBasicsStrings.blueWins;
const redWinsString = ForcesAndMotionBasicsStrings.redWins;
class FlagNode extends Node {
  /**
   * Constructor for FlagNode
   *
   * @param {MotionModel} model the model for the entire 'motion', 'friction' or 'acceleration' screen
   * @param {number} centerX center for layout
   * @param {number} top top for layout
   * @param {Tandem} tandem
   */
  constructor(model, centerX, top, tandem) {
    super();
    this.model = model;
    const textNode = new Text(model.cart.xProperty.get() < 0 ? blueWinsString : redWinsString, {
      font: new PhetFont(24),
      fill: 'white'
    });
    this.path = new Path(null, {
      fill: model.cart.xProperty.get() < 0 ? 'blue' : 'red',
      stroke: 'black',
      lineWidth: 2
    });
    this.addChild(this.path);

    //Shrink the text to fit on the flag if necessary
    if (textNode.width > 220) {
      textNode.scale(220 / textNode.width);
    }
    this.addChild(textNode);
    const update = this.updateFlagShape.bind(this);

    // listeners that will dispose the flag node when model is reset or cart is returned -
    // these must also be disposed

    this.disposeFlagNode = () => {
      this.detach();
      model.timeProperty.unlink(update);
      textNode.dispose();
      this.path.dispose();
    };

    //When the clock ticks, wave the flag
    model.timeProperty.link(update);
    textNode.centerX = this.path.centerX;
    textNode.centerY = this.path.centerY;
    this.centerX = centerX;
    this.top = top;
  }

  // @public
  dispose() {
    this.disposeFlagNode();
    super.dispose();
  }

  // @public - Update the flag shape, copied from the Java version
  updateFlagShape() {
    const shape = new Shape();
    const maxX = 220;
    const maxY = 55;
    const dy = 7 * Math.sin(this.model.timeProperty.get() * 6);
    const dx = 2 * Math.sin(this.model.timeProperty.get() * 5) + 10;
    shape.moveTo(0, 0);
    shape.cubicCurveTo(maxX / 3 + dx, 25 + dy, 2 * maxX / 3 + dx, -25 - dy, maxX + dx, dy / 2);
    shape.lineTo(maxX + dx, maxY + dy / 2);
    shape.cubicCurveTo(2 * maxX / 3 + dx, -25 + maxY - dy, maxX / 3 + dx, 25 + maxY + dy, 0, maxY);
    shape.lineTo(0, 0);
    shape.close();
    this.path.shape = shape;
  }
}
forcesAndMotionBasics.register('FlagNode', FlagNode);
export default FlagNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIlBoZXRGb250IiwiTm9kZSIsIlBhdGgiLCJUZXh0IiwiZm9yY2VzQW5kTW90aW9uQmFzaWNzIiwiRm9yY2VzQW5kTW90aW9uQmFzaWNzU3RyaW5ncyIsImJsdWVXaW5zU3RyaW5nIiwiYmx1ZVdpbnMiLCJyZWRXaW5zU3RyaW5nIiwicmVkV2lucyIsIkZsYWdOb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImNlbnRlclgiLCJ0b3AiLCJ0YW5kZW0iLCJ0ZXh0Tm9kZSIsImNhcnQiLCJ4UHJvcGVydHkiLCJnZXQiLCJmb250IiwiZmlsbCIsInBhdGgiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJhZGRDaGlsZCIsIndpZHRoIiwic2NhbGUiLCJ1cGRhdGUiLCJ1cGRhdGVGbGFnU2hhcGUiLCJiaW5kIiwiZGlzcG9zZUZsYWdOb2RlIiwiZGV0YWNoIiwidGltZVByb3BlcnR5IiwidW5saW5rIiwiZGlzcG9zZSIsImxpbmsiLCJjZW50ZXJZIiwic2hhcGUiLCJtYXhYIiwibWF4WSIsImR5IiwiTWF0aCIsInNpbiIsImR4IiwibW92ZVRvIiwiY3ViaWNDdXJ2ZVRvIiwibGluZVRvIiwiY2xvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZsYWdOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE5vZGUgdGhhdCBzaG93cyB0aGUgd2F2aW5nIGZsYWcgd2hlbiB0aGUgbmV0IGZvcmNlIGdhbWUgaXMgY29tcGxldGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUGF0aCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBmb3JjZXNBbmRNb3Rpb25CYXNpY3MgZnJvbSAnLi4vLi4vZm9yY2VzQW5kTW90aW9uQmFzaWNzLmpzJztcclxuaW1wb3J0IEZvcmNlc0FuZE1vdGlvbkJhc2ljc1N0cmluZ3MgZnJvbSAnLi4vLi4vRm9yY2VzQW5kTW90aW9uQmFzaWNzU3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBibHVlV2luc1N0cmluZyA9IEZvcmNlc0FuZE1vdGlvbkJhc2ljc1N0cmluZ3MuYmx1ZVdpbnM7XHJcbmNvbnN0IHJlZFdpbnNTdHJpbmcgPSBGb3JjZXNBbmRNb3Rpb25CYXNpY3NTdHJpbmdzLnJlZFdpbnM7XHJcblxyXG5jbGFzcyBGbGFnTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RvciBmb3IgRmxhZ05vZGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TW90aW9uTW9kZWx9IG1vZGVsIHRoZSBtb2RlbCBmb3IgdGhlIGVudGlyZSAnbW90aW9uJywgJ2ZyaWN0aW9uJyBvciAnYWNjZWxlcmF0aW9uJyBzY3JlZW5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gY2VudGVyWCBjZW50ZXIgZm9yIGxheW91dFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgdG9wIGZvciBsYXlvdXRcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBjZW50ZXJYLCB0b3AsIHRhbmRlbSApIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcblxyXG4gICAgY29uc3QgdGV4dE5vZGUgPSBuZXcgVGV4dCggbW9kZWwuY2FydC54UHJvcGVydHkuZ2V0KCkgPCAwID8gYmx1ZVdpbnNTdHJpbmcgOiByZWRXaW5zU3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjQgKSxcclxuICAgICAgZmlsbDogJ3doaXRlJ1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5wYXRoID0gbmV3IFBhdGgoIG51bGwsIHtcclxuICAgICAgZmlsbDogbW9kZWwuY2FydC54UHJvcGVydHkuZ2V0KCkgPCAwID8gJ2JsdWUnIDogJ3JlZCcsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnBhdGggKTtcclxuXHJcbiAgICAvL1NocmluayB0aGUgdGV4dCB0byBmaXQgb24gdGhlIGZsYWcgaWYgbmVjZXNzYXJ5XHJcbiAgICBpZiAoIHRleHROb2RlLndpZHRoID4gMjIwICkge1xyXG4gICAgICB0ZXh0Tm9kZS5zY2FsZSggMjIwIC8gdGV4dE5vZGUud2lkdGggKTtcclxuICAgIH1cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRleHROb2RlICk7XHJcblxyXG4gICAgY29uc3QgdXBkYXRlID0gdGhpcy51cGRhdGVGbGFnU2hhcGUuYmluZCggdGhpcyApO1xyXG5cclxuICAgIC8vIGxpc3RlbmVycyB0aGF0IHdpbGwgZGlzcG9zZSB0aGUgZmxhZyBub2RlIHdoZW4gbW9kZWwgaXMgcmVzZXQgb3IgY2FydCBpcyByZXR1cm5lZCAtXHJcbiAgICAvLyB0aGVzZSBtdXN0IGFsc28gYmUgZGlzcG9zZWRcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VGbGFnTm9kZSA9ICgpID0+IHtcclxuICAgICAgdGhpcy5kZXRhY2goKTtcclxuICAgICAgbW9kZWwudGltZVByb3BlcnR5LnVubGluayggdXBkYXRlICk7XHJcbiAgICAgIHRleHROb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy5wYXRoLmRpc3Bvc2UoKTtcclxuICAgIH07XHJcblxyXG4gICAgLy9XaGVuIHRoZSBjbG9jayB0aWNrcywgd2F2ZSB0aGUgZmxhZ1xyXG4gICAgbW9kZWwudGltZVByb3BlcnR5LmxpbmsoIHVwZGF0ZSApO1xyXG4gICAgdGV4dE5vZGUuY2VudGVyWCA9IHRoaXMucGF0aC5jZW50ZXJYO1xyXG4gICAgdGV4dE5vZGUuY2VudGVyWSA9IHRoaXMucGF0aC5jZW50ZXJZO1xyXG4gICAgdGhpcy5jZW50ZXJYID0gY2VudGVyWDtcclxuICAgIHRoaXMudG9wID0gdG9wO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VGbGFnTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYyAtIFVwZGF0ZSB0aGUgZmxhZyBzaGFwZSwgY29waWVkIGZyb20gdGhlIEphdmEgdmVyc2lvblxyXG4gIHVwZGF0ZUZsYWdTaGFwZSgpIHtcclxuICAgIGNvbnN0IHNoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICBjb25zdCBtYXhYID0gMjIwO1xyXG4gICAgY29uc3QgbWF4WSA9IDU1O1xyXG4gICAgY29uc3QgZHkgPSAoIDcgKiBNYXRoLnNpbiggdGhpcy5tb2RlbC50aW1lUHJvcGVydHkuZ2V0KCkgKiA2ICkgKTtcclxuICAgIGNvbnN0IGR4ID0gKCAyICogTWF0aC5zaW4oIHRoaXMubW9kZWwudGltZVByb3BlcnR5LmdldCgpICogNSApICkgKyAxMDtcclxuICAgIHNoYXBlLm1vdmVUbyggMCwgMCApO1xyXG4gICAgc2hhcGUuY3ViaWNDdXJ2ZVRvKCBtYXhYIC8gMyArIGR4LCAyNSArIGR5LCAyICogbWF4WCAvIDMgKyBkeCwgLTI1IC0gZHksIG1heFggKyBkeCwgZHkgLyAyICk7XHJcbiAgICBzaGFwZS5saW5lVG8oIG1heFggKyBkeCwgbWF4WSArIGR5IC8gMiApO1xyXG4gICAgc2hhcGUuY3ViaWNDdXJ2ZVRvKCAyICogbWF4WCAvIDMgKyBkeCwgLTI1ICsgbWF4WSAtIGR5LCBtYXhYIC8gMyArIGR4LCAyNSArIG1heFkgKyBkeSwgMCwgbWF4WSApO1xyXG4gICAgc2hhcGUubGluZVRvKCAwLCAwICk7XHJcbiAgICBzaGFwZS5jbG9zZSgpO1xyXG4gICAgdGhpcy5wYXRoLnNoYXBlID0gc2hhcGU7XHJcbiAgfVxyXG59XHJcblxyXG5mb3JjZXNBbmRNb3Rpb25CYXNpY3MucmVnaXN0ZXIoICdGbGFnTm9kZScsIEZsYWdOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBGbGFnTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3BFLE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUNsRSxPQUFPQyw0QkFBNEIsTUFBTSx1Q0FBdUM7QUFFaEYsTUFBTUMsY0FBYyxHQUFHRCw0QkFBNEIsQ0FBQ0UsUUFBUTtBQUM1RCxNQUFNQyxhQUFhLEdBQUdILDRCQUE0QixDQUFDSSxPQUFPO0FBRTFELE1BQU1DLFFBQVEsU0FBU1QsSUFBSSxDQUFDO0VBRTFCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVUsV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxPQUFPLEVBQUVDLEdBQUcsRUFBRUMsTUFBTSxFQUFHO0lBQ3pDLEtBQUssQ0FBQyxDQUFDO0lBQ1AsSUFBSSxDQUFDSCxLQUFLLEdBQUdBLEtBQUs7SUFFbEIsTUFBTUksUUFBUSxHQUFHLElBQUliLElBQUksQ0FBRVMsS0FBSyxDQUFDSyxJQUFJLENBQUNDLFNBQVMsQ0FBQ0MsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUdiLGNBQWMsR0FBR0UsYUFBYSxFQUFFO01BQzFGWSxJQUFJLEVBQUUsSUFBSXBCLFFBQVEsQ0FBRSxFQUFHLENBQUM7TUFDeEJxQixJQUFJLEVBQUU7SUFDUixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUND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