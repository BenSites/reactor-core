import {AppDefinition} from './DevelopmentEnvironment';
import React from 'react';

import { HeadingUnit, _HEADING_TEXT, _HEADING_STYLE } from './basic-units/typography.tsx';
import { InputUnit, _INPUT_VALUE, _INPUT_SETTER } from './basic-units/inputs.tsx';

const _HEADING = Symbol("Heading");
const _INPUT_UNIT = Symbol("Input Unit");

const _DEFAULT_NAME_PROP = Symbol("Default Name");

const _HELLO_WORLD_UNIT = Symbol("Hello World Unit");
const _HELLO_WORLD_NAME = Symbol("Hello World's name");

const _GREETING_UNIT = Symbol("Greeting Unit");
const _GREETING_NAME_PROP = Symbol("name");
const _NAME_SPLITTER_HOOK = Symbol("Name Splitter Hook");
const GreetingComponent = ({name}) => <h1>Hello, {name}!</h1>;

const _TEXT_INPUT = Symbol("Text Input");

const _UNIT_DISPLAY_UNIT = Symbol("Unit Display Unit")
const _UNIT_DISPLAY_EDITOR_HOOK = Symbol("Unit Display Editor Hook")

const DisplayUnitsComponent = ({units}) => {
  return units.map(() => {
    
  })
};

const app: AppDefinition = {
  styles: {},
  units: {
    [_HEADING]: HeadingUnit,
    [_INPUT_UNIT]: InputUnit,
    [_UNIT_DISPLAY_UNIT]: {
      props: {},
      hooks: [{
        key: _UNIT_DISPLAY_EDITOR_HOOK,
        hook: ({editor: {editor, usageEditor}}) => {
          return {units: editor.units.map((u) => u.toString())}
        },
        params: {
          "editor": {kind: "editor"}
        }
      }],
      children: [
        {
          kind: "repeat",
          repeat: {
            unit: _HEADING,
            props: {}
          },
          each: {kind: "hookValue", hook: _UNIT_DISPLAY_EDITOR_HOOK, key: "units"},
          as: _HEADING_TEXT
        }
      ]

    },
    [_GREETING_UNIT]: {
      props: {
        [_GREETING_NAME_PROP]: { defaultValue: "World" },
      },
      hooks: [
        {
          key: _NAME_SPLITTER_HOOK,
          hook: ({fullName}) => {
            const [firstName, lastName] = fullName.split(" ");

            return {greeting: `Hello, ${firstName}!`, test: "foobar"}
          },
          params: {
            "fullName": { kind: "prop", key: _GREETING_NAME_PROP }
          }
        }
      ],
      children: [
        {
          unit: _HEADING,
          props: {
            [_HEADING_TEXT]: { kind: "hookValue", hook: _NAME_SPLITTER_HOOK, key: "greeting" }
          }
        }
      ]
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
          unit: _INPUT_UNIT,
          props: {
            [_INPUT_VALUE]: { kind: "state", key: _HELLO_WORLD_NAME },
            [_INPUT_SETTER]: { kind: "stateSetter", key: _HELLO_WORLD_NAME }
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
    },
    {
      unit: _UNIT_DISPLAY_UNIT,
      props: {}
    }
  ]
}

export default app;