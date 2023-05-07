// Copyright 2017-2021, University of Colorado Boulder

/**
 * Constants for Area Model simulations
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../dot/js/Vector2.js';
import MathSymbolFont from '../../../scenery-phet/js/MathSymbolFont.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import areaModelCommon from '../areaModelCommon.js';
import OrientationPair from './model/OrientationPair.js';

// constants
const LARGE_PARTIAL_PRODUCT_FONT_SIZE = 19;
const NORMAL_EDIT_FONT_SIZE = 18;
const AreaModelCommonConstants = {
  // {PhetFont} All fonts
  FACTORS_TERM_FONT: new PhetFont(36),
  // Terms/numbers in the factors box
  FACTORS_PAREN_FONT: new PhetFont(40),
  // Parentheses in the factors box
  CALCULATION_X_FONT: new PhetFont(16),
  CALCULATION_PAREN_FONT: new PhetFont(16),
  CALCULATION_DOT_FONT: new PhetFont({
    size: 16,
    weight: 'bold'
  }),
  CALCULATION_TERM_FONT: new PhetFont(16),
  TITLE_FONT: new PhetFont(18),
  TOTAL_AREA_LABEL_FONT: new PhetFont(30),
  TOTAL_AREA_VALUE_FONT: new PhetFont({
    size: 30,
    weight: 'bold'
  }),
  SYMBOL_FONT: new PhetFont(20),
  PARTIAL_PRODUCT_FONT: new PhetFont(LARGE_PARTIAL_PRODUCT_FONT_SIZE),
  PARTIAL_FACTOR_FONT: new PhetFont(14),
  TERM_EDIT_READOUT_FONT: new PhetFont(NORMAL_EDIT_FONT_SIZE),
  POLYNOMIAL_EDIT_READOUT_FONT: new PhetFont(NORMAL_EDIT_FONT_SIZE),
  PROPORTIONAL_PARTITION_READOUT_FONT: new PhetFont({
    size: NORMAL_EDIT_FONT_SIZE,
    weight: 'bold'
  }),
  TOTAL_SIZE_READOUT_FONT: new PhetFont({
    size: 22,
    weight: 'bold'
  }),
  KEYPAD_FONT: new PhetFont(20),
  KEYPAD_READOUT_FONT: new PhetFont(20),
  LAYOUT_FONT: new PhetFont(16),
  BUTTON_FONT: new PhetFont(20),
  SCORE_INCREASE_FONT: new PhetFont({
    size: 18,
    weight: 'bold'
  }),
  COUNTING_ICON_FONT: new PhetFont(22),
  COUNTING_FONT: new PhetFont(20),
  REWARD_NODE_FONT: new PhetFont({
    size: 35,
    weight: 'bold'
  }),
  GAME_MAIN_LABEL_FONT: new PhetFont({
    size: NORMAL_EDIT_FONT_SIZE,
    weight: 'bold'
  }),
  GAME_MAIN_EDIT_FONT: new PhetFont(NORMAL_EDIT_FONT_SIZE),
  GAME_PARTIAL_PRODUCT_LABEL_FONT: new PhetFont({
    size: LARGE_PARTIAL_PRODUCT_FONT_SIZE,
    weight: 'bold'
  }),
  GAME_PARTIAL_PRODUCT_EDIT_FONT: new PhetFont(LARGE_PARTIAL_PRODUCT_FONT_SIZE),
  GAME_TOTAL_FONT: new PhetFont({
    size: 30,
    weight: 'bold'
  }),
  GAME_POLYNOMIAL_EDIT_FONT: new PhetFont({
    size: 22,
    weight: 'bold'
  }),
  GAME_STATUS_BAR_BOLD_FONT: new PhetFont({
    size: 18,
    weight: 'bold'
  }),
  GAME_STATUS_BAR_NON_BOLD_FONT: new PhetFont({
    size: 18
  }),
  GAME_STATUS_BAR_PROMPT_FONT: new PhetFont({
    size: 30,
    weight: 'bold'
  }),
  // {string} - The string to be provided to RichText for a mathematical-looking x
  X_VARIABLE_RICH_STRING: `<i style='font-family: ${new MathSymbolFont(10).family}'>x</i>`,
  // {number} Two different area sizes (they are square), one needed for the intro sim
  AREA_SIZE: 350,
  LARGE_AREA_SIZE: 450,
  // {Vector2} We need to place the areas in different positions depending on the screen
  MAIN_AREA_OFFSET: new Vector2(180, 80),
  LARGE_AREA_OFFSET: new Vector2(80, 80),
  GAME_AREA_OFFSET: new Vector2(180, 200),
  // {number} - Panel options
  LAYOUT_SPACING: 10,
  PANEL_CORNER_RADIUS: 5,
  PANEL_INTERIOR_MAX: 230,
  // Maximum width of the content inside the panels

  // {number} - Partition drag handle options
  PARTITION_HANDLE_OFFSET: 15,
  PARTITION_HANDLE_RADIUS: 10,
  // {number} - Relative positions (from 0 to 1) of where the generic partition lines should be
  GENERIC_SINGLE_OFFSET: 0.62,
  // if there is one line
  GENERIC_FIRST_OFFSET: 0.45,
  GENERIC_SECOND_OFFSET: 0.78,
  // {number} - Like the generic view, but for the icon
  GENERIC_ICON_SINGLE_OFFSET: 0.68,
  GENERIC_ICON_FIRST_OFFSET: 0.55,
  GENERIC_ICON_SECOND_OFFSET: 0.80,
  // {Vector2} - Offset vector from the upper-left of the area to the x,y position where the dimension line labels
  //             would intersect.
  PROPORTIONAL_RANGE_OFFSET: new Vector2(-35, -28),
  GENERIC_RANGE_OFFSET: new Vector2(-60, -40),
  // {number} - Space between the area and the keypad
  KEYPAD_LEFT_PADDING: 25,
  // {number} - Number of challenges per level
  NUM_CHALLENGES: 6,
  // {number} - The perfect score for a level
  PERFECT_SCORE: 12,
  // {number} - Padding in-between content and surrounding parentheses in the calculation area
  CALCULATION_PAREN_PADDING: 0,
  // {number} - Padding in-between an end parenthesis and start parenthese, e.g. between )(
  CALCULATION_PAREN_PAREN_PADDING: 0,
  // {number} - Padding around an x (used for multiplication)
  CALCULATION_X_PADDING: 3,
  // {number} - Padding around a dot (used for multiplication)
  CALCULATION_DOT_PADDING: 3,
  // {number} - Padding around most (binary) operations in the calculation
  CALCULATION_OP_PADDING: 5,
  // {number} - Padding between a term and an adjacent parenthesis, e.g. "x(" or ")x"
  CALCULATION_TERM_PAREN_PADDING: 1,
  // {OrientationPair.<number>} - The opposite-orientation offset to use for term edit nodes, e.g.
  // node[ orientation.opposite.coordinate ] = PARTITION_OFFSET.get( orientation )
  PARTITION_OFFSET: new OrientationPair(-20, -30),
  // {string} - The character we use as a generic decimal character to get an approximate width for numeric
  // representations.
  MEASURING_CHARACTER: '9'
};
areaModelCommon.register('AreaModelCommonConstants', AreaModelCommonConstants);
export default AreaModelCommonConstants;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiTWF0aFN5bWJvbEZvbnQiLCJQaGV0Rm9udCIsImFyZWFNb2RlbENvbW1vbiIsIk9yaWVudGF0aW9uUGFpciIsIkxBUkdFX1BBUlRJQUxfUFJPRFVDVF9GT05UX1NJWkUiLCJOT1JNQUxfRURJVF9GT05UX1NJWkUiLCJBcmVhTW9kZWxDb21tb25Db25zdGFudHMiLCJGQUNUT1JTX1RFUk1fRk9OVCIsIkZBQ1RPUlNfUEFSRU5fRk9OVCIsIkNBTENVTEFUSU9OX1hfRk9OVCIsIkNBTENVTEFUSU9OX1BBUkVOX0ZPTlQiLCJDQUxDVUxBVElPTl9ET1RfRk9OVCIsInNpemUiLCJ3ZWlnaHQiLCJDQUxDVUxBVElPTl9URVJNX0ZPTlQiLCJUSVRMRV9GT05UIiwiVE9UQUxfQVJFQV9MQUJFTF9GT05UIiwiVE9UQUxfQVJFQV9WQUxVRV9GT05UIiwiU1lNQk9MX0ZPTlQiLCJQQVJUSUFMX1BST0RVQ1RfRk9OVCIsIlBBUlRJQUxfRkFDVE9SX0ZPTlQiLCJURVJNX0VESVRfUkVBRE9VVF9GT05UIiwiUE9MWU5PTUlBTF9FRElUX1JFQURPVVRfRk9OVCIsIlBST1BPUlRJT05BTF9QQVJUSVRJT05fUkVBRE9VVF9GT05UIiwiVE9UQUxfU0laRV9SRUFET1VUX0ZPTlQiLCJLRVlQQURfRk9OVCIsIktFWVBBRF9SRUFET1VUX0ZPTlQiLCJMQVlPVVRfRk9OVCIsIkJVVFRPTl9GT05UIiwiU0NPUkVfSU5DUkVBU0VfRk9OVCIsIkNPVU5USU5HX0lDT05fRk9OVCIsIkNPVU5USU5HX0ZPTlQiLCJSRVdBUkRfTk9ERV9GT05UIiwiR0FNRV9NQUlOX0xBQkVMX0ZPTlQiLCJHQU1FX01BSU5fRURJVF9GT05UIiwiR0FNRV9QQVJUSUFMX1BST0RVQ1RfTEFCRUxfRk9OVCIsIkdBTUVfUEFSVElBTF9QUk9EVUNUX0VESVRfRk9OVCIsIkdBTUVfVE9UQUxfRk9OVCIsIkdBTUVfUE9MWU5PTUlBTF9FRElUX0ZPTlQiLCJHQU1FX1NUQVRVU19CQVJfQk9MRF9GT05UIiwiR0FNRV9TVEFUVVNfQkFSX05PTl9CT0xEX0ZPTlQiLCJHQU1FX1NUQVRVU19CQVJfUFJPTVBUX0ZPTlQiLCJYX1ZBUklBQkxFX1JJQ0hfU1RSSU5HIiwiZmFtaWx5IiwiQVJFQV9TSVpFIiwiTEFSR0VfQVJFQV9TSVpFIiwiTUFJTl9BUkVBX09GRlNFVCIsIkxBUkdFX0FSRUFfT0ZGU0VUIiwiR0FNRV9BUkVBX09GRlNFVCIsIkxBWU9VVF9TUEFDSU5HIiwiUEFORUxfQ09STkVSX1JBRElVUyIsIlBBTkVMX0lOVEVSSU9SX01BWCIsIlBBUlRJVElPTl9IQU5ETEVfT0ZGU0VUIiwiUEFSVElUSU9OX0hBTkRMRV9SQURJVVMiLCJHRU5FUklDX1NJTkdMRV9PRkZTRVQiLCJHRU5FUklDX0ZJUlNUX09GRlNFVCIsIkdFTkVSSUNfU0VDT05EX09GRlNFVCIsIkdFTkVSSUNfSUNPTl9TSU5HTEVfT0ZGU0VUIiwiR0VORVJJQ19JQ09OX0ZJUlNUX09GRlNFVCIsIkdFTkVSSUNfSUNPTl9TRUNPTkRfT0ZGU0VUIiwiUFJPUE9SVElPTkFMX1JBTkdFX09GRlNFVCIsIkdFTkVSSUNfUkFOR0VfT0ZGU0VUIiwiS0VZUEFEX0xFRlRfUEFERElORyIsIk5VTV9DSEFMTEVOR0VTIiwiUEVSRkVDVF9TQ09SRSIsIkNBTENVTEFUSU9OX1BBUkVOX1BBRERJTkciLCJDQUxDVUxBVElPTl9QQVJFTl9QQVJFTl9QQURESU5HIiwiQ0FMQ1VMQVRJT05fWF9QQURESU5HIiwiQ0FMQ1VMQVRJT05fRE9UX1BBRERJTkciLCJDQUxDVUxBVElPTl9PUF9QQURESU5HIiwiQ0FMQ1VMQVRJT05fVEVSTV9QQVJFTl9QQURESU5HIiwiUEFSVElUSU9OX09GRlNFVCIsIk1FQVNVUklOR19DSEFSQUNURVIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb25zdGFudHMgZm9yIEFyZWEgTW9kZWwgc2ltdWxhdGlvbnNcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xGb250IGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9sRm9udC5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgYXJlYU1vZGVsQ29tbW9uIGZyb20gJy4uL2FyZWFNb2RlbENvbW1vbi5qcyc7XHJcbmltcG9ydCBPcmllbnRhdGlvblBhaXIgZnJvbSAnLi9tb2RlbC9PcmllbnRhdGlvblBhaXIuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IExBUkdFX1BBUlRJQUxfUFJPRFVDVF9GT05UX1NJWkUgPSAxOTtcclxuY29uc3QgTk9STUFMX0VESVRfRk9OVF9TSVpFID0gMTg7XHJcblxyXG5jb25zdCBBcmVhTW9kZWxDb21tb25Db25zdGFudHMgPSB7XHJcblxyXG4gIC8vIHtQaGV0Rm9udH0gQWxsIGZvbnRzXHJcbiAgRkFDVE9SU19URVJNX0ZPTlQ6IG5ldyBQaGV0Rm9udCggMzYgKSwgLy8gVGVybXMvbnVtYmVycyBpbiB0aGUgZmFjdG9ycyBib3hcclxuICBGQUNUT1JTX1BBUkVOX0ZPTlQ6IG5ldyBQaGV0Rm9udCggNDAgKSwgLy8gUGFyZW50aGVzZXMgaW4gdGhlIGZhY3RvcnMgYm94XHJcbiAgQ0FMQ1VMQVRJT05fWF9GT05UOiBuZXcgUGhldEZvbnQoIDE2ICksXHJcbiAgQ0FMQ1VMQVRJT05fUEFSRU5fRk9OVDogbmV3IFBoZXRGb250KCAxNiApLFxyXG4gIENBTENVTEFUSU9OX0RPVF9GT05UOiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTYsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICBDQUxDVUxBVElPTl9URVJNX0ZPTlQ6IG5ldyBQaGV0Rm9udCggMTYgKSxcclxuICBUSVRMRV9GT05UOiBuZXcgUGhldEZvbnQoIDE4ICksXHJcbiAgVE9UQUxfQVJFQV9MQUJFTF9GT05UOiBuZXcgUGhldEZvbnQoIDMwICksXHJcbiAgVE9UQUxfQVJFQV9WQUxVRV9GT05UOiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMzAsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICBTWU1CT0xfRk9OVDogbmV3IFBoZXRGb250KCAyMCApLFxyXG4gIFBBUlRJQUxfUFJPRFVDVF9GT05UOiBuZXcgUGhldEZvbnQoIExBUkdFX1BBUlRJQUxfUFJPRFVDVF9GT05UX1NJWkUgKSxcclxuICBQQVJUSUFMX0ZBQ1RPUl9GT05UOiBuZXcgUGhldEZvbnQoIDE0ICksXHJcbiAgVEVSTV9FRElUX1JFQURPVVRfRk9OVDogbmV3IFBoZXRGb250KCBOT1JNQUxfRURJVF9GT05UX1NJWkUgKSxcclxuICBQT0xZTk9NSUFMX0VESVRfUkVBRE9VVF9GT05UOiBuZXcgUGhldEZvbnQoIE5PUk1BTF9FRElUX0ZPTlRfU0laRSApLFxyXG4gIFBST1BPUlRJT05BTF9QQVJUSVRJT05fUkVBRE9VVF9GT05UOiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogTk9STUFMX0VESVRfRk9OVF9TSVpFLCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgVE9UQUxfU0laRV9SRUFET1VUX0ZPTlQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyMiwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gIEtFWVBBRF9GT05UOiBuZXcgUGhldEZvbnQoIDIwICksXHJcbiAgS0VZUEFEX1JFQURPVVRfRk9OVDogbmV3IFBoZXRGb250KCAyMCApLFxyXG4gIExBWU9VVF9GT05UOiBuZXcgUGhldEZvbnQoIDE2ICksXHJcbiAgQlVUVE9OX0ZPTlQ6IG5ldyBQaGV0Rm9udCggMjAgKSxcclxuICBTQ09SRV9JTkNSRUFTRV9GT05UOiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTgsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICBDT1VOVElOR19JQ09OX0ZPTlQ6IG5ldyBQaGV0Rm9udCggMjIgKSxcclxuICBDT1VOVElOR19GT05UOiBuZXcgUGhldEZvbnQoIDIwICksXHJcbiAgUkVXQVJEX05PREVfRk9OVDogbmV3IFBoZXRGb250KCB7IHNpemU6IDM1LCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgR0FNRV9NQUlOX0xBQkVMX0ZPTlQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiBOT1JNQUxfRURJVF9GT05UX1NJWkUsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICBHQU1FX01BSU5fRURJVF9GT05UOiBuZXcgUGhldEZvbnQoIE5PUk1BTF9FRElUX0ZPTlRfU0laRSApLFxyXG4gIEdBTUVfUEFSVElBTF9QUk9EVUNUX0xBQkVMX0ZPTlQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiBMQVJHRV9QQVJUSUFMX1BST0RVQ1RfRk9OVF9TSVpFLCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgR0FNRV9QQVJUSUFMX1BST0RVQ1RfRURJVF9GT05UOiBuZXcgUGhldEZvbnQoIExBUkdFX1BBUlRJQUxfUFJPRFVDVF9GT05UX1NJWkUgKSxcclxuICBHQU1FX1RPVEFMX0ZPTlQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAzMCwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gIEdBTUVfUE9MWU5PTUlBTF9FRElUX0ZPTlQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyMiwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gIEdBTUVfU1RBVFVTX0JBUl9CT0xEX0ZPTlQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxOCwgd2VpZ2h0OiAnYm9sZCcgfSApLFxyXG4gIEdBTUVfU1RBVFVTX0JBUl9OT05fQk9MRF9GT05UOiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTggfSApLFxyXG4gIEdBTUVfU1RBVFVTX0JBUl9QUk9NUFRfRk9OVDogbmV3IFBoZXRGb250KCB7IHNpemU6IDMwLCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcblxyXG4gIC8vIHtzdHJpbmd9IC0gVGhlIHN0cmluZyB0byBiZSBwcm92aWRlZCB0byBSaWNoVGV4dCBmb3IgYSBtYXRoZW1hdGljYWwtbG9va2luZyB4XHJcbiAgWF9WQVJJQUJMRV9SSUNIX1NUUklORzogYDxpIHN0eWxlPSdmb250LWZhbWlseTogJHtuZXcgTWF0aFN5bWJvbEZvbnQoIDEwICkuZmFtaWx5fSc+eDwvaT5gLFxyXG5cclxuICAvLyB7bnVtYmVyfSBUd28gZGlmZmVyZW50IGFyZWEgc2l6ZXMgKHRoZXkgYXJlIHNxdWFyZSksIG9uZSBuZWVkZWQgZm9yIHRoZSBpbnRybyBzaW1cclxuICBBUkVBX1NJWkU6IDM1MCxcclxuICBMQVJHRV9BUkVBX1NJWkU6IDQ1MCxcclxuXHJcbiAgLy8ge1ZlY3RvcjJ9IFdlIG5lZWQgdG8gcGxhY2UgdGhlIGFyZWFzIGluIGRpZmZlcmVudCBwb3NpdGlvbnMgZGVwZW5kaW5nIG9uIHRoZSBzY3JlZW5cclxuICBNQUlOX0FSRUFfT0ZGU0VUOiBuZXcgVmVjdG9yMiggMTgwLCA4MCApLFxyXG4gIExBUkdFX0FSRUFfT0ZGU0VUOiBuZXcgVmVjdG9yMiggODAsIDgwICksXHJcbiAgR0FNRV9BUkVBX09GRlNFVDogbmV3IFZlY3RvcjIoIDE4MCwgMjAwICksXHJcblxyXG4gIC8vIHtudW1iZXJ9IC0gUGFuZWwgb3B0aW9uc1xyXG4gIExBWU9VVF9TUEFDSU5HOiAxMCxcclxuICBQQU5FTF9DT1JORVJfUkFESVVTOiA1LFxyXG4gIFBBTkVMX0lOVEVSSU9SX01BWDogMjMwLCAvLyBNYXhpbXVtIHdpZHRoIG9mIHRoZSBjb250ZW50IGluc2lkZSB0aGUgcGFuZWxzXHJcblxyXG4gIC8vIHtudW1iZXJ9IC0gUGFydGl0aW9uIGRyYWcgaGFuZGxlIG9wdGlvbnNcclxuICBQQVJUSVRJT05fSEFORExFX09GRlNFVDogMTUsXHJcbiAgUEFSVElUSU9OX0hBTkRMRV9SQURJVVM6IDEwLFxyXG5cclxuICAvLyB7bnVtYmVyfSAtIFJlbGF0aXZlIHBvc2l0aW9ucyAoZnJvbSAwIHRvIDEpIG9mIHdoZXJlIHRoZSBnZW5lcmljIHBhcnRpdGlvbiBsaW5lcyBzaG91bGQgYmVcclxuICBHRU5FUklDX1NJTkdMRV9PRkZTRVQ6IDAuNjIsIC8vIGlmIHRoZXJlIGlzIG9uZSBsaW5lXHJcbiAgR0VORVJJQ19GSVJTVF9PRkZTRVQ6IDAuNDUsXHJcbiAgR0VORVJJQ19TRUNPTkRfT0ZGU0VUOiAwLjc4LFxyXG5cclxuICAvLyB7bnVtYmVyfSAtIExpa2UgdGhlIGdlbmVyaWMgdmlldywgYnV0IGZvciB0aGUgaWNvblxyXG4gIEdFTkVSSUNfSUNPTl9TSU5HTEVfT0ZGU0VUOiAwLjY4LFxyXG4gIEdFTkVSSUNfSUNPTl9GSVJTVF9PRkZTRVQ6IDAuNTUsXHJcbiAgR0VORVJJQ19JQ09OX1NFQ09ORF9PRkZTRVQ6IDAuODAsXHJcblxyXG4gIC8vIHtWZWN0b3IyfSAtIE9mZnNldCB2ZWN0b3IgZnJvbSB0aGUgdXBwZXItbGVmdCBvZiB0aGUgYXJlYSB0byB0aGUgeCx5IHBvc2l0aW9uIHdoZXJlIHRoZSBkaW1lbnNpb24gbGluZSBsYWJlbHNcclxuICAvLyAgICAgICAgICAgICB3b3VsZCBpbnRlcnNlY3QuXHJcbiAgUFJPUE9SVElPTkFMX1JBTkdFX09GRlNFVDogbmV3IFZlY3RvcjIoIC0zNSwgLTI4ICksXHJcbiAgR0VORVJJQ19SQU5HRV9PRkZTRVQ6IG5ldyBWZWN0b3IyKCAtNjAsIC00MCApLFxyXG5cclxuICAvLyB7bnVtYmVyfSAtIFNwYWNlIGJldHdlZW4gdGhlIGFyZWEgYW5kIHRoZSBrZXlwYWRcclxuICBLRVlQQURfTEVGVF9QQURESU5HOiAyNSxcclxuXHJcbiAgLy8ge251bWJlcn0gLSBOdW1iZXIgb2YgY2hhbGxlbmdlcyBwZXIgbGV2ZWxcclxuICBOVU1fQ0hBTExFTkdFUzogNixcclxuXHJcbiAgLy8ge251bWJlcn0gLSBUaGUgcGVyZmVjdCBzY29yZSBmb3IgYSBsZXZlbFxyXG4gIFBFUkZFQ1RfU0NPUkU6IDEyLFxyXG5cclxuICAvLyB7bnVtYmVyfSAtIFBhZGRpbmcgaW4tYmV0d2VlbiBjb250ZW50IGFuZCBzdXJyb3VuZGluZyBwYXJlbnRoZXNlcyBpbiB0aGUgY2FsY3VsYXRpb24gYXJlYVxyXG4gIENBTENVTEFUSU9OX1BBUkVOX1BBRERJTkc6IDAsXHJcblxyXG4gIC8vIHtudW1iZXJ9IC0gUGFkZGluZyBpbi1iZXR3ZWVuIGFuIGVuZCBwYXJlbnRoZXNpcyBhbmQgc3RhcnQgcGFyZW50aGVzZSwgZS5nLiBiZXR3ZWVuICkoXHJcbiAgQ0FMQ1VMQVRJT05fUEFSRU5fUEFSRU5fUEFERElORzogMCxcclxuXHJcbiAgLy8ge251bWJlcn0gLSBQYWRkaW5nIGFyb3VuZCBhbiB4ICh1c2VkIGZvciBtdWx0aXBsaWNhdGlvbilcclxuICBDQUxDVUxBVElPTl9YX1BBRERJTkc6IDMsXHJcblxyXG4gIC8vIHtudW1iZXJ9IC0gUGFkZGluZyBhcm91bmQgYSBkb3QgKHVzZWQgZm9yIG11bHRpcGxpY2F0aW9uKVxyXG4gIENBTENVTEFUSU9OX0RPVF9QQURESU5HOiAzLFxyXG5cclxuICAvLyB7bnVtYmVyfSAtIFBhZGRpbmcgYXJvdW5kIG1vc3QgKGJpbmFyeSkgb3BlcmF0aW9ucyBpbiB0aGUgY2FsY3VsYXRpb25cclxuICBDQUxDVUxBVElPTl9PUF9QQURESU5HOiA1LFxyXG5cclxuICAvLyB7bnVtYmVyfSAtIFBhZGRpbmcgYmV0d2VlbiBhIHRlcm0gYW5kIGFuIGFkamFjZW50IHBhcmVudGhlc2lzLCBlLmcuIFwieChcIiBvciBcIil4XCJcclxuICBDQUxDVUxBVElPTl9URVJNX1BBUkVOX1BBRERJTkc6IDEsXHJcblxyXG4gIC8vIHtPcmllbnRhdGlvblBhaXIuPG51bWJlcj59IC0gVGhlIG9wcG9zaXRlLW9yaWVudGF0aW9uIG9mZnNldCB0byB1c2UgZm9yIHRlcm0gZWRpdCBub2RlcywgZS5nLlxyXG4gIC8vIG5vZGVbIG9yaWVudGF0aW9uLm9wcG9zaXRlLmNvb3JkaW5hdGUgXSA9IFBBUlRJVElPTl9PRkZTRVQuZ2V0KCBvcmllbnRhdGlvbiApXHJcbiAgUEFSVElUSU9OX09GRlNFVDogbmV3IE9yaWVudGF0aW9uUGFpciggLTIwLCAtMzAgKSxcclxuXHJcbiAgLy8ge3N0cmluZ30gLSBUaGUgY2hhcmFjdGVyIHdlIHVzZSBhcyBhIGdlbmVyaWMgZGVjaW1hbCBjaGFyYWN0ZXIgdG8gZ2V0IGFuIGFwcHJveGltYXRlIHdpZHRoIGZvciBudW1lcmljXHJcbiAgLy8gcmVwcmVzZW50YXRpb25zLlxyXG4gIE1FQVNVUklOR19DSEFSQUNURVI6ICc5J1xyXG59O1xyXG5hcmVhTW9kZWxDb21tb24ucmVnaXN0ZXIoICdBcmVhTW9kZWxDb21tb25Db25zdGFudHMnLCBBcmVhTW9kZWxDb21tb25Db25zdGFudHMgKTtcclxuZXhwb3J0IGRlZmF1bHQgQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxjQUFjLE1BQU0sNENBQTRDO0FBQ3ZFLE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsT0FBT0MsZUFBZSxNQUFNLHVCQUF1QjtBQUNuRCxPQUFPQyxlQUFlLE1BQU0sNEJBQTRCOztBQUV4RDtBQUNBLE1BQU1DLCtCQUErQixHQUFHLEVBQUU7QUFDMUMsTUFBTUMscUJBQXFCLEdBQUcsRUFBRTtBQUVoQyxNQUFNQyx3QkFBd0IsR0FBRztFQUUvQjtFQUNBQyxpQkFBaUIsRUFBRSxJQUFJTixRQUFRLENBQUUsRUFBRyxDQUFDO0VBQUU7RUFDdkNPLGtCQUFrQixFQUFFLElBQUlQLFFBQVEsQ0FBRSxFQUFHLENBQUM7RUFBRTtFQUN4Q1Esa0JBQWtCLEVBQUUsSUFBSVIsUUFBUSxDQUFFLEVBQUcsQ0FBQztFQUN0Q1Msc0JBQXNCLEVBQUUsSUFBSVQsUUFBUSxDQUFFLEVBQUcsQ0FBQztFQUMxQ1Usb0JBQW9C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