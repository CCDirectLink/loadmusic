# loadmusic (deprecated)


## How to use:
Edit custom_music.db

### For multi-track bgm:
```js
{
  "bgm" : {
   "nameOfTrack" : {
            "intro" : "path/to/intro.ogg",
            "path" : "path/to/loop.ogg",
            "introEnd" : 32, // offset to trigger the loop
            "loopEnd" : 64, // offset to start loop over at
            "volume" : 0.5
      }
  }
}
```


### For single-track bgm:
```js
{
  "bgm" : {
   "nameOfTrack" : {
            "path" : "path/to/loop.ogg",
            "loopEnd" : 64, // offset to start loop over at
            "volume" : 0.5
      }
  }
}
```

***Note: The path is relative to your mod folder
