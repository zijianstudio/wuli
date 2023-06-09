// Copyright 2023, University of Colorado Boulder

/**
 * Loads and returns if chipperSupportsOutputJSGruntTasks
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

const ChipperVersion = require('./ChipperVersion');
const winston = require('winston');

/**
 * Returns if chipperSupportsOutputJSGruntTasks
 * @public
 *
 * @returns {boolean}
 */
module.exports = function () {
  const chipperVersion = ChipperVersion.getFromRepository();
  const chipperSupportsOutputJSGruntTasks = chipperVersion.chipperSupportsOutputJSGruntTasks;
  winston.info(`chipperSupportsOutputJSGruntTasks: ${chipperSupportsOutputJSGruntTasks}`);
  return chipperSupportsOutputJSGruntTasks;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGlwcGVyVmVyc2lvbiIsInJlcXVpcmUiLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsImNoaXBwZXJWZXJzaW9uIiwiZ2V0RnJvbVJlcG9zaXRvcnkiLCJjaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3MiLCJpbmZvIl0sInNvdXJjZXMiOlsiY2hpcHBlclN1cHBvcnRzT3V0cHV0SlNHcnVudFRhc2tzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBMb2FkcyBhbmQgcmV0dXJucyBpZiBjaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3NcclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmNvbnN0IENoaXBwZXJWZXJzaW9uID0gcmVxdWlyZSggJy4vQ2hpcHBlclZlcnNpb24nICk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGlmIGNoaXBwZXJTdXBwb3J0c091dHB1dEpTR3J1bnRUYXNrc1xyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcclxuICBjb25zdCBjaGlwcGVyVmVyc2lvbiA9IENoaXBwZXJWZXJzaW9uLmdldEZyb21SZXBvc2l0b3J5KCk7XHJcbiAgY29uc3QgY2hpcHBlclN1cHBvcnRzT3V0cHV0SlNHcnVudFRhc2tzID0gY2hpcHBlclZlcnNpb24uY2hpcHBlclN1cHBvcnRzT3V0cHV0SlNHcnVudFRhc2tzO1xyXG4gIHdpbnN0b24uaW5mbyggYGNoaXBwZXJTdXBwb3J0c091dHB1dEpTR3J1bnRUYXNrczogJHtjaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3N9YCApO1xyXG4gIHJldHVybiBjaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3M7XHJcbn07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLGNBQWMsR0FBR0MsT0FBTyxDQUFFLGtCQUFtQixDQUFDO0FBQ3BELE1BQU1DLE9BQU8sR0FBR0QsT0FBTyxDQUFFLFNBQVUsQ0FBQzs7QUFFcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FFLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLFlBQVc7RUFDMUIsTUFBTUMsY0FBYyxHQUFHTCxjQUFjLENBQUNNLGlCQUFpQixDQUFDLENBQUM7RUFDekQsTUFBTUMsaUNBQWlDLEdBQUdGLGNBQWMsQ0FBQ0UsaUNBQWlDO0VBQzFGTCxPQUFPLENBQUNNLElBQUksQ0FBRyxzQ0FBcUNELGlDQUFrQyxFQUFFLENBQUM7RUFDekYsT0FBT0EsaUNBQWlDO0FBQzFDLENBQUMifQ==