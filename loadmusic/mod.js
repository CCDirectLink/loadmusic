var modDir = "assets/mods/loadmusic/";
var fs = require('fs');
Object.entries = Object.entries || function(obj) {
    var pairs = []
    for (var i in obj) {
        pairs.push([i, obj[i]])
    }
    return pairs
};
Object.rename = function(obj, oldName, newName) {
    if (obj[oldName]) {
        obj[newName] = obj[oldName]
        delete obj[oldName]
    }
}
function _extendProto(obj, name, newFunc) {
	let old = obj.prototype[name];
	obj.prototype[name] = function() {
	    newFunc.apply(this, arguments);
		old.apply(this, arguments);
	}
}
function extendFunc(name, newFunc) {
     //we can assume the oldFunc is the original function
	 if(typeof(name) === "function") name = name.name; 
	 else if(typeof this[name] === "object" && this[name].name) name = this[name].name;
	 var oldFunc = this[name];
	 _this = this;
	 this[name] = function() {
		newFunc.apply(_this, arguments);
		oldFunc.apply(_this, arguments);
	 }
}
function loadVoiceActing() {
	var voice_database = JSON.parse(fs.readFileSync(modDir + "va.db", 'utf8'));
	var silence = new cc.ig.Effects.PLAY_SOUND(null, {
		group : "va",
		global : true,
		sound : "mods/loadmusic/va/silence.ogg"
	});
	for(var mapName in voice_database) {
		for(var langUid in voice_database[mapName]) {
			voice_database[mapName][langUid] = new cc.ig.Effects.PLAY_SOUND(null, {
				group : "va",
				global : true,
				sound : voice_database[mapName][langUid]
			});
		}
	}
	console.log("Finished loading voices");
	var map_va_templates = null;
	extendFunc.apply(cc.ig.gameMain, [cc.ig.gameMain.LoadMap, function(map_path) {
		map_va_templates = voice_database[map_path] || {};
	}]);
	var langUid = cc.ig.LangLabel.varNames.langUid;
	var msg_langUid;
	var voice_sound;
	var lastLangUid = -1;
	var isPlaying = false;
	_extendProto(cc.ig.events.SHOW_MSG, "start", function() { 
		msg_langUid = this.message[langUid];
		voice_sound = map_va_templates[msg_langUid.toString()];
		if(voice_sound) {
			isPlaying = true;
			voice_sound.start();
		} else if(isPlaying) {
			isPlaying = false;
			silence.start();
		}
		lastLangUid = msg_langUid.toString();
	});
}
function loadCustomMusic() {
    var musicData = JSON.parse(fs.readFileSync(modDir + "cm.db", "utf8"));
    var musicKeys = Object.entries(cc.ig.bgm.varNames);
    musicKeys.forEach(function(element) {
        for (var i in musicData) {
            Object.rename(musicData[i], element[0], element[1])
        }
    })
    ig.merge(cc.ig.BGM_TRACK_LIST, musicData);
};

function loadCustomTrackConfig() {
    var mapMusicData = JSON.parse(fs.readFileSync(modDir + "mm.db", "utf8"));
    for (var mapName in mapMusicData) {
        var mapBGMData = mapMusicData[mapName];
        for (var themeType in mapBGMData) {
            Object.rename(mapBGMData[themeType], "name", cc.ig.varNames.BGMpath)
        }
    }
    ig.merge(cc.ig.bgm.mapConfig, mapMusicData);
};

try {
	loadCustomMusic();
}catch(e) {}

try {
	loadCustomTrackConfig();
}catch(e) {}

try {
	loadVoiceActing();	
}catch(e) {}
