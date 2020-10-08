/**
 * @file 
 * Timing Functions for Transitor. Examples can be found in: https://easings.net/
Export as an object because function name can be defined by user.

*/


/**
 * @param {number} x - percentage of time
 * @param {number} - percentage of transition
*/
function easeInQuad(x) {
  return x * x;
}
/**
 * @param {number} x - percentage of time
 * @param {number} - percentage of transition
*/
function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}
/**
 * @param {number} x - percentage of time
 * @param {number} - percentage of transition
*/
function easeInOutQuad(x) {
  return x < 0.5 ?
    2 * x * x :
    1 - Math.pow(-2 * x + 2, 2) / 2;
}
/**
 * @param {number} x - percentage of time
 * @param {number} - percentage of transition
*/
function easeOutQuart(x) {
  return 1 - Math.pow(1 - x, 4);
}
/**
 * @param {number} x - percentage of time
 * @param {number} - percentage of transition
*/
function linear(x) {
  return x;
}
/**
 * @param {number} x - percentage of time
 * @param {number} - percentage of transition
*/
function easeOutCirc(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 2));
}
/**
 * @param {number} x - percentage of time
 * @param {number} - percentage of transition
*/
function easeInSine(x) {
  return 1 - Math.cos(x * Math.PI / 2);
}
/**
 * @param {number} x - percentage of time
 * @param {number} - percentage of transition
*/
function easeOutSine(x) {
  return Math.sin(x * Math.PI / 2);
}
/**
 * @param {number} x - percentage of time
 * @param {number} - percentage of transition
*/
function easeInOutSine(x) {
  return -0.5 * (Math.cos(Math.PI * x) - 1);
}

export default {
  easeInQuad,
  easeOutQuad,
  easeOutQuart,
  easeInOutQuad,
  linear,
  easeOutCirc,
  easeInSine,
  easeOutSine,
  easeInOutSine,
};