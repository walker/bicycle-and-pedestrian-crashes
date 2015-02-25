"use strict";
$(document).ready(function() {
	showBikeMap();
});

var bike_ped_map = null,
bike_ped_layers = new Array(),
ped_colors = {
	unknown: '#FFF0F5',
	none: '#F49AC2',
	probably: '#CF71AF',
	evident: '#FF007F',
	disabling: '#872657',
	fatal: '#614051'
}, bike_colors = {
	unknown: '#FFFFB2',
	none: '#FED976',
	probably: '#FEB24C',
	evident: '#FD8D3C',
	disabling: '#E31A1C',
	fatal: '#B10026'
},
levels = ['none', 'fatal', 'disabling', 'evident', 'probably', 'none', 'unknown'],
filters_written = false,
checkboxes = [],
bikeFeatureLayer = null,
pedFeatureLayer = null,
type_checkboxes = [],
which = {};

function showBikeMap() {
	L.mapbox.accessToken = 'pk.eyJ1IjoiY29uZmx1ZW5jZWNpdHkiLCJhIjoiU05ETHk4VSJ9.8U46aM9pUowsCfgMsbidgg';
	var layer = L.mapbox.tileLayer('confluencecity.kpmg98a4');
	layer.on('ready', function() {
		// the layer has been fully loaded now, and you can
		// call .getTileJSON and investigate its properties
		bike_ped_map = L.mapbox.map('map', layer.getTileJSON());
		bikeFeatureLayer = L.mapbox.featureLayer()
			.setFilter(function(feature) {
				feature.properties['marker-color'] = bike_colors[levels[feature.properties.PERSONAL_INJ_LEVEL]];
				feature.properties['marker-size'] = 'small';
				feature.properties['marker-type'] = 'point';
				feature.properties.CRASH_SEGMENT = 'Bicycle';
				feature.properties.YEAR = feature.properties.ACCIDENT_DATE.substring(0, 4);
				return feature;
			})
			.addTo(bike_ped_map);
		bikeFeatureLayer.loadURL('/wp-content/themes/maps/data/2013_and_2014_bike_crashes_geo.json?v=4');
		bikeFeatureLayer.on('ready', function() {
			which.bicycle = true;
			controlFeatureLayer();
			display_update();
		});
		pedFeatureLayer = L.mapbox.featureLayer()
			.setFilter(function(feature) {
				feature.properties['marker-color'] = ped_colors[levels[feature.properties.PERSONAL_INJ_LEVEL]];
				feature.properties['marker-size'] = 'small';
				feature.properties['marker-type'] = 'point';
				feature.properties.CRASH_SEGMENT = 'Pedestrian';
				feature.properties.YEAR = feature.properties.ACCIDENT_DATE.substring(0, 4);
				return feature;
			})
			.addTo(bike_ped_map);
		pedFeatureLayer.loadURL('/wp-content/themes/maps/data/2013_and_2014_pedestrian_crashes_geo.json?v=4');
		pedFeatureLayer.on('ready', function() {
			which.pedestrian = true;
			controlFeatureLayer();
			display_update();
		});
	});
	layer.on('error', function(err) {
		// Handle error
	});
}

