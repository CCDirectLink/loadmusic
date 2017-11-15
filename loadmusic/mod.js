var modDir = "assets/mods/custommusic/";
function loadCustomMusic() {
	var musicData = JSON.parse(fs.readFileSync(modDir + "cm.db", "utf8"));
	for(var i in musicData) {
		for(var j in musicData[i]) {
			musicData[i][cc.bgm[j]] = musicData[i][j];
			if(cc.bgm[j] !== j)
				delete musicData[i][j];
		}
	}
	ig.merge(ig[cc.bgm.playlist], musicData);
};
function loadCustomTrackConfig() {
	var mapMusicData = JSON.parse(fs.readFileSync(modDir + "mm.db", "utf8"));
	for(var mapConfigName of mapMusicData) {
		for(var musicConfigType of mapConfigName) {
			for(var i in musicConfigType) {
				musicConfigType[cc.bgm[i]] = musicConfigType[i];
				if(cc.bgm[i] !== i) 
					delete mapMusicData[mapConfigName][musicConfigType][i];
			}
		}
	}
	ig.merge(ig[cc.bgm.mapConfig], mapMusicData);
};
loadCustomMusic()
loadCustomTrackConfig()