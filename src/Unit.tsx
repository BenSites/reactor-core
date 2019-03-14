import React, { useState, useDebugValue } from 'react';
import { UnitEditor, UnitUsageEditor } from './DevelopmentEnvironment'
import { type } from 'os';

interface ConstantValueDefinition<T> { kind: "constant"; constant: T }
interface EditorValueDefinition { kind: "editor"; }
interface PropValueDefinition    { kind: "prop"; key: symbol }
interface StateValueDefinition   { kind: "state"; key: symbol }
interface StateSetterValueDefinition {  kind: "stateSetter"; key: symbol }
interface HookValueDefinition {  kind: "hookValue"; hook: symbol; key: string }

type ValueDefinition = ConstantValueDefinition<any> | EditorValueDefinition | PropValueDefinition | StateValueDefinition | StateSetterValueDefinition | HookValueDefinition;

type PropsDefinition = { [key in symbol]: { defaultValue?: ConstantValueDefinition<any> } }

type StateInitialValueDefinition<T> = ConstantValueDefinition<T> | PropValueDefinition;
type StateDefinition = { initialValue: StateInitialValueDefinition<any> }

export type ValueDefinitionMap = { [key in symbol]: ValueDefinition };
export type RootPropsValueDefinitionMap =  { [key in symbol]: ConstantValueDefinition<any> };

export type UnitHookDefinition = {
  key: symbol;
  hook: (object) => {[key: string]: any};
  params: { [key: string]: ValueDefinition };
}

export interface UnitDefinition {
  props: PropsDefinition
  state: { [key in symbol]: StateDefinition }
  hooks?: UnitHookDefinition[]
  component?: UnitComponentDefinition
  children?: UnitChildDefinition[]
}

interface UnitComponentDefinition {
  component;
  classNames: string[];
  props: { [key: string]: ValueDefinition };
}

interface UnitChildRepeatDefinition {
  kind: "repeat";
  
  repeat: UnitChildUsageDefinition;
  each: ValueDefinition;
  as: symbol;
}

interface UnitChildUsageDefinition {
  kind?: "usage";

  unit: symbol;
  props: ValueDefinitionMap
}

export type UnitChildDefinition = UnitChildRepeatDefinition | UnitChildUsageDefinition;

export interface UnitRootUsageDefinition {
  unit: symbol;
  props: RootPropsValueDefinitionMap
}

type UnitProps = {[key in symbol]: any}

interface UnitUsageParameters {
  props: UnitProps;
  classes: object;

  getUnit: (symbol) => Unit;

  usageEditor?: UnitUsageEditor;
}

export type Unit = React.FC<UnitUsageParameters>

function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

type ValueDefinitionWithProps = ConstantValueDefinition<any> | PropValueDefinition | EditorValueDefinition
type ValueFactoryWithProps = (ValueDefinitionWithProps) => any
const _valueFactoryWithProps = (props, editor, usageEditor): ValueFactoryWithProps => {
  return (def: ValueDefinitionWithProps) => {
    switch (def.kind) {
      case "constant": return def.constant;
      case "editor": return {editor, usageEditor};
      case "prop": return props[def.key];
      default: assertNever(def); 
    }
  };
}

type ValueDefinitionWithState = ValueDefinitionWithProps | StateValueDefinition | StateSetterValueDefinition
type ValueFactoryWithState = (ValueDefinitionWithState) => any
const _ValueFactoryWithState = (factory: ValueFactoryWithProps, state, setState): ValueFactoryWithState => {
  return (def: ValueDefinitionWithState) => {
    switch (def.kind) {
      case "state": return state[def.key];
      case "stateSetter": return (newVal) => setState({...state, [def.key]: newVal});
      default: return factory(def); 
    }
  };
}

