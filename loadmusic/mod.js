var onModsLoaded = function() {
	const loadMusicPath = simplify.getMod("loadmusic").getBaseDirectory();
	const fs = require('fs');
	const {join } = require('path');
	
	const musicDataFileName = "custom_music.db";
	const musicDataPath = join(loadMusicPath , musicDataFileName);
	
	try {
		var rawMusicData = fs.readFileSync(musicDataPath);
		var musicData = JSON.parse(rawMusicData);
		console.log(musicData);
	} catch(e) {
		throw Error(`Mod loadmusic could not load.\nFile "${musicDataPath}" was not found.`);
	}
	
	function renameObjectKey(obj, oldKey, newKey) {
		if(obj[oldKey]) {
			obj[newKey] = obj[oldKey];
			delete obj[oldKey];
		}
	}
	
	function getObjectEntries(obj) {
		var pairs = [];
		for (var i in obj) {
			pairs.push([i, obj[i]]);
		}
		return pairs
	}
	
	function loadCustomMusic() {
		var customMusic = musicData.bgm || {};
		var musicKeys = getObjectEntries(cc.ig.bgm.varNames);
		musicKeys.forEach(function(element) {
			for (var i in customMusic) {
				renameObjectKey(customMusic[i], element[0], element[1]);
			}
		})
		ig.merge(cc.ig.BGM_TRACK_LIST, customMusic);
	};

	function loadCustomTrackConfig() {
		var mapTrackConfigs = musicData.mapTrackConfigs;
		for (var mapName in mapTrackConfigs) {
			var mapBGMData = mapTrackConfigs[mapName];
			for (var themeType in mapBGMData) {
				renameObjectKey(mapBGMData[themeType],"name", cc.ig.varNames.BGMpath)
			}
		}
		ig.merge(cc.ig.bgm.mapConfig, mapTrackConfigs);
	};
	
	loadCustomMusic();
	loadCustomTrackConfig();

};
document.body.addEventListener('modsLoaded', onModsLoaded);
