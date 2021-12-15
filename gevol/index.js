'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


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
}

gevol.prototype.onStart = function() {
    	var self = this;
	var defer=libQ.defer();

	self.volume = {}; //global Volume-object for exchanging data with volumio
	self.volume.vol = 10;

this.commandRouter.addCallback('volumioupdatevolume', this.volumioupdatevolume.bind(this));

	this.updateVolumeSettings();

	// Once the Plugin has successfull started resolve the promise
	defer.resolve();

    return defer.promise;
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

//override the alsavolume function to send volume commands to the amp
gevol.prototype.alsavolume = function (VolumeInteger) {
	var self = this;
    	var defer = libQ.defer();
	self.volume.vol = VolumeInteger;
	self.logger.info('[GEVOL] alsavolume: Set volume ' + VolumeInteger);
	defer.resolve(self.getVolumeObject());
	return defer.promise;
}

gevol.prototype.retrievevolume = function () {
    //override the retrievevolume function to read the volume from the amp
    var self = this;
    var defer = libQ.defer();

    self.logger.info('[GEVOL] retrievevolume enter');
    //request current volume
    var volume = self.getVolumeObject();
    self.logger.info('[GEVOL] retrievevolume: returning: ' + JSON.stringify(volume));

    defer.resolve(volume)
    return defer.promise;
};

gevol.prototype.getVolumeObject = function() {
// returns the current amplifier settings in an object that volumio can use
    var volume = {};
    var self = this;

    //self.logger.info('[GEVOL] getVolumeObject: enter ');
    volume.vol = self.volume.vol;
    volume.mute = false;
    volume.disableVolumeControl = false;
    self.logger.info('[GEVOL] getVolumeObject: ' + JSON.stringify(volume));

    return volume;
};

gevol.prototype.updateVolumeSettings = function() {
	var self = this;
    var defer = libQ.defer();

    //Prepare the data for updating the Volume Settings
    //first read the audio-device information, since we won't configure this 
 
	var volSettingsData = {
		'pluginType': 'audio_interface',
		'pluginName': 'gevol',
		'volumeOverride': true
	};
	volSettingsData.device = self.commandRouter.executeOnPlugin('audio_interface', 'alsa_controller', 'getConfigParam', 'outputdevice');
	volSettingsData.name = self.commandRouter.executeOnPlugin('audio_interface', 'alsa_controller', 'getAlsaCards', '')[volSettingsData.device].name;
	volSettingsData.devicename = 'gevol';
	volSettingsData.mixer = 'gevol';
	volSettingsData.maxvolume = 99;
	volSettingsData.volumecurve = '';
	volSettingsData.volumesteps = 5; //self.config.get('volumeSteps');
	volSettingsData.currentmute = false;
	self.commandRouter.volumioUpdateVolumeSettings(volSettingsData)
	.then(resp => {
		self.logger.info("[GEVOL] updateVolumeSettings: " + JSON.stringify(volSettingsData + ' ' + resp));
		defer.resolve();
	})
	.fail(err => {
		self.logger.error("[GEVOL] updateVolumeSettings: volumioUpdateVolumeSettings failed" );
		defer.reject(err)
	})

    return defer.promise;
};

gevol.prototype.volumioupdatevolume = function (vol) {
	var self = this;
	self.logger.info('GEVOL volume: ' + vol.vol + " muted: " + vol.muted);
};



