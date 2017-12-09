/*
 *  Synoptic Panel by OKViz
 *
 *  Copyright (c) SQLBI. OKViz is a trademark of SQLBI Corp.
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import tooltip = powerbi.extensibility.utils.tooltip;
import TooltipEnabledDataPoint = powerbi.extensibility.utils.tooltip.TooltipEnabledDataPoint;
import TooltipEventArgs = powerbi.extensibility.utils.tooltip.TooltipEventArgs;

module powerbi.extensibility.visual {
    
    interface VisualMeta {
        name: string;
        version: string;
        dev: boolean;
    }

    interface VisualViewModel {
        dataPoints: VisualDataPoint[];
        matchIndex: any[];
        enumerationDataPoints: VisualEnumerationDataPoint[];
        legendDataPoints: LegendDataPoint[];
        maps: VisualMap[];
        states: VisualState[];  
        domain: VisualDomain;
        settings: VisualSettings;
        hasHighlights: boolean;
        hasCategories: boolean;
        hasGroups: boolean;
        hasTarget: boolean;
        hasStates: boolean;
        arePercentages?: boolean;
        postUpdateActions: VisualActions;
    }

    interface VisualActions {
        resetCanvas?: boolean;
        resetLabels?: boolean;
        resetSelectionManager?: boolean;
        resetToolbar?: boolean;
    }
    
    interface VisualDataPoint extends SelectableDataPoint {
        category?: string;
        group?: string;
        displayName?: string;
        value?: number;
        highlightValue?: number;
        stateValue?: number;
        highlightStateValue?: number;      
        target?: number;
        color?: string;
        format?: string;
        tooltips?: VisualTooltipDataItem[];

        highlight?:boolean;
    }

    interface VisualMap {
        URL: string;
        data: string;
        displayName: string;
        areas: VisualArea[];
        scale: VisualMapScale;
        mapMeasure: string;
        identities?: any[];
    }

    interface VisualMapScale {
        scale: number;
        translation: [number, number];
    }

    interface VisualMapGallery {
        html?: string;
        folders: string[];
        items: any[];
        retreiving: boolean;
        visible: boolean;
    }

    interface VisualArea {
        selector: string;
        elementId: string;
        displayName: string;
        unmatchable: boolean;
        matchableParent: any;
        sourceStyle: VisualStyle;
    }

    interface VisualStyle {
        fill?: string;
        fillOpacity?: string;
        stroke?: string;
        strokeOpacity?: string;
        strokeWidth?: string;
        opacity?: string;
    }

    interface VisualState {
        value: number;
        color?: string;
        displayName?: string;
        isTarget: boolean;
        sourcePosition: number;
        identity: any;
        dataPointIdentity?:any;
    }

    interface VisualEnumerationDataPoint {
        displayName: string;     
        color?: string;
        identity: any;
    }

    interface VisualDomain {
        start?: number;
        end?: number;
        startTargetVariance?: number;
        endTargetVariance?: number
    }

    interface VisualSettings {
        general: {
            showUnmatched: boolean;
            strictValidation: boolean;
            imageSelected: number;
            imageData?: string;
        },
        toolbar: {
            keep: boolean;
            filter: boolean;
            zoom: boolean;
        },
        dataPoint: {
            unmatchedFill?: Fill;
            borders: boolean;
            defaultFill: Fill;
            showAll: boolean;
            colorByCategory?: boolean;
            saturate: boolean;
            saturateMin: number;
            saturateMax: number;
        };
        states: {
            show: boolean;
            calculate: string;
            comparison: string;
            fontSize: number;
            manualState1?: number;
            manualState1Fill?: Fill;
            manualState2?: number;
            manualState2Fill?: Fill;
            manualState3?: number;
            manualState3Fill?: Fill;
            manualState4?: number;
            manualState4Fill?: Fill;
            manualState5?: number;
            manualState5Fill?: Fill;
        };
        dataLabels : {
            show: boolean;
            unmatchedLabels: boolean;
            labelStyle: string;
            position: string;
            enclose: boolean;
            wordWrap: boolean;
            fill?: Fill;
            fontFamily: string;
            fontSize: number;
            unit?: number; 
            precision?: number; 
            locale?: string;
            zoomEnlarge: boolean;
        };
        legend: {
            show: boolean;
            position: string;
            showTitle: boolean;
            titleText: string;
            labelColor: Fill;
            fontSize: number;
        };

        colorBlind?: {
            vision?: string;
        }
    }

    function defaultSettings(): VisualSettings {

        return {
            general: {
                showUnmatched: true,
                strictValidation: false,
                imageSelected: 0
            },
            toolbar: {
                keep: false,
                filter: false,
                zoom: true
            },
            dataPoint: {
                borders: true,
                defaultFill: { solid: { color: "#01B8AA" } },
                showAll: false,
                colorByCategory: true,
                saturate: false,
                saturateMin: 0,
                saturateMax: 100
            },
            states: {
                show: true,
                comparison: '>',
                calculate: 'absolute',
                fontSize: 10
            },
            dataLabels: {
               show: false,
               unmatchedLabels: true,
               labelStyle: "category",
               position: "best",
               enclose: true,
               wordWrap: true,
               fontSize: 9,
               fontFamily:  'wf_standard-font,helvetica,arial,sans-serif',
               unit: 0,
               locale: '',
               zoomEnlarge: true
           },
           legend: {
                show: false,
                position: 'Top',
                showTitle: false,
                titleText: '',
                labelColor: {solid: { color: "#666" } },
                fontSize: 8
            },
            colorBlind: {
                vision: "Normal"
            }
        };
    }

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost, previousModel: VisualViewModel): VisualViewModel {

        //Get DataViews
        let dataViews = options.dataViews;
        let hasDataViews = (dataViews && dataViews[0]);
        let hasCategoricalData = (hasDataViews && dataViews[0].categorical && dataViews[0].categorical.values);
        let hasSettings = (hasDataViews && dataViews[0].metadata && dataViews[0].metadata.objects);

        //Get Settings
        let settings: VisualSettings = defaultSettings();
        if (hasSettings) {
            let objects = dataViews[0].metadata.objects;
            settings = {
                 general: {
                    showUnmatched: getValue<boolean>(objects, "general", "showUnmatched", settings.general.showUnmatched),
                    strictValidation: getValue<boolean>(objects, "general", "strictValidation", settings.general.strictValidation),
                    imageSelected: getValue<number>(objects, "general", "imageSelected", settings.general.imageSelected),
                    imageData: getValue<string>(objects, "general", "imageData", settings.general.imageData)
                },
                toolbar: {
                    keep: getValue<boolean>(objects, "toolbar", "keep", settings.toolbar.keep),
                    filter: getValue<boolean>(objects, "toolbar", "filter", settings.toolbar.filter),
                    zoom: getValue<boolean>(objects, "toolbar", "zoom", settings.toolbar.zoom)
                },
                dataPoint: {
                    unmatchedFill: getValue<Fill>(objects, "dataPoint", "unmatchedFill", settings.dataPoint.unmatchedFill),
                    borders: getValue<boolean>(objects, "dataPoint", "borders", settings.dataPoint.borders),
                    defaultFill: getValue<Fill>(objects, "dataPoint", "defaultFill", settings.dataPoint.defaultFill),
                    showAll: getValue<boolean>(objects, "dataPoint", "showAll", settings.dataPoint.showAll),
                    colorByCategory: getValue<boolean>(objects, "dataPoint", "colorByCategory", settings.dataPoint.colorByCategory),
                    saturate: getValue<boolean>(objects, "dataPoint", "saturate", settings.dataPoint.saturate),
                    saturateMin: getValue<number>(objects, "dataPoint", "saturateMin", settings.dataPoint.saturateMin),
                    saturateMax: getValue<number>(objects, "dataPoint", "saturateMax", settings.dataPoint.saturateMax),
                },
                dataLabels: {
                    show: getValue<boolean>(objects, "dataLabels", "show", settings.dataLabels.show),
                    unmatchedLabels: getValue<boolean>(objects, "dataLabels", "unmatchedLabels", settings.dataLabels.unmatchedLabels),
                    labelStyle: getValue<string>(objects, "dataLabels", "labelStyle", settings.dataLabels.labelStyle),
                    position: getValue<string>(objects, "dataLabels", "position", settings.dataLabels.position),
                    enclose: getValue<boolean>(objects, "dataLabels", "enclose", settings.dataLabels.enclose),
                    wordWrap: getValue<boolean>(objects, "dataLabels", "wordWrap", settings.dataLabels.wordWrap),
                    fill: getValue<Fill>(objects, "dataLabels", "fill", settings.dataLabels.fill),
                    fontSize: getValue<number>(objects, "dataLabels", "fontSize", settings.dataLabels.fontSize),
                    fontFamily: getValue<string>(objects, "dataLabels", "fontFamily", settings.dataLabels.fontFamily),
                    unit: getValue<number>(objects, "dataLabels", "unit", settings.dataLabels.unit),
                    precision: getValue<number>(objects, "dataLabels", "precision", settings.dataLabels.precision),
                    locale: getValue<string>(objects, "dataLabels", "locale", settings.dataLabels.locale),
                    zoomEnlarge: getValue<boolean>(objects, "dataLabels", "zoomEnlarge", settings.dataLabels.zoomEnlarge)
                },
                states: {
                    show: getValue<boolean>(objects, "states", "show", settings.states.show),
                    calculate: getValue<string>(objects, "states", "calculate", settings.states.calculate),
                    comparison: getValue<string>(objects, "states", "comparison", settings.states.comparison),
                    fontSize: getValue<number>(objects, "states", "fontSize", settings.states.fontSize),
                    manualState1: getValue<number>(objects, "states", "manualState1", settings.states.manualState1),
                    manualState1Fill: getValue<Fill>(objects, "states", "manualState1Fill", settings.states.manualState1Fill),
                    manualState2: getValue<number>(objects, "states", "manualState2", settings.states.manualState2),
                    manualState2Fill: getValue<Fill>(objects, "states", "manualState2Fill", settings.states.manualState2Fill),
                    manualState3: getValue<number>(objects, "states", "manualState3", settings.states.manualState3),
                    manualState3Fill: getValue<Fill>(objects, "states", "manualState3Fill", settings.states.manualState3Fill),
                    manualState4: getValue<number>(objects, "states", "manualState4", settings.states.manualState4),
                    manualState4Fill: getValue<Fill>(objects, "states", "manualState4Fill", settings.states.manualState4Fill),
                    manualState5: getValue<number>(objects, "states", "manualState5", settings.states.manualState5),
                    manualState5Fill: getValue<Fill>(objects, "states", "manualState5Fill", settings.states.manualState5Fill)
                },
               legend: {
                    show: getValue<boolean>(objects, "legend", "show", settings.legend.show),
                    position: getValue<string>(objects, "legend", "position", settings.legend.position),
                    showTitle: getValue<boolean>(objects, "legend", "showTitle", settings.legend.showTitle),
                    titleText: getValue<string>(objects, "legend", "titleText", settings.legend.titleText),
                    labelColor: getValue<Fill>(objects, "legend", "labelColor", settings.legend.labelColor),
                    fontSize: getValue<number>(objects, "legend", "fontSize", settings.legend.fontSize)
                },

                colorBlind: {
                     vision: getValue<string>(objects, "colorBlind", "vision", settings.colorBlind.vision),
                }
            }

            //Adjust some properties
            if (settings.dataLabels.locale == '') settings.dataLabels.locale = host.locale;
            settings.dataPoint.saturateMax = Math.max(settings.dataPoint.saturateMin + 1, settings.dataPoint.saturateMax);
        }

        //Get DataPoints
        let domain: VisualDomain = { };
        let dataPoints: VisualDataPoint[] = [];
        let matchIndex = [];
        let enumerationDataPoints: VisualEnumerationDataPoint[] = [];
        let legendDataPoints: LegendDataPoint[] = [];
        let maps: VisualMap[] = [];
        let hasHighlights = false;
        let hasCategories = false;
        let hasGroups = false;
        let hasTarget = false;
        let hasStates = false;
        let arePercentages = false;

        let postUpdateActions: VisualActions = {
            resetCanvas: true, 
            resetLabels: true,
            resetSelectionManager: false
        };

        let states = [];

        if (hasCategoricalData) {

            let dataCategorical = dataViews[0].categorical;
            let category;
            let mapCategory;
            let mapMeasure;
            

            if (dataCategorical.categories && dataCategorical.categories.length > 0) {

                for (let i = 0; i < dataCategorical.categories.length; i++) {

                    if (dataCategorical.categories[i].source.roles['Category']) { //legend -> Category for legacy compatibility
                        category = dataCategorical.categories[i];
                    }

                    if (dataCategorical.categories[i].source.roles['MapSeries']) { //maps -> MapSeries for legacy compatibility
                        mapCategory = dataCategorical.categories[i];
                        mapMeasure = mapCategory.source.queryName;
    
                        
                        for (let ii = 0; ii < mapCategory.values.length; ii++) {

                            let value = String(mapCategory.values[ii]);
                            if (value) {
                                let isURL = OKVizUtility.isValidURL(value);
                                let identity = host.createSelectionIdBuilder().withCategory(mapCategory, ii).createSelectionId();

                                let existingMapIndex = maps.map(x => (isURL ? x.URL : x.data.substr(0, 256))).indexOf(value.substr(0, 256));
                                if (existingMapIndex == -1) {

                                    let displayName;
                                    if (isURL) {
                                        displayName = OKVizUtility.makeURLReadable(value);
                                    } else {
                                        displayName = "Bound map " + (maps.length + 1);
                                    }
                  
                                    maps.push({
                                        URL: (isURL ? value : null),
                                        data: (isURL ? null : value),
                                        displayName: displayName,
                                        areas: [],
                                        scale: { scale: 1, translation: [0, 0] },
                                        mapMeasure: mapMeasure,
                                        identities: [identity]
                                    });
                                } else {
                                    maps[existingMapIndex].identities.push(identity);
                                }
                            }
                        }

                        if (previousModel.settings.toolbar && previousModel.settings.toolbar.filter !== settings.toolbar.filter)
                            postUpdateActions.resetSelectionManager = true;
                        
                    }


                }

                //This solve when there is no category, but maps
                if (mapCategory && !category)
                    category = mapCategory; 
            }

            
            if (!mapMeasure) {

                if (settings.general.imageData) {

                    //Detect the data is stored
                    try{ 
                        //Image data is JSON encoded array - the new way
                        maps = JSON.parse(settings.general.imageData);

                     } catch (e) { 

                        //Image data is an URL or file content - the old way
                        let isURL = OKVizUtility.isValidURL(settings.general.imageData);
                        maps = [{
                            URL: (isURL ? settings.general.imageData : null),
                            data: (isURL ? null : settings.general.imageData),
                            displayName: (isURL ? OKVizUtility.makeURLReadable(settings.general.imageData) : 'Local file'),
                            areas: [],
                            scale: { scale: 1, translation: [0, 0] },
                            mapMeasure: null,
                            identities: null
                        }];
                    };
                }

                //This assure no memory on map measure
                if (maps.length > 0 && maps[0].mapMeasure) 
                    maps = [];
            }

            //Check cached maps
            let useCachedMaps = (previousModel.maps.length > 0 && previousModel.maps.length == maps.length && previousModel.settings.general.imageSelected == settings.general.imageSelected);
            if (useCachedMaps) {
                for(let m = 0; m < previousModel.maps.length; m++) {
                    let previousMap = previousModel.maps[m];
                    if (previousMap.mapMeasure != mapMeasure || previousMap.URL != maps[m].URL) {
                        useCachedMaps = false;
                        break;
                    }
                }
            }
            if (useCachedMaps) {
                maps = previousModel.maps;
                postUpdateActions.resetCanvas = false;
            }

            let categories = (category ? category.values : ['']);
            let categoryMeasure = (category ? category.source.displayName : null);
            let groups = dataCategorical.values.grouped();

            if (category) hasCategories = true;

            let categoriesWithData = {};
            let groupsWithData = {};

            for (let c = 0; c < categories.length; c++) {

                let categoryValue = categories[c];

                for (let g = 0; g < groups.length; g++) {

                    let group = groups[g];
                    let groupName = group.name;

                    if (groupName) hasGroups = true;

                    let dataPoint: VisualDataPoint = {
                        category: OKVizUtility.makeMeasureReadable(categoryValue),
                        group: OKVizUtility.makeMeasureReadable(groupName),
                        selected: false,
                        identity: null,
                        tooltips: []
                    };

                    let addDataPoint = false;

                    for (let i = 0; i < group.values.length; i++) {

                        let dataValue = group.values[i]; 

                        //Check if multiple values belong to same group - if so display the measure name instead of the group name
                        let useGroupNameAsDisplayName = false;
                        if (groupName) {
                            useGroupNameAsDisplayName = true;
                            let groupValues = 0;
                            for (let ii = 0; ii < dataValue.values.length; ii++) {
                                if (dataValue.values[ii] !== null) groupValues++;
                                if (groupValues > 1) {
                                    useGroupNameAsDisplayName = false;
                                    break;
                                }
                            }
                        }


                        let value: any = dataValue.values[c];
                        let highlightValue: any = value;
                        let addRegularTooltip = false;

                        if (value !== null) {
                            
                            if (dataValue.source.roles['Y']){ //values -> Y for legacy compatibility
                                
                                addDataPoint = true;
                                
                                domain.start = (domain.start !== undefined ? Math.min(domain.start, value) : value);
                                domain.end = (domain.end !== undefined ? Math.max(domain.end, value) : value);

                                dataPoint.value = value;

                                if (dataValue.highlights) {
                                    dataPoint.highlight = true;
                                    dataPoint.highlightValue = <any>dataValue.highlights[c];
                                    highlightValue = dataPoint.highlightValue;
                                    hasHighlights = true;
                                }
                                dataPoint.format = dataValue.source.format;
                              
                                if (dataValue.source.format && dataValue.source.format.indexOf('%') > -1)
                                    arePercentages = true;

                                if (groupName) {
                                    dataPoint.identity = host.createSelectionIdBuilder().withSeries(dataCategorical.values, group).createSelectionId();
                                    dataPoint.displayName = (useGroupNameAsDisplayName ? dataPoint.group : (category ? dataPoint.category : dataValue.source.displayName));

                                } else if (category) {
                                    dataPoint.identity = host.createSelectionIdBuilder().withCategory(category, c).createSelectionId();
                                    dataPoint.displayName = dataPoint.category;

                                } else {
                                    dataPoint.identity = host.createSelectionIdBuilder().withMeasure(dataValue.source.queryName).createSelectionId();
                                    dataPoint.displayName = dataValue.source.displayName;
                                }

                                let enumerateName;
                                let enumerateIdentity; 
                                let color;
      
                                if (groupName && (!category || !settings.dataPoint.colorByCategory)) {
                                    
                                    enumerateIdentity = host.createSelectionIdBuilder().withSeries(dataCategorical.values, group).createSelectionId();
                                    enumerateName = dataPoint.group;

                                    if (settings.dataPoint.showAll) {
                                        let defaultColor: Fill = { solid: { color: host.colorPalette.getColor(category ? dataPoint.category : enumerateName).value } };

                                        color = getValue<Fill>(group.objects, 'dataPoint', 'fill', defaultColor).solid.color;
                                    } else {
                                        color = settings.dataPoint.defaultFill.solid.color;
                                    }

                                } else if (category) {

                                    enumerateIdentity = host.createSelectionIdBuilder().withCategory(category, c).createSelectionId();
                                    enumerateName =  dataPoint.category;

                                    if (settings.dataPoint.showAll) {
                                        let defaultColor: Fill = { solid: { color: host.colorPalette.getColor(enumerateName).value } };

                                        color = getCategoricalObjectValue<Fill>(category, c, 'dataPoint', 'fill', defaultColor).solid.color;
                                        
                                    } else {
                                        color = settings.dataPoint.defaultFill.solid.color;
                                    }

                                } else {

                                    enumerateIdentity = host.createSelectionIdBuilder().withMeasure(dataValue.source.queryName).createSelectionId();
                                    enumerateName = dataPoint.displayName;

                                    let defaultColor: Fill = { solid: { color: host.colorPalette.getColor(enumerateName).value } };

                                    color = getValue<Fill>(dataValue.source.objects, 'dataPoint', 'fill', defaultColor).solid.color;

                                }

                                dataPoint.color = color;

                                if (enumerationDataPoints.map(x => x.displayName).indexOf(enumerateName) == -1) {

                                    enumerationDataPoints.push(<VisualEnumerationDataPoint>{
                                        displayName: enumerateName,
                                        color: color,
                                        identity: enumerateIdentity
                                    });

                                    legendDataPoints.push({
                                        label: enumerateName,
                                        color: color,
                                        icon: LegendIcon.Circle,
                                        identity: enumerateIdentity,
                                        selected: false
                                    });
                                    
                                }

                                if (category) {
                                    dataPoint.tooltips.push(<VisualTooltipDataItem>{
                                        displayName: (categoryMeasure || "Category"),
                                        value: dataPoint.category
                                    });
                                }
                                if (groupName) {
                                    dataPoint.tooltips.push(<VisualTooltipDataItem>{
                                        displayName: ("Subcategory"),
                                        value: dataPoint.group
                                    });
                                }

                                addRegularTooltip = true;
                            }
                            
                            

                            if (dataValue.source.roles['State']){ //statesMeasure -> State for legacy compatibility

                                dataPoint.stateValue = value;
                                if (dataValue.highlights) {
                                    dataPoint.highlightStateValue = <any>dataValue.highlights[c];
                                    highlightValue = dataPoint.highlightStateValue;
                                }

                                addRegularTooltip = true;
                            }

                            let isTarget = (dataValue.source.roles['target']); 
                            if (isTarget) {

                                dataPoint.target = value;
                                addRegularTooltip = true;
                                hasTarget = true;
                            }

                            let isState = (dataValue.source.roles['states']);
                            if (isState) hasStates = true;

                            if (isState|| isTarget) {

                                
                                //if (states.map(x => x.displayName).indexOf(dataValue.source.displayName) == -1) {
                                    if (isTarget) {
                                        if (settings.states.calculate == 'modifier' || settings.states.calculate == 'percentage')
                                            value = 0;
                                    }

                                    let color = getValue<Fill>(dataValue.source.objects, 'states', 'fill', null);

                                    states.push({
                                        value: value,
                                        color: (color ? color.solid.color : null),
                                        displayName: dataValue.source.displayName,
                                        isTarget: isTarget,
                                        sourcePosition: states.length,
                                        identity: host.createSelectionIdBuilder().withMeasure(dataValue.source.queryName).createSelectionId(),
                                        dataPointIdentity: dataPoint.identity
                                    });
                                //}

                            }

                            if (dataValue.source.roles['tooltips']){
                              
                                addRegularTooltip = true;
                            }

                            if (addRegularTooltip) {

                                let formattedValue = OKVizUtility.Formatter.format((hasHighlights ? highlightValue : value), {
                                    format: dataValue.source.format,
                                    value: settings.dataLabels.unit,
                                    precision: settings.dataLabels.precision,
                                    formatSingleValues: false,
                                    displayUnitSystemType: 1,
                                    allowFormatBeautification: false,
                                    cultureSelector: settings.dataLabels.locale
                                });

                                dataPoint.tooltips.push(<VisualTooltipDataItem>{
                                     displayName: dataValue.source.displayName,
                                     value: formattedValue
                                 });
                             }
                        }

                    }

                    if (addDataPoint) {

                         if (dataPoint.stateValue == null) {
                            dataPoint.stateValue = dataPoint.value;
                            dataPoint.highlightStateValue = dataPoint.highlightValue;
                        }

                        //Mark group and category as included
                        if (dataPoint.value !== null) {
                            categoriesWithData['c' + c] = true;
                            groupsWithData['g' + g] = true;
                        }

                        if (dataPoint.target !== null && dataPoint.stateValue !== null) {
                            let diff = (dataPoint.stateValue - dataPoint.target);
                            let variance = (arePercentages ? diff : (diff / dataPoint.target)); // + 1;

                            if (!isNaN(variance)) {
                                domain.startTargetVariance = (!domain.startTargetVariance ? variance : Math.min(domain.startTargetVariance, variance));
                                domain.endTargetVariance = (!domain.endTargetVariance ? variance : Math.max(domain.endTargetVariance, variance));
                            }
                        }

                        //This index speed the area matching process
                        let supported = ['illustrator', 'inkscape', 'legacy'];
                        for (let s = 0; s < supported.length; s++) {
                            if (category || groupName) {
                                if (category)
                                    matchIndex[Visual.SVGId(dataPoint.category, supported[s]).toLowerCase()] = dataPoints.length;

                                if (groupName)
                                    matchIndex[Visual.SVGId(dataPoint.group, supported[s]).toLowerCase()] = dataPoints.length;
    
                            } else {
                                matchIndex[Visual.SVGId(dataPoint.displayName, supported[s]).toLowerCase()] = dataPoints.length;
                            }
                        }

                        dataPoints.push(dataPoint);
                        
                    }
                    
  
                }

            } 


            //Check no data points
            //[Coding Horror] Repeating too much code
          
            let missedCategories = Object.keys(categoriesWithData).length != categories.length;
            let missedGroups = Object.keys(groupsWithData).length != groups.length;
            if (missedCategories || missedGroups) {
             
                if (missedCategories) {
                    for (let c = 0; c < categories.length; c++) {
                        if (!(('c'+c) in categoriesWithData)) {
                            let categoryValue = categories[c];
                            let displayName = OKVizUtility.makeMeasureReadable(categoryValue);
                            let identity = host.createSelectionIdBuilder().withCategory(category, c).createSelectionId();

                            let color = settings.dataPoint.defaultFill.solid.color;
                            if (settings.dataPoint.showAll) {
                                let defaultColor: Fill = { solid: { color: host.colorPalette.getColor(displayName).value } };
                                color = getCategoricalObjectValue<Fill>(category, c, 'dataPoint', 'fill', defaultColor).solid.color;
                            }

                            dataPoints.push(<VisualDataPoint>{
                                category: displayName,
                                identity: identity,
                                selected: false,
                                displayName: displayName,
                                color: color,
                                tooltips: [<VisualTooltipDataItem>{
                                    displayName:  (categoryMeasure || "Legend"),
                                    value: displayName
                                }]
                            });

                            enumerationDataPoints.push(<VisualEnumerationDataPoint>{
                                displayName: displayName,
                                color: color,
                                identity: identity
                            });
                        }
                    }
                }

                if (missedGroups) {
                    for (let g = 0; g < groups.length; g++) {

                        if (!(('g'+g) in groupsWithData)) {
                            let group = groups[g];
                           
                            let displayName = OKVizUtility.makeMeasureReadable(group.name);
                            let identity = host.createSelectionIdBuilder().withSeries(dataCategorical.values, group).createSelectionId();

                            let color = settings.dataPoint.defaultFill.solid.color;
                            if (!category) {
                                if (settings.dataPoint.showAll) {
                                    let defaultColor: Fill = { solid: { color: host.colorPalette.getColor(displayName).value } };
                                    color = getValue<Fill>(group.objects, 'dataPoint', 'fill', defaultColor).solid.color;
                                }
                            }

                            dataPoints.push(<VisualDataPoint>{
                                group: displayName,
                                identity: identity,
                                selected: false,
                                displayName: displayName,
                                color: color,
                                tooltips: [<VisualTooltipDataItem>{
                                    displayName: "Details",
                                    value: displayName
                                }]
                            });

                            if (!category) {
                                enumerationDataPoints.push(<VisualEnumerationDataPoint>{
                                    displayName: displayName,
                                    color: color,
                                    identity: identity
                                });
                            }

                        }
                    } 

                }
             
            }


        }

        //Adjust states 
        if (!hasTarget) settings.states.calculate = 'absolute';

        if (hasStates) {

            //Sort states
            if (settings.states.comparison == '=') {
                //Do nothing

            } else {

                var order = (settings.states.comparison.indexOf('<') > -1 ? 'asc' : 'desc');
                states.sort(function (a,b) {

                    let pos = (order == 'asc' ? a.value - b.value : b.value - a.value);
                    if (pos) return pos;

                    pos = (order == 'asc' ? a.sourcePosition - b.sourcePosition : b.sourcePosition - a.sourcePosition);

                    return pos;
                });
            }

        } else {

            //Add manual states
            for (let s = 1; s <= 5; s++) {
                let v = "manualState" + s;
                let f = v + "Fill";

                if (settings.states[v] !== null && settings.states[f]) {
                    states.push({
                        value: settings.states[v],
                        color: settings.states[f].solid.color,
                        displayName: null,
                        isTarget: false,
                        sourcePosition: s,
                        identity: null,
                        dataPointIdentity: null
                    });
                }
            }
        }

        //Move target to the last position
        if (hasTarget) {
            for (let s = 0; s < states.length; s++) {
                if (states[s].isTarget){
                    let spliced = states.splice(s, 1);
                    states = states.concat(spliced);
              
                }
            }
        } 

        //Assign special palette to measure bound
        if (hasStates) {
            let statesPalette = OKVizUtility.defaultPaletteForStates(states.length, settings.states.comparison);
            for (let s = 0; s < states.length; s++) {
                if (!states[s].color)
                    states[s].color = statesPalette[s];
            }
        }

        if (!domain.start) domain.start = 0;
        if (!domain.startTargetVariance) domain.startTargetVariance = 0;
        if (!domain.end) domain.end = 0;
        if (!domain.endTargetVariance) domain.endTargetVariance = 0;
        
        //Check if to reset labels
        if (!postUpdateActions.resetCanvas && previousModel && (
            OKVizUtility.objectsAreEqual(previousModel.settings.dataLabels, settings.dataLabels) &&
            OKVizUtility.objectsAreEqual(previousModel.settings.dataPoint, settings.dataPoint) &&
            OKVizUtility.objectsAreEqual(previousModel.dataPoints, dataPoints) &&
            OKVizUtility.objectsAreEqual(previousModel.states, states) &&
            previousModel.settings.general.showUnmatched == settings.general.showUnmatched
        ))
            postUpdateActions.resetLabels = false;

        //Check if to reset toolbar
        if (previousModel && previousModel.settings && previousModel.settings.toolbar && previousModel.settings.toolbar.zoom != settings.toolbar.zoom)
            postUpdateActions.resetToolbar = true;

        return {
            dataPoints: dataPoints,
            matchIndex: matchIndex,
            enumerationDataPoints: enumerationDataPoints,
            legendDataPoints: legendDataPoints,
            maps: maps,
            states: states,
            domain: domain,
            settings: settings,
            hasHighlights: hasHighlights,
            hasCategories: hasCategories,
            hasGroups: hasGroups,
            hasTarget: hasTarget,
            hasStates: hasStates,
            arePercentages: arePercentages,
            postUpdateActions: postUpdateActions
        };
    }

    export class Visual implements IVisual {
        private meta: VisualMeta;
        private host: IVisualHost;
        private viewPort: ScaledViewport;
        private editMode: boolean;
        private selectionManager: ISelectionManager;
        private selectionIdBuilder: ISelectionIdBuilder;
        private tooltipServiceWrapper: tooltip.ITooltipServiceWrapper;
        private interactivityService: IInteractivityService;
        private behavior: VisualBehavior;
        private legend: ILegend;
        private model: VisualViewModel;
        private licced: boolean;
        private element: d3.Selection<HTMLElement>;
        private container: d3.Selection<HTMLElement>;
        private containerSize: SVGRect;
        private svg: d3.Selection<SVGElement>;
        private svgMap: d3.Selection<SVGElement>;
        private gContext: d3.Selection<SVGElement>;
        private gallery: VisualMapGallery;
        private fileCollector: any[];

        private zoom: d3.behavior.Zoom<any>;
        private zooming = false;
        private zoomingTimeout = -1;

        static uidCount : number = 0;
         
        constructor(options: VisualConstructorOptions) {

            this.meta = {
                name: 'Synoptic Panel',
                version: '1.4.7',
                dev: false
            };

            JSZip = (<any>window).JSZip; 
  
            this.host = options.host;
            this.selectionIdBuilder = options.host.createSelectionIdBuilder();
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = tooltip.createTooltipServiceWrapper(options.host.tooltipService, options.element);
            this.model = { dataPoints: [], matchIndex: [], enumerationDataPoints: [], legendDataPoints: [], maps: [], states: [], hasHighlights: false, hasCategories: false, hasGroups: false, hasTarget: false, hasStates: false, domain: {}, postUpdateActions: { resetCanvas: true, resetLabels: true, resetSelectionManager: false }, settings: <VisualSettings>{} };
            this.gallery = { folders:[], items: [], retreiving: false, visible: false};

            this.interactivityService = InteractivityModule.createInteractivityService(options.host);
            this.behavior = new VisualBehavior(); 

            this.element = d3.select(options.element);
            this.editMode = true;
            this.legend = LegendModule.createLegend(options.element, false, this.interactivityService, true, LegendPosition.Top);
            
        }

        //@logErrors() //TODO Don't use in production
        public update(options: VisualUpdateOptions) {

            let selectionManager  = this.selectionManager;
            this.viewPort = <any>options.viewport;

            let dataChanged = (options.type == VisualUpdateType.Data || options.type == VisualUpdateType.All || d3.select('.chart').empty());

            if (dataChanged) {
    
                this.model = visualTransform(options, this.host, this.model);

                if (this.model.postUpdateActions.resetCanvas) {

                    this.zooming = false;
                    clearTimeout(this.zoomingTimeout);
                    this.zoomingTimeout = -1;

                    this.toggleGallery(false);
                    this.svgMap = null;
                    this.element.selectAll('div, svg:not(.legend)').remove();
              
                }
                if (this.model.postUpdateActions.resetSelectionManager)
                    selectionManager.clear();
            }
            if (this.model.dataPoints.length == 0) return; 

            if (this.model.hasHighlights && this.interactivityService.hasSelection())
                this.interactivityService.clearSelection();
            this.interactivityService.applySelectionStateToData(this.model.dataPoints);

            let redrawToolbar = false;
            if (this.editMode != (options.viewMode == ViewMode.Edit) || this.model.postUpdateActions.resetToolbar) redrawToolbar = true;
            this.editMode = (options.viewMode == ViewMode.Edit);
            this.toolbar(redrawToolbar);
 
            let margin = {top: 6, left: 6, bottom: 6, right: 6};

            //Legend
            if (this.legend) {

                if (this.model.settings.legend.show && this.model.legendDataPoints.length > 0 && this.model.maps.length > 0) {
    
                    this.legend.changeOrientation(<any>LegendPosition[this.model.settings.legend.position]);
                    this.legend.drawLegend(<LegendData>{
                        title: this.model.settings.legend.titleText,
                        dataPoints: this.model.legendDataPoints,
                        labelColor: this.model.settings.legend.labelColor.solid.color,
                        fontSize: this.model.settings.legend.fontSize
                    }, options.viewport);


                   appendLegendMargins(this.legend, margin);
    
                } else {

                    this.legend.drawLegend({ dataPoints: [] }, options.viewport);
                }

            }

            this.containerSize = {
                x: margin.left,
                y: margin.right,
                width: options.viewport.width - margin.left - margin.right,
                height: options.viewport.height - margin.top - margin.bottom
            };   

            if (this.model.settings.toolbar.keep) this.containerSize.height -= 35;

            let container = this.element.select('.chart');
            if (container.empty()) {
                container = this.element.append('div').classed('chart', true);

                this.svg = <any>container
                    .append('svg')
                    .style({
                        'width': '100%',
                        'height': '100%'
                    });
                this.gContext = this.svg.append('g');
            }
            container.style({ 
                'width' :  this.containerSize.width + 'px',
                'height':  this.containerSize.height + 'px',
                'overflow': 'hidden',
                'margin-top': margin.top + 'px',
                'margin-left': margin.left + 'px'
            });

            this.container = container; 

            let g = d3.select('.gallery');
            if (!g.empty())
                g.style('height', (options.viewport.height - 35) + 'px');

            if (dataChanged && this.model.maps.length > 0) {

                let selectedMap = this.model.settings.general.imageSelected;
                if (selectedMap > this.model.maps.length - 1) selectedMap = 0;
                let map = this.model.maps[selectedMap];

                this.parseSVG(map);

                if (this.model.maps.length > 1 && this.model.settings.toolbar.filter) {
                    if (map.identities && map.identities.length > 0) {
       
                        selectionManager.clear();
                        for (let i = 0; i < map.identities.length; i++)
                            selectionManager.select(map.identities[i], true);
                    }
                }
            }

            if (this.model.maps.length == 0) {
                container.select('.welcome').remove();
                container.append('div')
                    .classed('welcome', true)
                    .append('div')
                    .classed('body', true)
                    .text('Design your maps with https://synoptic.design');
            }
    
            OKVizUtility.t([this.meta.name, this.meta.version], this.element, options, this.host, {
                'cd1': this.model.settings.colorBlind.vision, 
                'cd2': (this.model.settings.states.show ?  this.model.states.length : 0), 
                'cd3': this.model.settings.states.comparison, 
                'cd4': this.model.settings.dataPoint.saturate, 
                'cd5': this.model.hasStates, 
                'cd6': this.model.settings.legend.show,
                'cd7': this.model.maps.length, 
                'cd8': (this.model.maps.length > 0 ? (!this.model.maps[0].mapMeasure ? false : true) : false),
                'cd9': this.model.settings.dataLabels.position,
                'cd15': this.meta.dev
            }); 

            if (!this.licced) {
                this.licced = true;
                OKVizUtility.lic_log(this.meta, options, this.host);
            }

           //Color Blind module
            OKVizUtility.applyColorBlindVision(this.model.settings.colorBlind.vision, this.element);
        }

        //Not exposed yet by Power BI
        public onViewModeChanged(viewMode: ViewMode): void {
            this.toolbar(true);
        }

        public destroy(): void {

        }

        public parseSVG(map: VisualMap) {

            var self = this;

            let legendOffset = (this.legend && this.model.settings.legend.show && this.model.settings.legend.position.indexOf('Top') > -1 ? 25 : 0);

            let alertHeight = (this.model.settings.toolbar.keep && this.model.maps.length > 1 ? this.containerSize.height : this.viewPort.height) - legendOffset;
            let alertTop = (this.model.settings.toolbar.keep && this.model.maps.length > 1 ? 35 : 0) + legendOffset;

            if (!map) return;

            OKVizUtility.spinner(this.element);

            if (!map.data) { 

                //Get remote map
                if (map.URL) {

                    if (map.URL.indexOf('.svg') > -1) {

                        $.get(map.URL, function (d) {
                            map.data = d;
                            self.parseSVG(map);

                        }, 'text').fail(function () {
                           
                            self.severeAlert("Remote Map Error", "The provided image cannot be displayed for one of the following reasons: you are offline, the remote URL is not accessible, the remote URL has not the HTTPS protocol, the remote server disallows Cross-Origin Resource Sharing (CORS).", alertHeight, alertTop);
 
                        });
                    } else {

                        this.severeAlert("Remote Map Error", "The provided image is not an SVG file.", alertHeight, alertTop);
                    }

                }

            } else {

                let decodedData;
                try {
                    //Try to decode data
                    decodedData = window.atob(map.data);
                } catch(e) { }

                if (decodedData) {
                    //Check if plain svg or ZIP
                    if (decodedData.substr(0, 2) == 'PK') {
                        
                        //Unzip
                        new JSZip().loadAsync(decodedData).catch(function(e){ 

                            self.severeAlert("ZIP File Error", "The provided ZIP file is not a valid archive or uses an unsupported compression. Try to re-compress it with the default Windows compression utility.", alertHeight, alertTop);

                        }).then(function(zip){
                            if (zip) {
                                let svgFound = false;
                                for (let file in zip.files) {
                                    if (zip.files.hasOwnProperty(file)) {
                                        if (file.indexOf('.svg') > -1) {

                                            zip.file(file).async('string').catch(function(e){

                                                self.severeAlert("ZIP File Error", "The provided ZIP file does not contain a valid SVG file.", alertHeight, alertTop);

                                            }).then(function(content){
                                                if (content) {
                                                    map.data = content;
                                                    self.parseSVG(map);
                                                }
                                            });

                                            svgFound = true;
                                            break;
                                        }
                                    }
                                }

                                if (!svgFound) {
                                    self.severeAlert("ZIP File Error", "The provided ZIP file does not contain a valid SVG file.", alertHeight, alertTop);
                                }
                                
                            }

                        }); 

                        return;
                    
                    } else {
                        map.data = decodedData;
                    }
                } 

                let $temp;

                if (this.model.settings.general.strictValidation) {
                    //Parse SVG to automatically fix some errors
                    let svgParser = new DOMParser();
                    let svgDoc = svgParser.parseFromString(map.data, 'image/svg+xml');
                    let svgElement = svgDoc.documentElement;
                
                    let parserError = (svgElement.getElementsByTagName("parsererror").length > 0);
                    if (parserError) {
                         this.severeAlert("SVG File Error", "The provided image is not a valid SVG file.");
                         return;
                    } else {
                        try {
                            $temp = $('<div>').append(svgElement);
                        } catch(e) {
                            if (document.importNode) {
                                // Fix for browser (IE, maybe other too) which are throwing 'WrongDocumentError'
                                svgElement = <any>document.importNode(svgElement, true);
                                $temp = $('<div>').append(svgElement);
                            }
                        }
                    }
                } else {
                    $temp = $('<div>').append(map.data);
                }

                let $tempsvg = $temp.find('svg');
                if ($tempsvg.length == 0) {

                    this.severeAlert("SVG File Error", "The provided image is not a valid SVG file.");

                } else {

                    if (map.areas.length == 0) {

                        //Parse areas
                        $('g, path, rect, circle, ellipse, line, polygon, polyline, text', $tempsvg).each(function (i, d) {

                            //#_ignored is not processed at all
                            //#_excluded is treat as unmatched
                            if ($(this).is('#_x5F_ignored') || $(this).is('#_ignored')) return true; 
                            
                            let unmatchable = ($(this).is('.excluded') || $(this).is('#_x5F_excluded') || $(this).is('#_excluded'));
                            let matchableParent = false;
                            let $parent = $(this.parentNode).closest('[id], svg');
                            if ($parent.length > 0 && $parent[0].tagName.toLowerCase() !== 'svg') {
                                if ($parent.is('#_x5F_ignored') || $parent.is('#_ignored')) return true;

                                if ($parent.is('.excluded') || $parent.is('#_x5F_excluded') || $parent.is('#_excluded')) {
                                    unmatchable = true;
                                } else {
                                    matchableParent = Visual.SVGTitle($parent[0]);
                                }
                            }

                            //Create a unique selector
                            Visual.uidCount++;
                            let selectorClass = "OKVizUID_" + Visual.uidCount; 

                            let e = d3.select(this).classed(selectorClass, true);
                            
                            map.areas.push({ 
                                selector: '.' + selectorClass,
                                elementId: this.id,
                                displayName: Visual.SVGTitle(this),
                                unmatchable: unmatchable,
                                matchableParent: matchableParent,
                                sourceStyle: {
                                    fill: e.style('fill'),
                                    fillOpacity: e.style('fill-opacity'),
                                    stroke: e.style('stroke'),
                                    strokeOpacity: e.style('stroke-opacity'),
                                    strokeWidth: e.style('stroke-width'),
                                    opacity: e.style('opacity') || '1'
                                }
                            });
             
                        });

                        //Save modified SVG back to the model
                        map.data = $temp.html();
                    }

                    if (!this.svgMap) {

                        //This make Inkscape files compatible
                        let viewBox = (<any>$tempsvg[0]).viewBox;
                        if (viewBox && viewBox.baseVal && (viewBox.baseVal.width == 0 || viewBox.baseVal.height == 0)) {
                            let w = parseInt($tempsvg.attr('width'));
                            let h = parseInt($tempsvg.attr('height'));
                            if (w > 0 && h > 0) {
                                viewBox.baseVal.width = w;
                                viewBox.baseVal.height = h;
                            }
                        }

                        let newSVG = this.gContext.node().appendChild($tempsvg[0]);
                        this.svgMap = d3.select(newSVG).attr({
                            'width': '100%',
                            'height': '100%'
                        });
                     
                        var self = this;

                        let zoom = d3.behavior.zoom() 
                            .scaleExtent([1, 10])
                            .center([this.containerSize.width / 2, this.containerSize.height / 2])
                            .on("zoom", function(){

                                if (self.model.settings.toolbar.zoom) {
                                    if (self.zoomingTimeout < 0)
                                        self.zoomingTimeout = setTimeout(function(){
                                            self.zooming = true;
                                        }, 250);
                                    self.gContext.attr("transform", "translate(" + (<any>d3.event).translate + ") scale(" + (<any>d3.event).scale + ")");
                                    
                                    if (!self.model.settings.dataLabels.zoomEnlarge) {
                                        let originalFontSize = PixelConverter.fromPointToPixel(self.model.settings.dataLabels.fontSize);
                                        let newFontSize = (originalFontSize / (<any>d3.event).scale);
                                        d3.selectAll('.label').style('font-size', newFontSize + 'px');
                                    }
                                }
                            })
                            .on("zoomend", function(){  

                                if (self.model.settings.toolbar.zoom) {
                                    let zoomScale = zoom.scale();
                                    let zoomTranslation = zoom.translate();
                                    if (map.scale.scale !== zoomScale || map.scale.translation[0] !== zoomTranslation[0] || map.scale.translation[1] !== zoomTranslation[1]) { 
                                        map.scale = { scale: zoomScale, translation: zoomTranslation };
                                        self.persistMaps();
                                    }

                                    //This avoid drag and click
                                    clearTimeout(self.zoomingTimeout);
                                    self.zoomingTimeout = -1;
                                    setTimeout(function(){
                                        self.zooming = false;
                                    }, 1);
                                }
                            });

                        this.svg.call(zoom);
                        this.zoom = zoom;
                    }

                    if (this.model.postUpdateActions.resetCanvas) { 
                        if (this.model.settings.toolbar.zoom && this.zoom) {
                            this.zoom.scale(map.scale.scale);
                            this.zoom.translate(map.scale.translation);
                            this.zoom.event(this.svg);
                        }
                    }

                   
                    this.renderSVG(map);
                }

            }
        }

        public renderSVG(map: VisualMap) {

            if (map.areas.length > 0 && this.svgMap) {

                OKVizUtility.spinner(this.element);

                if (this.model.postUpdateActions.resetLabels)
                    this.element.selectAll('.label').remove();

                let areaSelector = 'OKVizArea';

                //Render areas
                for (let a = 0; a < map.areas.length; a++) {
                    let area = map.areas[a];
                    let e = d3.select(area.selector);
                    let element = <any>e.node();
                    if (!element)
                        continue;

                    if (area.matchableParent) {
                        //Element is a child of matchABLE element, so remove its styles
                        e.style({
                            'fill': null,
                            'fill-opacity': null,
                            'stroke-width': null,
                            'stroke-opacity': null,
                            'opacity': null
                        }).data([ { tooltips: [ { displayName: 'Area', value: area.matchableParent } ]}]);

                        if (area.unmatchable) {
                            if (!this.model.settings.general.showUnmatched) {
                                e.style('display', 'none');
                            } else {
                                e.style('display', null);
                            }
                        }

                    } else {

                        if (area.unmatchable) {
            
                            if (!this.model.settings.general.showUnmatched) {
                                //Don't show unmatchABLE (or excluded) elements
                                e.style('display', 'none');
                            } else {
                                e.style('display', null).data([ { tooltips: [ { displayName: 'Area', value: area.displayName } ]}]);

                                //Set color for unmatchABLE (or excluded) elements
                                if (this.model.settings.dataPoint.unmatchedFill) 
                                    e.style('fill', this.model.settings.dataPoint.unmatchedFill.solid.color);
                                else
                                    e.style('fill', area.sourceStyle.fill);
                            }

                        } else {

                            //Match element with data point
                            let dataPoint: VisualDataPoint;
                            let match = this.model.matchIndex[area.elementId.toLowerCase()];

                            if (match !== undefined && !isNaN(parseInt(match)))
                                dataPoint = this.model.dataPoints[parseInt(match)];

                            if (!dataPoint && !this.model.settings.general.showUnmatched) {
                                //Don't show unmatchED elements
                                e.style('display', 'none');

                            } else {

                                let color = (dataPoint ? dataPoint.color : (this.model.settings.dataPoint.unmatchedFill ? this.model.settings.dataPoint.unmatchedFill.solid.color : null));

                                e.classed(areaSelector, true).style('display', null)
                                    .data([dataPoint ? dataPoint : 
                                        { tooltips: [ { displayName: 'Area', value: area.displayName }
                                        ]}]); 

                                if (dataPoint && this.model.settings.states.show) {
                                    
                                    //States
                                    let stateValue = (this.model.hasHighlights ? dataPoint.highlightStateValue : dataPoint.stateValue);
                                    let target = dataPoint.target;

                                    let stateIndex = -1;
                
                                    let diff = (target ? (stateValue - target) : 0);
                                    let variance = (target ? (this.model.arePercentages ? diff : (diff / target)) : 0);
                                    for (let i = 0; i < this.model.states.length; i++){

                                        let state = this.model.states[i];
                                        if (!state.dataPointIdentity || dataPoint.identity == state.dataPointIdentity) {

                                            let valueToCompare = stateValue;
                                            if (this.model.settings.states.calculate == 'modifier') {
                                                valueToCompare = diff;
                                            } else if (this.model.settings.states.calculate == 'percentage') {
                                                valueToCompare = variance;
                                            }

                                            let found = false;
                                            if (this.model.settings.states.comparison == '>') {
                                                found = (valueToCompare > state.value);

                                            } else if (this.model.settings.states.comparison == '>=') {
                                                found = (valueToCompare >= state.value);

                                            } else if (this.model.settings.states.comparison == '<') {
                                                found = (valueToCompare < state.value);

                                            } else if (this.model.settings.states.comparison == '<=') {
                                                found = (valueToCompare <= state.value);

                                            } else { //=
                                                found = (valueToCompare == state.value);

                                            }

                                            //State found -> exit
                                            if (found) {
                                                stateIndex = i;
                                                break;
                                            }
                                        }
                                    }

                                    if (stateIndex > -1) {

                                        color = this.model.states[stateIndex].color;
                                    } 

                                    //Saturation
                                    if (this.model.settings.dataPoint.saturate) {

                                        let saturation;
                                        if (target) {

                                            let startSaturation = (this.model.settings.dataPoint.saturateMin ? (this.model.settings.dataPoint.saturateMin / 100) : this.model.domain.startTargetVariance);

                                            let endSaturation = (this.model.settings.dataPoint.saturateMax ? (this.model.settings.dataPoint.saturateMax / 100) : this.model.domain.endTargetVariance);

                                             saturation = Math.min(1, Math.max(0, ((variance - startSaturation) / (endSaturation - startSaturation))));

                                        } else {
                                            
                                            let startSaturation = (this.model.settings.dataPoint.saturateMin ? (this.model.settings.dataPoint.saturateMin / 100) * this.model.domain.start : this.model.domain.start);

                                            let endSaturation = (this.model.settings.dataPoint.saturateMax ? (this.model.settings.dataPoint.saturateMax / 100) * this.model.domain.end : this.model.domain.end);

                                            saturation = Math.min(1, Math.max(0, ((stateValue - startSaturation) / (endSaturation - startSaturation))));


                                        } 

                                        if (saturation !== undefined && color) {
                                            color = OKVizUtility.saturateColor(color, saturation, '#fff');
                                        }
                                    }  

                                }

                                let isText = (element.tagName.toLowerCase() === 'text');
                                let isG = (element.tagName.toLowerCase() === 'g');

                                if (color) { 
                                    e.style('fill', color);

                                    if (this.model.settings.dataPoint.borders) {
                                        e.style({
                                            'fill-opacity': '0.8',
                                            'stroke': color,
                                            'strokeWidth': (isText ? '0' : '2')
                                        });
            
                                    } else {
                                        e.style({
                                            'fill-opacity': area.sourceStyle.fillOpacity,
                                            'stroke': area.sourceStyle.stroke,
                                            'stroke-width': area.sourceStyle.strokeWidth
                                        });
                                    }

                                } else {

                                    color = area.sourceStyle.fill;
                                    if (!color) color = '#000';

                                    e.style({
                                        'fill-opacity': area.sourceStyle.fillOpacity,
                                        'fill': area.sourceStyle.fill,
                                        'stroke': area.sourceStyle.stroke,
                                        'stroke-width': area.sourceStyle.strokeWidth
                                    });

                                }

                                let opacity = (dataPoint && (this.model.hasHighlights || (this.interactivityService.hasSelection() && !dataPoint.selected)) ? 0.3 : area.sourceStyle.opacity);

                                e.style('opacity', opacity);

                                let showLabel = this.model.settings.dataLabels.show;
                                if (isText) showLabel = false;
                                if (!dataPoint && (!this.model.settings.dataLabels.unmatchedLabels || this.model.settings.dataLabels.labelStyle == 'value')) showLabel = false;

                                if (showLabel && this.model.postUpdateActions.resetLabels) {

                                    let areaPadding = 10;

                                    let areaRect: SVGRect = (<any>e.node()).getBBox();
                                    let labelFontFamily = this.model.settings.dataLabels.fontFamily;
                                    let labelFontSizePx = PixelConverter.fromPointToPixel(this.model.settings.dataLabels.fontSize);

                                    if (!this.model.settings.dataLabels.zoomEnlarge)
                                        labelFontSizePx = (labelFontSizePx / map.scale.scale);

                                    let labelFontSize = labelFontSizePx + 'px';

                                    let rawLabelValue = area.displayName;
                                    if (dataPoint) {

                                        let value = (this.model.hasHighlights ? dataPoint.highlightValue : dataPoint.value);

                                        let dataPointFormatter = OKVizUtility.Formatter.getFormatter({
                                            format: dataPoint.format,
                                            formatSingleValues: (this.model.settings.dataLabels.unit === 0),
                                            value: (this.model.settings.dataLabels.unit == 0 ? this.model.domain.start: this.model.settings.dataLabels.unit),
                                            precision: this.model.settings.dataLabels.precision,
                                            displayUnitSystemType: 3,
                                            allowFormatBeautification: false,
                                            cultureSelector: this.model.settings.dataLabels.locale
                                        });

                                        if (this.model.settings.dataLabels.labelStyle == 'category') {
                                            rawLabelValue = dataPoint.displayName;

                                        } else if (this.model.settings.dataLabels.labelStyle == 'area') {
                                            rawLabelValue = area.displayName;

                                        } else if (this.model.settings.dataLabels.labelStyle == 'value') {
                                            rawLabelValue = dataPointFormatter.format(value);

                                        } else {

                                            if (this.model.settings.dataLabels.labelStyle == 'both2')
                                                rawLabelValue = area.displayName;
                                            else
                                                rawLabelValue = dataPoint.displayName;

                                            rawLabelValue += ' '; 
                                            if (value !== null) rawLabelValue += '[';
                                            rawLabelValue += dataPointFormatter.format(value);
                                            if (value !== null) rawLabelValue += ']';
                                        }
                                    }

                                    let labelAvailableWidth = areaRect.width - areaPadding;

                                    let labelPos;
                                    if (this.model.settings.dataLabels.position == 'top') {
                                        labelPos = [areaRect.x + areaPadding, areaRect.y + PixelConverter.fromPointToPixel(this.model.settings.dataLabels.fontSize) + areaPadding];
                                    } else {
                                        
                                        let centroid = (this.model.settings.dataLabels.position == 'centroid');

                                        if (!centroid) {
                                            let points = Visual.geoJSONFromSVGElement(e.node());
                                            if (points.length == 0) {
                                                centroid = true;
                                            } else {

                                                let r = <any>polylabel([points], 1);
                                                labelPos = [r.x, r.y];

                                                if (this.model.settings.dataLabels.enclose)
                                                    labelAvailableWidth = (r.max * 2);
                                            }
                                        }
                                        if (centroid) {
                                             labelPos = [areaRect.x + (areaRect.width / 2), areaRect.y + PixelConverter.fromPointToPixel(this.model.settings.dataLabels.fontSize) + (areaRect.height /2)];
                                        }

                                    }

                                    let labelValue = rawLabelValue;
                                    if (!this.model.settings.dataLabels.wordWrap && rawLabelValue && rawLabelValue != '' && this.model.settings.dataLabels.labelStyle != 'value' && this.model.settings.dataLabels.enclose) {
                                        labelValue = TextUtility.getTailoredTextOrDefault({
                                            text: rawLabelValue,
                                            fontSize: labelFontSize,
                                            fontFamily: labelFontFamily
                                        }, labelAvailableWidth); 
                                    }

                                    let label = this.svgMap.append('text')
                                        .classed('label', true)
                                        .attr('x', labelPos[0] || 0) 
                                        .attr('y', + labelPos[1] || 0) 
                                        //.style('dominant-baseline', 'hanging')
                                        .style({
                                            'font-size': labelFontSize,
                                            'font-family': labelFontFamily,
                                            'fill': (this.model.settings.dataLabels.fill ? this.model.settings.dataLabels.fill.solid.color : OKVizUtility.autoTextColor(color)),
                                            'text-anchor': (this.model.settings.dataLabels.position == 'top' ? 'start' : 'middle'),
                                            'pointer-events': 'none'
                                        })
                                        .text(labelValue);
                                    
                      
                                    if (!dataPoint)
                                        label.style('font-style', 'italic');

                                    if (this.model.settings.dataLabels.wordWrap && this.model.settings.dataLabels.labelStyle != 'value') {

                                        TextUtility.wrapAxis(label, labelAvailableWidth, {
                                            fontSize: labelFontSize,
                                            fontFamily: labelFontFamily
                                        }, !this.model.settings.dataLabels.enclose);
                                        
                                    }     

                                   if (this.model.settings.dataLabels.position != 'top') {
                                        let bb = (<any>label.node()).getBBox();

                                        if (bb) label.attr('transform', 'translate(0, -' + ((bb.height + PixelConverter.fromPointToPixel(this.model.settings.dataLabels.fontSize)) / 2) + ')');
                                    }

                                }
                            }
                        }
                    }

                }

                //Tooltips
                this.tooltipServiceWrapper.addTooltip(this.svgMap.selectAll('.' + areaSelector + ', .' + areaSelector + ' *'), 
                    function(tooltipEvent: TooltipEventArgs<number>){
                        let dataPoint: VisualDataPoint = <any>tooltipEvent.data;
                        if (dataPoint && dataPoint.tooltips)
                            return dataPoint.tooltips;
                        
                        return null;
                    }, 
                    (tooltipEvent: TooltipEventArgs<number>) => null
                );

                
                if (this.interactivityService) {

                    this.interactivityService.applySelectionStateToData(this.model.dataPoints);

                    let behaviorOptions = {
                        selection: d3.selectAll('.' + areaSelector),
                        clearCatcher: this.svg,
                        hasHighlights: this.model.hasHighlights
                    };

                    this.interactivityService.bind(this.model.dataPoints, this.behavior, behaviorOptions);
                }
                

                OKVizUtility.spinner();


            }
            
        }

        public toolbar(forceRedraw: boolean) {
           
            var self = this; 
            let $tb = $('.toolbar');
            if ($tb.length == 0){

                $tb = $('<div>').addClass('toolbar').hide().appendTo(<HTMLElement>this.element[0][0]);
                //$tb = this.element.append('div').classed('toolbar', true).style('display', 'none');
                forceRedraw = true;
            }

            if (forceRedraw) {

                var $buttons = $tb.find('.buttons');
                if ($buttons.length == 0)
                    $buttons = $('<div>').addClass('buttons').appendTo($tb);
                else
                    $buttons.empty();
                    
                let hasButton = false;

                //Maps buttons
                let $mapButton = $('<span>');
                let $mapButtonInside = $('<button>').addClass('fileChoose mapChoose' + (this.gallery.visible ? ' disabled' : '')).attr('title', 'Choose/Change local maps (SVG files)').text((this.model.maps.length == 0 ? 'Local maps' : (this.model.maps.length == 1 ? 'Change' : ''))).appendTo($mapButton);
                $mapButtonInside.prepend('<svg width="20px" height="16px" viewBox="0 0 20 16"><g><path style="fill:#FFFFFF" d="M20,16H0V4h20V16z"/></g><g><polygon style="fill:#FFFFFF" points="14,3 0,3 0,0 9.6,0"/></g></svg>');
                $('<input type="file" class="file" multiple="multiple" accept="image/svg">').appendTo($mapButton);

                let $mapsBox = $('<span>');
                let $mapsSelect = $('<select>').addClass('maps').appendTo($mapsBox);
                $mapsSelect.attr('disabled', (this.gallery.visible ? 'disabled' : null));
    
                //Sort maps
                let items = {};
                for (let i = 0; i < this.model.maps.length; i++)
                    items[this.model.maps[i].displayName] = i;
                let keys = Object.keys(items);
                keys.sort();

                $.each(keys, function(index, value){
                    let i = items[value];
                    var $option = $('<option>').appendTo($mapsSelect);
                    $option.attr('value', i).text(self.model.maps[i].displayName);
                    if (i == self.model.settings.general.imageSelected)
                        $option.attr('selected', 'selected');
                });


                //Gallery
                let $categoriesBox = $('<span>');
                let $categoriesSelect = $('<select>').addClass('galleryFolders').appendTo($categoriesBox);
                $.each(this.gallery.folders, function(index, value){
                    var $option = $('<option>').appendTo($categoriesSelect);
                    $option.attr('value', index).text(value);
                });

                let $galleryButton = $('<span>');
                let $galleryButtonInside = $('<button>').attr('title', 'Choose a map from the community gallery').addClass('galleryChoose' + (this.gallery.visible ? ' active' : '')).text('Gallery').appendTo($galleryButton);
                $galleryButtonInside.prepend('<svg width="20px" height="16px" viewBox="0 0 20 16"><g><path  style="fill:#FFFFFF" d="M20,16H0V4h20V16z M1,15h18V5H1V15z M18,14H6.9l1.8-2.2l0.6-1.9l1.7,1.1l3-3.8l4,3.6V14z M4,10c-0.6,0-1-0.2-1.4-0.6C2.2,9,2,8.6,2,8c0-0.6,0.2-1,0.6-1.4c0.8-0.8,2-0.8,2.8,0C5.8,7,6,7.5,6,8c0,0.5-0.2,1-0.6,1.4 C5,9.8,4.6,10,4,10z"/></g><g><rect x="2" y="2" style="fill:#FFFFFF" width="16" height="1"/></g><g><rect x="5"  style="fill:#FFFFFF" width="10" height="1"/></g></svg>');

                //Zoom
                let $zoomInButton = $('<span>');
                let $zoomInButtonInside = $('<button>').addClass('zoomIn').attr('title', 'Zoom in').attr('data-zoom', '+1').appendTo($zoomInButton);
                $zoomInButtonInside.append('<svg width="16px" height="15px" viewBox="0 0 19 18"><g><polygon style="fill:#FFFFFF" points="17,6 11,6 11,0 8,0 8,6 2,6 2,9 8,9 8,15 11,15 11,9 17,9 "/></g></svg>');

                let $zoomOutButton = $('<span>');
                let $zoomOutButtonInside = $('<button>').addClass('zoomOut').attr('title', 'Zoom out').attr('data-zoom', '-1').appendTo($zoomOutButton);
                $zoomOutButtonInside.append('<svg width="16px" height="15px" viewBox="0 0 19 18"><g><rect style="fill:#FFFFFF" x="2" y="6" width="15" height="3"/></g></svg>');

                let $resetZoomButton = $('<span>');
                let $resetZoomButtonInside = $('<button>').addClass('zoom0').attr('title', 'Reset zoom').attr('data-zoom', '0').appendTo($resetZoomButton);
                $resetZoomButtonInside.append('<svg width="18px" height="18px" viewBox="0 0 20 20"><g transform="translate(0,-952.36218)"><path style="fill:#FFFFFF" d="M4.2,954.6L3,955.7c2.3,2.1,4.7,4.1,7,6.2c2.3-2.1,4.7-4.2,7-6.2l-1.2-1.2l-5.8,5.1L4.2,954.6z M10,963.1 c-2.3,2.1-4.7,4.2-7,6.2l1.2,1.2l5.8-5.1l5.8,5.1l1.2-1.2C14.7,967.3,12.3,965.2,10,963.1L10,963.1z"/></g></svg>');

                if (this.model.maps.length > 1) {
                    hasButton = true;
                    $mapsBox.appendTo($buttons);
                }

                if (this.editMode) {
                    
                    if (this.model.maps.length <= 1 || (this.model.maps.length > 1 && !this.model.maps[0].mapMeasure)) {
                        hasButton = true;
                        $mapButton.appendTo($buttons);
                        $('<div>').addClass('sep').html('&nbsp;').appendTo($buttons);
                        $galleryButton.appendTo($buttons);
                    }
                    
                }

                if (this.gallery.visible) {
                    hasButton = true;
                    $categoriesBox.appendTo($buttons);
                }

                if (this.model.maps.length > 0 && !this.gallery.visible && this.model.settings.toolbar.zoom) {

                    if (hasButton)
                        $('<div>').addClass('sep').html('&nbsp;').appendTo($buttons);
                    
                    $zoomInButton.appendTo($buttons);
                    $zoomOutButton.appendTo($buttons);
                    $resetZoomButton.appendTo($buttons);
                }
                
                if (!hasButton) return;

                
                this.element.on('mouseleave', function(){
                    if (self.model.maps.length > 0 && !self.model.settings.toolbar.keep && !self.gallery.visible) {
                        d3.select('.toolbar').style('display', 'none');
                    }
                });
                this.element.on('mouseenter', function(){
                    d3.select('.toolbar').style('display', 'block');
                });
               
                d3.select('.galleryFolders').on('change', function(){
                    let g = d3.select('.gallery');
                    if (!g.empty()) {
                          g.selectAll('li').style('display', 'none');
                          g.selectAll('.galleryFolder_' + this.value).style('display', null);
                    }
                });

                d3.select('.maps').on('change', function(){

                    self.host.persistProperties({
                        merge: [{
                            objectName: 'general',
                            selector: null,
                            properties: {
                                imageSelected: this.value
                            }
                        }]
                    });
                    
                });
                
               d3.select('.fileChoose').on('click', function () {

                   $(this).parent().find('.file').trigger('click');

                   /*let e = document.createEvent('UIEvents');
                    e.initUIEvent('click', true, true, window, 1);
                    d3.select(this.parentNode).select('.file').node().dispatchEvent(e);*/

                });
                d3.select('.file').on('click', function () {
                    this.value = null;
                });
                d3.select('.file').on('change', function () {
                    if (this.files && this.files.length > 0) {

                        //Precheck file types
                        var files = [];
                        for (let i= 0; i < this.files.length; i++) {
                            let file = this.files[i];
                            if (file.type.indexOf('image/svg') > -1) {
                                files.push(file);
                            }
                        }

                        if (files.length > 0 ) {

                            self.model.maps = [];
                            self.fileCollector = [];

                            for (let i= 0; i < files.length; i++) {

                                let file = files[i];
                                let fr = new FileReader();
                                fr.readAsText(file);
                                fr.onload = function () {

                                    self.fileCollector.push({
                                        URL: null,
                                        data: fr.result,
                                        displayName: OKVizUtility.makeURLReadable(file.name),
                                        areas: [],
                                        scale: { scale: 1, translation: [0, 0] },
                                        mapMeasure: null,
                                        identities: null
                                    });

                                    if (self.fileCollector.length == files.length) {
                                        //All the files have been acquired, now persist the data
                                        self.persistMaps(self.fileCollector, 0);
                                    }
                                };
                            }
                        }
                    }
                });

                d3.select('.galleryChoose').on('click', function(){
                    self.toggleGallery();
                    d3.select(this).classed('active', self.gallery.visible);
                }); 

                $(document).on('click', '.galleryItem', function(e){
                    let item = self.gallery.items[this.id];

                    self.model.maps = [];
                    let maps = [{
                        URL: item.url,
                        data: null,
                        displayName: item.title,
                        areas: [],
                        scale: { scale: 1, translation: [0, 0] },
                        mapMeasure: null,
                        identities: null
                    }];

                    self.persistMaps(maps, 0);

                    e.preventDefault();
                });

                d3.selectAll('.zoomIn, .zoomOut, .zoom0').on('click', function(){

                    if (self.svg && self.zoom) {
                        let coordinates = function(point) {
                            let scale = self.zoom.scale(), translate = self.zoom.translate();
                            return [(point[0] - translate[0]) / scale, (point[1] - translate[1]) / scale];
                        };

                        let point = function(coordinates) {
                            let scale = self.zoom.scale(), translate = self.zoom.translate();
                            return [coordinates[0] * scale + translate[0], coordinates[1] * scale + translate[1]];
                        };

                        if (this.getAttribute("data-zoom") == '0') {
                            self.zoom.translate([0, 0]).scale(1);
                        } else {

                            let center0 = self.zoom.center();
                            if (!center0) center0 = [0, 0];
                            let translate0 = self.zoom.translate();
                            let coordinates0 = coordinates(center0);
                            self.zoom.scale(self.zoom.scale() * Math.pow(2, + this.getAttribute("data-zoom")));

                            // Translate back to the center
                            let center1 = point(coordinates0);
                            self.zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);
                        }
                        self.svg.transition().duration(750).call(self.zoom.event);
                    }
                
                });
            }


            if (this.model.maps.length == 0 || this.model.settings.toolbar.keep || this.gallery.visible) {
                $tb.show();
            }

            $tb.css({
                'transform-origin': (this.model.settings.toolbar.keep ? 'center' : 'left top'),
                'transform': 'scale(' + (2-this.viewPort.scale) + ')',
                'margin-top': (this.legend && this.model.settings.legend.show && this.model.settings.legend.position.indexOf('Top') > -1 && this.model.maps.length > 0 ? '25px' : '0')
            });

            $tb.toggleClass('fixed', this.model.settings.toolbar.keep);
        }


        public toggleGallery(show?: boolean) {
            
            if (!this.container) return;

            let element = d3.select('.gallery');
            if (!element.empty() || show === false) {
                if (show !== undefined) {
                    element.style('display', (show ? null : 'none'));
                    this.container.style('display', (show ? 'none' : null));
                    this.gallery.visible = show;
                } else {
                    element.style('display', (this.gallery.visible ? 'none' : null));
                    this.container.style('display', (this.gallery.visible ? null : 'none'));
                    this.gallery.visible = !this.gallery.visible;
                } 
                this.toolbar(true);

            } else {
                element = this.element.append('div')
                    .classed('gallery', true)
                    .style('height', (this.viewPort.height - 35) + 'px');

                this.container.style('display', 'none'); 
                this.gallery.visible = true;

                if (this.gallery.html) {
                   element.html(this.gallery.html);
                   this.toolbar(true);
                } else {

                    this.gallery.retreiving = true;
                    this.gallery.folders = [];
                    this.gallery.items = [];
                    
                    OKVizUtility.spinner(element);
                    
                    var self = this;
                    $.getJSON('https://synoptic.design/gallery-folders/', function (d) {
                        
                        if (self.gallery.retreiving) {
 
                            
                            for (let i = 0; i < d.folders.length; i++) {
                                let folder = d.folders[i];
                                self.gallery.folders.push(folder.name)
                            }
                            self.toolbar(true);

                            $.getJSON('https://synoptic.design/api/get_posts/?count=-1', function (d) {
                                if (self.gallery.retreiving) {
                                    if (d.status === 'ok') {
                                        var $ul = $('<ul>');

                                        for (let i = 0; i < d.posts.length; i++) {
                                            var post = d.posts[i];
                                            if (post.attachments.length > 0) {

                                                let title = post.title_plain;
                                                let thumb_url = post.attachments[0].url.replace('http:', 'https:');
                                                let folder = post.custom_fields.gallery_folder[0];
                                                let author_email = post.custom_fields.gallery_author_email[0];
                                                let author_name = post.custom_fields.gallery_author_name[0];
                                                let is_verified = post.custom_fields.gallery_verified[0];
                                                let author = (is_verified ? author_name + ' (' + author_email + ')' : (author_name === '' ? 'Anonymous' : author_name + ' (not verified)'));

                                                let content = post.content.replace(/<[^>]*>?/gm, '');
                                                let alt = title + ' \n' + content + ' \nby ' + author;

                                                var $li = $('<li>').addClass('galleryFolder_' + folder).appendTo($ul);
                                                if (folder != 0) $li.hide();
                                                var $a = $('<a>').addClass('galleryItem').appendTo($li);
                                                $a.attr('id', 's_' + post.id).attr('title', alt);
                                                var $thumbnailContainer = $('<div>').addClass('thumbnail_container').appendTo($a);
                                                var $thumbnail = $('<div>').addClass('thumbnail').appendTo($thumbnailContainer);
                                                $thumbnail.css({
                                                    'background-color': '#fff',
                                                    'background-image': 'url(' + thumb_url + ')',
                                                    'background-position': 'center',
                                                    'background-repeat': 'no-repeat',
                                                    'background-size': 'contain'
                                                });
                                                var $title = $('<div>').addClass('ellipsis').appendTo($a);
                                                $title.text(title);

                                                self.gallery.items['s_' + post.id] = {
                                                    url: post.custom_fields.gallery_map[0].replace('http:', 'https:'),
                                                    title: title
                                                };

                                            }
                                        }
                             
                                        element.html('');
                                        $ul.appendTo(<HTMLElement>element[0][0]);

                                        self.gallery.html = element.html();
                                        
                                    }
                                    self.gallery.retreiving = false;

                                    OKVizUtility.spinner();
                                }
                            }).fail(function(){
                                self.gallery.html = null;
                                element.html('<div class="error">Unable to retreive maps.<br> Please retry later.</div>');
                                self.gallery.retreiving = false;
                                OKVizUtility.spinner();
                            });
                        }
                    }).fail(function(){
                        self.gallery.html = null;
                        element.html('<div class="error">Gallery unreachable.<br>Please retry later.</div>');
                        self.gallery.retreiving = false;
                        OKVizUtility.spinner();
                    });

                }
                
            }
            

        }

        public static SVGTitle(node) {
            //title=""
            let title = node.getAttribute('title');
            
            //<title></title>
            if (!title || title === '') {
                let titleNode = $(node).children('title');
                if (titleNode.length > 0) 
                    title = titleNode.text();
            }

            //id=""
            if ((!title || title === '') && node.id && node.id != '') {
                title = node.id;
           
                if (!title || title.indexOf('XMLID_') === 0) {
                    if (node.tagName.toLowerCase() === 'text')
                        title = node.textContent;
                } else {
                    title = title.replace(/_x([A-Za-z0-9-:.]{2})_/g, function(m, m1){
				        return String.fromCharCode(parseInt(m1, 16));
			        }).replace(/_/g, ' ');

                }
            }

            return title;
        }


        public static SVGId(id, appSupport?){

            if (!id) return id;

            let returnId = id;
            if (!appSupport || appSupport == 'illustrator' || appSupport == 'default') {

                //Adobe Illustrator & Synoptic Designer v1.4+ use this method
                returnId = returnId.replace(/[^A-Za-z0-9-:.]/g, function(m) {
                    if (m == ' ') return '_'; 
                    return "_x" + m.charCodeAt(0).toString(16).toUpperCase() + '_';
                });
                if (!isNaN(parseInt(returnId)))
                    returnId = '_x' + returnId.substr(0, 1).charCodeAt(0).toString(16).toUpperCase() + '_' + returnId.substr(1);

            } else if (appSupport == 'inkscape') {

                //Inkscape uses this method
                returnId = returnId.replace(/[^A-Za-z0-9-:.]/g, '_');
    
            } else if (appSupport == 'legacy') {
                
                //Synoptic Panel v1.3.7- uses this method
                returnId = returnId.replace(/([^A-Za-z0-9[\]{}_.:-])\s?/g, '_');

                if (!isNaN(parseInt(returnId)))
                    returnId = '_' + returnId;
            }
            return returnId;
        }

        public severeAlert(title?: string, message?: string, height?: number, top?: number) {

            d3.selectAll('.OKVizAlert').remove();
            OKVizUtility.spinner();

            let div = this.element.append('div')
                .classed('OKVizAlert', true)
                .style({
                    'position': 'absolute',
                    'left': '0',
                    'top': (top ? top + 'px' : '0'),
                    'z-index': '99999',
                    'display': 'table',
                    'height': (height ? height + 'px' : '100%'),
                    'width': '100%',
                    'background': '#f4f4f4'
                })
                .append('div')
                .style({
                    "display": "table-cell",
                    "font-family": "'Segoe UI'wf_segoe-ui_normal,helvetica,arial,sans-serif",
                    "font-size": "14px",
                    "color": "#212121",
                    "padding": "10px",
                    "text-align": "center",
                    "vertical-align": "middle"
                });

            div.html('<svg width="31px" height="31px" viewBox="0 0 31 31"><g><path style= "fill:#212121" d="M15.5,0C6.9,0,0,6.9,0,15.5C0,24.1,6.9,31,15.5,31S31,24.1,31,15.5C31,6.9,24.1,0,15.5,0z M15.5,29C8,29,2,23,2,15.5S8,2,15.5,2S29,8,29,15.5S23,29,15.5,29z"/><path style= "fill:#212121" d="M22.1,9.2c-0.4-0.4-1-0.4-1.4,0l-5.2,5.2l-5.2-5.2c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l5.2,5.2 l-5.2,5.2c-0.4,0.4-0.4,1,0,1.4c0.2,0.2,0.4,0.3,0.7,0.3c0.3,0,0.5-0.1,0.7-0.3l5.2-5.2l5.2,5.2c0.2,0.2,0.4,0.3,0.7,0.3 s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4l-5.2-5.2l5.2-5.2C22.5,10.2,22.5,9.6,22.1,9.2z"/></g></svg>');
            div.append('br');
            div.append('span').text(title.toUpperCase());
            div.append('br');
            div.append('span').text(message);
        }

        public static geoJSONFromSVGElement(path) {
            
            let arr = [];

            let tag = path.tagName.toLowerCase();
            let p = path;
            if (tag !== 'path') {
                if (tag == 'polyline' || tag == 'polygon') {
                    p = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    p.setAttribute('d', 'M' + path.getAttribute('points') + 'z');

                } else { 
                    //For rect, line, ellipse, circle uses absolute center
                    return arr;
                }
            }

            let precision = 5; //check each N points - 1 means perfect-slow
            let len = p.getTotalLength();
            for (let i = 0; i < len; i+= precision) {
                let point = p.getPointAtLength(i);
                arr.push([point.x, point.y]);
            }
            
            return arr;
        }

        public persistMaps(maps?, selected?) {
            if (this.host) {

                this.host.persistProperties({
                    merge: [{
                        objectName: 'general',
                        selector: null,
                        properties: {
                            imageData: JSON.stringify(maps ? maps : this.model.maps),
                            imageSelected: (selected ? selected : this.model.settings.general.imageSelected)
                        }
                    }]
                });
            }
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var objectName = options.objectName;
            var objectEnumeration: VisualObjectInstance[] = [];

            switch(objectName) {
                case 'general':
                     objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "showUnmatched": this.model.settings.general.showUnmatched,
                            "strictValidation": this.model.settings.general.strictValidation
                        },
                        selector: null
                    });
                    break;

                case 'toolbar':

                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "keep": this.model.settings.toolbar.keep,
                            "zoom": this.model.settings.toolbar.zoom
                        },
                        selector: null
                    });

                    if (this.model.maps.length > 1 && this.model.maps[0].mapMeasure) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "filter": this.model.settings.toolbar.filter
                            },
                            selector: null
                        });

                    }
                    break;

                case 'dataPoint':

                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "borders": this.model.settings.dataPoint.borders
                        },
                        selector: null
                    });

                    if (this.model.settings.general.showUnmatched) {
                         objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "unmatchedFill": this.model.settings.dataPoint.unmatchedFill
                            },
                            selector: null
                        });
                    } 

                     
                    if (this.model.hasCategories || this.model.hasGroups) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "defaultFill" : this.model.settings.dataPoint.defaultFill,
                                "showAll": this.model.settings.dataPoint.showAll,
                            },
                            selector: null
                        });
                    
                        if (this.model.settings.dataPoint.showAll) {

                            if (this.model.hasCategories && this.model.hasGroups) {
                                objectEnumeration.push({
                                    objectName: objectName,
                                    properties: {
                                        "colorByCategory" : this.model.settings.dataPoint.colorByCategory
                                    },
                                    selector: null
                                });
                            }

                            let maxDataPoints = 1000;
                            for(let i = 0; i < Math.min(maxDataPoints, this.model.enumerationDataPoints.length); i++) {
                                let enumerateDataPoint = this.model.enumerationDataPoints[i];
                                objectEnumeration.push({
                                    objectName: objectName,
                                    displayName: enumerateDataPoint.displayName,
                                    properties: {
                                        "fill": {
                                            solid: {
                                                color: enumerateDataPoint.color
                                            }
                                        }
                                    },
                                    selector: enumerateDataPoint.identity.getSelector()
                                });
                            }
                        }

                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "saturate": this.model.settings.dataPoint.saturate
                            },
                            selector: null
                        });

                        if (this.model.settings.dataPoint.saturate) {
                            objectEnumeration.push({
                                objectName: objectName,
                                properties: {
                                    "saturateMin": this.model.settings.dataPoint.saturateMin,
                                    "saturateMax": Math.max(this.model.settings.dataPoint.saturateMin + 1, this.model.settings.dataPoint.saturateMax)
                                },
                                validValues: {
                                    "saturateMin": {
                                        numberRange: {
                                            min: 0,
                                            max: 99
                                        }
                                    },
                                    "saturateMax": {
                                        numberRange: {
                                            min: 1,
                                            max: 100
                                        }
                                    }
                                },
                                selector: null
                            });
                        }
                    }

                    break;
                
                case 'states':

                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "show": this.model.settings.states.show
                        },
                        selector: null
                    });

                    if (this.model.hasTarget) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "calculate": this.model.settings.states.calculate
                            },
                            selector: null
                        });
                    }

                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "comparison": this.model.settings.states.comparison,
                            "baseFill": "" //Keep placeholder fixed
                            
                        },
                        selector: null
                    });

                    if (!this.model.hasStates) {

                        for (let i = 1; i <= 5; i++) {

                            let v = "manualState" + i;
                            let f = v + "Fill";

                            let s: any = {};
                            s[f] = this.model.settings.states[f];
                            s[v] = this.model.settings.states[v];

                            objectEnumeration.push({
                                objectName: objectName,
                                properties: s,
                                selector: null
                            });
                        }
                    }

                     for(let i = 0; i < this.model.states.length; i++) {
                        let state = this.model.states[i];
                        if (state.identity) {
                            objectEnumeration.push({
                                objectName: objectName,
                                displayName: state.displayName + (state.isTarget ? ' (target)' : ''),
                                properties: {
                                    "fill": { solid: { color: state.color } }
                                },
                                selector: state.identity.getSelector()
                            });
                        }
                    }
                    break;

                 case 'dataLabels':
                    
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "show": this.model.settings.dataLabels.show
                        },
                        selector: null
                    });

                    if (this.model.settings.general.showUnmatched) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "unmatchedLabels": this.model.settings.dataLabels.unmatchedLabels
                            },
                            selector: null
                        });
                    }

                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "labelStyle": this.model.settings.dataLabels.labelStyle,
                            "position": this.model.settings.dataLabels.position,
                            "enclose": this.model.settings.dataLabels.enclose,
                            "wordWrap": this.model.settings.dataLabels.wordWrap,
                            "unit": this.model.settings.dataLabels.unit,
                            "precision": this.model.settings.dataLabels.precision,
                            "locale": this.model.settings.dataLabels.locale,
                            "fill": this.model.settings.dataLabels.fill,
                            "fontSize": this.model.settings.dataLabels.fontSize,
                            "fontFamily": this.model.settings.dataLabels.fontFamily
                        },
                        validValues: {
                            "precision": {
                                numberRange: {
                                    min: 0,
                                    max: 15
                                }
                            }
                        },
                        selector: null
                    });

                    if (this.model.settings.toolbar.zoom) {
                        objectEnumeration.push({
                            objectName: objectName,
                            properties: {
                                "zoomEnlarge": this.model.settings.dataLabels.zoomEnlarge
                            },
                            selector: null
                        });
                    }


                    break;

                case 'legend':
                    
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "show": this.model.settings.legend.show,
                            "position": this.model.settings.legend.position,
                            "showTitle": this.model.settings.legend.showTitle,
                            "titleText": this.model.settings.legend.titleText,
                            "labelColor": this.model.settings.legend.labelColor,
                            "fontSize": this.model.settings.legend.fontSize
                        },
                        selector: null
                    });

                    break;
                
                case 'colorBlind':
                    
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "vision": this.model.settings.colorBlind.vision
                        },
                        selector: null
                    });
 
                    break;
                
                case 'about':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            "version": this.meta.version + (this.meta.dev ? ' BETA' : '')
                        },
                        selector: null
                    });
                    break;
                
            };

            return objectEnumeration;
        }

    }

    
}