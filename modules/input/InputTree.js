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

export default class InputTree {
    constructor() {
        this.dataSet = [];
        this.ids = new Set();
    }

    add(element) {
        this.dataSet.push(element);
        this.ids.add(element.id)
    }

    get_id(id, count) {
        if (typeof(count) === 'undefined' || count === null) {
            count = 0;
        }
        if (! this.ids.has(id)) {
            return id;
        }
        else {
            count++;
            return this.get_id(id, count)
        }
    }
}

