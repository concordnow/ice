(function () {

  var exports = this,
		_browser = null,
    dom = {};

  // Private helper for deep/shallow object merging
  function _isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    // DOM nodes, window, and other host objects are not plain objects
    if (obj.nodeType || obj === obj.window) return false;
    var proto = Object.getPrototypeOf(obj);
    return proto === null || proto === Object.prototype;
  }

  function _mergeObjects(target, source, deep) {
    if (!source) return;
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (deep && _isPlainObject(source[key])) {
          if (!_isPlainObject(target[key])) {
            target[key] = {};
          }
          _mergeObjects(target[key], source[key], deep);
        } else {
          target[key] = source[key];
        }
      }
    }
  }

  dom.DOM_VK_DELETE = 8;
  dom.DOM_VK_LEFT = 37;
  dom.DOM_VK_UP = 38;
  dom.DOM_VK_RIGHT = 39;
  dom.DOM_VK_DOWN = 40;
  dom.DOM_VK_ENTER = 13;
  dom.ELEMENT_NODE = 1;
  dom.ATTRIBUTE_NODE = 2;
  dom.TEXT_NODE = 3;
  dom.CDATA_SECTION_NODE = 4;
  dom.ENTITY_REFERENCE_NODE = 5;
  dom.ENTITY_NODE = 6;
  dom.PROCESSING_INSTRUCTION_NODE = 7;
  dom.COMMENT_NODE = 8;
  dom.DOCUMENT_NODE = 9;
  dom.DOCUMENT_TYPE_NODE = 10;
  dom.DOCUMENT_FRAGMENT_NODE = 11;
  dom.NOTATION_NODE = 12;
  dom.CHARACTER_UNIT = 'character';
  dom.WORD_UNIT = 'word';
  dom.BREAK_ELEMENT = 'br';
  dom.CONTENT_STUB_ELEMENTS = ['img', 'hr', 'br', 'iframe', 'param', 'link', 'meta', 'input', 'frame', 'col', 'base', 'area'];
  dom.BLOCK_ELEMENTS = ['p', 'div', 'pre', 'ul', 'ol', 'li', 'table', 'tbody', 'td', 'th', 'fieldset', 'form', 'blockquote', 'dl', 'dt', 'dd', 'dir', 'center', 'address', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  dom.TEXT_CONTAINER_ELEMENTS = ['p', 'div', 'pre', 'li', 'td', 'th', 'blockquote', 'dt', 'dd', 'center', 'address', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

  dom.STUB_ELEMENTS = dom.CONTENT_STUB_ELEMENTS.slice();
  dom.STUB_ELEMENTS.push(dom.BREAK_ELEMENT);

  dom.getKeyChar = function (e) {
    return String.fromCharCode(e.which);
  };
  dom.getClass = function (className, startElement, tagName) {
    if (!startElement) {
      startElement = document.body;
    }
    className = '.' + className.split(' ').join('.');
    if (tagName) {
      className = tagName + className;
    }
    return Array.prototype.slice.call(startElement.querySelectorAll(className));
  };
  dom.getId = function (id, startElement) {
    if (!startElement) {
      startElement = document;
    }
    element = startElement.getElementById(id);
    return element;
  };
  dom.getTag = function (tagName, startElement) {
    if (!startElement) {
      startElement = document;
    }
    return Array.prototype.slice.call(startElement.querySelectorAll(tagName));
  };
  dom.getElementWidth = function (element) {
    return element.offsetWidth;
  };
  dom.getElementHeight = function (element) {
    return element.offsetHeight;
  };
  dom.getElementDimensions = function (element) {
    var result = {
      'width': dom.getElementWidth(element),
      'height': dom.getElementHeight(element)
    };
    return result;
  };
  dom.trim = function (string) {
    return string.trim();
  };
  dom.empty = function (element) {
    if (element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  };
  dom.remove = function (element) {
    if (!element) return;
    if (Array.isArray(element) || element instanceof NodeList) {
      var elems = Array.prototype.slice.call(element);
      for (var i = 0; i < elems.length; i++) {
        if (elems[i] && elems[i].parentNode) {
          elems[i].parentNode.removeChild(elems[i]);
        }
      }
    } else if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  };
  dom.prepend = function (parent, elem) {
    parent.insertBefore(elem, parent.firstChild);
  };
  dom.append = function (parent, elem) {
    parent.appendChild(elem);
  };
  dom.insertBefore = function (before, elem) {
    before.parentNode.insertBefore(elem, before);
  };
  dom.insertAfter = function (after, elem) {
    after.parentNode.insertBefore(elem, after.nextSibling);
  };
  dom.getHtml = function (element) {
    return element.innerHTML;
  };
  dom.setHtml = function (element, content) {
    if (element) {
      element.innerHTML = content;
    }
  };
  // Remove whitespace/newlines between nested block elements
  // that are supported by ice.
  // For example the following element with innerHTML:
  //   <div><p> para </p> <ul>  <li> hi </li>  </ul></div>
  // Will be converted to the following:
  //   <div><p> para </p><ul><li> hi </li></ul></div>
  dom.removeWhitespace = function(element) {
    var childNodes = Array.prototype.slice.call(element.childNodes);
    for (var i = childNodes.length - 1; i >= 0; i--) {
      var node = childNodes[i];
      // Ice supports UL and OL, so recurse in these blocks to
      // make sure that spaces don't exist between inner LI.
      if (node.nodeType != ice.dom.TEXT_NODE && (node.nodeName == 'UL' || node.nodeName == 'OL')) {
        dom.removeWhitespace(node);
      } else if (node.nodeType === ice.dom.TEXT_NODE && !/\S/.test(node.nodeValue)) {
        element.removeChild(node);
      }
    }
  };
  dom.contents = function (el) {
    return Array.prototype.slice.call(el.childNodes);
  };
  /**
   * Returns the inner contents of `el` as a DocumentFragment.
   */
  dom.extractContent = function (el) {
    var frag = document.createDocumentFragment(),
      child;
    while ((child = el.firstChild)) {
      frag.appendChild(child);
    }
    return frag;
  };

  /**
   * Returns this `node` or the first parent tracking node that matches the given `selector`.
   */
  dom.getNode = function (node, selector) {
    return dom.is(node, selector) ? node : dom.parents(node, selector)[0] || null;
  };

  dom.getParents = function (elements, filter, stopEl) {
    var el = elements;
    var ar = [];
    while (el && el.parentNode) {
      el = el.parentNode;
      if (el === stopEl) break;
      if (el === document) break;
      if (!filter || (el.matches && el.matches(filter))) {
        ar.push(el);
      }
    }
    return ar;
  };
  dom.hasBlockChildren = function (parent) {
    var c = parent.childNodes.length;
    for (var i = 0; i < c; i++) {
      if (parent.childNodes[i].nodeType === dom.ELEMENT_NODE) {
        if (dom.isBlockElement(parent.childNodes[i]) === true) {
          return true;
        }
      }
    }
    return false;
  };
  dom.removeTag = function (element, selector) {
    var nodes = Array.prototype.slice.call(element.querySelectorAll(selector));
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var parent = node.parentNode;
      while (node.firstChild) {
        parent.insertBefore(node.firstChild, node);
      }
      parent.removeChild(node);
    }
    return element;
  };
  dom.stripEnclosingTags = function (content, allowedTags) {
    var c;
    if (typeof content === 'string') {
      c = document.createElement('div');
      c.innerHTML = content;
    } else {
      c = content;
    }
    var allEls = Array.prototype.slice.call(c.querySelectorAll('*'));
    for (var i = allEls.length - 1; i >= 0; i--) {
      var el = allEls[i];
      if (!el.matches(allowedTags)) {
        var parent = el.parentNode;
        if (!parent) continue;
        if (el.childNodes.length === 0) {
          parent.removeChild(el);
        } else {
          while (el.firstChild) {
            parent.insertBefore(el.firstChild, el);
          }
          parent.removeChild(el);
        }
      }
    }
    return c;
  };
  dom.getSiblings = function (element, dir, elementNodesOnly, stopElem) {
    if (elementNodesOnly === true) {
      var elems = [];
      if (dir === 'prev') {
        var prevEl = element.previousElementSibling;
        while (prevEl) {
          elems.push(prevEl);
          prevEl = prevEl.previousElementSibling;
        }
      } else {
        var nextEl = element.nextElementSibling;
        while (nextEl) {
          elems.push(nextEl);
          nextEl = nextEl.nextElementSibling;
        }
      }
      return elems;
    } else {
      var elems = [];
      if (dir === 'prev') {
        while (element.previousSibling) {
          element = element.previousSibling;
          if (element === stopElem) {
            break;
          }
          elems.push(element);
        }
      } else {
        while (element.nextSibling) {
          element = element.nextSibling;
          if (element === stopElem) {
            break;
          }
          elems.push(element);
        }
      }
      return elems;
    }
  };
  dom.getNodeTextContent = function (node) {
    return node.textContent;
  };
  dom.getNodeStubContent = function (node) {
    if (!node.querySelectorAll) return [];
    return Array.prototype.slice.call(node.querySelectorAll(dom.CONTENT_STUB_ELEMENTS.join(', ')));
  };
  dom.hasNoTextOrStubContent = function (node) {
    if (!node) return true;
    if (node.textContent.length > 0) return false;
    if (node.querySelectorAll && node.querySelectorAll(dom.CONTENT_STUB_ELEMENTS.join(', ')).length > 0) return false;
    return true;
  };
  dom.getNodeCharacterLength = function (node) {
    var stubCount = node.querySelectorAll ? node.querySelectorAll(dom.STUB_ELEMENTS.join(', ')).length : 0;
    return node.textContent.length + stubCount;
  };
  dom.setNodeTextContent = function (node, txt) {
    node.textContent = txt;
    return node;
  };
  dom.getTagName = function (node) {
    return node.tagName && node.tagName.toLowerCase() || null;
  };
  dom.getIframeDocument = function (iframe) {
    var doc = null;
    if (iframe.contentDocument) {
      doc = iframe.contentDocument;
    } else if (iframe.contentWindow) {
      doc = iframe.contentWindow.document;
    } else if (iframe.document) {
      doc = iframe.document;
    }
    return doc;
  };
  dom.isBlockElement = function (element) {
    return dom.BLOCK_ELEMENTS.lastIndexOf(element.nodeName.toLowerCase()) != -1;
  };
  dom.isStubElement = function (element) {
    return dom.STUB_ELEMENTS.lastIndexOf(element.nodeName.toLowerCase()) != -1;
  };
  dom.removeBRFromChild = function (node) {
    if (node && node.hasChildNodes()) {
      for(var z=0; z < node.childNodes.length ; z++) {
        var child = node.childNodes[z];
        if (child && (ice.dom.BREAK_ELEMENT == ice.dom.getTagName(child))) {
          child.parentNode.removeChild(child);
        }
      }
    }
  };
  dom.isChildOf = function (el, parent) {
    try {
      while (el && el.parentNode) {
        if (el.parentNode === parent) {
          return true;
        }
        el = el.parentNode;
      }
    } catch (e) {}
    return false;
  };
  dom.isChildOfTagName = function (el, name) {
    try {
      while (el && el.parentNode) {
        if (el.parentNode && el.parentNode.tagName && el.parentNode.tagName.toLowerCase() === name) {
          return el.parentNode;
        }
        el = el.parentNode;
      }
    } catch (e) {}
    return false;
  };


  dom.isChildOfTagNames = function (el, names) {
    try {
      while (el && el.parentNode) {
        if (el.parentNode && el.parentNode.tagName) {
          tagName = el.parentNode.tagName.toLowerCase();
          for (var i = 0; i < names.length; i++) {
            if (tagName === names[i]) {
              return el.parentNode;
            }
          }
        }
        el = el.parentNode;
      }
    } catch (e) {}
    return null;
  };

  dom.isChildOfClassName = function (el, name) {
    try {
      while (el && el.parentNode) {
        if (el.parentNode.classList && el.parentNode.classList.contains(name)) return el.parentNode;
        el = el.parentNode;
      }
    } catch (e) {}
    return null;
  };
  dom.cloneNode = function (elems, cloneEvents) {
    if (elems.length !== undefined) {
      var result = [];
      for (var i = 0; i < elems.length; i++) {
        result.push(elems[i].cloneNode(true));
      }
      return result;
    }
    return [elems.cloneNode(true)];
  };

  dom.bind = function (element, event, callback) {
    element.addEventListener(event, callback);
  };

  dom.unbind = function (element, event, callback) {
    element.removeEventListener(event, callback);
  };

  dom.attr = function (elements, key, val) {
    if (!elements) return undefined;
    if (val) return elements.setAttribute(key, val);
    else return elements.getAttribute(key);
  };
  dom.replaceWith = function (node, replacement) {
    if (!node || !node.parentNode) return;
    if (typeof replacement === 'string') {
      node.outerHTML = replacement;
    } else if (Array.isArray(replacement) || replacement instanceof NodeList) {
      var parent = node.parentNode;
      var frag = document.createDocumentFragment();
      // Copy to array to avoid live collection issues
      var items = Array.prototype.slice.call(replacement);
      for (var i = 0; i < items.length; i++) {
        frag.appendChild(items[i]);
      }
      parent.replaceChild(frag, node);
    } else {
      node.parentNode.replaceChild(replacement, node);
    }
  };
  dom.removeAttr = function (elements, name) {
    elements.removeAttribute(name);
  };
  dom.getElementsBetween = function (fromElem, toElem) {
    var elements = [];
    if (fromElem === toElem) {
      return elements;
    }
    if (dom.isChildOf(toElem, fromElem) === true) {
      var fElemLen = fromElem.childNodes.length;
      for (var i = 0; i < fElemLen; i++) {
        if (fromElem.childNodes[i] === toElem) {
          break;
        } else if (dom.isChildOf(toElem, fromElem.childNodes[i]) === true) {
          return dom.arrayMerge(elements, dom.getElementsBetween(fromElem.childNodes[i], toElem));
        } else {
          elements.push(fromElem.childNodes[i]);
        }
      }
      return elements;
    }
    var startEl = fromElem.nextSibling;
    while (startEl) {
      if (dom.isChildOf(toElem, startEl) === true) {
        elements = dom.arrayMerge(elements, dom.getElementsBetween(startEl, toElem));
        return elements;
      } else if (startEl === toElem) {
        return elements;
      } else {
        elements.push(startEl);
        startEl = startEl.nextSibling;
      }
    }
    var fromParents = dom.getParents(fromElem);
    var toParents = dom.getParents(toElem);
    var parentElems = dom.arrayDiff(fromParents, toParents, true);
    var pElemLen = parentElems.length;
    for (var j = 0; j < (pElemLen - 1); j++) {
      elements = dom.arrayMerge(elements, dom.getSiblings(parentElems[j], 'next'));
    }
    var lastParent = parentElems[(parentElems.length - 1)];
    elements = dom.arrayMerge(elements, dom.getElementsBetween(lastParent, toElem));
    return elements;
  };
  dom.getCommonAncestor = function (a, b) {
    var node = a;
    while (node) {
      if (dom.isChildOf(b, node) === true) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  };
  dom.getNextNode = function (node, container) {
    if (node) {
      while (node.parentNode) {
        if (node === container) {
          return null;
        }

        if (node.nextSibling) {
          // if next sibling is an empty text node, look further
          if (node.nextSibling.nodeType === dom.TEXT_NODE && node.nextSibling.length === 0) {
            node = node.nextSibling;
            continue;
          }

          return dom.getFirstChild(node.nextSibling);
        }
        node = node.parentNode;
      }
    }
    return null;
  };
  dom.getNextContentNode = function (node, container) {
    if (node) {
      while (node.parentNode) {
        if (node === container) {
          return null;
        }

        if (node.nextSibling && dom.canContainTextElement(dom.getBlockParent(node))) {
          // if next sibling is an empty text node, look further
          if (node.nextSibling.nodeType === dom.TEXT_NODE && node.nextSibling.length === 0) {
            node = node.nextSibling;
            continue;
          }

          return node.nextSibling;
        } else if (node.nextElementSibling) {
          return node.nextElementSibling;
        }

        node = node.parentNode;
      }
    }
    return null;
  };


  dom.getPrevNode = function (node, container) {
    if (node) {
      while (node.parentNode) {
        if (node === container) {
          return null;
        }

        if (node.previousSibling) {
          // if previous sibling is an empty text node, look further
          if (node.previousSibling.nodeType === dom.TEXT_NODE && node.previousSibling.length === 0) {
            node = node.previousSibling;
            continue;
          }

          return dom.getLastChild(node.previousSibling);
        }
        node = node.parentNode;
      }
    }
    return null;
  };
  dom.getPrevContentNode = function (node, container) {
    if (node) {
      while (node.parentNode) {
        if (node === container) {
          return null;
        }
        if (node.previousSibling && dom.canContainTextElement(dom.getBlockParent(node))) {

          // if previous sibling is an empty text node, look further
          if (node.previousSibling.nodeType === dom.TEXT_NODE && node.previousSibling.length === 0) {
            node = node.previousSibling;

            continue;
          }
          return node.previousSibling;
        } else if (node.previousElementSibling) {
          return node.previousElementSibling;
        }

        node = node.parentNode;
      }
    }
    return null;
  };

  dom.canContainTextElement = function (element) {
    if (element && element.nodeName) {
      return dom.TEXT_CONTAINER_ELEMENTS.lastIndexOf(element.nodeName.toLowerCase()) != -1;
    } else {
      return false;
    }
  };

  dom.getFirstChild = function (node) {
    if (node.firstChild) {
      if (node.firstChild.nodeType === dom.ELEMENT_NODE) {
        return dom.getFirstChild(node.firstChild);
      } else {
        return node.firstChild;
      }
    }
    return node;
  };
  dom.getLastChild = function (node) {
    if (node.lastChild) {
      if (node.lastChild.nodeType === dom.ELEMENT_NODE) {
        return dom.getLastChild(node.lastChild);
      } else {
        return node.lastChild;
      }
    }
    return node;
  };
  dom.removeEmptyNodes = function (parent, callback) {
    var elems = Array.prototype.slice.call(parent.querySelectorAll('*'));
    var i = elems.length;
    while (i > 0) {
      i--;
      if (elems[i].childNodes.length === 0 && dom.isStubElement(elems[i]) === false) {
        if (!callback || callback.call(this, elems[i]) !== false) {
          dom.remove(elems[i]);
        }
      }
    }
  };
  dom.create = function (html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
  };
  dom.find = function (parent, exp) {
    if (!parent || !parent.querySelectorAll) return [];
    // Quote unquoted attribute values for querySelectorAll compatibility
    // e.g. [data-cid=4] -> [data-cid="4"]
    exp = exp.replace(/\[([^\]~|^$*!]+)=([^\]"'][^\]]*)\]/g, '[$1="$2"]');
    return Array.prototype.slice.call(parent.querySelectorAll(exp));
  };
  dom.children = function (parent, exp) {
    if (!parent || !parent.children) return [];
    var kids = Array.prototype.slice.call(parent.children);
    if (exp) {
      return kids.filter(function(child) {
        return child.matches(exp);
      });
    }
    return kids;
  };
  dom.parent = function (child, exp) {
    var p = child.parentNode;
    if (exp && p && p.matches) {
      return p.matches(exp) ? p : undefined;
    }
    return p;
  };
  dom.parents = function (child, exp) {
    var result = [];
    if (!child) return result;
    var node = child.parentNode;
    while (node && node !== document) {
      if (!exp || (node.matches && node.matches(exp))) {
        result.push(node);
      }
      node = node.parentNode;
    }
    return result;
  };
  dom.is = function (node, exp) {
    if (!node || !node.matches) return false;
    return node.matches(exp);
  };
  dom.extend = function (deep, target) {
    if (typeof deep !== 'boolean') {
      // Shift arguments if `deep` is not provided
      var args = Array.prototype.slice.call(arguments);
      target = deep;
      deep = false;
      for (var i = 1; i < args.length; i++) {
        _mergeObjects(target, args[i], deep);
      }
      return target;
    }
    for (var j = 2; j < arguments.length; j++) {
      _mergeObjects(target, arguments[j], deep);
    }
    return target;
  };
  dom.walk = function (elem, callback, lvl) {
    if (!elem) {
      return;
    }
    if (!lvl) {
      lvl = 0;
    }
    var retVal = callback.call(this, elem, lvl);
    if (retVal === false) {
      return;
    }
    if (elem.childNodes && elem.childNodes.length > 0) {
      dom.walk(elem.firstChild, callback, (lvl + 1));
    } else if (elem.nextSibling) {
      dom.walk(elem.nextSibling, callback, lvl);
    } else if (elem.parentNode && elem.parentNode.nextSibling) {
      dom.walk(elem.parentNode.nextSibling, callback, (lvl - 1));
    }
  };
  dom.revWalk = function (elem, callback) {
    if (!elem) {
      return;
    }
    var retVal = callback.call(this, elem);
    if (retVal === false) {
      return;
    }
    if (elem.childNodes && elem.childNodes.length > 0) {
      dom.walk(elem.lastChild, callback);
    } else if (elem.previousSibling) {
      dom.walk(elem.previousSibling, callback);
    } else if (elem.parentNode && elem.parentNode.previousSibling) {
      dom.walk(elem.parentNode.previousSibling, callback);
    }
  };
  dom.setStyle = function (element, property, value) {
    if (element) {
      element.style[property] = value;
    }
  };
  dom.getStyle = function (element, property) {
    return window.getComputedStyle(element)[property];
  };
  dom.hasClass = function (element, className) {
    return element.classList.contains(className);
  };
  dom.addClass = function (element, classNames) {
    var names = classNames.split(' ');
    for (var i = 0; i < names.length; i++) {
      if (names[i]) element.classList.add(names[i]);
    }
  };
  dom.removeClass = function (element, classNames) {
    var names = classNames.split(' ');
    for (var i = 0; i < names.length; i++) {
      if (names[i]) element.classList.remove(names[i]);
    }
  };
  dom.preventDefault = function (e) {
    e.preventDefault();
    dom.stopPropagation(e);
  };
  dom.stopPropagation = function (e) {
    e.stopPropagation();
  };
  dom.noInclusionInherits = function (child, parent) {
    if (parent instanceof String || typeof parent === 'string') {
      parent = window[parent];
    }
    if (child instanceof String || typeof child === 'string') {
      child = window[child];
    }
    var above = function () {};
    if (dom.isset(parent) === true) {
      for (var value in parent.prototype) {
        if (child.prototype[value]) {
          above.prototype[value] = parent.prototype[value];
          continue;
        }
        child.prototype[value] = parent.prototype[value];
      }
    }
    if (child.prototype) {
      above.prototype.constructor = parent;
      child.prototype['super'] = new above();
    }
  };

  dom.each = function (val, callback) {
    if (Array.isArray(val) || val instanceof NodeList || val instanceof HTMLCollection) {
      for (var i = 0; i < val.length; i++) {
        callback.call(val[i], i, val[i]);
      }
    } else {
      for (var key in val) {
        if (val.hasOwnProperty(key)) {
          callback.call(val[key], key, val[key]);
        }
      }
    }
  };

  dom.foreach = function (value, cb) {
    if (value instanceof Array || value instanceof NodeList || typeof value.length != 'undefined' && typeof value.item != 'undefined') {
      var len = value.length;
      for (var i = 0; i < len; i++) {
        var res = cb.call(this, i, value[i]);
        if (res === false) {
          break;
        }
      }
    } else {
      for (var id in value) {
        if (value.hasOwnProperty(id) === true) {
          // jshint -W004
          var res = cb.call(this, id);
          // jshint +W004
          if (res === false) {
            break;
          }
        }
      }
    }
  };
  dom.isBlank = function (value) {
    if (!value || /^\s*$/.test(value)) {
      return true;
    }
    return false;
  };
  dom.isFn = function (f) {
    if (typeof f === 'function') {
      return true;
    }
    return false;
  };
  dom.isObj = function (v) {
    if (v !== null && typeof v === 'object') {
      return true;
    }
    return false;
  };
  dom.isset = function (v) {
    if (typeof v !== 'undefined' && v !== null) {
      return true;
    }
    return false;
  };
  dom.isArray = function (v) {
    return Array.isArray(v);
  };
  dom.isNumeric = function (str) {
    var result = str.match(/^\d+$/);
    if (result !== null) {
      return true;
    }
    return false;
  };
  dom.getUniqueId = function () {
    var timestamp = (new Date()).getTime();
    var random = Math.ceil(Math.random() * 1000000);
    var id = timestamp + '' + random;
    return id.substr(5, 18).replace(/,/, '');
  };
  dom.inArray = function (needle, haystack) {
    var hln = haystack.length;
    for (var i = 0; i < hln; i++) {
      if (needle === haystack[i]) {
        return true;
      }
    }
    return false;
  };
  dom.arrayDiff = function (array1, array2, firstOnly) {
    var al = array1.length;
    var res = [];
    for (var i = 0; i < al; i++) {
      if (dom.inArray(array1[i], array2) === false) {
        res.push(array1[i]);
      }
    }
    if (firstOnly !== true) {
      al = array2.length;
      for (var j = 0; j < al; j++) {
        if (dom.inArray(array2[j], array1) === false) {
          res.push(array2[j]);
        }
      }
    }
    return res;
  };
  dom.arrayMerge = function (array1, array2) {
    var c = array2.length;
    for (var i = 0; i < c; i++) {
      array1.push(array2[i]);
    }
    return array1;
  };
  /**
   * Removes allowedTags from the given content html string. If allowedTags is a string, then it
   * is expected to be a selector; otherwise, it is expected to be array of string tag names.
   */
  dom.stripTags = function (content, allowedTags) {
    if (typeof allowedTags === "string") {
      var c = document.createElement('div');
      c.innerHTML = content;
      var allEls = Array.prototype.slice.call(c.querySelectorAll('*'));
      for (var i = allEls.length - 1; i >= 0; i--) {
        if (!allEls[i].matches(allowedTags)) {
          allEls[i].parentNode.removeChild(allEls[i]);
        }
      }
      return c.innerHTML;
    } else {
      var match;
      var re = new RegExp(/<\/?(\w+)((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/gim);
      var resCont = content;
      while ((match = re.exec(content)) != null) {
        if (dom.isset(allowedTags) === false || dom.inArray(match[1], allowedTags) !== true) {
          resCont = resCont.replace(match[0], '');
        }
      }
      return resCont;
    }
  };
  dom.browser = function () {
    if (_browser) {
      return dom.extend(false, {}, _browser);
    }

    _browser = (function() {
      function uaMatch( ua ) {
        ua = ua.toLowerCase();

        var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
          /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
          /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
          /(msie) ([\w.]+)/.exec( ua ) ||
          ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
          [];

        return {
          browser: match[ 1 ] || "",
          version: match[ 2 ] || "0"
        };
      }

      var ua = navigator.userAgent.toLowerCase(),
          matched = uaMatch(ua),
          browser = {
            type: "unknown",
            version : 0,
            msie: false
          };

      if ( matched.browser ) {
        browser[ matched.browser ] = true;
        browser.version = matched.version || 0;
        browser.type = matched.browser;
      }

      // Chrome is Webkit, but Webkit is also Safari.
      if ( browser.chrome ) {
        browser.webkit = true;
      } else if ( browser.webkit ) {
        browser.safari = true;
      }
      if (browser.webkit) {
        browser.type = "webkit";
      }
      browser.firefox = (/firefox/.test(ua) == true);
      if (! browser.msie) {
        browser.msie = !! /trident/.test(ua);
      }

      return browser;
    })();

    return dom.extend(false, {}, _browser);
  };
  dom.getBrowserType = function () {
    if (this._browserType === null) {
      var tests = ['msie', 'firefox', 'chrome', 'safari'];
      var tln = tests.length;
      for (var i = 0; i < tln; i++) {
        var r = new RegExp(tests[i], 'i');
        if (r.test(navigator.userAgent) === true) {
          this._browserType = tests[i];
          return this._browserType;
        }
      }

      this._browserType = 'other';
    }
    return this._browserType;
  };
  dom.getWebkitType = function(){
    if(dom.browser().type !== "webkit") {
      console.log("Not a webkit!");
      return false;
    }
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    if(isSafari) return "safari";
    return "chrome";
  };
  dom.isBrowser = function (browser) {
    return (dom.browser().type === browser);
  };

  dom.getBlockParent = function (node, container) {
    if (dom.isBlockElement(node) === true) {
      return node;
    }
    if (node) {
      while (node.parentNode) {
        node = node.parentNode;
        if (node === container) {
          return null;
        }

        if (dom.isBlockElement(node) === true) {
          return node;
        }
      }
    }
    return null;
  };
  dom.findNodeParent = function (node, selector, container) {
    if (node) {
      while (node.parentNode) {
        if (node === container) {
          return null;
        }

        if (dom.is(node, selector) === true) {
          return node;
        }
        node = node.parentNode;
      }
    }
    return null;
  };
  dom.onBlockBoundary = function (leftContainer, rightContainer, blockEls) {
    if (!leftContainer || !rightContainer) return false;
    var bleft = dom.isChildOfTagNames(leftContainer, blockEls) || dom.is(leftContainer, blockEls.join(', ')) && leftContainer || null;
    var bright = dom.isChildOfTagNames(rightContainer, blockEls) || dom.is(rightContainer, blockEls.join(', ')) && rightContainer || null;
    return (bleft !== bright);
  };

  dom.isOnBlockBoundary = function (leftContainer, rightContainer, container) {
    if (!leftContainer || !rightContainer) return false;
    var bleft = dom.getBlockParent(leftContainer, container) || dom.isBlockElement(leftContainer, container) && leftContainer || null;
    var bright = dom.getBlockParent(rightContainer, container) || dom.isBlockElement(rightContainer, container) && rightContainer || null;
    return (bleft !== bright);
  };

  dom.mergeContainers = function (node, mergeToNode) {
    if (!node || !mergeToNode) return false;

    if (node.nodeType === dom.TEXT_NODE || dom.isStubElement(node)) {
      // Move only this node.
      mergeToNode.appendChild(node);
    } else if (node.nodeType === dom.ELEMENT_NODE) {
      // Move all the child nodes to the new parent.
      while (node.firstChild) {
        mergeToNode.appendChild(node.firstChild);
      }

      dom.remove(node);
    }
    return true;
  };

  dom.mergeBlockWithSibling = function (range, block, next) {
    var siblingBlock = next ? block.nextElementSibling : block.previousElementSibling;
    if (next) dom.mergeContainers(siblingBlock, block);
    else dom.mergeContainers(block, siblingBlock);
    range.collapse(true);
    return true;
  };

  dom.date = function (format, timestamp, tsIso8601) {
    if (timestamp === null && tsIso8601) {
      timestamp = dom.tsIso8601ToTimestamp(tsIso8601);
      if (!timestamp) {
        return;
      }
    }
    var date = new Date(timestamp);
    var formats = format.split('');
    var fc = formats.length;
    var dateStr = '';
    for (var i = 0; i < fc; i++) {
      var r = '';
      var f = formats[i];
      switch (f) {
        case 'D':
        case 'l':
          var names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          r = names[date.getDay()];
          if (f === 'D') {
            r = r.substring(0, 3);
          }
          break;
        case 'F':
        case 'm':
          r = date.getMonth() + 1;
          if (r < 10) r = '0' + r;
          break;
        case 'M':
          months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          r = months[date.getMonth()];
          if (f === 'M') {
            r = r.substring(0, 3);
          }
          break;
        case 'd':
          r = date.getDate();
          break;
        case 'S':
          r = dom.getOrdinalSuffix(date.getDate());
          break;
        case 'Y':
          r = date.getFullYear();
          break;
        case 'y':
          r = date.getFullYear();
          r = r.toString().substring(2);
          break;
        case 'H':
          r = date.getHours();
          break;
        case 'h':
          r = date.getHours();
          if (r === 0) {
            r = 12;
          } else if (r > 12) {
            r -= 12;
          }
          break;
        case 'i':
          r = dom.addNumberPadding(date.getMinutes());
          break;
        case 'a':
          r = 'am';
          if (date.getHours() >= 12) {
            r = 'pm';
          }
          break;
        default:
          r = f;
          break;
      }
      dateStr += r;
    }
    return dateStr;
  };
  dom.getOrdinalSuffix = function (number) {
    var suffix = '';
    var tmp = (number % 100);
    if (tmp >= 4 && tmp <= 20) {
      suffix = 'th';
    } else {
      switch (number % 10) {
        case 1:
          suffix = 'st';
          break;
        case 2:
          suffix = 'nd';
          break;
        case 3:
          suffix = 'rd';
          break;
        default:
          suffix = 'th';
          break;
      }
    }
    return suffix;
  };
  dom.addNumberPadding = function (number) {
    if (number < 10) {
      number = '0' + number;
    }
    return number;
  };
  dom.tsIso8601ToTimestamp = function (tsIso8601) {
    var regexp = /(\d\d\d\d)(?:-?(\d\d)(?:-?(\d\d)(?:[T ](\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(?:Z|(?:([-+])(\d\d)(?::?(\d\d))?)?)?)?)?)?/;
    var d = tsIso8601.match(new RegExp(regexp));
    if (d) {
      var date = new Date();
      date.setDate(d[3]);
      date.setFullYear(d[1]);
      date.setMonth(d[2] - 1);
      date.setHours(d[4]);
      date.setMinutes(d[5]);
      date.setSeconds(d[6]);
      var offset = (d[9] * 60);
      if (d[8] === '+') {
        offset *= -1;
      }
      offset -= date.getTimezoneOffset();
      var timestamp = (date.getTime() + (offset * 60 * 1000));
      return timestamp;
    }
    return null;
  };

  exports.dom = dom;

}).call(this.ice);
