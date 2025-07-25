'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

module.exports = gevol;
function gevol(context) {
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;
}

gevol.prototype.onVolumioStart = function()
{
	var self = this;
	var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);

	return libQ.resolve();
};

gevol.prototype.onStart = function() {
	var self = this;
	var defer=libQ.defer();

	//self.startLiveLog();

	self.volume = {}; // Global Volume-object for exchanging data with Volumio
	self.gevolStatus = {};
	self.gevolStatus.volume = 0;

	self.initVolumeSettings()
	.then(function() {
		// Once the Plugin has successfull started resolve the promise
		self.logger.info('[GEVOL] onStart: successfully started plugin');
		defer.resolve();
    })
    .fail(err => {
		self.logger.error('[GEVOL] onStart: FAILED to start plugin: ' + err);
		defer.reject(err);
	})

    return defer.promise;
};

gevol.prototype.startLiveLog = function() {
	var self = this;
	
	const format = 'cat'; // json is also an option for more serious logging/filtering
	const args = ['--output', format, '-f'];
	const defaults = {
		cwd: undefined,
		env: process.env
	};
	  
	if (self.livelogchild) {
	self.logger.info('[GEVOL] Killing previous livelog session');
		self.livelogchild.kill();
	}
	self.livelogchild = spawn('/bin/journalctl',args, defaults);
	  
	self.livelogchild.stdout.on('data', (data) => {
		var lines = data.toString().split('\n');
		lines.forEach(function(line) {
			if (line.includes("Volume Spotify")) {
				const vol = Number.parseInt(line.split(" ").pop());
				if (!Number.isNaN(vol)) {
					self.logger.info('[GEVOL] Spotify Volume: ' + vol);
					self.commandRouter.volumiosetvolume(vol);
				}			
			}
		});
	});

	self.livelogchild.stderr.on('data', (data) => {
	  self.logger.info(`stderr: ${data}`);
	});

	self.livelogchild.on('close', (code) => {
	  self.logger.info(`[GEVOL] child process exited with code ${code}`);
	}); 
};

gevol.prototype.onStop = function() {
    var self = this;
    var defer=libQ.defer();

    // Once the Plugin has successfull stopped resolve the promise
    defer.resolve();

    return libQ.resolve();
};

gevol.prototype.onRestart = function() {
    var self = this;
    // Optional, use if you need it
};

// Configuration Methods -----------------------------------------------------------------------------

gevol.prototype.getUIConfig = function() {
    var defer = libQ.defer();
    var self = this;

    var lang_code = this.commandRouter.sharedVars.get('language_code');

    self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
        __dirname+'/i18n/strings_en.json',
        __dirname + '/UIConfig.json')
        .then(function(uiconf)
        {


            defer.resolve(uiconf);
        })
        .fail(function()
        {
            defer.reject(new Error());
        });

    return defer.promise;
};

gevol.prototype.getConfigurationFiles = function() {
	return ['config.json'];
}

gevol.prototype.setUIConfig = function(data) {
	var self = this;
	//Perform your installation tasks here
};

gevol.prototype.getConf = function(varName) {
	var self = this;
	//Perform your installation tasks here
};

gevol.prototype.setConf = function(varName, varValue) {
	var self = this;
	//Perform your installation tasks here
};

// Application Methods -----------------------------------------------------------------------------

// Update the volumio Volume Settings, mainly makes this an Override plugin
gevol.prototype.updateVolumeSettings = function(data) {
	var self = this;
    var defer = libQ.defer();

    self.logger.info('[GEVOL] updateVolumeSettings: received ' + JSON.stringify(data));
    return self.retrievevolume();
};

