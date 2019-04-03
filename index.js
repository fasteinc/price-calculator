const math = require('mathjs');
const mustache = require('mustache');

const defaultKeyExtractor = ({ key }) => key;

/**
 * Line of payment
 * @typedef {Object} Line
 * @property {string} computeValue - mathjs template for computing next value
 * @property {string} [computeDisplay] - mathjs template for computing displayValue
 *                                        if missing value will be stored in displayValue too
 * @property {string} [key] - Used for line key if defaultKeyExtractor is used
 * @property {string} [hidden] - if true no computeDisplay  result will be generated for this line
 * @property {string} [displayTemplate] - mustache template for generating displaysResults
 */

/**
 * @function    compute
 * @description Compute value and displayValue for an array of lines
 *              result of each line will be passed in context to next line in `value` key
 * @param       {Line[]}    lines                           Array of {@link Line}
 * @param       {Object}    [opts={}]
 * @param       {Object}    [opts.context={}]               context for mathjs eval, if `value` key is used
 *                                                          she will be overrided after the first computing
 * @param       {Function}  [keyExtractor=defaultKeyExtractor]  function for select the key where store the result receive the line in parameter
 * @param       {Function}  [beforeSave]                  function for transform value (e.g. rounding) before save
 * @return      {Object}                                    resulting value and displayValue stored under theirs own line key
 */
const compute = (lines, { context = {}, keyExtractor = defaultKeyExtractor, beforeSave = value => value } = {}) => {
  const ctx = { ...context, value: context.value || 0 };
  const results = {};

  lines.forEach((line) => {
    const {
      computeValue,
      computeDisplay,
    } = line;
    const key = keyExtractor(line);
    ctx.line = line;
    ctx.result = computeValue ? math.eval(computeValue, ctx) : ctx.value;
    ctx.result = beforeSave(ctx.result);
    ctx.value = ctx.result;
    const displayValue = computeDisplay ? math.eval(computeDisplay, ctx) : ctx.value;

    results[key] = {
      displayValue: beforeSave(displayValue),
      value: ctx.value,
    };
  });

  return results;
};

/**
 * @function    computeDisplays
 * @description compute line text's to display
 * @param       {Line[]}            lines                             Array of {@link Line}
 * @param       {Object}            [opts={}]
 * @param       {Object}            [opts.context={}]                 mustache context
 * @param       {Object}            [opts.contexts={}]                context in the key returned by `keyExtractor`
 *                                                                      will be added to the global context
 * @param       {Function}          [opts.keyExtractor=defaultKeyExtractor] function for select the key where store
 *                                                                    the result and read the context receive the line in parameter
 * @return      {Object}                                              Line text stored under the key returned by `keyExtractor`
 */
const computeDisplays = (
  lines,
  {
    context = {},
    contexts = {},
    keyExtractor = defaultKeyExtractor,
  } = {}) => {
  const results = {};

  lines.forEach((line) => {
    const {
      hidden,
      displayTemplate,
    } = line;
    if (hidden) return;

    const key = keyExtractor(line);
    const ctx = { ...context, ...(contexts[key] || {}), line };

    results[key] = displayTemplate ? mustache.render(displayTemplate, ctx) : ctx.displayValue;
  });

  return results;
};

module.exports.default = module.exports = {
  compute,
  computeDisplays,
};
