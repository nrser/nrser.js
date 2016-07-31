export function cssNamespacer(namespace) {
  return function(className) {
    return className
      .split(' ')
      .map((name) => {
        if (name === '&') {
          return namespace;
        } else if (name.startsWith('&-')) {
          return namespace + name.slice(1);
        } else {
          return name;
        }
      })
      .join(' ');
  }
} // cssNamespacer()