import React, { useState, useMemo, useEffect } from 'react';
import jss from 'jss';
import preset from 'jss-preset-default'

import {Unit, makeUnit, ValueDefinitionsForChildParameters, UnitDefinition, UnitRootUsageDefinition, PropsDefinition} from './Unit.tsx';
import base from './HelloWorldApp.tsx';
import { UnitChildDefinition } from './Unit';

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
}

interface UnitEditor extends Editor {
  units: symbol[]

  setDefinition: (newDefinition: UnitDefinition) => void;
  _forChild: (childIndex: number) => UnitUsageEditor
}

interface UnitUsageEditor extends Editor {
  readonly propsDefinition: PropsDefinition;

  childDefinition?: UnitChildDefinition;
  setChildDefinition?: (newDefinition: UnitChildDefinition) => void;

  setProps: (newValues: ValueDefinitionsForChildParameters) => void;
}

const DevelopmentEnvironment = () => {
  const [app, setApp] = useState(base);

  const classes = useJSSStyles(app.styles);

  const [editing, setEditing] = useState(true);
  
  const units = Object.getOwnPropertySymbols(app.units).reduce((obj, key) => {
    const definition: UnitDefinition = app.units[key];

    const setDefinition = (newDefinition: UnitDefinition) => {
      return setApp({...app, units: {...app.units, [key]: newDefinition}});
    };
    
    const editor: UnitEditor = {
      editing, setEditing,

      units: Object.getOwnPropertySymbols(app.units),
      setDefinition: setDefinition,

      _forChild: (childIndex: number): UnitUsageEditor => {
        const childDefinition = definition.children[childIndex];
        const childUnitSymbol = (childDefinition.kind == "repeat") ? childDefinition.repeat.unit : childDefinition.unit;
        const childUnitDefinition = app.units[childUnitSymbol];

        const setChildDefinition = (newDefinition) => {
          let children = definition.children.slice();
          children[childIndex] = newDefinition;
          setDefinition({...definition, children: children})
        }

        return {
          editing, setEditing,
          
          childDefinition: childDefinition,
          setChildDefinition,

          propsDefinition: childUnitDefinition.propsDefinition,
          setProps(newValues: ValueDefinitionsForChildParameters) {
            let child = definition.children[childIndex];
            setChildDefinition({...child, parameterValues: Object.assign({}, child.parameterValues, newValues)});
          }
        };
      }
    }

    let Unit = makeUnit(definition, editor);
    Unit.displayName = key.toString();

    return {...obj, [key]: Unit}
  }, {});

  const getUnit = (key: symbol): Unit => { return units[key] };
  
  return app.roots.map((root, i) => {
    const Unit = units[root.unit];

    const rootEditor = {
      editing, setEditing,

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
    
    return <Unit props={props} getUnit={getUnit} classes={classes} usageEditor={rootEditor} key={i}/>
  })
}

export { AppDefinition, UnitEditor, UnitUsageEditor };
export default DevelopmentEnvironment;
