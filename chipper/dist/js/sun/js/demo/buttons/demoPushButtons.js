// Copyright 2014-2022, University of Colorado Boulder

/**
 * Demo for various push buttons.
 *
 * @author various contributors
 */

import Checkbox from '../../Checkbox.js';
import RectangularPushButton from '../../buttons/RectangularPushButton.js';
import RoundPushButton from '../../buttons/RoundPushButton.js';
import ButtonNode from '../../buttons/ButtonNode.js';
import ArrowButton from '../../buttons/ArrowButton.js';
import CarouselButton from '../../buttons/CarouselButton.js';
import { Circle, Color, Font, HBox, Node, Rectangle, Text, VBox, VStrut } from '../../../../scenery/js/imports.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
const BUTTON_FONT = new Font({
  size: 16
});
export default function demoPushButtons(layoutBounds) {
  // For enabling/disabling all buttons
  const buttonsEnabledProperty = new Property(true);
  const buttonsEnabledCheckbox = new Checkbox(buttonsEnabledProperty, new Text('buttons enabled', {
    font: new Font({
      size: 20
    })
  }));

  //===================================================================================
  // Pseudo-3D buttons A, B, C, D, E
  //===================================================================================

  const buttonA = new RectangularPushButton({
    content: new Text('--- A ---', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('buttonA fired'),
    enabledProperty: buttonsEnabledProperty,
    // demonstrate pointer areas, see https://github.com/phetsims/sun/issues/464
    touchAreaXDilation: 10,
    touchAreaYDilation: 10,
    mouseAreaXDilation: 5,
    mouseAreaYDilation: 5
  });
  const buttonB = new RectangularPushButton({
    content: new Text('--- B ---', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('buttonB fired'),
    baseColor: new Color(250, 0, 0),
    enabledProperty: buttonsEnabledProperty
  });
  const buttonC = new RectangularPushButton({
    content: new Text('--- C ---', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('buttonC fired'),
    baseColor: 'rgb( 204, 102, 204 )',
    enabledProperty: buttonsEnabledProperty
  });
  const buttonD = new RoundPushButton({
    content: new Text('--- D ---', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('buttonD fired'),
    enabledProperty: buttonsEnabledProperty,
    radius: 30,
    lineWidth: 20 // a thick stroke, to test pointer areas and focus highlight
  });

  const buttonE = new RoundPushButton({
    content: new Text('--- E ---', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('buttonE fired'),
    baseColor: 'yellow',
    enabledProperty: buttonsEnabledProperty,
    // Demonstrate shifted pointer areas, https://github.com/phetsims/sun/issues/500
    touchAreaXShift: 20,
    touchAreaYShift: 20,
    mouseAreaXShift: 10,
    mouseAreaYShift: 10
  });
  const buttonF = new RoundPushButton({
    content: new Text('--- F ---', {
      font: BUTTON_FONT,
      fill: 'white'
    }),
    listener: () => console.log('buttonF fired'),
    baseColor: 'purple',
    enabledProperty: buttonsEnabledProperty,
    xMargin: 20,
    yMargin: 20,
    xContentOffset: 8,
    yContentOffset: 15
  });

  // Test for a button with different radii for each corner
  const customCornersButton = new RectangularPushButton({
    baseColor: 'orange',
    enabledProperty: buttonsEnabledProperty,
    size: new Dimension2(50, 50),
    leftTopCornerRadius: 20,
    rightTopCornerRadius: 10,
    rightBottomCornerRadius: 5,
    leftBottomCornerRadius: 0,
    listener: () => console.log('customCornersButton fired')
  });
  const pseudo3DButtonsBox = new HBox({
    children: [buttonA, buttonB, buttonC, buttonD, buttonE, buttonF, customCornersButton],
    spacing: 10
  });

  //===================================================================================
  // Flat buttons labeled 1, 2, 3, 4
  //===================================================================================

  const button1 = new RectangularPushButton({
    content: new Text('-- 1 --', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('button1 fired'),
    baseColor: 'rgb( 204, 102, 204 )',
    enabledProperty: buttonsEnabledProperty,
    buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
  });
  const button2 = new RectangularPushButton({
    content: new Text('-- 2 --', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('button2 fired'),
    baseColor: '#A0D022',
    enabledProperty: buttonsEnabledProperty,
    buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
    lineWidth: 1,
    stroke: '#202020'
  });
  const button3 = new RoundPushButton({
    content: new Text('- 3 -', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('button3 fired'),
    enabledProperty: buttonsEnabledProperty,
    buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
  });
  const button4 = new RoundPushButton({
    content: new Text('-- 4 --', {
      font: BUTTON_FONT,
      fill: 'white'
    }),
    listener: () => console.log('button4 fired'),
    baseColor: '#CC3300',
    enabledProperty: buttonsEnabledProperty,
    buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy
  });
  const flatButtonsBox = new HBox({
    children: [button1, button2, button3, button4],
    spacing: 10
  });

  //===================================================================================
  // Fire! Go! Help! buttons - these demonstrate more colors and sizes of buttons
  //===================================================================================

  const fireButton = new RoundPushButton({
    content: new Text('Fire!', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('fireButton fired'),
    enabledProperty: buttonsEnabledProperty,
    baseColor: 'orange',
    stroke: 'black',
    lineWidth: 0.5
  });
  const goButton = new RoundPushButton({
    content: new Text('Go!', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('goButton fired'),
    baseColor: new Color(0, 163, 0),
    enabledProperty: buttonsEnabledProperty
  });
  const helpButton = new RoundPushButton({
    content: new Text('Help', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('helpButton fired'),
    baseColor: new Color(244, 154, 194),
    enabledProperty: buttonsEnabledProperty
  });
  const actionButtonsBox = new HBox({
    children: [fireButton, goButton, helpButton],
    spacing: 15
  });

  //===================================================================================
  // Buttons with fire-on-hold turned on
  //===================================================================================

  const fireQuicklyWhenHeldButton = new RectangularPushButton({
    content: new Text('Press and hold to test (fast fire)', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('fireQuicklyWhenHeldButton fired'),
    baseColor: new Color(114, 132, 62),
    enabledProperty: buttonsEnabledProperty,
    fireOnHold: true,
    fireOnHoldDelay: 100,
    fireOnHoldInterval: 50
  });
  const fireSlowlyWhenHeldButton = new RectangularPushButton({
    content: new Text('Press and hold to test (slow fire)', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('fireSlowlyWhenHeldButton fired'),
    baseColor: new Color(147, 92, 120),
    enabledProperty: buttonsEnabledProperty,
    fireOnHold: true,
    fireOnHoldDelay: 600,
    fireOnHoldInterval: 300,
    top: fireQuicklyWhenHeldButton.bottom + 10
  });
  const heldButtonsBox = new VBox({
    children: [fireQuicklyWhenHeldButton, fireSlowlyWhenHeldButton],
    spacing: 10,
    align: 'left'
  });
  const upperLeftAlignTextNode = new Text('upper left align test', {
    font: BUTTON_FONT
  });
  const upperLeftContentButton = new RectangularPushButton({
    content: upperLeftAlignTextNode,
    listener: () => console.log('upperLeftContentButton fired'),
    enabledProperty: buttonsEnabledProperty,
    xAlign: 'left',
    yAlign: 'top',
    minWidth: upperLeftAlignTextNode.width * 1.5,
    minHeight: upperLeftAlignTextNode.height * 2
  });
  const lowerRightAlignTextNode = new Text('lower right align test', {
    font: BUTTON_FONT
  });
  const lowerRightContentButton = new RectangularPushButton({
    content: lowerRightAlignTextNode,
    listener: () => console.log('lowerRightContentButton fired'),
    enabledProperty: buttonsEnabledProperty,
    xAlign: 'right',
    yAlign: 'bottom',
    minWidth: lowerRightAlignTextNode.width * 1.5,
    minHeight: lowerRightAlignTextNode.height * 2,
    top: upperLeftContentButton.height + 10
  });
  const alignTextButtonsBox = new VBox({
    children: [upperLeftContentButton, lowerRightContentButton],
    spacing: 10,
    align: 'left'
  });

  //===================================================================================
  // Miscellaneous other button examples
  //===================================================================================

  const fireOnDownButton = new RectangularPushButton({
    content: new Text('Fire on Down', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('fireOnDownButton fired'),
    baseColor: new Color(255, 255, 61),
    enabledProperty: buttonsEnabledProperty,
    fireOnDown: true,
    stroke: 'black',
    lineWidth: 1
  });

  // transparent button with something behind it
  const rectangleNode = new Rectangle(0, 0, 25, 100, {
    fill: 'red'
  });
  const transparentAlphaButton = new RectangularPushButton({
    content: new Text('Transparent Button via alpha', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('transparentAlphaButton fired'),
    baseColor: new Color(255, 255, 0, 0.7),
    enabledProperty: buttonsEnabledProperty,
    centerX: rectangleNode.centerX,
    top: rectangleNode.top + 10
  });
  const transparentOpacityButton = new RectangularPushButton({
    content: new Text('Transparent Button via opacity', {
      font: BUTTON_FONT
    }),
    listener: () => console.log('transparentOpacityButton fired'),
    baseColor: new Color(255, 255, 0),
    enabledProperty: buttonsEnabledProperty,
    opacity: 0.6,
    centerX: rectangleNode.centerX,
    bottom: rectangleNode.bottom - 10
  });
  const transparentParent = new Node({
    children: [rectangleNode, transparentAlphaButton, transparentOpacityButton]
  });
  const arrowButton = new ArrowButton('left', () => console.log('arrowButton fired'), {
    enabledProperty: buttonsEnabledProperty
  });
  const carouselButton = new CarouselButton({
    listener: () => console.log('carouselButton fired'),
    enabledProperty: buttonsEnabledProperty
  });
  const miscButtonsBox = new HBox({
    children: [fireOnDownButton, transparentParent, arrowButton, carouselButton],
    spacing: 15
  });

  //===================================================================================
  // Test the 2 ways of specifying a button's size:
  // (1) If you provide size of the button, content is sized to fit the button.
  // (2) If you don't provide size, the button is sized to fit the content.
  // See https://github.com/phetsims/sun/issues/657
  //===================================================================================

  // This button's stroke will look thicker, because content will be scaled up.
  const roundButtonWithExplicitSize = new RoundPushButton({
    enabledProperty: buttonsEnabledProperty,
    radius: 25,
    content: new Circle(5, {
      fill: 'red',
      stroke: 'black'
    }),
    listener: () => console.log('roundButtonWithExplicitSize pressed'),
    xMargin: 5,
    yMargin: 5
  });

  // This button's content will look as specified, because button is sized to fit the content.
  const roundButtonWithDerivedSize = new RoundPushButton({
    enabledProperty: buttonsEnabledProperty,
    content: new Circle(20, {
      fill: 'red',
      stroke: 'black'
    }),
    listener: () => console.log('roundButtonWithDerivedSize pressed'),
    xMargin: 5,
    yMargin: 5
  });

  // The total size of this one, should be the same as the content of the one below. This button's stroke will look
  // thicker, because content will be scaled up.
  const rectangularButtonWithExplicitSize = new RectangularPushButton({
    enabledProperty: buttonsEnabledProperty,
    size: new Dimension2(40, 25),
    content: new Rectangle(0, 0, 5, 3, {
      fill: 'red',
      stroke: 'black'
    }),
    listener: () => console.log('rectangularButtonWithExplicitSize pressed'),
    xMargin: 5,
    yMargin: 5
  });

  // This button's content will look as specified, because button is sized to fit around the content.
  const rectangularButtonWithDerivedSize = new RectangularPushButton({
    enabledProperty: buttonsEnabledProperty,
    content: new Rectangle(0, 0, 40, 25, {
      fill: 'blue',
      stroke: 'black'
    }),
    listener: () => console.log('rectangularButtonWithDerivedSize pressed'),
    xMargin: 5,
    yMargin: 5
  });
  const buttonSizeDemos = new HBox({
    spacing: 20,
    children: [rectangularButtonWithExplicitSize, rectangularButtonWithDerivedSize, roundButtonWithExplicitSize, roundButtonWithDerivedSize]
  });

  //===================================================================================
  // Demonstrate dynamic colors for some buttons
  //===================================================================================

  // Change colors of all buttons in pseudo3DButtonsBox
  const changeButtonColorsButton = new RectangularPushButton({
    enabledProperty: buttonsEnabledProperty,
    content: new Text('\u21e6 Change button colors', {
      font: BUTTON_FONT
    }),
    listener: () => {
      console.log('changeButtonColorsButton fired');
      pseudo3DButtonsBox.children.forEach(child => {
        if (child instanceof ButtonNode) {
          child.baseColor = new Color(dotRandom.nextDoubleBetween(0, 255), dotRandom.nextDoubleBetween(0, 255), dotRandom.nextDoubleBetween(0, 255));
        }
      });
    }
  });

  //===================================================================================
  // Layout
  //===================================================================================

  const xSpacing = 50;
  return new VBox({
    spacing: 15,
    children: [new HBox({
      spacing: xSpacing,
      children: [pseudo3DButtonsBox, changeButtonColorsButton]
    }), new HBox({
      spacing: xSpacing,
      children: [flatButtonsBox, actionButtonsBox]
    }), new HBox({
      spacing: xSpacing,
      children: [heldButtonsBox, alignTextButtonsBox]
    }), miscButtonsBox, buttonSizeDemos, new VStrut(25), buttonsEnabledCheckbox],
    center: layoutBounds.center
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGVja2JveCIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIlJvdW5kUHVzaEJ1dHRvbiIsIkJ1dHRvbk5vZGUiLCJBcnJvd0J1dHRvbiIsIkNhcm91c2VsQnV0dG9uIiwiQ2lyY2xlIiwiQ29sb3IiLCJGb250IiwiSEJveCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiVkJveCIsIlZTdHJ1dCIsIlByb3BlcnR5IiwiRGltZW5zaW9uMiIsImRvdFJhbmRvbSIsIkJVVFRPTl9GT05UIiwic2l6ZSIsImRlbW9QdXNoQnV0dG9ucyIsImxheW91dEJvdW5kcyIsImJ1dHRvbnNFbmFibGVkUHJvcGVydHkiLCJidXR0b25zRW5hYmxlZENoZWNrYm94IiwiZm9udCIsImJ1dHRvbkEiLCJjb250ZW50IiwibGlzdGVuZXIiLCJjb25zb2xlIiwibG9nIiwiZW5hYmxlZFByb3BlcnR5IiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibW91c2VBcmVhWERpbGF0aW9uIiwibW91c2VBcmVhWURpbGF0aW9uIiwiYnV0dG9uQiIsImJhc2VDb2xvciIsImJ1dHRvbkMiLCJidXR0b25EIiwicmFkaXVzIiwibGluZVdpZHRoIiwiYnV0dG9uRSIsInRvdWNoQXJlYVhTaGlmdCIsInRvdWNoQXJlYVlTaGlmdCIsIm1vdXNlQXJlYVhTaGlmdCIsIm1vdXNlQXJlYVlTaGlmdCIsImJ1dHRvbkYiLCJmaWxsIiwieE1hcmdpbiIsInlNYXJnaW4iLCJ4Q29udGVudE9mZnNldCIsInlDb250ZW50T2Zmc2V0IiwiY3VzdG9tQ29ybmVyc0J1dHRvbiIsImxlZnRUb3BDb3JuZXJSYWRpdXMiLCJyaWdodFRvcENvcm5lclJhZGl1cyIsInJpZ2h0Qm90dG9tQ29ybmVyUmFkaXVzIiwibGVmdEJvdHRvbUNvcm5lclJhZGl1cyIsInBzZXVkbzNEQnV0dG9uc0JveCIsImNoaWxkcmVuIiwic3BhY2luZyIsImJ1dHRvbjEiLCJidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3kiLCJGbGF0QXBwZWFyYW5jZVN0cmF0ZWd5IiwiYnV0dG9uMiIsInN0cm9rZSIsImJ1dHRvbjMiLCJidXR0b240IiwiZmxhdEJ1dHRvbnNCb3giLCJmaXJlQnV0dG9uIiwiZ29CdXR0b24iLCJoZWxwQnV0dG9uIiwiYWN0aW9uQnV0dG9uc0JveCIsImZpcmVRdWlja2x5V2hlbkhlbGRCdXR0b24iLCJmaXJlT25Ib2xkIiwiZmlyZU9uSG9sZERlbGF5IiwiZmlyZU9uSG9sZEludGVydmFsIiwiZmlyZVNsb3dseVdoZW5IZWxkQnV0dG9uIiwidG9wIiwiYm90dG9tIiwiaGVsZEJ1dHRvbnNCb3giLCJhbGlnbiIsInVwcGVyTGVmdEFsaWduVGV4dE5vZGUiLCJ1cHBlckxlZnRDb250ZW50QnV0dG9uIiwieEFsaWduIiwieUFsaWduIiwibWluV2lkdGgiLCJ3aWR0aCIsIm1pbkhlaWdodCIsImhlaWdodCIsImxvd2VyUmlnaHRBbGlnblRleHROb2RlIiwibG93ZXJSaWdodENvbnRlbnRCdXR0b24iLCJhbGlnblRleHRCdXR0b25zQm94IiwiZmlyZU9uRG93bkJ1dHRvbiIsImZpcmVPbkRvd24iLCJyZWN0YW5nbGVOb2RlIiwidHJhbnNwYXJlbnRBbHBoYUJ1dHRvbiIsImNlbnRlclgiLCJ0cmFuc3BhcmVudE9wYWNpdHlCdXR0b24iLCJvcGFjaXR5IiwidHJhbnNwYXJlbnRQYXJlbnQiLCJhcnJvd0J1dHRvbiIsImNhcm91c2VsQnV0dG9uIiwibWlzY0J1dHRvbnNCb3giLCJyb3VuZEJ1dHRvbldpdGhFeHBsaWNpdFNpemUiLCJyb3VuZEJ1dHRvbldpdGhEZXJpdmVkU2l6ZSIsInJlY3Rhbmd1bGFyQnV0dG9uV2l0aEV4cGxpY2l0U2l6ZSIsInJlY3Rhbmd1bGFyQnV0dG9uV2l0aERlcml2ZWRTaXplIiwiYnV0dG9uU2l6ZURlbW9zIiwiY2hhbmdlQnV0dG9uQ29sb3JzQnV0dG9uIiwiZm9yRWFjaCIsImNoaWxkIiwibmV4dERvdWJsZUJldHdlZW4iLCJ4U3BhY2luZyIsImNlbnRlciJdLCJzb3VyY2VzIjpbImRlbW9QdXNoQnV0dG9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEZW1vIGZvciB2YXJpb3VzIHB1c2ggYnV0dG9ucy5cclxuICpcclxuICogQGF1dGhvciB2YXJpb3VzIGNvbnRyaWJ1dG9yc1xyXG4gKi9cclxuXHJcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi9DaGVja2JveC5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgUm91bmRQdXNoQnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvUm91bmRQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IEJ1dHRvbk5vZGUgZnJvbSAnLi4vLi4vYnV0dG9ucy9CdXR0b25Ob2RlLmpzJztcclxuaW1wb3J0IEFycm93QnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvQXJyb3dCdXR0b24uanMnO1xyXG5pbXBvcnQgQ2Fyb3VzZWxCdXR0b24gZnJvbSAnLi4vLi4vYnV0dG9ucy9DYXJvdXNlbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgQ29sb3IsIEZvbnQsIEhCb3gsIE5vZGUsIFJlY3RhbmdsZSwgVGV4dCwgVkJveCwgVlN0cnV0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuXHJcbmNvbnN0IEJVVFRPTl9GT05UID0gbmV3IEZvbnQoIHsgc2l6ZTogMTYgfSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb1B1c2hCdXR0b25zKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XHJcblxyXG4gIC8vIEZvciBlbmFibGluZy9kaXNhYmxpbmcgYWxsIGJ1dHRvbnNcclxuICBjb25zdCBidXR0b25zRW5hYmxlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0cnVlICk7XHJcbiAgY29uc3QgYnV0dG9uc0VuYWJsZWRDaGVja2JveCA9IG5ldyBDaGVja2JveCggYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSwgbmV3IFRleHQoICdidXR0b25zIGVuYWJsZWQnLCB7XHJcbiAgICBmb250OiBuZXcgRm9udCggeyBzaXplOiAyMCB9IClcclxuICB9ICkgKTtcclxuXHJcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIFBzZXVkby0zRCBidXR0b25zIEEsIEIsIEMsIEQsIEVcclxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGNvbnN0IGJ1dHRvbkEgPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XHJcbiAgICBjb250ZW50OiBuZXcgVGV4dCggJy0tLSBBIC0tLScsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxyXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnYnV0dG9uQSBmaXJlZCcgKSxcclxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcclxuXHJcbiAgICAvLyBkZW1vbnN0cmF0ZSBwb2ludGVyIGFyZWFzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N1bi9pc3N1ZXMvNDY0XHJcbiAgICB0b3VjaEFyZWFYRGlsYXRpb246IDEwLFxyXG4gICAgdG91Y2hBcmVhWURpbGF0aW9uOiAxMCxcclxuICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogNSxcclxuICAgIG1vdXNlQXJlYVlEaWxhdGlvbjogNVxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgYnV0dG9uQiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnLS0tIEIgLS0tJywgeyBmb250OiBCVVRUT05fRk9OVCB9ICksXHJcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdidXR0b25CIGZpcmVkJyApLFxyXG4gICAgYmFzZUNvbG9yOiBuZXcgQ29sb3IoIDI1MCwgMCwgMCApLFxyXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5XHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBidXR0b25DID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xyXG4gICAgY29udGVudDogbmV3IFRleHQoICctLS0gQyAtLS0nLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKSxcclxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2J1dHRvbkMgZmlyZWQnICksXHJcbiAgICBiYXNlQ29sb3I6ICdyZ2IoIDIwNCwgMTAyLCAyMDQgKScsXHJcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHlcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGJ1dHRvbkQgPSBuZXcgUm91bmRQdXNoQnV0dG9uKCB7XHJcbiAgICBjb250ZW50OiBuZXcgVGV4dCggJy0tLSBEIC0tLScsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxyXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnYnV0dG9uRCBmaXJlZCcgKSxcclxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgIHJhZGl1czogMzAsXHJcbiAgICBsaW5lV2lkdGg6IDIwIC8vIGEgdGhpY2sgc3Ryb2tlLCB0byB0ZXN0IHBvaW50ZXIgYXJlYXMgYW5kIGZvY3VzIGhpZ2hsaWdodFxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgYnV0dG9uRSA9IG5ldyBSb3VuZFB1c2hCdXR0b24oIHtcclxuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnLS0tIEUgLS0tJywgeyBmb250OiBCVVRUT05fRk9OVCB9ICksXHJcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdidXR0b25FIGZpcmVkJyApLFxyXG4gICAgYmFzZUNvbG9yOiAneWVsbG93JyxcclxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcclxuXHJcbiAgICAvLyBEZW1vbnN0cmF0ZSBzaGlmdGVkIHBvaW50ZXIgYXJlYXMsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzUwMFxyXG4gICAgdG91Y2hBcmVhWFNoaWZ0OiAyMCxcclxuICAgIHRvdWNoQXJlYVlTaGlmdDogMjAsXHJcbiAgICBtb3VzZUFyZWFYU2hpZnQ6IDEwLFxyXG4gICAgbW91c2VBcmVhWVNoaWZ0OiAxMFxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgYnV0dG9uRiA9IG5ldyBSb3VuZFB1c2hCdXR0b24oIHtcclxuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnLS0tIEYgLS0tJywgeyBmb250OiBCVVRUT05fRk9OVCwgZmlsbDogJ3doaXRlJyB9ICksXHJcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdidXR0b25GIGZpcmVkJyApLFxyXG4gICAgYmFzZUNvbG9yOiAncHVycGxlJyxcclxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgIHhNYXJnaW46IDIwLFxyXG4gICAgeU1hcmdpbjogMjAsXHJcbiAgICB4Q29udGVudE9mZnNldDogOCxcclxuICAgIHlDb250ZW50T2Zmc2V0OiAxNVxyXG4gIH0gKTtcclxuXHJcbiAgLy8gVGVzdCBmb3IgYSBidXR0b24gd2l0aCBkaWZmZXJlbnQgcmFkaWkgZm9yIGVhY2ggY29ybmVyXHJcbiAgY29uc3QgY3VzdG9tQ29ybmVyc0J1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgIGJhc2VDb2xvcjogJ29yYW5nZScsXHJcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHksXHJcbiAgICBzaXplOiBuZXcgRGltZW5zaW9uMiggNTAsIDUwICksXHJcbiAgICBsZWZ0VG9wQ29ybmVyUmFkaXVzOiAyMCxcclxuICAgIHJpZ2h0VG9wQ29ybmVyUmFkaXVzOiAxMCxcclxuICAgIHJpZ2h0Qm90dG9tQ29ybmVyUmFkaXVzOiA1LFxyXG4gICAgbGVmdEJvdHRvbUNvcm5lclJhZGl1czogMCxcclxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2N1c3RvbUNvcm5lcnNCdXR0b24gZmlyZWQnIClcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IHBzZXVkbzNEQnV0dG9uc0JveCA9IG5ldyBIQm94KCB7XHJcbiAgICBjaGlsZHJlbjogWyBidXR0b25BLCBidXR0b25CLCBidXR0b25DLCBidXR0b25ELCBidXR0b25FLCBidXR0b25GLCBjdXN0b21Db3JuZXJzQnV0dG9uIF0sXHJcbiAgICBzcGFjaW5nOiAxMFxyXG4gIH0gKTtcclxuXHJcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEZsYXQgYnV0dG9ucyBsYWJlbGVkIDEsIDIsIDMsIDRcclxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGNvbnN0IGJ1dHRvbjEgPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XHJcbiAgICBjb250ZW50OiBuZXcgVGV4dCggJy0tIDEgLS0nLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKSxcclxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2J1dHRvbjEgZmlyZWQnICksXHJcbiAgICBiYXNlQ29sb3I6ICdyZ2IoIDIwNCwgMTAyLCAyMDQgKScsXHJcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHksXHJcbiAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3k6IEJ1dHRvbk5vZGUuRmxhdEFwcGVhcmFuY2VTdHJhdGVneVxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgYnV0dG9uMiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnLS0gMiAtLScsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxyXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnYnV0dG9uMiBmaXJlZCcgKSxcclxuICAgIGJhc2VDb2xvcjogJyNBMEQwMjInLFxyXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5OiBCdXR0b25Ob2RlLkZsYXRBcHBlYXJhbmNlU3RyYXRlZ3ksXHJcbiAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICBzdHJva2U6ICcjMjAyMDIwJ1xyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgYnV0dG9uMyA9IG5ldyBSb3VuZFB1c2hCdXR0b24oIHtcclxuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnLSAzIC0nLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKSxcclxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2J1dHRvbjMgZmlyZWQnICksXHJcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHksXHJcbiAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3k6IEJ1dHRvbk5vZGUuRmxhdEFwcGVhcmFuY2VTdHJhdGVneVxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgYnV0dG9uNCA9IG5ldyBSb3VuZFB1c2hCdXR0b24oIHtcclxuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnLS0gNCAtLScsIHsgZm9udDogQlVUVE9OX0ZPTlQsIGZpbGw6ICd3aGl0ZScgfSApLFxyXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnYnV0dG9uNCBmaXJlZCcgKSxcclxuICAgIGJhc2VDb2xvcjogJyNDQzMzMDAnLFxyXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5OiBCdXR0b25Ob2RlLkZsYXRBcHBlYXJhbmNlU3RyYXRlZ3lcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGZsYXRCdXR0b25zQm94ID0gbmV3IEhCb3goIHtcclxuICAgIGNoaWxkcmVuOiBbIGJ1dHRvbjEsIGJ1dHRvbjIsIGJ1dHRvbjMsIGJ1dHRvbjQgXSxcclxuICAgIHNwYWNpbmc6IDEwXHJcbiAgfSApO1xyXG5cclxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRmlyZSEgR28hIEhlbHAhIGJ1dHRvbnMgLSB0aGVzZSBkZW1vbnN0cmF0ZSBtb3JlIGNvbG9ycyBhbmQgc2l6ZXMgb2YgYnV0dG9uc1xyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgZmlyZUJ1dHRvbiA9IG5ldyBSb3VuZFB1c2hCdXR0b24oIHtcclxuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnRmlyZSEnLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKSxcclxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2ZpcmVCdXR0b24gZmlyZWQnICksXHJcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHksXHJcbiAgICBiYXNlQ29sb3I6ICdvcmFuZ2UnLFxyXG4gICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgbGluZVdpZHRoOiAwLjVcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGdvQnV0dG9uID0gbmV3IFJvdW5kUHVzaEJ1dHRvbigge1xyXG4gICAgY29udGVudDogbmV3IFRleHQoICdHbyEnLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKSxcclxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2dvQnV0dG9uIGZpcmVkJyApLFxyXG4gICAgYmFzZUNvbG9yOiBuZXcgQ29sb3IoIDAsIDE2MywgMCApLFxyXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5XHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBoZWxwQnV0dG9uID0gbmV3IFJvdW5kUHVzaEJ1dHRvbigge1xyXG4gICAgY29udGVudDogbmV3IFRleHQoICdIZWxwJywgeyBmb250OiBCVVRUT05fRk9OVCB9ICksXHJcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdoZWxwQnV0dG9uIGZpcmVkJyApLFxyXG4gICAgYmFzZUNvbG9yOiBuZXcgQ29sb3IoIDI0NCwgMTU0LCAxOTQgKSxcclxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eVxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3QgYWN0aW9uQnV0dG9uc0JveCA9IG5ldyBIQm94KCB7XHJcbiAgICBjaGlsZHJlbjogWyBmaXJlQnV0dG9uLCBnb0J1dHRvbiwgaGVscEJ1dHRvbiBdLFxyXG4gICAgc3BhY2luZzogMTVcclxuICB9ICk7XHJcblxyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBCdXR0b25zIHdpdGggZmlyZS1vbi1ob2xkIHR1cm5lZCBvblxyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgZmlyZVF1aWNrbHlXaGVuSGVsZEJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnUHJlc3MgYW5kIGhvbGQgdG8gdGVzdCAoZmFzdCBmaXJlKScsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxyXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnZmlyZVF1aWNrbHlXaGVuSGVsZEJ1dHRvbiBmaXJlZCcgKSxcclxuICAgIGJhc2VDb2xvcjogbmV3IENvbG9yKCAxMTQsIDEzMiwgNjIgKSxcclxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgIGZpcmVPbkhvbGQ6IHRydWUsXHJcbiAgICBmaXJlT25Ib2xkRGVsYXk6IDEwMCxcclxuICAgIGZpcmVPbkhvbGRJbnRlcnZhbDogNTBcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGZpcmVTbG93bHlXaGVuSGVsZEJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnUHJlc3MgYW5kIGhvbGQgdG8gdGVzdCAoc2xvdyBmaXJlKScsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxyXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnZmlyZVNsb3dseVdoZW5IZWxkQnV0dG9uIGZpcmVkJyApLFxyXG4gICAgYmFzZUNvbG9yOiBuZXcgQ29sb3IoIDE0NywgOTIsIDEyMCApLFxyXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgZmlyZU9uSG9sZDogdHJ1ZSxcclxuICAgIGZpcmVPbkhvbGREZWxheTogNjAwLFxyXG4gICAgZmlyZU9uSG9sZEludGVydmFsOiAzMDAsXHJcbiAgICB0b3A6IGZpcmVRdWlja2x5V2hlbkhlbGRCdXR0b24uYm90dG9tICsgMTBcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGhlbGRCdXR0b25zQm94ID0gbmV3IFZCb3goIHtcclxuICAgIGNoaWxkcmVuOiBbIGZpcmVRdWlja2x5V2hlbkhlbGRCdXR0b24sIGZpcmVTbG93bHlXaGVuSGVsZEJ1dHRvbiBdLFxyXG4gICAgc3BhY2luZzogMTAsXHJcbiAgICBhbGlnbjogJ2xlZnQnXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCB1cHBlckxlZnRBbGlnblRleHROb2RlID0gbmV3IFRleHQoICd1cHBlciBsZWZ0IGFsaWduIHRlc3QnLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKTtcclxuICBjb25zdCB1cHBlckxlZnRDb250ZW50QnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xyXG4gICAgY29udGVudDogdXBwZXJMZWZ0QWxpZ25UZXh0Tm9kZSxcclxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ3VwcGVyTGVmdENvbnRlbnRCdXR0b24gZmlyZWQnICksXHJcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHksXHJcbiAgICB4QWxpZ246ICdsZWZ0JyxcclxuICAgIHlBbGlnbjogJ3RvcCcsXHJcbiAgICBtaW5XaWR0aDogdXBwZXJMZWZ0QWxpZ25UZXh0Tm9kZS53aWR0aCAqIDEuNSxcclxuICAgIG1pbkhlaWdodDogdXBwZXJMZWZ0QWxpZ25UZXh0Tm9kZS5oZWlnaHQgKiAyXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBsb3dlclJpZ2h0QWxpZ25UZXh0Tm9kZSA9IG5ldyBUZXh0KCAnbG93ZXIgcmlnaHQgYWxpZ24gdGVzdCcsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApO1xyXG4gIGNvbnN0IGxvd2VyUmlnaHRDb250ZW50QnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xyXG4gICAgY29udGVudDogbG93ZXJSaWdodEFsaWduVGV4dE5vZGUsXHJcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdsb3dlclJpZ2h0Q29udGVudEJ1dHRvbiBmaXJlZCcgKSxcclxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgIHhBbGlnbjogJ3JpZ2h0JyxcclxuICAgIHlBbGlnbjogJ2JvdHRvbScsXHJcbiAgICBtaW5XaWR0aDogbG93ZXJSaWdodEFsaWduVGV4dE5vZGUud2lkdGggKiAxLjUsXHJcbiAgICBtaW5IZWlnaHQ6IGxvd2VyUmlnaHRBbGlnblRleHROb2RlLmhlaWdodCAqIDIsXHJcbiAgICB0b3A6IHVwcGVyTGVmdENvbnRlbnRCdXR0b24uaGVpZ2h0ICsgMTBcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGFsaWduVGV4dEJ1dHRvbnNCb3ggPSBuZXcgVkJveCgge1xyXG4gICAgY2hpbGRyZW46IFsgdXBwZXJMZWZ0Q29udGVudEJ1dHRvbiwgbG93ZXJSaWdodENvbnRlbnRCdXR0b24gXSxcclxuICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgYWxpZ246ICdsZWZ0J1xyXG4gIH0gKTtcclxuXHJcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIE1pc2NlbGxhbmVvdXMgb3RoZXIgYnV0dG9uIGV4YW1wbGVzXHJcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCBmaXJlT25Eb3duQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xyXG4gICAgY29udGVudDogbmV3IFRleHQoICdGaXJlIG9uIERvd24nLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKSxcclxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ2ZpcmVPbkRvd25CdXR0b24gZmlyZWQnICksXHJcbiAgICBiYXNlQ29sb3I6IG5ldyBDb2xvciggMjU1LCAyNTUsIDYxICksXHJcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHksXHJcbiAgICBmaXJlT25Eb3duOiB0cnVlLFxyXG4gICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgbGluZVdpZHRoOiAxXHJcbiAgfSApO1xyXG5cclxuICAvLyB0cmFuc3BhcmVudCBidXR0b24gd2l0aCBzb21ldGhpbmcgYmVoaW5kIGl0XHJcbiAgY29uc3QgcmVjdGFuZ2xlTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDI1LCAxMDAsIHsgZmlsbDogJ3JlZCcgfSApO1xyXG4gIGNvbnN0IHRyYW5zcGFyZW50QWxwaGFCdXR0b24gPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XHJcbiAgICBjb250ZW50OiBuZXcgVGV4dCggJ1RyYW5zcGFyZW50IEJ1dHRvbiB2aWEgYWxwaGEnLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKSxcclxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ3RyYW5zcGFyZW50QWxwaGFCdXR0b24gZmlyZWQnICksXHJcbiAgICBiYXNlQ29sb3I6IG5ldyBDb2xvciggMjU1LCAyNTUsIDAsIDAuNyApLFxyXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgY2VudGVyWDogcmVjdGFuZ2xlTm9kZS5jZW50ZXJYLFxyXG4gICAgdG9wOiByZWN0YW5nbGVOb2RlLnRvcCArIDEwXHJcbiAgfSApO1xyXG4gIGNvbnN0IHRyYW5zcGFyZW50T3BhY2l0eUJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnVHJhbnNwYXJlbnQgQnV0dG9uIHZpYSBvcGFjaXR5JywgeyBmb250OiBCVVRUT05fRk9OVCB9ICksXHJcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICd0cmFuc3BhcmVudE9wYWNpdHlCdXR0b24gZmlyZWQnICksXHJcbiAgICBiYXNlQ29sb3I6IG5ldyBDb2xvciggMjU1LCAyNTUsIDAgKSxcclxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgIG9wYWNpdHk6IDAuNixcclxuICAgIGNlbnRlclg6IHJlY3RhbmdsZU5vZGUuY2VudGVyWCxcclxuICAgIGJvdHRvbTogcmVjdGFuZ2xlTm9kZS5ib3R0b20gLSAxMFxyXG4gIH0gKTtcclxuICBjb25zdCB0cmFuc3BhcmVudFBhcmVudCA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIHJlY3RhbmdsZU5vZGUsIHRyYW5zcGFyZW50QWxwaGFCdXR0b24sIHRyYW5zcGFyZW50T3BhY2l0eUJ1dHRvbiBdIH0gKTtcclxuXHJcbiAgY29uc3QgYXJyb3dCdXR0b24gPSBuZXcgQXJyb3dCdXR0b24oICdsZWZ0JywgKCkgPT4gY29uc29sZS5sb2coICdhcnJvd0J1dHRvbiBmaXJlZCcgKSwge1xyXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5XHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBjYXJvdXNlbEJ1dHRvbiA9IG5ldyBDYXJvdXNlbEJ1dHRvbigge1xyXG4gICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnY2Fyb3VzZWxCdXR0b24gZmlyZWQnICksXHJcbiAgICBlbmFibGVkUHJvcGVydHk6IGJ1dHRvbnNFbmFibGVkUHJvcGVydHlcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IG1pc2NCdXR0b25zQm94ID0gbmV3IEhCb3goIHtcclxuICAgIGNoaWxkcmVuOiBbIGZpcmVPbkRvd25CdXR0b24sIHRyYW5zcGFyZW50UGFyZW50LCBhcnJvd0J1dHRvbiwgY2Fyb3VzZWxCdXR0b24gXSxcclxuICAgIHNwYWNpbmc6IDE1XHJcbiAgfSApO1xyXG5cclxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gVGVzdCB0aGUgMiB3YXlzIG9mIHNwZWNpZnlpbmcgYSBidXR0b24ncyBzaXplOlxyXG4gIC8vICgxKSBJZiB5b3UgcHJvdmlkZSBzaXplIG9mIHRoZSBidXR0b24sIGNvbnRlbnQgaXMgc2l6ZWQgdG8gZml0IHRoZSBidXR0b24uXHJcbiAgLy8gKDIpIElmIHlvdSBkb24ndCBwcm92aWRlIHNpemUsIHRoZSBidXR0b24gaXMgc2l6ZWQgdG8gZml0IHRoZSBjb250ZW50LlxyXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy82NTdcclxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIC8vIFRoaXMgYnV0dG9uJ3Mgc3Ryb2tlIHdpbGwgbG9vayB0aGlja2VyLCBiZWNhdXNlIGNvbnRlbnQgd2lsbCBiZSBzY2FsZWQgdXAuXHJcbiAgY29uc3Qgcm91bmRCdXR0b25XaXRoRXhwbGljaXRTaXplID0gbmV3IFJvdW5kUHVzaEJ1dHRvbigge1xyXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgcmFkaXVzOiAyNSxcclxuICAgIGNvbnRlbnQ6IG5ldyBDaXJjbGUoIDUsIHsgZmlsbDogJ3JlZCcsIHN0cm9rZTogJ2JsYWNrJyB9ICksXHJcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdyb3VuZEJ1dHRvbldpdGhFeHBsaWNpdFNpemUgcHJlc3NlZCcgKSxcclxuICAgIHhNYXJnaW46IDUsXHJcbiAgICB5TWFyZ2luOiA1XHJcbiAgfSApO1xyXG5cclxuICAvLyBUaGlzIGJ1dHRvbidzIGNvbnRlbnQgd2lsbCBsb29rIGFzIHNwZWNpZmllZCwgYmVjYXVzZSBidXR0b24gaXMgc2l6ZWQgdG8gZml0IHRoZSBjb250ZW50LlxyXG4gIGNvbnN0IHJvdW5kQnV0dG9uV2l0aERlcml2ZWRTaXplID0gbmV3IFJvdW5kUHVzaEJ1dHRvbigge1xyXG4gICAgZW5hYmxlZFByb3BlcnR5OiBidXR0b25zRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgY29udGVudDogbmV3IENpcmNsZSggMjAsIHsgZmlsbDogJ3JlZCcsIHN0cm9rZTogJ2JsYWNrJyB9ICksXHJcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdyb3VuZEJ1dHRvbldpdGhEZXJpdmVkU2l6ZSBwcmVzc2VkJyApLFxyXG4gICAgeE1hcmdpbjogNSxcclxuICAgIHlNYXJnaW46IDVcclxuICB9ICk7XHJcblxyXG4gIC8vIFRoZSB0b3RhbCBzaXplIG9mIHRoaXMgb25lLCBzaG91bGQgYmUgdGhlIHNhbWUgYXMgdGhlIGNvbnRlbnQgb2YgdGhlIG9uZSBiZWxvdy4gVGhpcyBidXR0b24ncyBzdHJva2Ugd2lsbCBsb29rXHJcbiAgLy8gdGhpY2tlciwgYmVjYXVzZSBjb250ZW50IHdpbGwgYmUgc2NhbGVkIHVwLlxyXG4gIGNvbnN0IHJlY3Rhbmd1bGFyQnV0dG9uV2l0aEV4cGxpY2l0U2l6ZSA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgIHNpemU6IG5ldyBEaW1lbnNpb24yKCA0MCwgMjUgKSxcclxuICAgIGNvbnRlbnQ6IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDUsIDMsIHsgZmlsbDogJ3JlZCcsIHN0cm9rZTogJ2JsYWNrJyB9ICksXHJcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdyZWN0YW5ndWxhckJ1dHRvbldpdGhFeHBsaWNpdFNpemUgcHJlc3NlZCcgKSxcclxuICAgIHhNYXJnaW46IDUsXHJcbiAgICB5TWFyZ2luOiA1XHJcbiAgfSApO1xyXG5cclxuICAvLyBUaGlzIGJ1dHRvbidzIGNvbnRlbnQgd2lsbCBsb29rIGFzIHNwZWNpZmllZCwgYmVjYXVzZSBidXR0b24gaXMgc2l6ZWQgdG8gZml0IGFyb3VuZCB0aGUgY29udGVudC5cclxuICBjb25zdCByZWN0YW5ndWxhckJ1dHRvbldpdGhEZXJpdmVkU2l6ZSA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgIGNvbnRlbnQ6IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDQwLCAyNSwgeyBmaWxsOiAnYmx1ZScsIHN0cm9rZTogJ2JsYWNrJyB9ICksXHJcbiAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdyZWN0YW5ndWxhckJ1dHRvbldpdGhEZXJpdmVkU2l6ZSBwcmVzc2VkJyApLFxyXG4gICAgeE1hcmdpbjogNSxcclxuICAgIHlNYXJnaW46IDVcclxuICB9ICk7XHJcblxyXG4gIGNvbnN0IGJ1dHRvblNpemVEZW1vcyA9IG5ldyBIQm94KCB7XHJcbiAgICBzcGFjaW5nOiAyMCxcclxuICAgIGNoaWxkcmVuOiBbIHJlY3Rhbmd1bGFyQnV0dG9uV2l0aEV4cGxpY2l0U2l6ZSxcclxuICAgICAgcmVjdGFuZ3VsYXJCdXR0b25XaXRoRGVyaXZlZFNpemUsXHJcbiAgICAgIHJvdW5kQnV0dG9uV2l0aEV4cGxpY2l0U2l6ZSxcclxuICAgICAgcm91bmRCdXR0b25XaXRoRGVyaXZlZFNpemVcclxuICAgIF1cclxuICB9ICk7XHJcblxyXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBEZW1vbnN0cmF0ZSBkeW5hbWljIGNvbG9ycyBmb3Igc29tZSBidXR0b25zXHJcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvLyBDaGFuZ2UgY29sb3JzIG9mIGFsbCBidXR0b25zIGluIHBzZXVkbzNEQnV0dG9uc0JveFxyXG4gIGNvbnN0IGNoYW5nZUJ1dHRvbkNvbG9yc0J1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgIGVuYWJsZWRQcm9wZXJ0eTogYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnXFx1MjFlNiBDaGFuZ2UgYnV0dG9uIGNvbG9ycycsIHsgZm9udDogQlVUVE9OX0ZPTlQgfSApLFxyXG4gICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coICdjaGFuZ2VCdXR0b25Db2xvcnNCdXR0b24gZmlyZWQnICk7XHJcbiAgICAgIHBzZXVkbzNEQnV0dG9uc0JveC5jaGlsZHJlbi5mb3JFYWNoKCBjaGlsZCA9PiB7XHJcbiAgICAgICAgaWYgKCBjaGlsZCBpbnN0YW5jZW9mIEJ1dHRvbk5vZGUgKSB7XHJcbiAgICAgICAgICBjaGlsZC5iYXNlQ29sb3IgPSBuZXcgQ29sb3IoXHJcbiAgICAgICAgICAgIGRvdFJhbmRvbS5uZXh0RG91YmxlQmV0d2VlbiggMCwgMjU1ICksXHJcbiAgICAgICAgICAgIGRvdFJhbmRvbS5uZXh0RG91YmxlQmV0d2VlbiggMCwgMjU1ICksXHJcbiAgICAgICAgICAgIGRvdFJhbmRvbS5uZXh0RG91YmxlQmV0d2VlbiggMCwgMjU1IClcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gTGF5b3V0XHJcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCB4U3BhY2luZyA9IDUwO1xyXG4gIHJldHVybiBuZXcgVkJveCgge1xyXG4gICAgc3BhY2luZzogMTUsXHJcbiAgICBjaGlsZHJlbjogW1xyXG4gICAgICBuZXcgSEJveCggeyBzcGFjaW5nOiB4U3BhY2luZywgY2hpbGRyZW46IFsgcHNldWRvM0RCdXR0b25zQm94LCBjaGFuZ2VCdXR0b25Db2xvcnNCdXR0b24gXSB9ICksXHJcbiAgICAgIG5ldyBIQm94KCB7IHNwYWNpbmc6IHhTcGFjaW5nLCBjaGlsZHJlbjogWyBmbGF0QnV0dG9uc0JveCwgYWN0aW9uQnV0dG9uc0JveCBdIH0gKSxcclxuICAgICAgbmV3IEhCb3goIHsgc3BhY2luZzogeFNwYWNpbmcsIGNoaWxkcmVuOiBbIGhlbGRCdXR0b25zQm94LCBhbGlnblRleHRCdXR0b25zQm94IF0gfSApLFxyXG4gICAgICBtaXNjQnV0dG9uc0JveCxcclxuICAgICAgYnV0dG9uU2l6ZURlbW9zLFxyXG4gICAgICBuZXcgVlN0cnV0KCAyNSApLFxyXG4gICAgICBidXR0b25zRW5hYmxlZENoZWNrYm94XHJcbiAgICBdLFxyXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXHJcbiAgfSApO1xyXG59Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxtQkFBbUI7QUFDeEMsT0FBT0MscUJBQXFCLE1BQU0sd0NBQXdD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