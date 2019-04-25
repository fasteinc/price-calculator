const math = require('mathjs');
const mustache = require('mustache');

/**
 * Line of payment
 * @typedef {Object} Line
 * @property {string} computeValue - mathjs template for computing next value
 * @property {string} [computeDisplay] - mathjs template for computing displayValue
 *                                        if missing value will be stored in displayValue too
 * @property {string} [visible] - if false no computeDisplay  result will be generated for this line
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
 * @return      {Object}                                    copy of lines with value and displayValue
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
 * @return      {Object}                                              copy of lines with displayTitle
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

const filter = {
  include: {
    relation: 'tags',
    order: 'position ASC',
  },
};

const allFilter = {
  multiple: true,
  include: [
    {
      relation: 'tags',
      order: 'position ASC',
    },
    { relation: 'parent' },
  ],
};

/**
 * @function    getConfigTag
 * @description Fetch the tag corresponding to the category and role or fallback to default
 * @param       {Function}         findOneByEndpoint  Function for tag fetching
 * @param       {string}           [categoryEndpoint] endpoint of the category
 * @param       {string}           [role]             user role
 * @return      {Object}                              tag of payment config
 */
const getConfigTag = async (findOneByEndpoint, categoryEndpoint, role) => {
  let configTag;

  if (categoryEndpoint) {
    try {
      configTag = await findOneByEndpoint(`${categoryEndpoint}/payment/${role}`, filter);
    } catch (e) {}
  }
  if (!configTag) {
    try {
      configTag = await findOneByEndpoint(`/global/shared_config/payment/${role}`, filter);
    } catch (e) {}
  }
  if (!configTag) {
    configTag = await findOneByEndpoint('/global/shared_config/payment/default', filter);
  }
  return configTag;
};

/**
 * @function    getAllConfigTags
 * @description Fetch all config tags depending on the role
 * @param       {Function}           findOneByEndpoint Function for tag fetching
 * @param       {string}             [role]            user role
 * @return      {Object}                               tags of payment configs under [categoryId] or .default
 */
const getAllConfigTags = async (findOneByEndpoint, role) => {
  let categoryConfigTags;
  let globalConfigTags;
  const res = {};

  try {
    categoryConfigTags = await findOneByEndpoint('/sections/*/*/payment/*', allFilter);
  } catch (e) {}
  try {
    globalConfigTags = await findOneByEndpoint(`/global/shared_config/payment/(${role}|default)`, allFilter);
  } catch (e) {}

  let defaultTag = globalConfigTags.find(tag => tag.name === role);
  if (!defaultTag) defaultTag = globalConfigTags.find(tag => tag.name === 'default');
  res.default = defaultTag.tags();
  if (categoryConfigTags) {
    categoryConfigTags.forEach(tag => {
      if (tag.name !== 'default' || !res[tag.parent.tagParentId]) res[tag.parent().tagParentId] = tag.tags();
    });
  }

  return res;
};

/**
 * @function    getOptionsPrice
 * @description compute the price of a list of options
 * @param       {Object[]}            options     array of options, if `included` field true
 *                                                skip option else add to the result the `price` of the option
 *                                                multiplied by `selected` field
 * @return      {Number}                          total options price
 */
const getOptionsPrice = (options) => options.reduce((acc, { included, price, selected }) => {
  if (included || !price || !selected) return acc;

  return acc + (Number(selected) * price);
}, 0);


const correct = (value) => Number(Number(value).toFixed(5));

module.exports.default = module.exports = {
  correct,
  compute,
  getConfigTag,
  getOptionsPrice,
  computeDisplays,
  getAllConfigTags,
};
