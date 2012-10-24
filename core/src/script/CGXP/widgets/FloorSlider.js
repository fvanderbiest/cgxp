/**
 * Copyright (c) 2012 Camptocamp
 *
 * CGXP is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CGXP is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with CGXP.  If not, see <http://www.gnu.org/licenses/>.
 */

/** api: (define)
 *  module = cgxp
 *  class = FloorSlider
 */

Ext.namespace("cgxp");

/** api: constructor
 *  .. class:: FloorSlider(config)
 */
cgxp.FloorSlider = Ext.extend(Ext.Window, {

    /* api: xtype = cgxp_floorslider */
    xtype: 'cgxp_floorslider',

    /** api: config[minValue]
     *  ``Number``
     *  The fist floor value.
     */

    /** api: config[maxValue]
     *  ``Number``
     *  The max floor value.
     */

    /** api: config[maxMeanAll]
     *  ``Boolean``
     *  Max value mean all floor, default is true.
     */

    /** api: config[stateId]
     *  ``String``
     *  Used for the permalink.
     */
    stateId: 'floor',

    /** api: config[mapPanel]
     *  ``GeoExt.MapPanel``
     *  The map panel.
     */
    mapPanel: null,

    /** api: config[anchorPosition]
     *  ``String``
     *  The anchor position, default to 'tl-tl'.
     */
    anchorPosition: 'tl-tl',

    /** api: config[anchorOffsets]
     *  ``Array(Number)``
     *  The offsets from the anchor, default to [45, 10].
     */
    anchorOffsets: [45, 10],

    /** private: property[stateEvents]
     *  ``Array(String)``
     *  Array of state events
     */
    stateEvents: ['floorchange'],

    /** api: config[skyText]
     *  ``String``
     *  L10n text for the sky.
     */
    skyText: 'Sky',

    /** api: config[levelText]
     *  ``String``
     *  L10n text for the window title.
     */
    levelText: 'Level',

    /**
     * private: method[constructor]
     */
    constructor: function(config) {
        var ul = document.createElement('ul');
        for (var i = config.maxValue; i >= config.minValue; i--) {
            var li = Ext.DomHelper.append(ul, {
                tag: 'li',
                html: config.maxMeanAll && i == config.maxValue ?
                        this.skyText : i.toString()
            }, true);
            li.on({
                click: (function(i) {
                    this.setFloor(i);
                    this.slider.setValue(i);
                }).createDelegate(this, [i])
            });
        }

        this.slider = new Ext.slider.SingleSlider({
            increment: 1,
            vertical: true,
            value: config.value,
            minValue: config.minValue,
            maxValue: config.maxValue,
            clickToChange: false,
            height: (config.maxValue - config.minValue + 1) * 13
        });
        config = config || {};
        config = Ext.apply({
            border: false,
            closable: false,
            resizable: false,
            draggable: false,
            title: this.levelText,
            layout: 'hbox',
            cls: 'floor-window',
            items: [this.slider,
                {
                    cls: 'floorlabelscontainer',
                    border: false,
                    contentEl: ul
                }
            ]
        }, config);
        cgxp.FloorSlider.superclass.constructor.call(this, config);

        this.show();
        this.anchorTo.defer(100, this, [this.mapPanel.body,
                this.anchorPosition, this.anchorOffsets]);
    },

    /** private: method[initComponent]
     */
    initComponent: function() {
        cgxp.FloorSlider.superclass.initComponent.call(this);
        this.addEvents(
            /** private: event[floorchange]
             *  Throws when the floor change.
             */
            'floorchange'
        );

        this.slider.on('change', function() {
            this.fireEvent('floorchange');
            var value = this.slider.getValue();
            this.setFloor(this.maxMeanAll && value == this.maxValue ?
                    undefined : value);
        }, this);
    },

    /** private: method[setFloor]
     *  Change the floor in the layers.
     */
    setFloor: function(floor) {
        Ext.each(this.mapPanel.map.layers, function(layer) {
            if (layer.setFloor) {
                layer.setFloor(floor);
            }
            else if (layer.mergeNewParams) { // WMS or WMTS
                layer.mergeNewParams({floor: floor || null});
            }
        }, this);
    },

    /** private: method[saveState]
     */
    getState: function() {
        return {
            val: this.slider.getValue()
        };
    },

    /** private: method[applyState]
     */
    applyState: function(state) {
        if (state.val) {
            var floor = parseInt(state.val);
            this.slider.setValue(floor);
            this.setFloor(floor);
        }
    }
});

/** api: xtype = cgxp_floorslider */
Ext.reg(cgxp.FloorSlider.prototype.xtype, cgxp.FloorSlider);
