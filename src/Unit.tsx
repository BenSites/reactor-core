import './App.css'

import {ConstantValueDefinition, ParameterValueDefinition, ValueFromParentDefinition} from './UnitDefinitions'

interface UnitParameterDefinition<T> {
  readonly key: symbol
  defaultValue?: T
}
interface UnitStateDefinition<T> {
  readonly key: symbol
  initialValue: ConstantValueDefinition<T> | ParameterValueDefinition
}

interface UnitParameterValueDefinition {
  readonly for: symbol
  value: ConstantValueDefinition<any> | ValueFromParentDefinition
}

interface RootUnitParameterValueDefinition extends UnitParameterValueDefinition {
  value: ConstantValueDefinition<any>
}

interface UnitDefinition {
  key: symbol

  classNames?: string[]

  parameters: UnitParameterDefinition<any>[]
  state: UnitStateDefinition<any>[]

  hook?

  children?: UnitChildUsageDefinition[]
}

interface UnitChildUsageDefinition {
  readonly unit: symbol;
  parameterValues: UnitParameterValueDefinition[];
}

interface UnitRootUsageDefinition {
  readonly unit: symbol;
  parameterValues: RootUnitParameterValueDefinition[];
}

interface UnitEditor {
  select: Function
  setDefinition: Function
}

let units = {}

interface ParameterValue {
  for: symbol
  value
}

function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

function defineUnit(definition: UnitDefinition): Symbol {
  const {key, classNames, hook, children} = definition;
  
  const parameterDefaults = definition.parameters.reduce((obj, p) => {
    obj[p.key] = p.defaultValue;
    return obj;
  }, {})

  units[key] = function Unit(parameterValues: ParameterValue[], classes: object, editing?: boolean, editor?: UnitEditor) {
    const className = classNames.map((c) => classes[c]).join(" ");
    const parameters = parameterValues.reduce((obj, val) => {
      obj[val.for] = val.value;
    }, Object.create(parameterDefaults))
    const state = definition.state.reduce((obj, {key, initialValue}) => {
      switch (initialValue.kind) {
        case "constant":  return {...obj, [key]: initialValue.constant};
        case "parameter": return {...obj, [key]: parameters[initialValue.parameterKey]};
        default: assertNever(initialValue); 
      }
    }, {})

    children.map((child) => {
      child
    })

  }

  return key
}


function useUnit<D extends UnitUsageDefinition>(usageDefinition: UnitUsageDefinition) {
  

export {UnitDefinition, defineUnit, useUnit};