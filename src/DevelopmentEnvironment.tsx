import React, { useState, useMemo, useEffect } from 'react';
import jss from 'jss';
import preset from 'jss-preset-default'

import {Unit, makeUnit, ValueDefinitionsForChildParameters, UnitDefinition, UnitRootUsageDefinition} from './Unit.tsx';
import base from './HelloWorldApp.tsx';

jss.setup(preset())

interface AppDefinition {
  styles

  units: {
    [key in symbol]: UnitDefinition
  }

  roots: UnitRootUsageDefinition[]
}

const useJSSStyles = (initialStyles) => {
  const [styles, setStyles] = useState(initialStyles);
  const sheet = useMemo(() => jss.createStyleSheet(styles), [styles]);
  useEffect(() => {
    sheet.attach()
  
    return () => { sheet.detach(); };
  }, [sheet]);

  return sheet.classes;
}

interface Editor {
  editing: boolean;
  setEditing: (boolean) => void;

  selected: boolean;
  select: () => void;
}

interface UnitEditor extends Editor {
  setDefinition: (newDefinition: UnitDefinition) => void;
  _forChild: (childIndex: number) => UnitUsageEditor
}

interface UnitUsageEditor extends Editor {
  setParameters: (newValues: ValueDefinitionsForChildParameters) => void;
}

const DevelopmentEnvironment = () => {
  const [app, setApp] = useState(base);

  const classes = useJSSStyles(app.styles);

  const [editing, setEditing] = useState(true);
  const [selectedUnit, selectUnit] = useState(null);
  const [selectedUnitUsage, selectUnitUsage] = useState(null);
  
  const units = Object.getOwnPropertySymbols(app.units).reduce((obj, key) => {
    const definition: UnitDefinition = app.units[key];

    const setDefinition = (newDefinition: UnitDefinition) => {
      return setApp({...app, units: {...app.units, [key]: newDefinition}});
    };
    
    const editor: UnitEditor = {
      editing, setEditing,
      select: () => { selectUnit(key) }, selected: selectedUnit === key,
      setDefinition: setDefinition,

      _forChild: (childIndex: number): UnitUsageEditor => {
        return {
          editing, setEditing,
          select: () => { selectUnit(key); selectUnitUsage(childIndex) },
          selected: selectedUnit === key && selectedUnitUsage === childIndex,

          setParameters(newValues: ValueDefinitionsForChildParameters) {
            let children = definition.children.slice();
            let child = definition.children[childIndex];

            child.parameterValues = Object.assign({}, child.parameterValues, newValues);

            children[childIndex] = child;
            setDefinition({...definition, children: children})
          }
        };
      }
    }

    return {...obj, [key]: makeUnit(definition, editor)}
  }, {});

  const _ROOT = Symbol("root");

  const getUnit = (key: symbol): Unit => { return units[key] };
  
  return app.roots.map((root, i) => {
    const Unit = units[root.unit];

    const rootEditor = {
      editing, setEditing,
      select: () => { selectUnit(_ROOT); selectUnitUsage(i) },
      selected: selectedUnit === _ROOT && selectedUnitUsage === i,

      setParameters(newValues: ValueDefinitionsForChildParameters) {
        const roots = app.roots.slice();
        const root = roots[i];
        roots[i] = {...root, parameterValues: Object.assign({}, root.parameterValues, newValues)};
        setApp({...app, roots: roots})
      }
    };

    let props = Object.getOwnPropertySymbols(root.props).reduce((obj, prop) => {
      return {...obj, [prop]: root.props[prop].constant}
    }, {})
    
    return <Unit props={props} getUnit={getUnit} classes={classes} usageEditor={rootEditor} key={i} />
  })
}

export { AppDefinition, UnitEditor, UnitUsageEditor };
export default DevelopmentEnvironment;
