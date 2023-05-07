// Copyright 2015-2023, University of Colorado Boulder

/**
 * Used to indicate that a guess in the game is not a line. Occurs when the guess involves more than 2 points.
 * In this situation, we want to know that the user's guess has changed, so a new object instance is required
 * to trigger notifications.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import graphingLines from '../../graphingLines.js';
export default class NotALine {}
graphingLines.register('NotALine', NotALine);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJncmFwaGluZ0xpbmVzIiwiTm90QUxpbmUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5vdEFMaW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFVzZWQgdG8gaW5kaWNhdGUgdGhhdCBhIGd1ZXNzIGluIHRoZSBnYW1lIGlzIG5vdCBhIGxpbmUuIE9jY3VycyB3aGVuIHRoZSBndWVzcyBpbnZvbHZlcyBtb3JlIHRoYW4gMiBwb2ludHMuXHJcbiAqIEluIHRoaXMgc2l0dWF0aW9uLCB3ZSB3YW50IHRvIGtub3cgdGhhdCB0aGUgdXNlcidzIGd1ZXNzIGhhcyBjaGFuZ2VkLCBzbyBhIG5ldyBvYmplY3QgaW5zdGFuY2UgaXMgcmVxdWlyZWRcclxuICogdG8gdHJpZ2dlciBub3RpZmljYXRpb25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBncmFwaGluZ0xpbmVzIGZyb20gJy4uLy4uL2dyYXBoaW5nTGluZXMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm90QUxpbmUge31cclxuXHJcbmdyYXBoaW5nTGluZXMucmVnaXN0ZXIoICdOb3RBTGluZScsIE5vdEFMaW5lICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxhQUFhLE1BQU0sd0JBQXdCO0FBRWxELGVBQWUsTUFBTUMsUUFBUSxDQUFDO0FBRTlCRCxhQUFhLENBQUNFLFFBQVEsQ0FBRSxVQUFVLEVBQUVELFFBQVMsQ0FBQyJ9