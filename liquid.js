/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    'use strict';
    var Liquid = require('liquidjs');
    var engine = Liquid();

    function LiquidNode(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.template = n.template;
        this.fieldType = n.fieldType || 'msg';
        this.field = n.field || 'payload';
        this.outputFormat = n.output || 'str';

        var node = this;
        node.on('input', function(msg) {

            var template = node.template;
            if (msg.hasOwnProperty('template')) {
                if (template == '' || template === null) {
                    template = msg.template;
                }
            }

            var outputJSON = (node.outputFormat === 'json');

            engine
                .parseAndRender(template, msg)
                .then( function(result) {
                    if (outputJSON) {
                        result = JSON.parse(result);
                    }
                    if (node.fieldType === 'msg') {
                        RED.util.setMessageProperty(msg, node.field, result);
                    } else if (node.fieldType === 'flow') {
                        node.context().flow.set(node.field, result);
                    } else if (node.fieldType === 'global') {
                        node.context().global.set(node.field, result);
                    }
                    node.send(msg);
                });
        });
    }
    RED.nodes.registerType('liquid',LiquidNode);
    RED.library.register('liquid-templates');
};
