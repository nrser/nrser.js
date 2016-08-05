const isBrowser = new Function(
  "try {return this===window;}catch(e){ return false;}"
);

const isNode = new Function(
  "try {return this===global;}catch(e){return false;}"
);

export const IS_BROWSER = isBrowser();
export const IS_NODE = isNode();