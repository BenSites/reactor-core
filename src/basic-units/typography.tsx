import React from 'react';

export const _HEADING_TEXT = Symbol("Heading Text");
export const _HEADING_STYLE = Symbol("Heading Style");

const HeadingComponent = ({text, className, style}) => {
  switch (style) {
    case "h1":
      return <h1 className={className}>{text}</h1>;
    case "h2":
      return <h2 className={className}>{text}</h2>;
    case "h3":
      return <h3 className={className}>{text}</h3>;
    case "h4":
      return <h4 className={className}>{text}</h4>;
    case "h5":
      return <h5 className={className}>{text}</h5>;
    case "h6":
      return <h6 className={className}>{text}</h6>;
    default:
      break;
  }
}

export const HeadingUnit = {
  props: {
    [_HEADING_TEXT]: { defaultValue: "Heading" },
    [_HEADING_STYLE]: { defaultValue: "h1" }
  },
  component: {
    component: HeadingComponent,
    classNames: [],
    props: {
      "text": { kind: "prop", key: _HEADING_TEXT },
      "style": { kind: "prop", key: _HEADING_STYLE }
    }
  },
  children: []
}