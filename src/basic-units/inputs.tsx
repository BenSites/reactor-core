import React from 'react';

export const _INPUT_VALUE = Symbol("Input Value");
export const _INPUT_SETTER = Symbol("Input Setter");

const _INPUT_EVENT_HOOK = Symbol("Input Event Hook");

export const InputUnit = {
  props: {
    [_INPUT_VALUE]: { },
    [_INPUT_SETTER]: { }
  },
  hooks: [
    {
      key: _INPUT_EVENT_HOOK,
      hook: ({setValue}) => {
        return {eventHandler: (e) => setValue(e.target.value)}
      },
      params: {
        "setValue": { kind: "prop", key: _INPUT_SETTER }
      }
    }
  ],
  component: {
    component: "input",
    classNames: [],
    props: {
      "value": { kind: "prop", key: _INPUT_VALUE },
      "onChange": { kind: "hookValue", hook: _INPUT_EVENT_HOOK, key: "eventHandler" }
    }
  }
}