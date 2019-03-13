import React, { useState } from 'react';
import { UnitEditor, UnitUsageEditor } from './DevelopmentEnvironment'
import { type } from 'os';

interface ConstantValueDefinition<T> { kind: "constant"; constant: T }
interface PropValueDefinition    { kind: "prop"; key: symbol }
interface StateValueDefinition   { kind: "state"; key: symbol }
interface StateSetterValueDefinition {  kind: "stateSetter"; key: symbol }
interface HookValueDefinition {  kind: "hookValue"; hook: symbol; key: string }

type ValueDefinition = ConstantValueDefinition<any> | PropValueDefinition | StateValueDefinition | StateSetterValueDefinition | HookValueDefinition;

type PropsDefinition = { [key in symbol]: { defaultValue: ConstantValueDefinition<any> } }

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
  children?: UnitChildUsageDefinition[]
}

interface UnitComponentDefinition {
  component;
  classNames: string[];
  props: { [key: string]: ValueDefinition };
}

interface UnitChildUsageDefinition {
  unit: symbol;
  props: ValueDefinitionMap
}

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

type ValueDefinitionWithProps = ConstantValueDefinition<any> | PropValueDefinition
type ValueFactoryWithProps = (ValueDefinitionWithProps) => any
const _valueFactoryWithProps = (props): ValueFactoryWithProps => {
  return (def: ValueDefinitionWithProps) => {
    switch (def.kind) {
      case "constant": return def.constant;
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
  const {component, children: childrenDefinition, hooks = []} = definition;
  
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
  const Unit = ({props: passedProps, classes, getUnit, usageEditor}: UnitUsageParameters) => {
    const props = Object.assign({}, defaultProps, passedProps);
    const valueFromDefinitionWithProps = _valueFactoryWithProps(props);

    const initialState = makeInitialState(valueFromDefinitionWithProps);
    const [state, setState] = useState(initialState);
    const valueFromDefinitionWithState = _ValueFactoryWithState(valueFromDefinitionWithProps, state, setState);

    const hookValues = hooks.reduce((obj, {hook, key, params}) => {
      const filledParams = Object.keys(params).reduce((obj, k) => {
        return {...obj, [k]: valueFromDefinitionWithState(params[k])}
      }, {});

      return {...obj, [key]: hook(filledParams)};
    }, {});

    const valueFromDefinition = _valueFactoryWithHooks(valueFromDefinitionWithState, hookValues);

    const childrenInstances = childrenDefinition.map((child, i) => {
      const ChildUnit = getUnit(child.unit);
      const childProps = Object.getOwnPropertySymbols(child.props).reduce((obj, k) => {
        return {...obj, [k]: valueFromDefinition(child.props[k])}
      }, {});

      return <ChildUnit props={childProps} getUnit={getUnit} classes={classes} usageEditor={editor._forChild(i)} key={i} />
    });

    if(component == null) {
      return <>{childrenInstances}</>;
    } else {
      const className = component.classNames.map((c) => classes[c]).join(" ");
      
      const props = Object.keys(component.props).reduce((obj, k) => {
        return {...obj, [k]: valueFromDefinition(component.props[k])}
      }, {});

      return <component.component className={className} usageEditor={usageEditor} editor={editor} {...props}>
        {childrenInstances}
      </component.component>;
    }
  };

  return Unit;
}