function controlFeatureLayer() {
	if(filters_written != true) {
		var filters = document.getElementById('filters');
		var typesObj = {},
			types = ['1', '2', '3', '4', '5', '6'],
			labels = ['Fatal', 'Disabling Injury', 'Evident Injury (Not Disabling)', 'Probably Injury (Not Apparent)', 'None Apparent', 'Unknown'],
			type_types = ['bicycle', 'pedestrian'],
			type_labels = ['Bicycle', 'Pedestrian'],
			year_types = ['2013', '2014'],
			year_labels = ['2013', '2014'];
		
		// Create a filter interface.
		var type_header = filters.appendChild(document.createElement('h2'));
		type_header.innerHTML = 'Types';
		for (var i = 0; i < type_types.length; i++) {
			// Create an an input checkbox and label inside.
			var item = filters.appendChild(document.createElement('div'));
			var checkbox = item.appendChild(document.createElement('input'));
			var label = item.appendChild(document.createElement('label'));
			checkbox.type = 'checkbox';
			checkbox.id = type_types[i];
			checkbox.checked = true;
			// create a label to the right of the checkbox with explanatory text
			label.innerHTML = type_labels[i];
			label.setAttribute('for', type_types[i]);
			// Whenever a person clicks on this checkbox, call the update().
			checkbox.addEventListener('change', type_display_update);
			type_checkboxes.push(checkbox);
		}
		var levels_header = filters.appendChild(document.createElement('h2'));
		levels_header.innerHTML = 'Injury Levels';
		for (var i = 0; i < types.length; i++) {
			// Create an an input checkbox and label inside.
			var item = filters.appendChild(document.createElement('div'));
			var checkbox = item.appendChild(document.createElement('input'));
			var label = item.appendChild(document.createElement('label'));
			checkbox.type = 'checkbox';
			checkbox.id = types[i];
			checkbox.checked = true;
			// create a label to the right of the checkbox with explanatory text
			label.innerHTML = labels[i];
			label.setAttribute('for', types[i]);
			// Whenever a person clicks on this checkbox, call the update().
			checkbox.addEventListener('change', display_update);
			checkboxes.push(checkbox);
		}
		var years_header = filters.appendChild(document.createElement('h2'));
		years_header.innerHTML = 'Years';
		for (var i = 0; i < year_types.length; i++) {
			// Create an an input checkbox and label inside.
			var item = filters.appendChild(document.createElement('div'));
			var checkbox = item.appendChild(document.createElement('input'));
			var label = item.appendChild(document.createElement('label'));
			checkbox.type = 'checkbox';
			checkbox.id = year_types[i];
			checkbox.checked = true;
			// create a label to the right of the checkbox with explanatory text
			label.innerHTML = year_labels[i];
			label.setAttribute('for', year_types[i]);
			// Whenever a person clicks on this checkbox, call the update().
			checkbox.addEventListener('change', display_update);
			checkboxes.push(checkbox);
		}
		filters_written = true;
		display_update(checkboxes);
	}
}

function type_display_update() {
	var enabled = {};
	// Run through each checkbox and record whether it is checked. If it is,
	// add it to the object of types to display, otherwise do not.
	for (var i = 0; i < type_checkboxes.length; i++) {
		if (type_checkboxes[i].checked) enabled[type_checkboxes[i].id] = true;
	}
	if(typeof(enabled.bicycle)==='undefined' && typeof(which.bicycle)!=='undefined') {
		delete which.bicycle;
		bike_ped_map.removeLayer(bikeFeatureLayer);
	} else if(typeof(enabled.bicycle)!=='undefined' && typeof(which.bicycle)==='undefined') {
		which.bicycle = true;
		bikeFeatureLayer.addTo(bike_ped_map);
	}
	
	if(typeof(enabled.pedestrian)==='undefined' && typeof(which.pedestrian)!=='undefined') {
		delete which.pedestrian;
		bike_ped_map.removeLayer(pedFeatureLayer);
	} else if(typeof(enabled.pedestrian)!=='undefined' && typeof(which.pedestrian)==='undefined') {
		which.pedestrian = true;
		pedFeatureLayer.addTo(bike_ped_map);
	}
}

function display_update() {
	var enabled = {};
	// Run through each checkbox and record whether it is checked. If it is,
	// add it to the object of types to display, otherwise do not.
	for (var i = 0; i < checkboxes.length; i++) {
		if (checkboxes[i].checked) enabled[checkboxes[i].id] = true;
	}
	
	bike_ped_map.eachLayer(function(top_layer) {
		if(typeof(top_layer._geojson)!=='undefined' && (typeof(top_layer._geojson.id)=='undefined' || top_layer._geojson.id!='confluencecity.kpmg98a4')) {
			top_layer.setFilter(function(feature) {
				return (feature.properties['PERSONAL_INJ_LEVEL'] in enabled && feature.properties['YEAR'] in enabled);
			});
			top_layer.eachLayer(function(layer) {
				var accident_level = ['Fatal', 'Disabling Injury', 'Evident Injury (Not Disabling)', 'Probably Injury (Not Apparent)', 'None Apparent', 'Unknown'];
				if(layer.feature.properties.PERSONAL_INJ_LEVEL==0) {
					level = 7;
				} else {
					var level = layer.feature.properties.PERSONAL_INJ_LEVEL - 1;
				}
				var content = 
					'<p>Crash Type: ' + layer.feature.properties.CRASH_SEGMENT + '<br \/>' +
					'Crash Date: ' + layer.feature.properties.ACCIDENT_DATE + '<br \/>' +
					'Injury Level: ' + accident_level[level] + '<br \/>' +
					'Location: ' + layer.feature.properties.ON_LOCATION_STREET;
				if(typeof(layer.feature.properties.AT_LOCATION_STREET)!='undefined') {
					content += ' at '+layer.feature.properties.AT_LOCATION_STREET;
				}
				content += '<\/p>';
				layer.bindPopup(content);
			});
		}
	});
}