gevol.prototype.initVolumeSettings = function() {
	var self = this;
    var defer = libQ.defer();

	var volSettingsData = {
		'pluginType': 'system_controller',
		'pluginName': 'gevol',
		'volumeOverride': true
	};
	volSettingsData.device = self.commandRouter.executeOnPlugin('audio_interface', 'alsa_controller', 'getConfigParam', 'outputdevice');
	volSettingsData.name = self.commandRouter.executeOnPlugin('audio_interface', 'alsa_controller', 'getAlsaCards', '')[volSettingsData.device].name;
	volSettingsData.devicename = '';
	volSettingsData.mixer = '';
	volSettingsData.maxvolume = this.commandRouter.executeOnPlugin('audio_interface', 'alsa_controller', 'getConfigParam', 'volumemax');
	volSettingsData.volumecurve = '';
	volSettingsData.volumesteps = 1;
	volSettingsData.currentmute = self.volume.mute;
	self.commandRouter.volumioUpdateVolumeSettings(volSettingsData)
	.then(resp => {
		self.logger.info("[GEVOL] updateVolumeSettings: " + JSON.stringify(volSettingsData + ' ' + resp));
		defer.resolve();
	})
	.fail(err => {
		self.logger.error("[GEVOL] updateVolumeSettings: volumioUpdateVolumeSettings failed:" + err );
		defer.reject(err)
	})
	return defer.promise;
};

// Override the alsavolume function to send volume commands to the amp
gevol.prototype.alsavolume = function (VolumeInteger) {
	var self = this;
	var defer = libQ.defer();

    self.logger.info('[GEVOL] alsavolume: Set volume "' + VolumeInteger + '"')

	switch(VolumeInteger) {		
		case 'mute':
			break;
		case 'unmute':
			break;
		case 'toggle':
			break;
		case '+':
			self.updateVolumeImp(self.gevolStatus.volume + 1);
			break;
		case '-':
			self.updateVolumeImp(self.gevolStatus.volume - 1);
			break;
		default:
			self.updateVolumeImp(parseInt(VolumeInteger));
			break;
	};

	defer.resolve(self.getVolumeObject());
	return defer.promise;
};

gevol.prototype.updateVolumeImp = function (volume) {
	var self = this;
	
	volume = Math.min(volume, 100);
	volume = Math.max(volume, 0);

	if (self.gevolStatus.volume != volume) {				
		const cmdStr = 'curl -X "POST" -d volume=' + volume + ' 127.0.0.1:81';
		//self.logger.info(cmdStr);
		exec(cmdStr, {uid: 1000, gid: 1000}, function (error, stdout, stderr) {
			if (error !== null) {
				self.logger.error('[GEVOL] updateVolumeImp: Error: ' + cmdStr + ' ' + error);
			} else {
				self.logger.info('[GEVOL] updateVolumeImp returned: ' + stdout);					
			}
		});

		self.logger.info('[GEVOL] updateVolumeImp: ' + self.gevolStatus.volume + ' -> ' + volume);
		self.gevolStatus.volume = volume;
	}	
};

// Returns the current settings in an object that volumio can use
gevol.prototype.getVolumeObject = function() {
	var volume = {};
	var defer = libQ.defer();
	var self = this;

	volume.vol = self.gevolStatus.volume;
	volume.vol = Math.min(100, volume.vol);
	volume.vol = Math.max(0, volume.vol);

	volume.mute = volume.vol == 0;
	volume.disableVolumeControl = false;
	self.logger.info('[GEVOL] getVolumeObject: ' + JSON.stringify(volume));
	return libQ.resolve(volume)
	.then(function (volume) {
		defer.resolve(volume);
		self.commandRouter.volumioupdatevolume(volume);
	});
	return volume;
};

gevol.prototype.volumioupdatevolume = function () {
	var self = this;
	self.logger.info('[GEVOL] volumioupdatevolume: ');
	return self.commandRouter.volumioupdatevolume(self.getVolumeObject());
};

gevol.prototype.retrievevolume = function () {
    var self = this;
	self.logger.info('[GEVOL] retrieveVolume: ');
    return self.getVolumeObject();
};
