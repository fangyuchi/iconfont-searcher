
export function fyczsSetAttributes(node, attributes) {
  if (attributes) {
    const keys = Object.keys(attributes);
    keys.forEach(key => {
      node.setAttribute(key, attributes[key]);
    });
  }
}

export function fyczsCreateElement(tagName, attributes = null) {
  const temp = document.createElement(tagName);

  fyczsSetAttributes(temp, attributes);

  return temp;
}

export default {
  fyczsSetAttributes,
  fyczsCreateElement
};
