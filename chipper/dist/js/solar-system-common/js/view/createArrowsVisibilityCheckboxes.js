// Copyright 2023, University of Colorado Boulder

/**
 * Visual representation of velocity and gravity arrows checkbox.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import { HBox, Text } from '../../../scenery/js/imports.js';
import SolarSystemCommonStrings from '../../../solar-system-common/js/SolarSystemCommonStrings.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import SolarSystemCommonCheckbox from './SolarSystemCommonCheckbox.js';
import solarSystemCommon from '../solarSystemCommon.js';

// constants
const ARROW_Y_COORDINATE = -10;
const TEXT_OPTIONS = combineOptions({
  maxWidth: SolarSystemCommonConstants.TEXT_MAX_WIDTH
}, SolarSystemCommonConstants.TEXT_OPTIONS);
const SPACING = 10;
const createArrowsVisibilityCheckboxes = (model, tandem) => {
  return [
  // speed checkbox
  new SolarSystemCommonCheckbox(model.valuesVisibleProperty, new Text(SolarSystemCommonStrings.speedStringProperty, TEXT_OPTIONS), {
    accessibleName: SolarSystemCommonStrings.speedStringProperty,
    tandem: tandem.createTandem('valuesVisibleCheckbox')
  }),
  // velocity checkbox
  new SolarSystemCommonCheckbox(model.velocityVisibleProperty, new HBox(combineOptions({
    children: [new Text(SolarSystemCommonStrings.velocityStringProperty, TEXT_OPTIONS), new ArrowNode(95, ARROW_Y_COORDINATE, 140, ARROW_Y_COORDINATE, {
      fill: PhetColorScheme.VELOCITY
    })]
  }, {
    spacing: SPACING
  })), {
    accessibleName: SolarSystemCommonStrings.velocityStringProperty,
    tandem: tandem.createTandem('velocityCheckbox')
  }),
  // gravity force checkbox
  new SolarSystemCommonCheckbox(model.gravityVisibleProperty, new HBox(combineOptions({
    children: [new Text(SolarSystemCommonStrings.gravityForceStringProperty, TEXT_OPTIONS), new ArrowNode(135, ARROW_Y_COORDINATE, 180, ARROW_Y_COORDINATE, {
      fill: PhetColorScheme.GRAVITATIONAL_FORCE
    })]
  }, {
    spacing: SPACING
  })), {
    accessibleName: SolarSystemCommonStrings.gravityForceStringProperty,
    tandem: tandem.createTandem('gravityForceCheckbox')
  })];
};
solarSystemCommon.register('createArrowsVisibilityCheckboxes', createArrowsVisibilityCheckboxes);
export default createArrowsVisibilityCheckboxes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBcnJvd05vZGUiLCJQaGV0Q29sb3JTY2hlbWUiLCJIQm94IiwiVGV4dCIsIlNvbGFyU3lzdGVtQ29tbW9uU3RyaW5ncyIsImNvbWJpbmVPcHRpb25zIiwiU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMiLCJTb2xhclN5c3RlbUNvbW1vbkNoZWNrYm94Iiwic29sYXJTeXN0ZW1Db21tb24iLCJBUlJPV19ZX0NPT1JESU5BVEUiLCJURVhUX09QVElPTlMiLCJtYXhXaWR0aCIsIlRFWFRfTUFYX1dJRFRIIiwiU1BBQ0lORyIsImNyZWF0ZUFycm93c1Zpc2liaWxpdHlDaGVja2JveGVzIiwibW9kZWwiLCJ0YW5kZW0iLCJ2YWx1ZXNWaXNpYmxlUHJvcGVydHkiLCJzcGVlZFN0cmluZ1Byb3BlcnR5IiwiYWNjZXNzaWJsZU5hbWUiLCJjcmVhdGVUYW5kZW0iLCJ2ZWxvY2l0eVZpc2libGVQcm9wZXJ0eSIsImNoaWxkcmVuIiwidmVsb2NpdHlTdHJpbmdQcm9wZXJ0eSIsImZpbGwiLCJWRUxPQ0lUWSIsInNwYWNpbmciLCJncmF2aXR5VmlzaWJsZVByb3BlcnR5IiwiZ3Jhdml0eUZvcmNlU3RyaW5nUHJvcGVydHkiLCJHUkFWSVRBVElPTkFMX0ZPUkNFIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJjcmVhdGVBcnJvd3NWaXNpYmlsaXR5Q2hlY2tib3hlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5cclxuLyoqXHJcbiAqIFZpc3VhbCByZXByZXNlbnRhdGlvbiBvZiB2ZWxvY2l0eSBhbmQgZ3Jhdml0eSBhcnJvd3MgY2hlY2tib3guXHJcbiAqXHJcbiAqIEBhdXRob3IgQWd1c3TDrW4gVmFsbGVqbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQXJyb3dOb2RlIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9BcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBIQm94T3B0aW9ucywgVGV4dCwgVGV4dE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgU29sYXJTeXN0ZW1Db21tb25TdHJpbmdzIGZyb20gJy4uLy4uLy4uL3NvbGFyLXN5c3RlbS1jb21tb24vanMvU29sYXJTeXN0ZW1Db21tb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uL1NvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFNvbGFyU3lzdGVtQ29tbW9uQ2hlY2tib3ggZnJvbSAnLi9Tb2xhclN5c3RlbUNvbW1vbkNoZWNrYm94LmpzJztcclxuaW1wb3J0IFNvbGFyU3lzdGVtQ29tbW9uTW9kZWwgZnJvbSAnLi4vbW9kZWwvU29sYXJTeXN0ZW1Db21tb25Nb2RlbC5qcyc7XHJcbmltcG9ydCBzb2xhclN5c3RlbUNvbW1vbiBmcm9tICcuLi9zb2xhclN5c3RlbUNvbW1vbi5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQVJST1dfWV9DT09SRElOQVRFID0gLTEwO1xyXG5cclxuY29uc3QgVEVYVF9PUFRJT05TID0gY29tYmluZU9wdGlvbnM8VGV4dE9wdGlvbnM+KCB7XHJcbiAgbWF4V2lkdGg6IFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLlRFWFRfTUFYX1dJRFRIXHJcbn0sIFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLlRFWFRfT1BUSU9OUyApO1xyXG5cclxuY29uc3QgU1BBQ0lORyA9IDEwO1xyXG5cclxuY29uc3QgY3JlYXRlQXJyb3dzVmlzaWJpbGl0eUNoZWNrYm94ZXMgPSAoIG1vZGVsOiBTb2xhclN5c3RlbUNvbW1vbk1vZGVsLCB0YW5kZW06IFRhbmRlbSApOiBTb2xhclN5c3RlbUNvbW1vbkNoZWNrYm94W10gPT4ge1xyXG4gIHJldHVybiBbXHJcbiAgICAvLyBzcGVlZCBjaGVja2JveFxyXG4gICAgbmV3IFNvbGFyU3lzdGVtQ29tbW9uQ2hlY2tib3goIG1vZGVsLnZhbHVlc1Zpc2libGVQcm9wZXJ0eSwgbmV3IFRleHQoIFNvbGFyU3lzdGVtQ29tbW9uU3RyaW5ncy5zcGVlZFN0cmluZ1Byb3BlcnR5LCBURVhUX09QVElPTlMgKSwge1xyXG4gICAgICBhY2Nlc3NpYmxlTmFtZTogU29sYXJTeXN0ZW1Db21tb25TdHJpbmdzLnNwZWVkU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZhbHVlc1Zpc2libGVDaGVja2JveCcgKVxyXG4gICAgfSApLFxyXG4gICAgLy8gdmVsb2NpdHkgY2hlY2tib3hcclxuICAgIG5ldyBTb2xhclN5c3RlbUNvbW1vbkNoZWNrYm94KCBtb2RlbC52ZWxvY2l0eVZpc2libGVQcm9wZXJ0eSwgbmV3IEhCb3goIGNvbWJpbmVPcHRpb25zPEhCb3hPcHRpb25zPigge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBUZXh0KCBTb2xhclN5c3RlbUNvbW1vblN0cmluZ3MudmVsb2NpdHlTdHJpbmdQcm9wZXJ0eSwgVEVYVF9PUFRJT05TICksXHJcbiAgICAgICAgbmV3IEFycm93Tm9kZSggOTUsIEFSUk9XX1lfQ09PUkRJTkFURSwgMTQwLCBBUlJPV19ZX0NPT1JESU5BVEUsIHsgZmlsbDogUGhldENvbG9yU2NoZW1lLlZFTE9DSVRZIH0gKVxyXG4gICAgICBdXHJcbiAgICB9LCB7XHJcbiAgICAgIHNwYWNpbmc6IFNQQUNJTkdcclxuICAgIH0gKSApLCB7XHJcbiAgICAgIGFjY2Vzc2libGVOYW1lOiBTb2xhclN5c3RlbUNvbW1vblN0cmluZ3MudmVsb2NpdHlTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmVsb2NpdHlDaGVja2JveCcgKVxyXG4gICAgfSApLFxyXG4gICAgLy8gZ3Jhdml0eSBmb3JjZSBjaGVja2JveFxyXG4gICAgbmV3IFNvbGFyU3lzdGVtQ29tbW9uQ2hlY2tib3goIG1vZGVsLmdyYXZpdHlWaXNpYmxlUHJvcGVydHksIG5ldyBIQm94KCBjb21iaW5lT3B0aW9uczxIQm94T3B0aW9ucz4oIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgVGV4dCggU29sYXJTeXN0ZW1Db21tb25TdHJpbmdzLmdyYXZpdHlGb3JjZVN0cmluZ1Byb3BlcnR5LCBURVhUX09QVElPTlMgKSxcclxuICAgICAgICBuZXcgQXJyb3dOb2RlKCAxMzUsIEFSUk9XX1lfQ09PUkRJTkFURSwgMTgwLCBBUlJPV19ZX0NPT1JESU5BVEUsIHsgZmlsbDogUGhldENvbG9yU2NoZW1lLkdSQVZJVEFUSU9OQUxfRk9SQ0UgfSApXHJcbiAgICAgIF1cclxuICAgIH0sIHtcclxuICAgICAgc3BhY2luZzogU1BBQ0lOR1xyXG4gICAgfSApICksIHtcclxuICAgICAgYWNjZXNzaWJsZU5hbWU6IFNvbGFyU3lzdGVtQ29tbW9uU3RyaW5ncy5ncmF2aXR5Rm9yY2VTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ3Jhdml0eUZvcmNlQ2hlY2tib3gnIClcclxuICAgIH0gKVxyXG4gIF07XHJcbn07XHJcblxyXG5zb2xhclN5c3RlbUNvbW1vbi5yZWdpc3RlciggJ2NyZWF0ZUFycm93c1Zpc2liaWxpdHlDaGVja2JveGVzJywgY3JlYXRlQXJyb3dzVmlzaWJpbGl0eUNoZWNrYm94ZXMgKTtcclxuZXhwb3J0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