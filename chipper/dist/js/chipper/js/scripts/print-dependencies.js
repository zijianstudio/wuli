// Copyright 2020-2021, University of Colorado Boulder

/**
 * Prints out a comma-separated list of repos that this repository depends on (used by things like CT)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const getPhetLibs = require('../grunt/getPhetLibs');
const assert = require('assert');
assert(typeof process.argv[2] === 'string', 'Provide the repo name as the first parameter');
const repo = process.argv[2];
const dependencies = getPhetLibs(repo).filter(dependency => dependency !== 'babel').sort();
console.log(dependencies.join(','));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRQaGV0TGlicyIsInJlcXVpcmUiLCJhc3NlcnQiLCJwcm9jZXNzIiwiYXJndiIsInJlcG8iLCJkZXBlbmRlbmNpZXMiLCJmaWx0ZXIiLCJkZXBlbmRlbmN5Iiwic29ydCIsImNvbnNvbGUiLCJsb2ciLCJqb2luIl0sInNvdXJjZXMiOlsicHJpbnQtZGVwZW5kZW5jaWVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFByaW50cyBvdXQgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiByZXBvcyB0aGF0IHRoaXMgcmVwb3NpdG9yeSBkZXBlbmRzIG9uICh1c2VkIGJ5IHRoaW5ncyBsaWtlIENUKVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuXHJcbmNvbnN0IGdldFBoZXRMaWJzID0gcmVxdWlyZSggJy4uL2dydW50L2dldFBoZXRMaWJzJyApO1xyXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xyXG5cclxuYXNzZXJ0KCB0eXBlb2YgcHJvY2Vzcy5hcmd2WyAyIF0gPT09ICdzdHJpbmcnLCAnUHJvdmlkZSB0aGUgcmVwbyBuYW1lIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXInICk7XHJcbmNvbnN0IHJlcG8gPSBwcm9jZXNzLmFyZ3ZbIDIgXTtcclxuXHJcbmNvbnN0IGRlcGVuZGVuY2llcyA9IGdldFBoZXRMaWJzKCByZXBvICkuZmlsdGVyKCBkZXBlbmRlbmN5ID0+IGRlcGVuZGVuY3kgIT09ICdiYWJlbCcgKS5zb3J0KCk7XHJcblxyXG5jb25zb2xlLmxvZyggZGVwZW5kZW5jaWVzLmpvaW4oICcsJyApICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxNQUFNQSxXQUFXLEdBQUdDLE9BQU8sQ0FBRSxzQkFBdUIsQ0FBQztBQUNyRCxNQUFNQyxNQUFNLEdBQUdELE9BQU8sQ0FBRSxRQUFTLENBQUM7QUFFbENDLE1BQU0sQ0FBRSxPQUFPQyxPQUFPLENBQUNDLElBQUksQ0FBRSxDQUFDLENBQUUsS0FBSyxRQUFRLEVBQUUsOENBQStDLENBQUM7QUFDL0YsTUFBTUMsSUFBSSxHQUFHRixPQUFPLENBQUNDLElBQUksQ0FBRSxDQUFDLENBQUU7QUFFOUIsTUFBTUUsWUFBWSxHQUFHTixXQUFXLENBQUVLLElBQUssQ0FBQyxDQUFDRSxNQUFNLENBQUVDLFVBQVUsSUFBSUEsVUFBVSxLQUFLLE9BQVEsQ0FBQyxDQUFDQyxJQUFJLENBQUMsQ0FBQztBQUU5RkMsT0FBTyxDQUFDQyxHQUFHLENBQUVMLFlBQVksQ0FBQ00sSUFBSSxDQUFFLEdBQUksQ0FBRSxDQUFDIn0=