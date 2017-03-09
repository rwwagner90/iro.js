import hsl from "./colorModels/hsl.js";
import rgb from "./colorModels/rgb.js";
import hslString from "./colorModels/hslString.js";
import rgbString from "./colorModels/rgbString.js";
import hexString from "./colorModels/hexString.js";

const colorModels = {
  hsl,
  hslString,
  rgb,
  rgbString,
  hexString,
};

let color = function (str) {
  if (!(this instanceof color)) return new color(str);
  this._onChange = false;
  this._value = {h: undefined, s: undefined, v: undefined};
  Object.defineProperties(this, Object.keys(colorModels).reduce((props, model) => {
    props[model] = {
      set: this["set_" + model],
      get: this["get_" + model],
    };
    return props;
  }, {
    hsv: {
      set: this.set,
      get: this.get,
    }
  }));
  if (str) this.fromString(str);
};

color.prototype = {
  watch: function (callback, callImmediately) {
    this._onChange = callback;
    var value = this._value;
    if (callImmediately) this._onChange(value, value, {h: true, s: true, v: true});
  },
  unwatch: function () {
    this.watch(false);
  },
  set: function (newValue) {
    // loop through the channels and check if any of them have changed
    var changes = {};
    var oldValue = this._value;
    for (var channel in oldValue) {
      if (!newValue.hasOwnProperty(channel)) newValue[channel] = oldValue[channel];
      changes[channel] = !(newValue[channel] == oldValue[channel]);
    }
    // if the value has changed, call hook callback
    if ((changes.h || changes.s || changes.v) && ("function" == typeof this._onChange)) this._onChange(newValue, oldValue, changes);
    // update the old value
    this._value = newValue;
  },
  get: function () {
    return this._value;
  },
  fromString: function (str) {
    if (/^rgb/.test(str)) {
      this.rgbString = str
    }
    else if (/^hsl/.test(str)) {
      this.hslString = str;
    }
    else if (/^#[0-9A-Fa-f]/.test(str)) {
      this.hexString = str;
    }
  }
};

let colorPrototype = color.prototype;

Object.keys(colorModels).forEach(function (key) {
  let model = colorModels[key];
  colorPrototype["set_" + key] = function (value) {
    this.hsv = model.to(value);
  };
  colorPrototype["get_" + key] = function () {
    return model.from(this.hsv);
  };
});

module.exports = color;
