"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _ControllerYTMusic_instances, _ControllerYTMusic_context, _ControllerYTMusic_config, _ControllerYTMusic_commandRouter, _ControllerYTMusic_browseController, _ControllerYTMusic_searchController, _ControllerYTMusic_playController, _ControllerYTMusic_nowPlayingMetadataProvider, _ControllerYTMusic_getConfigI18nOptions, _ControllerYTMusic_getConfigAccountInfo, _ControllerYTMusic_addToBrowseSources;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const kew_1 = __importDefault(require("kew"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const v_conf_1 = __importDefault(require("v-conf"));
const YTMusicContext_1 = __importDefault(require("./lib/YTMusicContext"));
const BrowseController_1 = __importDefault(require("./lib/controller/browse/BrowseController"));
const SearchController_1 = __importDefault(require("./lib/controller/search/SearchController"));
const PlayController_1 = __importDefault(require("./lib/controller/play/PlayController"));
const util_1 = require("./lib/util");
const model_1 = __importStar(require("./lib/model"));
const ViewHelper_1 = __importDefault(require("./lib/controller/browse/view-handlers/ViewHelper"));
const InnertubeLoader_1 = __importDefault(require("./lib/model/InnertubeLoader"));
const YTMusicNowPlayingMetadataProvider_1 = __importDefault(require("./lib/util/YTMusicNowPlayingMetadataProvider"));
const volumio_youtubei_js_1 = require("volumio-youtubei.js");
class ControllerYTMusic {
    constructor(context) {
        _ControllerYTMusic_instances.add(this);
        _ControllerYTMusic_context.set(this, void 0);
        _ControllerYTMusic_config.set(this, void 0);
        _ControllerYTMusic_commandRouter.set(this, void 0);
        _ControllerYTMusic_browseController.set(this, void 0);
        _ControllerYTMusic_searchController.set(this, void 0);
        _ControllerYTMusic_playController.set(this, void 0);
        _ControllerYTMusic_nowPlayingMetadataProvider.set(this, void 0);
        __classPrivateFieldSet(this, _ControllerYTMusic_context, context, "f");
        __classPrivateFieldSet(this, _ControllerYTMusic_commandRouter, context.coreCommand, "f");
    }
    getUIConfig() {
        const defer = kew_1.default.defer();
        const langCode = __classPrivateFieldGet(this, _ControllerYTMusic_commandRouter, "f").sharedVars.get('language_code');
        const loadConfigPromises = [
            (0, util_1.kewToJSPromise)(__classPrivateFieldGet(this, _ControllerYTMusic_commandRouter, "f").i18nJson(`${__dirname}/i18n/strings_${langCode}.json`, `${__dirname}/i18n/strings_en.json`, `${__dirname}/UIConfig.json`)),
            __classPrivateFieldGet(this, _ControllerYTMusic_instances, "m", _ControllerYTMusic_getConfigI18nOptions).call(this),
            __classPrivateFieldGet(this, _ControllerYTMusic_instances, "m", _ControllerYTMusic_getConfigAccountInfo).call(this)
        ];
        Promise.all(loadConfigPromises)
            .then(([uiconf, i18nOptions, account]) => {
            const i18nUIConf = uiconf.sections[0];
            const accountUIConf = uiconf.sections[1];
            const browseUIConf = uiconf.sections[2];
            const playbackUIConf = uiconf.sections[3];
            // I18n
            // -- region
            i18nUIConf.content[0].label = i18nOptions.options.region.label;
            i18nUIConf.content[0].options = i18nOptions.options.region.optionValues;
            i18nUIConf.content[0].value = i18nOptions.selected.region;
            i18nUIConf.content[1].label = i18nOptions.options.language.label;
            i18nUIConf.content[1].options = i18nOptions.options.language.optionValues;
            i18nUIConf.content[1].value = i18nOptions.selected.language;
            // Account
            const cookie = YTMusicContext_1.default.getConfigValue('cookie');
            let authStatusDescription;
            if (account?.isSignedIn && account.active) {
                authStatusDescription = YTMusicContext_1.default.getI18n('YTMUSIC_AUTH_STATUS_SIGNED_IN_AS', account.active.name);
                if (account.list.length > 1) {
                    const accountSelect = {
                        id: 'activeChannelHandle',
                        element: 'select',
                        label: YTMusicContext_1.default.getI18n('YTMUSIC_ACTIVE_CHANNEL'),
                        value: {
                            label: account.active.name,
                            value: account.active.handle
                        },
                        options: account.list.map((ac) => ({
                            label: ac.name,
                            value: ac.handle
                        }))
                    };
                    accountUIConf.content = [
                        accountUIConf.content[0],
                        accountSelect,
                        ...accountUIConf.content.slice(1)
                    ];
                    accountUIConf.saveButton.data.push('activeChannelHandle');
                }
            }
            else if (cookie) {
                authStatusDescription = YTMusicContext_1.default.getI18n('YTMUSIC_AUTH_STATUS_SIGNED_OUT');
            }
            accountUIConf.description = authStatusDescription;
            accountUIConf.content[0].value = cookie;
            // Browse
            const loadFullPlaylists = YTMusicContext_1.default.getConfigValue('loadFullPlaylists');
            browseUIConf.content[0].value = loadFullPlaylists;
            // Playback
            const autoplay = YTMusicContext_1.default.getConfigValue('autoplay');
            const autoplayClearQueue = YTMusicContext_1.default.getConfigValue('autoplayClearQueue');
            const addToHistory = YTMusicContext_1.default.getConfigValue('addToHistory');
            const prefetchEnabled = YTMusicContext_1.default.getConfigValue('prefetch');
            const preferOpus = YTMusicContext_1.default.getConfigValue('preferOpus');
            playbackUIConf.content[0].value = autoplay;
            playbackUIConf.content[1].value = autoplayClearQueue;
            playbackUIConf.content[2].value = addToHistory;
            playbackUIConf.content[3].value = prefetchEnabled;
            playbackUIConf.content[4].value = preferOpus;
            defer.resolve(uiconf);
        })
            .catch((error) => {
            YTMusicContext_1.default.getLogger().error(YTMusicContext_1.default.getErrorMessage('[ytmusic] getUIConfig(): Cannot populate YouTube Music configuration:', error));
            defer.reject(Error());
        });
        return defer.promise;
    }
    onVolumioStart() {
        const configFile = __classPrivateFieldGet(this, _ControllerYTMusic_commandRouter, "f").pluginManager.getConfigurationFile(__classPrivateFieldGet(this, _ControllerYTMusic_context, "f"), 'config.json');
        __classPrivateFieldSet(this, _ControllerYTMusic_config, new v_conf_1.default(), "f");
        __classPrivateFieldGet(this, _ControllerYTMusic_config, "f").loadFile(configFile);
        return kew_1.default.resolve();
    }
    onStart() {
        YTMusicContext_1.default.init(__classPrivateFieldGet(this, _ControllerYTMusic_context, "f"), __classPrivateFieldGet(this, _ControllerYTMusic_config, "f"));
        __classPrivateFieldSet(this, _ControllerYTMusic_browseController, new BrowseController_1.default(), "f");
        __classPrivateFieldSet(this, _ControllerYTMusic_searchController, new SearchController_1.default(), "f");
        __classPrivateFieldSet(this, _ControllerYTMusic_playController, new PlayController_1.default(), "f");
        __classPrivateFieldSet(this, _ControllerYTMusic_nowPlayingMetadataProvider, new YTMusicNowPlayingMetadataProvider_1.default(), "f");
        volumio_youtubei_js_1.Parser.setParserErrorHandler(() => null); // Disable Innertube parser error reporting
        __classPrivateFieldGet(this, _ControllerYTMusic_instances, "m", _ControllerYTMusic_addToBrowseSources).call(this);
        return kew_1.default.resolve();
    }
    onStop() {
        __classPrivateFieldGet(this, _ControllerYTMusic_commandRouter, "f").volumioRemoveToBrowseSources('YouTube Music');
        __classPrivateFieldGet(this, _ControllerYTMusic_playController, "f")?.reset();
        __classPrivateFieldSet(this, _ControllerYTMusic_browseController, null, "f");
        __classPrivateFieldSet(this, _ControllerYTMusic_searchController, null, "f");
        __classPrivateFieldSet(this, _ControllerYTMusic_playController, null, "f");
        __classPrivateFieldSet(this, _ControllerYTMusic_nowPlayingMetadataProvider, null, "f");
        InnertubeLoader_1.default.reset();
        YTMusicContext_1.default.reset();
        return kew_1.default.resolve();
    }
    getConfigurationFiles() {
        return ['config.json'];
    }
    configSaveI18n(data) {
        const oldRegion = YTMusicContext_1.default.hasConfigKey('region') ? YTMusicContext_1.default.getConfigValue('region') : null;
        const oldLanguage = YTMusicContext_1.default.hasConfigKey('language') ? YTMusicContext_1.default.getConfigValue('language') : null;
        const region = data.region.value;
        const language = data.language.value;
        if (oldRegion !== region || oldLanguage !== language) {
            YTMusicContext_1.default.setConfigValue('region', region);
            YTMusicContext_1.default.setConfigValue('language', language);
            InnertubeLoader_1.default.applyI18nConfig();
            model_1.default.getInstance(model_1.ModelType.Config).clearCache();
            YTMusicContext_1.default.refreshUIConfig();
        }
        YTMusicContext_1.default.toast('success', YTMusicContext_1.default.getI18n('YTMUSIC_SETTINGS_SAVED'));
    }
    configSaveAccount(data) {
        const oldCookie = YTMusicContext_1.default.hasConfigKey('cookie') ? YTMusicContext_1.default.getConfigValue('cookie') : null;
        const cookie = data.cookie?.trim();
        const oldActiveChannelHandle = YTMusicContext_1.default.getConfigValue('activeChannelHandle');
        const activeChannelHandle = data.activeChannelHandle?.value || '';
        let resetInnertube = false;
        if (oldCookie !== cookie) {
            YTMusicContext_1.default.setConfigValue('cookie', cookie);
            YTMusicContext_1.default.deleteConfigValue('activeChannelHandle');
            resetInnertube = true;
        }
        else if (oldActiveChannelHandle !== activeChannelHandle) {
            YTMusicContext_1.default.setConfigValue('activeChannelHandle', activeChannelHandle);
            resetInnertube = true;
        }
        YTMusicContext_1.default.toast('success', YTMusicContext_1.default.getI18n('YTMUSIC_SETTINGS_SAVED'));
        if (resetInnertube) {
            InnertubeLoader_1.default.reset();
            YTMusicContext_1.default.refreshUIConfig();
        }
    }
    configSaveBrowse(data) {
        YTMusicContext_1.default.setConfigValue('loadFullPlaylists', data.loadFullPlaylists);
        YTMusicContext_1.default.toast('success', YTMusicContext_1.default.getI18n('YTMUSIC_SETTINGS_SAVED'));
    }
    configSavePlayback(data) {
        YTMusicContext_1.default.setConfigValue('autoplay', data.autoplay);
        YTMusicContext_1.default.setConfigValue('autoplayClearQueue', data.autoplayClearQueue);
        YTMusicContext_1.default.setConfigValue('addToHistory', data.addToHistory);
        YTMusicContext_1.default.setConfigValue('prefetch', data.prefetch);
        YTMusicContext_1.default.setConfigValue('preferOpus', data.preferOpus);
        YTMusicContext_1.default.toast('success', YTMusicContext_1.default.getI18n('YTMUSIC_SETTINGS_SAVED'));
    }
    handleBrowseUri(uri) {
        if (!__classPrivateFieldGet(this, _ControllerYTMusic_browseController, "f")) {
            return kew_1.default.reject('YouTube Music plugin is not started');
        }
        return (0, util_1.jsPromiseToKew)(__classPrivateFieldGet(this, _ControllerYTMusic_browseController, "f").browseUri(uri));
    }
    explodeUri(uri) {
        if (!__classPrivateFieldGet(this, _ControllerYTMusic_browseController, "f")) {
            return kew_1.default.reject('YouTube Music Discover plugin is not started');
        }
        return (0, util_1.jsPromiseToKew)(__classPrivateFieldGet(this, _ControllerYTMusic_browseController, "f").explodeUri(uri));
    }
    clearAddPlayTrack(track) {
        if (!__classPrivateFieldGet(this, _ControllerYTMusic_playController, "f")) {
            return kew_1.default.reject('YouTube Music plugin is not started');
        }
        return (0, util_1.jsPromiseToKew)(__classPrivateFieldGet(this, _ControllerYTMusic_playController, "f").clearAddPlayTrack(track));
    }
    stop() {
        if (!__classPrivateFieldGet(this, _ControllerYTMusic_playController, "f")) {
            return kew_1.default.reject('YouTube Music plugin is not started');
        }
        return __classPrivateFieldGet(this, _ControllerYTMusic_playController, "f").stop();
    }
    pause() {
        if (!__classPrivateFieldGet(this, _ControllerYTMusic_playController, "f")) {
            return kew_1.default.reject('YouTube Music plugin is not started');
        }
        return __classPrivateFieldGet(this, _ControllerYTMusic_playController, "f").pause();
    }
    resume() {
        if (!__classPrivateFieldGet(this, _ControllerYTMusic_playController, "f")) {
            return kew_1.default.reject('YouTube Music plugin is not started');
        }
        return __classPrivateFieldGet(this, _ControllerYTMusic_playController, "f").resume();
    }
    seek(position) {
        if (!__classPrivateFieldGet(this, _ControllerYTMusic_playController, "f")) {
            return kew_1.default.reject('YouTube Music plugin is not started');
        }
        return __classPrivateFieldGet(this, _ControllerYTMusic_playController, "f").seek(position);
    }
    next() {
        if (!__classPrivateFieldGet(this, _ControllerYTMusic_playController, "f")) {
            return kew_1.default.reject('YouTube Music plugin is not started');
        }
        return __classPrivateFieldGet(this, _ControllerYTMusic_playController, "f").next();
    }
    previous() {
        if (!__classPrivateFieldGet(this, _ControllerYTMusic_playController, "f")) {
            return kew_1.default.reject('YouTube Music plugin is not started');
        }
        return __classPrivateFieldGet(this, _ControllerYTMusic_playController, "f").previous();
    }
    search(query) {
        if (!__classPrivateFieldGet(this, _ControllerYTMusic_searchController, "f")) {
            return kew_1.default.reject('YouTube Music plugin is not started');
        }
        return (0, util_1.jsPromiseToKew)(__classPrivateFieldGet(this, _ControllerYTMusic_searchController, "f").search(query));
    }
    prefetch(track) {
        if (!__classPrivateFieldGet(this, _ControllerYTMusic_playController, "f")) {
            return kew_1.default.reject('YouTube Music plugin is not started');
        }
        return (0, util_1.jsPromiseToKew)(__classPrivateFieldGet(this, _ControllerYTMusic_playController, "f").prefetch(track));
    }
    goto(data) {
        if (!__classPrivateFieldGet(this, _ControllerYTMusic_playController, "f")) {
            return kew_1.default.reject('YouTube Music plugin is not started');
        }
        const defer = kew_1.default.defer();
        __classPrivateFieldGet(this, _ControllerYTMusic_playController, "f").getGotoUri(data.type, data.uri).then((uri) => {
            if (uri) {
                if (!__classPrivateFieldGet(this, _ControllerYTMusic_browseController, "f")) {
                    return kew_1.default.reject('YouTube Music plugin is not started');
                }
                defer.resolve(__classPrivateFieldGet(this, _ControllerYTMusic_browseController, "f").browseUri(uri));
            }
            else {
                const view = ViewHelper_1.default.getViewsFromUri(data.uri)?.[1];
                const trackData = view?.explodeTrackData || null;
                const trackTitle = trackData?.title;
                let errMsg;
                if (data.type === 'album') {
                    errMsg = trackTitle ? YTMusicContext_1.default.getI18n('YTMUSIC_ERR_GOTO_ALBUM_NOT_FOUND_FOR', trackTitle) :
                        YTMusicContext_1.default.getI18n('YTMUSIC_ERR_GOTO_ALBUM_NOT_FOUND');
                }
                else if (data.type === 'artist') {
                    errMsg = trackTitle ? YTMusicContext_1.default.getI18n('YTMUSIC_ERR_GOTO_ARTIST_NOT_FOUND_FOR', trackTitle) :
                        YTMusicContext_1.default.getI18n('YTMUSIC_ERR_GOTO_ARTIST_NOT_FOUND');
                }
                else {
                    errMsg = YTMusicContext_1.default.getI18n('YTMUSIC_ERR_GOTO_UNKNOWN_TYPE', data.type);
                }
                YTMusicContext_1.default.toast('error', errMsg);
                defer.reject(Error(errMsg));
            }
        })
            .catch((error) => {
            YTMusicContext_1.default.getLogger().error(YTMusicContext_1.default.getErrorMessage('[ytmusic] Error obtaining goto URL:', error));
        });
        return defer.promise;
    }
    getNowPlayingMetadataProvider() {
        return __classPrivateFieldGet(this, _ControllerYTMusic_nowPlayingMetadataProvider, "f");
    }
}
_ControllerYTMusic_context = new WeakMap(), _ControllerYTMusic_config = new WeakMap(), _ControllerYTMusic_commandRouter = new WeakMap(), _ControllerYTMusic_browseController = new WeakMap(), _ControllerYTMusic_searchController = new WeakMap(), _ControllerYTMusic_playController = new WeakMap(), _ControllerYTMusic_nowPlayingMetadataProvider = new WeakMap(), _ControllerYTMusic_instances = new WeakSet(), _ControllerYTMusic_getConfigI18nOptions = async function _ControllerYTMusic_getConfigI18nOptions() {
    const model = model_1.default.getInstance(model_1.ModelType.Config);
    const selected = {
        region: { label: '', value: '' },
        language: { label: '', value: '' }
    };
    try {
        const options = await model.getI18nOptions();
        const selectedValues = {
            region: YTMusicContext_1.default.getConfigValue('region'),
            language: YTMusicContext_1.default.getConfigValue('language')
        };
        Object.keys(selected).forEach((key) => {
            selected[key] = options[key]?.optionValues.find((ov) => ov.value === selectedValues[key]) || { label: '', value: selectedValues[key] };
        });
        return {
            options,
            selected
        };
    }
    catch (error) {
        YTMusicContext_1.default.getLogger().error(YTMusicContext_1.default.getErrorMessage('[ytmusic] Error getting i18n options:', error));
        YTMusicContext_1.default.toast('warning', 'Could not obtain i18n options');
        return {
            options: model.getDefaultI18nOptions(),
            selected
        };
    }
}, _ControllerYTMusic_getConfigAccountInfo = function _ControllerYTMusic_getConfigAccountInfo() {
    const model = model_1.default.getInstance(model_1.ModelType.Account);
    try {
        return model.getInfo();
    }
    catch (error) {
        YTMusicContext_1.default.getLogger().warn(YTMusicContext_1.default.getErrorMessage('[ytmusic] Failed to get account config:', error));
        return null;
    }
}, _ControllerYTMusic_addToBrowseSources = function _ControllerYTMusic_addToBrowseSources() {
    const source = {
        name: 'YouTube Music',
        uri: 'ytmusic',
        plugin_type: 'music_service',
        plugin_name: 'ytmusic',
        albumart: '/albumart?sourceicon=music_service/ytmusic/dist/assets/images/ytmusic-mono-s.png'
    };
    __classPrivateFieldGet(this, _ControllerYTMusic_commandRouter, "f").volumioAddToBrowseSources(source);
};
module.exports = ControllerYTMusic;
//# sourceMappingURL=index.js.map