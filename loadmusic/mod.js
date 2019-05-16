var onModsLoaded = function() {
	const loadMusicPath = simplify.getMod("Custom Music Loader").baseDirectory;
	const fs = require('fs');
	const {join } = require('path');
	
	const musicDataFileName = "custom_music.db";
	const musicDataPath = join(loadMusicPath , musicDataFileName);
	function overrideTrackPlayingCheck() {
		let isTrackPlaying = ig.music.isTrackPlaying.bind(ig.music);
		ig.music.isTrackPlaying = function(track, volume) {
			if(!Array.isArray(track)) {
				return isTrackPlaying.apply(this, arguments);
			}
			var topTrack = this._getTopTrack();
			if(!topTrack || this.paused) {
				return false;
			}
			
			return track.filter((currentTrack) => currentTrack.introPath === topTrack.introPath).length;
		}
	}
	function overrideBGMTrack() {
		ig.BgmTrack = ig.BgmTrack.extend({
			init : function(a) {
				this.name = a;
				if (a = cc.ig.BGM_TRACK_LIST[a]) {
					if(a.tracks) {
						this.track = [];
						
						this.random = !!a.random;
						this.trackIndex = 0;
						// a list of names 
						a.tracks.forEach((track) =>  {
							this.track.push(new ig.BgmTrack(track))
						})
					} else {
						this.track = new ig.Track(a.path, a.loopEnd, a.introPath, a.introEnd, a.volume);
					}
				}
			},
			get : function () {
				if(Array.isArray(this.track)) {
					if(this.random) {
						return this.track[Math.floor((Math.random() * this[entries.BGMpath].length))].get();
					}
					let currentTrack = this.track[this.trackIndex%this[entries.BGMpath].length];
					this.trackIndex++;
					return currentTrack;
				}
				return this.track;
			},
			clearCached : function() {
				if(Array.isArray(this[entries.BGMpath])) {
					this[entries.BGMpath].forEach((track) => {
						track.clearCached();
					})
				} else {
					this.parent();
				}
			}
		});
	}
	function deepCopy(obj) {
		return JSON.parse(JSON.stringify(obj));
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
		return pairs;
	}
	function completeRelativePath(modRelativePath, {bgm}) {
		if(bgm) {
			for(let key of Object.keys(bgm)) {
				const singleBGM = bgm[key];
				if(singleBGM.override || singleBGM.swap) {
					continue;
				}
				if(singleBGM.path) {
					singleBGM.path = join(modRelativePath , singleBGM.path);
				}
				if(singleBGM.intro) {
					singleBGM.intro = join(modRelativePath , singleBGM.intro);
				}
			}
		}
	}
	function overrideTrack(musicData) {
		let trackName = musicData.track;
		
		for(var i in musicData) {
			delete musicData[i];
		}
		
		let newTrack = cc.ig.BGM_TRACK_LIST[trackName];
		
		Object.assign(musicData, deepCopy(newTrack));
	}

	function swapTrack(musicData, trackName) {
		
		let otherTrackName = musicData.track;
		
		let firstTrackConfig = cc.ig.BGM_TRACK_LIST[trackName];
		let secondTrackConfig = cc.ig.BGM_TRACK_LIST[otherTrackName];
		
		let trackOneConfig = deepCopy(firstTrackConfig);
		let trackTwoConfig = deepCopy(secondTrackConfig);
		
		
		ig.BGM_TRACK_LIST[trackName] = trackTwoConfig;
		ig.BGM_TRACK_LIST[otherTrackName] = trackOneConfig;
		
	}
	
	function createTrack(musicData) {
		const keyAliases = {
			"intro" : "introPath"
		};
		let musicKeys = getObjectEntries(keyAliases);
		for(let [oldKey, newKey] of musicKeys) {
			renameObjectKey(musicData, oldKey, newKey);
		}		
	}
	function setupCustomMusic(musicData) {
		if(!musicData)
			return;
		let customMusic = musicData.bgm || {};
		
		for (let trackName in customMusic) {
			let music = customMusic[trackName];
			if(music.tracks)
				continue;
			if(music.override) {
				overrideTrack(music);
			}
			else if(music.swap) {
				swapTrack(music, trackName);
				
				// so it doesn't override it
				delete customMusic[trackName];
			} else {
				createTrack(music);
			}
		}
		replaceObjectValue(ig.BGM_TRACK_LIST, customMusic);
	};

	function loadCustomTrackConfig(musicData) {
		if(!musicData)
			return;
		var mapTrackConfigs = musicData.mapTrackConfigs || {};
		
		for (var mapName in mapTrackConfigs) {
			var mapBGMData = mapTrackConfigs[mapName];
			for (let themeType in mapBGMData) {
				renameObjectKey(mapBGMData[themeType],"name", cc.ig.varNames.BGMpath)
			}
		}
		replaceObjectValue(ig.BGM_DEFAULT_TRACKS, mapTrackConfigs);
	};
	overrideBGMTrack();
	overrideTrackPlayingCheck();
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
			completeRelativePath(join('mods', modFolderName), musicData);
			setupCustomMusic(musicData);
			// loadCustomTrackConfig(musicData);
		}
	}
	/**/
	document.body.removeEventListener('modsLoaded', onModsLoaded);

};
document.body.addEventListener('modsLoaded', onModsLoaded);