var onModsLoaded = function() {
	const loadMusicPath = simplify.getMod("Custom Music Loader").baseDirectory;
	const fs = require('fs');
	const {join } = require('path');
	
	const musicDataFileName = "custom_music.db";
	const musicDataPath = join(loadMusicPath , musicDataFileName);
	
	/*try {
		
		console.log(musicData);
	} catch(e) {
		throw Error(`Mod loadmusic could not load.\nFile "${musicDataPath}" was not found.`);
	} */
	
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
		return pairs;
	}
	
	function loadCustomMusic(musicData) {
		if(!musicData)
			return;
		let customMusic = musicData.bgm || {};
		let musicKeys = getObjectEntries(cc.ig.bgm.varNames);
		for (let i in customMusic) {
			for(let [oldKey, newKey] of musicKeys) {
				renameObjectKey(customMusic[i], oldKey, newKey);
			}
		}
		replaceObjectValue(cc.ig.BGM_TRACK_LIST, customMusic);
	};

	function loadCustomTrackConfig(musicData) {
		if(!musicData)
			return;
		var mapTrackConfigs = musicData.mapTrackConfigs || {};
		for (var mapName in mapTrackConfigs) {
			var mapBGMData = mapTrackConfigs[mapName];
			for (var themeType in mapBGMData) {
				renameObjectKey(mapBGMData[themeType],"name", cc.ig.varNames.BGMpath)
			}
		}
		replaceObjectValue(cc.ig.bgm.mapConfig, mapTrackConfigs);
	};
	
	const modDirectory = join(loadMusicPath, '..');
	const modsFolderName = fs.readdirSync(modDirectory);
	for(let modFolderName of modsFolderName) {
		console.log("----------------------");
		console.log(`%c${modFolderName}`, "color:red");
		let modFolder = join(modDirectory, modFolderName);
		
		let modMusicDataFilePath = join(modFolder, musicDataFileName);
		console.log(modFolder, modMusicDataFilePath);
		if(fs.existsSync(modMusicDataFilePath)) {
			console.log(modFolderName, "has music!");
			let rawMusicData = fs.readFileSync(modMusicDataFilePath);
			let musicData = JSON.parse(rawMusicData) || {};
			loadCustomMusic(musicData);
			loadCustomTrackConfig(musicData);
		}
	}
	/**/
	document.body.removeEventListener('modsLoaded', onModsLoaded);

};
document.body.addEventListener('modsLoaded', onModsLoaded);