type ValueDefinitionWithHooks = ValueDefinitionWithState | HookValueDefinition;
type ValueFactoryWithHooks = (ValueDefinitionWithState) => any
const _valueFactoryWithHooks = (factory: ValueFactoryWithState, hookValues): ValueFactoryWithHooks => {
  return (def: ValueDefinitionWithHooks) => {
    switch (def.kind) {
      case "hookValue": return hookValues[def.hook][def.key];
      default: return factory(def); 
    }
  };
}

export function makeUnit(definition: UnitDefinition, editor?: UnitEditor): Unit {
  const {component, children: childrenDefinition, hooks: hooksDefinition} = definition;
  
  const defaultProps: UnitProps = Object.getOwnPropertySymbols(definition.props).reduce((obj, key) => {
    let propDef = definition.props[key];
    return {...obj, [key]: propDef.defaultValue};
  }, {});

  const makeInitialState = (valueFromDefinition: ValueFactoryWithProps) => {
    return definition.state == null ? null : Object.getOwnPropertySymbols(definition.state).reduce((obj, key) => {
      const stateDefinition: StateDefinition = definition.state[key];
      const {initialValue} = stateDefinition;

      return {...obj, [key]: valueFromDefinition(initialValue)};
    }, {});
  }

  const makeChild = (def, index, props, valueFromDefinition, classes, getUnit) => {
    const ChildUnit = getUnit(def.unit);
    const childProps = Object.getOwnPropertySymbols(def.props).reduce((obj, k) => {
      return {...obj, [k]: valueFromDefinition(def.props[k])}
    }, props);

    return <ChildUnit props={childProps} getUnit={getUnit} classes={classes} usageEditor={editor._forChild(index)} key={index} />
  }

  const makeChildren = (valueFromDefinition, classes, getUnit) => {
    return (childrenDefinition == null) ? null : childrenDefinition.map((child, i) => {
      switch (child.kind) {
        case "repeat":
          const {repeat, as, each} = child;

          return valueFromDefinition(each).map((item, ii) => {
            return <React.Fragment key={ii}>
              {makeChild(repeat, i, {[as]: item}, valueFromDefinition, classes, getUnit)}
            </React.Fragment>
          });
        default:
          return makeChild(child, i, {}, valueFromDefinition, classes, getUnit)
      }
    });
  }

  const hooks = hooksDefinition && hooksDefinition.map(({hook: useHook, key, params}): [symbol, Function] => {
    return [key, (valueFactory: ValueFactoryWithState) => {
      const filledParams = Object.keys(params).reduce((obj, k) => {
        return {...obj, [k]: valueFactory(params[k])};
      }, {});
      const hookValues = useHook(filledParams);
      useDebugValue(hookValues, (values) => (key.toString() + " => {" + Object.keys(values).map((k) => `${k}: ${values[k]}`).join(", ") + "}") );
      return hookValues;
    }]
  });

  const Unit = ({props: passedProps, classes, getUnit, usageEditor}: UnitUsageParameters) => {
    const props = Object.assign({}, defaultProps, passedProps);
    const valueFromDefinitionWithProps = _valueFactoryWithProps(props, editor, usageEditor);

    const initialState = makeInitialState(valueFromDefinitionWithProps);
    const [state, setState] = useState(initialState);
    const valueFromDefinitionWithState = _ValueFactoryWithState(valueFromDefinitionWithProps, state, setState);

    const hookValues = hooks && hooks.reduce(function useCustomHooks(obj, [key, useHook]) {
      return {...obj, [key]: useHook(valueFromDefinitionWithState)};
    }, {});

    const valueFromDefinition = _valueFactoryWithHooks(valueFromDefinitionWithState, hookValues);

    if(component == null) {
      return <>{makeChildren(valueFromDefinition, classes, getUnit)}</>;
    } else {
      const className = component.classNames.map((c) => classes[c]).join(" ");
      
      const props = Object.keys(component.props).reduce((obj, k) => {
        return {...obj, [k]: valueFromDefinition(component.props[k])}
      }, {});

      return <component.component className={className} {...props}>
        {makeChildren(valueFromDefinition, classes, getUnit)}
      </component.component>;
    }
  };

  return Unit;
}