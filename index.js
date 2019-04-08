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
 * @param       {Function}  [beforeSave]                  function for transform value (e.g. rounding) before save
 * @return      {Object}                                    resulting value and displayValue stored under theirs own line key
 */
const compute = (lines, { context = {}, beforeSave = value => value } = {}) => {
  const ctx = { ...context, value: context.value || 0 };
  const results = [];
  for (const line of lines) {
    const {
      computeValue,
      computeDisplay,
    } = line;
    try {
      ctx.line = line;
      ctx.result = computeValue ? math.eval(computeValue, ctx) : ctx.value;
      ctx.result = beforeSave(ctx.result);
      const displayValue = computeDisplay ? beforeSave(math.eval(computeDisplay, ctx)) : null;
      ctx.value = ctx.result;

      results.push({
        ...line,
        displayValue,
        value: ctx.value,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  results._totalPrice = ctx.value;
  return results;
};

/**
 * @function    computeDisplays
 * @description compute line text's to display current line will be added under `line` key in the context don't use it
 * @param       {Line[]}            lines                             Array of {@link Line}
 * @param       {Object}            [opts={}]
 * @param       {Object}            [opts.context={}]                 mustache context
 * @return      {Object}                                              Line text array
 */
const computeDisplays = (lines, { context = {} } = {}) => {
  const results = [];

  lines.forEach((line) => {
    const {
      visible,
      displayTemplate,
    } = line;
    const ctx = { ...context, line };

    try {
      if (!visible) return;
      results.push({
        ...line,
        displayTitle: displayTemplate ? mustache.render(displayTemplate, ctx) : '',
      });
    } catch (e) {
      console.warn(e);
    }
  });

  return results;
};

const getConfigTag = async (findOneByEndpoint, categoryEndpoint, role, params) => {
  let configTag;
  if (categoryEndpoint) {
    try {
      configTag = await findOneByEndpoint(`${categoryEndpoint}/payment/${role}`, params);
    } catch (e) {}
  }
  if (!configTag) {
    try {
      configTag = await findOneByEndpoint(`/global/shared_config/payment/${role}`, params);
    } catch (e) {}
  }
  if (!configTag) {
    configTag = await findOneByEndpoint('/global/shared_config/payment/default', params);
  }
  return configTag;
};

module.exports.default = module.exports = {
  compute,
  getConfigTag,
  computeDisplays,
};
