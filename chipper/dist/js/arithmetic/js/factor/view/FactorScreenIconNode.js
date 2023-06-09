// Copyright 2014-2022, University of Colorado Boulder

/**
 * Icon node for 'Factor' screen.
 *
 * @author Andrey Zelenkov (MLearner)
 * @author John Blanco (MLearner)
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, Rectangle, Text } from '../../../../scenery/js/imports.js';
import arithmetic from '../../arithmetic.js';
import ArithmeticConstants from '../../common/ArithmeticConstants.js';

// constants
const ICON_SIZE = ArithmeticConstants.SCREEN_ICON_SIZE;
const CONNECTING_LINES_COLOR = '#FFF31E';
const CONNECTING_LINE_WIDTH = 15;
const NUMBER_FONT = new PhetFont(90); // Font size empirically determined
const QUESTION_MARK_FONT = new PhetFont({
  size: 120,
  weight: 'bold'
}); // Font size empirically determined
const BOX_VERTICAL_INSET = 25; // Empirically determined
const CONNECTING_LINES_OPTIONS = {
  stroke: CONNECTING_LINES_COLOR,
  lineWidth: CONNECTING_LINE_WIDTH,
  lineCap: 'round'
};

// utility function for creating a rectangle with text in it.
function createRectangleWithEnclosedText(text, font, xMargin, yMargin) {
  const textNode = new Text(text, {
    font: font
  });
  const box = new Rectangle(0, 0, textNode.width + 2 * xMargin, textNode.height + 2 * yMargin, 20, 20, {
    fill: 'white'
  });
  textNode.center = box.center;
  box.addChild(textNode);
  return box;
}
class FactorScreenIconNode extends Rectangle {
  /**
   */
  constructor() {
    // create the background
    super(0, 0, ICON_SIZE.width, ICON_SIZE.height, {
      fill: ArithmeticConstants.ICON_BACKGROUND_COLOR
    });

    // Create and position the boxes, but don't add them yet so that we can get the layering right.
    const topBox = createRectangleWithEnclosedText('12', NUMBER_FONT, 15, 5);
    topBox.centerX = this.width / 2;
    topBox.top = BOX_VERTICAL_INSET;
    const multiplicandBox = createRectangleWithEnclosedText('?', QUESTION_MARK_FONT, 20, 5);
    multiplicandBox.centerX = ICON_SIZE.width * 0.3;
    multiplicandBox.bottom = ICON_SIZE.height - BOX_VERTICAL_INSET;
    const multiplierBox = createRectangleWithEnclosedText('?', QUESTION_MARK_FONT, 20, 5);
    multiplierBox.centerX = ICON_SIZE.width * 0.7;
    multiplierBox.bottom = multiplicandBox.bottom;

    // Add the connecting lines
    this.addChild(new Line(topBox.centerX, topBox.bottom, multiplicandBox.centerX, multiplicandBox.top, CONNECTING_LINES_OPTIONS));
    this.addChild(new Line(topBox.centerX, topBox.bottom, multiplierBox.centerX, multiplierBox.top, CONNECTING_LINES_OPTIONS));

    // Add the text boxes
    this.addChild(topBox);
    this.addChild(multiplicandBox);
    this.addChild(multiplierBox);
  }
}
arithmetic.register('FactorScreenIconNode', FactorScreenIconNode);
export default FactorScreenIconNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Rm9udCIsIkxpbmUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiYXJpdGhtZXRpYyIsIkFyaXRobWV0aWNDb25zdGFudHMiLCJJQ09OX1NJWkUiLCJTQ1JFRU5fSUNPTl9TSVpFIiwiQ09OTkVDVElOR19MSU5FU19DT0xPUiIsIkNPTk5FQ1RJTkdfTElORV9XSURUSCIsIk5VTUJFUl9GT05UIiwiUVVFU1RJT05fTUFSS19GT05UIiwic2l6ZSIsIndlaWdodCIsIkJPWF9WRVJUSUNBTF9JTlNFVCIsIkNPTk5FQ1RJTkdfTElORVNfT1BUSU9OUyIsInN0cm9rZSIsImxpbmVXaWR0aCIsImxpbmVDYXAiLCJjcmVhdGVSZWN0YW5nbGVXaXRoRW5jbG9zZWRUZXh0IiwidGV4dCIsImZvbnQiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInRleHROb2RlIiwiYm94Iiwid2lkdGgiLCJoZWlnaHQiLCJmaWxsIiwiY2VudGVyIiwiYWRkQ2hpbGQiLCJGYWN0b3JTY3JlZW5JY29uTm9kZSIsImNvbnN0cnVjdG9yIiwiSUNPTl9CQUNLR1JPVU5EX0NPTE9SIiwidG9wQm94IiwiY2VudGVyWCIsInRvcCIsIm11bHRpcGxpY2FuZEJveCIsImJvdHRvbSIsIm11bHRpcGxpZXJCb3giLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZhY3RvclNjcmVlbkljb25Ob2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEljb24gbm9kZSBmb3IgJ0ZhY3Rvcicgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFuZHJleSBaZWxlbmtvdiAoTUxlYXJuZXIpXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKE1MZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBMaW5lLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYXJpdGhtZXRpYyBmcm9tICcuLi8uLi9hcml0aG1ldGljLmpzJztcclxuaW1wb3J0IEFyaXRobWV0aWNDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0FyaXRobWV0aWNDb25zdGFudHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IElDT05fU0laRSA9IEFyaXRobWV0aWNDb25zdGFudHMuU0NSRUVOX0lDT05fU0laRTtcclxuY29uc3QgQ09OTkVDVElOR19MSU5FU19DT0xPUiA9ICcjRkZGMzFFJztcclxuY29uc3QgQ09OTkVDVElOR19MSU5FX1dJRFRIID0gMTU7XHJcbmNvbnN0IE5VTUJFUl9GT05UID0gbmV3IFBoZXRGb250KCA5MCApOyAvLyBGb250IHNpemUgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5jb25zdCBRVUVTVElPTl9NQVJLX0ZPTlQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTIwLCB3ZWlnaHQ6ICdib2xkJyB9ICk7IC8vIEZvbnQgc2l6ZSBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbmNvbnN0IEJPWF9WRVJUSUNBTF9JTlNFVCA9IDI1OyAvLyBFbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbmNvbnN0IENPTk5FQ1RJTkdfTElORVNfT1BUSU9OUyA9IHtcclxuICBzdHJva2U6IENPTk5FQ1RJTkdfTElORVNfQ09MT1IsXHJcbiAgbGluZVdpZHRoOiBDT05ORUNUSU5HX0xJTkVfV0lEVEgsXHJcbiAgbGluZUNhcDogJ3JvdW5kJ1xyXG59O1xyXG5cclxuLy8gdXRpbGl0eSBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYSByZWN0YW5nbGUgd2l0aCB0ZXh0IGluIGl0LlxyXG5mdW5jdGlvbiBjcmVhdGVSZWN0YW5nbGVXaXRoRW5jbG9zZWRUZXh0KCB0ZXh0LCBmb250LCB4TWFyZ2luLCB5TWFyZ2luICkge1xyXG4gIGNvbnN0IHRleHROb2RlID0gbmV3IFRleHQoIHRleHQsIHsgZm9udDogZm9udCB9ICk7XHJcbiAgY29uc3QgYm94ID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgdGV4dE5vZGUud2lkdGggKyAyICogeE1hcmdpbiwgdGV4dE5vZGUuaGVpZ2h0ICsgMiAqIHlNYXJnaW4sIDIwLCAyMCwgeyBmaWxsOiAnd2hpdGUnIH0gKTtcclxuICB0ZXh0Tm9kZS5jZW50ZXIgPSBib3guY2VudGVyO1xyXG4gIGJveC5hZGRDaGlsZCggdGV4dE5vZGUgKTtcclxuICByZXR1cm4gYm94O1xyXG59XHJcblxyXG5jbGFzcyBGYWN0b3JTY3JlZW5JY29uTm9kZSBleHRlbmRzIFJlY3RhbmdsZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgYmFja2dyb3VuZFxyXG4gICAgc3VwZXIoIDAsIDAsIElDT05fU0laRS53aWR0aCwgSUNPTl9TSVpFLmhlaWdodCwgeyBmaWxsOiBBcml0aG1ldGljQ29uc3RhbnRzLklDT05fQkFDS0dST1VORF9DT0xPUiB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGFuZCBwb3NpdGlvbiB0aGUgYm94ZXMsIGJ1dCBkb24ndCBhZGQgdGhlbSB5ZXQgc28gdGhhdCB3ZSBjYW4gZ2V0IHRoZSBsYXllcmluZyByaWdodC5cclxuICAgIGNvbnN0IHRvcEJveCA9IGNyZWF0ZVJlY3RhbmdsZVdpdGhFbmNsb3NlZFRleHQoICcxMicsIE5VTUJFUl9GT05ULCAxNSwgNSApO1xyXG4gICAgdG9wQm94LmNlbnRlclggPSB0aGlzLndpZHRoIC8gMjtcclxuICAgIHRvcEJveC50b3AgPSBCT1hfVkVSVElDQUxfSU5TRVQ7XHJcbiAgICBjb25zdCBtdWx0aXBsaWNhbmRCb3ggPSBjcmVhdGVSZWN0YW5nbGVXaXRoRW5jbG9zZWRUZXh0KCAnPycsIFFVRVNUSU9OX01BUktfRk9OVCwgMjAsIDUgKTtcclxuICAgIG11bHRpcGxpY2FuZEJveC5jZW50ZXJYID0gSUNPTl9TSVpFLndpZHRoICogMC4zO1xyXG4gICAgbXVsdGlwbGljYW5kQm94LmJvdHRvbSA9IElDT05fU0laRS5oZWlnaHQgLSBCT1hfVkVSVElDQUxfSU5TRVQ7XHJcbiAgICBjb25zdCBtdWx0aXBsaWVyQm94ID0gY3JlYXRlUmVjdGFuZ2xlV2l0aEVuY2xvc2VkVGV4dCggJz8nLCBRVUVTVElPTl9NQVJLX0ZPTlQsIDIwLCA1ICk7XHJcbiAgICBtdWx0aXBsaWVyQm94LmNlbnRlclggPSBJQ09OX1NJWkUud2lkdGggKiAwLjc7XHJcbiAgICBtdWx0aXBsaWVyQm94LmJvdHRvbSA9IG11bHRpcGxpY2FuZEJveC5ib3R0b207XHJcblxyXG4gICAgLy8gQWRkIHRoZSBjb25uZWN0aW5nIGxpbmVzXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgTGluZSggdG9wQm94LmNlbnRlclgsIHRvcEJveC5ib3R0b20sIG11bHRpcGxpY2FuZEJveC5jZW50ZXJYLCBtdWx0aXBsaWNhbmRCb3gudG9wLCBDT05ORUNUSU5HX0xJTkVTX09QVElPTlMgKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IExpbmUoIHRvcEJveC5jZW50ZXJYLCB0b3BCb3guYm90dG9tLCBtdWx0aXBsaWVyQm94LmNlbnRlclgsIG11bHRpcGxpZXJCb3gudG9wLCBDT05ORUNUSU5HX0xJTkVTX09QVElPTlMgKSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgdGV4dCBib3hlc1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdG9wQm94ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBtdWx0aXBsaWNhbmRCb3ggKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG11bHRpcGxpZXJCb3ggKTtcclxuICB9XHJcbn1cclxuXHJcbmFyaXRobWV0aWMucmVnaXN0ZXIoICdGYWN0b3JTY3JlZW5JY29uTm9kZScsIEZhY3RvclNjcmVlbkljb25Ob2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBGYWN0b3JTY3JlZW5JY29uTm9k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