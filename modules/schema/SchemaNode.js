/*
 * Copyright 2018 The GraphVinci Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import SchemaEdge from './SchemaEdge.js';
import SchemaField from './SchemaField.js';
import ClassVisManager from '../manager/ClassVisManager.js';
import Node from "./Node.js";

export default class SchemaNode extends Node {
    constructor(nodeObj, enumMap, inputMap, type, domain, nameOverride) {
        super(type, domain);
        this.nameOverride = nameOverride;
        this.cloned = !!(nameOverride);
        this.linkCount = 0;
        this.source = nodeObj;
        this.enumMap = enumMap;
        this.inputMap = inputMap;
        this.nvm = new ClassVisManager(this);
        this.fields = new Map();
        this._parse_fields();
        this.superType = nodeObj.kind;
    }

    static clone(from, newName){
        return new SchemaNode(from.source, from.enumMap, from.inputMap, from.type, from.domainInfo, newName);
    }

    fix() {
        this.fx = this.x;
        this.fy = this.y;
    }

    unfix() {
        delete this.fx;
        delete this.fx;
    }

    get id() {
        return (typeof(this.nameOverride) !== 'undefined' && this.nameOverride !== null) ? this.nameOverride : this.source.name;
    }

    get name() {
        return this.id;
    }

    get trueName() {
        return this.source.name;
    }

    get fieldKeys() {
        return this.fields.keys();
    }

    get_edges(nodeMap) {
        let deDup = new Set();
        let edges = [];
        if (this.fields.size === 0) return edges;
        //if (!("fields" in this.source) ||!(Array.isArray(this.source.fields))) return edges;
        for (let schemaField of this.fields.values()) {
            if (this.id === schemaField.rootName) {
                // At some point, we need to do something prettier with self references
                continue;
            }
            if (schemaField.rootKind === "OBJECT" || schemaField.rootKind === "INTERFACE" || schemaField.rootKind === "UNION" || schemaField.rootKind === "ENUM") {
                edges.push(new SchemaEdge(schemaField, this, nodeMap.get(schemaField.rootName), schemaField.domainInfo));
                /*
                Add a domain to domain edge
                 */
                let domainSource = this.parent;
                let domainTarget = nodeMap.get(schemaField.rootName).parent;
                if (domainTarget && domainSource !== domainTarget) {
                    let identifier = "From" + domainSource.id + "To" + domainTarget.id;
                    if (!deDup.has(identifier)) {
                        deDup.add(identifier);
                        edges.push(new SchemaEdge(schemaField, domainSource, domainTarget, this.domainInfo));
                    }
                }
                /*
                Add the Entity to domain edge, and the reverse
                 */
                edges.push(new SchemaEdge(schemaField, this, domainTarget, schemaField.domainInfo));
                edges.push(new SchemaEdge(schemaField, domainSource, nodeMap.get(schemaField.rootName), schemaField.domainInfo));
            }
        }
        return edges;
    };

    set_property_mask(propMask) {
        this.propertyMask = propMask;
    }

    add_field(field) {
        this.fields.set(field.name, field);
    }

    _parse_fields() {
        if (!("fields" in this.source) ||!(Array.isArray(this.source.fields))) return;
        for (let field of this.source.fields) {
            let schemaField = new SchemaField(field, this.enumMap, this.name, this.domainInfo);
            if (this._is_present(field.args)) {
                // Un-map it later, just passing the entire ref for now
                schemaField.add_inputs(this.inputMap);
            }
            switch(schemaField.rootKind) {
                case "SCALAR":
                case "OBJECT":
                case "INTERFACE":
                case "UNION":
                    this.linkCount++;
                    this.fields.set(field.name, schemaField);
                    break;
                case "ENUM":
                    if (this.enumMap.has(field.name)) {
                        schemaField.set_enum(this.enumMap.get(field.name));
                    }
                    this.fields.set(field.name, schemaField);
                    break;
            }
        }
    }

    _is_present(value) {
        if (typeof(value) === 'undefined') return false;
        if (value == null) return false;
        if (Array.isArray(value) && value.length == 0) {
            return false;
        }
        return true;
    }
}
