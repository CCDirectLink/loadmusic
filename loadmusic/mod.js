var onModsLoaded = function() {
	const loadMusicPath = simplify.getMod("Custom Music Loader").baseDirectory;
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
	
	function replaceObjectValue(leftObject, rightObject) {
		for(var key of Object.keys(rightObject)) {
			leftObject[key] = rightObject[key];
		}
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
		let customMusic = musicData.bgm || {};
		let musicKeys = getObjectEntries(cc.ig.bgm.varNames);
		for (let i in customMusic) {
			for(let [oldKey, newKey] of musicKeys) {
				renameObjectKey(customMusic[i], oldKey, newKey);
			}
		}
		replaceObjectValue(cc.ig.BGM_TRACK_LIST, customMusic);
	};

	function loadCustomTrackConfig() {
		var mapTrackConfigs = musicData.mapTrackConfigs;
		for (var mapName in mapTrackConfigs) {
			var mapBGMData = mapTrackConfigs[mapName];
			for (var themeType in mapBGMData) {
				renameObjectKey(mapBGMData[themeType],"name", cc.ig.varNames.BGMpath)
			}
		}
		replaceObjectValue(cc.ig.bgm.mapConfig, mapTrackConfigs);
	};
	
	loadCustomMusic();
	loadCustomTrackConfig();
	document.body.removeEventListener('modsLoaded', this);

};
document.body.addEventListener('modsLoaded', onModsLoaded);
