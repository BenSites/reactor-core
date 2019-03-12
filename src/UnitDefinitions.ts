interface ConstantValueDefinition<T> {
  kind: "constant"
  constant: T
}
interface ParameterValueDefinition {
  kind: "parameter"
  parameterKey: symbol
}
interface ValueFromParentDefinition {
  kind: "fromParent"
  parentValueKey: symbol
}

export {ConstantValueDefinition, ParameterValueDefinition, ValueFromParentDefinition} 