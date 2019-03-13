import {AppDefinition} from './DevelopmentEnvironment';
import React from 'react';

const _DEFAULT_NAME_PROP = Symbol("Default Name");

const _HELLO_WORLD_UNIT = Symbol("Hello World Unit");
const _HELLO_WORLD_NAME = Symbol("Hello World's name");

const _GREETING_UNIT = Symbol("Hello Message");
const _GREETING_NAME_PROP = Symbol("name");
const _NAME_SPLITTER_HOOK = Symbol("Name Splitter Hook");
const GreetingComponent = ({name}) => <h1>Hello, {name}!</h1>;

const _TEXT_INPUT = Symbol("Text Input");
const _TEXT_INPUT_VALUE = Symbol("Text Input Value");
const _TEXT_INPUT_SETTER = Symbol("Text Input Setter");
const TextInput = ({value, setter}) => <input value={value} onChange={(e) => setter(e.target.value)}></input>;

const app: AppDefinition = {
  styles: {},
  units: {
    [_TEXT_INPUT]: {
      props: {
        [_TEXT_INPUT_VALUE]: { defaultValue: null },
        [_TEXT_INPUT_SETTER]: { defaultValue: null }
      },
      component: {
        component: TextInput,
        classNames: [],
        props: {
          "value": { kind: "prop", key: _TEXT_INPUT_VALUE },
          "setter": { kind: "prop", key: _TEXT_INPUT_SETTER }
        }
      },
      children: []
    },
    [_GREETING_UNIT]: {
      props: {
        [_GREETING_NAME_PROP]: { defaultValue: "World" },
      },
      hooks: [
        {
          key: _NAME_SPLITTER_HOOK,
          hook: ({name}) => {
            const [firstName, lastName] = name.split(" ");
            return {firstName, lastName}
          },
          params: {
            "name": { kind: "prop", key: _GREETING_NAME_PROP }
          }
        }
      ],
      component: {
        component: GreetingComponent,
        classNames: [],
        props: {
          "name": { kind: "hookValue", hook: _NAME_SPLITTER_HOOK, key: "firstName" }
        }
      },
      children: []
    },
    [_HELLO_WORLD_UNIT]: {
      props: {
        [_DEFAULT_NAME_PROP]: { defaultValue: "Unknown" }
      },
      state: {
        [_HELLO_WORLD_NAME]: {
          initialValue: { kind: "prop", key: _DEFAULT_NAME_PROP }
        }
      },
      children: [
        {
          unit: _GREETING_UNIT,
          props: {
            [_GREETING_NAME_PROP]: { kind: "state", key: _HELLO_WORLD_NAME }
          }
        },
        {
          unit: _TEXT_INPUT,
          props: {
            [_TEXT_INPUT_VALUE]: { kind: "state", key: _HELLO_WORLD_NAME },
            [_TEXT_INPUT_SETTER]: { kind: "stateSetter", key: _HELLO_WORLD_NAME }
          }
        }
      ]
    }
  },
  roots: [
    {
      unit: _HELLO_WORLD_UNIT,
      props: {
        [_DEFAULT_NAME_PROP]: { kind: "constant", constant: "World" }
      }
    }
  ]
}

export default app;