// Copyright 2022, University of Colorado Boulder

/**
 * ModelMode is a union type that determines whether we are running an experiment or viewing a predictive model.
 * We could have used a boolean for this, but a union type presents better in Studio and the PhET-iO API.
 * The string names correspond to the English labels used on the ABSwitch that controls this setting.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

export const ModelModeValues = ['experiment', 'prediction'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNb2RlbE1vZGVWYWx1ZXMiXSwic291cmNlcyI6WyJNb2RlbE1vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsTW9kZSBpcyBhIHVuaW9uIHR5cGUgdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgd2UgYXJlIHJ1bm5pbmcgYW4gZXhwZXJpbWVudCBvciB2aWV3aW5nIGEgcHJlZGljdGl2ZSBtb2RlbC5cclxuICogV2UgY291bGQgaGF2ZSB1c2VkIGEgYm9vbGVhbiBmb3IgdGhpcywgYnV0IGEgdW5pb24gdHlwZSBwcmVzZW50cyBiZXR0ZXIgaW4gU3R1ZGlvIGFuZCB0aGUgUGhFVC1pTyBBUEkuXHJcbiAqIFRoZSBzdHJpbmcgbmFtZXMgY29ycmVzcG9uZCB0byB0aGUgRW5nbGlzaCBsYWJlbHMgdXNlZCBvbiB0aGUgQUJTd2l0Y2ggdGhhdCBjb250cm9scyB0aGlzIHNldHRpbmcuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNvbnN0IE1vZGVsTW9kZVZhbHVlcyA9IFsgJ2V4cGVyaW1lbnQnLCAncHJlZGljdGlvbicgXSBhcyBjb25zdDtcclxuZXhwb3J0IHR5cGUgTW9kZWxNb2RlID0gKCB0eXBlb2YgTW9kZWxNb2RlVmFsdWVzIClbbnVtYmVyXTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU8sTUFBTUEsZUFBZSxHQUFHLENBQUUsWUFBWSxFQUFFLFlBQVksQ0FBVyJ9