var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __pow = Math.pow;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
typeof window !== "undefined" && (window.TONE_SILENCE_LOGGING = true);
const version = "dev";
const createExtendedExponentialRampToValueAutomationEvent = (value, endTime, insertTime) => {
  return { endTime, insertTime, type: "exponentialRampToValue", value };
};
const createExtendedLinearRampToValueAutomationEvent = (value, endTime, insertTime) => {
  return { endTime, insertTime, type: "linearRampToValue", value };
};
const createSetValueAutomationEvent = (value, startTime) => {
  return { startTime, type: "setValue", value };
};
const createSetValueCurveAutomationEvent = (values, startTime, duration) => {
  return { duration, startTime, type: "setValueCurve", values };
};
const getTargetValueAtTime = (time, valueAtStartTime, { startTime, target, timeConstant }) => {
  return target + (valueAtStartTime - target) * Math.exp((startTime - time) / timeConstant);
};
const isExponentialRampToValueAutomationEvent = (automationEvent) => {
  return automationEvent.type === "exponentialRampToValue";
};
const isLinearRampToValueAutomationEvent = (automationEvent) => {
  return automationEvent.type === "linearRampToValue";
};
const isAnyRampToValueAutomationEvent = (automationEvent) => {
  return isExponentialRampToValueAutomationEvent(automationEvent) || isLinearRampToValueAutomationEvent(automationEvent);
};
const isSetValueAutomationEvent = (automationEvent) => {
  return automationEvent.type === "setValue";
};
const isSetValueCurveAutomationEvent = (automationEvent) => {
  return automationEvent.type === "setValueCurve";
};
const getValueOfAutomationEventAtIndexAtTime = (automationEvents, index2, time, defaultValue) => {
  const automationEvent = automationEvents[index2];
  return automationEvent === void 0 ? defaultValue : isAnyRampToValueAutomationEvent(automationEvent) || isSetValueAutomationEvent(automationEvent) ? automationEvent.value : isSetValueCurveAutomationEvent(automationEvent) ? automationEvent.values[automationEvent.values.length - 1] : getTargetValueAtTime(time, getValueOfAutomationEventAtIndexAtTime(automationEvents, index2 - 1, automationEvent.startTime, defaultValue), automationEvent);
};
const getEndTimeAndValueOfPreviousAutomationEvent = (automationEvents, index2, currentAutomationEvent, nextAutomationEvent, defaultValue) => {
  return currentAutomationEvent === void 0 ? [nextAutomationEvent.insertTime, defaultValue] : isAnyRampToValueAutomationEvent(currentAutomationEvent) ? [currentAutomationEvent.endTime, currentAutomationEvent.value] : isSetValueAutomationEvent(currentAutomationEvent) ? [currentAutomationEvent.startTime, currentAutomationEvent.value] : isSetValueCurveAutomationEvent(currentAutomationEvent) ? [
    currentAutomationEvent.startTime + currentAutomationEvent.duration,
    currentAutomationEvent.values[currentAutomationEvent.values.length - 1]
  ] : [
    currentAutomationEvent.startTime,
    getValueOfAutomationEventAtIndexAtTime(automationEvents, index2 - 1, currentAutomationEvent.startTime, defaultValue)
  ];
};
const isCancelAndHoldAutomationEvent = (automationEvent) => {
  return automationEvent.type === "cancelAndHold";
};
const isCancelScheduledValuesAutomationEvent = (automationEvent) => {
  return automationEvent.type === "cancelScheduledValues";
};
const getEventTime = (automationEvent) => {
  if (isCancelAndHoldAutomationEvent(automationEvent) || isCancelScheduledValuesAutomationEvent(automationEvent)) {
    return automationEvent.cancelTime;
  }
  if (isExponentialRampToValueAutomationEvent(automationEvent) || isLinearRampToValueAutomationEvent(automationEvent)) {
    return automationEvent.endTime;
  }
  return automationEvent.startTime;
};
const getExponentialRampValueAtTime = (time, startTime, valueAtStartTime, { endTime, value }) => {
  if (valueAtStartTime === value) {
    return value;
  }
  if (0 < valueAtStartTime && 0 < value || valueAtStartTime < 0 && value < 0) {
    return valueAtStartTime * __pow(value / valueAtStartTime, (time - startTime) / (endTime - startTime));
  }
  return 0;
};
const getLinearRampValueAtTime = (time, startTime, valueAtStartTime, { endTime, value }) => {
  return valueAtStartTime + (time - startTime) / (endTime - startTime) * (value - valueAtStartTime);
};
const interpolateValue = (values, theoreticIndex) => {
  const lowerIndex = Math.floor(theoreticIndex);
  const upperIndex = Math.ceil(theoreticIndex);
  if (lowerIndex === upperIndex) {
    return values[lowerIndex];
  }
  return (1 - (theoreticIndex - lowerIndex)) * values[lowerIndex] + (1 - (upperIndex - theoreticIndex)) * values[upperIndex];
};
const getValueCurveValueAtTime = (time, { duration, startTime, values }) => {
  const theoreticIndex = (time - startTime) / duration * (values.length - 1);
  return interpolateValue(values, theoreticIndex);
};
const isSetTargetAutomationEvent = (automationEvent) => {
  return automationEvent.type === "setTarget";
};
class AutomationEventList {
  constructor(defaultValue) {
    this._automationEvents = [];
    this._currenTime = 0;
    this._defaultValue = defaultValue;
  }
  [Symbol.iterator]() {
    return this._automationEvents[Symbol.iterator]();
  }
  add(automationEvent) {
    const eventTime = getEventTime(automationEvent);
    if (isCancelAndHoldAutomationEvent(automationEvent) || isCancelScheduledValuesAutomationEvent(automationEvent)) {
      const index2 = this._automationEvents.findIndex((currentAutomationEvent) => {
        if (isCancelScheduledValuesAutomationEvent(automationEvent) && isSetValueCurveAutomationEvent(currentAutomationEvent)) {
          return currentAutomationEvent.startTime + currentAutomationEvent.duration >= eventTime;
        }
        return getEventTime(currentAutomationEvent) >= eventTime;
      });
      const removedAutomationEvent = this._automationEvents[index2];
      if (index2 !== -1) {
        this._automationEvents = this._automationEvents.slice(0, index2);
      }
      if (isCancelAndHoldAutomationEvent(automationEvent)) {
        const lastAutomationEvent = this._automationEvents[this._automationEvents.length - 1];
        if (removedAutomationEvent !== void 0 && isAnyRampToValueAutomationEvent(removedAutomationEvent)) {
          if (lastAutomationEvent !== void 0 && isSetTargetAutomationEvent(lastAutomationEvent)) {
            throw new Error("The internal list is malformed.");
          }
          const startTime = lastAutomationEvent === void 0 ? removedAutomationEvent.insertTime : isSetValueCurveAutomationEvent(lastAutomationEvent) ? lastAutomationEvent.startTime + lastAutomationEvent.duration : getEventTime(lastAutomationEvent);
          const startValue = lastAutomationEvent === void 0 ? this._defaultValue : isSetValueCurveAutomationEvent(lastAutomationEvent) ? lastAutomationEvent.values[lastAutomationEvent.values.length - 1] : lastAutomationEvent.value;
          const value = isExponentialRampToValueAutomationEvent(removedAutomationEvent) ? getExponentialRampValueAtTime(eventTime, startTime, startValue, removedAutomationEvent) : getLinearRampValueAtTime(eventTime, startTime, startValue, removedAutomationEvent);
          const truncatedAutomationEvent = isExponentialRampToValueAutomationEvent(removedAutomationEvent) ? createExtendedExponentialRampToValueAutomationEvent(value, eventTime, this._currenTime) : createExtendedLinearRampToValueAutomationEvent(value, eventTime, this._currenTime);
          this._automationEvents.push(truncatedAutomationEvent);
        }
        if (lastAutomationEvent !== void 0 && isSetTargetAutomationEvent(lastAutomationEvent)) {
          this._automationEvents.push(createSetValueAutomationEvent(this.getValue(eventTime), eventTime));
        }
        if (lastAutomationEvent !== void 0 && isSetValueCurveAutomationEvent(lastAutomationEvent) && lastAutomationEvent.startTime + lastAutomationEvent.duration > eventTime) {
          const duration = eventTime - lastAutomationEvent.startTime;
          const ratio = (lastAutomationEvent.values.length - 1) / lastAutomationEvent.duration;
          const length = Math.max(2, 1 + Math.ceil(duration * ratio));
          const fraction = duration / (length - 1) * ratio;
          const values = lastAutomationEvent.values.slice(0, length);
          if (fraction < 1) {
            for (let i = 1; i < length; i += 1) {
              const factor = fraction * i % 1;
              values[i] = lastAutomationEvent.values[i - 1] * (1 - factor) + lastAutomationEvent.values[i] * factor;
            }
          }
          this._automationEvents[this._automationEvents.length - 1] = createSetValueCurveAutomationEvent(values, lastAutomationEvent.startTime, duration);
        }
      }
    } else {
      const index2 = this._automationEvents.findIndex((currentAutomationEvent) => getEventTime(currentAutomationEvent) > eventTime);
      const previousAutomationEvent = index2 === -1 ? this._automationEvents[this._automationEvents.length - 1] : this._automationEvents[index2 - 1];
      if (previousAutomationEvent !== void 0 && isSetValueCurveAutomationEvent(previousAutomationEvent) && getEventTime(previousAutomationEvent) + previousAutomationEvent.duration > eventTime) {
        return false;
      }
      const persistentAutomationEvent = isExponentialRampToValueAutomationEvent(automationEvent) ? createExtendedExponentialRampToValueAutomationEvent(automationEvent.value, automationEvent.endTime, this._currenTime) : isLinearRampToValueAutomationEvent(automationEvent) ? createExtendedLinearRampToValueAutomationEvent(automationEvent.value, eventTime, this._currenTime) : automationEvent;
      if (index2 === -1) {
        this._automationEvents.push(persistentAutomationEvent);
      } else {
        if (isSetValueCurveAutomationEvent(automationEvent) && eventTime + automationEvent.duration > getEventTime(this._automationEvents[index2])) {
          return false;
        }
        this._automationEvents.splice(index2, 0, persistentAutomationEvent);
      }
    }
    return true;
  }
  flush(time) {
    const index2 = this._automationEvents.findIndex((currentAutomationEvent) => getEventTime(currentAutomationEvent) > time);
    if (index2 > 1) {
      const remainingAutomationEvents = this._automationEvents.slice(index2 - 1);
      const firstRemainingAutomationEvent = remainingAutomationEvents[0];
      if (isSetTargetAutomationEvent(firstRemainingAutomationEvent)) {
        remainingAutomationEvents.unshift(createSetValueAutomationEvent(getValueOfAutomationEventAtIndexAtTime(this._automationEvents, index2 - 2, firstRemainingAutomationEvent.startTime, this._defaultValue), firstRemainingAutomationEvent.startTime));
      }
      this._automationEvents = remainingAutomationEvents;
    }
  }
  getValue(time) {
    if (this._automationEvents.length === 0) {
      return this._defaultValue;
    }
    const indexOfNextEvent = this._automationEvents.findIndex((automationEvent) => getEventTime(automationEvent) > time);
    const nextAutomationEvent = this._automationEvents[indexOfNextEvent];
    const indexOfCurrentEvent = (indexOfNextEvent === -1 ? this._automationEvents.length : indexOfNextEvent) - 1;
    const currentAutomationEvent = this._automationEvents[indexOfCurrentEvent];
    if (currentAutomationEvent !== void 0 && isSetTargetAutomationEvent(currentAutomationEvent) && (nextAutomationEvent === void 0 || !isAnyRampToValueAutomationEvent(nextAutomationEvent) || nextAutomationEvent.insertTime > time)) {
      return getTargetValueAtTime(time, getValueOfAutomationEventAtIndexAtTime(this._automationEvents, indexOfCurrentEvent - 1, currentAutomationEvent.startTime, this._defaultValue), currentAutomationEvent);
    }
    if (currentAutomationEvent !== void 0 && isSetValueAutomationEvent(currentAutomationEvent) && (nextAutomationEvent === void 0 || !isAnyRampToValueAutomationEvent(nextAutomationEvent))) {
      return currentAutomationEvent.value;
    }
    if (currentAutomationEvent !== void 0 && isSetValueCurveAutomationEvent(currentAutomationEvent) && (nextAutomationEvent === void 0 || !isAnyRampToValueAutomationEvent(nextAutomationEvent) || currentAutomationEvent.startTime + currentAutomationEvent.duration > time)) {
      if (time < currentAutomationEvent.startTime + currentAutomationEvent.duration) {
        return getValueCurveValueAtTime(time, currentAutomationEvent);
      }
      return currentAutomationEvent.values[currentAutomationEvent.values.length - 1];
    }
    if (currentAutomationEvent !== void 0 && isAnyRampToValueAutomationEvent(currentAutomationEvent) && (nextAutomationEvent === void 0 || !isAnyRampToValueAutomationEvent(nextAutomationEvent))) {
      return currentAutomationEvent.value;
    }
    if (nextAutomationEvent !== void 0 && isExponentialRampToValueAutomationEvent(nextAutomationEvent)) {
      const [startTime, value] = getEndTimeAndValueOfPreviousAutomationEvent(this._automationEvents, indexOfCurrentEvent, currentAutomationEvent, nextAutomationEvent, this._defaultValue);
      return getExponentialRampValueAtTime(time, startTime, value, nextAutomationEvent);
    }
    if (nextAutomationEvent !== void 0 && isLinearRampToValueAutomationEvent(nextAutomationEvent)) {
      const [startTime, value] = getEndTimeAndValueOfPreviousAutomationEvent(this._automationEvents, indexOfCurrentEvent, currentAutomationEvent, nextAutomationEvent, this._defaultValue);
      return getLinearRampValueAtTime(time, startTime, value, nextAutomationEvent);
    }
    return this._defaultValue;
  }
}
const createCancelAndHoldAutomationEvent = (cancelTime) => {
  return { cancelTime, type: "cancelAndHold" };
};
const createCancelScheduledValuesAutomationEvent = (cancelTime) => {
  return { cancelTime, type: "cancelScheduledValues" };
};
const createExponentialRampToValueAutomationEvent = (value, endTime) => {
  return { endTime, type: "exponentialRampToValue", value };
};
const createLinearRampToValueAutomationEvent = (value, endTime) => {
  return { endTime, type: "linearRampToValue", value };
};
const createSetTargetAutomationEvent = (target, startTime, timeConstant) => {
  return { startTime, target, timeConstant, type: "setTarget" };
};
const createAbortError = () => new DOMException("", "AbortError");
const createAddActiveInputConnectionToAudioNode = (insertElementInSet2) => {
  return (activeInputs, source, [output, input, eventListener], ignoreDuplicates) => {
    insertElementInSet2(activeInputs[input], [source, output, eventListener], (activeInputConnection) => activeInputConnection[0] === source && activeInputConnection[1] === output, ignoreDuplicates);
  };
};
const createAddAudioNodeConnections = (audioNodeConnectionsStore) => {
  return (audioNode, audioNodeRenderer, nativeAudioNode) => {
    const activeInputs = [];
    for (let i = 0; i < nativeAudioNode.numberOfInputs; i += 1) {
      activeInputs.push(/* @__PURE__ */ new Set());
    }
    audioNodeConnectionsStore.set(audioNode, {
      activeInputs,
      outputs: /* @__PURE__ */ new Set(),
      passiveInputs: /* @__PURE__ */ new WeakMap(),
      renderer: audioNodeRenderer
    });
  };
};
const createAddAudioParamConnections = (audioParamConnectionsStore) => {
  return (audioParam, audioParamRenderer) => {
    audioParamConnectionsStore.set(audioParam, { activeInputs: /* @__PURE__ */ new Set(), passiveInputs: /* @__PURE__ */ new WeakMap(), renderer: audioParamRenderer });
  };
};
const ACTIVE_AUDIO_NODE_STORE = /* @__PURE__ */ new WeakSet();
const AUDIO_NODE_CONNECTIONS_STORE = /* @__PURE__ */ new WeakMap();
const AUDIO_NODE_STORE = /* @__PURE__ */ new WeakMap();
const AUDIO_PARAM_CONNECTIONS_STORE = /* @__PURE__ */ new WeakMap();
const AUDIO_PARAM_STORE = /* @__PURE__ */ new WeakMap();
const CONTEXT_STORE = /* @__PURE__ */ new WeakMap();
const EVENT_LISTENERS = /* @__PURE__ */ new WeakMap();
const CYCLE_COUNTERS = /* @__PURE__ */ new WeakMap();
const NODE_NAME_TO_PROCESSOR_CONSTRUCTOR_MAPS = /* @__PURE__ */ new WeakMap();
const NODE_TO_PROCESSOR_MAPS = /* @__PURE__ */ new WeakMap();
const handler = {
  construct() {
    return handler;
  }
};
const isConstructible = (constructible) => {
  try {
    const proxy = new Proxy(constructible, handler);
    new proxy();
  } catch (e) {
    return false;
  }
  return true;
};
const IMPORT_STATEMENT_REGEX = /^import(?:(?:[\s]+[\w]+|(?:[\s]+[\w]+[\s]*,)?[\s]*\{[\s]*[\w]+(?:[\s]+as[\s]+[\w]+)?(?:[\s]*,[\s]*[\w]+(?:[\s]+as[\s]+[\w]+)?)*[\s]*}|(?:[\s]+[\w]+[\s]*,)?[\s]*\*[\s]+as[\s]+[\w]+)[\s]+from)?(?:[\s]*)("([^"\\]|\\.)+"|'([^'\\]|\\.)+')(?:[\s]*);?/;
const splitImportStatements = (source, url) => {
  const importStatements = [];
  let sourceWithoutImportStatements = source.replace(/^[\s]+/, "");
  let result = sourceWithoutImportStatements.match(IMPORT_STATEMENT_REGEX);
  while (result !== null) {
    const unresolvedUrl = result[1].slice(1, -1);
    const importStatementWithResolvedUrl = result[0].replace(/([\s]+)?;?$/, "").replace(unresolvedUrl, new URL(unresolvedUrl, url).toString());
    importStatements.push(importStatementWithResolvedUrl);
    sourceWithoutImportStatements = sourceWithoutImportStatements.slice(result[0].length).replace(/^[\s]+/, "");
    result = sourceWithoutImportStatements.match(IMPORT_STATEMENT_REGEX);
  }
  return [importStatements.join(";"), sourceWithoutImportStatements];
};
const verifyParameterDescriptors = (parameterDescriptors) => {
  if (parameterDescriptors !== void 0 && !Array.isArray(parameterDescriptors)) {
    throw new TypeError("The parameterDescriptors property of given value for processorCtor is not an array.");
  }
};
const verifyProcessorCtor = (processorCtor) => {
  if (!isConstructible(processorCtor)) {
    throw new TypeError("The given value for processorCtor should be a constructor.");
  }
  if (processorCtor.prototype === null || typeof processorCtor.prototype !== "object") {
    throw new TypeError("The given value for processorCtor should have a prototype.");
  }
};
const createAddAudioWorkletModule = (cacheTestResult2, createNotSupportedError2, evaluateSource, exposeCurrentFrameAndCurrentTime2, fetchSource, getNativeContext2, getOrCreateBackupOfflineAudioContext2, isNativeOfflineAudioContext2, nativeAudioWorkletNodeConstructor2, ongoingRequests, resolvedRequests, testAudioWorkletProcessorPostMessageSupport, window2) => {
  let index2 = 0;
  return (context2, moduleURL, options = { credentials: "omit" }) => {
    const resolvedRequestsOfContext = resolvedRequests.get(context2);
    if (resolvedRequestsOfContext !== void 0 && resolvedRequestsOfContext.has(moduleURL)) {
      return Promise.resolve();
    }
    const ongoingRequestsOfContext = ongoingRequests.get(context2);
    if (ongoingRequestsOfContext !== void 0) {
      const promiseOfOngoingRequest = ongoingRequestsOfContext.get(moduleURL);
      if (promiseOfOngoingRequest !== void 0) {
        return promiseOfOngoingRequest;
      }
    }
    const nativeContext = getNativeContext2(context2);
    const promise = nativeContext.audioWorklet === void 0 ? fetchSource(moduleURL).then(([source, absoluteUrl]) => {
      const [importStatements, sourceWithoutImportStatements] = splitImportStatements(source, absoluteUrl);
      const wrappedSource = `${importStatements};((a,b)=>{(a[b]=a[b]||[]).push((AudioWorkletProcessor,global,registerProcessor,sampleRate,self,window)=>{${sourceWithoutImportStatements}
})})(window,'_AWGS')`;
      return evaluateSource(wrappedSource);
    }).then(() => {
      const evaluateAudioWorkletGlobalScope = window2._AWGS.pop();
      if (evaluateAudioWorkletGlobalScope === void 0) {
        throw new SyntaxError();
      }
      exposeCurrentFrameAndCurrentTime2(nativeContext.currentTime, nativeContext.sampleRate, () => evaluateAudioWorkletGlobalScope(class AudioWorkletProcessor {
      }, void 0, (name, processorCtor) => {
        if (name.trim() === "") {
          throw createNotSupportedError2();
        }
        const nodeNameToProcessorConstructorMap = NODE_NAME_TO_PROCESSOR_CONSTRUCTOR_MAPS.get(nativeContext);
        if (nodeNameToProcessorConstructorMap !== void 0) {
          if (nodeNameToProcessorConstructorMap.has(name)) {
            throw createNotSupportedError2();
          }
          verifyProcessorCtor(processorCtor);
          verifyParameterDescriptors(processorCtor.parameterDescriptors);
          nodeNameToProcessorConstructorMap.set(name, processorCtor);
        } else {
          verifyProcessorCtor(processorCtor);
          verifyParameterDescriptors(processorCtor.parameterDescriptors);
          NODE_NAME_TO_PROCESSOR_CONSTRUCTOR_MAPS.set(nativeContext, /* @__PURE__ */ new Map([[name, processorCtor]]));
        }
      }, nativeContext.sampleRate, void 0, void 0));
    }) : Promise.all([
      fetchSource(moduleURL),
      Promise.resolve(cacheTestResult2(testAudioWorkletProcessorPostMessageSupport, testAudioWorkletProcessorPostMessageSupport))
    ]).then(([[source, absoluteUrl], isSupportingPostMessage]) => {
      const currentIndex = index2 + 1;
      index2 = currentIndex;
      const [importStatements, sourceWithoutImportStatements] = splitImportStatements(source, absoluteUrl);
      const patchedAudioWorkletProcessor = isSupportingPostMessage ? "AudioWorkletProcessor" : "class extends AudioWorkletProcessor {__b=new WeakSet();constructor(){super();(p=>p.postMessage=(q=>(m,t)=>q.call(p,m,t?t.filter(u=>!this.__b.has(u)):t))(p.postMessage))(this.port)}}";
      const memberDefinition = isSupportingPostMessage ? "" : "__c = (a) => a.forEach(e=>this.__b.add(e.buffer));";
      const bufferRegistration = isSupportingPostMessage ? "" : "i.forEach(this.__c);o.forEach(this.__c);this.__c(Object.values(p));";
      const wrappedSource = `${importStatements};((AudioWorkletProcessor,registerProcessor)=>{${sourceWithoutImportStatements}
})(${patchedAudioWorkletProcessor},(n,p)=>registerProcessor(n,class extends p{${memberDefinition}process(i,o,p){${bufferRegistration}return super.process(i.map(j=>j.some(k=>k.length===0)?[]:j),o,p)}}));registerProcessor('__sac${currentIndex}',class extends AudioWorkletProcessor{process(){return !1}})`;
      const blob = new Blob([wrappedSource], { type: "application/javascript; charset=utf-8" });
      const url = URL.createObjectURL(blob);
      return nativeContext.audioWorklet.addModule(url, options).then(() => {
        if (isNativeOfflineAudioContext2(nativeContext)) {
          return nativeContext;
        }
        const backupOfflineAudioContext = getOrCreateBackupOfflineAudioContext2(nativeContext);
        return backupOfflineAudioContext.audioWorklet.addModule(url, options).then(() => backupOfflineAudioContext);
      }).then((nativeContextOrBackupOfflineAudioContext) => {
        if (nativeAudioWorkletNodeConstructor2 === null) {
          throw new SyntaxError();
        }
        try {
          new nativeAudioWorkletNodeConstructor2(nativeContextOrBackupOfflineAudioContext, `__sac${currentIndex}`);
        } catch (e) {
          throw new SyntaxError();
        }
      }).finally(() => URL.revokeObjectURL(url));
    });
    if (ongoingRequestsOfContext === void 0) {
      ongoingRequests.set(context2, /* @__PURE__ */ new Map([[moduleURL, promise]]));
    } else {
      ongoingRequestsOfContext.set(moduleURL, promise);
    }
    promise.then(() => {
      const updatedResolvedRequestsOfContext = resolvedRequests.get(context2);
      if (updatedResolvedRequestsOfContext === void 0) {
        resolvedRequests.set(context2, /* @__PURE__ */ new Set([moduleURL]));
      } else {
        updatedResolvedRequestsOfContext.add(moduleURL);
      }
    }).finally(() => {
      const updatedOngoingRequestsOfContext = ongoingRequests.get(context2);
      if (updatedOngoingRequestsOfContext !== void 0) {
        updatedOngoingRequestsOfContext.delete(moduleURL);
      }
    });
    return promise;
  };
};
const getValueForKey = (map, key) => {
  const value = map.get(key);
  if (value === void 0) {
    throw new Error("A value with the given key could not be found.");
  }
  return value;
};
const pickElementFromSet = (set, predicate) => {
  const matchingElements = Array.from(set).filter(predicate);
  if (matchingElements.length > 1) {
    throw Error("More than one element was found.");
  }
  if (matchingElements.length === 0) {
    throw Error("No element was found.");
  }
  const [matchingElement] = matchingElements;
  set.delete(matchingElement);
  return matchingElement;
};
const deletePassiveInputConnectionToAudioNode = (passiveInputs, source, output, input) => {
  const passiveInputConnections = getValueForKey(passiveInputs, source);
  const matchingConnection = pickElementFromSet(passiveInputConnections, (passiveInputConnection) => passiveInputConnection[0] === output && passiveInputConnection[1] === input);
  if (passiveInputConnections.size === 0) {
    passiveInputs.delete(source);
  }
  return matchingConnection;
};
const getEventListenersOfAudioNode = (audioNode) => {
  return getValueForKey(EVENT_LISTENERS, audioNode);
};
const setInternalStateToActive = (audioNode) => {
  if (ACTIVE_AUDIO_NODE_STORE.has(audioNode)) {
    throw new Error("The AudioNode is already stored.");
  }
  ACTIVE_AUDIO_NODE_STORE.add(audioNode);
  getEventListenersOfAudioNode(audioNode).forEach((eventListener) => eventListener(true));
};
const isAudioWorkletNode = (audioNode) => {
  return "port" in audioNode;
};
const setInternalStateToPassive = (audioNode) => {
  if (!ACTIVE_AUDIO_NODE_STORE.has(audioNode)) {
    throw new Error("The AudioNode is not stored.");
  }
  ACTIVE_AUDIO_NODE_STORE.delete(audioNode);
  getEventListenersOfAudioNode(audioNode).forEach((eventListener) => eventListener(false));
};
const setInternalStateToPassiveWhenNecessary = (audioNode, activeInputs) => {
  if (!isAudioWorkletNode(audioNode) && activeInputs.every((connections) => connections.size === 0)) {
    setInternalStateToPassive(audioNode);
  }
};
const createAddConnectionToAudioNode = (addActiveInputConnectionToAudioNode2, addPassiveInputConnectionToAudioNode2, connectNativeAudioNodeToNativeAudioNode2, deleteActiveInputConnectionToAudioNode2, disconnectNativeAudioNodeFromNativeAudioNode2, getAudioNodeConnections2, getAudioNodeTailTime2, getEventListenersOfAudioNode2, getNativeAudioNode2, insertElementInSet2, isActiveAudioNode2, isPartOfACycle2, isPassiveAudioNode2) => {
  const tailTimeTimeoutIds = /* @__PURE__ */ new WeakMap();
  return (source, destination, output, input, isOffline) => {
    const { activeInputs, passiveInputs } = getAudioNodeConnections2(destination);
    const { outputs } = getAudioNodeConnections2(source);
    const eventListeners = getEventListenersOfAudioNode2(source);
    const eventListener = (isActive) => {
      const nativeDestinationAudioNode = getNativeAudioNode2(destination);
      const nativeSourceAudioNode = getNativeAudioNode2(source);
      if (isActive) {
        const partialConnection = deletePassiveInputConnectionToAudioNode(passiveInputs, source, output, input);
        addActiveInputConnectionToAudioNode2(activeInputs, source, partialConnection, false);
        if (!isOffline && !isPartOfACycle2(source)) {
          connectNativeAudioNodeToNativeAudioNode2(nativeSourceAudioNode, nativeDestinationAudioNode, output, input);
        }
        if (isPassiveAudioNode2(destination)) {
          setInternalStateToActive(destination);
        }
      } else {
        const partialConnection = deleteActiveInputConnectionToAudioNode2(activeInputs, source, output, input);
        addPassiveInputConnectionToAudioNode2(passiveInputs, input, partialConnection, false);
        if (!isOffline && !isPartOfACycle2(source)) {
          disconnectNativeAudioNodeFromNativeAudioNode2(nativeSourceAudioNode, nativeDestinationAudioNode, output, input);
        }
        const tailTime = getAudioNodeTailTime2(destination);
        if (tailTime === 0) {
          if (isActiveAudioNode2(destination)) {
            setInternalStateToPassiveWhenNecessary(destination, activeInputs);
          }
        } else {
          const tailTimeTimeoutId = tailTimeTimeoutIds.get(destination);
          if (tailTimeTimeoutId !== void 0) {
            clearTimeout(tailTimeTimeoutId);
          }
          tailTimeTimeoutIds.set(destination, setTimeout(() => {
            if (isActiveAudioNode2(destination)) {
              setInternalStateToPassiveWhenNecessary(destination, activeInputs);
            }
          }, tailTime * 1e3));
        }
      }
    };
    if (insertElementInSet2(outputs, [destination, output, input], (outputConnection) => outputConnection[0] === destination && outputConnection[1] === output && outputConnection[2] === input, true)) {
      eventListeners.add(eventListener);
      if (isActiveAudioNode2(source)) {
        addActiveInputConnectionToAudioNode2(activeInputs, source, [output, input, eventListener], true);
      } else {
        addPassiveInputConnectionToAudioNode2(passiveInputs, input, [source, output, eventListener], true);
      }
      return true;
    }
    return false;
  };
};
const createAddPassiveInputConnectionToAudioNode = (insertElementInSet2) => {
  return (passiveInputs, input, [source, output, eventListener], ignoreDuplicates) => {
    const passiveInputConnections = passiveInputs.get(source);
    if (passiveInputConnections === void 0) {
      passiveInputs.set(source, /* @__PURE__ */ new Set([[output, input, eventListener]]));
    } else {
      insertElementInSet2(passiveInputConnections, [output, input, eventListener], (passiveInputConnection) => passiveInputConnection[0] === output && passiveInputConnection[1] === input, ignoreDuplicates);
    }
  };
};
const createAddSilentConnection = (createNativeGainNode2) => {
  return (nativeContext, nativeAudioScheduledSourceNode) => {
    const nativeGainNode = createNativeGainNode2(nativeContext, {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "discrete",
      gain: 0
    });
    nativeAudioScheduledSourceNode.connect(nativeGainNode).connect(nativeContext.destination);
    const disconnect2 = () => {
      nativeAudioScheduledSourceNode.removeEventListener("ended", disconnect2);
      nativeAudioScheduledSourceNode.disconnect(nativeGainNode);
      nativeGainNode.disconnect();
    };
    nativeAudioScheduledSourceNode.addEventListener("ended", disconnect2);
  };
};
const createAddUnrenderedAudioWorkletNode = (getUnrenderedAudioWorkletNodes2) => {
  return (nativeContext, audioWorkletNode) => {
    getUnrenderedAudioWorkletNodes2(nativeContext).add(audioWorkletNode);
  };
};
const DEFAULT_OPTIONS$j = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  fftSize: 2048,
  maxDecibels: -30,
  minDecibels: -100,
  smoothingTimeConstant: 0.8
};
const createAnalyserNodeConstructor = (audionNodeConstructor, createAnalyserNodeRenderer2, createIndexSizeError2, createNativeAnalyserNode2, getNativeContext2, isNativeOfflineAudioContext2) => {
  return class AnalyserNode extends audionNodeConstructor {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$j), options);
      const nativeAnalyserNode = createNativeAnalyserNode2(nativeContext, mergedOptions);
      const analyserNodeRenderer = isNativeOfflineAudioContext2(nativeContext) ? createAnalyserNodeRenderer2() : null;
      super(context2, false, nativeAnalyserNode, analyserNodeRenderer);
      this._nativeAnalyserNode = nativeAnalyserNode;
    }
    get fftSize() {
      return this._nativeAnalyserNode.fftSize;
    }
    set fftSize(value) {
      this._nativeAnalyserNode.fftSize = value;
    }
    get frequencyBinCount() {
      return this._nativeAnalyserNode.frequencyBinCount;
    }
    get maxDecibels() {
      return this._nativeAnalyserNode.maxDecibels;
    }
    set maxDecibels(value) {
      const maxDecibels = this._nativeAnalyserNode.maxDecibels;
      this._nativeAnalyserNode.maxDecibels = value;
      if (!(value > this._nativeAnalyserNode.minDecibels)) {
        this._nativeAnalyserNode.maxDecibels = maxDecibels;
        throw createIndexSizeError2();
      }
    }
    get minDecibels() {
      return this._nativeAnalyserNode.minDecibels;
    }
    set minDecibels(value) {
      const minDecibels = this._nativeAnalyserNode.minDecibels;
      this._nativeAnalyserNode.minDecibels = value;
      if (!(this._nativeAnalyserNode.maxDecibels > value)) {
        this._nativeAnalyserNode.minDecibels = minDecibels;
        throw createIndexSizeError2();
      }
    }
    get smoothingTimeConstant() {
      return this._nativeAnalyserNode.smoothingTimeConstant;
    }
    set smoothingTimeConstant(value) {
      this._nativeAnalyserNode.smoothingTimeConstant = value;
    }
    getByteFrequencyData(array) {
      this._nativeAnalyserNode.getByteFrequencyData(array);
    }
    getByteTimeDomainData(array) {
      this._nativeAnalyserNode.getByteTimeDomainData(array);
    }
    getFloatFrequencyData(array) {
      this._nativeAnalyserNode.getFloatFrequencyData(array);
    }
    getFloatTimeDomainData(array) {
      this._nativeAnalyserNode.getFloatTimeDomainData(array);
    }
  };
};
const isOwnedByContext = (nativeAudioNode, nativeContext) => {
  return nativeAudioNode.context === nativeContext;
};
const createAnalyserNodeRendererFactory = (createNativeAnalyserNode2, getNativeAudioNode2, renderInputsOfAudioNode2) => {
  return () => {
    const renderedNativeAnalyserNodes = /* @__PURE__ */ new WeakMap();
    const createAnalyserNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeAnalyserNode = getNativeAudioNode2(proxy);
      const nativeAnalyserNodeIsOwnedByContext = isOwnedByContext(nativeAnalyserNode, nativeOfflineAudioContext);
      if (!nativeAnalyserNodeIsOwnedByContext) {
        const options = {
          channelCount: nativeAnalyserNode.channelCount,
          channelCountMode: nativeAnalyserNode.channelCountMode,
          channelInterpretation: nativeAnalyserNode.channelInterpretation,
          fftSize: nativeAnalyserNode.fftSize,
          maxDecibels: nativeAnalyserNode.maxDecibels,
          minDecibels: nativeAnalyserNode.minDecibels,
          smoothingTimeConstant: nativeAnalyserNode.smoothingTimeConstant
        };
        nativeAnalyserNode = createNativeAnalyserNode2(nativeOfflineAudioContext, options);
      }
      renderedNativeAnalyserNodes.set(nativeOfflineAudioContext, nativeAnalyserNode);
      yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeAnalyserNode);
      return nativeAnalyserNode;
    });
    return {
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeAnalyserNode = renderedNativeAnalyserNodes.get(nativeOfflineAudioContext);
        if (renderedNativeAnalyserNode !== void 0) {
          return Promise.resolve(renderedNativeAnalyserNode);
        }
        return createAnalyserNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const testAudioBufferCopyChannelMethodsOutOfBoundsSupport = (nativeAudioBuffer) => {
  try {
    nativeAudioBuffer.copyToChannel(new Float32Array(1), 0, -1);
  } catch (e) {
    return false;
  }
  return true;
};
const createIndexSizeError = () => new DOMException("", "IndexSizeError");
const wrapAudioBufferGetChannelDataMethod = (audioBuffer) => {
  audioBuffer.getChannelData = /* @__PURE__ */ ((getChannelData) => {
    return (channel) => {
      try {
        return getChannelData.call(audioBuffer, channel);
      } catch (err) {
        if (err.code === 12) {
          throw createIndexSizeError();
        }
        throw err;
      }
    };
  })(audioBuffer.getChannelData);
};
const DEFAULT_OPTIONS$i = {
  numberOfChannels: 1
};
const createAudioBufferConstructor = (audioBufferStore2, cacheTestResult2, createNotSupportedError2, nativeAudioBufferConstructor2, nativeOfflineAudioContextConstructor2, testNativeAudioBufferConstructorSupport, wrapAudioBufferCopyChannelMethods2, wrapAudioBufferCopyChannelMethodsOutOfBounds2) => {
  let nativeOfflineAudioContext = null;
  return class AudioBuffer2 {
    constructor(options) {
      if (nativeOfflineAudioContextConstructor2 === null) {
        throw new Error("Missing the native OfflineAudioContext constructor.");
      }
      const { length, numberOfChannels, sampleRate } = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$i), options);
      if (nativeOfflineAudioContext === null) {
        nativeOfflineAudioContext = new nativeOfflineAudioContextConstructor2(1, 1, 44100);
      }
      const audioBuffer = nativeAudioBufferConstructor2 !== null && cacheTestResult2(testNativeAudioBufferConstructorSupport, testNativeAudioBufferConstructorSupport) ? new nativeAudioBufferConstructor2({ length, numberOfChannels, sampleRate }) : nativeOfflineAudioContext.createBuffer(numberOfChannels, length, sampleRate);
      if (audioBuffer.numberOfChannels === 0) {
        throw createNotSupportedError2();
      }
      if (typeof audioBuffer.copyFromChannel !== "function") {
        wrapAudioBufferCopyChannelMethods2(audioBuffer);
        wrapAudioBufferGetChannelDataMethod(audioBuffer);
      } else if (!cacheTestResult2(testAudioBufferCopyChannelMethodsOutOfBoundsSupport, () => testAudioBufferCopyChannelMethodsOutOfBoundsSupport(audioBuffer))) {
        wrapAudioBufferCopyChannelMethodsOutOfBounds2(audioBuffer);
      }
      audioBufferStore2.add(audioBuffer);
      return audioBuffer;
    }
    static [Symbol.hasInstance](instance) {
      return instance !== null && typeof instance === "object" && Object.getPrototypeOf(instance) === AudioBuffer2.prototype || audioBufferStore2.has(instance);
    }
  };
};
const MOST_NEGATIVE_SINGLE_FLOAT = -34028234663852886e22;
const MOST_POSITIVE_SINGLE_FLOAT = -MOST_NEGATIVE_SINGLE_FLOAT;
const isActiveAudioNode = (audioNode) => ACTIVE_AUDIO_NODE_STORE.has(audioNode);
const DEFAULT_OPTIONS$h = {
  buffer: null,
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  loop: false,
  loopEnd: 0,
  loopStart: 0,
  playbackRate: 1
};
const createAudioBufferSourceNodeConstructor = (audioNodeConstructor2, createAudioBufferSourceNodeRenderer2, createAudioParam2, createInvalidStateError2, createNativeAudioBufferSourceNode2, getNativeContext2, isNativeOfflineAudioContext2, wrapEventListener2) => {
  return class AudioBufferSourceNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$h), options);
      const nativeAudioBufferSourceNode = createNativeAudioBufferSourceNode2(nativeContext, mergedOptions);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const audioBufferSourceNodeRenderer = isOffline ? createAudioBufferSourceNodeRenderer2() : null;
      super(context2, false, nativeAudioBufferSourceNode, audioBufferSourceNodeRenderer);
      this._audioBufferSourceNodeRenderer = audioBufferSourceNodeRenderer;
      this._isBufferNullified = false;
      this._isBufferSet = mergedOptions.buffer !== null;
      this._nativeAudioBufferSourceNode = nativeAudioBufferSourceNode;
      this._onended = null;
      this._playbackRate = createAudioParam2(this, isOffline, nativeAudioBufferSourceNode.playbackRate, MOST_POSITIVE_SINGLE_FLOAT, MOST_NEGATIVE_SINGLE_FLOAT);
    }
    get buffer() {
      if (this._isBufferNullified) {
        return null;
      }
      return this._nativeAudioBufferSourceNode.buffer;
    }
    set buffer(value) {
      this._nativeAudioBufferSourceNode.buffer = value;
      if (value !== null) {
        if (this._isBufferSet) {
          throw createInvalidStateError2();
        }
        this._isBufferSet = true;
      }
    }
    get loop() {
      return this._nativeAudioBufferSourceNode.loop;
    }
    set loop(value) {
      this._nativeAudioBufferSourceNode.loop = value;
    }
    get loopEnd() {
      return this._nativeAudioBufferSourceNode.loopEnd;
    }
    set loopEnd(value) {
      this._nativeAudioBufferSourceNode.loopEnd = value;
    }
    get loopStart() {
      return this._nativeAudioBufferSourceNode.loopStart;
    }
    set loopStart(value) {
      this._nativeAudioBufferSourceNode.loopStart = value;
    }
    get onended() {
      return this._onended;
    }
    set onended(value) {
      const wrappedListener = typeof value === "function" ? wrapEventListener2(this, value) : null;
      this._nativeAudioBufferSourceNode.onended = wrappedListener;
      const nativeOnEnded = this._nativeAudioBufferSourceNode.onended;
      this._onended = nativeOnEnded !== null && nativeOnEnded === wrappedListener ? value : nativeOnEnded;
    }
    get playbackRate() {
      return this._playbackRate;
    }
    start(when = 0, offset = 0, duration) {
      this._nativeAudioBufferSourceNode.start(when, offset, duration);
      if (this._audioBufferSourceNodeRenderer !== null) {
        this._audioBufferSourceNodeRenderer.start = duration === void 0 ? [when, offset] : [when, offset, duration];
      }
      if (this.context.state !== "closed") {
        setInternalStateToActive(this);
        const resetInternalStateToPassive = () => {
          this._nativeAudioBufferSourceNode.removeEventListener("ended", resetInternalStateToPassive);
          if (isActiveAudioNode(this)) {
            setInternalStateToPassive(this);
          }
        };
        this._nativeAudioBufferSourceNode.addEventListener("ended", resetInternalStateToPassive);
      }
    }
    stop(when = 0) {
      this._nativeAudioBufferSourceNode.stop(when);
      if (this._audioBufferSourceNodeRenderer !== null) {
        this._audioBufferSourceNodeRenderer.stop = when;
      }
    }
  };
};
const createAudioBufferSourceNodeRendererFactory = (connectAudioParam2, createNativeAudioBufferSourceNode2, getNativeAudioNode2, renderAutomation2, renderInputsOfAudioNode2) => {
  return () => {
    const renderedNativeAudioBufferSourceNodes = /* @__PURE__ */ new WeakMap();
    let start2 = null;
    let stop = null;
    const createAudioBufferSourceNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeAudioBufferSourceNode = getNativeAudioNode2(proxy);
      const nativeAudioBufferSourceNodeIsOwnedByContext = isOwnedByContext(nativeAudioBufferSourceNode, nativeOfflineAudioContext);
      if (!nativeAudioBufferSourceNodeIsOwnedByContext) {
        const options = {
          buffer: nativeAudioBufferSourceNode.buffer,
          channelCount: nativeAudioBufferSourceNode.channelCount,
          channelCountMode: nativeAudioBufferSourceNode.channelCountMode,
          channelInterpretation: nativeAudioBufferSourceNode.channelInterpretation,
          loop: nativeAudioBufferSourceNode.loop,
          loopEnd: nativeAudioBufferSourceNode.loopEnd,
          loopStart: nativeAudioBufferSourceNode.loopStart,
          playbackRate: nativeAudioBufferSourceNode.playbackRate.value
        };
        nativeAudioBufferSourceNode = createNativeAudioBufferSourceNode2(nativeOfflineAudioContext, options);
        if (start2 !== null) {
          nativeAudioBufferSourceNode.start(...start2);
        }
        if (stop !== null) {
          nativeAudioBufferSourceNode.stop(stop);
        }
      }
      renderedNativeAudioBufferSourceNodes.set(nativeOfflineAudioContext, nativeAudioBufferSourceNode);
      if (!nativeAudioBufferSourceNodeIsOwnedByContext) {
        yield renderAutomation2(nativeOfflineAudioContext, proxy.playbackRate, nativeAudioBufferSourceNode.playbackRate);
      } else {
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.playbackRate, nativeAudioBufferSourceNode.playbackRate);
      }
      yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeAudioBufferSourceNode);
      return nativeAudioBufferSourceNode;
    });
    return {
      set start(value) {
        start2 = value;
      },
      set stop(value) {
        stop = value;
      },
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeAudioBufferSourceNode = renderedNativeAudioBufferSourceNodes.get(nativeOfflineAudioContext);
        if (renderedNativeAudioBufferSourceNode !== void 0) {
          return Promise.resolve(renderedNativeAudioBufferSourceNode);
        }
        return createAudioBufferSourceNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const isAudioBufferSourceNode = (audioNode) => {
  return "playbackRate" in audioNode;
};
const isBiquadFilterNode = (audioNode) => {
  return "frequency" in audioNode && "gain" in audioNode;
};
const isConstantSourceNode = (audioNode) => {
  return "offset" in audioNode;
};
const isGainNode = (audioNode) => {
  return !("frequency" in audioNode) && "gain" in audioNode;
};
const isOscillatorNode = (audioNode) => {
  return "detune" in audioNode && "frequency" in audioNode && !("gain" in audioNode);
};
const isStereoPannerNode = (audioNode) => {
  return "pan" in audioNode;
};
const getAudioNodeConnections = (audioNode) => {
  return getValueForKey(AUDIO_NODE_CONNECTIONS_STORE, audioNode);
};
const getAudioParamConnections = (audioParam) => {
  return getValueForKey(AUDIO_PARAM_CONNECTIONS_STORE, audioParam);
};
const deactivateActiveAudioNodeInputConnections = (audioNode, trace) => {
  const { activeInputs } = getAudioNodeConnections(audioNode);
  activeInputs.forEach((connections) => connections.forEach(([source]) => {
    if (!trace.includes(audioNode)) {
      deactivateActiveAudioNodeInputConnections(source, [...trace, audioNode]);
    }
  }));
  const audioParams = isAudioBufferSourceNode(audioNode) ? [
    audioNode.playbackRate
  ] : isAudioWorkletNode(audioNode) ? Array.from(audioNode.parameters.values()) : isBiquadFilterNode(audioNode) ? [audioNode.Q, audioNode.detune, audioNode.frequency, audioNode.gain] : isConstantSourceNode(audioNode) ? [audioNode.offset] : isGainNode(audioNode) ? [audioNode.gain] : isOscillatorNode(audioNode) ? [audioNode.detune, audioNode.frequency] : isStereoPannerNode(audioNode) ? [audioNode.pan] : [];
  for (const audioParam of audioParams) {
    const audioParamConnections = getAudioParamConnections(audioParam);
    if (audioParamConnections !== void 0) {
      audioParamConnections.activeInputs.forEach(([source]) => deactivateActiveAudioNodeInputConnections(source, trace));
    }
  }
  if (isActiveAudioNode(audioNode)) {
    setInternalStateToPassive(audioNode);
  }
};
const deactivateAudioGraph = (context2) => {
  deactivateActiveAudioNodeInputConnections(context2.destination, []);
};
const isValidLatencyHint = (latencyHint) => {
  return latencyHint === void 0 || typeof latencyHint === "number" || typeof latencyHint === "string" && (latencyHint === "balanced" || latencyHint === "interactive" || latencyHint === "playback");
};
const createAudioContextConstructor = (baseAudioContextConstructor2, createInvalidStateError2, createNotSupportedError2, createUnknownError2, mediaElementAudioSourceNodeConstructor2, mediaStreamAudioDestinationNodeConstructor2, mediaStreamAudioSourceNodeConstructor2, mediaStreamTrackAudioSourceNodeConstructor2, nativeAudioContextConstructor2) => {
  return class AudioContext extends baseAudioContextConstructor2 {
    constructor(options = {}) {
      if (nativeAudioContextConstructor2 === null) {
        throw new Error("Missing the native AudioContext constructor.");
      }
      let nativeAudioContext;
      try {
        nativeAudioContext = new nativeAudioContextConstructor2(options);
      } catch (err) {
        if (err.code === 12 && err.message === "sampleRate is not in range") {
          throw createNotSupportedError2();
        }
        throw err;
      }
      if (nativeAudioContext === null) {
        throw createUnknownError2();
      }
      if (!isValidLatencyHint(options.latencyHint)) {
        throw new TypeError(`The provided value '${options.latencyHint}' is not a valid enum value of type AudioContextLatencyCategory.`);
      }
      if (options.sampleRate !== void 0 && nativeAudioContext.sampleRate !== options.sampleRate) {
        throw createNotSupportedError2();
      }
      super(nativeAudioContext, 2);
      const { latencyHint } = options;
      const { sampleRate } = nativeAudioContext;
      this._baseLatency = typeof nativeAudioContext.baseLatency === "number" ? nativeAudioContext.baseLatency : latencyHint === "balanced" ? 512 / sampleRate : latencyHint === "interactive" || latencyHint === void 0 ? 256 / sampleRate : latencyHint === "playback" ? 1024 / sampleRate : Math.max(2, Math.min(128, Math.round(latencyHint * sampleRate / 128))) * 128 / sampleRate;
      this._nativeAudioContext = nativeAudioContext;
      if (nativeAudioContextConstructor2.name === "webkitAudioContext") {
        this._nativeGainNode = nativeAudioContext.createGain();
        this._nativeOscillatorNode = nativeAudioContext.createOscillator();
        this._nativeGainNode.gain.value = 1e-37;
        this._nativeOscillatorNode.connect(this._nativeGainNode).connect(nativeAudioContext.destination);
        this._nativeOscillatorNode.start();
      } else {
        this._nativeGainNode = null;
        this._nativeOscillatorNode = null;
      }
      this._state = null;
      if (nativeAudioContext.state === "running") {
        this._state = "suspended";
        const revokeState = () => {
          if (this._state === "suspended") {
            this._state = null;
          }
          nativeAudioContext.removeEventListener("statechange", revokeState);
        };
        nativeAudioContext.addEventListener("statechange", revokeState);
      }
    }
    get baseLatency() {
      return this._baseLatency;
    }
    get state() {
      return this._state !== null ? this._state : this._nativeAudioContext.state;
    }
    close() {
      if (this.state === "closed") {
        return this._nativeAudioContext.close().then(() => {
          throw createInvalidStateError2();
        });
      }
      if (this._state === "suspended") {
        this._state = null;
      }
      return this._nativeAudioContext.close().then(() => {
        if (this._nativeGainNode !== null && this._nativeOscillatorNode !== null) {
          this._nativeOscillatorNode.stop();
          this._nativeGainNode.disconnect();
          this._nativeOscillatorNode.disconnect();
        }
        deactivateAudioGraph(this);
      });
    }
    createMediaElementSource(mediaElement) {
      return new mediaElementAudioSourceNodeConstructor2(this, { mediaElement });
    }
    createMediaStreamDestination() {
      return new mediaStreamAudioDestinationNodeConstructor2(this);
    }
    createMediaStreamSource(mediaStream) {
      return new mediaStreamAudioSourceNodeConstructor2(this, { mediaStream });
    }
    createMediaStreamTrackSource(mediaStreamTrack) {
      return new mediaStreamTrackAudioSourceNodeConstructor2(this, { mediaStreamTrack });
    }
    resume() {
      if (this._state === "suspended") {
        return new Promise((resolve, reject) => {
          const resolvePromise = () => {
            this._nativeAudioContext.removeEventListener("statechange", resolvePromise);
            if (this._nativeAudioContext.state === "running") {
              resolve();
            } else {
              this.resume().then(resolve, reject);
            }
          };
          this._nativeAudioContext.addEventListener("statechange", resolvePromise);
        });
      }
      return this._nativeAudioContext.resume().catch((err) => {
        if (err === void 0 || err.code === 15) {
          throw createInvalidStateError2();
        }
        throw err;
      });
    }
    suspend() {
      return this._nativeAudioContext.suspend().catch((err) => {
        if (err === void 0) {
          throw createInvalidStateError2();
        }
        throw err;
      });
    }
  };
};
const createAudioDestinationNodeConstructor = (audioNodeConstructor2, createAudioDestinationNodeRenderer2, createIndexSizeError2, createInvalidStateError2, createNativeAudioDestinationNode, getNativeContext2, isNativeOfflineAudioContext2, renderInputsOfAudioNode2) => {
  return class AudioDestinationNode extends audioNodeConstructor2 {
    constructor(context2, channelCount) {
      const nativeContext = getNativeContext2(context2);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const nativeAudioDestinationNode = createNativeAudioDestinationNode(nativeContext, channelCount, isOffline);
      const audioDestinationNodeRenderer = isOffline ? createAudioDestinationNodeRenderer2(renderInputsOfAudioNode2) : null;
      super(context2, false, nativeAudioDestinationNode, audioDestinationNodeRenderer);
      this._isNodeOfNativeOfflineAudioContext = isOffline;
      this._nativeAudioDestinationNode = nativeAudioDestinationNode;
    }
    get channelCount() {
      return this._nativeAudioDestinationNode.channelCount;
    }
    set channelCount(value) {
      if (this._isNodeOfNativeOfflineAudioContext) {
        throw createInvalidStateError2();
      }
      if (value > this._nativeAudioDestinationNode.maxChannelCount) {
        throw createIndexSizeError2();
      }
      this._nativeAudioDestinationNode.channelCount = value;
    }
    get channelCountMode() {
      return this._nativeAudioDestinationNode.channelCountMode;
    }
    set channelCountMode(value) {
      if (this._isNodeOfNativeOfflineAudioContext) {
        throw createInvalidStateError2();
      }
      this._nativeAudioDestinationNode.channelCountMode = value;
    }
    get maxChannelCount() {
      return this._nativeAudioDestinationNode.maxChannelCount;
    }
  };
};
const createAudioDestinationNodeRenderer = (renderInputsOfAudioNode2) => {
  const renderedNativeAudioDestinationNodes = /* @__PURE__ */ new WeakMap();
  const createAudioDestinationNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
    const nativeAudioDestinationNode = nativeOfflineAudioContext.destination;
    renderedNativeAudioDestinationNodes.set(nativeOfflineAudioContext, nativeAudioDestinationNode);
    yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeAudioDestinationNode);
    return nativeAudioDestinationNode;
  });
  return {
    render(proxy, nativeOfflineAudioContext) {
      const renderedNativeAudioDestinationNode = renderedNativeAudioDestinationNodes.get(nativeOfflineAudioContext);
      if (renderedNativeAudioDestinationNode !== void 0) {
        return Promise.resolve(renderedNativeAudioDestinationNode);
      }
      return createAudioDestinationNode(proxy, nativeOfflineAudioContext);
    }
  };
};
const createAudioListenerFactory = (createAudioParam2, createNativeChannelMergerNode2, createNativeConstantSourceNode2, createNativeScriptProcessorNode2, createNotSupportedError2, getFirstSample2, isNativeOfflineAudioContext2, overwriteAccessors2) => {
  return (context2, nativeContext) => {
    const nativeListener = nativeContext.listener;
    const createFakeAudioParams = () => {
      const buffer = new Float32Array(1);
      const channelMergerNode = createNativeChannelMergerNode2(nativeContext, {
        channelCount: 1,
        channelCountMode: "explicit",
        channelInterpretation: "speakers",
        numberOfInputs: 9
      });
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      let isScriptProcessorNodeCreated = false;
      let lastOrientation = [0, 0, -1, 0, 1, 0];
      let lastPosition = [0, 0, 0];
      const createScriptProcessorNode = () => {
        if (isScriptProcessorNodeCreated) {
          return;
        }
        isScriptProcessorNodeCreated = true;
        const scriptProcessorNode = createNativeScriptProcessorNode2(nativeContext, 256, 9, 0);
        scriptProcessorNode.onaudioprocess = ({ inputBuffer }) => {
          const orientation = [
            getFirstSample2(inputBuffer, buffer, 0),
            getFirstSample2(inputBuffer, buffer, 1),
            getFirstSample2(inputBuffer, buffer, 2),
            getFirstSample2(inputBuffer, buffer, 3),
            getFirstSample2(inputBuffer, buffer, 4),
            getFirstSample2(inputBuffer, buffer, 5)
          ];
          if (orientation.some((value, index2) => value !== lastOrientation[index2])) {
            nativeListener.setOrientation(...orientation);
            lastOrientation = orientation;
          }
          const positon = [
            getFirstSample2(inputBuffer, buffer, 6),
            getFirstSample2(inputBuffer, buffer, 7),
            getFirstSample2(inputBuffer, buffer, 8)
          ];
          if (positon.some((value, index2) => value !== lastPosition[index2])) {
            nativeListener.setPosition(...positon);
            lastPosition = positon;
          }
        };
        channelMergerNode.connect(scriptProcessorNode);
      };
      const createSetOrientation = (index2) => (value) => {
        if (value !== lastOrientation[index2]) {
          lastOrientation[index2] = value;
          nativeListener.setOrientation(...lastOrientation);
        }
      };
      const createSetPosition = (index2) => (value) => {
        if (value !== lastPosition[index2]) {
          lastPosition[index2] = value;
          nativeListener.setPosition(...lastPosition);
        }
      };
      const createFakeAudioParam = (input, initialValue, setValue) => {
        const constantSourceNode = createNativeConstantSourceNode2(nativeContext, {
          channelCount: 1,
          channelCountMode: "explicit",
          channelInterpretation: "discrete",
          offset: initialValue
        });
        constantSourceNode.connect(channelMergerNode, 0, input);
        constantSourceNode.start();
        Object.defineProperty(constantSourceNode.offset, "defaultValue", {
          get() {
            return initialValue;
          }
        });
        const audioParam = createAudioParam2({ context: context2 }, isOffline, constantSourceNode.offset, MOST_POSITIVE_SINGLE_FLOAT, MOST_NEGATIVE_SINGLE_FLOAT);
        overwriteAccessors2(audioParam, "value", (get) => () => get.call(audioParam), (set) => (value) => {
          try {
            set.call(audioParam, value);
          } catch (err) {
            if (err.code !== 9) {
              throw err;
            }
          }
          createScriptProcessorNode();
          if (isOffline) {
            setValue(value);
          }
        });
        audioParam.cancelAndHoldAtTime = ((cancelAndHoldAtTime) => {
          if (isOffline) {
            return () => {
              throw createNotSupportedError2();
            };
          }
          return (...args) => {
            const value = cancelAndHoldAtTime.apply(audioParam, args);
            createScriptProcessorNode();
            return value;
          };
        })(audioParam.cancelAndHoldAtTime);
        audioParam.cancelScheduledValues = ((cancelScheduledValues) => {
          if (isOffline) {
            return () => {
              throw createNotSupportedError2();
            };
          }
          return (...args) => {
            const value = cancelScheduledValues.apply(audioParam, args);
            createScriptProcessorNode();
            return value;
          };
        })(audioParam.cancelScheduledValues);
        audioParam.exponentialRampToValueAtTime = ((exponentialRampToValueAtTime) => {
          if (isOffline) {
            return () => {
              throw createNotSupportedError2();
            };
          }
          return (...args) => {
            const value = exponentialRampToValueAtTime.apply(audioParam, args);
            createScriptProcessorNode();
            return value;
          };
        })(audioParam.exponentialRampToValueAtTime);
        audioParam.linearRampToValueAtTime = ((linearRampToValueAtTime) => {
          if (isOffline) {
            return () => {
              throw createNotSupportedError2();
            };
          }
          return (...args) => {
            const value = linearRampToValueAtTime.apply(audioParam, args);
            createScriptProcessorNode();
            return value;
          };
        })(audioParam.linearRampToValueAtTime);
        audioParam.setTargetAtTime = ((setTargetAtTime) => {
          if (isOffline) {
            return () => {
              throw createNotSupportedError2();
            };
          }
          return (...args) => {
            const value = setTargetAtTime.apply(audioParam, args);
            createScriptProcessorNode();
            return value;
          };
        })(audioParam.setTargetAtTime);
        audioParam.setValueAtTime = ((setValueAtTime) => {
          if (isOffline) {
            return () => {
              throw createNotSupportedError2();
            };
          }
          return (...args) => {
            const value = setValueAtTime.apply(audioParam, args);
            createScriptProcessorNode();
            return value;
          };
        })(audioParam.setValueAtTime);
        audioParam.setValueCurveAtTime = ((setValueCurveAtTime) => {
          if (isOffline) {
            return () => {
              throw createNotSupportedError2();
            };
          }
          return (...args) => {
            const value = setValueCurveAtTime.apply(audioParam, args);
            createScriptProcessorNode();
            return value;
          };
        })(audioParam.setValueCurveAtTime);
        return audioParam;
      };
      return {
        forwardX: createFakeAudioParam(0, 0, createSetOrientation(0)),
        forwardY: createFakeAudioParam(1, 0, createSetOrientation(1)),
        forwardZ: createFakeAudioParam(2, -1, createSetOrientation(2)),
        positionX: createFakeAudioParam(6, 0, createSetPosition(0)),
        positionY: createFakeAudioParam(7, 0, createSetPosition(1)),
        positionZ: createFakeAudioParam(8, 0, createSetPosition(2)),
        upX: createFakeAudioParam(3, 0, createSetOrientation(3)),
        upY: createFakeAudioParam(4, 1, createSetOrientation(4)),
        upZ: createFakeAudioParam(5, 0, createSetOrientation(5))
      };
    };
    const { forwardX, forwardY, forwardZ, positionX, positionY, positionZ, upX, upY, upZ } = nativeListener.forwardX === void 0 ? createFakeAudioParams() : nativeListener;
    return {
      get forwardX() {
        return forwardX;
      },
      get forwardY() {
        return forwardY;
      },
      get forwardZ() {
        return forwardZ;
      },
      get positionX() {
        return positionX;
      },
      get positionY() {
        return positionY;
      },
      get positionZ() {
        return positionZ;
      },
      get upX() {
        return upX;
      },
      get upY() {
        return upY;
      },
      get upZ() {
        return upZ;
      }
    };
  };
};
const isAudioNode$1 = (audioNodeOrAudioParam) => {
  return "context" in audioNodeOrAudioParam;
};
const isAudioNodeOutputConnection = (outputConnection) => {
  return isAudioNode$1(outputConnection[0]);
};
const insertElementInSet = (set, element, predicate, ignoreDuplicates) => {
  for (const lmnt of set) {
    if (predicate(lmnt)) {
      if (ignoreDuplicates) {
        return false;
      }
      throw Error("The set contains at least one similar element.");
    }
  }
  set.add(element);
  return true;
};
const addActiveInputConnectionToAudioParam = (activeInputs, source, [output, eventListener], ignoreDuplicates) => {
  insertElementInSet(activeInputs, [source, output, eventListener], (activeInputConnection) => activeInputConnection[0] === source && activeInputConnection[1] === output, ignoreDuplicates);
};
const addPassiveInputConnectionToAudioParam = (passiveInputs, [source, output, eventListener], ignoreDuplicates) => {
  const passiveInputConnections = passiveInputs.get(source);
  if (passiveInputConnections === void 0) {
    passiveInputs.set(source, /* @__PURE__ */ new Set([[output, eventListener]]));
  } else {
    insertElementInSet(passiveInputConnections, [output, eventListener], (passiveInputConnection) => passiveInputConnection[0] === output, ignoreDuplicates);
  }
};
const isNativeAudioNodeFaker = (nativeAudioNodeOrNativeAudioNodeFaker) => {
  return "inputs" in nativeAudioNodeOrNativeAudioNodeFaker;
};
const connectNativeAudioNodeToNativeAudioNode = (nativeSourceAudioNode, nativeDestinationAudioNode, output, input) => {
  if (isNativeAudioNodeFaker(nativeDestinationAudioNode)) {
    const fakeNativeDestinationAudioNode = nativeDestinationAudioNode.inputs[input];
    nativeSourceAudioNode.connect(fakeNativeDestinationAudioNode, output, 0);
    return [fakeNativeDestinationAudioNode, output, 0];
  }
  nativeSourceAudioNode.connect(nativeDestinationAudioNode, output, input);
  return [nativeDestinationAudioNode, output, input];
};
const deleteActiveInputConnection = (activeInputConnections, source, output) => {
  for (const activeInputConnection of activeInputConnections) {
    if (activeInputConnection[0] === source && activeInputConnection[1] === output) {
      activeInputConnections.delete(activeInputConnection);
      return activeInputConnection;
    }
  }
  return null;
};
const deleteActiveInputConnectionToAudioParam = (activeInputs, source, output) => {
  return pickElementFromSet(activeInputs, (activeInputConnection) => activeInputConnection[0] === source && activeInputConnection[1] === output);
};
const deleteEventListenerOfAudioNode = (audioNode, eventListener) => {
  const eventListeners = getEventListenersOfAudioNode(audioNode);
  if (!eventListeners.delete(eventListener)) {
    throw new Error("Missing the expected event listener.");
  }
};
const deletePassiveInputConnectionToAudioParam = (passiveInputs, source, output) => {
  const passiveInputConnections = getValueForKey(passiveInputs, source);
  const matchingConnection = pickElementFromSet(passiveInputConnections, (passiveInputConnection) => passiveInputConnection[0] === output);
  if (passiveInputConnections.size === 0) {
    passiveInputs.delete(source);
  }
  return matchingConnection;
};
const disconnectNativeAudioNodeFromNativeAudioNode = (nativeSourceAudioNode, nativeDestinationAudioNode, output, input) => {
  if (isNativeAudioNodeFaker(nativeDestinationAudioNode)) {
    nativeSourceAudioNode.disconnect(nativeDestinationAudioNode.inputs[input], output, 0);
  } else {
    nativeSourceAudioNode.disconnect(nativeDestinationAudioNode, output, input);
  }
};
const getNativeAudioNode = (audioNode) => {
  return getValueForKey(AUDIO_NODE_STORE, audioNode);
};
const getNativeAudioParam = (audioParam) => {
  return getValueForKey(AUDIO_PARAM_STORE, audioParam);
};
const isPartOfACycle = (audioNode) => {
  return CYCLE_COUNTERS.has(audioNode);
};
const isPassiveAudioNode = (audioNode) => {
  return !ACTIVE_AUDIO_NODE_STORE.has(audioNode);
};
const testAudioNodeDisconnectMethodSupport = (nativeAudioContext, nativeAudioWorkletNodeConstructor2) => {
  return new Promise((resolve) => {
    if (nativeAudioWorkletNodeConstructor2 !== null) {
      resolve(true);
    } else {
      const analyzer = nativeAudioContext.createScriptProcessor(256, 1, 1);
      const dummy = nativeAudioContext.createGain();
      const ones = nativeAudioContext.createBuffer(1, 2, 44100);
      const channelData = ones.getChannelData(0);
      channelData[0] = 1;
      channelData[1] = 1;
      const source = nativeAudioContext.createBufferSource();
      source.buffer = ones;
      source.loop = true;
      source.connect(analyzer).connect(nativeAudioContext.destination);
      source.connect(dummy);
      source.disconnect(dummy);
      analyzer.onaudioprocess = (event) => {
        const chnnlDt = event.inputBuffer.getChannelData(0);
        if (Array.prototype.some.call(chnnlDt, (sample) => sample === 1)) {
          resolve(true);
        } else {
          resolve(false);
        }
        source.stop();
        analyzer.onaudioprocess = null;
        source.disconnect(analyzer);
        analyzer.disconnect(nativeAudioContext.destination);
      };
      source.start();
    }
  });
};
const visitEachAudioNodeOnce = (cycles, visitor) => {
  const counts = /* @__PURE__ */ new Map();
  for (const cycle of cycles) {
    for (const audioNode of cycle) {
      const count = counts.get(audioNode);
      counts.set(audioNode, count === void 0 ? 1 : count + 1);
    }
  }
  counts.forEach((count, audioNode) => visitor(audioNode, count));
};
const isNativeAudioNode$1 = (nativeAudioNodeOrAudioParam) => {
  return "context" in nativeAudioNodeOrAudioParam;
};
const wrapAudioNodeDisconnectMethod = (nativeAudioNode) => {
  const connections = /* @__PURE__ */ new Map();
  nativeAudioNode.connect = /* @__PURE__ */ ((connect2) => {
    return (destination, output = 0, input = 0) => {
      const returnValue = isNativeAudioNode$1(destination) ? connect2(destination, output, input) : connect2(destination, output);
      const connectionsToDestination = connections.get(destination);
      if (connectionsToDestination === void 0) {
        connections.set(destination, [{ input, output }]);
      } else {
        if (connectionsToDestination.every((connection) => connection.input !== input || connection.output !== output)) {
          connectionsToDestination.push({ input, output });
        }
      }
      return returnValue;
    };
  })(nativeAudioNode.connect.bind(nativeAudioNode));
  nativeAudioNode.disconnect = /* @__PURE__ */ ((disconnect2) => {
    return (destinationOrOutput, output, input) => {
      disconnect2.apply(nativeAudioNode);
      if (destinationOrOutput === void 0) {
        connections.clear();
      } else if (typeof destinationOrOutput === "number") {
        for (const [destination, connectionsToDestination] of connections) {
          const filteredConnections = connectionsToDestination.filter((connection) => connection.output !== destinationOrOutput);
          if (filteredConnections.length === 0) {
            connections.delete(destination);
          } else {
            connections.set(destination, filteredConnections);
          }
        }
      } else if (connections.has(destinationOrOutput)) {
        if (output === void 0) {
          connections.delete(destinationOrOutput);
        } else {
          const connectionsToDestination = connections.get(destinationOrOutput);
          if (connectionsToDestination !== void 0) {
            const filteredConnections = connectionsToDestination.filter((connection) => connection.output !== output && (connection.input !== input || input === void 0));
            if (filteredConnections.length === 0) {
              connections.delete(destinationOrOutput);
            } else {
              connections.set(destinationOrOutput, filteredConnections);
            }
          }
        }
      }
      for (const [destination, connectionsToDestination] of connections) {
        connectionsToDestination.forEach((connection) => {
          if (isNativeAudioNode$1(destination)) {
            nativeAudioNode.connect(destination, connection.output, connection.input);
          } else {
            nativeAudioNode.connect(destination, connection.output);
          }
        });
      }
    };
  })(nativeAudioNode.disconnect);
};
const addConnectionToAudioParamOfAudioContext = (source, destination, output, isOffline) => {
  const { activeInputs, passiveInputs } = getAudioParamConnections(destination);
  const { outputs } = getAudioNodeConnections(source);
  const eventListeners = getEventListenersOfAudioNode(source);
  const eventListener = (isActive) => {
    const nativeAudioNode = getNativeAudioNode(source);
    const nativeAudioParam = getNativeAudioParam(destination);
    if (isActive) {
      const partialConnection = deletePassiveInputConnectionToAudioParam(passiveInputs, source, output);
      addActiveInputConnectionToAudioParam(activeInputs, source, partialConnection, false);
      if (!isOffline && !isPartOfACycle(source)) {
        nativeAudioNode.connect(nativeAudioParam, output);
      }
    } else {
      const partialConnection = deleteActiveInputConnectionToAudioParam(activeInputs, source, output);
      addPassiveInputConnectionToAudioParam(passiveInputs, partialConnection, false);
      if (!isOffline && !isPartOfACycle(source)) {
        nativeAudioNode.disconnect(nativeAudioParam, output);
      }
    }
  };
  if (insertElementInSet(outputs, [destination, output], (outputConnection) => outputConnection[0] === destination && outputConnection[1] === output, true)) {
    eventListeners.add(eventListener);
    if (isActiveAudioNode(source)) {
      addActiveInputConnectionToAudioParam(activeInputs, source, [output, eventListener], true);
    } else {
      addPassiveInputConnectionToAudioParam(passiveInputs, [source, output, eventListener], true);
    }
    return true;
  }
  return false;
};
const deleteInputConnectionOfAudioNode = (source, destination, output, input) => {
  const { activeInputs, passiveInputs } = getAudioNodeConnections(destination);
  const activeInputConnection = deleteActiveInputConnection(activeInputs[input], source, output);
  if (activeInputConnection === null) {
    const passiveInputConnection = deletePassiveInputConnectionToAudioNode(passiveInputs, source, output, input);
    return [passiveInputConnection[2], false];
  }
  return [activeInputConnection[2], true];
};
const deleteInputConnectionOfAudioParam = (source, destination, output) => {
  const { activeInputs, passiveInputs } = getAudioParamConnections(destination);
  const activeInputConnection = deleteActiveInputConnection(activeInputs, source, output);
  if (activeInputConnection === null) {
    const passiveInputConnection = deletePassiveInputConnectionToAudioParam(passiveInputs, source, output);
    return [passiveInputConnection[1], false];
  }
  return [activeInputConnection[2], true];
};
const deleteInputsOfAudioNode = (source, isOffline, destination, output, input) => {
  const [listener, isActive] = deleteInputConnectionOfAudioNode(source, destination, output, input);
  if (listener !== null) {
    deleteEventListenerOfAudioNode(source, listener);
    if (isActive && !isOffline && !isPartOfACycle(source)) {
      disconnectNativeAudioNodeFromNativeAudioNode(getNativeAudioNode(source), getNativeAudioNode(destination), output, input);
    }
  }
  if (isActiveAudioNode(destination)) {
    const { activeInputs } = getAudioNodeConnections(destination);
    setInternalStateToPassiveWhenNecessary(destination, activeInputs);
  }
};
const deleteInputsOfAudioParam = (source, isOffline, destination, output) => {
  const [listener, isActive] = deleteInputConnectionOfAudioParam(source, destination, output);
  if (listener !== null) {
    deleteEventListenerOfAudioNode(source, listener);
    if (isActive && !isOffline && !isPartOfACycle(source)) {
      getNativeAudioNode(source).disconnect(getNativeAudioParam(destination), output);
    }
  }
};
const deleteAnyConnection = (source, isOffline) => {
  const audioNodeConnectionsOfSource = getAudioNodeConnections(source);
  const destinations = [];
  for (const outputConnection of audioNodeConnectionsOfSource.outputs) {
    if (isAudioNodeOutputConnection(outputConnection)) {
      deleteInputsOfAudioNode(source, isOffline, ...outputConnection);
    } else {
      deleteInputsOfAudioParam(source, isOffline, ...outputConnection);
    }
    destinations.push(outputConnection[0]);
  }
  audioNodeConnectionsOfSource.outputs.clear();
  return destinations;
};
const deleteConnectionAtOutput = (source, isOffline, output) => {
  const audioNodeConnectionsOfSource = getAudioNodeConnections(source);
  const destinations = [];
  for (const outputConnection of audioNodeConnectionsOfSource.outputs) {
    if (outputConnection[1] === output) {
      if (isAudioNodeOutputConnection(outputConnection)) {
        deleteInputsOfAudioNode(source, isOffline, ...outputConnection);
      } else {
        deleteInputsOfAudioParam(source, isOffline, ...outputConnection);
      }
      destinations.push(outputConnection[0]);
      audioNodeConnectionsOfSource.outputs.delete(outputConnection);
    }
  }
  return destinations;
};
const deleteConnectionToDestination = (source, isOffline, destination, output, input) => {
  const audioNodeConnectionsOfSource = getAudioNodeConnections(source);
  return Array.from(audioNodeConnectionsOfSource.outputs).filter((outputConnection) => outputConnection[0] === destination && (output === void 0 || outputConnection[1] === output) && (input === void 0 || outputConnection[2] === input)).map((outputConnection) => {
    if (isAudioNodeOutputConnection(outputConnection)) {
      deleteInputsOfAudioNode(source, isOffline, ...outputConnection);
    } else {
      deleteInputsOfAudioParam(source, isOffline, ...outputConnection);
    }
    audioNodeConnectionsOfSource.outputs.delete(outputConnection);
    return outputConnection[0];
  });
};
const createAudioNodeConstructor = (addAudioNodeConnections, addConnectionToAudioNode, cacheTestResult2, createIncrementCycleCounter, createIndexSizeError2, createInvalidAccessError2, createNotSupportedError2, decrementCycleCounter, detectCycles, eventTargetConstructor2, getNativeContext2, isNativeAudioContext2, isNativeAudioNode2, isNativeAudioParam2, isNativeOfflineAudioContext2, nativeAudioWorkletNodeConstructor2) => {
  return class AudioNode extends eventTargetConstructor2 {
    constructor(context2, isActive, nativeAudioNode, audioNodeRenderer) {
      super(nativeAudioNode);
      this._context = context2;
      this._nativeAudioNode = nativeAudioNode;
      const nativeContext = getNativeContext2(context2);
      if (isNativeAudioContext2(nativeContext) && true !== cacheTestResult2(testAudioNodeDisconnectMethodSupport, () => {
        return testAudioNodeDisconnectMethodSupport(nativeContext, nativeAudioWorkletNodeConstructor2);
      })) {
        wrapAudioNodeDisconnectMethod(nativeAudioNode);
      }
      AUDIO_NODE_STORE.set(this, nativeAudioNode);
      EVENT_LISTENERS.set(this, /* @__PURE__ */ new Set());
      if (context2.state !== "closed" && isActive) {
        setInternalStateToActive(this);
      }
      addAudioNodeConnections(this, audioNodeRenderer, nativeAudioNode);
    }
    get channelCount() {
      return this._nativeAudioNode.channelCount;
    }
    set channelCount(value) {
      this._nativeAudioNode.channelCount = value;
    }
    get channelCountMode() {
      return this._nativeAudioNode.channelCountMode;
    }
    set channelCountMode(value) {
      this._nativeAudioNode.channelCountMode = value;
    }
    get channelInterpretation() {
      return this._nativeAudioNode.channelInterpretation;
    }
    set channelInterpretation(value) {
      this._nativeAudioNode.channelInterpretation = value;
    }
    get context() {
      return this._context;
    }
    get numberOfInputs() {
      return this._nativeAudioNode.numberOfInputs;
    }
    get numberOfOutputs() {
      return this._nativeAudioNode.numberOfOutputs;
    }
    connect(destination, output = 0, input = 0) {
      if (output < 0 || output >= this._nativeAudioNode.numberOfOutputs) {
        throw createIndexSizeError2();
      }
      const nativeContext = getNativeContext2(this._context);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      if (isNativeAudioNode2(destination) || isNativeAudioParam2(destination)) {
        throw createInvalidAccessError2();
      }
      if (isAudioNode$1(destination)) {
        const nativeDestinationAudioNode = getNativeAudioNode(destination);
        try {
          const connection = connectNativeAudioNodeToNativeAudioNode(this._nativeAudioNode, nativeDestinationAudioNode, output, input);
          const isPassive = isPassiveAudioNode(this);
          if (isOffline || isPassive) {
            this._nativeAudioNode.disconnect(...connection);
          }
          if (this.context.state !== "closed" && !isPassive && isPassiveAudioNode(destination)) {
            setInternalStateToActive(destination);
          }
        } catch (err) {
          if (err.code === 12) {
            throw createInvalidAccessError2();
          }
          throw err;
        }
        const isNewConnectionToAudioNode = addConnectionToAudioNode(this, destination, output, input, isOffline);
        if (isNewConnectionToAudioNode) {
          const cycles = detectCycles([this], destination);
          visitEachAudioNodeOnce(cycles, createIncrementCycleCounter(isOffline));
        }
        return destination;
      }
      const nativeAudioParam = getNativeAudioParam(destination);
      if (nativeAudioParam.name === "playbackRate" && nativeAudioParam.maxValue === 1024) {
        throw createNotSupportedError2();
      }
      try {
        this._nativeAudioNode.connect(nativeAudioParam, output);
        if (isOffline || isPassiveAudioNode(this)) {
          this._nativeAudioNode.disconnect(nativeAudioParam, output);
        }
      } catch (err) {
        if (err.code === 12) {
          throw createInvalidAccessError2();
        }
        throw err;
      }
      const isNewConnectionToAudioParam = addConnectionToAudioParamOfAudioContext(this, destination, output, isOffline);
      if (isNewConnectionToAudioParam) {
        const cycles = detectCycles([this], destination);
        visitEachAudioNodeOnce(cycles, createIncrementCycleCounter(isOffline));
      }
    }
    disconnect(destinationOrOutput, output, input) {
      let destinations;
      const nativeContext = getNativeContext2(this._context);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      if (destinationOrOutput === void 0) {
        destinations = deleteAnyConnection(this, isOffline);
      } else if (typeof destinationOrOutput === "number") {
        if (destinationOrOutput < 0 || destinationOrOutput >= this.numberOfOutputs) {
          throw createIndexSizeError2();
        }
        destinations = deleteConnectionAtOutput(this, isOffline, destinationOrOutput);
      } else {
        if (output !== void 0 && (output < 0 || output >= this.numberOfOutputs)) {
          throw createIndexSizeError2();
        }
        if (isAudioNode$1(destinationOrOutput) && input !== void 0 && (input < 0 || input >= destinationOrOutput.numberOfInputs)) {
          throw createIndexSizeError2();
        }
        destinations = deleteConnectionToDestination(this, isOffline, destinationOrOutput, output, input);
        if (destinations.length === 0) {
          throw createInvalidAccessError2();
        }
      }
      for (const destination of destinations) {
        const cycles = detectCycles([this], destination);
        visitEachAudioNodeOnce(cycles, decrementCycleCounter);
      }
    }
  };
};
const createAudioParamFactory = (addAudioParamConnections, audioParamAudioNodeStore2, audioParamStore, createAudioParamRenderer2, createCancelAndHoldAutomationEvent2, createCancelScheduledValuesAutomationEvent2, createExponentialRampToValueAutomationEvent2, createLinearRampToValueAutomationEvent2, createSetTargetAutomationEvent2, createSetValueAutomationEvent2, createSetValueCurveAutomationEvent2, nativeAudioContextConstructor2, setValueAtTimeUntilPossible2) => {
  return (audioNode, isAudioParamOfOfflineAudioContext, nativeAudioParam, maxValue = null, minValue = null) => {
    const defaultValue = nativeAudioParam.value;
    const automationEventList = new AutomationEventList(defaultValue);
    const audioParamRenderer = isAudioParamOfOfflineAudioContext ? createAudioParamRenderer2(automationEventList) : null;
    const audioParam = {
      get defaultValue() {
        return defaultValue;
      },
      get maxValue() {
        return maxValue === null ? nativeAudioParam.maxValue : maxValue;
      },
      get minValue() {
        return minValue === null ? nativeAudioParam.minValue : minValue;
      },
      get value() {
        return nativeAudioParam.value;
      },
      set value(value) {
        nativeAudioParam.value = value;
        audioParam.setValueAtTime(value, audioNode.context.currentTime);
      },
      cancelAndHoldAtTime(cancelTime) {
        if (typeof nativeAudioParam.cancelAndHoldAtTime === "function") {
          if (audioParamRenderer === null) {
            automationEventList.flush(audioNode.context.currentTime);
          }
          automationEventList.add(createCancelAndHoldAutomationEvent2(cancelTime));
          nativeAudioParam.cancelAndHoldAtTime(cancelTime);
        } else {
          const previousLastEvent = Array.from(automationEventList).pop();
          if (audioParamRenderer === null) {
            automationEventList.flush(audioNode.context.currentTime);
          }
          automationEventList.add(createCancelAndHoldAutomationEvent2(cancelTime));
          const currentLastEvent = Array.from(automationEventList).pop();
          nativeAudioParam.cancelScheduledValues(cancelTime);
          if (previousLastEvent !== currentLastEvent && currentLastEvent !== void 0) {
            if (currentLastEvent.type === "exponentialRampToValue") {
              nativeAudioParam.exponentialRampToValueAtTime(currentLastEvent.value, currentLastEvent.endTime);
            } else if (currentLastEvent.type === "linearRampToValue") {
              nativeAudioParam.linearRampToValueAtTime(currentLastEvent.value, currentLastEvent.endTime);
            } else if (currentLastEvent.type === "setValue") {
              nativeAudioParam.setValueAtTime(currentLastEvent.value, currentLastEvent.startTime);
            } else if (currentLastEvent.type === "setValueCurve") {
              nativeAudioParam.setValueCurveAtTime(currentLastEvent.values, currentLastEvent.startTime, currentLastEvent.duration);
            }
          }
        }
        return audioParam;
      },
      cancelScheduledValues(cancelTime) {
        if (audioParamRenderer === null) {
          automationEventList.flush(audioNode.context.currentTime);
        }
        automationEventList.add(createCancelScheduledValuesAutomationEvent2(cancelTime));
        nativeAudioParam.cancelScheduledValues(cancelTime);
        return audioParam;
      },
      exponentialRampToValueAtTime(value, endTime) {
        if (value === 0) {
          throw new RangeError();
        }
        if (!Number.isFinite(endTime) || endTime < 0) {
          throw new RangeError();
        }
        const currentTime = audioNode.context.currentTime;
        if (audioParamRenderer === null) {
          automationEventList.flush(currentTime);
        }
        if (Array.from(automationEventList).length === 0) {
          automationEventList.add(createSetValueAutomationEvent2(defaultValue, currentTime));
          nativeAudioParam.setValueAtTime(defaultValue, currentTime);
        }
        automationEventList.add(createExponentialRampToValueAutomationEvent2(value, endTime));
        nativeAudioParam.exponentialRampToValueAtTime(value, endTime);
        return audioParam;
      },
      linearRampToValueAtTime(value, endTime) {
        const currentTime = audioNode.context.currentTime;
        if (audioParamRenderer === null) {
          automationEventList.flush(currentTime);
        }
        if (Array.from(automationEventList).length === 0) {
          automationEventList.add(createSetValueAutomationEvent2(defaultValue, currentTime));
          nativeAudioParam.setValueAtTime(defaultValue, currentTime);
        }
        automationEventList.add(createLinearRampToValueAutomationEvent2(value, endTime));
        nativeAudioParam.linearRampToValueAtTime(value, endTime);
        return audioParam;
      },
      setTargetAtTime(target, startTime, timeConstant) {
        if (audioParamRenderer === null) {
          automationEventList.flush(audioNode.context.currentTime);
        }
        automationEventList.add(createSetTargetAutomationEvent2(target, startTime, timeConstant));
        nativeAudioParam.setTargetAtTime(target, startTime, timeConstant);
        return audioParam;
      },
      setValueAtTime(value, startTime) {
        if (audioParamRenderer === null) {
          automationEventList.flush(audioNode.context.currentTime);
        }
        automationEventList.add(createSetValueAutomationEvent2(value, startTime));
        nativeAudioParam.setValueAtTime(value, startTime);
        return audioParam;
      },
      setValueCurveAtTime(values, startTime, duration) {
        const convertedValues = values instanceof Float32Array ? values : new Float32Array(values);
        if (nativeAudioContextConstructor2 !== null && nativeAudioContextConstructor2.name === "webkitAudioContext") {
          const endTime = startTime + duration;
          const sampleRate = audioNode.context.sampleRate;
          const firstSample = Math.ceil(startTime * sampleRate);
          const lastSample = Math.floor(endTime * sampleRate);
          const numberOfInterpolatedValues = lastSample - firstSample;
          const interpolatedValues = new Float32Array(numberOfInterpolatedValues);
          for (let i = 0; i < numberOfInterpolatedValues; i += 1) {
            const theoreticIndex = (convertedValues.length - 1) / duration * ((firstSample + i) / sampleRate - startTime);
            const lowerIndex = Math.floor(theoreticIndex);
            const upperIndex = Math.ceil(theoreticIndex);
            interpolatedValues[i] = lowerIndex === upperIndex ? convertedValues[lowerIndex] : (1 - (theoreticIndex - lowerIndex)) * convertedValues[lowerIndex] + (1 - (upperIndex - theoreticIndex)) * convertedValues[upperIndex];
          }
          if (audioParamRenderer === null) {
            automationEventList.flush(audioNode.context.currentTime);
          }
          automationEventList.add(createSetValueCurveAutomationEvent2(interpolatedValues, startTime, duration));
          nativeAudioParam.setValueCurveAtTime(interpolatedValues, startTime, duration);
          const timeOfLastSample = lastSample / sampleRate;
          if (timeOfLastSample < endTime) {
            setValueAtTimeUntilPossible2(audioParam, interpolatedValues[interpolatedValues.length - 1], timeOfLastSample);
          }
          setValueAtTimeUntilPossible2(audioParam, convertedValues[convertedValues.length - 1], endTime);
        } else {
          if (audioParamRenderer === null) {
            automationEventList.flush(audioNode.context.currentTime);
          }
          automationEventList.add(createSetValueCurveAutomationEvent2(convertedValues, startTime, duration));
          nativeAudioParam.setValueCurveAtTime(convertedValues, startTime, duration);
        }
        return audioParam;
      }
    };
    audioParamStore.set(audioParam, nativeAudioParam);
    audioParamAudioNodeStore2.set(audioParam, audioNode);
    addAudioParamConnections(audioParam, audioParamRenderer);
    return audioParam;
  };
};
const createAudioParamRenderer = (automationEventList) => {
  return {
    replay(audioParam) {
      for (const automationEvent of automationEventList) {
        if (automationEvent.type === "exponentialRampToValue") {
          const { endTime, value } = automationEvent;
          audioParam.exponentialRampToValueAtTime(value, endTime);
        } else if (automationEvent.type === "linearRampToValue") {
          const { endTime, value } = automationEvent;
          audioParam.linearRampToValueAtTime(value, endTime);
        } else if (automationEvent.type === "setTarget") {
          const { startTime, target, timeConstant } = automationEvent;
          audioParam.setTargetAtTime(target, startTime, timeConstant);
        } else if (automationEvent.type === "setValue") {
          const { startTime, value } = automationEvent;
          audioParam.setValueAtTime(value, startTime);
        } else if (automationEvent.type === "setValueCurve") {
          const { duration, startTime, values } = automationEvent;
          audioParam.setValueCurveAtTime(values, startTime, duration);
        } else {
          throw new Error("Can't apply an unknown automation.");
        }
      }
    }
  };
};
class ReadOnlyMap {
  constructor(parameters) {
    this._map = new Map(parameters);
  }
  get size() {
    return this._map.size;
  }
  entries() {
    return this._map.entries();
  }
  forEach(callback, thisArg = null) {
    return this._map.forEach((value, key) => callback.call(thisArg, value, key, this));
  }
  get(name) {
    return this._map.get(name);
  }
  has(name) {
    return this._map.has(name);
  }
  keys() {
    return this._map.keys();
  }
  values() {
    return this._map.values();
  }
}
const DEFAULT_OPTIONS$g = {
  channelCount: 2,
  channelCountMode: "explicit",
  channelInterpretation: "speakers",
  numberOfInputs: 1,
  numberOfOutputs: 1,
  parameterData: {},
  processorOptions: {}
};
const createAudioWorkletNodeConstructor = (addUnrenderedAudioWorkletNode2, audioNodeConstructor2, createAudioParam2, createAudioWorkletNodeRenderer2, createNativeAudioWorkletNode2, getAudioNodeConnections2, getBackupOfflineAudioContext2, getNativeContext2, isNativeOfflineAudioContext2, nativeAudioWorkletNodeConstructor2, sanitizeAudioWorkletNodeOptions2, setActiveAudioWorkletNodeInputs2, testAudioWorkletNodeOptionsClonability2, wrapEventListener2) => {
  return class AudioWorkletNode extends audioNodeConstructor2 {
    constructor(context2, name, options) {
      var _a;
      const nativeContext = getNativeContext2(context2);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const mergedOptions = sanitizeAudioWorkletNodeOptions2(__spreadValues(__spreadValues({}, DEFAULT_OPTIONS$g), options));
      testAudioWorkletNodeOptionsClonability2(mergedOptions);
      const nodeNameToProcessorConstructorMap = NODE_NAME_TO_PROCESSOR_CONSTRUCTOR_MAPS.get(nativeContext);
      const processorConstructor = nodeNameToProcessorConstructorMap === null || nodeNameToProcessorConstructorMap === void 0 ? void 0 : nodeNameToProcessorConstructorMap.get(name);
      const nativeContextOrBackupOfflineAudioContext = isOffline || nativeContext.state !== "closed" ? nativeContext : (_a = getBackupOfflineAudioContext2(nativeContext)) !== null && _a !== void 0 ? _a : nativeContext;
      const nativeAudioWorkletNode = createNativeAudioWorkletNode2(nativeContextOrBackupOfflineAudioContext, isOffline ? null : context2.baseLatency, nativeAudioWorkletNodeConstructor2, name, processorConstructor, mergedOptions);
      const audioWorkletNodeRenderer = isOffline ? createAudioWorkletNodeRenderer2(name, mergedOptions, processorConstructor) : null;
      super(context2, true, nativeAudioWorkletNode, audioWorkletNodeRenderer);
      const parameters = [];
      nativeAudioWorkletNode.parameters.forEach((nativeAudioParam, nm) => {
        const audioParam = createAudioParam2(this, isOffline, nativeAudioParam);
        parameters.push([nm, audioParam]);
      });
      this._nativeAudioWorkletNode = nativeAudioWorkletNode;
      this._onprocessorerror = null;
      this._parameters = new ReadOnlyMap(parameters);
      if (isOffline) {
        addUnrenderedAudioWorkletNode2(nativeContext, this);
      }
      const { activeInputs } = getAudioNodeConnections2(this);
      setActiveAudioWorkletNodeInputs2(nativeAudioWorkletNode, activeInputs);
    }
    get onprocessorerror() {
      return this._onprocessorerror;
    }
    set onprocessorerror(value) {
      const wrappedListener = typeof value === "function" ? wrapEventListener2(this, value) : null;
      this._nativeAudioWorkletNode.onprocessorerror = wrappedListener;
      const nativeOnProcessorError = this._nativeAudioWorkletNode.onprocessorerror;
      this._onprocessorerror = nativeOnProcessorError !== null && nativeOnProcessorError === wrappedListener ? value : nativeOnProcessorError;
    }
    get parameters() {
      if (this._parameters === null) {
        return this._nativeAudioWorkletNode.parameters;
      }
      return this._parameters;
    }
    get port() {
      return this._nativeAudioWorkletNode.port;
    }
  };
};
function copyFromChannel(audioBuffer, parent, key, channelNumber, bufferOffset) {
  if (typeof audioBuffer.copyFromChannel === "function") {
    if (parent[key].byteLength === 0) {
      parent[key] = new Float32Array(128);
    }
    audioBuffer.copyFromChannel(parent[key], channelNumber, bufferOffset);
  } else {
    const channelData = audioBuffer.getChannelData(channelNumber);
    if (parent[key].byteLength === 0) {
      parent[key] = channelData.slice(bufferOffset, bufferOffset + 128);
    } else {
      const slicedInput = new Float32Array(channelData.buffer, bufferOffset * Float32Array.BYTES_PER_ELEMENT, 128);
      parent[key].set(slicedInput);
    }
  }
}
const copyToChannel = (audioBuffer, parent, key, channelNumber, bufferOffset) => {
  if (typeof audioBuffer.copyToChannel === "function") {
    if (parent[key].byteLength !== 0) {
      audioBuffer.copyToChannel(parent[key], channelNumber, bufferOffset);
    }
  } else {
    if (parent[key].byteLength !== 0) {
      audioBuffer.getChannelData(channelNumber).set(parent[key], bufferOffset);
    }
  }
};
const createNestedArrays = (x, y) => {
  const arrays = [];
  for (let i = 0; i < x; i += 1) {
    const array = [];
    const length = typeof y === "number" ? y : y[i];
    for (let j = 0; j < length; j += 1) {
      array.push(new Float32Array(128));
    }
    arrays.push(array);
  }
  return arrays;
};
const getAudioWorkletProcessor = (nativeOfflineAudioContext, proxy) => {
  const nodeToProcessorMap = getValueForKey(NODE_TO_PROCESSOR_MAPS, nativeOfflineAudioContext);
  const nativeAudioWorkletNode = getNativeAudioNode(proxy);
  return getValueForKey(nodeToProcessorMap, nativeAudioWorkletNode);
};
const processBuffer = (proxy, renderedBuffer, nativeOfflineAudioContext, options, outputChannelCount, processorConstructor, exposeCurrentFrameAndCurrentTime2) => __async(void 0, null, function* () {
  const length = renderedBuffer === null ? Math.ceil(proxy.context.length / 128) * 128 : renderedBuffer.length;
  const numberOfInputChannels = options.channelCount * options.numberOfInputs;
  const numberOfOutputChannels = outputChannelCount.reduce((sum, value) => sum + value, 0);
  const processedBuffer = numberOfOutputChannels === 0 ? null : nativeOfflineAudioContext.createBuffer(numberOfOutputChannels, length, nativeOfflineAudioContext.sampleRate);
  if (processorConstructor === void 0) {
    throw new Error("Missing the processor constructor.");
  }
  const audioNodeConnections = getAudioNodeConnections(proxy);
  const audioWorkletProcessor = yield getAudioWorkletProcessor(nativeOfflineAudioContext, proxy);
  const inputs = createNestedArrays(options.numberOfInputs, options.channelCount);
  const outputs = createNestedArrays(options.numberOfOutputs, outputChannelCount);
  const parameters = Array.from(proxy.parameters.keys()).reduce((prmtrs, name) => __spreadProps(__spreadValues({}, prmtrs), { [name]: new Float32Array(128) }), {});
  for (let i = 0; i < length; i += 128) {
    if (options.numberOfInputs > 0 && renderedBuffer !== null) {
      for (let j = 0; j < options.numberOfInputs; j += 1) {
        for (let k = 0; k < options.channelCount; k += 1) {
          copyFromChannel(renderedBuffer, inputs[j], k, k, i);
        }
      }
    }
    if (processorConstructor.parameterDescriptors !== void 0 && renderedBuffer !== null) {
      processorConstructor.parameterDescriptors.forEach(({ name }, index2) => {
        copyFromChannel(renderedBuffer, parameters, name, numberOfInputChannels + index2, i);
      });
    }
    for (let j = 0; j < options.numberOfInputs; j += 1) {
      for (let k = 0; k < outputChannelCount[j]; k += 1) {
        if (outputs[j][k].byteLength === 0) {
          outputs[j][k] = new Float32Array(128);
        }
      }
    }
    try {
      const potentiallyEmptyInputs = inputs.map((input, index2) => {
        if (audioNodeConnections.activeInputs[index2].size === 0) {
          return [];
        }
        return input;
      });
      const activeSourceFlag = exposeCurrentFrameAndCurrentTime2(i / nativeOfflineAudioContext.sampleRate, nativeOfflineAudioContext.sampleRate, () => audioWorkletProcessor.process(potentiallyEmptyInputs, outputs, parameters));
      if (processedBuffer !== null) {
        for (let j = 0, outputChannelSplitterNodeOutput = 0; j < options.numberOfOutputs; j += 1) {
          for (let k = 0; k < outputChannelCount[j]; k += 1) {
            copyToChannel(processedBuffer, outputs[j], k, outputChannelSplitterNodeOutput + k, i);
          }
          outputChannelSplitterNodeOutput += outputChannelCount[j];
        }
      }
      if (!activeSourceFlag) {
        break;
      }
    } catch (error) {
      proxy.dispatchEvent(new ErrorEvent("processorerror", {
        colno: error.colno,
        filename: error.filename,
        lineno: error.lineno,
        message: error.message
      }));
      break;
    }
  }
  return processedBuffer;
});
const createAudioWorkletNodeRendererFactory = (connectAudioParam2, connectMultipleOutputs2, createNativeAudioBufferSourceNode2, createNativeChannelMergerNode2, createNativeChannelSplitterNode2, createNativeConstantSourceNode2, createNativeGainNode2, deleteUnrenderedAudioWorkletNode2, disconnectMultipleOutputs2, exposeCurrentFrameAndCurrentTime2, getNativeAudioNode2, nativeAudioWorkletNodeConstructor2, nativeOfflineAudioContextConstructor2, renderAutomation2, renderInputsOfAudioNode2, renderNativeOfflineAudioContext2) => {
  return (name, options, processorConstructor) => {
    const renderedNativeAudioNodes = /* @__PURE__ */ new WeakMap();
    let processedBufferPromise = null;
    const createAudioNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeAudioWorkletNode = getNativeAudioNode2(proxy);
      let nativeOutputNodes = null;
      const nativeAudioWorkletNodeIsOwnedByContext = isOwnedByContext(nativeAudioWorkletNode, nativeOfflineAudioContext);
      const outputChannelCount = Array.isArray(options.outputChannelCount) ? options.outputChannelCount : Array.from(options.outputChannelCount);
      if (nativeAudioWorkletNodeConstructor2 === null) {
        const numberOfOutputChannels = outputChannelCount.reduce((sum, value) => sum + value, 0);
        const outputChannelSplitterNode = createNativeChannelSplitterNode2(nativeOfflineAudioContext, {
          channelCount: Math.max(1, numberOfOutputChannels),
          channelCountMode: "explicit",
          channelInterpretation: "discrete",
          numberOfOutputs: Math.max(1, numberOfOutputChannels)
        });
        const outputChannelMergerNodes = [];
        for (let i = 0; i < proxy.numberOfOutputs; i += 1) {
          outputChannelMergerNodes.push(createNativeChannelMergerNode2(nativeOfflineAudioContext, {
            channelCount: 1,
            channelCountMode: "explicit",
            channelInterpretation: "speakers",
            numberOfInputs: outputChannelCount[i]
          }));
        }
        const outputGainNode = createNativeGainNode2(nativeOfflineAudioContext, {
          channelCount: options.channelCount,
          channelCountMode: options.channelCountMode,
          channelInterpretation: options.channelInterpretation,
          gain: 1
        });
        outputGainNode.connect = connectMultipleOutputs2.bind(null, outputChannelMergerNodes);
        outputGainNode.disconnect = disconnectMultipleOutputs2.bind(null, outputChannelMergerNodes);
        nativeOutputNodes = [outputChannelSplitterNode, outputChannelMergerNodes, outputGainNode];
      } else if (!nativeAudioWorkletNodeIsOwnedByContext) {
        nativeAudioWorkletNode = new nativeAudioWorkletNodeConstructor2(nativeOfflineAudioContext, name);
      }
      renderedNativeAudioNodes.set(nativeOfflineAudioContext, nativeOutputNodes === null ? nativeAudioWorkletNode : nativeOutputNodes[2]);
      if (nativeOutputNodes !== null) {
        if (processedBufferPromise === null) {
          if (processorConstructor === void 0) {
            throw new Error("Missing the processor constructor.");
          }
          if (nativeOfflineAudioContextConstructor2 === null) {
            throw new Error("Missing the native OfflineAudioContext constructor.");
          }
          const numberOfInputChannels = proxy.channelCount * proxy.numberOfInputs;
          const numberOfParameters = processorConstructor.parameterDescriptors === void 0 ? 0 : processorConstructor.parameterDescriptors.length;
          const numberOfChannels = numberOfInputChannels + numberOfParameters;
          const renderBuffer = () => __async(void 0, null, function* () {
            const partialOfflineAudioContext = new nativeOfflineAudioContextConstructor2(
              numberOfChannels,
              Math.ceil(proxy.context.length / 128) * 128,
              nativeOfflineAudioContext.sampleRate
            );
            const gainNodes = [];
            const inputChannelSplitterNodes = [];
            for (let i = 0; i < options.numberOfInputs; i += 1) {
              gainNodes.push(createNativeGainNode2(partialOfflineAudioContext, {
                channelCount: options.channelCount,
                channelCountMode: options.channelCountMode,
                channelInterpretation: options.channelInterpretation,
                gain: 1
              }));
              inputChannelSplitterNodes.push(createNativeChannelSplitterNode2(partialOfflineAudioContext, {
                channelCount: options.channelCount,
                channelCountMode: "explicit",
                channelInterpretation: "discrete",
                numberOfOutputs: options.channelCount
              }));
            }
            const constantSourceNodes = yield Promise.all(Array.from(proxy.parameters.values()).map((audioParam) => __async(void 0, null, function* () {
              const constantSourceNode = createNativeConstantSourceNode2(partialOfflineAudioContext, {
                channelCount: 1,
                channelCountMode: "explicit",
                channelInterpretation: "discrete",
                offset: audioParam.value
              });
              yield renderAutomation2(partialOfflineAudioContext, audioParam, constantSourceNode.offset);
              return constantSourceNode;
            })));
            const inputChannelMergerNode = createNativeChannelMergerNode2(partialOfflineAudioContext, {
              channelCount: 1,
              channelCountMode: "explicit",
              channelInterpretation: "speakers",
              numberOfInputs: Math.max(1, numberOfInputChannels + numberOfParameters)
            });
            for (let i = 0; i < options.numberOfInputs; i += 1) {
              gainNodes[i].connect(inputChannelSplitterNodes[i]);
              for (let j = 0; j < options.channelCount; j += 1) {
                inputChannelSplitterNodes[i].connect(inputChannelMergerNode, j, i * options.channelCount + j);
              }
            }
            for (const [index2, constantSourceNode] of constantSourceNodes.entries()) {
              constantSourceNode.connect(inputChannelMergerNode, 0, numberOfInputChannels + index2);
              constantSourceNode.start(0);
            }
            inputChannelMergerNode.connect(partialOfflineAudioContext.destination);
            yield Promise.all(gainNodes.map((gainNode) => renderInputsOfAudioNode2(proxy, partialOfflineAudioContext, gainNode)));
            return renderNativeOfflineAudioContext2(partialOfflineAudioContext);
          });
          processedBufferPromise = processBuffer(proxy, numberOfChannels === 0 ? null : yield renderBuffer(), nativeOfflineAudioContext, options, outputChannelCount, processorConstructor, exposeCurrentFrameAndCurrentTime2);
        }
        const processedBuffer = yield processedBufferPromise;
        const audioBufferSourceNode = createNativeAudioBufferSourceNode2(nativeOfflineAudioContext, {
          buffer: null,
          channelCount: 2,
          channelCountMode: "max",
          channelInterpretation: "speakers",
          loop: false,
          loopEnd: 0,
          loopStart: 0,
          playbackRate: 1
        });
        const [outputChannelSplitterNode, outputChannelMergerNodes, outputGainNode] = nativeOutputNodes;
        if (processedBuffer !== null) {
          audioBufferSourceNode.buffer = processedBuffer;
          audioBufferSourceNode.start(0);
        }
        audioBufferSourceNode.connect(outputChannelSplitterNode);
        for (let i = 0, outputChannelSplitterNodeOutput = 0; i < proxy.numberOfOutputs; i += 1) {
          const outputChannelMergerNode = outputChannelMergerNodes[i];
          for (let j = 0; j < outputChannelCount[i]; j += 1) {
            outputChannelSplitterNode.connect(outputChannelMergerNode, outputChannelSplitterNodeOutput + j, j);
          }
          outputChannelSplitterNodeOutput += outputChannelCount[i];
        }
        return outputGainNode;
      }
      if (!nativeAudioWorkletNodeIsOwnedByContext) {
        for (const [nm, audioParam] of proxy.parameters.entries()) {
          yield renderAutomation2(
            nativeOfflineAudioContext,
            audioParam,
            nativeAudioWorkletNode.parameters.get(nm)
          );
        }
      } else {
        for (const [nm, audioParam] of proxy.parameters.entries()) {
          yield connectAudioParam2(
            nativeOfflineAudioContext,
            audioParam,
            nativeAudioWorkletNode.parameters.get(nm)
          );
        }
      }
      yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeAudioWorkletNode);
      return nativeAudioWorkletNode;
    });
    return {
      render(proxy, nativeOfflineAudioContext) {
        deleteUnrenderedAudioWorkletNode2(nativeOfflineAudioContext, proxy);
        const renderedNativeAudioWorkletNodeOrGainNode = renderedNativeAudioNodes.get(nativeOfflineAudioContext);
        if (renderedNativeAudioWorkletNodeOrGainNode !== void 0) {
          return Promise.resolve(renderedNativeAudioWorkletNodeOrGainNode);
        }
        return createAudioNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const createBaseAudioContextConstructor = (addAudioWorkletModule2, analyserNodeConstructor2, audioBufferConstructor2, audioBufferSourceNodeConstructor2, biquadFilterNodeConstructor2, channelMergerNodeConstructor2, channelSplitterNodeConstructor2, constantSourceNodeConstructor2, convolverNodeConstructor2, decodeAudioData2, delayNodeConstructor2, dynamicsCompressorNodeConstructor2, gainNodeConstructor2, iIRFilterNodeConstructor2, minimalBaseAudioContextConstructor2, oscillatorNodeConstructor2, pannerNodeConstructor2, periodicWaveConstructor2, stereoPannerNodeConstructor2, waveShaperNodeConstructor2) => {
  return class BaseAudioContext extends minimalBaseAudioContextConstructor2 {
    constructor(_nativeContext, numberOfChannels) {
      super(_nativeContext, numberOfChannels);
      this._nativeContext = _nativeContext;
      this._audioWorklet = addAudioWorkletModule2 === void 0 ? void 0 : {
        addModule: (moduleURL, options) => {
          return addAudioWorkletModule2(this, moduleURL, options);
        }
      };
    }
    get audioWorklet() {
      return this._audioWorklet;
    }
    createAnalyser() {
      return new analyserNodeConstructor2(this);
    }
    createBiquadFilter() {
      return new biquadFilterNodeConstructor2(this);
    }
    createBuffer(numberOfChannels, length, sampleRate) {
      return new audioBufferConstructor2({ length, numberOfChannels, sampleRate });
    }
    createBufferSource() {
      return new audioBufferSourceNodeConstructor2(this);
    }
    createChannelMerger(numberOfInputs = 6) {
      return new channelMergerNodeConstructor2(this, { numberOfInputs });
    }
    createChannelSplitter(numberOfOutputs = 6) {
      return new channelSplitterNodeConstructor2(this, { numberOfOutputs });
    }
    createConstantSource() {
      return new constantSourceNodeConstructor2(this);
    }
    createConvolver() {
      return new convolverNodeConstructor2(this);
    }
    createDelay(maxDelayTime = 1) {
      return new delayNodeConstructor2(this, { maxDelayTime });
    }
    createDynamicsCompressor() {
      return new dynamicsCompressorNodeConstructor2(this);
    }
    createGain() {
      return new gainNodeConstructor2(this);
    }
    createIIRFilter(feedforward, feedback) {
      return new iIRFilterNodeConstructor2(this, { feedback, feedforward });
    }
    createOscillator() {
      return new oscillatorNodeConstructor2(this);
    }
    createPanner() {
      return new pannerNodeConstructor2(this);
    }
    createPeriodicWave(real, imag, constraints = { disableNormalization: false }) {
      return new periodicWaveConstructor2(this, __spreadProps(__spreadValues({}, constraints), { imag, real }));
    }
    createStereoPanner() {
      return new stereoPannerNodeConstructor2(this);
    }
    createWaveShaper() {
      return new waveShaperNodeConstructor2(this);
    }
    decodeAudioData(audioData, successCallback, errorCallback) {
      return decodeAudioData2(this._nativeContext, audioData).then((audioBuffer) => {
        if (typeof successCallback === "function") {
          successCallback(audioBuffer);
        }
        return audioBuffer;
      }, (err) => {
        if (typeof errorCallback === "function") {
          errorCallback(err);
        }
        throw err;
      });
    }
  };
};
const DEFAULT_OPTIONS$f = {
  Q: 1,
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  detune: 0,
  frequency: 350,
  gain: 0,
  type: "lowpass"
};
const createBiquadFilterNodeConstructor = (audioNodeConstructor2, createAudioParam2, createBiquadFilterNodeRenderer2, createInvalidAccessError2, createNativeBiquadFilterNode2, getNativeContext2, isNativeOfflineAudioContext2, setAudioNodeTailTime2) => {
  return class BiquadFilterNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$f), options);
      const nativeBiquadFilterNode = createNativeBiquadFilterNode2(nativeContext, mergedOptions);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const biquadFilterNodeRenderer = isOffline ? createBiquadFilterNodeRenderer2() : null;
      super(context2, false, nativeBiquadFilterNode, biquadFilterNodeRenderer);
      this._Q = createAudioParam2(this, isOffline, nativeBiquadFilterNode.Q, MOST_POSITIVE_SINGLE_FLOAT, MOST_NEGATIVE_SINGLE_FLOAT);
      this._detune = createAudioParam2(this, isOffline, nativeBiquadFilterNode.detune, 1200 * Math.log2(MOST_POSITIVE_SINGLE_FLOAT), -1200 * Math.log2(MOST_POSITIVE_SINGLE_FLOAT));
      this._frequency = createAudioParam2(this, isOffline, nativeBiquadFilterNode.frequency, context2.sampleRate / 2, 0);
      this._gain = createAudioParam2(this, isOffline, nativeBiquadFilterNode.gain, 40 * Math.log10(MOST_POSITIVE_SINGLE_FLOAT), MOST_NEGATIVE_SINGLE_FLOAT);
      this._nativeBiquadFilterNode = nativeBiquadFilterNode;
      setAudioNodeTailTime2(this, 1);
    }
    get detune() {
      return this._detune;
    }
    get frequency() {
      return this._frequency;
    }
    get gain() {
      return this._gain;
    }
    get Q() {
      return this._Q;
    }
    get type() {
      return this._nativeBiquadFilterNode.type;
    }
    set type(value) {
      this._nativeBiquadFilterNode.type = value;
    }
    getFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
      try {
        this._nativeBiquadFilterNode.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
      } catch (err) {
        if (err.code === 11) {
          throw createInvalidAccessError2();
        }
        throw err;
      }
      if (frequencyHz.length !== magResponse.length || magResponse.length !== phaseResponse.length) {
        throw createInvalidAccessError2();
      }
    }
  };
};
const createBiquadFilterNodeRendererFactory = (connectAudioParam2, createNativeBiquadFilterNode2, getNativeAudioNode2, renderAutomation2, renderInputsOfAudioNode2) => {
  return () => {
    const renderedNativeBiquadFilterNodes = /* @__PURE__ */ new WeakMap();
    const createBiquadFilterNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeBiquadFilterNode = getNativeAudioNode2(proxy);
      const nativeBiquadFilterNodeIsOwnedByContext = isOwnedByContext(nativeBiquadFilterNode, nativeOfflineAudioContext);
      if (!nativeBiquadFilterNodeIsOwnedByContext) {
        const options = {
          Q: nativeBiquadFilterNode.Q.value,
          channelCount: nativeBiquadFilterNode.channelCount,
          channelCountMode: nativeBiquadFilterNode.channelCountMode,
          channelInterpretation: nativeBiquadFilterNode.channelInterpretation,
          detune: nativeBiquadFilterNode.detune.value,
          frequency: nativeBiquadFilterNode.frequency.value,
          gain: nativeBiquadFilterNode.gain.value,
          type: nativeBiquadFilterNode.type
        };
        nativeBiquadFilterNode = createNativeBiquadFilterNode2(nativeOfflineAudioContext, options);
      }
      renderedNativeBiquadFilterNodes.set(nativeOfflineAudioContext, nativeBiquadFilterNode);
      if (!nativeBiquadFilterNodeIsOwnedByContext) {
        yield renderAutomation2(nativeOfflineAudioContext, proxy.Q, nativeBiquadFilterNode.Q);
        yield renderAutomation2(nativeOfflineAudioContext, proxy.detune, nativeBiquadFilterNode.detune);
        yield renderAutomation2(nativeOfflineAudioContext, proxy.frequency, nativeBiquadFilterNode.frequency);
        yield renderAutomation2(nativeOfflineAudioContext, proxy.gain, nativeBiquadFilterNode.gain);
      } else {
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.Q, nativeBiquadFilterNode.Q);
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.detune, nativeBiquadFilterNode.detune);
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.frequency, nativeBiquadFilterNode.frequency);
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.gain, nativeBiquadFilterNode.gain);
      }
      yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeBiquadFilterNode);
      return nativeBiquadFilterNode;
    });
    return {
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeBiquadFilterNode = renderedNativeBiquadFilterNodes.get(nativeOfflineAudioContext);
        if (renderedNativeBiquadFilterNode !== void 0) {
          return Promise.resolve(renderedNativeBiquadFilterNode);
        }
        return createBiquadFilterNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const createCacheTestResult = (ongoingTests, testResults) => {
  return (tester, test) => {
    const cachedTestResult = testResults.get(tester);
    if (cachedTestResult !== void 0) {
      return cachedTestResult;
    }
    const ongoingTest = ongoingTests.get(tester);
    if (ongoingTest !== void 0) {
      return ongoingTest;
    }
    try {
      const synchronousTestResult = test();
      if (synchronousTestResult instanceof Promise) {
        ongoingTests.set(tester, synchronousTestResult);
        return synchronousTestResult.catch(() => false).then((finalTestResult) => {
          ongoingTests.delete(tester);
          testResults.set(tester, finalTestResult);
          return finalTestResult;
        });
      }
      testResults.set(tester, synchronousTestResult);
      return synchronousTestResult;
    } catch (e) {
      testResults.set(tester, false);
      return false;
    }
  };
};
const DEFAULT_OPTIONS$e = {
  channelCount: 1,
  channelCountMode: "explicit",
  channelInterpretation: "speakers",
  numberOfInputs: 6
};
const createChannelMergerNodeConstructor = (audioNodeConstructor2, createChannelMergerNodeRenderer2, createNativeChannelMergerNode2, getNativeContext2, isNativeOfflineAudioContext2) => {
  return class ChannelMergerNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$e), options);
      const nativeChannelMergerNode = createNativeChannelMergerNode2(nativeContext, mergedOptions);
      const channelMergerNodeRenderer = isNativeOfflineAudioContext2(nativeContext) ? createChannelMergerNodeRenderer2() : null;
      super(context2, false, nativeChannelMergerNode, channelMergerNodeRenderer);
    }
  };
};
const createChannelMergerNodeRendererFactory = (createNativeChannelMergerNode2, getNativeAudioNode2, renderInputsOfAudioNode2) => {
  return () => {
    const renderedNativeAudioNodes = /* @__PURE__ */ new WeakMap();
    const createAudioNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeAudioNode = getNativeAudioNode2(proxy);
      const nativeAudioNodeIsOwnedByContext = isOwnedByContext(nativeAudioNode, nativeOfflineAudioContext);
      if (!nativeAudioNodeIsOwnedByContext) {
        const options = {
          channelCount: nativeAudioNode.channelCount,
          channelCountMode: nativeAudioNode.channelCountMode,
          channelInterpretation: nativeAudioNode.channelInterpretation,
          numberOfInputs: nativeAudioNode.numberOfInputs
        };
        nativeAudioNode = createNativeChannelMergerNode2(nativeOfflineAudioContext, options);
      }
      renderedNativeAudioNodes.set(nativeOfflineAudioContext, nativeAudioNode);
      yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeAudioNode);
      return nativeAudioNode;
    });
    return {
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeAudioNode = renderedNativeAudioNodes.get(nativeOfflineAudioContext);
        if (renderedNativeAudioNode !== void 0) {
          return Promise.resolve(renderedNativeAudioNode);
        }
        return createAudioNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const DEFAULT_OPTIONS$d = {
  channelCount: 6,
  channelCountMode: "explicit",
  channelInterpretation: "discrete",
  numberOfOutputs: 6
};
const createChannelSplitterNodeConstructor = (audioNodeConstructor2, createChannelSplitterNodeRenderer2, createNativeChannelSplitterNode2, getNativeContext2, isNativeOfflineAudioContext2, sanitizeChannelSplitterOptions2) => {
  return class ChannelSplitterNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = sanitizeChannelSplitterOptions2(__spreadValues(__spreadValues({}, DEFAULT_OPTIONS$d), options));
      const nativeChannelSplitterNode = createNativeChannelSplitterNode2(nativeContext, mergedOptions);
      const channelSplitterNodeRenderer = isNativeOfflineAudioContext2(nativeContext) ? createChannelSplitterNodeRenderer2() : null;
      super(context2, false, nativeChannelSplitterNode, channelSplitterNodeRenderer);
    }
  };
};
const createChannelSplitterNodeRendererFactory = (createNativeChannelSplitterNode2, getNativeAudioNode2, renderInputsOfAudioNode2) => {
  return () => {
    const renderedNativeAudioNodes = /* @__PURE__ */ new WeakMap();
    const createAudioNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeAudioNode = getNativeAudioNode2(proxy);
      const nativeAudioNodeIsOwnedByContext = isOwnedByContext(nativeAudioNode, nativeOfflineAudioContext);
      if (!nativeAudioNodeIsOwnedByContext) {
        const options = {
          channelCount: nativeAudioNode.channelCount,
          channelCountMode: nativeAudioNode.channelCountMode,
          channelInterpretation: nativeAudioNode.channelInterpretation,
          numberOfOutputs: nativeAudioNode.numberOfOutputs
        };
        nativeAudioNode = createNativeChannelSplitterNode2(nativeOfflineAudioContext, options);
      }
      renderedNativeAudioNodes.set(nativeOfflineAudioContext, nativeAudioNode);
      yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeAudioNode);
      return nativeAudioNode;
    });
    return {
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeAudioNode = renderedNativeAudioNodes.get(nativeOfflineAudioContext);
        if (renderedNativeAudioNode !== void 0) {
          return Promise.resolve(renderedNativeAudioNode);
        }
        return createAudioNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const createConnectAudioParam = (renderInputsOfAudioParam2) => {
  return (nativeOfflineAudioContext, audioParam, nativeAudioParam) => {
    return renderInputsOfAudioParam2(audioParam, nativeOfflineAudioContext, nativeAudioParam);
  };
};
const createConnectMultipleOutputs = (createIndexSizeError2) => {
  return (outputAudioNodes, destination, output = 0, input = 0) => {
    const outputAudioNode = outputAudioNodes[output];
    if (outputAudioNode === void 0) {
      throw createIndexSizeError2();
    }
    if (isNativeAudioNode$1(destination)) {
      return outputAudioNode.connect(destination, 0, input);
    }
    return outputAudioNode.connect(destination, 0);
  };
};
const createConnectedNativeAudioBufferSourceNodeFactory = (createNativeAudioBufferSourceNode2) => {
  return (nativeContext, nativeAudioNode) => {
    const nativeAudioBufferSourceNode = createNativeAudioBufferSourceNode2(nativeContext, {
      buffer: null,
      channelCount: 2,
      channelCountMode: "max",
      channelInterpretation: "speakers",
      loop: false,
      loopEnd: 0,
      loopStart: 0,
      playbackRate: 1
    });
    const nativeAudioBuffer = nativeContext.createBuffer(1, 2, 44100);
    nativeAudioBufferSourceNode.buffer = nativeAudioBuffer;
    nativeAudioBufferSourceNode.loop = true;
    nativeAudioBufferSourceNode.connect(nativeAudioNode);
    nativeAudioBufferSourceNode.start();
    return () => {
      nativeAudioBufferSourceNode.stop();
      nativeAudioBufferSourceNode.disconnect(nativeAudioNode);
    };
  };
};
const DEFAULT_OPTIONS$c = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  offset: 1
};
const createConstantSourceNodeConstructor = (audioNodeConstructor2, createAudioParam2, createConstantSourceNodeRendererFactory2, createNativeConstantSourceNode2, getNativeContext2, isNativeOfflineAudioContext2, wrapEventListener2) => {
  return class ConstantSourceNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$c), options);
      const nativeConstantSourceNode = createNativeConstantSourceNode2(nativeContext, mergedOptions);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const constantSourceNodeRenderer = isOffline ? createConstantSourceNodeRendererFactory2() : null;
      super(context2, false, nativeConstantSourceNode, constantSourceNodeRenderer);
      this._constantSourceNodeRenderer = constantSourceNodeRenderer;
      this._nativeConstantSourceNode = nativeConstantSourceNode;
      this._offset = createAudioParam2(this, isOffline, nativeConstantSourceNode.offset, MOST_POSITIVE_SINGLE_FLOAT, MOST_NEGATIVE_SINGLE_FLOAT);
      this._onended = null;
    }
    get offset() {
      return this._offset;
    }
    get onended() {
      return this._onended;
    }
    set onended(value) {
      const wrappedListener = typeof value === "function" ? wrapEventListener2(this, value) : null;
      this._nativeConstantSourceNode.onended = wrappedListener;
      const nativeOnEnded = this._nativeConstantSourceNode.onended;
      this._onended = nativeOnEnded !== null && nativeOnEnded === wrappedListener ? value : nativeOnEnded;
    }
    start(when = 0) {
      this._nativeConstantSourceNode.start(when);
      if (this._constantSourceNodeRenderer !== null) {
        this._constantSourceNodeRenderer.start = when;
      }
      if (this.context.state !== "closed") {
        setInternalStateToActive(this);
        const resetInternalStateToPassive = () => {
          this._nativeConstantSourceNode.removeEventListener("ended", resetInternalStateToPassive);
          if (isActiveAudioNode(this)) {
            setInternalStateToPassive(this);
          }
        };
        this._nativeConstantSourceNode.addEventListener("ended", resetInternalStateToPassive);
      }
    }
    stop(when = 0) {
      this._nativeConstantSourceNode.stop(when);
      if (this._constantSourceNodeRenderer !== null) {
        this._constantSourceNodeRenderer.stop = when;
      }
    }
  };
};
const createConstantSourceNodeRendererFactory = (connectAudioParam2, createNativeConstantSourceNode2, getNativeAudioNode2, renderAutomation2, renderInputsOfAudioNode2) => {
  return () => {
    const renderedNativeConstantSourceNodes = /* @__PURE__ */ new WeakMap();
    let start2 = null;
    let stop = null;
    const createConstantSourceNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeConstantSourceNode = getNativeAudioNode2(proxy);
      const nativeConstantSourceNodeIsOwnedByContext = isOwnedByContext(nativeConstantSourceNode, nativeOfflineAudioContext);
      if (!nativeConstantSourceNodeIsOwnedByContext) {
        const options = {
          channelCount: nativeConstantSourceNode.channelCount,
          channelCountMode: nativeConstantSourceNode.channelCountMode,
          channelInterpretation: nativeConstantSourceNode.channelInterpretation,
          offset: nativeConstantSourceNode.offset.value
        };
        nativeConstantSourceNode = createNativeConstantSourceNode2(nativeOfflineAudioContext, options);
        if (start2 !== null) {
          nativeConstantSourceNode.start(start2);
        }
        if (stop !== null) {
          nativeConstantSourceNode.stop(stop);
        }
      }
      renderedNativeConstantSourceNodes.set(nativeOfflineAudioContext, nativeConstantSourceNode);
      if (!nativeConstantSourceNodeIsOwnedByContext) {
        yield renderAutomation2(nativeOfflineAudioContext, proxy.offset, nativeConstantSourceNode.offset);
      } else {
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.offset, nativeConstantSourceNode.offset);
      }
      yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeConstantSourceNode);
      return nativeConstantSourceNode;
    });
    return {
      set start(value) {
        start2 = value;
      },
      set stop(value) {
        stop = value;
      },
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeConstantSourceNode = renderedNativeConstantSourceNodes.get(nativeOfflineAudioContext);
        if (renderedNativeConstantSourceNode !== void 0) {
          return Promise.resolve(renderedNativeConstantSourceNode);
        }
        return createConstantSourceNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const createConvertNumberToUnsignedLong = (unit32Array) => {
  return (value) => {
    unit32Array[0] = value;
    return unit32Array[0];
  };
};
const DEFAULT_OPTIONS$b = {
  buffer: null,
  channelCount: 2,
  channelCountMode: "clamped-max",
  channelInterpretation: "speakers",
  disableNormalization: false
};
const createConvolverNodeConstructor = (audioNodeConstructor2, createConvolverNodeRenderer2, createNativeConvolverNode2, getNativeContext2, isNativeOfflineAudioContext2, setAudioNodeTailTime2) => {
  return class ConvolverNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$b), options);
      const nativeConvolverNode = createNativeConvolverNode2(nativeContext, mergedOptions);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const convolverNodeRenderer = isOffline ? createConvolverNodeRenderer2() : null;
      super(context2, false, nativeConvolverNode, convolverNodeRenderer);
      this._isBufferNullified = false;
      this._nativeConvolverNode = nativeConvolverNode;
      if (mergedOptions.buffer !== null) {
        setAudioNodeTailTime2(this, mergedOptions.buffer.duration);
      }
    }
    get buffer() {
      if (this._isBufferNullified) {
        return null;
      }
      return this._nativeConvolverNode.buffer;
    }
    set buffer(value) {
      this._nativeConvolverNode.buffer = value;
      if (value === null && this._nativeConvolverNode.buffer !== null) {
        const nativeContext = this._nativeConvolverNode.context;
        this._nativeConvolverNode.buffer = nativeContext.createBuffer(1, 1, nativeContext.sampleRate);
        this._isBufferNullified = true;
        setAudioNodeTailTime2(this, 0);
      } else {
        this._isBufferNullified = false;
        setAudioNodeTailTime2(this, this._nativeConvolverNode.buffer === null ? 0 : this._nativeConvolverNode.buffer.duration);
      }
    }
    get normalize() {
      return this._nativeConvolverNode.normalize;
    }
    set normalize(value) {
      this._nativeConvolverNode.normalize = value;
    }
  };
};
const createConvolverNodeRendererFactory = (createNativeConvolverNode2, getNativeAudioNode2, renderInputsOfAudioNode2) => {
  return () => {
    const renderedNativeConvolverNodes = /* @__PURE__ */ new WeakMap();
    const createConvolverNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeConvolverNode = getNativeAudioNode2(proxy);
      const nativeConvolverNodeIsOwnedByContext = isOwnedByContext(nativeConvolverNode, nativeOfflineAudioContext);
      if (!nativeConvolverNodeIsOwnedByContext) {
        const options = {
          buffer: nativeConvolverNode.buffer,
          channelCount: nativeConvolverNode.channelCount,
          channelCountMode: nativeConvolverNode.channelCountMode,
          channelInterpretation: nativeConvolverNode.channelInterpretation,
          disableNormalization: !nativeConvolverNode.normalize
        };
        nativeConvolverNode = createNativeConvolverNode2(nativeOfflineAudioContext, options);
      }
      renderedNativeConvolverNodes.set(nativeOfflineAudioContext, nativeConvolverNode);
      if (isNativeAudioNodeFaker(nativeConvolverNode)) {
        yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeConvolverNode.inputs[0]);
      } else {
        yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeConvolverNode);
      }
      return nativeConvolverNode;
    });
    return {
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeConvolverNode = renderedNativeConvolverNodes.get(nativeOfflineAudioContext);
        if (renderedNativeConvolverNode !== void 0) {
          return Promise.resolve(renderedNativeConvolverNode);
        }
        return createConvolverNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const createCreateNativeOfflineAudioContext = (createNotSupportedError2, nativeOfflineAudioContextConstructor2) => {
  return (numberOfChannels, length, sampleRate) => {
    if (nativeOfflineAudioContextConstructor2 === null) {
      throw new Error("Missing the native OfflineAudioContext constructor.");
    }
    try {
      return new nativeOfflineAudioContextConstructor2(numberOfChannels, length, sampleRate);
    } catch (err) {
      if (err.name === "SyntaxError") {
        throw createNotSupportedError2();
      }
      throw err;
    }
  };
};
const createDataCloneError = () => new DOMException("", "DataCloneError");
const detachArrayBuffer = (arrayBuffer) => {
  const { port1, port2 } = new MessageChannel();
  return new Promise((resolve) => {
    const closeAndResolve = () => {
      port2.onmessage = null;
      port1.close();
      port2.close();
      resolve();
    };
    port2.onmessage = () => closeAndResolve();
    try {
      port1.postMessage(arrayBuffer, [arrayBuffer]);
    } catch (e) {
    } finally {
      closeAndResolve();
    }
  });
};
const createDecodeAudioData = (audioBufferStore2, cacheTestResult2, createDataCloneError2, createEncodingError2, detachedArrayBuffers, getNativeContext2, isNativeContext2, testAudioBufferCopyChannelMethodsOutOfBoundsSupport2, testPromiseSupport2, wrapAudioBufferCopyChannelMethods2, wrapAudioBufferCopyChannelMethodsOutOfBounds2) => {
  return (anyContext, audioData) => {
    const nativeContext = isNativeContext2(anyContext) ? anyContext : getNativeContext2(anyContext);
    if (detachedArrayBuffers.has(audioData)) {
      const err = createDataCloneError2();
      return Promise.reject(err);
    }
    try {
      detachedArrayBuffers.add(audioData);
    } catch (e) {
    }
    if (cacheTestResult2(testPromiseSupport2, () => testPromiseSupport2(nativeContext))) {
      return nativeContext.decodeAudioData(audioData).then((audioBuffer) => {
        detachArrayBuffer(audioData).catch(() => {
        });
        if (!cacheTestResult2(testAudioBufferCopyChannelMethodsOutOfBoundsSupport2, () => testAudioBufferCopyChannelMethodsOutOfBoundsSupport2(audioBuffer))) {
          wrapAudioBufferCopyChannelMethodsOutOfBounds2(audioBuffer);
        }
        audioBufferStore2.add(audioBuffer);
        return audioBuffer;
      });
    }
    return new Promise((resolve, reject) => {
      const complete = () => __async(void 0, null, function* () {
        try {
          yield detachArrayBuffer(audioData);
        } catch (e) {
        }
      });
      const fail = (err) => {
        reject(err);
        complete();
      };
      try {
        nativeContext.decodeAudioData(audioData, (audioBuffer) => {
          if (typeof audioBuffer.copyFromChannel !== "function") {
            wrapAudioBufferCopyChannelMethods2(audioBuffer);
            wrapAudioBufferGetChannelDataMethod(audioBuffer);
          }
          audioBufferStore2.add(audioBuffer);
          complete().then(() => resolve(audioBuffer));
        }, (err) => {
          if (err === null) {
            fail(createEncodingError2());
          } else {
            fail(err);
          }
        });
      } catch (err) {
        fail(err);
      }
    });
  };
};
const createDecrementCycleCounter = (connectNativeAudioNodeToNativeAudioNode2, cycleCounters, getAudioNodeConnections2, getNativeAudioNode2, getNativeAudioParam2, getNativeContext2, isActiveAudioNode2, isNativeOfflineAudioContext2) => {
  return (audioNode, count) => {
    const cycleCounter = cycleCounters.get(audioNode);
    if (cycleCounter === void 0) {
      throw new Error("Missing the expected cycle count.");
    }
    const nativeContext = getNativeContext2(audioNode.context);
    const isOffline = isNativeOfflineAudioContext2(nativeContext);
    if (cycleCounter === count) {
      cycleCounters.delete(audioNode);
      if (!isOffline && isActiveAudioNode2(audioNode)) {
        const nativeSourceAudioNode = getNativeAudioNode2(audioNode);
        const { outputs } = getAudioNodeConnections2(audioNode);
        for (const output of outputs) {
          if (isAudioNodeOutputConnection(output)) {
            const nativeDestinationAudioNode = getNativeAudioNode2(output[0]);
            connectNativeAudioNodeToNativeAudioNode2(nativeSourceAudioNode, nativeDestinationAudioNode, output[1], output[2]);
          } else {
            const nativeDestinationAudioParam = getNativeAudioParam2(output[0]);
            nativeSourceAudioNode.connect(nativeDestinationAudioParam, output[1]);
          }
        }
      }
    } else {
      cycleCounters.set(audioNode, cycleCounter - count);
    }
  };
};
const DEFAULT_OPTIONS$a = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  delayTime: 0,
  maxDelayTime: 1
};
const createDelayNodeConstructor = (audioNodeConstructor2, createAudioParam2, createDelayNodeRenderer2, createNativeDelayNode2, getNativeContext2, isNativeOfflineAudioContext2, setAudioNodeTailTime2) => {
  return class DelayNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$a), options);
      const nativeDelayNode = createNativeDelayNode2(nativeContext, mergedOptions);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const delayNodeRenderer = isOffline ? createDelayNodeRenderer2(mergedOptions.maxDelayTime) : null;
      super(context2, false, nativeDelayNode, delayNodeRenderer);
      this._delayTime = createAudioParam2(this, isOffline, nativeDelayNode.delayTime);
      setAudioNodeTailTime2(this, mergedOptions.maxDelayTime);
    }
    get delayTime() {
      return this._delayTime;
    }
  };
};
const createDelayNodeRendererFactory = (connectAudioParam2, createNativeDelayNode2, getNativeAudioNode2, renderAutomation2, renderInputsOfAudioNode2) => {
  return (maxDelayTime) => {
    const renderedNativeDelayNodes = /* @__PURE__ */ new WeakMap();
    const createDelayNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeDelayNode = getNativeAudioNode2(proxy);
      const nativeDelayNodeIsOwnedByContext = isOwnedByContext(nativeDelayNode, nativeOfflineAudioContext);
      if (!nativeDelayNodeIsOwnedByContext) {
        const options = {
          channelCount: nativeDelayNode.channelCount,
          channelCountMode: nativeDelayNode.channelCountMode,
          channelInterpretation: nativeDelayNode.channelInterpretation,
          delayTime: nativeDelayNode.delayTime.value,
          maxDelayTime
        };
        nativeDelayNode = createNativeDelayNode2(nativeOfflineAudioContext, options);
      }
      renderedNativeDelayNodes.set(nativeOfflineAudioContext, nativeDelayNode);
      if (!nativeDelayNodeIsOwnedByContext) {
        yield renderAutomation2(nativeOfflineAudioContext, proxy.delayTime, nativeDelayNode.delayTime);
      } else {
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.delayTime, nativeDelayNode.delayTime);
      }
      yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeDelayNode);
      return nativeDelayNode;
    });
    return {
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeDelayNode = renderedNativeDelayNodes.get(nativeOfflineAudioContext);
        if (renderedNativeDelayNode !== void 0) {
          return Promise.resolve(renderedNativeDelayNode);
        }
        return createDelayNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const createDeleteActiveInputConnectionToAudioNode = (pickElementFromSet2) => {
  return (activeInputs, source, output, input) => {
    return pickElementFromSet2(activeInputs[input], (activeInputConnection) => activeInputConnection[0] === source && activeInputConnection[1] === output);
  };
};
const createDeleteUnrenderedAudioWorkletNode = (getUnrenderedAudioWorkletNodes2) => {
  return (nativeContext, audioWorkletNode) => {
    getUnrenderedAudioWorkletNodes2(nativeContext).delete(audioWorkletNode);
  };
};
const isDelayNode = (audioNode) => {
  return "delayTime" in audioNode;
};
const createDetectCycles = (audioParamAudioNodeStore2, getAudioNodeConnections2, getValueForKey2) => {
  return function detectCycles(chain, nextLink) {
    const audioNode = isAudioNode$1(nextLink) ? nextLink : getValueForKey2(audioParamAudioNodeStore2, nextLink);
    if (isDelayNode(audioNode)) {
      return [];
    }
    if (chain[0] === audioNode) {
      return [chain];
    }
    if (chain.includes(audioNode)) {
      return [];
    }
    const { outputs } = getAudioNodeConnections2(audioNode);
    return Array.from(outputs).map((outputConnection) => detectCycles([...chain, audioNode], outputConnection[0])).reduce((mergedCycles, nestedCycles) => mergedCycles.concat(nestedCycles), []);
  };
};
const getOutputAudioNodeAtIndex = (createIndexSizeError2, outputAudioNodes, output) => {
  const outputAudioNode = outputAudioNodes[output];
  if (outputAudioNode === void 0) {
    throw createIndexSizeError2();
  }
  return outputAudioNode;
};
const createDisconnectMultipleOutputs = (createIndexSizeError2) => {
  return (outputAudioNodes, destinationOrOutput = void 0, output = void 0, input = 0) => {
    if (destinationOrOutput === void 0) {
      return outputAudioNodes.forEach((outputAudioNode) => outputAudioNode.disconnect());
    }
    if (typeof destinationOrOutput === "number") {
      return getOutputAudioNodeAtIndex(createIndexSizeError2, outputAudioNodes, destinationOrOutput).disconnect();
    }
    if (isNativeAudioNode$1(destinationOrOutput)) {
      if (output === void 0) {
        return outputAudioNodes.forEach((outputAudioNode) => outputAudioNode.disconnect(destinationOrOutput));
      }
      if (input === void 0) {
        return getOutputAudioNodeAtIndex(createIndexSizeError2, outputAudioNodes, output).disconnect(destinationOrOutput, 0);
      }
      return getOutputAudioNodeAtIndex(createIndexSizeError2, outputAudioNodes, output).disconnect(destinationOrOutput, 0, input);
    }
    if (output === void 0) {
      return outputAudioNodes.forEach((outputAudioNode) => outputAudioNode.disconnect(destinationOrOutput));
    }
    return getOutputAudioNodeAtIndex(createIndexSizeError2, outputAudioNodes, output).disconnect(destinationOrOutput, 0);
  };
};
const DEFAULT_OPTIONS$9 = {
  attack: 3e-3,
  channelCount: 2,
  channelCountMode: "clamped-max",
  channelInterpretation: "speakers",
  knee: 30,
  ratio: 12,
  release: 0.25,
  threshold: -24
};
const createDynamicsCompressorNodeConstructor = (audioNodeConstructor2, createAudioParam2, createDynamicsCompressorNodeRenderer2, createNativeDynamicsCompressorNode2, createNotSupportedError2, getNativeContext2, isNativeOfflineAudioContext2, setAudioNodeTailTime2) => {
  return class DynamicsCompressorNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$9), options);
      const nativeDynamicsCompressorNode = createNativeDynamicsCompressorNode2(nativeContext, mergedOptions);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const dynamicsCompressorNodeRenderer = isOffline ? createDynamicsCompressorNodeRenderer2() : null;
      super(context2, false, nativeDynamicsCompressorNode, dynamicsCompressorNodeRenderer);
      this._attack = createAudioParam2(this, isOffline, nativeDynamicsCompressorNode.attack);
      this._knee = createAudioParam2(this, isOffline, nativeDynamicsCompressorNode.knee);
      this._nativeDynamicsCompressorNode = nativeDynamicsCompressorNode;
      this._ratio = createAudioParam2(this, isOffline, nativeDynamicsCompressorNode.ratio);
      this._release = createAudioParam2(this, isOffline, nativeDynamicsCompressorNode.release);
      this._threshold = createAudioParam2(this, isOffline, nativeDynamicsCompressorNode.threshold);
      setAudioNodeTailTime2(this, 6e-3);
    }
    get attack() {
      return this._attack;
    }
    get channelCount() {
      return this._nativeDynamicsCompressorNode.channelCount;
    }
    set channelCount(value) {
      const previousChannelCount = this._nativeDynamicsCompressorNode.channelCount;
      this._nativeDynamicsCompressorNode.channelCount = value;
      if (value > 2) {
        this._nativeDynamicsCompressorNode.channelCount = previousChannelCount;
        throw createNotSupportedError2();
      }
    }
    get channelCountMode() {
      return this._nativeDynamicsCompressorNode.channelCountMode;
    }
    set channelCountMode(value) {
      const previousChannelCount = this._nativeDynamicsCompressorNode.channelCountMode;
      this._nativeDynamicsCompressorNode.channelCountMode = value;
      if (value === "max") {
        this._nativeDynamicsCompressorNode.channelCountMode = previousChannelCount;
        throw createNotSupportedError2();
      }
    }
    get knee() {
      return this._knee;
    }
    get ratio() {
      return this._ratio;
    }
    get reduction() {
      if (typeof this._nativeDynamicsCompressorNode.reduction.value === "number") {
        return this._nativeDynamicsCompressorNode.reduction.value;
      }
      return this._nativeDynamicsCompressorNode.reduction;
    }
    get release() {
      return this._release;
    }
    get threshold() {
      return this._threshold;
    }
  };
};
const createDynamicsCompressorNodeRendererFactory = (connectAudioParam2, createNativeDynamicsCompressorNode2, getNativeAudioNode2, renderAutomation2, renderInputsOfAudioNode2) => {
  return () => {
    const renderedNativeDynamicsCompressorNodes = /* @__PURE__ */ new WeakMap();
    const createDynamicsCompressorNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeDynamicsCompressorNode = getNativeAudioNode2(proxy);
      const nativeDynamicsCompressorNodeIsOwnedByContext = isOwnedByContext(nativeDynamicsCompressorNode, nativeOfflineAudioContext);
      if (!nativeDynamicsCompressorNodeIsOwnedByContext) {
        const options = {
          attack: nativeDynamicsCompressorNode.attack.value,
          channelCount: nativeDynamicsCompressorNode.channelCount,
          channelCountMode: nativeDynamicsCompressorNode.channelCountMode,
          channelInterpretation: nativeDynamicsCompressorNode.channelInterpretation,
          knee: nativeDynamicsCompressorNode.knee.value,
          ratio: nativeDynamicsCompressorNode.ratio.value,
          release: nativeDynamicsCompressorNode.release.value,
          threshold: nativeDynamicsCompressorNode.threshold.value
        };
        nativeDynamicsCompressorNode = createNativeDynamicsCompressorNode2(nativeOfflineAudioContext, options);
      }
      renderedNativeDynamicsCompressorNodes.set(nativeOfflineAudioContext, nativeDynamicsCompressorNode);
      if (!nativeDynamicsCompressorNodeIsOwnedByContext) {
        yield renderAutomation2(nativeOfflineAudioContext, proxy.attack, nativeDynamicsCompressorNode.attack);
        yield renderAutomation2(nativeOfflineAudioContext, proxy.knee, nativeDynamicsCompressorNode.knee);
        yield renderAutomation2(nativeOfflineAudioContext, proxy.ratio, nativeDynamicsCompressorNode.ratio);
        yield renderAutomation2(nativeOfflineAudioContext, proxy.release, nativeDynamicsCompressorNode.release);
        yield renderAutomation2(nativeOfflineAudioContext, proxy.threshold, nativeDynamicsCompressorNode.threshold);
      } else {
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.attack, nativeDynamicsCompressorNode.attack);
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.knee, nativeDynamicsCompressorNode.knee);
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.ratio, nativeDynamicsCompressorNode.ratio);
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.release, nativeDynamicsCompressorNode.release);
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.threshold, nativeDynamicsCompressorNode.threshold);
      }
      yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeDynamicsCompressorNode);
      return nativeDynamicsCompressorNode;
    });
    return {
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeDynamicsCompressorNode = renderedNativeDynamicsCompressorNodes.get(nativeOfflineAudioContext);
        if (renderedNativeDynamicsCompressorNode !== void 0) {
          return Promise.resolve(renderedNativeDynamicsCompressorNode);
        }
        return createDynamicsCompressorNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const createEncodingError = () => new DOMException("", "EncodingError");
const createEvaluateSource = (window2) => {
  return (source) => new Promise((resolve, reject) => {
    if (window2 === null) {
      reject(new SyntaxError());
      return;
    }
    const head = window2.document.head;
    if (head === null) {
      reject(new SyntaxError());
    } else {
      const script = window2.document.createElement("script");
      const blob = new Blob([source], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      const originalOnErrorHandler = window2.onerror;
      const removeErrorEventListenerAndRevokeUrl = () => {
        window2.onerror = originalOnErrorHandler;
        URL.revokeObjectURL(url);
      };
      window2.onerror = (message, src, lineno, colno, error) => {
        if (src === url || src === window2.location.href && lineno === 1 && colno === 1) {
          removeErrorEventListenerAndRevokeUrl();
          reject(error);
          return false;
        }
        if (originalOnErrorHandler !== null) {
          return originalOnErrorHandler(message, src, lineno, colno, error);
        }
      };
      script.onerror = () => {
        removeErrorEventListenerAndRevokeUrl();
        reject(new SyntaxError());
      };
      script.onload = () => {
        removeErrorEventListenerAndRevokeUrl();
        resolve();
      };
      script.src = url;
      script.type = "module";
      head.appendChild(script);
    }
  });
};
const createEventTargetConstructor = (wrapEventListener2) => {
  return class EventTarget {
    constructor(_nativeEventTarget) {
      this._nativeEventTarget = _nativeEventTarget;
      this._listeners = /* @__PURE__ */ new WeakMap();
    }
    addEventListener(type, listener, options) {
      if (listener !== null) {
        let wrappedEventListener = this._listeners.get(listener);
        if (wrappedEventListener === void 0) {
          wrappedEventListener = wrapEventListener2(this, listener);
          if (typeof listener === "function") {
            this._listeners.set(listener, wrappedEventListener);
          }
        }
        this._nativeEventTarget.addEventListener(type, wrappedEventListener, options);
      }
    }
    dispatchEvent(event) {
      return this._nativeEventTarget.dispatchEvent(event);
    }
    removeEventListener(type, listener, options) {
      const wrappedEventListener = listener === null ? void 0 : this._listeners.get(listener);
      this._nativeEventTarget.removeEventListener(type, wrappedEventListener === void 0 ? null : wrappedEventListener, options);
    }
  };
};
const createExposeCurrentFrameAndCurrentTime = (window2) => {
  return (currentTime, sampleRate, fn) => {
    Object.defineProperties(window2, {
      currentFrame: {
        configurable: true,
        get() {
          return Math.round(currentTime * sampleRate);
        }
      },
      currentTime: {
        configurable: true,
        get() {
          return currentTime;
        }
      }
    });
    try {
      return fn();
    } finally {
      if (window2 !== null) {
        delete window2.currentFrame;
        delete window2.currentTime;
      }
    }
  };
};
const createFetchSource = (createAbortError2) => {
  return (url) => __async(void 0, null, function* () {
    try {
      const response = yield fetch(url);
      if (response.ok) {
        return [yield response.text(), response.url];
      }
    } catch (e) {
    }
    throw createAbortError2();
  });
};
const DEFAULT_OPTIONS$8 = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  gain: 1
};
const createGainNodeConstructor = (audioNodeConstructor2, createAudioParam2, createGainNodeRenderer2, createNativeGainNode2, getNativeContext2, isNativeOfflineAudioContext2) => {
  return class GainNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$8), options);
      const nativeGainNode = createNativeGainNode2(nativeContext, mergedOptions);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const gainNodeRenderer = isOffline ? createGainNodeRenderer2() : null;
      super(context2, false, nativeGainNode, gainNodeRenderer);
      this._gain = createAudioParam2(this, isOffline, nativeGainNode.gain, MOST_POSITIVE_SINGLE_FLOAT, MOST_NEGATIVE_SINGLE_FLOAT);
    }
    get gain() {
      return this._gain;
    }
  };
};
const createGainNodeRendererFactory = (connectAudioParam2, createNativeGainNode2, getNativeAudioNode2, renderAutomation2, renderInputsOfAudioNode2) => {
  return () => {
    const renderedNativeGainNodes = /* @__PURE__ */ new WeakMap();
    const createGainNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeGainNode = getNativeAudioNode2(proxy);
      const nativeGainNodeIsOwnedByContext = isOwnedByContext(nativeGainNode, nativeOfflineAudioContext);
      if (!nativeGainNodeIsOwnedByContext) {
        const options = {
          channelCount: nativeGainNode.channelCount,
          channelCountMode: nativeGainNode.channelCountMode,
          channelInterpretation: nativeGainNode.channelInterpretation,
          gain: nativeGainNode.gain.value
        };
        nativeGainNode = createNativeGainNode2(nativeOfflineAudioContext, options);
      }
      renderedNativeGainNodes.set(nativeOfflineAudioContext, nativeGainNode);
      if (!nativeGainNodeIsOwnedByContext) {
        yield renderAutomation2(nativeOfflineAudioContext, proxy.gain, nativeGainNode.gain);
      } else {
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.gain, nativeGainNode.gain);
      }
      yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeGainNode);
      return nativeGainNode;
    });
    return {
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeGainNode = renderedNativeGainNodes.get(nativeOfflineAudioContext);
        if (renderedNativeGainNode !== void 0) {
          return Promise.resolve(renderedNativeGainNode);
        }
        return createGainNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const createGetActiveAudioWorkletNodeInputs = (activeAudioWorkletNodeInputsStore2, getValueForKey2) => {
  return (nativeAudioWorkletNode) => getValueForKey2(activeAudioWorkletNodeInputsStore2, nativeAudioWorkletNode);
};
const createGetAudioNodeRenderer = (getAudioNodeConnections2) => {
  return (audioNode) => {
    const audioNodeConnections = getAudioNodeConnections2(audioNode);
    if (audioNodeConnections.renderer === null) {
      throw new Error("Missing the renderer of the given AudioNode in the audio graph.");
    }
    return audioNodeConnections.renderer;
  };
};
const createGetAudioNodeTailTime = (audioNodeTailTimeStore2) => {
  return (audioNode) => {
    var _a;
    return (_a = audioNodeTailTimeStore2.get(audioNode)) !== null && _a !== void 0 ? _a : 0;
  };
};
const createGetAudioParamRenderer = (getAudioParamConnections2) => {
  return (audioParam) => {
    const audioParamConnections = getAudioParamConnections2(audioParam);
    if (audioParamConnections.renderer === null) {
      throw new Error("Missing the renderer of the given AudioParam in the audio graph.");
    }
    return audioParamConnections.renderer;
  };
};
const createGetBackupOfflineAudioContext = (backupOfflineAudioContextStore2) => {
  return (nativeContext) => {
    return backupOfflineAudioContextStore2.get(nativeContext);
  };
};
const createInvalidStateError = () => new DOMException("", "InvalidStateError");
const createGetNativeContext = (contextStore) => {
  return (context2) => {
    const nativeContext = contextStore.get(context2);
    if (nativeContext === void 0) {
      throw createInvalidStateError();
    }
    return nativeContext;
  };
};
const createGetOrCreateBackupOfflineAudioContext = (backupOfflineAudioContextStore2, nativeOfflineAudioContextConstructor2) => {
  return (nativeContext) => {
    let backupOfflineAudioContext = backupOfflineAudioContextStore2.get(nativeContext);
    if (backupOfflineAudioContext !== void 0) {
      return backupOfflineAudioContext;
    }
    if (nativeOfflineAudioContextConstructor2 === null) {
      throw new Error("Missing the native OfflineAudioContext constructor.");
    }
    backupOfflineAudioContext = new nativeOfflineAudioContextConstructor2(1, 1, 44100);
    backupOfflineAudioContextStore2.set(nativeContext, backupOfflineAudioContext);
    return backupOfflineAudioContext;
  };
};
const createGetUnrenderedAudioWorkletNodes = (unrenderedAudioWorkletNodeStore2) => {
  return (nativeContext) => {
    const unrenderedAudioWorkletNodes = unrenderedAudioWorkletNodeStore2.get(nativeContext);
    if (unrenderedAudioWorkletNodes === void 0) {
      throw new Error("The context has no set of AudioWorkletNodes.");
    }
    return unrenderedAudioWorkletNodes;
  };
};
const createInvalidAccessError = () => new DOMException("", "InvalidAccessError");
const wrapIIRFilterNodeGetFrequencyResponseMethod = (nativeIIRFilterNode) => {
  nativeIIRFilterNode.getFrequencyResponse = /* @__PURE__ */ ((getFrequencyResponse) => {
    return (frequencyHz, magResponse, phaseResponse) => {
      if (frequencyHz.length !== magResponse.length || magResponse.length !== phaseResponse.length) {
        throw createInvalidAccessError();
      }
      return getFrequencyResponse.call(nativeIIRFilterNode, frequencyHz, magResponse, phaseResponse);
    };
  })(nativeIIRFilterNode.getFrequencyResponse);
};
const DEFAULT_OPTIONS$7 = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers"
};
const createIIRFilterNodeConstructor = (audioNodeConstructor2, createNativeIIRFilterNode2, createIIRFilterNodeRenderer2, getNativeContext2, isNativeOfflineAudioContext2, setAudioNodeTailTime2) => {
  return class IIRFilterNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$7), options);
      const nativeIIRFilterNode = createNativeIIRFilterNode2(nativeContext, isOffline ? null : context2.baseLatency, mergedOptions);
      const iirFilterNodeRenderer = isOffline ? createIIRFilterNodeRenderer2(mergedOptions.feedback, mergedOptions.feedforward) : null;
      super(context2, false, nativeIIRFilterNode, iirFilterNodeRenderer);
      wrapIIRFilterNodeGetFrequencyResponseMethod(nativeIIRFilterNode);
      this._nativeIIRFilterNode = nativeIIRFilterNode;
      setAudioNodeTailTime2(this, 1);
    }
    getFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
      return this._nativeIIRFilterNode.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
    }
  };
};
const filterBuffer = (feedback, feedbackLength, feedforward, feedforwardLength, minLength, xBuffer, yBuffer, bufferIndex, bufferLength, input, output) => {
  const inputLength = input.length;
  let i = bufferIndex;
  for (let j = 0; j < inputLength; j += 1) {
    let y = feedforward[0] * input[j];
    for (let k = 1; k < minLength; k += 1) {
      const x = i - k & bufferLength - 1;
      y += feedforward[k] * xBuffer[x];
      y -= feedback[k] * yBuffer[x];
    }
    for (let k = minLength; k < feedforwardLength; k += 1) {
      y += feedforward[k] * xBuffer[i - k & bufferLength - 1];
    }
    for (let k = minLength; k < feedbackLength; k += 1) {
      y -= feedback[k] * yBuffer[i - k & bufferLength - 1];
    }
    xBuffer[i] = input[j];
    yBuffer[i] = y;
    i = i + 1 & bufferLength - 1;
    output[j] = y;
  }
  return i;
};
const filterFullBuffer = (renderedBuffer, nativeOfflineAudioContext, feedback, feedforward) => {
  const convertedFeedback = feedback instanceof Float64Array ? feedback : new Float64Array(feedback);
  const convertedFeedforward = feedforward instanceof Float64Array ? feedforward : new Float64Array(feedforward);
  const feedbackLength = convertedFeedback.length;
  const feedforwardLength = convertedFeedforward.length;
  const minLength = Math.min(feedbackLength, feedforwardLength);
  if (convertedFeedback[0] !== 1) {
    for (let i = 0; i < feedbackLength; i += 1) {
      convertedFeedforward[i] /= convertedFeedback[0];
    }
    for (let i = 1; i < feedforwardLength; i += 1) {
      convertedFeedback[i] /= convertedFeedback[0];
    }
  }
  const bufferLength = 32;
  const xBuffer = new Float32Array(bufferLength);
  const yBuffer = new Float32Array(bufferLength);
  const filteredBuffer = nativeOfflineAudioContext.createBuffer(renderedBuffer.numberOfChannels, renderedBuffer.length, renderedBuffer.sampleRate);
  const numberOfChannels = renderedBuffer.numberOfChannels;
  for (let i = 0; i < numberOfChannels; i += 1) {
    const input = renderedBuffer.getChannelData(i);
    const output = filteredBuffer.getChannelData(i);
    xBuffer.fill(0);
    yBuffer.fill(0);
    filterBuffer(convertedFeedback, feedbackLength, convertedFeedforward, feedforwardLength, minLength, xBuffer, yBuffer, 0, bufferLength, input, output);
  }
  return filteredBuffer;
};
const createIIRFilterNodeRendererFactory = (createNativeAudioBufferSourceNode2, getNativeAudioNode2, nativeOfflineAudioContextConstructor2, renderInputsOfAudioNode2, renderNativeOfflineAudioContext2) => {
  return (feedback, feedforward) => {
    const renderedNativeAudioNodes = /* @__PURE__ */ new WeakMap();
    let filteredBufferPromise = null;
    const createAudioNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeAudioBufferSourceNode = null;
      let nativeIIRFilterNode = getNativeAudioNode2(proxy);
      const nativeIIRFilterNodeIsOwnedByContext = isOwnedByContext(nativeIIRFilterNode, nativeOfflineAudioContext);
      if (nativeOfflineAudioContext.createIIRFilter === void 0) {
        nativeAudioBufferSourceNode = createNativeAudioBufferSourceNode2(nativeOfflineAudioContext, {
          buffer: null,
          channelCount: 2,
          channelCountMode: "max",
          channelInterpretation: "speakers",
          loop: false,
          loopEnd: 0,
          loopStart: 0,
          playbackRate: 1
        });
      } else if (!nativeIIRFilterNodeIsOwnedByContext) {
        nativeIIRFilterNode = nativeOfflineAudioContext.createIIRFilter(feedforward, feedback);
      }
      renderedNativeAudioNodes.set(nativeOfflineAudioContext, nativeAudioBufferSourceNode === null ? nativeIIRFilterNode : nativeAudioBufferSourceNode);
      if (nativeAudioBufferSourceNode !== null) {
        if (filteredBufferPromise === null) {
          if (nativeOfflineAudioContextConstructor2 === null) {
            throw new Error("Missing the native OfflineAudioContext constructor.");
          }
          const partialOfflineAudioContext = new nativeOfflineAudioContextConstructor2(
            proxy.context.destination.channelCount,
            proxy.context.length,
            nativeOfflineAudioContext.sampleRate
          );
          filteredBufferPromise = (() => __async(void 0, null, function* () {
            yield renderInputsOfAudioNode2(proxy, partialOfflineAudioContext, partialOfflineAudioContext.destination);
            const renderedBuffer = yield renderNativeOfflineAudioContext2(partialOfflineAudioContext);
            return filterFullBuffer(renderedBuffer, nativeOfflineAudioContext, feedback, feedforward);
          }))();
        }
        const filteredBuffer = yield filteredBufferPromise;
        nativeAudioBufferSourceNode.buffer = filteredBuffer;
        nativeAudioBufferSourceNode.start(0);
        return nativeAudioBufferSourceNode;
      }
      yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeIIRFilterNode);
      return nativeIIRFilterNode;
    });
    return {
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeAudioNode = renderedNativeAudioNodes.get(nativeOfflineAudioContext);
        if (renderedNativeAudioNode !== void 0) {
          return Promise.resolve(renderedNativeAudioNode);
        }
        return createAudioNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const createIncrementCycleCounterFactory = (cycleCounters, disconnectNativeAudioNodeFromNativeAudioNode2, getAudioNodeConnections2, getNativeAudioNode2, getNativeAudioParam2, isActiveAudioNode2) => {
  return (isOffline) => {
    return (audioNode, count) => {
      const cycleCounter = cycleCounters.get(audioNode);
      if (cycleCounter === void 0) {
        if (!isOffline && isActiveAudioNode2(audioNode)) {
          const nativeSourceAudioNode = getNativeAudioNode2(audioNode);
          const { outputs } = getAudioNodeConnections2(audioNode);
          for (const output of outputs) {
            if (isAudioNodeOutputConnection(output)) {
              const nativeDestinationAudioNode = getNativeAudioNode2(output[0]);
              disconnectNativeAudioNodeFromNativeAudioNode2(nativeSourceAudioNode, nativeDestinationAudioNode, output[1], output[2]);
            } else {
              const nativeDestinationAudioParam = getNativeAudioParam2(output[0]);
              nativeSourceAudioNode.disconnect(nativeDestinationAudioParam, output[1]);
            }
          }
        }
        cycleCounters.set(audioNode, count);
      } else {
        cycleCounters.set(audioNode, cycleCounter + count);
      }
    };
  };
};
const createIsAnyAudioContext = (contextStore, isNativeAudioContext2) => {
  return (anything) => {
    const nativeContext = contextStore.get(anything);
    return isNativeAudioContext2(nativeContext) || isNativeAudioContext2(anything);
  };
};
const createIsAnyAudioNode = (audioNodeStore, isNativeAudioNode2) => {
  return (anything) => audioNodeStore.has(anything) || isNativeAudioNode2(anything);
};
const createIsAnyAudioParam = (audioParamStore, isNativeAudioParam2) => {
  return (anything) => audioParamStore.has(anything) || isNativeAudioParam2(anything);
};
const createIsAnyOfflineAudioContext = (contextStore, isNativeOfflineAudioContext2) => {
  return (anything) => {
    const nativeContext = contextStore.get(anything);
    return isNativeOfflineAudioContext2(nativeContext) || isNativeOfflineAudioContext2(anything);
  };
};
const createIsNativeAudioContext = (nativeAudioContextConstructor2) => {
  return (anything) => {
    return nativeAudioContextConstructor2 !== null && anything instanceof nativeAudioContextConstructor2;
  };
};
const createIsNativeAudioNode = (window2) => {
  return (anything) => {
    return window2 !== null && typeof window2.AudioNode === "function" && anything instanceof window2.AudioNode;
  };
};
const createIsNativeAudioParam = (window2) => {
  return (anything) => {
    return window2 !== null && typeof window2.AudioParam === "function" && anything instanceof window2.AudioParam;
  };
};
const createIsNativeContext = (isNativeAudioContext2, isNativeOfflineAudioContext2) => {
  return (anything) => {
    return isNativeAudioContext2(anything) || isNativeOfflineAudioContext2(anything);
  };
};
const createIsNativeOfflineAudioContext = (nativeOfflineAudioContextConstructor2) => {
  return (anything) => {
    return nativeOfflineAudioContextConstructor2 !== null && anything instanceof nativeOfflineAudioContextConstructor2;
  };
};
const createIsSecureContext = (window2) => window2 !== null && window2.isSecureContext;
const createMediaElementAudioSourceNodeConstructor = (audioNodeConstructor2, createNativeMediaElementAudioSourceNode2, getNativeContext2, isNativeOfflineAudioContext2) => {
  return class MediaElementAudioSourceNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const nativeMediaElementAudioSourceNode = createNativeMediaElementAudioSourceNode2(nativeContext, options);
      if (isNativeOfflineAudioContext2(nativeContext)) {
        throw TypeError();
      }
      super(context2, true, nativeMediaElementAudioSourceNode, null);
      this._nativeMediaElementAudioSourceNode = nativeMediaElementAudioSourceNode;
    }
    get mediaElement() {
      return this._nativeMediaElementAudioSourceNode.mediaElement;
    }
  };
};
const DEFAULT_OPTIONS$6 = {
  channelCount: 2,
  channelCountMode: "explicit",
  channelInterpretation: "speakers"
};
const createMediaStreamAudioDestinationNodeConstructor = (audioNodeConstructor2, createNativeMediaStreamAudioDestinationNode2, getNativeContext2, isNativeOfflineAudioContext2) => {
  return class MediaStreamAudioDestinationNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      if (isNativeOfflineAudioContext2(nativeContext)) {
        throw new TypeError();
      }
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$6), options);
      const nativeMediaStreamAudioDestinationNode = createNativeMediaStreamAudioDestinationNode2(nativeContext, mergedOptions);
      super(context2, false, nativeMediaStreamAudioDestinationNode, null);
      this._nativeMediaStreamAudioDestinationNode = nativeMediaStreamAudioDestinationNode;
    }
    get stream() {
      return this._nativeMediaStreamAudioDestinationNode.stream;
    }
  };
};
const createMediaStreamAudioSourceNodeConstructor = (audioNodeConstructor2, createNativeMediaStreamAudioSourceNode2, getNativeContext2, isNativeOfflineAudioContext2) => {
  return class MediaStreamAudioSourceNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const nativeMediaStreamAudioSourceNode = createNativeMediaStreamAudioSourceNode2(nativeContext, options);
      if (isNativeOfflineAudioContext2(nativeContext)) {
        throw new TypeError();
      }
      super(context2, true, nativeMediaStreamAudioSourceNode, null);
      this._nativeMediaStreamAudioSourceNode = nativeMediaStreamAudioSourceNode;
    }
    get mediaStream() {
      return this._nativeMediaStreamAudioSourceNode.mediaStream;
    }
  };
};
const createMediaStreamTrackAudioSourceNodeConstructor = (audioNodeConstructor2, createNativeMediaStreamTrackAudioSourceNode2, getNativeContext2) => {
  return class MediaStreamTrackAudioSourceNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const nativeMediaStreamTrackAudioSourceNode = createNativeMediaStreamTrackAudioSourceNode2(nativeContext, options);
      super(context2, true, nativeMediaStreamTrackAudioSourceNode, null);
    }
  };
};
const createMinimalBaseAudioContextConstructor = (audioDestinationNodeConstructor2, createAudioListener2, eventTargetConstructor2, isNativeOfflineAudioContext2, unrenderedAudioWorkletNodeStore2, wrapEventListener2) => {
  return class MinimalBaseAudioContext extends eventTargetConstructor2 {
    constructor(_nativeContext, numberOfChannels) {
      super(_nativeContext);
      this._nativeContext = _nativeContext;
      CONTEXT_STORE.set(this, _nativeContext);
      if (isNativeOfflineAudioContext2(_nativeContext)) {
        unrenderedAudioWorkletNodeStore2.set(_nativeContext, /* @__PURE__ */ new Set());
      }
      this._destination = new audioDestinationNodeConstructor2(this, numberOfChannels);
      this._listener = createAudioListener2(this, _nativeContext);
      this._onstatechange = null;
    }
    get currentTime() {
      return this._nativeContext.currentTime;
    }
    get destination() {
      return this._destination;
    }
    get listener() {
      return this._listener;
    }
    get onstatechange() {
      return this._onstatechange;
    }
    set onstatechange(value) {
      const wrappedListener = typeof value === "function" ? wrapEventListener2(this, value) : null;
      this._nativeContext.onstatechange = wrappedListener;
      const nativeOnStateChange = this._nativeContext.onstatechange;
      this._onstatechange = nativeOnStateChange !== null && nativeOnStateChange === wrappedListener ? value : nativeOnStateChange;
    }
    get sampleRate() {
      return this._nativeContext.sampleRate;
    }
    get state() {
      return this._nativeContext.state;
    }
  };
};
const testPromiseSupport = (nativeContext) => {
  const uint32Array = new Uint32Array([1179011410, 40, 1163280727, 544501094, 16, 131073, 44100, 176400, 1048580, 1635017060, 4, 0]);
  try {
    const promise = nativeContext.decodeAudioData(uint32Array.buffer, () => {
    });
    if (promise === void 0) {
      return false;
    }
    promise.catch(() => {
    });
    return true;
  } catch (e) {
  }
  return false;
};
const createMonitorConnections = (insertElementInSet2, isNativeAudioNode2) => {
  return (nativeAudioNode, whenConnected, whenDisconnected) => {
    const connections = /* @__PURE__ */ new Set();
    nativeAudioNode.connect = /* @__PURE__ */ ((connect2) => {
      return (destination, output = 0, input = 0) => {
        const wasDisconnected = connections.size === 0;
        if (isNativeAudioNode2(destination)) {
          connect2.call(nativeAudioNode, destination, output, input);
          insertElementInSet2(connections, [destination, output, input], (connection) => connection[0] === destination && connection[1] === output && connection[2] === input, true);
          if (wasDisconnected) {
            whenConnected();
          }
          return destination;
        }
        connect2.call(nativeAudioNode, destination, output);
        insertElementInSet2(connections, [destination, output], (connection) => connection[0] === destination && connection[1] === output, true);
        if (wasDisconnected) {
          whenConnected();
        }
        return;
      };
    })(nativeAudioNode.connect);
    nativeAudioNode.disconnect = /* @__PURE__ */ ((disconnect2) => {
      return (destinationOrOutput, output, input) => {
        const wasConnected = connections.size > 0;
        if (destinationOrOutput === void 0) {
          disconnect2.apply(nativeAudioNode);
          connections.clear();
        } else if (typeof destinationOrOutput === "number") {
          disconnect2.call(nativeAudioNode, destinationOrOutput);
          for (const connection of connections) {
            if (connection[1] === destinationOrOutput) {
              connections.delete(connection);
            }
          }
        } else {
          if (isNativeAudioNode2(destinationOrOutput)) {
            disconnect2.call(nativeAudioNode, destinationOrOutput, output, input);
          } else {
            disconnect2.call(nativeAudioNode, destinationOrOutput, output);
          }
          for (const connection of connections) {
            if (connection[0] === destinationOrOutput && (output === void 0 || connection[1] === output) && (input === void 0 || connection[2] === input)) {
              connections.delete(connection);
            }
          }
        }
        const isDisconnected = connections.size === 0;
        if (wasConnected && isDisconnected) {
          whenDisconnected();
        }
      };
    })(nativeAudioNode.disconnect);
    return nativeAudioNode;
  };
};
const assignNativeAudioNodeOption = (nativeAudioNode, options, option) => {
  const value = options[option];
  if (value !== void 0 && value !== nativeAudioNode[option]) {
    nativeAudioNode[option] = value;
  }
};
const assignNativeAudioNodeOptions = (nativeAudioNode, options) => {
  assignNativeAudioNodeOption(nativeAudioNode, options, "channelCount");
  assignNativeAudioNodeOption(nativeAudioNode, options, "channelCountMode");
  assignNativeAudioNodeOption(nativeAudioNode, options, "channelInterpretation");
};
const testAnalyserNodeGetFloatTimeDomainDataMethodSupport = (nativeAnalyserNode) => {
  return typeof nativeAnalyserNode.getFloatTimeDomainData === "function";
};
const wrapAnalyserNodeGetFloatTimeDomainDataMethod = (nativeAnalyserNode) => {
  nativeAnalyserNode.getFloatTimeDomainData = (array) => {
    const byteTimeDomainData = new Uint8Array(array.length);
    nativeAnalyserNode.getByteTimeDomainData(byteTimeDomainData);
    const length = Math.max(byteTimeDomainData.length, nativeAnalyserNode.fftSize);
    for (let i = 0; i < length; i += 1) {
      array[i] = (byteTimeDomainData[i] - 128) * 78125e-7;
    }
    return array;
  };
};
const createNativeAnalyserNodeFactory = (cacheTestResult2, createIndexSizeError2) => {
  return (nativeContext, options) => {
    const nativeAnalyserNode = nativeContext.createAnalyser();
    assignNativeAudioNodeOptions(nativeAnalyserNode, options);
    if (!(options.maxDecibels > options.minDecibels)) {
      throw createIndexSizeError2();
    }
    assignNativeAudioNodeOption(nativeAnalyserNode, options, "fftSize");
    assignNativeAudioNodeOption(nativeAnalyserNode, options, "maxDecibels");
    assignNativeAudioNodeOption(nativeAnalyserNode, options, "minDecibels");
    assignNativeAudioNodeOption(nativeAnalyserNode, options, "smoothingTimeConstant");
    if (!cacheTestResult2(testAnalyserNodeGetFloatTimeDomainDataMethodSupport, () => testAnalyserNodeGetFloatTimeDomainDataMethodSupport(nativeAnalyserNode))) {
      wrapAnalyserNodeGetFloatTimeDomainDataMethod(nativeAnalyserNode);
    }
    return nativeAnalyserNode;
  };
};
const createNativeAudioBufferConstructor = (window2) => {
  if (window2 === null) {
    return null;
  }
  if (window2.hasOwnProperty("AudioBuffer")) {
    return window2.AudioBuffer;
  }
  return null;
};
const assignNativeAudioNodeAudioParamValue = (nativeAudioNode, options, audioParam) => {
  const value = options[audioParam];
  if (value !== void 0 && value !== nativeAudioNode[audioParam].value) {
    nativeAudioNode[audioParam].value = value;
  }
};
const wrapAudioBufferSourceNodeStartMethodConsecutiveCalls = (nativeAudioBufferSourceNode) => {
  nativeAudioBufferSourceNode.start = /* @__PURE__ */ ((start2) => {
    let isScheduled = false;
    return (when = 0, offset = 0, duration) => {
      if (isScheduled) {
        throw createInvalidStateError();
      }
      start2.call(nativeAudioBufferSourceNode, when, offset, duration);
      isScheduled = true;
    };
  })(nativeAudioBufferSourceNode.start);
};
const wrapAudioScheduledSourceNodeStartMethodNegativeParameters = (nativeAudioScheduledSourceNode) => {
  nativeAudioScheduledSourceNode.start = /* @__PURE__ */ ((start2) => {
    return (when = 0, offset = 0, duration) => {
      if (typeof duration === "number" && duration < 0 || offset < 0 || when < 0) {
        throw new RangeError("The parameters can't be negative.");
      }
      start2.call(nativeAudioScheduledSourceNode, when, offset, duration);
    };
  })(nativeAudioScheduledSourceNode.start);
};
const wrapAudioScheduledSourceNodeStopMethodNegativeParameters = (nativeAudioScheduledSourceNode) => {
  nativeAudioScheduledSourceNode.stop = /* @__PURE__ */ ((stop) => {
    return (when = 0) => {
      if (when < 0) {
        throw new RangeError("The parameter can't be negative.");
      }
      stop.call(nativeAudioScheduledSourceNode, when);
    };
  })(nativeAudioScheduledSourceNode.stop);
};
const createNativeAudioBufferSourceNodeFactory = (addSilentConnection2, cacheTestResult2, testAudioBufferSourceNodeStartMethodConsecutiveCallsSupport2, testAudioBufferSourceNodeStartMethodOffsetClampingSupport2, testAudioBufferSourceNodeStopMethodNullifiedBufferSupport2, testAudioScheduledSourceNodeStartMethodNegativeParametersSupport2, testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport2, testAudioScheduledSourceNodeStopMethodNegativeParametersSupport2, wrapAudioBufferSourceNodeStartMethodOffsetClampling, wrapAudioBufferSourceNodeStopMethodNullifiedBuffer, wrapAudioScheduledSourceNodeStopMethodConsecutiveCalls2) => {
  return (nativeContext, options) => {
    const nativeAudioBufferSourceNode = nativeContext.createBufferSource();
    assignNativeAudioNodeOptions(nativeAudioBufferSourceNode, options);
    assignNativeAudioNodeAudioParamValue(nativeAudioBufferSourceNode, options, "playbackRate");
    assignNativeAudioNodeOption(nativeAudioBufferSourceNode, options, "buffer");
    assignNativeAudioNodeOption(nativeAudioBufferSourceNode, options, "loop");
    assignNativeAudioNodeOption(nativeAudioBufferSourceNode, options, "loopEnd");
    assignNativeAudioNodeOption(nativeAudioBufferSourceNode, options, "loopStart");
    if (!cacheTestResult2(testAudioBufferSourceNodeStartMethodConsecutiveCallsSupport2, () => testAudioBufferSourceNodeStartMethodConsecutiveCallsSupport2(nativeContext))) {
      wrapAudioBufferSourceNodeStartMethodConsecutiveCalls(nativeAudioBufferSourceNode);
    }
    if (!cacheTestResult2(testAudioBufferSourceNodeStartMethodOffsetClampingSupport2, () => testAudioBufferSourceNodeStartMethodOffsetClampingSupport2(nativeContext))) {
      wrapAudioBufferSourceNodeStartMethodOffsetClampling(nativeAudioBufferSourceNode);
    }
    if (!cacheTestResult2(testAudioBufferSourceNodeStopMethodNullifiedBufferSupport2, () => testAudioBufferSourceNodeStopMethodNullifiedBufferSupport2(nativeContext))) {
      wrapAudioBufferSourceNodeStopMethodNullifiedBuffer(nativeAudioBufferSourceNode, nativeContext);
    }
    if (!cacheTestResult2(testAudioScheduledSourceNodeStartMethodNegativeParametersSupport2, () => testAudioScheduledSourceNodeStartMethodNegativeParametersSupport2(nativeContext))) {
      wrapAudioScheduledSourceNodeStartMethodNegativeParameters(nativeAudioBufferSourceNode);
    }
    if (!cacheTestResult2(testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport2, () => testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport2(nativeContext))) {
      wrapAudioScheduledSourceNodeStopMethodConsecutiveCalls2(nativeAudioBufferSourceNode, nativeContext);
    }
    if (!cacheTestResult2(testAudioScheduledSourceNodeStopMethodNegativeParametersSupport2, () => testAudioScheduledSourceNodeStopMethodNegativeParametersSupport2(nativeContext))) {
      wrapAudioScheduledSourceNodeStopMethodNegativeParameters(nativeAudioBufferSourceNode);
    }
    addSilentConnection2(nativeContext, nativeAudioBufferSourceNode);
    return nativeAudioBufferSourceNode;
  };
};
const createNativeAudioContextConstructor = (window2) => {
  if (window2 === null) {
    return null;
  }
  if (window2.hasOwnProperty("AudioContext")) {
    return window2.AudioContext;
  }
  return window2.hasOwnProperty("webkitAudioContext") ? window2.webkitAudioContext : null;
};
const createNativeAudioDestinationNodeFactory = (createNativeGainNode2, overwriteAccessors2) => {
  return (nativeContext, channelCount, isNodeOfNativeOfflineAudioContext) => {
    const nativeAudioDestinationNode = nativeContext.destination;
    if (nativeAudioDestinationNode.channelCount !== channelCount) {
      try {
        nativeAudioDestinationNode.channelCount = channelCount;
      } catch (e) {
      }
    }
    if (isNodeOfNativeOfflineAudioContext && nativeAudioDestinationNode.channelCountMode !== "explicit") {
      nativeAudioDestinationNode.channelCountMode = "explicit";
    }
    if (nativeAudioDestinationNode.maxChannelCount === 0) {
      Object.defineProperty(nativeAudioDestinationNode, "maxChannelCount", {
        value: channelCount
      });
    }
    const gainNode = createNativeGainNode2(nativeContext, {
      channelCount,
      channelCountMode: nativeAudioDestinationNode.channelCountMode,
      channelInterpretation: nativeAudioDestinationNode.channelInterpretation,
      gain: 1
    });
    overwriteAccessors2(gainNode, "channelCount", (get) => () => get.call(gainNode), (set) => (value) => {
      set.call(gainNode, value);
      try {
        nativeAudioDestinationNode.channelCount = value;
      } catch (err) {
        if (value > nativeAudioDestinationNode.maxChannelCount) {
          throw err;
        }
      }
    });
    overwriteAccessors2(gainNode, "channelCountMode", (get) => () => get.call(gainNode), (set) => (value) => {
      set.call(gainNode, value);
      nativeAudioDestinationNode.channelCountMode = value;
    });
    overwriteAccessors2(gainNode, "channelInterpretation", (get) => () => get.call(gainNode), (set) => (value) => {
      set.call(gainNode, value);
      nativeAudioDestinationNode.channelInterpretation = value;
    });
    Object.defineProperty(gainNode, "maxChannelCount", {
      get: () => nativeAudioDestinationNode.maxChannelCount
    });
    gainNode.connect(nativeAudioDestinationNode);
    return gainNode;
  };
};
const createNativeAudioWorkletNodeConstructor = (window2) => {
  if (window2 === null) {
    return null;
  }
  return window2.hasOwnProperty("AudioWorkletNode") ? window2.AudioWorkletNode : null;
};
const testClonabilityOfAudioWorkletNodeOptions = (audioWorkletNodeOptions) => {
  const { port1 } = new MessageChannel();
  try {
    port1.postMessage(audioWorkletNodeOptions);
  } finally {
    port1.close();
  }
};
const createNativeAudioWorkletNodeFactory = (createInvalidStateError2, createNativeAudioWorkletNodeFaker2, createNativeGainNode2, createNotSupportedError2, monitorConnections2) => {
  return (nativeContext, baseLatency, nativeAudioWorkletNodeConstructor2, name, processorConstructor, options) => {
    if (nativeAudioWorkletNodeConstructor2 !== null) {
      try {
        const nativeAudioWorkletNode = new nativeAudioWorkletNodeConstructor2(nativeContext, name, options);
        const patchedEventListeners = /* @__PURE__ */ new Map();
        let onprocessorerror = null;
        Object.defineProperties(nativeAudioWorkletNode, {
          channelCount: {
            get: () => options.channelCount,
            set: () => {
              throw createInvalidStateError2();
            }
          },
          channelCountMode: {
            get: () => "explicit",
            set: () => {
              throw createInvalidStateError2();
            }
          },
          onprocessorerror: {
            get: () => onprocessorerror,
            set: (value) => {
              if (typeof onprocessorerror === "function") {
                nativeAudioWorkletNode.removeEventListener("processorerror", onprocessorerror);
              }
              onprocessorerror = typeof value === "function" ? value : null;
              if (typeof onprocessorerror === "function") {
                nativeAudioWorkletNode.addEventListener("processorerror", onprocessorerror);
              }
            }
          }
        });
        nativeAudioWorkletNode.addEventListener = /* @__PURE__ */ ((addEventListener) => {
          return (...args) => {
            if (args[0] === "processorerror") {
              const unpatchedEventListener = typeof args[1] === "function" ? args[1] : typeof args[1] === "object" && args[1] !== null && typeof args[1].handleEvent === "function" ? args[1].handleEvent : null;
              if (unpatchedEventListener !== null) {
                const patchedEventListener = patchedEventListeners.get(args[1]);
                if (patchedEventListener !== void 0) {
                  args[1] = patchedEventListener;
                } else {
                  args[1] = (event) => {
                    if (event.type === "error") {
                      Object.defineProperties(event, {
                        type: { value: "processorerror" }
                      });
                      unpatchedEventListener(event);
                    } else {
                      unpatchedEventListener(new ErrorEvent(args[0], __spreadValues({}, event)));
                    }
                  };
                  patchedEventListeners.set(unpatchedEventListener, args[1]);
                }
              }
            }
            addEventListener.call(nativeAudioWorkletNode, "error", args[1], args[2]);
            return addEventListener.call(nativeAudioWorkletNode, ...args);
          };
        })(nativeAudioWorkletNode.addEventListener);
        nativeAudioWorkletNode.removeEventListener = /* @__PURE__ */ ((removeEventListener) => {
          return (...args) => {
            if (args[0] === "processorerror") {
              const patchedEventListener = patchedEventListeners.get(args[1]);
              if (patchedEventListener !== void 0) {
                patchedEventListeners.delete(args[1]);
                args[1] = patchedEventListener;
              }
            }
            removeEventListener.call(nativeAudioWorkletNode, "error", args[1], args[2]);
            return removeEventListener.call(nativeAudioWorkletNode, args[0], args[1], args[2]);
          };
        })(nativeAudioWorkletNode.removeEventListener);
        if (options.numberOfOutputs !== 0) {
          const nativeGainNode = createNativeGainNode2(nativeContext, {
            channelCount: 1,
            channelCountMode: "explicit",
            channelInterpretation: "discrete",
            gain: 0
          });
          nativeAudioWorkletNode.connect(nativeGainNode).connect(nativeContext.destination);
          const whenConnected = () => nativeGainNode.disconnect();
          const whenDisconnected = () => nativeGainNode.connect(nativeContext.destination);
          return monitorConnections2(nativeAudioWorkletNode, whenConnected, whenDisconnected);
        }
        return nativeAudioWorkletNode;
      } catch (err) {
        if (err.code === 11) {
          throw createNotSupportedError2();
        }
        throw err;
      }
    }
    if (processorConstructor === void 0) {
      throw createNotSupportedError2();
    }
    testClonabilityOfAudioWorkletNodeOptions(options);
    return createNativeAudioWorkletNodeFaker2(nativeContext, baseLatency, processorConstructor, options);
  };
};
const computeBufferSize = (baseLatency, sampleRate) => {
  if (baseLatency === null) {
    return 512;
  }
  return Math.max(512, Math.min(16384, Math.pow(2, Math.round(Math.log2(baseLatency * sampleRate)))));
};
const cloneAudioWorkletNodeOptions = (audioWorkletNodeOptions) => {
  return new Promise((resolve, reject) => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = ({ data }) => {
      port1.close();
      port2.close();
      resolve(data);
    };
    port1.onmessageerror = ({ data }) => {
      port1.close();
      port2.close();
      reject(data);
    };
    port2.postMessage(audioWorkletNodeOptions);
  });
};
const createAudioWorkletProcessorPromise = (processorConstructor, audioWorkletNodeOptions) => __async(void 0, null, function* () {
  const clonedAudioWorkletNodeOptions = yield cloneAudioWorkletNodeOptions(audioWorkletNodeOptions);
  return new processorConstructor(clonedAudioWorkletNodeOptions);
});
const createAudioWorkletProcessor = (nativeContext, nativeAudioWorkletNode, processorConstructor, audioWorkletNodeOptions) => {
  let nodeToProcessorMap = NODE_TO_PROCESSOR_MAPS.get(nativeContext);
  if (nodeToProcessorMap === void 0) {
    nodeToProcessorMap = /* @__PURE__ */ new WeakMap();
    NODE_TO_PROCESSOR_MAPS.set(nativeContext, nodeToProcessorMap);
  }
  const audioWorkletProcessorPromise = createAudioWorkletProcessorPromise(processorConstructor, audioWorkletNodeOptions);
  nodeToProcessorMap.set(nativeAudioWorkletNode, audioWorkletProcessorPromise);
  return audioWorkletProcessorPromise;
};
const createNativeAudioWorkletNodeFakerFactory = (connectMultipleOutputs2, createIndexSizeError2, createInvalidStateError2, createNativeChannelMergerNode2, createNativeChannelSplitterNode2, createNativeConstantSourceNode2, createNativeGainNode2, createNativeScriptProcessorNode2, createNotSupportedError2, disconnectMultipleOutputs2, exposeCurrentFrameAndCurrentTime2, getActiveAudioWorkletNodeInputs2, monitorConnections2) => {
  return (nativeContext, baseLatency, processorConstructor, options) => {
    if (options.numberOfInputs === 0 && options.numberOfOutputs === 0) {
      throw createNotSupportedError2();
    }
    const outputChannelCount = Array.isArray(options.outputChannelCount) ? options.outputChannelCount : Array.from(options.outputChannelCount);
    if (outputChannelCount.some((channelCount) => channelCount < 1)) {
      throw createNotSupportedError2();
    }
    if (outputChannelCount.length !== options.numberOfOutputs) {
      throw createIndexSizeError2();
    }
    if (options.channelCountMode !== "explicit") {
      throw createNotSupportedError2();
    }
    const numberOfInputChannels = options.channelCount * options.numberOfInputs;
    const numberOfOutputChannels = outputChannelCount.reduce((sum, value) => sum + value, 0);
    const numberOfParameters = processorConstructor.parameterDescriptors === void 0 ? 0 : processorConstructor.parameterDescriptors.length;
    if (numberOfInputChannels + numberOfParameters > 6 || numberOfOutputChannels > 6) {
      throw createNotSupportedError2();
    }
    const messageChannel = new MessageChannel();
    const gainNodes = [];
    const inputChannelSplitterNodes = [];
    for (let i = 0; i < options.numberOfInputs; i += 1) {
      gainNodes.push(createNativeGainNode2(nativeContext, {
        channelCount: options.channelCount,
        channelCountMode: options.channelCountMode,
        channelInterpretation: options.channelInterpretation,
        gain: 1
      }));
      inputChannelSplitterNodes.push(createNativeChannelSplitterNode2(nativeContext, {
        channelCount: options.channelCount,
        channelCountMode: "explicit",
        channelInterpretation: "discrete",
        numberOfOutputs: options.channelCount
      }));
    }
    const constantSourceNodes = [];
    if (processorConstructor.parameterDescriptors !== void 0) {
      for (const { defaultValue, maxValue, minValue, name } of processorConstructor.parameterDescriptors) {
        const constantSourceNode = createNativeConstantSourceNode2(nativeContext, {
          channelCount: 1,
          channelCountMode: "explicit",
          channelInterpretation: "discrete",
          offset: options.parameterData[name] !== void 0 ? options.parameterData[name] : defaultValue === void 0 ? 0 : defaultValue
        });
        Object.defineProperties(constantSourceNode.offset, {
          defaultValue: {
            get: () => defaultValue === void 0 ? 0 : defaultValue
          },
          maxValue: {
            get: () => maxValue === void 0 ? MOST_POSITIVE_SINGLE_FLOAT : maxValue
          },
          minValue: {
            get: () => minValue === void 0 ? MOST_NEGATIVE_SINGLE_FLOAT : minValue
          }
        });
        constantSourceNodes.push(constantSourceNode);
      }
    }
    const inputChannelMergerNode = createNativeChannelMergerNode2(nativeContext, {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "speakers",
      numberOfInputs: Math.max(1, numberOfInputChannels + numberOfParameters)
    });
    const bufferSize = computeBufferSize(baseLatency, nativeContext.sampleRate);
    const scriptProcessorNode = createNativeScriptProcessorNode2(
      nativeContext,
      bufferSize,
      numberOfInputChannels + numberOfParameters,
      Math.max(1, numberOfOutputChannels)
    );
    const outputChannelSplitterNode = createNativeChannelSplitterNode2(nativeContext, {
      channelCount: Math.max(1, numberOfOutputChannels),
      channelCountMode: "explicit",
      channelInterpretation: "discrete",
      numberOfOutputs: Math.max(1, numberOfOutputChannels)
    });
    const outputChannelMergerNodes = [];
    for (let i = 0; i < options.numberOfOutputs; i += 1) {
      outputChannelMergerNodes.push(createNativeChannelMergerNode2(nativeContext, {
        channelCount: 1,
        channelCountMode: "explicit",
        channelInterpretation: "speakers",
        numberOfInputs: outputChannelCount[i]
      }));
    }
    for (let i = 0; i < options.numberOfInputs; i += 1) {
      gainNodes[i].connect(inputChannelSplitterNodes[i]);
      for (let j = 0; j < options.channelCount; j += 1) {
        inputChannelSplitterNodes[i].connect(inputChannelMergerNode, j, i * options.channelCount + j);
      }
    }
    const parameterMap = new ReadOnlyMap(processorConstructor.parameterDescriptors === void 0 ? [] : processorConstructor.parameterDescriptors.map(({ name }, index2) => {
      const constantSourceNode = constantSourceNodes[index2];
      constantSourceNode.connect(inputChannelMergerNode, 0, numberOfInputChannels + index2);
      constantSourceNode.start(0);
      return [name, constantSourceNode.offset];
    }));
    inputChannelMergerNode.connect(scriptProcessorNode);
    let channelInterpretation = options.channelInterpretation;
    let onprocessorerror = null;
    const outputAudioNodes = options.numberOfOutputs === 0 ? [scriptProcessorNode] : outputChannelMergerNodes;
    const nativeAudioWorkletNodeFaker = {
      get bufferSize() {
        return bufferSize;
      },
      get channelCount() {
        return options.channelCount;
      },
      set channelCount(_) {
        throw createInvalidStateError2();
      },
      get channelCountMode() {
        return options.channelCountMode;
      },
      set channelCountMode(_) {
        throw createInvalidStateError2();
      },
      get channelInterpretation() {
        return channelInterpretation;
      },
      set channelInterpretation(value) {
        for (const gainNode of gainNodes) {
          gainNode.channelInterpretation = value;
        }
        channelInterpretation = value;
      },
      get context() {
        return scriptProcessorNode.context;
      },
      get inputs() {
        return gainNodes;
      },
      get numberOfInputs() {
        return options.numberOfInputs;
      },
      get numberOfOutputs() {
        return options.numberOfOutputs;
      },
      get onprocessorerror() {
        return onprocessorerror;
      },
      set onprocessorerror(value) {
        if (typeof onprocessorerror === "function") {
          nativeAudioWorkletNodeFaker.removeEventListener("processorerror", onprocessorerror);
        }
        onprocessorerror = typeof value === "function" ? value : null;
        if (typeof onprocessorerror === "function") {
          nativeAudioWorkletNodeFaker.addEventListener("processorerror", onprocessorerror);
        }
      },
      get parameters() {
        return parameterMap;
      },
      get port() {
        return messageChannel.port2;
      },
      addEventListener(...args) {
        return scriptProcessorNode.addEventListener(args[0], args[1], args[2]);
      },
      connect: connectMultipleOutputs2.bind(null, outputAudioNodes),
      disconnect: disconnectMultipleOutputs2.bind(null, outputAudioNodes),
      dispatchEvent(...args) {
        return scriptProcessorNode.dispatchEvent(args[0]);
      },
      removeEventListener(...args) {
        return scriptProcessorNode.removeEventListener(args[0], args[1], args[2]);
      }
    };
    const patchedEventListeners = /* @__PURE__ */ new Map();
    messageChannel.port1.addEventListener = /* @__PURE__ */ ((addEventListener) => {
      return (...args) => {
        if (args[0] === "message") {
          const unpatchedEventListener = typeof args[1] === "function" ? args[1] : typeof args[1] === "object" && args[1] !== null && typeof args[1].handleEvent === "function" ? args[1].handleEvent : null;
          if (unpatchedEventListener !== null) {
            const patchedEventListener = patchedEventListeners.get(args[1]);
            if (patchedEventListener !== void 0) {
              args[1] = patchedEventListener;
            } else {
              args[1] = (event) => {
                exposeCurrentFrameAndCurrentTime2(nativeContext.currentTime, nativeContext.sampleRate, () => unpatchedEventListener(event));
              };
              patchedEventListeners.set(unpatchedEventListener, args[1]);
            }
          }
        }
        return addEventListener.call(messageChannel.port1, args[0], args[1], args[2]);
      };
    })(messageChannel.port1.addEventListener);
    messageChannel.port1.removeEventListener = /* @__PURE__ */ ((removeEventListener) => {
      return (...args) => {
        if (args[0] === "message") {
          const patchedEventListener = patchedEventListeners.get(args[1]);
          if (patchedEventListener !== void 0) {
            patchedEventListeners.delete(args[1]);
            args[1] = patchedEventListener;
          }
        }
        return removeEventListener.call(messageChannel.port1, args[0], args[1], args[2]);
      };
    })(messageChannel.port1.removeEventListener);
    let onmessage = null;
    Object.defineProperty(messageChannel.port1, "onmessage", {
      get: () => onmessage,
      set: (value) => {
        if (typeof onmessage === "function") {
          messageChannel.port1.removeEventListener("message", onmessage);
        }
        onmessage = typeof value === "function" ? value : null;
        if (typeof onmessage === "function") {
          messageChannel.port1.addEventListener("message", onmessage);
          messageChannel.port1.start();
        }
      }
    });
    processorConstructor.prototype.port = messageChannel.port1;
    let audioWorkletProcessor = null;
    const audioWorkletProcessorPromise = createAudioWorkletProcessor(nativeContext, nativeAudioWorkletNodeFaker, processorConstructor, options);
    audioWorkletProcessorPromise.then((dWrkltPrcssr) => audioWorkletProcessor = dWrkltPrcssr);
    const inputs = createNestedArrays(options.numberOfInputs, options.channelCount);
    const outputs = createNestedArrays(options.numberOfOutputs, outputChannelCount);
    const parameters = processorConstructor.parameterDescriptors === void 0 ? [] : processorConstructor.parameterDescriptors.reduce((prmtrs, { name }) => __spreadProps(__spreadValues({}, prmtrs), { [name]: new Float32Array(128) }), {});
    let isActive = true;
    const disconnectOutputsGraph = () => {
      if (options.numberOfOutputs > 0) {
        scriptProcessorNode.disconnect(outputChannelSplitterNode);
      }
      for (let i = 0, outputChannelSplitterNodeOutput = 0; i < options.numberOfOutputs; i += 1) {
        const outputChannelMergerNode = outputChannelMergerNodes[i];
        for (let j = 0; j < outputChannelCount[i]; j += 1) {
          outputChannelSplitterNode.disconnect(outputChannelMergerNode, outputChannelSplitterNodeOutput + j, j);
        }
        outputChannelSplitterNodeOutput += outputChannelCount[i];
      }
    };
    const activeInputIndexes = /* @__PURE__ */ new Map();
    scriptProcessorNode.onaudioprocess = ({ inputBuffer, outputBuffer }) => {
      if (audioWorkletProcessor !== null) {
        const activeInputs = getActiveAudioWorkletNodeInputs2(nativeAudioWorkletNodeFaker);
        for (let i = 0; i < bufferSize; i += 128) {
          for (let j = 0; j < options.numberOfInputs; j += 1) {
            for (let k = 0; k < options.channelCount; k += 1) {
              copyFromChannel(inputBuffer, inputs[j], k, k, i);
            }
          }
          if (processorConstructor.parameterDescriptors !== void 0) {
            processorConstructor.parameterDescriptors.forEach(({ name }, index2) => {
              copyFromChannel(inputBuffer, parameters, name, numberOfInputChannels + index2, i);
            });
          }
          for (let j = 0; j < options.numberOfInputs; j += 1) {
            for (let k = 0; k < outputChannelCount[j]; k += 1) {
              if (outputs[j][k].byteLength === 0) {
                outputs[j][k] = new Float32Array(128);
              }
            }
          }
          try {
            const potentiallyEmptyInputs = inputs.map((input, index2) => {
              const activeInput = activeInputs[index2];
              if (activeInput.size > 0) {
                activeInputIndexes.set(index2, bufferSize / 128);
                return input;
              }
              const count = activeInputIndexes.get(index2);
              if (count === void 0) {
                return [];
              }
              if (input.every((channelData) => channelData.every((sample) => sample === 0))) {
                if (count === 1) {
                  activeInputIndexes.delete(index2);
                } else {
                  activeInputIndexes.set(index2, count - 1);
                }
              }
              return input;
            });
            const activeSourceFlag = exposeCurrentFrameAndCurrentTime2(nativeContext.currentTime + i / nativeContext.sampleRate, nativeContext.sampleRate, () => audioWorkletProcessor.process(potentiallyEmptyInputs, outputs, parameters));
            isActive = activeSourceFlag;
            for (let j = 0, outputChannelSplitterNodeOutput = 0; j < options.numberOfOutputs; j += 1) {
              for (let k = 0; k < outputChannelCount[j]; k += 1) {
                copyToChannel(outputBuffer, outputs[j], k, outputChannelSplitterNodeOutput + k, i);
              }
              outputChannelSplitterNodeOutput += outputChannelCount[j];
            }
          } catch (error) {
            isActive = false;
            nativeAudioWorkletNodeFaker.dispatchEvent(new ErrorEvent("processorerror", {
              colno: error.colno,
              filename: error.filename,
              lineno: error.lineno,
              message: error.message
            }));
          }
          if (!isActive) {
            for (let j = 0; j < options.numberOfInputs; j += 1) {
              gainNodes[j].disconnect(inputChannelSplitterNodes[j]);
              for (let k = 0; k < options.channelCount; k += 1) {
                inputChannelSplitterNodes[i].disconnect(inputChannelMergerNode, k, j * options.channelCount + k);
              }
            }
            if (processorConstructor.parameterDescriptors !== void 0) {
              const length = processorConstructor.parameterDescriptors.length;
              for (let j = 0; j < length; j += 1) {
                const constantSourceNode = constantSourceNodes[j];
                constantSourceNode.disconnect(inputChannelMergerNode, 0, numberOfInputChannels + j);
                constantSourceNode.stop();
              }
            }
            inputChannelMergerNode.disconnect(scriptProcessorNode);
            scriptProcessorNode.onaudioprocess = null;
            if (isConnected) {
              disconnectOutputsGraph();
            } else {
              disconnectFakeGraph();
            }
            break;
          }
        }
      }
    };
    let isConnected = false;
    const nativeGainNode = createNativeGainNode2(nativeContext, {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "discrete",
      gain: 0
    });
    const connectFakeGraph = () => scriptProcessorNode.connect(nativeGainNode).connect(nativeContext.destination);
    const disconnectFakeGraph = () => {
      scriptProcessorNode.disconnect(nativeGainNode);
      nativeGainNode.disconnect();
    };
    const whenConnected = () => {
      if (isActive) {
        disconnectFakeGraph();
        if (options.numberOfOutputs > 0) {
          scriptProcessorNode.connect(outputChannelSplitterNode);
        }
        for (let i = 0, outputChannelSplitterNodeOutput = 0; i < options.numberOfOutputs; i += 1) {
          const outputChannelMergerNode = outputChannelMergerNodes[i];
          for (let j = 0; j < outputChannelCount[i]; j += 1) {
            outputChannelSplitterNode.connect(outputChannelMergerNode, outputChannelSplitterNodeOutput + j, j);
          }
          outputChannelSplitterNodeOutput += outputChannelCount[i];
        }
      }
      isConnected = true;
    };
    const whenDisconnected = () => {
      if (isActive) {
        connectFakeGraph();
        disconnectOutputsGraph();
      }
      isConnected = false;
    };
    connectFakeGraph();
    return monitorConnections2(nativeAudioWorkletNodeFaker, whenConnected, whenDisconnected);
  };
};
const createNativeBiquadFilterNode = (nativeContext, options) => {
  const nativeBiquadFilterNode = nativeContext.createBiquadFilter();
  assignNativeAudioNodeOptions(nativeBiquadFilterNode, options);
  assignNativeAudioNodeAudioParamValue(nativeBiquadFilterNode, options, "Q");
  assignNativeAudioNodeAudioParamValue(nativeBiquadFilterNode, options, "detune");
  assignNativeAudioNodeAudioParamValue(nativeBiquadFilterNode, options, "frequency");
  assignNativeAudioNodeAudioParamValue(nativeBiquadFilterNode, options, "gain");
  assignNativeAudioNodeOption(nativeBiquadFilterNode, options, "type");
  return nativeBiquadFilterNode;
};
const createNativeChannelMergerNodeFactory = (nativeAudioContextConstructor2, wrapChannelMergerNode2) => {
  return (nativeContext, options) => {
    const nativeChannelMergerNode = nativeContext.createChannelMerger(options.numberOfInputs);
    if (nativeAudioContextConstructor2 !== null && nativeAudioContextConstructor2.name === "webkitAudioContext") {
      wrapChannelMergerNode2(nativeContext, nativeChannelMergerNode);
    }
    assignNativeAudioNodeOptions(nativeChannelMergerNode, options);
    return nativeChannelMergerNode;
  };
};
const wrapChannelSplitterNode = (channelSplitterNode) => {
  const channelCount = channelSplitterNode.numberOfOutputs;
  Object.defineProperty(channelSplitterNode, "channelCount", {
    get: () => channelCount,
    set: (value) => {
      if (value !== channelCount) {
        throw createInvalidStateError();
      }
    }
  });
  Object.defineProperty(channelSplitterNode, "channelCountMode", {
    get: () => "explicit",
    set: (value) => {
      if (value !== "explicit") {
        throw createInvalidStateError();
      }
    }
  });
  Object.defineProperty(channelSplitterNode, "channelInterpretation", {
    get: () => "discrete",
    set: (value) => {
      if (value !== "discrete") {
        throw createInvalidStateError();
      }
    }
  });
};
const createNativeChannelSplitterNode = (nativeContext, options) => {
  const nativeChannelSplitterNode = nativeContext.createChannelSplitter(options.numberOfOutputs);
  assignNativeAudioNodeOptions(nativeChannelSplitterNode, options);
  wrapChannelSplitterNode(nativeChannelSplitterNode);
  return nativeChannelSplitterNode;
};
const createNativeConstantSourceNodeFactory = (addSilentConnection2, cacheTestResult2, createNativeConstantSourceNodeFaker2, testAudioScheduledSourceNodeStartMethodNegativeParametersSupport2, testAudioScheduledSourceNodeStopMethodNegativeParametersSupport2) => {
  return (nativeContext, options) => {
    if (nativeContext.createConstantSource === void 0) {
      return createNativeConstantSourceNodeFaker2(nativeContext, options);
    }
    const nativeConstantSourceNode = nativeContext.createConstantSource();
    assignNativeAudioNodeOptions(nativeConstantSourceNode, options);
    assignNativeAudioNodeAudioParamValue(nativeConstantSourceNode, options, "offset");
    if (!cacheTestResult2(testAudioScheduledSourceNodeStartMethodNegativeParametersSupport2, () => testAudioScheduledSourceNodeStartMethodNegativeParametersSupport2(nativeContext))) {
      wrapAudioScheduledSourceNodeStartMethodNegativeParameters(nativeConstantSourceNode);
    }
    if (!cacheTestResult2(testAudioScheduledSourceNodeStopMethodNegativeParametersSupport2, () => testAudioScheduledSourceNodeStopMethodNegativeParametersSupport2(nativeContext))) {
      wrapAudioScheduledSourceNodeStopMethodNegativeParameters(nativeConstantSourceNode);
    }
    addSilentConnection2(nativeContext, nativeConstantSourceNode);
    return nativeConstantSourceNode;
  };
};
const interceptConnections = (original, interceptor) => {
  original.connect = interceptor.connect.bind(interceptor);
  original.disconnect = interceptor.disconnect.bind(interceptor);
  return original;
};
const createNativeConstantSourceNodeFakerFactory = (addSilentConnection2, createNativeAudioBufferSourceNode2, createNativeGainNode2, monitorConnections2) => {
  return (nativeContext, _a) => {
    var _b = _a, { offset } = _b, audioNodeOptions = __objRest(_b, ["offset"]);
    const audioBuffer = nativeContext.createBuffer(1, 2, 44100);
    const audioBufferSourceNode = createNativeAudioBufferSourceNode2(nativeContext, {
      buffer: null,
      channelCount: 2,
      channelCountMode: "max",
      channelInterpretation: "speakers",
      loop: false,
      loopEnd: 0,
      loopStart: 0,
      playbackRate: 1
    });
    const gainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, audioNodeOptions), { gain: offset }));
    const channelData = audioBuffer.getChannelData(0);
    channelData[0] = 1;
    channelData[1] = 1;
    audioBufferSourceNode.buffer = audioBuffer;
    audioBufferSourceNode.loop = true;
    const nativeConstantSourceNodeFaker = {
      get bufferSize() {
        return void 0;
      },
      get channelCount() {
        return gainNode.channelCount;
      },
      set channelCount(value) {
        gainNode.channelCount = value;
      },
      get channelCountMode() {
        return gainNode.channelCountMode;
      },
      set channelCountMode(value) {
        gainNode.channelCountMode = value;
      },
      get channelInterpretation() {
        return gainNode.channelInterpretation;
      },
      set channelInterpretation(value) {
        gainNode.channelInterpretation = value;
      },
      get context() {
        return gainNode.context;
      },
      get inputs() {
        return [];
      },
      get numberOfInputs() {
        return audioBufferSourceNode.numberOfInputs;
      },
      get numberOfOutputs() {
        return gainNode.numberOfOutputs;
      },
      get offset() {
        return gainNode.gain;
      },
      get onended() {
        return audioBufferSourceNode.onended;
      },
      set onended(value) {
        audioBufferSourceNode.onended = value;
      },
      addEventListener(...args) {
        return audioBufferSourceNode.addEventListener(args[0], args[1], args[2]);
      },
      dispatchEvent(...args) {
        return audioBufferSourceNode.dispatchEvent(args[0]);
      },
      removeEventListener(...args) {
        return audioBufferSourceNode.removeEventListener(args[0], args[1], args[2]);
      },
      start(when = 0) {
        audioBufferSourceNode.start.call(audioBufferSourceNode, when);
      },
      stop(when = 0) {
        audioBufferSourceNode.stop.call(audioBufferSourceNode, when);
      }
    };
    const whenConnected = () => audioBufferSourceNode.connect(gainNode);
    const whenDisconnected = () => audioBufferSourceNode.disconnect(gainNode);
    addSilentConnection2(nativeContext, audioBufferSourceNode);
    return monitorConnections2(interceptConnections(nativeConstantSourceNodeFaker, gainNode), whenConnected, whenDisconnected);
  };
};
const createNativeConvolverNodeFactory = (createNotSupportedError2, overwriteAccessors2) => {
  return (nativeContext, options) => {
    const nativeConvolverNode = nativeContext.createConvolver();
    assignNativeAudioNodeOptions(nativeConvolverNode, options);
    if (options.disableNormalization === nativeConvolverNode.normalize) {
      nativeConvolverNode.normalize = !options.disableNormalization;
    }
    assignNativeAudioNodeOption(nativeConvolverNode, options, "buffer");
    if (options.channelCount > 2) {
      throw createNotSupportedError2();
    }
    overwriteAccessors2(nativeConvolverNode, "channelCount", (get) => () => get.call(nativeConvolverNode), (set) => (value) => {
      if (value > 2) {
        throw createNotSupportedError2();
      }
      return set.call(nativeConvolverNode, value);
    });
    if (options.channelCountMode === "max") {
      throw createNotSupportedError2();
    }
    overwriteAccessors2(nativeConvolverNode, "channelCountMode", (get) => () => get.call(nativeConvolverNode), (set) => (value) => {
      if (value === "max") {
        throw createNotSupportedError2();
      }
      return set.call(nativeConvolverNode, value);
    });
    return nativeConvolverNode;
  };
};
const createNativeDelayNode = (nativeContext, options) => {
  const nativeDelayNode = nativeContext.createDelay(options.maxDelayTime);
  assignNativeAudioNodeOptions(nativeDelayNode, options);
  assignNativeAudioNodeAudioParamValue(nativeDelayNode, options, "delayTime");
  return nativeDelayNode;
};
const createNativeDynamicsCompressorNodeFactory = (createNotSupportedError2) => {
  return (nativeContext, options) => {
    const nativeDynamicsCompressorNode = nativeContext.createDynamicsCompressor();
    assignNativeAudioNodeOptions(nativeDynamicsCompressorNode, options);
    if (options.channelCount > 2) {
      throw createNotSupportedError2();
    }
    if (options.channelCountMode === "max") {
      throw createNotSupportedError2();
    }
    assignNativeAudioNodeAudioParamValue(nativeDynamicsCompressorNode, options, "attack");
    assignNativeAudioNodeAudioParamValue(nativeDynamicsCompressorNode, options, "knee");
    assignNativeAudioNodeAudioParamValue(nativeDynamicsCompressorNode, options, "ratio");
    assignNativeAudioNodeAudioParamValue(nativeDynamicsCompressorNode, options, "release");
    assignNativeAudioNodeAudioParamValue(nativeDynamicsCompressorNode, options, "threshold");
    return nativeDynamicsCompressorNode;
  };
};
const createNativeGainNode = (nativeContext, options) => {
  const nativeGainNode = nativeContext.createGain();
  assignNativeAudioNodeOptions(nativeGainNode, options);
  assignNativeAudioNodeAudioParamValue(nativeGainNode, options, "gain");
  return nativeGainNode;
};
const createNativeIIRFilterNodeFactory = (createNativeIIRFilterNodeFaker2) => {
  return (nativeContext, baseLatency, options) => {
    if (nativeContext.createIIRFilter === void 0) {
      return createNativeIIRFilterNodeFaker2(nativeContext, baseLatency, options);
    }
    const nativeIIRFilterNode = nativeContext.createIIRFilter(options.feedforward, options.feedback);
    assignNativeAudioNodeOptions(nativeIIRFilterNode, options);
    return nativeIIRFilterNode;
  };
};
function divide(a, b) {
  const denominator = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / denominator, (a[1] * b[0] - a[0] * b[1]) / denominator];
}
function multiply(a, b) {
  return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
}
function evaluatePolynomial(coefficient, z) {
  let result = [0, 0];
  for (let i = coefficient.length - 1; i >= 0; i -= 1) {
    result = multiply(result, z);
    result[0] += coefficient[i];
  }
  return result;
}
const createNativeIIRFilterNodeFakerFactory = (createInvalidAccessError2, createInvalidStateError2, createNativeScriptProcessorNode2, createNotSupportedError2) => {
  return (nativeContext, baseLatency, { channelCount, channelCountMode, channelInterpretation, feedback, feedforward }) => {
    const bufferSize = computeBufferSize(baseLatency, nativeContext.sampleRate);
    const convertedFeedback = feedback instanceof Float64Array ? feedback : new Float64Array(feedback);
    const convertedFeedforward = feedforward instanceof Float64Array ? feedforward : new Float64Array(feedforward);
    const feedbackLength = convertedFeedback.length;
    const feedforwardLength = convertedFeedforward.length;
    const minLength = Math.min(feedbackLength, feedforwardLength);
    if (feedbackLength === 0 || feedbackLength > 20) {
      throw createNotSupportedError2();
    }
    if (convertedFeedback[0] === 0) {
      throw createInvalidStateError2();
    }
    if (feedforwardLength === 0 || feedforwardLength > 20) {
      throw createNotSupportedError2();
    }
    if (convertedFeedforward[0] === 0) {
      throw createInvalidStateError2();
    }
    if (convertedFeedback[0] !== 1) {
      for (let i = 0; i < feedforwardLength; i += 1) {
        convertedFeedforward[i] /= convertedFeedback[0];
      }
      for (let i = 1; i < feedbackLength; i += 1) {
        convertedFeedback[i] /= convertedFeedback[0];
      }
    }
    const scriptProcessorNode = createNativeScriptProcessorNode2(nativeContext, bufferSize, channelCount, channelCount);
    scriptProcessorNode.channelCount = channelCount;
    scriptProcessorNode.channelCountMode = channelCountMode;
    scriptProcessorNode.channelInterpretation = channelInterpretation;
    const bufferLength = 32;
    const bufferIndexes = [];
    const xBuffers = [];
    const yBuffers = [];
    for (let i = 0; i < channelCount; i += 1) {
      bufferIndexes.push(0);
      const xBuffer = new Float32Array(bufferLength);
      const yBuffer = new Float32Array(bufferLength);
      xBuffer.fill(0);
      yBuffer.fill(0);
      xBuffers.push(xBuffer);
      yBuffers.push(yBuffer);
    }
    scriptProcessorNode.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer;
      const outputBuffer = event.outputBuffer;
      const numberOfChannels = inputBuffer.numberOfChannels;
      for (let i = 0; i < numberOfChannels; i += 1) {
        const input = inputBuffer.getChannelData(i);
        const output = outputBuffer.getChannelData(i);
        bufferIndexes[i] = filterBuffer(convertedFeedback, feedbackLength, convertedFeedforward, feedforwardLength, minLength, xBuffers[i], yBuffers[i], bufferIndexes[i], bufferLength, input, output);
      }
    };
    const nyquist = nativeContext.sampleRate / 2;
    const nativeIIRFilterNodeFaker = {
      get bufferSize() {
        return bufferSize;
      },
      get channelCount() {
        return scriptProcessorNode.channelCount;
      },
      set channelCount(value) {
        scriptProcessorNode.channelCount = value;
      },
      get channelCountMode() {
        return scriptProcessorNode.channelCountMode;
      },
      set channelCountMode(value) {
        scriptProcessorNode.channelCountMode = value;
      },
      get channelInterpretation() {
        return scriptProcessorNode.channelInterpretation;
      },
      set channelInterpretation(value) {
        scriptProcessorNode.channelInterpretation = value;
      },
      get context() {
        return scriptProcessorNode.context;
      },
      get inputs() {
        return [scriptProcessorNode];
      },
      get numberOfInputs() {
        return scriptProcessorNode.numberOfInputs;
      },
      get numberOfOutputs() {
        return scriptProcessorNode.numberOfOutputs;
      },
      addEventListener(...args) {
        return scriptProcessorNode.addEventListener(args[0], args[1], args[2]);
      },
      dispatchEvent(...args) {
        return scriptProcessorNode.dispatchEvent(args[0]);
      },
      getFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
        if (frequencyHz.length !== magResponse.length || magResponse.length !== phaseResponse.length) {
          throw createInvalidAccessError2();
        }
        const length = frequencyHz.length;
        for (let i = 0; i < length; i += 1) {
          const omega = -Math.PI * (frequencyHz[i] / nyquist);
          const z = [Math.cos(omega), Math.sin(omega)];
          const numerator = evaluatePolynomial(convertedFeedforward, z);
          const denominator = evaluatePolynomial(convertedFeedback, z);
          const response = divide(numerator, denominator);
          magResponse[i] = Math.sqrt(response[0] * response[0] + response[1] * response[1]);
          phaseResponse[i] = Math.atan2(response[1], response[0]);
        }
      },
      removeEventListener(...args) {
        return scriptProcessorNode.removeEventListener(args[0], args[1], args[2]);
      }
    };
    return interceptConnections(nativeIIRFilterNodeFaker, scriptProcessorNode);
  };
};
const createNativeMediaElementAudioSourceNode = (nativeAudioContext, options) => {
  return nativeAudioContext.createMediaElementSource(options.mediaElement);
};
const createNativeMediaStreamAudioDestinationNode = (nativeAudioContext, options) => {
  const nativeMediaStreamAudioDestinationNode = nativeAudioContext.createMediaStreamDestination();
  assignNativeAudioNodeOptions(nativeMediaStreamAudioDestinationNode, options);
  if (nativeMediaStreamAudioDestinationNode.numberOfOutputs === 1) {
    Object.defineProperty(nativeMediaStreamAudioDestinationNode, "numberOfOutputs", { get: () => 0 });
  }
  return nativeMediaStreamAudioDestinationNode;
};
const createNativeMediaStreamAudioSourceNode = (nativeAudioContext, { mediaStream }) => {
  const audioStreamTracks = mediaStream.getAudioTracks();
  audioStreamTracks.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const filteredAudioStreamTracks = audioStreamTracks.slice(0, 1);
  const nativeMediaStreamAudioSourceNode = nativeAudioContext.createMediaStreamSource(new MediaStream(filteredAudioStreamTracks));
  Object.defineProperty(nativeMediaStreamAudioSourceNode, "mediaStream", { value: mediaStream });
  return nativeMediaStreamAudioSourceNode;
};
const createNativeMediaStreamTrackAudioSourceNodeFactory = (createInvalidStateError2, isNativeOfflineAudioContext2) => {
  return (nativeAudioContext, { mediaStreamTrack }) => {
    if (typeof nativeAudioContext.createMediaStreamTrackSource === "function") {
      return nativeAudioContext.createMediaStreamTrackSource(mediaStreamTrack);
    }
    const mediaStream = new MediaStream([mediaStreamTrack]);
    const nativeMediaStreamAudioSourceNode = nativeAudioContext.createMediaStreamSource(mediaStream);
    if (mediaStreamTrack.kind !== "audio") {
      throw createInvalidStateError2();
    }
    if (isNativeOfflineAudioContext2(nativeAudioContext)) {
      throw new TypeError();
    }
    return nativeMediaStreamAudioSourceNode;
  };
};
const createNativeOfflineAudioContextConstructor = (window2) => {
  if (window2 === null) {
    return null;
  }
  if (window2.hasOwnProperty("OfflineAudioContext")) {
    return window2.OfflineAudioContext;
  }
  return window2.hasOwnProperty("webkitOfflineAudioContext") ? window2.webkitOfflineAudioContext : null;
};
const createNativeOscillatorNodeFactory = (addSilentConnection2, cacheTestResult2, testAudioScheduledSourceNodeStartMethodNegativeParametersSupport2, testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport2, testAudioScheduledSourceNodeStopMethodNegativeParametersSupport2, wrapAudioScheduledSourceNodeStopMethodConsecutiveCalls2) => {
  return (nativeContext, options) => {
    const nativeOscillatorNode = nativeContext.createOscillator();
    assignNativeAudioNodeOptions(nativeOscillatorNode, options);
    assignNativeAudioNodeAudioParamValue(nativeOscillatorNode, options, "detune");
    assignNativeAudioNodeAudioParamValue(nativeOscillatorNode, options, "frequency");
    if (options.periodicWave !== void 0) {
      nativeOscillatorNode.setPeriodicWave(options.periodicWave);
    } else {
      assignNativeAudioNodeOption(nativeOscillatorNode, options, "type");
    }
    if (!cacheTestResult2(testAudioScheduledSourceNodeStartMethodNegativeParametersSupport2, () => testAudioScheduledSourceNodeStartMethodNegativeParametersSupport2(nativeContext))) {
      wrapAudioScheduledSourceNodeStartMethodNegativeParameters(nativeOscillatorNode);
    }
    if (!cacheTestResult2(testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport2, () => testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport2(nativeContext))) {
      wrapAudioScheduledSourceNodeStopMethodConsecutiveCalls2(nativeOscillatorNode, nativeContext);
    }
    if (!cacheTestResult2(testAudioScheduledSourceNodeStopMethodNegativeParametersSupport2, () => testAudioScheduledSourceNodeStopMethodNegativeParametersSupport2(nativeContext))) {
      wrapAudioScheduledSourceNodeStopMethodNegativeParameters(nativeOscillatorNode);
    }
    addSilentConnection2(nativeContext, nativeOscillatorNode);
    return nativeOscillatorNode;
  };
};
const createNativePannerNodeFactory = (createNativePannerNodeFaker2) => {
  return (nativeContext, options) => {
    const nativePannerNode = nativeContext.createPanner();
    if (nativePannerNode.orientationX === void 0) {
      return createNativePannerNodeFaker2(nativeContext, options);
    }
    assignNativeAudioNodeOptions(nativePannerNode, options);
    assignNativeAudioNodeAudioParamValue(nativePannerNode, options, "orientationX");
    assignNativeAudioNodeAudioParamValue(nativePannerNode, options, "orientationY");
    assignNativeAudioNodeAudioParamValue(nativePannerNode, options, "orientationZ");
    assignNativeAudioNodeAudioParamValue(nativePannerNode, options, "positionX");
    assignNativeAudioNodeAudioParamValue(nativePannerNode, options, "positionY");
    assignNativeAudioNodeAudioParamValue(nativePannerNode, options, "positionZ");
    assignNativeAudioNodeOption(nativePannerNode, options, "coneInnerAngle");
    assignNativeAudioNodeOption(nativePannerNode, options, "coneOuterAngle");
    assignNativeAudioNodeOption(nativePannerNode, options, "coneOuterGain");
    assignNativeAudioNodeOption(nativePannerNode, options, "distanceModel");
    assignNativeAudioNodeOption(nativePannerNode, options, "maxDistance");
    assignNativeAudioNodeOption(nativePannerNode, options, "panningModel");
    assignNativeAudioNodeOption(nativePannerNode, options, "refDistance");
    assignNativeAudioNodeOption(nativePannerNode, options, "rolloffFactor");
    return nativePannerNode;
  };
};
const createNativePannerNodeFakerFactory = (connectNativeAudioNodeToNativeAudioNode2, createInvalidStateError2, createNativeChannelMergerNode2, createNativeGainNode2, createNativeScriptProcessorNode2, createNativeWaveShaperNode2, createNotSupportedError2, disconnectNativeAudioNodeFromNativeAudioNode2, getFirstSample2, monitorConnections2) => {
  return (nativeContext, _a) => {
    var _b = _a, { coneInnerAngle, coneOuterAngle, coneOuterGain, distanceModel, maxDistance, orientationX, orientationY, orientationZ, panningModel, positionX, positionY, positionZ, refDistance, rolloffFactor } = _b, audioNodeOptions = __objRest(_b, ["coneInnerAngle", "coneOuterAngle", "coneOuterGain", "distanceModel", "maxDistance", "orientationX", "orientationY", "orientationZ", "panningModel", "positionX", "positionY", "positionZ", "refDistance", "rolloffFactor"]);
    const pannerNode = nativeContext.createPanner();
    if (audioNodeOptions.channelCount > 2) {
      throw createNotSupportedError2();
    }
    if (audioNodeOptions.channelCountMode === "max") {
      throw createNotSupportedError2();
    }
    assignNativeAudioNodeOptions(pannerNode, audioNodeOptions);
    const SINGLE_CHANNEL_OPTIONS = {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "discrete"
    };
    const channelMergerNode = createNativeChannelMergerNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), {
      channelInterpretation: "speakers",
      numberOfInputs: 6
    }));
    const inputGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, audioNodeOptions), { gain: 1 }));
    const orientationXGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), { gain: 1 }));
    const orientationYGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), { gain: 0 }));
    const orientationZGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), { gain: 0 }));
    const positionXGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), { gain: 0 }));
    const positionYGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), { gain: 0 }));
    const positionZGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), { gain: 0 }));
    const scriptProcessorNode = createNativeScriptProcessorNode2(nativeContext, 256, 6, 1);
    const waveShaperNode = createNativeWaveShaperNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), {
      curve: new Float32Array([1, 1]),
      oversample: "none"
    }));
    let lastOrientation = [orientationX, orientationY, orientationZ];
    let lastPosition = [positionX, positionY, positionZ];
    const buffer = new Float32Array(1);
    scriptProcessorNode.onaudioprocess = ({ inputBuffer }) => {
      const orientation = [
        getFirstSample2(inputBuffer, buffer, 0),
        getFirstSample2(inputBuffer, buffer, 1),
        getFirstSample2(inputBuffer, buffer, 2)
      ];
      if (orientation.some((value, index2) => value !== lastOrientation[index2])) {
        pannerNode.setOrientation(...orientation);
        lastOrientation = orientation;
      }
      const positon = [
        getFirstSample2(inputBuffer, buffer, 3),
        getFirstSample2(inputBuffer, buffer, 4),
        getFirstSample2(inputBuffer, buffer, 5)
      ];
      if (positon.some((value, index2) => value !== lastPosition[index2])) {
        pannerNode.setPosition(...positon);
        lastPosition = positon;
      }
    };
    Object.defineProperty(orientationYGainNode.gain, "defaultValue", { get: () => 0 });
    Object.defineProperty(orientationZGainNode.gain, "defaultValue", { get: () => 0 });
    Object.defineProperty(positionXGainNode.gain, "defaultValue", { get: () => 0 });
    Object.defineProperty(positionYGainNode.gain, "defaultValue", { get: () => 0 });
    Object.defineProperty(positionZGainNode.gain, "defaultValue", { get: () => 0 });
    const nativePannerNodeFaker = {
      get bufferSize() {
        return void 0;
      },
      get channelCount() {
        return pannerNode.channelCount;
      },
      set channelCount(value) {
        if (value > 2) {
          throw createNotSupportedError2();
        }
        inputGainNode.channelCount = value;
        pannerNode.channelCount = value;
      },
      get channelCountMode() {
        return pannerNode.channelCountMode;
      },
      set channelCountMode(value) {
        if (value === "max") {
          throw createNotSupportedError2();
        }
        inputGainNode.channelCountMode = value;
        pannerNode.channelCountMode = value;
      },
      get channelInterpretation() {
        return pannerNode.channelInterpretation;
      },
      set channelInterpretation(value) {
        inputGainNode.channelInterpretation = value;
        pannerNode.channelInterpretation = value;
      },
      get coneInnerAngle() {
        return pannerNode.coneInnerAngle;
      },
      set coneInnerAngle(value) {
        pannerNode.coneInnerAngle = value;
      },
      get coneOuterAngle() {
        return pannerNode.coneOuterAngle;
      },
      set coneOuterAngle(value) {
        pannerNode.coneOuterAngle = value;
      },
      get coneOuterGain() {
        return pannerNode.coneOuterGain;
      },
      set coneOuterGain(value) {
        if (value < 0 || value > 1) {
          throw createInvalidStateError2();
        }
        pannerNode.coneOuterGain = value;
      },
      get context() {
        return pannerNode.context;
      },
      get distanceModel() {
        return pannerNode.distanceModel;
      },
      set distanceModel(value) {
        pannerNode.distanceModel = value;
      },
      get inputs() {
        return [inputGainNode];
      },
      get maxDistance() {
        return pannerNode.maxDistance;
      },
      set maxDistance(value) {
        if (value < 0) {
          throw new RangeError();
        }
        pannerNode.maxDistance = value;
      },
      get numberOfInputs() {
        return pannerNode.numberOfInputs;
      },
      get numberOfOutputs() {
        return pannerNode.numberOfOutputs;
      },
      get orientationX() {
        return orientationXGainNode.gain;
      },
      get orientationY() {
        return orientationYGainNode.gain;
      },
      get orientationZ() {
        return orientationZGainNode.gain;
      },
      get panningModel() {
        return pannerNode.panningModel;
      },
      set panningModel(value) {
        pannerNode.panningModel = value;
      },
      get positionX() {
        return positionXGainNode.gain;
      },
      get positionY() {
        return positionYGainNode.gain;
      },
      get positionZ() {
        return positionZGainNode.gain;
      },
      get refDistance() {
        return pannerNode.refDistance;
      },
      set refDistance(value) {
        if (value < 0) {
          throw new RangeError();
        }
        pannerNode.refDistance = value;
      },
      get rolloffFactor() {
        return pannerNode.rolloffFactor;
      },
      set rolloffFactor(value) {
        if (value < 0) {
          throw new RangeError();
        }
        pannerNode.rolloffFactor = value;
      },
      addEventListener(...args) {
        return inputGainNode.addEventListener(args[0], args[1], args[2]);
      },
      dispatchEvent(...args) {
        return inputGainNode.dispatchEvent(args[0]);
      },
      removeEventListener(...args) {
        return inputGainNode.removeEventListener(args[0], args[1], args[2]);
      }
    };
    if (coneInnerAngle !== nativePannerNodeFaker.coneInnerAngle) {
      nativePannerNodeFaker.coneInnerAngle = coneInnerAngle;
    }
    if (coneOuterAngle !== nativePannerNodeFaker.coneOuterAngle) {
      nativePannerNodeFaker.coneOuterAngle = coneOuterAngle;
    }
    if (coneOuterGain !== nativePannerNodeFaker.coneOuterGain) {
      nativePannerNodeFaker.coneOuterGain = coneOuterGain;
    }
    if (distanceModel !== nativePannerNodeFaker.distanceModel) {
      nativePannerNodeFaker.distanceModel = distanceModel;
    }
    if (maxDistance !== nativePannerNodeFaker.maxDistance) {
      nativePannerNodeFaker.maxDistance = maxDistance;
    }
    if (orientationX !== nativePannerNodeFaker.orientationX.value) {
      nativePannerNodeFaker.orientationX.value = orientationX;
    }
    if (orientationY !== nativePannerNodeFaker.orientationY.value) {
      nativePannerNodeFaker.orientationY.value = orientationY;
    }
    if (orientationZ !== nativePannerNodeFaker.orientationZ.value) {
      nativePannerNodeFaker.orientationZ.value = orientationZ;
    }
    if (panningModel !== nativePannerNodeFaker.panningModel) {
      nativePannerNodeFaker.panningModel = panningModel;
    }
    if (positionX !== nativePannerNodeFaker.positionX.value) {
      nativePannerNodeFaker.positionX.value = positionX;
    }
    if (positionY !== nativePannerNodeFaker.positionY.value) {
      nativePannerNodeFaker.positionY.value = positionY;
    }
    if (positionZ !== nativePannerNodeFaker.positionZ.value) {
      nativePannerNodeFaker.positionZ.value = positionZ;
    }
    if (refDistance !== nativePannerNodeFaker.refDistance) {
      nativePannerNodeFaker.refDistance = refDistance;
    }
    if (rolloffFactor !== nativePannerNodeFaker.rolloffFactor) {
      nativePannerNodeFaker.rolloffFactor = rolloffFactor;
    }
    if (lastOrientation[0] !== 1 || lastOrientation[1] !== 0 || lastOrientation[2] !== 0) {
      pannerNode.setOrientation(...lastOrientation);
    }
    if (lastPosition[0] !== 0 || lastPosition[1] !== 0 || lastPosition[2] !== 0) {
      pannerNode.setPosition(...lastPosition);
    }
    const whenConnected = () => {
      inputGainNode.connect(pannerNode);
      connectNativeAudioNodeToNativeAudioNode2(inputGainNode, waveShaperNode, 0, 0);
      waveShaperNode.connect(orientationXGainNode).connect(channelMergerNode, 0, 0);
      waveShaperNode.connect(orientationYGainNode).connect(channelMergerNode, 0, 1);
      waveShaperNode.connect(orientationZGainNode).connect(channelMergerNode, 0, 2);
      waveShaperNode.connect(positionXGainNode).connect(channelMergerNode, 0, 3);
      waveShaperNode.connect(positionYGainNode).connect(channelMergerNode, 0, 4);
      waveShaperNode.connect(positionZGainNode).connect(channelMergerNode, 0, 5);
      channelMergerNode.connect(scriptProcessorNode).connect(nativeContext.destination);
    };
    const whenDisconnected = () => {
      inputGainNode.disconnect(pannerNode);
      disconnectNativeAudioNodeFromNativeAudioNode2(inputGainNode, waveShaperNode, 0, 0);
      waveShaperNode.disconnect(orientationXGainNode);
      orientationXGainNode.disconnect(channelMergerNode);
      waveShaperNode.disconnect(orientationYGainNode);
      orientationYGainNode.disconnect(channelMergerNode);
      waveShaperNode.disconnect(orientationZGainNode);
      orientationZGainNode.disconnect(channelMergerNode);
      waveShaperNode.disconnect(positionXGainNode);
      positionXGainNode.disconnect(channelMergerNode);
      waveShaperNode.disconnect(positionYGainNode);
      positionYGainNode.disconnect(channelMergerNode);
      waveShaperNode.disconnect(positionZGainNode);
      positionZGainNode.disconnect(channelMergerNode);
      channelMergerNode.disconnect(scriptProcessorNode);
      scriptProcessorNode.disconnect(nativeContext.destination);
    };
    return monitorConnections2(interceptConnections(nativePannerNodeFaker, pannerNode), whenConnected, whenDisconnected);
  };
};
const createNativePeriodicWaveFactory = (createIndexSizeError2) => {
  return (nativeContext, { disableNormalization, imag, real }) => {
    const convertedImag = imag instanceof Float32Array ? imag : new Float32Array(imag);
    const convertedReal = real instanceof Float32Array ? real : new Float32Array(real);
    const nativePeriodicWave = nativeContext.createPeriodicWave(convertedReal, convertedImag, { disableNormalization });
    if (Array.from(imag).length < 2) {
      throw createIndexSizeError2();
    }
    return nativePeriodicWave;
  };
};
const createNativeScriptProcessorNode = (nativeContext, bufferSize, numberOfInputChannels, numberOfOutputChannels) => {
  return nativeContext.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
};
const createNativeStereoPannerNodeFactory = (createNativeStereoPannerNodeFaker, createNotSupportedError2) => {
  return (nativeContext, options) => {
    const channelCountMode = options.channelCountMode;
    if (channelCountMode === "clamped-max") {
      throw createNotSupportedError2();
    }
    if (nativeContext.createStereoPanner === void 0) {
      return createNativeStereoPannerNodeFaker(nativeContext, options);
    }
    const nativeStereoPannerNode = nativeContext.createStereoPanner();
    assignNativeAudioNodeOptions(nativeStereoPannerNode, options);
    assignNativeAudioNodeAudioParamValue(nativeStereoPannerNode, options, "pan");
    Object.defineProperty(nativeStereoPannerNode, "channelCountMode", {
      get: () => channelCountMode,
      set: (value) => {
        if (value !== channelCountMode) {
          throw createNotSupportedError2();
        }
      }
    });
    return nativeStereoPannerNode;
  };
};
const createNativeStereoPannerNodeFakerFactory = (createNativeChannelMergerNode2, createNativeChannelSplitterNode2, createNativeGainNode2, createNativeWaveShaperNode2, createNotSupportedError2, monitorConnections2) => {
  const CURVE_SIZE = 16385;
  const DC_CURVE = new Float32Array([1, 1]);
  const HALF_PI = Math.PI / 2;
  const SINGLE_CHANNEL_OPTIONS = { channelCount: 1, channelCountMode: "explicit", channelInterpretation: "discrete" };
  const SINGLE_CHANNEL_WAVE_SHAPER_OPTIONS = __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), { oversample: "none" });
  const buildInternalGraphForMono = (nativeContext, inputGainNode, panGainNode, channelMergerNode) => {
    const leftWaveShaperCurve = new Float32Array(CURVE_SIZE);
    const rightWaveShaperCurve = new Float32Array(CURVE_SIZE);
    for (let i = 0; i < CURVE_SIZE; i += 1) {
      const x = i / (CURVE_SIZE - 1) * HALF_PI;
      leftWaveShaperCurve[i] = Math.cos(x);
      rightWaveShaperCurve[i] = Math.sin(x);
    }
    const leftGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), { gain: 0 }));
    const leftWaveShaperNode = createNativeWaveShaperNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_WAVE_SHAPER_OPTIONS), { curve: leftWaveShaperCurve }));
    const panWaveShaperNode = createNativeWaveShaperNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_WAVE_SHAPER_OPTIONS), { curve: DC_CURVE }));
    const rightGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), { gain: 0 }));
    const rightWaveShaperNode = createNativeWaveShaperNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_WAVE_SHAPER_OPTIONS), { curve: rightWaveShaperCurve }));
    return {
      connectGraph() {
        inputGainNode.connect(leftGainNode);
        inputGainNode.connect(panWaveShaperNode.inputs === void 0 ? panWaveShaperNode : panWaveShaperNode.inputs[0]);
        inputGainNode.connect(rightGainNode);
        panWaveShaperNode.connect(panGainNode);
        panGainNode.connect(leftWaveShaperNode.inputs === void 0 ? leftWaveShaperNode : leftWaveShaperNode.inputs[0]);
        panGainNode.connect(rightWaveShaperNode.inputs === void 0 ? rightWaveShaperNode : rightWaveShaperNode.inputs[0]);
        leftWaveShaperNode.connect(leftGainNode.gain);
        rightWaveShaperNode.connect(rightGainNode.gain);
        leftGainNode.connect(channelMergerNode, 0, 0);
        rightGainNode.connect(channelMergerNode, 0, 1);
      },
      disconnectGraph() {
        inputGainNode.disconnect(leftGainNode);
        inputGainNode.disconnect(panWaveShaperNode.inputs === void 0 ? panWaveShaperNode : panWaveShaperNode.inputs[0]);
        inputGainNode.disconnect(rightGainNode);
        panWaveShaperNode.disconnect(panGainNode);
        panGainNode.disconnect(leftWaveShaperNode.inputs === void 0 ? leftWaveShaperNode : leftWaveShaperNode.inputs[0]);
        panGainNode.disconnect(rightWaveShaperNode.inputs === void 0 ? rightWaveShaperNode : rightWaveShaperNode.inputs[0]);
        leftWaveShaperNode.disconnect(leftGainNode.gain);
        rightWaveShaperNode.disconnect(rightGainNode.gain);
        leftGainNode.disconnect(channelMergerNode, 0, 0);
        rightGainNode.disconnect(channelMergerNode, 0, 1);
      }
    };
  };
  const buildInternalGraphForStereo = (nativeContext, inputGainNode, panGainNode, channelMergerNode) => {
    const leftInputForLeftOutputWaveShaperCurve = new Float32Array(CURVE_SIZE);
    const leftInputForRightOutputWaveShaperCurve = new Float32Array(CURVE_SIZE);
    const rightInputForLeftOutputWaveShaperCurve = new Float32Array(CURVE_SIZE);
    const rightInputForRightOutputWaveShaperCurve = new Float32Array(CURVE_SIZE);
    const centerIndex = Math.floor(CURVE_SIZE / 2);
    for (let i = 0; i < CURVE_SIZE; i += 1) {
      if (i > centerIndex) {
        const x = (i - centerIndex) / (CURVE_SIZE - 1 - centerIndex) * HALF_PI;
        leftInputForLeftOutputWaveShaperCurve[i] = Math.cos(x);
        leftInputForRightOutputWaveShaperCurve[i] = Math.sin(x);
        rightInputForLeftOutputWaveShaperCurve[i] = 0;
        rightInputForRightOutputWaveShaperCurve[i] = 1;
      } else {
        const x = i / (CURVE_SIZE - 1 - centerIndex) * HALF_PI;
        leftInputForLeftOutputWaveShaperCurve[i] = 1;
        leftInputForRightOutputWaveShaperCurve[i] = 0;
        rightInputForLeftOutputWaveShaperCurve[i] = Math.cos(x);
        rightInputForRightOutputWaveShaperCurve[i] = Math.sin(x);
      }
    }
    const channelSplitterNode = createNativeChannelSplitterNode2(nativeContext, {
      channelCount: 2,
      channelCountMode: "explicit",
      channelInterpretation: "discrete",
      numberOfOutputs: 2
    });
    const leftInputForLeftOutputGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), { gain: 0 }));
    const leftInputForLeftOutputWaveShaperNode = createNativeWaveShaperNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_WAVE_SHAPER_OPTIONS), {
      curve: leftInputForLeftOutputWaveShaperCurve
    }));
    const leftInputForRightOutputGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), { gain: 0 }));
    const leftInputForRightOutputWaveShaperNode = createNativeWaveShaperNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_WAVE_SHAPER_OPTIONS), {
      curve: leftInputForRightOutputWaveShaperCurve
    }));
    const panWaveShaperNode = createNativeWaveShaperNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_WAVE_SHAPER_OPTIONS), { curve: DC_CURVE }));
    const rightInputForLeftOutputGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), { gain: 0 }));
    const rightInputForLeftOutputWaveShaperNode = createNativeWaveShaperNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_WAVE_SHAPER_OPTIONS), {
      curve: rightInputForLeftOutputWaveShaperCurve
    }));
    const rightInputForRightOutputGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_OPTIONS), { gain: 0 }));
    const rightInputForRightOutputWaveShaperNode = createNativeWaveShaperNode2(nativeContext, __spreadProps(__spreadValues({}, SINGLE_CHANNEL_WAVE_SHAPER_OPTIONS), {
      curve: rightInputForRightOutputWaveShaperCurve
    }));
    return {
      connectGraph() {
        inputGainNode.connect(channelSplitterNode);
        inputGainNode.connect(panWaveShaperNode.inputs === void 0 ? panWaveShaperNode : panWaveShaperNode.inputs[0]);
        channelSplitterNode.connect(leftInputForLeftOutputGainNode, 0);
        channelSplitterNode.connect(leftInputForRightOutputGainNode, 0);
        channelSplitterNode.connect(rightInputForLeftOutputGainNode, 1);
        channelSplitterNode.connect(rightInputForRightOutputGainNode, 1);
        panWaveShaperNode.connect(panGainNode);
        panGainNode.connect(leftInputForLeftOutputWaveShaperNode.inputs === void 0 ? leftInputForLeftOutputWaveShaperNode : leftInputForLeftOutputWaveShaperNode.inputs[0]);
        panGainNode.connect(leftInputForRightOutputWaveShaperNode.inputs === void 0 ? leftInputForRightOutputWaveShaperNode : leftInputForRightOutputWaveShaperNode.inputs[0]);
        panGainNode.connect(rightInputForLeftOutputWaveShaperNode.inputs === void 0 ? rightInputForLeftOutputWaveShaperNode : rightInputForLeftOutputWaveShaperNode.inputs[0]);
        panGainNode.connect(rightInputForRightOutputWaveShaperNode.inputs === void 0 ? rightInputForRightOutputWaveShaperNode : rightInputForRightOutputWaveShaperNode.inputs[0]);
        leftInputForLeftOutputWaveShaperNode.connect(leftInputForLeftOutputGainNode.gain);
        leftInputForRightOutputWaveShaperNode.connect(leftInputForRightOutputGainNode.gain);
        rightInputForLeftOutputWaveShaperNode.connect(rightInputForLeftOutputGainNode.gain);
        rightInputForRightOutputWaveShaperNode.connect(rightInputForRightOutputGainNode.gain);
        leftInputForLeftOutputGainNode.connect(channelMergerNode, 0, 0);
        rightInputForLeftOutputGainNode.connect(channelMergerNode, 0, 0);
        leftInputForRightOutputGainNode.connect(channelMergerNode, 0, 1);
        rightInputForRightOutputGainNode.connect(channelMergerNode, 0, 1);
      },
      disconnectGraph() {
        inputGainNode.disconnect(channelSplitterNode);
        inputGainNode.disconnect(panWaveShaperNode.inputs === void 0 ? panWaveShaperNode : panWaveShaperNode.inputs[0]);
        channelSplitterNode.disconnect(leftInputForLeftOutputGainNode, 0);
        channelSplitterNode.disconnect(leftInputForRightOutputGainNode, 0);
        channelSplitterNode.disconnect(rightInputForLeftOutputGainNode, 1);
        channelSplitterNode.disconnect(rightInputForRightOutputGainNode, 1);
        panWaveShaperNode.disconnect(panGainNode);
        panGainNode.disconnect(leftInputForLeftOutputWaveShaperNode.inputs === void 0 ? leftInputForLeftOutputWaveShaperNode : leftInputForLeftOutputWaveShaperNode.inputs[0]);
        panGainNode.disconnect(leftInputForRightOutputWaveShaperNode.inputs === void 0 ? leftInputForRightOutputWaveShaperNode : leftInputForRightOutputWaveShaperNode.inputs[0]);
        panGainNode.disconnect(rightInputForLeftOutputWaveShaperNode.inputs === void 0 ? rightInputForLeftOutputWaveShaperNode : rightInputForLeftOutputWaveShaperNode.inputs[0]);
        panGainNode.disconnect(rightInputForRightOutputWaveShaperNode.inputs === void 0 ? rightInputForRightOutputWaveShaperNode : rightInputForRightOutputWaveShaperNode.inputs[0]);
        leftInputForLeftOutputWaveShaperNode.disconnect(leftInputForLeftOutputGainNode.gain);
        leftInputForRightOutputWaveShaperNode.disconnect(leftInputForRightOutputGainNode.gain);
        rightInputForLeftOutputWaveShaperNode.disconnect(rightInputForLeftOutputGainNode.gain);
        rightInputForRightOutputWaveShaperNode.disconnect(rightInputForRightOutputGainNode.gain);
        leftInputForLeftOutputGainNode.disconnect(channelMergerNode, 0, 0);
        rightInputForLeftOutputGainNode.disconnect(channelMergerNode, 0, 0);
        leftInputForRightOutputGainNode.disconnect(channelMergerNode, 0, 1);
        rightInputForRightOutputGainNode.disconnect(channelMergerNode, 0, 1);
      }
    };
  };
  const buildInternalGraph = (nativeContext, channelCount, inputGainNode, panGainNode, channelMergerNode) => {
    if (channelCount === 1) {
      return buildInternalGraphForMono(nativeContext, inputGainNode, panGainNode, channelMergerNode);
    }
    if (channelCount === 2) {
      return buildInternalGraphForStereo(nativeContext, inputGainNode, panGainNode, channelMergerNode);
    }
    throw createNotSupportedError2();
  };
  return (nativeContext, _a) => {
    var _b = _a, { channelCount, channelCountMode, pan } = _b, audioNodeOptions = __objRest(_b, ["channelCount", "channelCountMode", "pan"]);
    if (channelCountMode === "max") {
      throw createNotSupportedError2();
    }
    const channelMergerNode = createNativeChannelMergerNode2(nativeContext, __spreadProps(__spreadValues({}, audioNodeOptions), {
      channelCount: 1,
      channelCountMode,
      numberOfInputs: 2
    }));
    const inputGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, audioNodeOptions), { channelCount, channelCountMode, gain: 1 }));
    const panGainNode = createNativeGainNode2(nativeContext, {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "discrete",
      gain: pan
    });
    let { connectGraph, disconnectGraph } = buildInternalGraph(nativeContext, channelCount, inputGainNode, panGainNode, channelMergerNode);
    Object.defineProperty(panGainNode.gain, "defaultValue", { get: () => 0 });
    Object.defineProperty(panGainNode.gain, "maxValue", { get: () => 1 });
    Object.defineProperty(panGainNode.gain, "minValue", { get: () => -1 });
    const nativeStereoPannerNodeFakerFactory2 = {
      get bufferSize() {
        return void 0;
      },
      get channelCount() {
        return inputGainNode.channelCount;
      },
      set channelCount(value) {
        if (inputGainNode.channelCount !== value) {
          if (isConnected) {
            disconnectGraph();
          }
          ({ connectGraph, disconnectGraph } = buildInternalGraph(nativeContext, value, inputGainNode, panGainNode, channelMergerNode));
          if (isConnected) {
            connectGraph();
          }
        }
        inputGainNode.channelCount = value;
      },
      get channelCountMode() {
        return inputGainNode.channelCountMode;
      },
      set channelCountMode(value) {
        if (value === "clamped-max" || value === "max") {
          throw createNotSupportedError2();
        }
        inputGainNode.channelCountMode = value;
      },
      get channelInterpretation() {
        return inputGainNode.channelInterpretation;
      },
      set channelInterpretation(value) {
        inputGainNode.channelInterpretation = value;
      },
      get context() {
        return inputGainNode.context;
      },
      get inputs() {
        return [inputGainNode];
      },
      get numberOfInputs() {
        return inputGainNode.numberOfInputs;
      },
      get numberOfOutputs() {
        return inputGainNode.numberOfOutputs;
      },
      get pan() {
        return panGainNode.gain;
      },
      addEventListener(...args) {
        return inputGainNode.addEventListener(args[0], args[1], args[2]);
      },
      dispatchEvent(...args) {
        return inputGainNode.dispatchEvent(args[0]);
      },
      removeEventListener(...args) {
        return inputGainNode.removeEventListener(args[0], args[1], args[2]);
      }
    };
    let isConnected = false;
    const whenConnected = () => {
      connectGraph();
      isConnected = true;
    };
    const whenDisconnected = () => {
      disconnectGraph();
      isConnected = false;
    };
    return monitorConnections2(interceptConnections(nativeStereoPannerNodeFakerFactory2, channelMergerNode), whenConnected, whenDisconnected);
  };
};
const createNativeWaveShaperNodeFactory = (createConnectedNativeAudioBufferSourceNode2, createInvalidStateError2, createNativeWaveShaperNodeFaker2, isDCCurve2, monitorConnections2, nativeAudioContextConstructor2, overwriteAccessors2) => {
  return (nativeContext, options) => {
    const nativeWaveShaperNode = nativeContext.createWaveShaper();
    if (nativeAudioContextConstructor2 !== null && nativeAudioContextConstructor2.name === "webkitAudioContext" && nativeContext.createGain().gain.automationRate === void 0) {
      return createNativeWaveShaperNodeFaker2(nativeContext, options);
    }
    assignNativeAudioNodeOptions(nativeWaveShaperNode, options);
    const curve = options.curve === null || options.curve instanceof Float32Array ? options.curve : new Float32Array(options.curve);
    if (curve !== null && curve.length < 2) {
      throw createInvalidStateError2();
    }
    assignNativeAudioNodeOption(nativeWaveShaperNode, { curve }, "curve");
    assignNativeAudioNodeOption(nativeWaveShaperNode, options, "oversample");
    let disconnectNativeAudioBufferSourceNode = null;
    let isConnected = false;
    overwriteAccessors2(nativeWaveShaperNode, "curve", (get) => () => get.call(nativeWaveShaperNode), (set) => (value) => {
      set.call(nativeWaveShaperNode, value);
      if (isConnected) {
        if (isDCCurve2(value) && disconnectNativeAudioBufferSourceNode === null) {
          disconnectNativeAudioBufferSourceNode = createConnectedNativeAudioBufferSourceNode2(nativeContext, nativeWaveShaperNode);
        } else if (!isDCCurve2(value) && disconnectNativeAudioBufferSourceNode !== null) {
          disconnectNativeAudioBufferSourceNode();
          disconnectNativeAudioBufferSourceNode = null;
        }
      }
      return value;
    });
    const whenConnected = () => {
      isConnected = true;
      if (isDCCurve2(nativeWaveShaperNode.curve)) {
        disconnectNativeAudioBufferSourceNode = createConnectedNativeAudioBufferSourceNode2(nativeContext, nativeWaveShaperNode);
      }
    };
    const whenDisconnected = () => {
      isConnected = false;
      if (disconnectNativeAudioBufferSourceNode !== null) {
        disconnectNativeAudioBufferSourceNode();
        disconnectNativeAudioBufferSourceNode = null;
      }
    };
    return monitorConnections2(nativeWaveShaperNode, whenConnected, whenDisconnected);
  };
};
const createNativeWaveShaperNodeFakerFactory = (createConnectedNativeAudioBufferSourceNode2, createInvalidStateError2, createNativeGainNode2, isDCCurve2, monitorConnections2) => {
  return (nativeContext, _a) => {
    var _b = _a, { curve, oversample } = _b, audioNodeOptions = __objRest(_b, ["curve", "oversample"]);
    const negativeWaveShaperNode = nativeContext.createWaveShaper();
    const positiveWaveShaperNode = nativeContext.createWaveShaper();
    assignNativeAudioNodeOptions(negativeWaveShaperNode, audioNodeOptions);
    assignNativeAudioNodeOptions(positiveWaveShaperNode, audioNodeOptions);
    const inputGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, audioNodeOptions), { gain: 1 }));
    const invertGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, audioNodeOptions), { gain: -1 }));
    const outputGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, audioNodeOptions), { gain: 1 }));
    const revertGainNode = createNativeGainNode2(nativeContext, __spreadProps(__spreadValues({}, audioNodeOptions), { gain: -1 }));
    let disconnectNativeAudioBufferSourceNode = null;
    let isConnected = false;
    let unmodifiedCurve = null;
    const nativeWaveShaperNodeFaker = {
      get bufferSize() {
        return void 0;
      },
      get channelCount() {
        return negativeWaveShaperNode.channelCount;
      },
      set channelCount(value) {
        inputGainNode.channelCount = value;
        invertGainNode.channelCount = value;
        negativeWaveShaperNode.channelCount = value;
        outputGainNode.channelCount = value;
        positiveWaveShaperNode.channelCount = value;
        revertGainNode.channelCount = value;
      },
      get channelCountMode() {
        return negativeWaveShaperNode.channelCountMode;
      },
      set channelCountMode(value) {
        inputGainNode.channelCountMode = value;
        invertGainNode.channelCountMode = value;
        negativeWaveShaperNode.channelCountMode = value;
        outputGainNode.channelCountMode = value;
        positiveWaveShaperNode.channelCountMode = value;
        revertGainNode.channelCountMode = value;
      },
      get channelInterpretation() {
        return negativeWaveShaperNode.channelInterpretation;
      },
      set channelInterpretation(value) {
        inputGainNode.channelInterpretation = value;
        invertGainNode.channelInterpretation = value;
        negativeWaveShaperNode.channelInterpretation = value;
        outputGainNode.channelInterpretation = value;
        positiveWaveShaperNode.channelInterpretation = value;
        revertGainNode.channelInterpretation = value;
      },
      get context() {
        return negativeWaveShaperNode.context;
      },
      get curve() {
        return unmodifiedCurve;
      },
      set curve(value) {
        if (value !== null && value.length < 2) {
          throw createInvalidStateError2();
        }
        if (value === null) {
          negativeWaveShaperNode.curve = value;
          positiveWaveShaperNode.curve = value;
        } else {
          const curveLength = value.length;
          const negativeCurve = new Float32Array(curveLength + 2 - curveLength % 2);
          const positiveCurve = new Float32Array(curveLength + 2 - curveLength % 2);
          negativeCurve[0] = value[0];
          positiveCurve[0] = -value[curveLength - 1];
          const length = Math.ceil((curveLength + 1) / 2);
          const centerIndex = (curveLength + 1) / 2 - 1;
          for (let i = 1; i < length; i += 1) {
            const theoreticIndex = i / length * centerIndex;
            const lowerIndex = Math.floor(theoreticIndex);
            const upperIndex = Math.ceil(theoreticIndex);
            negativeCurve[i] = lowerIndex === upperIndex ? value[lowerIndex] : (1 - (theoreticIndex - lowerIndex)) * value[lowerIndex] + (1 - (upperIndex - theoreticIndex)) * value[upperIndex];
            positiveCurve[i] = lowerIndex === upperIndex ? -value[curveLength - 1 - lowerIndex] : -((1 - (theoreticIndex - lowerIndex)) * value[curveLength - 1 - lowerIndex]) - (1 - (upperIndex - theoreticIndex)) * value[curveLength - 1 - upperIndex];
          }
          negativeCurve[length] = curveLength % 2 === 1 ? value[length - 1] : (value[length - 2] + value[length - 1]) / 2;
          negativeWaveShaperNode.curve = negativeCurve;
          positiveWaveShaperNode.curve = positiveCurve;
        }
        unmodifiedCurve = value;
        if (isConnected) {
          if (isDCCurve2(unmodifiedCurve) && disconnectNativeAudioBufferSourceNode === null) {
            disconnectNativeAudioBufferSourceNode = createConnectedNativeAudioBufferSourceNode2(nativeContext, inputGainNode);
          } else if (disconnectNativeAudioBufferSourceNode !== null) {
            disconnectNativeAudioBufferSourceNode();
            disconnectNativeAudioBufferSourceNode = null;
          }
        }
      },
      get inputs() {
        return [inputGainNode];
      },
      get numberOfInputs() {
        return negativeWaveShaperNode.numberOfInputs;
      },
      get numberOfOutputs() {
        return negativeWaveShaperNode.numberOfOutputs;
      },
      get oversample() {
        return negativeWaveShaperNode.oversample;
      },
      set oversample(value) {
        negativeWaveShaperNode.oversample = value;
        positiveWaveShaperNode.oversample = value;
      },
      addEventListener(...args) {
        return inputGainNode.addEventListener(args[0], args[1], args[2]);
      },
      dispatchEvent(...args) {
        return inputGainNode.dispatchEvent(args[0]);
      },
      removeEventListener(...args) {
        return inputGainNode.removeEventListener(args[0], args[1], args[2]);
      }
    };
    if (curve !== null) {
      nativeWaveShaperNodeFaker.curve = curve instanceof Float32Array ? curve : new Float32Array(curve);
    }
    if (oversample !== nativeWaveShaperNodeFaker.oversample) {
      nativeWaveShaperNodeFaker.oversample = oversample;
    }
    const whenConnected = () => {
      inputGainNode.connect(negativeWaveShaperNode).connect(outputGainNode);
      inputGainNode.connect(invertGainNode).connect(positiveWaveShaperNode).connect(revertGainNode).connect(outputGainNode);
      isConnected = true;
      if (isDCCurve2(unmodifiedCurve)) {
        disconnectNativeAudioBufferSourceNode = createConnectedNativeAudioBufferSourceNode2(nativeContext, inputGainNode);
      }
    };
    const whenDisconnected = () => {
      inputGainNode.disconnect(negativeWaveShaperNode);
      negativeWaveShaperNode.disconnect(outputGainNode);
      inputGainNode.disconnect(invertGainNode);
      invertGainNode.disconnect(positiveWaveShaperNode);
      positiveWaveShaperNode.disconnect(revertGainNode);
      revertGainNode.disconnect(outputGainNode);
      isConnected = false;
      if (disconnectNativeAudioBufferSourceNode !== null) {
        disconnectNativeAudioBufferSourceNode();
        disconnectNativeAudioBufferSourceNode = null;
      }
    };
    return monitorConnections2(interceptConnections(nativeWaveShaperNodeFaker, outputGainNode), whenConnected, whenDisconnected);
  };
};
const createNotSupportedError = () => new DOMException("", "NotSupportedError");
const DEFAULT_OPTIONS$5 = {
  numberOfChannels: 1
};
const createOfflineAudioContextConstructor = (baseAudioContextConstructor2, cacheTestResult2, createInvalidStateError2, createNativeOfflineAudioContext2, startRendering2) => {
  return class OfflineAudioContext extends baseAudioContextConstructor2 {
    constructor(a, b, c) {
      let options;
      if (typeof a === "number" && b !== void 0 && c !== void 0) {
        options = { length: b, numberOfChannels: a, sampleRate: c };
      } else if (typeof a === "object") {
        options = a;
      } else {
        throw new Error("The given parameters are not valid.");
      }
      const { length, numberOfChannels, sampleRate } = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$5), options);
      const nativeOfflineAudioContext = createNativeOfflineAudioContext2(numberOfChannels, length, sampleRate);
      if (!cacheTestResult2(testPromiseSupport, () => testPromiseSupport(nativeOfflineAudioContext))) {
        nativeOfflineAudioContext.addEventListener("statechange", /* @__PURE__ */ (() => {
          let i = 0;
          const delayStateChangeEvent = (event) => {
            if (this._state === "running") {
              if (i > 0) {
                nativeOfflineAudioContext.removeEventListener("statechange", delayStateChangeEvent);
                event.stopImmediatePropagation();
                this._waitForThePromiseToSettle(event);
              } else {
                i += 1;
              }
            }
          };
          return delayStateChangeEvent;
        })());
      }
      super(nativeOfflineAudioContext, numberOfChannels);
      this._length = length;
      this._nativeOfflineAudioContext = nativeOfflineAudioContext;
      this._state = null;
    }
    get length() {
      if (this._nativeOfflineAudioContext.length === void 0) {
        return this._length;
      }
      return this._nativeOfflineAudioContext.length;
    }
    get state() {
      return this._state === null ? this._nativeOfflineAudioContext.state : this._state;
    }
    startRendering() {
      if (this._state === "running") {
        return Promise.reject(createInvalidStateError2());
      }
      this._state = "running";
      return startRendering2(this.destination, this._nativeOfflineAudioContext).finally(() => {
        this._state = null;
        deactivateAudioGraph(this);
      });
    }
    _waitForThePromiseToSettle(event) {
      if (this._state === null) {
        this._nativeOfflineAudioContext.dispatchEvent(event);
      } else {
        setTimeout(() => this._waitForThePromiseToSettle(event));
      }
    }
  };
};
const DEFAULT_OPTIONS$4 = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  detune: 0,
  frequency: 440,
  periodicWave: void 0,
  type: "sine"
};
const createOscillatorNodeConstructor = (audioNodeConstructor2, createAudioParam2, createNativeOscillatorNode2, createOscillatorNodeRenderer2, getNativeContext2, isNativeOfflineAudioContext2, wrapEventListener2) => {
  return class OscillatorNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$4), options);
      const nativeOscillatorNode = createNativeOscillatorNode2(nativeContext, mergedOptions);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const oscillatorNodeRenderer = isOffline ? createOscillatorNodeRenderer2() : null;
      const nyquist = context2.sampleRate / 2;
      super(context2, false, nativeOscillatorNode, oscillatorNodeRenderer);
      this._detune = createAudioParam2(this, isOffline, nativeOscillatorNode.detune, 153600, -153600);
      this._frequency = createAudioParam2(this, isOffline, nativeOscillatorNode.frequency, nyquist, -nyquist);
      this._nativeOscillatorNode = nativeOscillatorNode;
      this._onended = null;
      this._oscillatorNodeRenderer = oscillatorNodeRenderer;
      if (this._oscillatorNodeRenderer !== null && mergedOptions.periodicWave !== void 0) {
        this._oscillatorNodeRenderer.periodicWave = mergedOptions.periodicWave;
      }
    }
    get detune() {
      return this._detune;
    }
    get frequency() {
      return this._frequency;
    }
    get onended() {
      return this._onended;
    }
    set onended(value) {
      const wrappedListener = typeof value === "function" ? wrapEventListener2(this, value) : null;
      this._nativeOscillatorNode.onended = wrappedListener;
      const nativeOnEnded = this._nativeOscillatorNode.onended;
      this._onended = nativeOnEnded !== null && nativeOnEnded === wrappedListener ? value : nativeOnEnded;
    }
    get type() {
      return this._nativeOscillatorNode.type;
    }
    set type(value) {
      this._nativeOscillatorNode.type = value;
      if (this._oscillatorNodeRenderer !== null) {
        this._oscillatorNodeRenderer.periodicWave = null;
      }
    }
    setPeriodicWave(periodicWave) {
      this._nativeOscillatorNode.setPeriodicWave(periodicWave);
      if (this._oscillatorNodeRenderer !== null) {
        this._oscillatorNodeRenderer.periodicWave = periodicWave;
      }
    }
    start(when = 0) {
      this._nativeOscillatorNode.start(when);
      if (this._oscillatorNodeRenderer !== null) {
        this._oscillatorNodeRenderer.start = when;
      }
      if (this.context.state !== "closed") {
        setInternalStateToActive(this);
        const resetInternalStateToPassive = () => {
          this._nativeOscillatorNode.removeEventListener("ended", resetInternalStateToPassive);
          if (isActiveAudioNode(this)) {
            setInternalStateToPassive(this);
          }
        };
        this._nativeOscillatorNode.addEventListener("ended", resetInternalStateToPassive);
      }
    }
    stop(when = 0) {
      this._nativeOscillatorNode.stop(when);
      if (this._oscillatorNodeRenderer !== null) {
        this._oscillatorNodeRenderer.stop = when;
      }
    }
  };
};
const createOscillatorNodeRendererFactory = (connectAudioParam2, createNativeOscillatorNode2, getNativeAudioNode2, renderAutomation2, renderInputsOfAudioNode2) => {
  return () => {
    const renderedNativeOscillatorNodes = /* @__PURE__ */ new WeakMap();
    let periodicWave = null;
    let start2 = null;
    let stop = null;
    const createOscillatorNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeOscillatorNode = getNativeAudioNode2(proxy);
      const nativeOscillatorNodeIsOwnedByContext = isOwnedByContext(nativeOscillatorNode, nativeOfflineAudioContext);
      if (!nativeOscillatorNodeIsOwnedByContext) {
        const options = {
          channelCount: nativeOscillatorNode.channelCount,
          channelCountMode: nativeOscillatorNode.channelCountMode,
          channelInterpretation: nativeOscillatorNode.channelInterpretation,
          detune: nativeOscillatorNode.detune.value,
          frequency: nativeOscillatorNode.frequency.value,
          periodicWave: periodicWave === null ? void 0 : periodicWave,
          type: nativeOscillatorNode.type
        };
        nativeOscillatorNode = createNativeOscillatorNode2(nativeOfflineAudioContext, options);
        if (start2 !== null) {
          nativeOscillatorNode.start(start2);
        }
        if (stop !== null) {
          nativeOscillatorNode.stop(stop);
        }
      }
      renderedNativeOscillatorNodes.set(nativeOfflineAudioContext, nativeOscillatorNode);
      if (!nativeOscillatorNodeIsOwnedByContext) {
        yield renderAutomation2(nativeOfflineAudioContext, proxy.detune, nativeOscillatorNode.detune);
        yield renderAutomation2(nativeOfflineAudioContext, proxy.frequency, nativeOscillatorNode.frequency);
      } else {
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.detune, nativeOscillatorNode.detune);
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.frequency, nativeOscillatorNode.frequency);
      }
      yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeOscillatorNode);
      return nativeOscillatorNode;
    });
    return {
      set periodicWave(value) {
        periodicWave = value;
      },
      set start(value) {
        start2 = value;
      },
      set stop(value) {
        stop = value;
      },
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeOscillatorNode = renderedNativeOscillatorNodes.get(nativeOfflineAudioContext);
        if (renderedNativeOscillatorNode !== void 0) {
          return Promise.resolve(renderedNativeOscillatorNode);
        }
        return createOscillatorNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const DEFAULT_OPTIONS$3 = {
  channelCount: 2,
  channelCountMode: "clamped-max",
  channelInterpretation: "speakers",
  coneInnerAngle: 360,
  coneOuterAngle: 360,
  coneOuterGain: 0,
  distanceModel: "inverse",
  maxDistance: 1e4,
  orientationX: 1,
  orientationY: 0,
  orientationZ: 0,
  panningModel: "equalpower",
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  refDistance: 1,
  rolloffFactor: 1
};
const createPannerNodeConstructor = (audioNodeConstructor2, createAudioParam2, createNativePannerNode2, createPannerNodeRenderer2, getNativeContext2, isNativeOfflineAudioContext2, setAudioNodeTailTime2) => {
  return class PannerNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$3), options);
      const nativePannerNode = createNativePannerNode2(nativeContext, mergedOptions);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const pannerNodeRenderer = isOffline ? createPannerNodeRenderer2() : null;
      super(context2, false, nativePannerNode, pannerNodeRenderer);
      this._nativePannerNode = nativePannerNode;
      this._orientationX = createAudioParam2(this, isOffline, nativePannerNode.orientationX, MOST_POSITIVE_SINGLE_FLOAT, MOST_NEGATIVE_SINGLE_FLOAT);
      this._orientationY = createAudioParam2(this, isOffline, nativePannerNode.orientationY, MOST_POSITIVE_SINGLE_FLOAT, MOST_NEGATIVE_SINGLE_FLOAT);
      this._orientationZ = createAudioParam2(this, isOffline, nativePannerNode.orientationZ, MOST_POSITIVE_SINGLE_FLOAT, MOST_NEGATIVE_SINGLE_FLOAT);
      this._positionX = createAudioParam2(this, isOffline, nativePannerNode.positionX, MOST_POSITIVE_SINGLE_FLOAT, MOST_NEGATIVE_SINGLE_FLOAT);
      this._positionY = createAudioParam2(this, isOffline, nativePannerNode.positionY, MOST_POSITIVE_SINGLE_FLOAT, MOST_NEGATIVE_SINGLE_FLOAT);
      this._positionZ = createAudioParam2(this, isOffline, nativePannerNode.positionZ, MOST_POSITIVE_SINGLE_FLOAT, MOST_NEGATIVE_SINGLE_FLOAT);
      setAudioNodeTailTime2(this, 1);
    }
    get coneInnerAngle() {
      return this._nativePannerNode.coneInnerAngle;
    }
    set coneInnerAngle(value) {
      this._nativePannerNode.coneInnerAngle = value;
    }
    get coneOuterAngle() {
      return this._nativePannerNode.coneOuterAngle;
    }
    set coneOuterAngle(value) {
      this._nativePannerNode.coneOuterAngle = value;
    }
    get coneOuterGain() {
      return this._nativePannerNode.coneOuterGain;
    }
    set coneOuterGain(value) {
      this._nativePannerNode.coneOuterGain = value;
    }
    get distanceModel() {
      return this._nativePannerNode.distanceModel;
    }
    set distanceModel(value) {
      this._nativePannerNode.distanceModel = value;
    }
    get maxDistance() {
      return this._nativePannerNode.maxDistance;
    }
    set maxDistance(value) {
      this._nativePannerNode.maxDistance = value;
    }
    get orientationX() {
      return this._orientationX;
    }
    get orientationY() {
      return this._orientationY;
    }
    get orientationZ() {
      return this._orientationZ;
    }
    get panningModel() {
      return this._nativePannerNode.panningModel;
    }
    set panningModel(value) {
      this._nativePannerNode.panningModel = value;
    }
    get positionX() {
      return this._positionX;
    }
    get positionY() {
      return this._positionY;
    }
    get positionZ() {
      return this._positionZ;
    }
    get refDistance() {
      return this._nativePannerNode.refDistance;
    }
    set refDistance(value) {
      this._nativePannerNode.refDistance = value;
    }
    get rolloffFactor() {
      return this._nativePannerNode.rolloffFactor;
    }
    set rolloffFactor(value) {
      this._nativePannerNode.rolloffFactor = value;
    }
  };
};
const createPannerNodeRendererFactory = (connectAudioParam2, createNativeChannelMergerNode2, createNativeConstantSourceNode2, createNativeGainNode2, createNativePannerNode2, getNativeAudioNode2, nativeOfflineAudioContextConstructor2, renderAutomation2, renderInputsOfAudioNode2, renderNativeOfflineAudioContext2) => {
  return () => {
    const renderedNativeAudioNodes = /* @__PURE__ */ new WeakMap();
    let renderedBufferPromise = null;
    const createAudioNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeGainNode = null;
      let nativePannerNode = getNativeAudioNode2(proxy);
      const commonAudioNodeOptions = {
        channelCount: nativePannerNode.channelCount,
        channelCountMode: nativePannerNode.channelCountMode,
        channelInterpretation: nativePannerNode.channelInterpretation
      };
      const commonNativePannerNodeOptions = __spreadProps(__spreadValues({}, commonAudioNodeOptions), {
        coneInnerAngle: nativePannerNode.coneInnerAngle,
        coneOuterAngle: nativePannerNode.coneOuterAngle,
        coneOuterGain: nativePannerNode.coneOuterGain,
        distanceModel: nativePannerNode.distanceModel,
        maxDistance: nativePannerNode.maxDistance,
        panningModel: nativePannerNode.panningModel,
        refDistance: nativePannerNode.refDistance,
        rolloffFactor: nativePannerNode.rolloffFactor
      });
      const nativePannerNodeIsOwnedByContext = isOwnedByContext(nativePannerNode, nativeOfflineAudioContext);
      if ("bufferSize" in nativePannerNode) {
        nativeGainNode = createNativeGainNode2(nativeOfflineAudioContext, __spreadProps(__spreadValues({}, commonAudioNodeOptions), { gain: 1 }));
      } else if (!nativePannerNodeIsOwnedByContext) {
        const options = __spreadProps(__spreadValues({}, commonNativePannerNodeOptions), {
          orientationX: nativePannerNode.orientationX.value,
          orientationY: nativePannerNode.orientationY.value,
          orientationZ: nativePannerNode.orientationZ.value,
          positionX: nativePannerNode.positionX.value,
          positionY: nativePannerNode.positionY.value,
          positionZ: nativePannerNode.positionZ.value
        });
        nativePannerNode = createNativePannerNode2(nativeOfflineAudioContext, options);
      }
      renderedNativeAudioNodes.set(nativeOfflineAudioContext, nativeGainNode === null ? nativePannerNode : nativeGainNode);
      if (nativeGainNode !== null) {
        if (renderedBufferPromise === null) {
          if (nativeOfflineAudioContextConstructor2 === null) {
            throw new Error("Missing the native OfflineAudioContext constructor.");
          }
          const partialOfflineAudioContext = new nativeOfflineAudioContextConstructor2(
            6,
            proxy.context.length,
            nativeOfflineAudioContext.sampleRate
          );
          const nativeChannelMergerNode = createNativeChannelMergerNode2(partialOfflineAudioContext, {
            channelCount: 1,
            channelCountMode: "explicit",
            channelInterpretation: "speakers",
            numberOfInputs: 6
          });
          nativeChannelMergerNode.connect(partialOfflineAudioContext.destination);
          renderedBufferPromise = (() => __async(void 0, null, function* () {
            const nativeConstantSourceNodes = yield Promise.all([
              proxy.orientationX,
              proxy.orientationY,
              proxy.orientationZ,
              proxy.positionX,
              proxy.positionY,
              proxy.positionZ
            ].map((audioParam, index2) => __async(void 0, null, function* () {
              const nativeConstantSourceNode = createNativeConstantSourceNode2(partialOfflineAudioContext, {
                channelCount: 1,
                channelCountMode: "explicit",
                channelInterpretation: "discrete",
                offset: index2 === 0 ? 1 : 0
              });
              yield renderAutomation2(partialOfflineAudioContext, audioParam, nativeConstantSourceNode.offset);
              return nativeConstantSourceNode;
            })));
            for (let i = 0; i < 6; i += 1) {
              nativeConstantSourceNodes[i].connect(nativeChannelMergerNode, 0, i);
              nativeConstantSourceNodes[i].start(0);
            }
            return renderNativeOfflineAudioContext2(partialOfflineAudioContext);
          }))();
        }
        const renderedBuffer = yield renderedBufferPromise;
        const inputGainNode = createNativeGainNode2(nativeOfflineAudioContext, __spreadProps(__spreadValues({}, commonAudioNodeOptions), { gain: 1 }));
        yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, inputGainNode);
        const channelDatas = [];
        for (let i = 0; i < renderedBuffer.numberOfChannels; i += 1) {
          channelDatas.push(renderedBuffer.getChannelData(i));
        }
        let lastOrientation = [channelDatas[0][0], channelDatas[1][0], channelDatas[2][0]];
        let lastPosition = [channelDatas[3][0], channelDatas[4][0], channelDatas[5][0]];
        let gateGainNode = createNativeGainNode2(nativeOfflineAudioContext, __spreadProps(__spreadValues({}, commonAudioNodeOptions), { gain: 1 }));
        let partialPannerNode = createNativePannerNode2(nativeOfflineAudioContext, __spreadProps(__spreadValues({}, commonNativePannerNodeOptions), {
          orientationX: lastOrientation[0],
          orientationY: lastOrientation[1],
          orientationZ: lastOrientation[2],
          positionX: lastPosition[0],
          positionY: lastPosition[1],
          positionZ: lastPosition[2]
        }));
        inputGainNode.connect(gateGainNode).connect(partialPannerNode.inputs[0]);
        partialPannerNode.connect(nativeGainNode);
        for (let i = 128; i < renderedBuffer.length; i += 128) {
          const orientation = [channelDatas[0][i], channelDatas[1][i], channelDatas[2][i]];
          const positon = [channelDatas[3][i], channelDatas[4][i], channelDatas[5][i]];
          if (orientation.some((value, index2) => value !== lastOrientation[index2]) || positon.some((value, index2) => value !== lastPosition[index2])) {
            lastOrientation = orientation;
            lastPosition = positon;
            const currentTime = i / nativeOfflineAudioContext.sampleRate;
            gateGainNode.gain.setValueAtTime(0, currentTime);
            gateGainNode = createNativeGainNode2(nativeOfflineAudioContext, __spreadProps(__spreadValues({}, commonAudioNodeOptions), { gain: 0 }));
            partialPannerNode = createNativePannerNode2(nativeOfflineAudioContext, __spreadProps(__spreadValues({}, commonNativePannerNodeOptions), {
              orientationX: lastOrientation[0],
              orientationY: lastOrientation[1],
              orientationZ: lastOrientation[2],
              positionX: lastPosition[0],
              positionY: lastPosition[1],
              positionZ: lastPosition[2]
            }));
            gateGainNode.gain.setValueAtTime(1, currentTime);
            inputGainNode.connect(gateGainNode).connect(partialPannerNode.inputs[0]);
            partialPannerNode.connect(nativeGainNode);
          }
        }
        return nativeGainNode;
      }
      if (!nativePannerNodeIsOwnedByContext) {
        yield renderAutomation2(nativeOfflineAudioContext, proxy.orientationX, nativePannerNode.orientationX);
        yield renderAutomation2(nativeOfflineAudioContext, proxy.orientationY, nativePannerNode.orientationY);
        yield renderAutomation2(nativeOfflineAudioContext, proxy.orientationZ, nativePannerNode.orientationZ);
        yield renderAutomation2(nativeOfflineAudioContext, proxy.positionX, nativePannerNode.positionX);
        yield renderAutomation2(nativeOfflineAudioContext, proxy.positionY, nativePannerNode.positionY);
        yield renderAutomation2(nativeOfflineAudioContext, proxy.positionZ, nativePannerNode.positionZ);
      } else {
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.orientationX, nativePannerNode.orientationX);
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.orientationY, nativePannerNode.orientationY);
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.orientationZ, nativePannerNode.orientationZ);
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.positionX, nativePannerNode.positionX);
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.positionY, nativePannerNode.positionY);
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.positionZ, nativePannerNode.positionZ);
      }
      if (isNativeAudioNodeFaker(nativePannerNode)) {
        yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativePannerNode.inputs[0]);
      } else {
        yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativePannerNode);
      }
      return nativePannerNode;
    });
    return {
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeGainNodeOrNativePannerNode = renderedNativeAudioNodes.get(nativeOfflineAudioContext);
        if (renderedNativeGainNodeOrNativePannerNode !== void 0) {
          return Promise.resolve(renderedNativeGainNodeOrNativePannerNode);
        }
        return createAudioNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const DEFAULT_OPTIONS$2 = {
  disableNormalization: false
};
const createPeriodicWaveConstructor = (createNativePeriodicWave2, getNativeContext2, periodicWaveStore, sanitizePeriodicWaveOptions2) => {
  return class PeriodicWave {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = sanitizePeriodicWaveOptions2(__spreadValues(__spreadValues({}, DEFAULT_OPTIONS$2), options));
      const periodicWave = createNativePeriodicWave2(nativeContext, mergedOptions);
      periodicWaveStore.add(periodicWave);
      return periodicWave;
    }
    static [Symbol.hasInstance](instance) {
      return instance !== null && typeof instance === "object" && Object.getPrototypeOf(instance) === PeriodicWave.prototype || periodicWaveStore.has(instance);
    }
  };
};
const createRenderAutomation = (getAudioParamRenderer, renderInputsOfAudioParam2) => {
  return (nativeOfflineAudioContext, audioParam, nativeAudioParam) => {
    const audioParamRenderer = getAudioParamRenderer(audioParam);
    audioParamRenderer.replay(nativeAudioParam);
    return renderInputsOfAudioParam2(audioParam, nativeOfflineAudioContext, nativeAudioParam);
  };
};
const createRenderInputsOfAudioNode = (getAudioNodeConnections2, getAudioNodeRenderer2, isPartOfACycle2) => {
  return (audioNode, nativeOfflineAudioContext, nativeAudioNode) => __async(void 0, null, function* () {
    const audioNodeConnections = getAudioNodeConnections2(audioNode);
    yield Promise.all(audioNodeConnections.activeInputs.map((connections, input) => Array.from(connections).map((_0) => __async(void 0, [_0], function* ([source, output]) {
      const audioNodeRenderer = getAudioNodeRenderer2(source);
      const renderedNativeAudioNode = yield audioNodeRenderer.render(source, nativeOfflineAudioContext);
      const destination = audioNode.context.destination;
      if (!isPartOfACycle2(source) && (audioNode !== destination || !isPartOfACycle2(audioNode))) {
        renderedNativeAudioNode.connect(nativeAudioNode, output, input);
      }
    }))).reduce((allRenderingPromises, renderingPromises) => [...allRenderingPromises, ...renderingPromises], []));
  });
};
const createRenderInputsOfAudioParam = (getAudioNodeRenderer2, getAudioParamConnections2, isPartOfACycle2) => {
  return (audioParam, nativeOfflineAudioContext, nativeAudioParam) => __async(void 0, null, function* () {
    const audioParamConnections = getAudioParamConnections2(audioParam);
    yield Promise.all(Array.from(audioParamConnections.activeInputs).map((_0) => __async(void 0, [_0], function* ([source, output]) {
      const audioNodeRenderer = getAudioNodeRenderer2(source);
      const renderedNativeAudioNode = yield audioNodeRenderer.render(source, nativeOfflineAudioContext);
      if (!isPartOfACycle2(source)) {
        renderedNativeAudioNode.connect(nativeAudioParam, output);
      }
    })));
  });
};
const createRenderNativeOfflineAudioContext = (cacheTestResult2, createNativeGainNode2, createNativeScriptProcessorNode2, testOfflineAudioContextCurrentTimeSupport) => {
  return (nativeOfflineAudioContext) => {
    if (cacheTestResult2(testPromiseSupport, () => testPromiseSupport(nativeOfflineAudioContext))) {
      return Promise.resolve(cacheTestResult2(testOfflineAudioContextCurrentTimeSupport, testOfflineAudioContextCurrentTimeSupport)).then((isOfflineAudioContextCurrentTimeSupported) => {
        if (!isOfflineAudioContextCurrentTimeSupported) {
          const scriptProcessorNode = createNativeScriptProcessorNode2(nativeOfflineAudioContext, 512, 0, 1);
          nativeOfflineAudioContext.oncomplete = () => {
            scriptProcessorNode.onaudioprocess = null;
            scriptProcessorNode.disconnect();
          };
          scriptProcessorNode.onaudioprocess = () => nativeOfflineAudioContext.currentTime;
          scriptProcessorNode.connect(nativeOfflineAudioContext.destination);
        }
        return nativeOfflineAudioContext.startRendering();
      });
    }
    return new Promise((resolve) => {
      const gainNode = createNativeGainNode2(nativeOfflineAudioContext, {
        channelCount: 1,
        channelCountMode: "explicit",
        channelInterpretation: "discrete",
        gain: 0
      });
      nativeOfflineAudioContext.oncomplete = (event) => {
        gainNode.disconnect();
        resolve(event.renderedBuffer);
      };
      gainNode.connect(nativeOfflineAudioContext.destination);
      nativeOfflineAudioContext.startRendering();
    });
  };
};
const createSetActiveAudioWorkletNodeInputs = (activeAudioWorkletNodeInputsStore2) => {
  return (nativeAudioWorkletNode, activeInputs) => {
    activeAudioWorkletNodeInputsStore2.set(nativeAudioWorkletNode, activeInputs);
  };
};
const createSetAudioNodeTailTime = (audioNodeTailTimeStore2) => {
  return (audioNode, tailTime) => audioNodeTailTimeStore2.set(audioNode, tailTime);
};
const createStartRendering = (audioBufferStore2, cacheTestResult2, getAudioNodeRenderer2, getUnrenderedAudioWorkletNodes2, renderNativeOfflineAudioContext2, testAudioBufferCopyChannelMethodsOutOfBoundsSupport2, wrapAudioBufferCopyChannelMethods2, wrapAudioBufferCopyChannelMethodsOutOfBounds2) => {
  return (destination, nativeOfflineAudioContext) => getAudioNodeRenderer2(destination).render(destination, nativeOfflineAudioContext).then(() => Promise.all(Array.from(getUnrenderedAudioWorkletNodes2(nativeOfflineAudioContext)).map((audioWorkletNode) => getAudioNodeRenderer2(audioWorkletNode).render(audioWorkletNode, nativeOfflineAudioContext)))).then(() => renderNativeOfflineAudioContext2(nativeOfflineAudioContext)).then((audioBuffer) => {
    if (typeof audioBuffer.copyFromChannel !== "function") {
      wrapAudioBufferCopyChannelMethods2(audioBuffer);
      wrapAudioBufferGetChannelDataMethod(audioBuffer);
    } else if (!cacheTestResult2(testAudioBufferCopyChannelMethodsOutOfBoundsSupport2, () => testAudioBufferCopyChannelMethodsOutOfBoundsSupport2(audioBuffer))) {
      wrapAudioBufferCopyChannelMethodsOutOfBounds2(audioBuffer);
    }
    audioBufferStore2.add(audioBuffer);
    return audioBuffer;
  });
};
const DEFAULT_OPTIONS$1 = {
  channelCount: 2,
  channelCountMode: "explicit",
  channelInterpretation: "speakers",
  pan: 0
};
const createStereoPannerNodeConstructor = (audioNodeConstructor2, createAudioParam2, createNativeStereoPannerNode2, createStereoPannerNodeRenderer2, getNativeContext2, isNativeOfflineAudioContext2) => {
  return class StereoPannerNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS$1), options);
      const nativeStereoPannerNode = createNativeStereoPannerNode2(nativeContext, mergedOptions);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const stereoPannerNodeRenderer = isOffline ? createStereoPannerNodeRenderer2() : null;
      super(context2, false, nativeStereoPannerNode, stereoPannerNodeRenderer);
      this._pan = createAudioParam2(this, isOffline, nativeStereoPannerNode.pan);
    }
    get pan() {
      return this._pan;
    }
  };
};
const createStereoPannerNodeRendererFactory = (connectAudioParam2, createNativeStereoPannerNode2, getNativeAudioNode2, renderAutomation2, renderInputsOfAudioNode2) => {
  return () => {
    const renderedNativeStereoPannerNodes = /* @__PURE__ */ new WeakMap();
    const createStereoPannerNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeStereoPannerNode = getNativeAudioNode2(proxy);
      const nativeStereoPannerNodeIsOwnedByContext = isOwnedByContext(nativeStereoPannerNode, nativeOfflineAudioContext);
      if (!nativeStereoPannerNodeIsOwnedByContext) {
        const options = {
          channelCount: nativeStereoPannerNode.channelCount,
          channelCountMode: nativeStereoPannerNode.channelCountMode,
          channelInterpretation: nativeStereoPannerNode.channelInterpretation,
          pan: nativeStereoPannerNode.pan.value
        };
        nativeStereoPannerNode = createNativeStereoPannerNode2(nativeOfflineAudioContext, options);
      }
      renderedNativeStereoPannerNodes.set(nativeOfflineAudioContext, nativeStereoPannerNode);
      if (!nativeStereoPannerNodeIsOwnedByContext) {
        yield renderAutomation2(nativeOfflineAudioContext, proxy.pan, nativeStereoPannerNode.pan);
      } else {
        yield connectAudioParam2(nativeOfflineAudioContext, proxy.pan, nativeStereoPannerNode.pan);
      }
      if (isNativeAudioNodeFaker(nativeStereoPannerNode)) {
        yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeStereoPannerNode.inputs[0]);
      } else {
        yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeStereoPannerNode);
      }
      return nativeStereoPannerNode;
    });
    return {
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeStereoPannerNode = renderedNativeStereoPannerNodes.get(nativeOfflineAudioContext);
        if (renderedNativeStereoPannerNode !== void 0) {
          return Promise.resolve(renderedNativeStereoPannerNode);
        }
        return createStereoPannerNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const createTestAudioBufferConstructorSupport = (nativeAudioBufferConstructor2) => {
  return () => {
    if (nativeAudioBufferConstructor2 === null) {
      return false;
    }
    try {
      new nativeAudioBufferConstructor2({ length: 1, sampleRate: 44100 });
    } catch (e) {
      return false;
    }
    return true;
  };
};
const createTestAudioWorkletProcessorPostMessageSupport = (nativeAudioWorkletNodeConstructor2, nativeOfflineAudioContextConstructor2) => {
  return () => __async(void 0, null, function* () {
    if (nativeAudioWorkletNodeConstructor2 === null) {
      return true;
    }
    if (nativeOfflineAudioContextConstructor2 === null) {
      return false;
    }
    const blob = new Blob(['class A extends AudioWorkletProcessor{process(i){this.port.postMessage(i,[i[0][0].buffer])}}registerProcessor("a",A)'], {
      type: "application/javascript; charset=utf-8"
    });
    const offlineAudioContext = new nativeOfflineAudioContextConstructor2(1, 128, 44100);
    const url = URL.createObjectURL(blob);
    let isEmittingMessageEvents = false;
    let isEmittingProcessorErrorEvents = false;
    try {
      yield offlineAudioContext.audioWorklet.addModule(url);
      const audioWorkletNode = new nativeAudioWorkletNodeConstructor2(offlineAudioContext, "a", { numberOfOutputs: 0 });
      const oscillator = offlineAudioContext.createOscillator();
      audioWorkletNode.port.onmessage = () => isEmittingMessageEvents = true;
      audioWorkletNode.onprocessorerror = () => isEmittingProcessorErrorEvents = true;
      oscillator.connect(audioWorkletNode);
      oscillator.start(0);
      yield offlineAudioContext.startRendering();
      yield new Promise((resolve) => setTimeout(resolve));
    } catch (e) {
    } finally {
      URL.revokeObjectURL(url);
    }
    return isEmittingMessageEvents && !isEmittingProcessorErrorEvents;
  });
};
const createTestOfflineAudioContextCurrentTimeSupport = (createNativeGainNode2, nativeOfflineAudioContextConstructor2) => {
  return () => {
    if (nativeOfflineAudioContextConstructor2 === null) {
      return Promise.resolve(false);
    }
    const nativeOfflineAudioContext = new nativeOfflineAudioContextConstructor2(1, 1, 44100);
    const gainNode = createNativeGainNode2(nativeOfflineAudioContext, {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "discrete",
      gain: 0
    });
    return new Promise((resolve) => {
      nativeOfflineAudioContext.oncomplete = () => {
        gainNode.disconnect();
        resolve(nativeOfflineAudioContext.currentTime !== 0);
      };
      nativeOfflineAudioContext.startRendering();
    });
  };
};
const createUnknownError = () => new DOMException("", "UnknownError");
const DEFAULT_OPTIONS = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  curve: null,
  oversample: "none"
};
const createWaveShaperNodeConstructor = (audioNodeConstructor2, createInvalidStateError2, createNativeWaveShaperNode2, createWaveShaperNodeRenderer2, getNativeContext2, isNativeOfflineAudioContext2, setAudioNodeTailTime2) => {
  return class WaveShaperNode extends audioNodeConstructor2 {
    constructor(context2, options) {
      const nativeContext = getNativeContext2(context2);
      const mergedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS), options);
      const nativeWaveShaperNode = createNativeWaveShaperNode2(nativeContext, mergedOptions);
      const isOffline = isNativeOfflineAudioContext2(nativeContext);
      const waveShaperNodeRenderer = isOffline ? createWaveShaperNodeRenderer2() : null;
      super(context2, true, nativeWaveShaperNode, waveShaperNodeRenderer);
      this._isCurveNullified = false;
      this._nativeWaveShaperNode = nativeWaveShaperNode;
      setAudioNodeTailTime2(this, 1);
    }
    get curve() {
      if (this._isCurveNullified) {
        return null;
      }
      return this._nativeWaveShaperNode.curve;
    }
    set curve(value) {
      if (value === null) {
        this._isCurveNullified = true;
        this._nativeWaveShaperNode.curve = new Float32Array([0, 0]);
      } else {
        if (value.length < 2) {
          throw createInvalidStateError2();
        }
        this._isCurveNullified = false;
        this._nativeWaveShaperNode.curve = value;
      }
    }
    get oversample() {
      return this._nativeWaveShaperNode.oversample;
    }
    set oversample(value) {
      this._nativeWaveShaperNode.oversample = value;
    }
  };
};
const createWaveShaperNodeRendererFactory = (createNativeWaveShaperNode2, getNativeAudioNode2, renderInputsOfAudioNode2) => {
  return () => {
    const renderedNativeWaveShaperNodes = /* @__PURE__ */ new WeakMap();
    const createWaveShaperNode = (proxy, nativeOfflineAudioContext) => __async(void 0, null, function* () {
      let nativeWaveShaperNode = getNativeAudioNode2(proxy);
      const nativeWaveShaperNodeIsOwnedByContext = isOwnedByContext(nativeWaveShaperNode, nativeOfflineAudioContext);
      if (!nativeWaveShaperNodeIsOwnedByContext) {
        const options = {
          channelCount: nativeWaveShaperNode.channelCount,
          channelCountMode: nativeWaveShaperNode.channelCountMode,
          channelInterpretation: nativeWaveShaperNode.channelInterpretation,
          curve: nativeWaveShaperNode.curve,
          oversample: nativeWaveShaperNode.oversample
        };
        nativeWaveShaperNode = createNativeWaveShaperNode2(nativeOfflineAudioContext, options);
      }
      renderedNativeWaveShaperNodes.set(nativeOfflineAudioContext, nativeWaveShaperNode);
      if (isNativeAudioNodeFaker(nativeWaveShaperNode)) {
        yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeWaveShaperNode.inputs[0]);
      } else {
        yield renderInputsOfAudioNode2(proxy, nativeOfflineAudioContext, nativeWaveShaperNode);
      }
      return nativeWaveShaperNode;
    });
    return {
      render(proxy, nativeOfflineAudioContext) {
        const renderedNativeWaveShaperNode = renderedNativeWaveShaperNodes.get(nativeOfflineAudioContext);
        if (renderedNativeWaveShaperNode !== void 0) {
          return Promise.resolve(renderedNativeWaveShaperNode);
        }
        return createWaveShaperNode(proxy, nativeOfflineAudioContext);
      }
    };
  };
};
const createWindow = () => typeof window === "undefined" ? null : window;
const createWrapAudioBufferCopyChannelMethods = (convertNumberToUnsignedLong2, createIndexSizeError2) => {
  return (audioBuffer) => {
    audioBuffer.copyFromChannel = (destination, channelNumberAsNumber, bufferOffsetAsNumber = 0) => {
      const bufferOffset = convertNumberToUnsignedLong2(bufferOffsetAsNumber);
      const channelNumber = convertNumberToUnsignedLong2(channelNumberAsNumber);
      if (channelNumber >= audioBuffer.numberOfChannels) {
        throw createIndexSizeError2();
      }
      const audioBufferLength = audioBuffer.length;
      const channelData = audioBuffer.getChannelData(channelNumber);
      const destinationLength = destination.length;
      for (let i = bufferOffset < 0 ? -bufferOffset : 0; i + bufferOffset < audioBufferLength && i < destinationLength; i += 1) {
        destination[i] = channelData[i + bufferOffset];
      }
    };
    audioBuffer.copyToChannel = (source, channelNumberAsNumber, bufferOffsetAsNumber = 0) => {
      const bufferOffset = convertNumberToUnsignedLong2(bufferOffsetAsNumber);
      const channelNumber = convertNumberToUnsignedLong2(channelNumberAsNumber);
      if (channelNumber >= audioBuffer.numberOfChannels) {
        throw createIndexSizeError2();
      }
      const audioBufferLength = audioBuffer.length;
      const channelData = audioBuffer.getChannelData(channelNumber);
      const sourceLength = source.length;
      for (let i = bufferOffset < 0 ? -bufferOffset : 0; i + bufferOffset < audioBufferLength && i < sourceLength; i += 1) {
        channelData[i + bufferOffset] = source[i];
      }
    };
  };
};
const createWrapAudioBufferCopyChannelMethodsOutOfBounds = (convertNumberToUnsignedLong2) => {
  return (audioBuffer) => {
    audioBuffer.copyFromChannel = /* @__PURE__ */ ((copyFromChannel2) => {
      return (destination, channelNumberAsNumber, bufferOffsetAsNumber = 0) => {
        const bufferOffset = convertNumberToUnsignedLong2(bufferOffsetAsNumber);
        const channelNumber = convertNumberToUnsignedLong2(channelNumberAsNumber);
        if (bufferOffset < audioBuffer.length) {
          return copyFromChannel2.call(audioBuffer, destination, channelNumber, bufferOffset);
        }
      };
    })(audioBuffer.copyFromChannel);
    audioBuffer.copyToChannel = /* @__PURE__ */ ((copyToChannel2) => {
      return (source, channelNumberAsNumber, bufferOffsetAsNumber = 0) => {
        const bufferOffset = convertNumberToUnsignedLong2(bufferOffsetAsNumber);
        const channelNumber = convertNumberToUnsignedLong2(channelNumberAsNumber);
        if (bufferOffset < audioBuffer.length) {
          return copyToChannel2.call(audioBuffer, source, channelNumber, bufferOffset);
        }
      };
    })(audioBuffer.copyToChannel);
  };
};
const createWrapAudioBufferSourceNodeStopMethodNullifiedBuffer = (overwriteAccessors2) => {
  return (nativeAudioBufferSourceNode, nativeContext) => {
    const nullifiedBuffer = nativeContext.createBuffer(1, 1, 44100);
    if (nativeAudioBufferSourceNode.buffer === null) {
      nativeAudioBufferSourceNode.buffer = nullifiedBuffer;
    }
    overwriteAccessors2(nativeAudioBufferSourceNode, "buffer", (get) => () => {
      const value = get.call(nativeAudioBufferSourceNode);
      return value === nullifiedBuffer ? null : value;
    }, (set) => (value) => {
      return set.call(nativeAudioBufferSourceNode, value === null ? nullifiedBuffer : value);
    });
  };
};
const createWrapChannelMergerNode = (createInvalidStateError2, monitorConnections2) => {
  return (nativeContext, channelMergerNode) => {
    channelMergerNode.channelCount = 1;
    channelMergerNode.channelCountMode = "explicit";
    Object.defineProperty(channelMergerNode, "channelCount", {
      get: () => 1,
      set: () => {
        throw createInvalidStateError2();
      }
    });
    Object.defineProperty(channelMergerNode, "channelCountMode", {
      get: () => "explicit",
      set: () => {
        throw createInvalidStateError2();
      }
    });
    const audioBufferSourceNode = nativeContext.createBufferSource();
    const whenConnected = () => {
      const length = channelMergerNode.numberOfInputs;
      for (let i = 0; i < length; i += 1) {
        audioBufferSourceNode.connect(channelMergerNode, 0, i);
      }
    };
    const whenDisconnected = () => audioBufferSourceNode.disconnect(channelMergerNode);
    monitorConnections2(channelMergerNode, whenConnected, whenDisconnected);
  };
};
const getFirstSample = (audioBuffer, buffer, channelNumber) => {
  if (audioBuffer.copyFromChannel === void 0) {
    return audioBuffer.getChannelData(channelNumber)[0];
  }
  audioBuffer.copyFromChannel(buffer, channelNumber);
  return buffer[0];
};
const isDCCurve = (curve) => {
  if (curve === null) {
    return false;
  }
  const length = curve.length;
  if (length % 2 !== 0) {
    return curve[Math.floor(length / 2)] !== 0;
  }
  return curve[length / 2 - 1] + curve[length / 2] !== 0;
};
const overwriteAccessors = (object, property, createGetter, createSetter) => {
  let prototype = object;
  while (!prototype.hasOwnProperty(property)) {
    prototype = Object.getPrototypeOf(prototype);
  }
  const { get, set } = Object.getOwnPropertyDescriptor(prototype, property);
  Object.defineProperty(object, property, { get: createGetter(get), set: createSetter(set) });
};
const sanitizeAudioWorkletNodeOptions = (options) => {
  return __spreadProps(__spreadValues({}, options), {
    outputChannelCount: options.outputChannelCount !== void 0 ? options.outputChannelCount : options.numberOfInputs === 1 && options.numberOfOutputs === 1 ? [options.channelCount] : Array.from({ length: options.numberOfOutputs }, () => 1)
  });
};
const sanitizeChannelSplitterOptions = (options) => {
  return __spreadProps(__spreadValues({}, options), { channelCount: options.numberOfOutputs });
};
const sanitizePeriodicWaveOptions = (options) => {
  const { imag, real } = options;
  if (imag === void 0) {
    if (real === void 0) {
      return __spreadProps(__spreadValues({}, options), { imag: [0, 0], real: [0, 0] });
    }
    return __spreadProps(__spreadValues({}, options), { imag: Array.from(real, () => 0), real });
  }
  if (real === void 0) {
    return __spreadProps(__spreadValues({}, options), { imag, real: Array.from(imag, () => 0) });
  }
  return __spreadProps(__spreadValues({}, options), { imag, real });
};
const setValueAtTimeUntilPossible = (audioParam, value, startTime) => {
  try {
    audioParam.setValueAtTime(value, startTime);
  } catch (err) {
    if (err.code !== 9) {
      throw err;
    }
    setValueAtTimeUntilPossible(audioParam, value, startTime + 1e-7);
  }
};
const testAudioBufferSourceNodeStartMethodConsecutiveCallsSupport = (nativeContext) => {
  const nativeAudioBufferSourceNode = nativeContext.createBufferSource();
  nativeAudioBufferSourceNode.start();
  try {
    nativeAudioBufferSourceNode.start();
  } catch (e) {
    return true;
  }
  return false;
};
const testAudioBufferSourceNodeStartMethodOffsetClampingSupport = (nativeContext) => {
  const nativeAudioBufferSourceNode = nativeContext.createBufferSource();
  const nativeAudioBuffer = nativeContext.createBuffer(1, 1, 44100);
  nativeAudioBufferSourceNode.buffer = nativeAudioBuffer;
  try {
    nativeAudioBufferSourceNode.start(0, 1);
  } catch (e) {
    return false;
  }
  return true;
};
const testAudioBufferSourceNodeStopMethodNullifiedBufferSupport = (nativeContext) => {
  const nativeAudioBufferSourceNode = nativeContext.createBufferSource();
  nativeAudioBufferSourceNode.start();
  try {
    nativeAudioBufferSourceNode.stop();
  } catch (e) {
    return false;
  }
  return true;
};
const testAudioScheduledSourceNodeStartMethodNegativeParametersSupport = (nativeContext) => {
  const nativeAudioBufferSourceNode = nativeContext.createOscillator();
  try {
    nativeAudioBufferSourceNode.start(-1);
  } catch (err) {
    return err instanceof RangeError;
  }
  return false;
};
const testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport = (nativeContext) => {
  const nativeAudioBuffer = nativeContext.createBuffer(1, 1, 44100);
  const nativeAudioBufferSourceNode = nativeContext.createBufferSource();
  nativeAudioBufferSourceNode.buffer = nativeAudioBuffer;
  nativeAudioBufferSourceNode.start();
  nativeAudioBufferSourceNode.stop();
  try {
    nativeAudioBufferSourceNode.stop();
    return true;
  } catch (e) {
    return false;
  }
};
const testAudioScheduledSourceNodeStopMethodNegativeParametersSupport = (nativeContext) => {
  const nativeAudioBufferSourceNode = nativeContext.createOscillator();
  try {
    nativeAudioBufferSourceNode.stop(-1);
  } catch (err) {
    return err instanceof RangeError;
  }
  return false;
};
const testAudioWorkletNodeOptionsClonability = (audioWorkletNodeOptions) => {
  const { port1, port2 } = new MessageChannel();
  try {
    port1.postMessage(audioWorkletNodeOptions);
  } finally {
    port1.close();
    port2.close();
  }
};
const wrapAudioBufferSourceNodeStartMethodOffsetClamping = (nativeAudioBufferSourceNode) => {
  nativeAudioBufferSourceNode.start = /* @__PURE__ */ ((start2) => {
    return (when = 0, offset = 0, duration) => {
      const buffer = nativeAudioBufferSourceNode.buffer;
      const clampedOffset = buffer === null ? offset : Math.min(buffer.duration, offset);
      if (buffer !== null && clampedOffset > buffer.duration - 0.5 / nativeAudioBufferSourceNode.context.sampleRate) {
        start2.call(nativeAudioBufferSourceNode, when, 0, 0);
      } else {
        start2.call(nativeAudioBufferSourceNode, when, clampedOffset, duration);
      }
    };
  })(nativeAudioBufferSourceNode.start);
};
const wrapAudioScheduledSourceNodeStopMethodConsecutiveCalls = (nativeAudioScheduledSourceNode, nativeContext) => {
  const nativeGainNode = nativeContext.createGain();
  nativeAudioScheduledSourceNode.connect(nativeGainNode);
  const disconnectGainNode = /* @__PURE__ */ ((disconnect2) => {
    return () => {
      disconnect2.call(nativeAudioScheduledSourceNode, nativeGainNode);
      nativeAudioScheduledSourceNode.removeEventListener("ended", disconnectGainNode);
    };
  })(nativeAudioScheduledSourceNode.disconnect);
  nativeAudioScheduledSourceNode.addEventListener("ended", disconnectGainNode);
  interceptConnections(nativeAudioScheduledSourceNode, nativeGainNode);
  nativeAudioScheduledSourceNode.stop = /* @__PURE__ */ ((stop) => {
    let isStopped = false;
    return (when = 0) => {
      if (isStopped) {
        try {
          stop.call(nativeAudioScheduledSourceNode, when);
        } catch (e) {
          nativeGainNode.gain.setValueAtTime(0, when);
        }
      } else {
        stop.call(nativeAudioScheduledSourceNode, when);
        isStopped = true;
      }
    };
  })(nativeAudioScheduledSourceNode.stop);
};
const wrapEventListener = (target, eventListener) => {
  return (event) => {
    const descriptor = { value: target };
    Object.defineProperties(event, {
      currentTarget: descriptor,
      target: descriptor
    });
    if (typeof eventListener === "function") {
      return eventListener.call(target, event);
    }
    return eventListener.handleEvent.call(target, event);
  };
};
const addActiveInputConnectionToAudioNode = createAddActiveInputConnectionToAudioNode(insertElementInSet);
const addPassiveInputConnectionToAudioNode = createAddPassiveInputConnectionToAudioNode(insertElementInSet);
const deleteActiveInputConnectionToAudioNode = createDeleteActiveInputConnectionToAudioNode(pickElementFromSet);
const audioNodeTailTimeStore = /* @__PURE__ */ new WeakMap();
const getAudioNodeTailTime = createGetAudioNodeTailTime(audioNodeTailTimeStore);
const cacheTestResult = createCacheTestResult(/* @__PURE__ */ new Map(), /* @__PURE__ */ new WeakMap());
const window$1 = createWindow();
const createNativeAnalyserNode = createNativeAnalyserNodeFactory(cacheTestResult, createIndexSizeError);
const getAudioNodeRenderer = createGetAudioNodeRenderer(getAudioNodeConnections);
const renderInputsOfAudioNode = createRenderInputsOfAudioNode(getAudioNodeConnections, getAudioNodeRenderer, isPartOfACycle);
const createAnalyserNodeRenderer = createAnalyserNodeRendererFactory(createNativeAnalyserNode, getNativeAudioNode, renderInputsOfAudioNode);
const getNativeContext = createGetNativeContext(CONTEXT_STORE);
const nativeOfflineAudioContextConstructor = createNativeOfflineAudioContextConstructor(window$1);
const isNativeOfflineAudioContext = createIsNativeOfflineAudioContext(nativeOfflineAudioContextConstructor);
const audioParamAudioNodeStore = /* @__PURE__ */ new WeakMap();
const eventTargetConstructor = createEventTargetConstructor(wrapEventListener);
const nativeAudioContextConstructor = createNativeAudioContextConstructor(window$1);
const isNativeAudioContext = createIsNativeAudioContext(nativeAudioContextConstructor);
const isNativeAudioNode = createIsNativeAudioNode(window$1);
const isNativeAudioParam = createIsNativeAudioParam(window$1);
const nativeAudioWorkletNodeConstructor = createNativeAudioWorkletNodeConstructor(window$1);
const audioNodeConstructor = createAudioNodeConstructor(createAddAudioNodeConnections(AUDIO_NODE_CONNECTIONS_STORE), createAddConnectionToAudioNode(addActiveInputConnectionToAudioNode, addPassiveInputConnectionToAudioNode, connectNativeAudioNodeToNativeAudioNode, deleteActiveInputConnectionToAudioNode, disconnectNativeAudioNodeFromNativeAudioNode, getAudioNodeConnections, getAudioNodeTailTime, getEventListenersOfAudioNode, getNativeAudioNode, insertElementInSet, isActiveAudioNode, isPartOfACycle, isPassiveAudioNode), cacheTestResult, createIncrementCycleCounterFactory(CYCLE_COUNTERS, disconnectNativeAudioNodeFromNativeAudioNode, getAudioNodeConnections, getNativeAudioNode, getNativeAudioParam, isActiveAudioNode), createIndexSizeError, createInvalidAccessError, createNotSupportedError, createDecrementCycleCounter(connectNativeAudioNodeToNativeAudioNode, CYCLE_COUNTERS, getAudioNodeConnections, getNativeAudioNode, getNativeAudioParam, getNativeContext, isActiveAudioNode, isNativeOfflineAudioContext), createDetectCycles(audioParamAudioNodeStore, getAudioNodeConnections, getValueForKey), eventTargetConstructor, getNativeContext, isNativeAudioContext, isNativeAudioNode, isNativeAudioParam, isNativeOfflineAudioContext, nativeAudioWorkletNodeConstructor);
const analyserNodeConstructor = createAnalyserNodeConstructor(audioNodeConstructor, createAnalyserNodeRenderer, createIndexSizeError, createNativeAnalyserNode, getNativeContext, isNativeOfflineAudioContext);
const audioBufferStore = /* @__PURE__ */ new WeakSet();
const nativeAudioBufferConstructor = createNativeAudioBufferConstructor(window$1);
const convertNumberToUnsignedLong = createConvertNumberToUnsignedLong(new Uint32Array(1));
const wrapAudioBufferCopyChannelMethods = createWrapAudioBufferCopyChannelMethods(convertNumberToUnsignedLong, createIndexSizeError);
const wrapAudioBufferCopyChannelMethodsOutOfBounds = createWrapAudioBufferCopyChannelMethodsOutOfBounds(convertNumberToUnsignedLong);
const audioBufferConstructor = createAudioBufferConstructor(audioBufferStore, cacheTestResult, createNotSupportedError, nativeAudioBufferConstructor, nativeOfflineAudioContextConstructor, createTestAudioBufferConstructorSupport(nativeAudioBufferConstructor), wrapAudioBufferCopyChannelMethods, wrapAudioBufferCopyChannelMethodsOutOfBounds);
const addSilentConnection = createAddSilentConnection(createNativeGainNode);
const renderInputsOfAudioParam = createRenderInputsOfAudioParam(getAudioNodeRenderer, getAudioParamConnections, isPartOfACycle);
const connectAudioParam = createConnectAudioParam(renderInputsOfAudioParam);
const createNativeAudioBufferSourceNode = createNativeAudioBufferSourceNodeFactory(addSilentConnection, cacheTestResult, testAudioBufferSourceNodeStartMethodConsecutiveCallsSupport, testAudioBufferSourceNodeStartMethodOffsetClampingSupport, testAudioBufferSourceNodeStopMethodNullifiedBufferSupport, testAudioScheduledSourceNodeStartMethodNegativeParametersSupport, testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport, testAudioScheduledSourceNodeStopMethodNegativeParametersSupport, wrapAudioBufferSourceNodeStartMethodOffsetClamping, createWrapAudioBufferSourceNodeStopMethodNullifiedBuffer(overwriteAccessors), wrapAudioScheduledSourceNodeStopMethodConsecutiveCalls);
const renderAutomation = createRenderAutomation(createGetAudioParamRenderer(getAudioParamConnections), renderInputsOfAudioParam);
const createAudioBufferSourceNodeRenderer = createAudioBufferSourceNodeRendererFactory(connectAudioParam, createNativeAudioBufferSourceNode, getNativeAudioNode, renderAutomation, renderInputsOfAudioNode);
const createAudioParam = createAudioParamFactory(createAddAudioParamConnections(AUDIO_PARAM_CONNECTIONS_STORE), audioParamAudioNodeStore, AUDIO_PARAM_STORE, createAudioParamRenderer, createCancelAndHoldAutomationEvent, createCancelScheduledValuesAutomationEvent, createExponentialRampToValueAutomationEvent, createLinearRampToValueAutomationEvent, createSetTargetAutomationEvent, createSetValueAutomationEvent, createSetValueCurveAutomationEvent, nativeAudioContextConstructor, setValueAtTimeUntilPossible);
const audioBufferSourceNodeConstructor = createAudioBufferSourceNodeConstructor(audioNodeConstructor, createAudioBufferSourceNodeRenderer, createAudioParam, createInvalidStateError, createNativeAudioBufferSourceNode, getNativeContext, isNativeOfflineAudioContext, wrapEventListener);
const audioDestinationNodeConstructor = createAudioDestinationNodeConstructor(audioNodeConstructor, createAudioDestinationNodeRenderer, createIndexSizeError, createInvalidStateError, createNativeAudioDestinationNodeFactory(createNativeGainNode, overwriteAccessors), getNativeContext, isNativeOfflineAudioContext, renderInputsOfAudioNode);
const createBiquadFilterNodeRenderer = createBiquadFilterNodeRendererFactory(connectAudioParam, createNativeBiquadFilterNode, getNativeAudioNode, renderAutomation, renderInputsOfAudioNode);
const setAudioNodeTailTime = createSetAudioNodeTailTime(audioNodeTailTimeStore);
const biquadFilterNodeConstructor = createBiquadFilterNodeConstructor(audioNodeConstructor, createAudioParam, createBiquadFilterNodeRenderer, createInvalidAccessError, createNativeBiquadFilterNode, getNativeContext, isNativeOfflineAudioContext, setAudioNodeTailTime);
const monitorConnections = createMonitorConnections(insertElementInSet, isNativeAudioNode);
const wrapChannelMergerNode = createWrapChannelMergerNode(createInvalidStateError, monitorConnections);
const createNativeChannelMergerNode = createNativeChannelMergerNodeFactory(nativeAudioContextConstructor, wrapChannelMergerNode);
const createChannelMergerNodeRenderer = createChannelMergerNodeRendererFactory(createNativeChannelMergerNode, getNativeAudioNode, renderInputsOfAudioNode);
const channelMergerNodeConstructor = createChannelMergerNodeConstructor(audioNodeConstructor, createChannelMergerNodeRenderer, createNativeChannelMergerNode, getNativeContext, isNativeOfflineAudioContext);
const createChannelSplitterNodeRenderer = createChannelSplitterNodeRendererFactory(createNativeChannelSplitterNode, getNativeAudioNode, renderInputsOfAudioNode);
const channelSplitterNodeConstructor = createChannelSplitterNodeConstructor(audioNodeConstructor, createChannelSplitterNodeRenderer, createNativeChannelSplitterNode, getNativeContext, isNativeOfflineAudioContext, sanitizeChannelSplitterOptions);
const createNativeConstantSourceNodeFaker = createNativeConstantSourceNodeFakerFactory(addSilentConnection, createNativeAudioBufferSourceNode, createNativeGainNode, monitorConnections);
const createNativeConstantSourceNode = createNativeConstantSourceNodeFactory(addSilentConnection, cacheTestResult, createNativeConstantSourceNodeFaker, testAudioScheduledSourceNodeStartMethodNegativeParametersSupport, testAudioScheduledSourceNodeStopMethodNegativeParametersSupport);
const createConstantSourceNodeRenderer = createConstantSourceNodeRendererFactory(connectAudioParam, createNativeConstantSourceNode, getNativeAudioNode, renderAutomation, renderInputsOfAudioNode);
const constantSourceNodeConstructor = createConstantSourceNodeConstructor(audioNodeConstructor, createAudioParam, createConstantSourceNodeRenderer, createNativeConstantSourceNode, getNativeContext, isNativeOfflineAudioContext, wrapEventListener);
const createNativeConvolverNode = createNativeConvolverNodeFactory(createNotSupportedError, overwriteAccessors);
const createConvolverNodeRenderer = createConvolverNodeRendererFactory(createNativeConvolverNode, getNativeAudioNode, renderInputsOfAudioNode);
const convolverNodeConstructor = createConvolverNodeConstructor(audioNodeConstructor, createConvolverNodeRenderer, createNativeConvolverNode, getNativeContext, isNativeOfflineAudioContext, setAudioNodeTailTime);
const createDelayNodeRenderer = createDelayNodeRendererFactory(connectAudioParam, createNativeDelayNode, getNativeAudioNode, renderAutomation, renderInputsOfAudioNode);
const delayNodeConstructor = createDelayNodeConstructor(audioNodeConstructor, createAudioParam, createDelayNodeRenderer, createNativeDelayNode, getNativeContext, isNativeOfflineAudioContext, setAudioNodeTailTime);
const createNativeDynamicsCompressorNode = createNativeDynamicsCompressorNodeFactory(createNotSupportedError);
const createDynamicsCompressorNodeRenderer = createDynamicsCompressorNodeRendererFactory(connectAudioParam, createNativeDynamicsCompressorNode, getNativeAudioNode, renderAutomation, renderInputsOfAudioNode);
const dynamicsCompressorNodeConstructor = createDynamicsCompressorNodeConstructor(audioNodeConstructor, createAudioParam, createDynamicsCompressorNodeRenderer, createNativeDynamicsCompressorNode, createNotSupportedError, getNativeContext, isNativeOfflineAudioContext, setAudioNodeTailTime);
const createGainNodeRenderer = createGainNodeRendererFactory(connectAudioParam, createNativeGainNode, getNativeAudioNode, renderAutomation, renderInputsOfAudioNode);
const gainNodeConstructor = createGainNodeConstructor(audioNodeConstructor, createAudioParam, createGainNodeRenderer, createNativeGainNode, getNativeContext, isNativeOfflineAudioContext);
const createNativeIIRFilterNodeFaker = createNativeIIRFilterNodeFakerFactory(createInvalidAccessError, createInvalidStateError, createNativeScriptProcessorNode, createNotSupportedError);
const renderNativeOfflineAudioContext = createRenderNativeOfflineAudioContext(cacheTestResult, createNativeGainNode, createNativeScriptProcessorNode, createTestOfflineAudioContextCurrentTimeSupport(createNativeGainNode, nativeOfflineAudioContextConstructor));
const createIIRFilterNodeRenderer = createIIRFilterNodeRendererFactory(createNativeAudioBufferSourceNode, getNativeAudioNode, nativeOfflineAudioContextConstructor, renderInputsOfAudioNode, renderNativeOfflineAudioContext);
const createNativeIIRFilterNode = createNativeIIRFilterNodeFactory(createNativeIIRFilterNodeFaker);
const iIRFilterNodeConstructor = createIIRFilterNodeConstructor(audioNodeConstructor, createNativeIIRFilterNode, createIIRFilterNodeRenderer, getNativeContext, isNativeOfflineAudioContext, setAudioNodeTailTime);
const createAudioListener = createAudioListenerFactory(createAudioParam, createNativeChannelMergerNode, createNativeConstantSourceNode, createNativeScriptProcessorNode, createNotSupportedError, getFirstSample, isNativeOfflineAudioContext, overwriteAccessors);
const unrenderedAudioWorkletNodeStore = /* @__PURE__ */ new WeakMap();
const minimalBaseAudioContextConstructor = createMinimalBaseAudioContextConstructor(audioDestinationNodeConstructor, createAudioListener, eventTargetConstructor, isNativeOfflineAudioContext, unrenderedAudioWorkletNodeStore, wrapEventListener);
const createNativeOscillatorNode = createNativeOscillatorNodeFactory(addSilentConnection, cacheTestResult, testAudioScheduledSourceNodeStartMethodNegativeParametersSupport, testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport, testAudioScheduledSourceNodeStopMethodNegativeParametersSupport, wrapAudioScheduledSourceNodeStopMethodConsecutiveCalls);
const createOscillatorNodeRenderer = createOscillatorNodeRendererFactory(connectAudioParam, createNativeOscillatorNode, getNativeAudioNode, renderAutomation, renderInputsOfAudioNode);
const oscillatorNodeConstructor = createOscillatorNodeConstructor(audioNodeConstructor, createAudioParam, createNativeOscillatorNode, createOscillatorNodeRenderer, getNativeContext, isNativeOfflineAudioContext, wrapEventListener);
const createConnectedNativeAudioBufferSourceNode = createConnectedNativeAudioBufferSourceNodeFactory(createNativeAudioBufferSourceNode);
const createNativeWaveShaperNodeFaker = createNativeWaveShaperNodeFakerFactory(createConnectedNativeAudioBufferSourceNode, createInvalidStateError, createNativeGainNode, isDCCurve, monitorConnections);
const createNativeWaveShaperNode = createNativeWaveShaperNodeFactory(createConnectedNativeAudioBufferSourceNode, createInvalidStateError, createNativeWaveShaperNodeFaker, isDCCurve, monitorConnections, nativeAudioContextConstructor, overwriteAccessors);
const createNativePannerNodeFaker = createNativePannerNodeFakerFactory(connectNativeAudioNodeToNativeAudioNode, createInvalidStateError, createNativeChannelMergerNode, createNativeGainNode, createNativeScriptProcessorNode, createNativeWaveShaperNode, createNotSupportedError, disconnectNativeAudioNodeFromNativeAudioNode, getFirstSample, monitorConnections);
const createNativePannerNode = createNativePannerNodeFactory(createNativePannerNodeFaker);
const createPannerNodeRenderer = createPannerNodeRendererFactory(connectAudioParam, createNativeChannelMergerNode, createNativeConstantSourceNode, createNativeGainNode, createNativePannerNode, getNativeAudioNode, nativeOfflineAudioContextConstructor, renderAutomation, renderInputsOfAudioNode, renderNativeOfflineAudioContext);
const pannerNodeConstructor = createPannerNodeConstructor(audioNodeConstructor, createAudioParam, createNativePannerNode, createPannerNodeRenderer, getNativeContext, isNativeOfflineAudioContext, setAudioNodeTailTime);
const createNativePeriodicWave = createNativePeriodicWaveFactory(createIndexSizeError);
const periodicWaveConstructor = createPeriodicWaveConstructor(createNativePeriodicWave, getNativeContext, /* @__PURE__ */ new WeakSet(), sanitizePeriodicWaveOptions);
const nativeStereoPannerNodeFakerFactory = createNativeStereoPannerNodeFakerFactory(createNativeChannelMergerNode, createNativeChannelSplitterNode, createNativeGainNode, createNativeWaveShaperNode, createNotSupportedError, monitorConnections);
const createNativeStereoPannerNode = createNativeStereoPannerNodeFactory(nativeStereoPannerNodeFakerFactory, createNotSupportedError);
const createStereoPannerNodeRenderer = createStereoPannerNodeRendererFactory(connectAudioParam, createNativeStereoPannerNode, getNativeAudioNode, renderAutomation, renderInputsOfAudioNode);
const stereoPannerNodeConstructor = createStereoPannerNodeConstructor(audioNodeConstructor, createAudioParam, createNativeStereoPannerNode, createStereoPannerNodeRenderer, getNativeContext, isNativeOfflineAudioContext);
const createWaveShaperNodeRenderer = createWaveShaperNodeRendererFactory(createNativeWaveShaperNode, getNativeAudioNode, renderInputsOfAudioNode);
const waveShaperNodeConstructor = createWaveShaperNodeConstructor(audioNodeConstructor, createInvalidStateError, createNativeWaveShaperNode, createWaveShaperNodeRenderer, getNativeContext, isNativeOfflineAudioContext, setAudioNodeTailTime);
const isSecureContext = createIsSecureContext(window$1);
const exposeCurrentFrameAndCurrentTime = createExposeCurrentFrameAndCurrentTime(window$1);
const backupOfflineAudioContextStore = /* @__PURE__ */ new WeakMap();
const getOrCreateBackupOfflineAudioContext = createGetOrCreateBackupOfflineAudioContext(backupOfflineAudioContextStore, nativeOfflineAudioContextConstructor);
const addAudioWorkletModule = isSecureContext ? createAddAudioWorkletModule(
  cacheTestResult,
  createNotSupportedError,
  createEvaluateSource(window$1),
  exposeCurrentFrameAndCurrentTime,
  createFetchSource(createAbortError),
  getNativeContext,
  getOrCreateBackupOfflineAudioContext,
  isNativeOfflineAudioContext,
  nativeAudioWorkletNodeConstructor,
  /* @__PURE__ */ new WeakMap(),
  /* @__PURE__ */ new WeakMap(),
  createTestAudioWorkletProcessorPostMessageSupport(nativeAudioWorkletNodeConstructor, nativeOfflineAudioContextConstructor),
  window$1
) : void 0;
const isNativeContext = createIsNativeContext(isNativeAudioContext, isNativeOfflineAudioContext);
const decodeAudioData = createDecodeAudioData(audioBufferStore, cacheTestResult, createDataCloneError, createEncodingError, /* @__PURE__ */ new WeakSet(), getNativeContext, isNativeContext, testAudioBufferCopyChannelMethodsOutOfBoundsSupport, testPromiseSupport, wrapAudioBufferCopyChannelMethods, wrapAudioBufferCopyChannelMethodsOutOfBounds);
const baseAudioContextConstructor = createBaseAudioContextConstructor(addAudioWorkletModule, analyserNodeConstructor, audioBufferConstructor, audioBufferSourceNodeConstructor, biquadFilterNodeConstructor, channelMergerNodeConstructor, channelSplitterNodeConstructor, constantSourceNodeConstructor, convolverNodeConstructor, decodeAudioData, delayNodeConstructor, dynamicsCompressorNodeConstructor, gainNodeConstructor, iIRFilterNodeConstructor, minimalBaseAudioContextConstructor, oscillatorNodeConstructor, pannerNodeConstructor, periodicWaveConstructor, stereoPannerNodeConstructor, waveShaperNodeConstructor);
const mediaElementAudioSourceNodeConstructor = createMediaElementAudioSourceNodeConstructor(audioNodeConstructor, createNativeMediaElementAudioSourceNode, getNativeContext, isNativeOfflineAudioContext);
const mediaStreamAudioDestinationNodeConstructor = createMediaStreamAudioDestinationNodeConstructor(audioNodeConstructor, createNativeMediaStreamAudioDestinationNode, getNativeContext, isNativeOfflineAudioContext);
const mediaStreamAudioSourceNodeConstructor = createMediaStreamAudioSourceNodeConstructor(audioNodeConstructor, createNativeMediaStreamAudioSourceNode, getNativeContext, isNativeOfflineAudioContext);
const createNativeMediaStreamTrackAudioSourceNode = createNativeMediaStreamTrackAudioSourceNodeFactory(createInvalidStateError, isNativeOfflineAudioContext);
const mediaStreamTrackAudioSourceNodeConstructor = createMediaStreamTrackAudioSourceNodeConstructor(audioNodeConstructor, createNativeMediaStreamTrackAudioSourceNode, getNativeContext);
const audioContextConstructor = createAudioContextConstructor(baseAudioContextConstructor, createInvalidStateError, createNotSupportedError, createUnknownError, mediaElementAudioSourceNodeConstructor, mediaStreamAudioDestinationNodeConstructor, mediaStreamAudioSourceNodeConstructor, mediaStreamTrackAudioSourceNodeConstructor, nativeAudioContextConstructor);
const getUnrenderedAudioWorkletNodes = createGetUnrenderedAudioWorkletNodes(unrenderedAudioWorkletNodeStore);
const addUnrenderedAudioWorkletNode = createAddUnrenderedAudioWorkletNode(getUnrenderedAudioWorkletNodes);
const connectMultipleOutputs = createConnectMultipleOutputs(createIndexSizeError);
const deleteUnrenderedAudioWorkletNode = createDeleteUnrenderedAudioWorkletNode(getUnrenderedAudioWorkletNodes);
const disconnectMultipleOutputs = createDisconnectMultipleOutputs(createIndexSizeError);
const activeAudioWorkletNodeInputsStore = /* @__PURE__ */ new WeakMap();
const getActiveAudioWorkletNodeInputs = createGetActiveAudioWorkletNodeInputs(activeAudioWorkletNodeInputsStore, getValueForKey);
const createNativeAudioWorkletNodeFaker = createNativeAudioWorkletNodeFakerFactory(connectMultipleOutputs, createIndexSizeError, createInvalidStateError, createNativeChannelMergerNode, createNativeChannelSplitterNode, createNativeConstantSourceNode, createNativeGainNode, createNativeScriptProcessorNode, createNotSupportedError, disconnectMultipleOutputs, exposeCurrentFrameAndCurrentTime, getActiveAudioWorkletNodeInputs, monitorConnections);
const createNativeAudioWorkletNode = createNativeAudioWorkletNodeFactory(createInvalidStateError, createNativeAudioWorkletNodeFaker, createNativeGainNode, createNotSupportedError, monitorConnections);
const createAudioWorkletNodeRenderer = createAudioWorkletNodeRendererFactory(connectAudioParam, connectMultipleOutputs, createNativeAudioBufferSourceNode, createNativeChannelMergerNode, createNativeChannelSplitterNode, createNativeConstantSourceNode, createNativeGainNode, deleteUnrenderedAudioWorkletNode, disconnectMultipleOutputs, exposeCurrentFrameAndCurrentTime, getNativeAudioNode, nativeAudioWorkletNodeConstructor, nativeOfflineAudioContextConstructor, renderAutomation, renderInputsOfAudioNode, renderNativeOfflineAudioContext);
const getBackupOfflineAudioContext = createGetBackupOfflineAudioContext(backupOfflineAudioContextStore);
const setActiveAudioWorkletNodeInputs = createSetActiveAudioWorkletNodeInputs(activeAudioWorkletNodeInputsStore);
const audioWorkletNodeConstructor = isSecureContext ? createAudioWorkletNodeConstructor(addUnrenderedAudioWorkletNode, audioNodeConstructor, createAudioParam, createAudioWorkletNodeRenderer, createNativeAudioWorkletNode, getAudioNodeConnections, getBackupOfflineAudioContext, getNativeContext, isNativeOfflineAudioContext, nativeAudioWorkletNodeConstructor, sanitizeAudioWorkletNodeOptions, setActiveAudioWorkletNodeInputs, testAudioWorkletNodeOptionsClonability, wrapEventListener) : void 0;
const createNativeOfflineAudioContext = createCreateNativeOfflineAudioContext(createNotSupportedError, nativeOfflineAudioContextConstructor);
const startRendering = createStartRendering(audioBufferStore, cacheTestResult, getAudioNodeRenderer, getUnrenderedAudioWorkletNodes, renderNativeOfflineAudioContext, testAudioBufferCopyChannelMethodsOutOfBoundsSupport, wrapAudioBufferCopyChannelMethods, wrapAudioBufferCopyChannelMethodsOutOfBounds);
const offlineAudioContextConstructor = createOfflineAudioContextConstructor(baseAudioContextConstructor, cacheTestResult, createInvalidStateError, createNativeOfflineAudioContext, startRendering);
const isAnyAudioContext = createIsAnyAudioContext(CONTEXT_STORE, isNativeAudioContext);
const isAnyAudioNode = createIsAnyAudioNode(AUDIO_NODE_STORE, isNativeAudioNode);
const isAnyAudioParam = createIsAnyAudioParam(AUDIO_PARAM_STORE, isNativeAudioParam);
const isAnyOfflineAudioContext = createIsAnyOfflineAudioContext(CONTEXT_STORE, isNativeOfflineAudioContext);
function assert(statement, error) {
  if (!statement) {
    throw new Error(error);
  }
}
function assertRange(value, gte, lte = Infinity) {
  if (!(gte <= value && value <= lte)) {
    throw new RangeError(`Value must be within [${gte}, ${lte}], got: ${value}`);
  }
}
function assertContextRunning(context2) {
  if (!context2.isOffline && context2.state !== "running") {
    warn('The AudioContext is "suspended". Invoke Tone.start() from a user action to start the audio.');
  }
}
let defaultLogger = console;
function log(...args) {
  defaultLogger.log(...args);
}
function warn(...args) {
  defaultLogger.warn(...args);
}
function isUndef(arg) {
  return typeof arg === "undefined";
}
function isDefined(arg) {
  return !isUndef(arg);
}
function isFunction(arg) {
  return typeof arg === "function";
}
function isNumber(arg) {
  return typeof arg === "number";
}
function isObject(arg) {
  return Object.prototype.toString.call(arg) === "[object Object]" && arg.constructor === Object;
}
function isBoolean(arg) {
  return typeof arg === "boolean";
}
function isArray(arg) {
  return Array.isArray(arg);
}
function isString(arg) {
  return typeof arg === "string";
}
function isNote(arg) {
  return isString(arg) && /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i.test(arg);
}
function createAudioContext(options) {
  return new audioContextConstructor(options);
}
function createOfflineAudioContext(channels, length, sampleRate) {
  return new offlineAudioContextConstructor(channels, length, sampleRate);
}
const theWindow = typeof self === "object" ? self : null;
const hasAudioContext = theWindow && (theWindow.hasOwnProperty("AudioContext") || theWindow.hasOwnProperty("webkitAudioContext"));
function createAudioWorkletNode(context2, name, options) {
  assert(isDefined(audioWorkletNodeConstructor), "This node only works in a secure context (https or localhost)");
  return new audioWorkletNodeConstructor(context2, name, options);
}
function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
class Ticker {
  constructor(callback, type, updateInterval) {
    this._callback = callback;
    this._type = type;
    this._updateInterval = updateInterval;
    this._createClock();
  }
  _createWorker() {
    const blob = new Blob([
      `
			// the initial timeout time
			let timeoutTime =  ${(this._updateInterval * 1e3).toFixed(1)};
			// onmessage callback
			self.onmessage = function(msg){
				timeoutTime = parseInt(msg.data);
			};
			// the tick function which posts a message
			// and schedules a new tick
			function tick(){
				setTimeout(tick, timeoutTime);
				self.postMessage('tick');
			}
			// call tick initially
			tick();
			`
    ], { type: "text/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    const worker = new Worker(blobUrl);
    worker.onmessage = this._callback.bind(this);
    this._worker = worker;
  }
  _createTimeout() {
    this._timeout = setTimeout(() => {
      this._createTimeout();
      this._callback();
    }, this._updateInterval * 1e3);
  }
  _createClock() {
    if (this._type === "worker") {
      try {
        this._createWorker();
      } catch (e) {
        this._type = "timeout";
        this._createClock();
      }
    } else if (this._type === "timeout") {
      this._createTimeout();
    }
  }
  _disposeClock() {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = 0;
    }
    if (this._worker) {
      this._worker.terminate();
      this._worker.onmessage = null;
    }
  }
  get updateInterval() {
    return this._updateInterval;
  }
  set updateInterval(interval) {
    this._updateInterval = Math.max(interval, 128 / 44100);
    if (this._type === "worker") {
      this._worker.postMessage(Math.max(interval * 1e3, 1));
    }
  }
  get type() {
    return this._type;
  }
  set type(type) {
    this._disposeClock();
    this._type = type;
    this._createClock();
  }
  dispose() {
    this._disposeClock();
  }
}
function isAudioParam(arg) {
  return isAnyAudioParam(arg);
}
function isAudioNode(arg) {
  return isAnyAudioNode(arg);
}
function isOfflineAudioContext(arg) {
  return isAnyOfflineAudioContext(arg);
}
function isAudioContext(arg) {
  return isAnyAudioContext(arg);
}
function isAudioBuffer(arg) {
  return arg instanceof AudioBuffer;
}
function noCopy(key, arg) {
  return key === "value" || isAudioParam(arg) || isAudioNode(arg) || isAudioBuffer(arg);
}
function deepMerge(target, ...sources) {
  if (!sources.length) {
    return target;
  }
  const source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (noCopy(key, source[key])) {
        target[key] = source[key];
      } else if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return deepMerge(target, ...sources);
}
function deepEquals(arrayA, arrayB) {
  return arrayA.length === arrayB.length && arrayA.every((element, index2) => arrayB[index2] === element);
}
function optionsFromArguments(defaults, argsArray, keys = [], objKey) {
  const opts = {};
  const args = Array.from(argsArray);
  if (isObject(args[0]) && objKey && !Reflect.has(args[0], objKey)) {
    const partOfDefaults = Object.keys(args[0]).some((key) => Reflect.has(defaults, key));
    if (!partOfDefaults) {
      deepMerge(opts, { [objKey]: args[0] });
      keys.splice(keys.indexOf(objKey), 1);
      args.shift();
    }
  }
  if (args.length === 1 && isObject(args[0])) {
    deepMerge(opts, args[0]);
  } else {
    for (let i = 0; i < keys.length; i++) {
      if (isDefined(args[i])) {
        opts[keys[i]] = args[i];
      }
    }
  }
  return deepMerge(defaults, opts);
}
function getDefaultsFromInstance(instance) {
  return instance.constructor.getDefaults();
}
function defaultArg(given, fallback) {
  if (isUndef(given)) {
    return fallback;
  } else {
    return given;
  }
}
/**
 * Tone.js
 * @author Yotam Mann
 * @license http://opensource.org/licenses/MIT MIT License
 * @copyright 2014-2019 Yotam Mann
 */
class Tone {
  constructor() {
    this.debug = false;
    this._wasDisposed = false;
  }
  static getDefaults() {
    return {};
  }
  log(...args) {
    if (this.debug || theWindow && this.toString() === theWindow.TONE_DEBUG_CLASS) {
      log(this, ...args);
    }
  }
  dispose() {
    this._wasDisposed = true;
    return this;
  }
  get disposed() {
    return this._wasDisposed;
  }
  toString() {
    return this.name;
  }
}
Tone.version = version;
const EPSILON = 1e-6;
function GT(a, b) {
  return a > b + EPSILON;
}
function GTE(a, b) {
  return GT(a, b) || EQ(a, b);
}
function LT(a, b) {
  return a + EPSILON < b;
}
function EQ(a, b) {
  return Math.abs(a - b) < EPSILON;
}
function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min);
}
class Timeline extends Tone {
  constructor() {
    super();
    this.name = "Timeline";
    this._timeline = [];
    const options = optionsFromArguments(Timeline.getDefaults(), arguments, ["memory"]);
    this.memory = options.memory;
    this.increasing = options.increasing;
  }
  static getDefaults() {
    return {
      memory: Infinity,
      increasing: false
    };
  }
  get length() {
    return this._timeline.length;
  }
  add(event) {
    assert(Reflect.has(event, "time"), "Timeline: events must have a time attribute");
    event.time = event.time.valueOf();
    if (this.increasing && this.length) {
      const lastValue = this._timeline[this.length - 1];
      assert(GTE(event.time, lastValue.time), "The time must be greater than or equal to the last scheduled time");
      this._timeline.push(event);
    } else {
      const index2 = this._search(event.time);
      this._timeline.splice(index2 + 1, 0, event);
    }
    if (this.length > this.memory) {
      const diff = this.length - this.memory;
      this._timeline.splice(0, diff);
    }
    return this;
  }
  remove(event) {
    const index2 = this._timeline.indexOf(event);
    if (index2 !== -1) {
      this._timeline.splice(index2, 1);
    }
    return this;
  }
  get(time, param = "time") {
    const index2 = this._search(time, param);
    if (index2 !== -1) {
      return this._timeline[index2];
    } else {
      return null;
    }
  }
  peek() {
    return this._timeline[0];
  }
  shift() {
    return this._timeline.shift();
  }
  getAfter(time, param = "time") {
    const index2 = this._search(time, param);
    if (index2 + 1 < this._timeline.length) {
      return this._timeline[index2 + 1];
    } else {
      return null;
    }
  }
  getBefore(time) {
    const len = this._timeline.length;
    if (len > 0 && this._timeline[len - 1].time < time) {
      return this._timeline[len - 1];
    }
    const index2 = this._search(time);
    if (index2 - 1 >= 0) {
      return this._timeline[index2 - 1];
    } else {
      return null;
    }
  }
  cancel(after) {
    if (this._timeline.length > 1) {
      let index2 = this._search(after);
      if (index2 >= 0) {
        if (EQ(this._timeline[index2].time, after)) {
          for (let i = index2; i >= 0; i--) {
            if (EQ(this._timeline[i].time, after)) {
              index2 = i;
            } else {
              break;
            }
          }
          this._timeline = this._timeline.slice(0, index2);
        } else {
          this._timeline = this._timeline.slice(0, index2 + 1);
        }
      } else {
        this._timeline = [];
      }
    } else if (this._timeline.length === 1) {
      if (GTE(this._timeline[0].time, after)) {
        this._timeline = [];
      }
    }
    return this;
  }
  cancelBefore(time) {
    const index2 = this._search(time);
    if (index2 >= 0) {
      this._timeline = this._timeline.slice(index2 + 1);
    }
    return this;
  }
  previousEvent(event) {
    const index2 = this._timeline.indexOf(event);
    if (index2 > 0) {
      return this._timeline[index2 - 1];
    } else {
      return null;
    }
  }
  _search(time, param = "time") {
    if (this._timeline.length === 0) {
      return -1;
    }
    let beginning = 0;
    const len = this._timeline.length;
    let end = len;
    if (len > 0 && this._timeline[len - 1][param] <= time) {
      return len - 1;
    }
    while (beginning < end) {
      let midPoint = Math.floor(beginning + (end - beginning) / 2);
      const event = this._timeline[midPoint];
      const nextEvent = this._timeline[midPoint + 1];
      if (EQ(event[param], time)) {
        for (let i = midPoint; i < this._timeline.length; i++) {
          const testEvent = this._timeline[i];
          if (EQ(testEvent[param], time)) {
            midPoint = i;
          } else {
            break;
          }
        }
        return midPoint;
      } else if (LT(event[param], time) && GT(nextEvent[param], time)) {
        return midPoint;
      } else if (GT(event[param], time)) {
        end = midPoint;
      } else {
        beginning = midPoint + 1;
      }
    }
    return -1;
  }
  _iterate(callback, lowerBound = 0, upperBound = this._timeline.length - 1) {
    this._timeline.slice(lowerBound, upperBound + 1).forEach(callback);
  }
  forEach(callback) {
    this._iterate(callback);
    return this;
  }
  forEachBefore(time, callback) {
    const upperBound = this._search(time);
    if (upperBound !== -1) {
      this._iterate(callback, 0, upperBound);
    }
    return this;
  }
  forEachAfter(time, callback) {
    const lowerBound = this._search(time);
    this._iterate(callback, lowerBound + 1);
    return this;
  }
  forEachBetween(startTime, endTime, callback) {
    let lowerBound = this._search(startTime);
    let upperBound = this._search(endTime);
    if (lowerBound !== -1 && upperBound !== -1) {
      if (this._timeline[lowerBound].time !== startTime) {
        lowerBound += 1;
      }
      if (this._timeline[upperBound].time === endTime) {
        upperBound -= 1;
      }
      this._iterate(callback, lowerBound, upperBound);
    } else if (lowerBound === -1) {
      this._iterate(callback, 0, upperBound);
    }
    return this;
  }
  forEachFrom(time, callback) {
    let lowerBound = this._search(time);
    while (lowerBound >= 0 && this._timeline[lowerBound].time >= time) {
      lowerBound--;
    }
    this._iterate(callback, lowerBound + 1);
    return this;
  }
  forEachAtTime(time, callback) {
    const upperBound = this._search(time);
    if (upperBound !== -1 && EQ(this._timeline[upperBound].time, time)) {
      let lowerBound = upperBound;
      for (let i = upperBound; i >= 0; i--) {
        if (EQ(this._timeline[i].time, time)) {
          lowerBound = i;
        } else {
          break;
        }
      }
      this._iterate((event) => {
        callback(event);
      }, lowerBound, upperBound);
    }
    return this;
  }
  dispose() {
    super.dispose();
    this._timeline = [];
    return this;
  }
}
const notifyNewContext = [];
function onContextInit(cb) {
  notifyNewContext.push(cb);
}
function initializeContext(ctx) {
  notifyNewContext.forEach((cb) => cb(ctx));
}
const notifyCloseContext = [];
function onContextClose(cb) {
  notifyCloseContext.push(cb);
}
function closeContext(ctx) {
  notifyCloseContext.forEach((cb) => cb(ctx));
}
class Emitter extends Tone {
  constructor() {
    super(...arguments);
    this.name = "Emitter";
  }
  on(event, callback) {
    const events = event.split(/\W+/);
    events.forEach((eventName) => {
      if (isUndef(this._events)) {
        this._events = {};
      }
      if (!this._events.hasOwnProperty(eventName)) {
        this._events[eventName] = [];
      }
      this._events[eventName].push(callback);
    });
    return this;
  }
  once(event, callback) {
    const boundCallback = (...args) => {
      callback(...args);
      this.off(event, boundCallback);
    };
    this.on(event, boundCallback);
    return this;
  }
  off(event, callback) {
    const events = event.split(/\W+/);
    events.forEach((eventName) => {
      if (isUndef(this._events)) {
        this._events = {};
      }
      if (this._events.hasOwnProperty(event)) {
        if (isUndef(callback)) {
          this._events[event] = [];
        } else {
          const eventList = this._events[event];
          for (let i = eventList.length - 1; i >= 0; i--) {
            if (eventList[i] === callback) {
              eventList.splice(i, 1);
            }
          }
        }
      }
    });
    return this;
  }
  emit(event, ...args) {
    if (this._events) {
      if (this._events.hasOwnProperty(event)) {
        const eventList = this._events[event].slice(0);
        for (let i = 0, len = eventList.length; i < len; i++) {
          eventList[i].apply(this, args);
        }
      }
    }
    return this;
  }
  static mixin(constr) {
    ["on", "once", "off", "emit"].forEach((name) => {
      const property = Object.getOwnPropertyDescriptor(Emitter.prototype, name);
      Object.defineProperty(constr.prototype, name, property);
    });
  }
  dispose() {
    super.dispose();
    this._events = void 0;
    return this;
  }
}
class BaseContext extends Emitter {
  constructor() {
    super(...arguments);
    this.isOffline = false;
  }
  toJSON() {
    return {};
  }
}
class Context extends BaseContext {
  constructor() {
    super();
    this.name = "Context";
    this._constants = /* @__PURE__ */ new Map();
    this._timeouts = new Timeline();
    this._timeoutIds = 0;
    this._initialized = false;
    this.isOffline = false;
    this._workletModules = /* @__PURE__ */ new Map();
    const options = optionsFromArguments(Context.getDefaults(), arguments, [
      "context"
    ]);
    if (options.context) {
      this._context = options.context;
    } else {
      this._context = createAudioContext({
        latencyHint: options.latencyHint
      });
    }
    this._ticker = new Ticker(this.emit.bind(this, "tick"), options.clockSource, options.updateInterval);
    this.on("tick", this._timeoutLoop.bind(this));
    this._context.onstatechange = () => {
      this.emit("statechange", this.state);
    };
    this._setLatencyHint(options.latencyHint);
    this.lookAhead = options.lookAhead;
  }
  static getDefaults() {
    return {
      clockSource: "worker",
      latencyHint: "interactive",
      lookAhead: 0.1,
      updateInterval: 0.05
    };
  }
  initialize() {
    if (!this._initialized) {
      initializeContext(this);
      this._initialized = true;
    }
    return this;
  }
  createAnalyser() {
    return this._context.createAnalyser();
  }
  createOscillator() {
    return this._context.createOscillator();
  }
  createBufferSource() {
    return this._context.createBufferSource();
  }
  createBiquadFilter() {
    return this._context.createBiquadFilter();
  }
  createBuffer(numberOfChannels, length, sampleRate) {
    return this._context.createBuffer(numberOfChannels, length, sampleRate);
  }
  createChannelMerger(numberOfInputs) {
    return this._context.createChannelMerger(numberOfInputs);
  }
  createChannelSplitter(numberOfOutputs) {
    return this._context.createChannelSplitter(numberOfOutputs);
  }
  createConstantSource() {
    return this._context.createConstantSource();
  }
  createConvolver() {
    return this._context.createConvolver();
  }
  createDelay(maxDelayTime) {
    return this._context.createDelay(maxDelayTime);
  }
  createDynamicsCompressor() {
    return this._context.createDynamicsCompressor();
  }
  createGain() {
    return this._context.createGain();
  }
  createIIRFilter(feedForward, feedback) {
    return this._context.createIIRFilter(feedForward, feedback);
  }
  createPanner() {
    return this._context.createPanner();
  }
  createPeriodicWave(real, imag, constraints) {
    return this._context.createPeriodicWave(real, imag, constraints);
  }
  createStereoPanner() {
    return this._context.createStereoPanner();
  }
  createWaveShaper() {
    return this._context.createWaveShaper();
  }
  createMediaStreamSource(stream) {
    assert(isAudioContext(this._context), "Not available if OfflineAudioContext");
    const context2 = this._context;
    return context2.createMediaStreamSource(stream);
  }
  createMediaElementSource(element) {
    assert(isAudioContext(this._context), "Not available if OfflineAudioContext");
    const context2 = this._context;
    return context2.createMediaElementSource(element);
  }
  createMediaStreamDestination() {
    assert(isAudioContext(this._context), "Not available if OfflineAudioContext");
    const context2 = this._context;
    return context2.createMediaStreamDestination();
  }
  decodeAudioData(audioData) {
    return this._context.decodeAudioData(audioData);
  }
  get currentTime() {
    return this._context.currentTime;
  }
  get state() {
    return this._context.state;
  }
  get sampleRate() {
    return this._context.sampleRate;
  }
  get listener() {
    this.initialize();
    return this._listener;
  }
  set listener(l) {
    assert(!this._initialized, "The listener cannot be set after initialization.");
    this._listener = l;
  }
  get transport() {
    this.initialize();
    return this._transport;
  }
  set transport(t) {
    assert(!this._initialized, "The transport cannot be set after initialization.");
    this._transport = t;
  }
  get draw() {
    this.initialize();
    return this._draw;
  }
  set draw(d) {
    assert(!this._initialized, "Draw cannot be set after initialization.");
    this._draw = d;
  }
  get destination() {
    this.initialize();
    return this._destination;
  }
  set destination(d) {
    assert(!this._initialized, "The destination cannot be set after initialization.");
    this._destination = d;
  }
  createAudioWorkletNode(name, options) {
    return createAudioWorkletNode(this.rawContext, name, options);
  }
  addAudioWorkletModule(url, name) {
    return __awaiter(this, void 0, void 0, function* () {
      assert(isDefined(this.rawContext.audioWorklet), "AudioWorkletNode is only available in a secure context (https or localhost)");
      if (!this._workletModules.has(name)) {
        this._workletModules.set(name, this.rawContext.audioWorklet.addModule(url));
      }
      yield this._workletModules.get(name);
    });
  }
  workletsAreReady() {
    return __awaiter(this, void 0, void 0, function* () {
      const promises = [];
      this._workletModules.forEach((promise) => promises.push(promise));
      yield Promise.all(promises);
    });
  }
  get updateInterval() {
    return this._ticker.updateInterval;
  }
  set updateInterval(interval) {
    this._ticker.updateInterval = interval;
  }
  get clockSource() {
    return this._ticker.type;
  }
  set clockSource(type) {
    this._ticker.type = type;
  }
  get latencyHint() {
    return this._latencyHint;
  }
  _setLatencyHint(hint) {
    let lookAheadValue = 0;
    this._latencyHint = hint;
    if (isString(hint)) {
      switch (hint) {
        case "interactive":
          lookAheadValue = 0.1;
          break;
        case "playback":
          lookAheadValue = 0.5;
          break;
        case "balanced":
          lookAheadValue = 0.25;
          break;
      }
    }
    this.lookAhead = lookAheadValue;
    this.updateInterval = lookAheadValue / 2;
  }
  get rawContext() {
    return this._context;
  }
  now() {
    return this._context.currentTime + this.lookAhead;
  }
  immediate() {
    return this._context.currentTime;
  }
  resume() {
    if (isAudioContext(this._context)) {
      return this._context.resume();
    } else {
      return Promise.resolve();
    }
  }
  close() {
    return __awaiter(this, void 0, void 0, function* () {
      if (isAudioContext(this._context)) {
        yield this._context.close();
      }
      if (this._initialized) {
        closeContext(this);
      }
    });
  }
  getConstant(val) {
    if (this._constants.has(val)) {
      return this._constants.get(val);
    } else {
      const buffer = this._context.createBuffer(1, 128, this._context.sampleRate);
      const arr = buffer.getChannelData(0);
      for (let i = 0; i < arr.length; i++) {
        arr[i] = val;
      }
      const constant = this._context.createBufferSource();
      constant.channelCount = 1;
      constant.channelCountMode = "explicit";
      constant.buffer = buffer;
      constant.loop = true;
      constant.start(0);
      this._constants.set(val, constant);
      return constant;
    }
  }
  dispose() {
    super.dispose();
    this._ticker.dispose();
    this._timeouts.dispose();
    Object.keys(this._constants).map((val) => this._constants[val].disconnect());
    return this;
  }
  _timeoutLoop() {
    const now2 = this.now();
    let firstEvent = this._timeouts.peek();
    while (this._timeouts.length && firstEvent && firstEvent.time <= now2) {
      firstEvent.callback();
      this._timeouts.shift();
      firstEvent = this._timeouts.peek();
    }
  }
  setTimeout(fn, timeout) {
    this._timeoutIds++;
    const now2 = this.now();
    this._timeouts.add({
      callback: fn,
      id: this._timeoutIds,
      time: now2 + timeout
    });
    return this._timeoutIds;
  }
  clearTimeout(id) {
    this._timeouts.forEach((event) => {
      if (event.id === id) {
        this._timeouts.remove(event);
      }
    });
    return this;
  }
  clearInterval(id) {
    return this.clearTimeout(id);
  }
  setInterval(fn, interval) {
    const id = ++this._timeoutIds;
    const intervalFn = () => {
      const now2 = this.now();
      this._timeouts.add({
        callback: () => {
          fn();
          intervalFn();
        },
        id,
        time: now2 + interval
      });
    };
    intervalFn();
    return id;
  }
}
class DummyContext extends BaseContext {
  constructor() {
    super(...arguments);
    this.lookAhead = 0;
    this.latencyHint = 0;
    this.isOffline = false;
  }
  createAnalyser() {
    return {};
  }
  createOscillator() {
    return {};
  }
  createBufferSource() {
    return {};
  }
  createBiquadFilter() {
    return {};
  }
  createBuffer(_numberOfChannels, _length, _sampleRate) {
    return {};
  }
  createChannelMerger(_numberOfInputs) {
    return {};
  }
  createChannelSplitter(_numberOfOutputs) {
    return {};
  }
  createConstantSource() {
    return {};
  }
  createConvolver() {
    return {};
  }
  createDelay(_maxDelayTime) {
    return {};
  }
  createDynamicsCompressor() {
    return {};
  }
  createGain() {
    return {};
  }
  createIIRFilter(_feedForward, _feedback) {
    return {};
  }
  createPanner() {
    return {};
  }
  createPeriodicWave(_real, _imag, _constraints) {
    return {};
  }
  createStereoPanner() {
    return {};
  }
  createWaveShaper() {
    return {};
  }
  createMediaStreamSource(_stream) {
    return {};
  }
  createMediaElementSource(_element) {
    return {};
  }
  createMediaStreamDestination() {
    return {};
  }
  decodeAudioData(_audioData) {
    return Promise.resolve({});
  }
  createAudioWorkletNode(_name, _options) {
    return {};
  }
  get rawContext() {
    return {};
  }
  addAudioWorkletModule(_url, _name) {
    return __awaiter(this, void 0, void 0, function* () {
      return Promise.resolve();
    });
  }
  resume() {
    return Promise.resolve();
  }
  setTimeout(_fn, _timeout) {
    return 0;
  }
  clearTimeout(_id) {
    return this;
  }
  setInterval(_fn, _interval) {
    return 0;
  }
  clearInterval(_id) {
    return this;
  }
  getConstant(_val) {
    return {};
  }
  get currentTime() {
    return 0;
  }
  get state() {
    return {};
  }
  get sampleRate() {
    return 0;
  }
  get listener() {
    return {};
  }
  get transport() {
    return {};
  }
  get draw() {
    return {};
  }
  set draw(_d) {
  }
  get destination() {
    return {};
  }
  set destination(_d) {
  }
  now() {
    return 0;
  }
  immediate() {
    return 0;
  }
}
function readOnly(target, property) {
  if (isArray(property)) {
    property.forEach((str) => readOnly(target, str));
  } else {
    Object.defineProperty(target, property, {
      enumerable: true,
      writable: false
    });
  }
}
function writable(target, property) {
  if (isArray(property)) {
    property.forEach((str) => writable(target, str));
  } else {
    Object.defineProperty(target, property, {
      writable: true
    });
  }
}
const noOp = () => {
};
class ToneAudioBuffer extends Tone {
  constructor() {
    super();
    this.name = "ToneAudioBuffer";
    this.onload = noOp;
    const options = optionsFromArguments(ToneAudioBuffer.getDefaults(), arguments, ["url", "onload", "onerror"]);
    this.reverse = options.reverse;
    this.onload = options.onload;
    if (options.url && isAudioBuffer(options.url) || options.url instanceof ToneAudioBuffer) {
      this.set(options.url);
    } else if (isString(options.url)) {
      this.load(options.url).catch(options.onerror);
    }
  }
  static getDefaults() {
    return {
      onerror: noOp,
      onload: noOp,
      reverse: false
    };
  }
  get sampleRate() {
    if (this._buffer) {
      return this._buffer.sampleRate;
    } else {
      return getContext$1().sampleRate;
    }
  }
  set(buffer) {
    if (buffer instanceof ToneAudioBuffer) {
      if (buffer.loaded) {
        this._buffer = buffer.get();
      } else {
        buffer.onload = () => {
          this.set(buffer);
          this.onload(this);
        };
      }
    } else {
      this._buffer = buffer;
    }
    if (this._reversed) {
      this._reverse();
    }
    return this;
  }
  get() {
    return this._buffer;
  }
  load(url) {
    return __awaiter(this, void 0, void 0, function* () {
      const doneLoading = ToneAudioBuffer.load(url).then((audioBuffer) => {
        this.set(audioBuffer);
        this.onload(this);
      });
      ToneAudioBuffer.downloads.push(doneLoading);
      try {
        yield doneLoading;
      } finally {
        const index2 = ToneAudioBuffer.downloads.indexOf(doneLoading);
        ToneAudioBuffer.downloads.splice(index2, 1);
      }
      return this;
    });
  }
  dispose() {
    super.dispose();
    this._buffer = void 0;
    return this;
  }
  fromArray(array) {
    const isMultidimensional = isArray(array) && array[0].length > 0;
    const channels = isMultidimensional ? array.length : 1;
    const len = isMultidimensional ? array[0].length : array.length;
    const context2 = getContext$1();
    const buffer = context2.createBuffer(channels, len, context2.sampleRate);
    const multiChannelArray = !isMultidimensional && channels === 1 ? [array] : array;
    for (let c = 0; c < channels; c++) {
      buffer.copyToChannel(multiChannelArray[c], c);
    }
    this._buffer = buffer;
    return this;
  }
  toMono(chanNum) {
    if (isNumber(chanNum)) {
      this.fromArray(this.toArray(chanNum));
    } else {
      let outputArray = new Float32Array(this.length);
      const numChannels = this.numberOfChannels;
      for (let channel = 0; channel < numChannels; channel++) {
        const channelArray = this.toArray(channel);
        for (let i = 0; i < channelArray.length; i++) {
          outputArray[i] += channelArray[i];
        }
      }
      outputArray = outputArray.map((sample) => sample / numChannels);
      this.fromArray(outputArray);
    }
    return this;
  }
  toArray(channel) {
    if (isNumber(channel)) {
      return this.getChannelData(channel);
    } else if (this.numberOfChannels === 1) {
      return this.toArray(0);
    } else {
      const ret = [];
      for (let c = 0; c < this.numberOfChannels; c++) {
        ret[c] = this.getChannelData(c);
      }
      return ret;
    }
  }
  getChannelData(channel) {
    if (this._buffer) {
      return this._buffer.getChannelData(channel);
    } else {
      return new Float32Array(0);
    }
  }
  slice(start2, end = this.duration) {
    const startSamples = Math.floor(start2 * this.sampleRate);
    const endSamples = Math.floor(end * this.sampleRate);
    assert(startSamples < endSamples, "The start time must be less than the end time");
    const length = endSamples - startSamples;
    const retBuffer = getContext$1().createBuffer(this.numberOfChannels, length, this.sampleRate);
    for (let channel = 0; channel < this.numberOfChannels; channel++) {
      retBuffer.copyToChannel(this.getChannelData(channel).subarray(startSamples, endSamples), channel);
    }
    return new ToneAudioBuffer(retBuffer);
  }
  _reverse() {
    if (this.loaded) {
      for (let i = 0; i < this.numberOfChannels; i++) {
        this.getChannelData(i).reverse();
      }
    }
    return this;
  }
  get loaded() {
    return this.length > 0;
  }
  get duration() {
    if (this._buffer) {
      return this._buffer.duration;
    } else {
      return 0;
    }
  }
  get length() {
    if (this._buffer) {
      return this._buffer.length;
    } else {
      return 0;
    }
  }
  get numberOfChannels() {
    if (this._buffer) {
      return this._buffer.numberOfChannels;
    } else {
      return 0;
    }
  }
  get reverse() {
    return this._reversed;
  }
  set reverse(rev) {
    if (this._reversed !== rev) {
      this._reversed = rev;
      this._reverse();
    }
  }
  static fromArray(array) {
    return new ToneAudioBuffer().fromArray(array);
  }
  static fromUrl(url) {
    return __awaiter(this, void 0, void 0, function* () {
      const buffer = new ToneAudioBuffer();
      return yield buffer.load(url);
    });
  }
  static load(url) {
    return __awaiter(this, void 0, void 0, function* () {
      const matches = url.match(/\[([^\]\[]+\|.+)\]$/);
      if (matches) {
        const extensions = matches[1].split("|");
        let extension = extensions[0];
        for (const ext of extensions) {
          if (ToneAudioBuffer.supportsType(ext)) {
            extension = ext;
            break;
          }
        }
        url = url.replace(matches[0], extension);
      }
      const baseUrl = ToneAudioBuffer.baseUrl === "" || ToneAudioBuffer.baseUrl.endsWith("/") ? ToneAudioBuffer.baseUrl : ToneAudioBuffer.baseUrl + "/";
      const response = yield fetch(baseUrl + url);
      if (!response.ok) {
        throw new Error(`could not load url: ${url}`);
      }
      const arrayBuffer = yield response.arrayBuffer();
      const audioBuffer = yield getContext$1().decodeAudioData(arrayBuffer);
      return audioBuffer;
    });
  }
  static supportsType(url) {
    const extensions = url.split(".");
    const extension = extensions[extensions.length - 1];
    const response = document.createElement("audio").canPlayType("audio/" + extension);
    return response !== "";
  }
  static loaded() {
    return __awaiter(this, void 0, void 0, function* () {
      yield Promise.resolve();
      while (ToneAudioBuffer.downloads.length) {
        yield ToneAudioBuffer.downloads[0];
      }
    });
  }
}
ToneAudioBuffer.baseUrl = "";
ToneAudioBuffer.downloads = [];
class OfflineContext extends Context {
  constructor() {
    super({
      clockSource: "offline",
      context: isOfflineAudioContext(arguments[0]) ? arguments[0] : createOfflineAudioContext(arguments[0], arguments[1] * arguments[2], arguments[2]),
      lookAhead: 0,
      updateInterval: isOfflineAudioContext(arguments[0]) ? 128 / arguments[0].sampleRate : 128 / arguments[2]
    });
    this.name = "OfflineContext";
    this._currentTime = 0;
    this.isOffline = true;
    this._duration = isOfflineAudioContext(arguments[0]) ? arguments[0].length / arguments[0].sampleRate : arguments[1];
  }
  now() {
    return this._currentTime;
  }
  get currentTime() {
    return this._currentTime;
  }
  _renderClock(asynchronous) {
    return __awaiter(this, void 0, void 0, function* () {
      let index2 = 0;
      while (this._duration - this._currentTime >= 0) {
        this.emit("tick");
        this._currentTime += 128 / this.sampleRate;
        index2++;
        const yieldEvery = Math.floor(this.sampleRate / 128);
        if (asynchronous && index2 % yieldEvery === 0) {
          yield new Promise((done) => setTimeout(done, 1));
        }
      }
    });
  }
  render(asynchronous = true) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.workletsAreReady();
      yield this._renderClock(asynchronous);
      const buffer = yield this._context.startRendering();
      return new ToneAudioBuffer(buffer);
    });
  }
  close() {
    return Promise.resolve();
  }
}
const dummyContext = new DummyContext();
let globalContext = dummyContext;
function getContext$1() {
  if (globalContext === dummyContext && hasAudioContext) {
    setContext(new Context());
  }
  return globalContext;
}
function setContext(context2) {
  if (isAudioContext(context2)) {
    globalContext = new Context(context2);
  } else if (isOfflineAudioContext(context2)) {
    globalContext = new OfflineContext(context2);
  } else {
    globalContext = context2;
  }
}
function start() {
  return globalContext.resume();
}
if (theWindow && !theWindow.TONE_SILENCE_LOGGING) {
  let prefix = "v";
  {
    prefix = "";
  }
  const printString = ` * Tone.js ${prefix}${version} * `;
  console.log(`%c${printString}`, "background: #000; color: #fff");
}
function dbToGain(db) {
  return Math.pow(10, db / 20);
}
function gainToDb(gain) {
  return 20 * (Math.log(gain) / Math.LN10);
}
function intervalToFrequencyRatio(interval) {
  return Math.pow(2, interval / 12);
}
let A4 = 440;
function getA4() {
  return A4;
}
function setA4(freq) {
  A4 = freq;
}
function ftom(frequency) {
  return Math.round(ftomf(frequency));
}
function ftomf(frequency) {
  return 69 + 12 * Math.log2(frequency / A4);
}
function mtof(midi) {
  return A4 * Math.pow(2, (midi - 69) / 12);
}
class TimeBaseClass extends Tone {
  constructor(context2, value, units) {
    super();
    this.defaultUnits = "s";
    this._val = value;
    this._units = units;
    this.context = context2;
    this._expressions = this._getExpressions();
  }
  _getExpressions() {
    return {
      hz: {
        method: (value) => {
          return this._frequencyToUnits(parseFloat(value));
        },
        regexp: /^(\d+(?:\.\d+)?)hz$/i
      },
      i: {
        method: (value) => {
          return this._ticksToUnits(parseInt(value, 10));
        },
        regexp: /^(\d+)i$/i
      },
      m: {
        method: (value) => {
          return this._beatsToUnits(parseInt(value, 10) * this._getTimeSignature());
        },
        regexp: /^(\d+)m$/i
      },
      n: {
        method: (value, dot) => {
          const numericValue = parseInt(value, 10);
          const scalar = dot === "." ? 1.5 : 1;
          if (numericValue === 1) {
            return this._beatsToUnits(this._getTimeSignature()) * scalar;
          } else {
            return this._beatsToUnits(4 / numericValue) * scalar;
          }
        },
        regexp: /^(\d+)n(\.?)$/i
      },
      number: {
        method: (value) => {
          return this._expressions[this.defaultUnits].method.call(this, value);
        },
        regexp: /^(\d+(?:\.\d+)?)$/
      },
      s: {
        method: (value) => {
          return this._secondsToUnits(parseFloat(value));
        },
        regexp: /^(\d+(?:\.\d+)?)s$/
      },
      samples: {
        method: (value) => {
          return parseInt(value, 10) / this.context.sampleRate;
        },
        regexp: /^(\d+)samples$/
      },
      t: {
        method: (value) => {
          const numericValue = parseInt(value, 10);
          return this._beatsToUnits(8 / (Math.floor(numericValue) * 3));
        },
        regexp: /^(\d+)t$/i
      },
      tr: {
        method: (m, q, s) => {
          let total = 0;
          if (m && m !== "0") {
            total += this._beatsToUnits(this._getTimeSignature() * parseFloat(m));
          }
          if (q && q !== "0") {
            total += this._beatsToUnits(parseFloat(q));
          }
          if (s && s !== "0") {
            total += this._beatsToUnits(parseFloat(s) / 4);
          }
          return total;
        },
        regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?$/
      }
    };
  }
  valueOf() {
    if (this._val instanceof TimeBaseClass) {
      this.fromType(this._val);
    }
    if (isUndef(this._val)) {
      return this._noArg();
    } else if (isString(this._val) && isUndef(this._units)) {
      for (const units in this._expressions) {
        if (this._expressions[units].regexp.test(this._val.trim())) {
          this._units = units;
          break;
        }
      }
    } else if (isObject(this._val)) {
      let total = 0;
      for (const typeName in this._val) {
        if (isDefined(this._val[typeName])) {
          const quantity = this._val[typeName];
          const time = new this.constructor(this.context, typeName).valueOf() * quantity;
          total += time;
        }
      }
      return total;
    }
    if (isDefined(this._units)) {
      const expr = this._expressions[this._units];
      const matching = this._val.toString().trim().match(expr.regexp);
      if (matching) {
        return expr.method.apply(this, matching.slice(1));
      } else {
        return expr.method.call(this, this._val);
      }
    } else if (isString(this._val)) {
      return parseFloat(this._val);
    } else {
      return this._val;
    }
  }
  _frequencyToUnits(freq) {
    return 1 / freq;
  }
  _beatsToUnits(beats) {
    return 60 / this._getBpm() * beats;
  }
  _secondsToUnits(seconds) {
    return seconds;
  }
  _ticksToUnits(ticks) {
    return ticks * this._beatsToUnits(1) / this._getPPQ();
  }
  _noArg() {
    return this._now();
  }
  _getBpm() {
    return this.context.transport.bpm.value;
  }
  _getTimeSignature() {
    return this.context.transport.timeSignature;
  }
  _getPPQ() {
    return this.context.transport.PPQ;
  }
  fromType(type) {
    this._units = void 0;
    switch (this.defaultUnits) {
      case "s":
        this._val = type.toSeconds();
        break;
      case "i":
        this._val = type.toTicks();
        break;
      case "hz":
        this._val = type.toFrequency();
        break;
      case "midi":
        this._val = type.toMidi();
        break;
    }
    return this;
  }
  toFrequency() {
    return 1 / this.toSeconds();
  }
  toSamples() {
    return this.toSeconds() * this.context.sampleRate;
  }
  toMilliseconds() {
    return this.toSeconds() * 1e3;
  }
}
class TimeClass extends TimeBaseClass {
  constructor() {
    super(...arguments);
    this.name = "TimeClass";
  }
  _getExpressions() {
    return Object.assign(super._getExpressions(), {
      now: {
        method: (capture) => {
          return this._now() + new this.constructor(this.context, capture).valueOf();
        },
        regexp: /^\+(.+)/
      },
      quantize: {
        method: (capture) => {
          const quantTo = new TimeClass(this.context, capture).valueOf();
          return this._secondsToUnits(this.context.transport.nextSubdivision(quantTo));
        },
        regexp: /^@(.+)/
      }
    });
  }
  quantize(subdiv, percent = 1) {
    const subdivision = new this.constructor(this.context, subdiv).valueOf();
    const value = this.valueOf();
    const multiple = Math.round(value / subdivision);
    const ideal = multiple * subdivision;
    const diff = ideal - value;
    return value + diff * percent;
  }
  toNotation() {
    const time = this.toSeconds();
    const testNotations = ["1m"];
    for (let power = 1; power < 9; power++) {
      const subdiv = Math.pow(2, power);
      testNotations.push(subdiv + "n.");
      testNotations.push(subdiv + "n");
      testNotations.push(subdiv + "t");
    }
    testNotations.push("0");
    let closest = testNotations[0];
    let closestSeconds = new TimeClass(this.context, testNotations[0]).toSeconds();
    testNotations.forEach((notation) => {
      const notationSeconds = new TimeClass(this.context, notation).toSeconds();
      if (Math.abs(notationSeconds - time) < Math.abs(closestSeconds - time)) {
        closest = notation;
        closestSeconds = notationSeconds;
      }
    });
    return closest;
  }
  toBarsBeatsSixteenths() {
    const quarterTime = this._beatsToUnits(1);
    let quarters = this.valueOf() / quarterTime;
    quarters = parseFloat(quarters.toFixed(4));
    const measures = Math.floor(quarters / this._getTimeSignature());
    let sixteenths = quarters % 1 * 4;
    quarters = Math.floor(quarters) % this._getTimeSignature();
    const sixteenthString = sixteenths.toString();
    if (sixteenthString.length > 3) {
      sixteenths = parseFloat(parseFloat(sixteenthString).toFixed(3));
    }
    const progress = [measures, quarters, sixteenths];
    return progress.join(":");
  }
  toTicks() {
    const quarterTime = this._beatsToUnits(1);
    const quarters = this.valueOf() / quarterTime;
    return Math.round(quarters * this._getPPQ());
  }
  toSeconds() {
    return this.valueOf();
  }
  toMidi() {
    return ftom(this.toFrequency());
  }
  _now() {
    return this.context.now();
  }
}
class FrequencyClass extends TimeClass {
  constructor() {
    super(...arguments);
    this.name = "Frequency";
    this.defaultUnits = "hz";
  }
  static get A4() {
    return getA4();
  }
  static set A4(freq) {
    setA4(freq);
  }
  _getExpressions() {
    return Object.assign({}, super._getExpressions(), {
      midi: {
        regexp: /^(\d+(?:\.\d+)?midi)/,
        method(value) {
          if (this.defaultUnits === "midi") {
            return value;
          } else {
            return FrequencyClass.mtof(value);
          }
        }
      },
      note: {
        regexp: /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i,
        method(pitch, octave) {
          const index2 = noteToScaleIndex[pitch.toLowerCase()];
          const noteNumber = index2 + (parseInt(octave, 10) + 1) * 12;
          if (this.defaultUnits === "midi") {
            return noteNumber;
          } else {
            return FrequencyClass.mtof(noteNumber);
          }
        }
      },
      tr: {
        regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?/,
        method(m, q, s) {
          let total = 1;
          if (m && m !== "0") {
            total *= this._beatsToUnits(this._getTimeSignature() * parseFloat(m));
          }
          if (q && q !== "0") {
            total *= this._beatsToUnits(parseFloat(q));
          }
          if (s && s !== "0") {
            total *= this._beatsToUnits(parseFloat(s) / 4);
          }
          return total;
        }
      }
    });
  }
  transpose(interval) {
    return new FrequencyClass(this.context, this.valueOf() * intervalToFrequencyRatio(interval));
  }
  harmonize(intervals) {
    return intervals.map((interval) => {
      return this.transpose(interval);
    });
  }
  toMidi() {
    return ftom(this.valueOf());
  }
  toNote() {
    const freq = this.toFrequency();
    const log2 = Math.log2(freq / FrequencyClass.A4);
    let noteNumber = Math.round(12 * log2) + 57;
    const octave = Math.floor(noteNumber / 12);
    if (octave < 0) {
      noteNumber += -12 * octave;
    }
    const noteName = scaleIndexToNote[noteNumber % 12];
    return noteName + octave.toString();
  }
  toSeconds() {
    return 1 / super.toSeconds();
  }
  toTicks() {
    const quarterTime = this._beatsToUnits(1);
    const quarters = this.valueOf() / quarterTime;
    return Math.floor(quarters * this._getPPQ());
  }
  _noArg() {
    return 0;
  }
  _frequencyToUnits(freq) {
    return freq;
  }
  _ticksToUnits(ticks) {
    return 1 / (ticks * 60 / (this._getBpm() * this._getPPQ()));
  }
  _beatsToUnits(beats) {
    return 1 / super._beatsToUnits(beats);
  }
  _secondsToUnits(seconds) {
    return 1 / seconds;
  }
  static mtof(midi) {
    return mtof(midi);
  }
  static ftom(frequency) {
    return ftom(frequency);
  }
}
const noteToScaleIndex = {
  cbb: -2,
  cb: -1,
  c: 0,
  "c#": 1,
  cx: 2,
  dbb: 0,
  db: 1,
  d: 2,
  "d#": 3,
  dx: 4,
  ebb: 2,
  eb: 3,
  e: 4,
  "e#": 5,
  ex: 6,
  fbb: 3,
  fb: 4,
  f: 5,
  "f#": 6,
  fx: 7,
  gbb: 5,
  gb: 6,
  g: 7,
  "g#": 8,
  gx: 9,
  abb: 7,
  ab: 8,
  a: 9,
  "a#": 10,
  ax: 11,
  bbb: 9,
  bb: 10,
  b: 11,
  "b#": 12,
  bx: 13
};
const scaleIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
class TransportTimeClass extends TimeClass {
  constructor() {
    super(...arguments);
    this.name = "TransportTime";
  }
  _now() {
    return this.context.transport.seconds;
  }
}
class ToneWithContext extends Tone {
  constructor() {
    super();
    const options = optionsFromArguments(ToneWithContext.getDefaults(), arguments, ["context"]);
    if (this.defaultContext) {
      this.context = this.defaultContext;
    } else {
      this.context = options.context;
    }
  }
  static getDefaults() {
    return {
      context: getContext$1()
    };
  }
  now() {
    return this.context.currentTime + this.context.lookAhead;
  }
  immediate() {
    return this.context.currentTime;
  }
  get sampleTime() {
    return 1 / this.context.sampleRate;
  }
  get blockTime() {
    return 128 / this.context.sampleRate;
  }
  toSeconds(time) {
    return new TimeClass(this.context, time).toSeconds();
  }
  toFrequency(freq) {
    return new FrequencyClass(this.context, freq).toFrequency();
  }
  toTicks(time) {
    return new TransportTimeClass(this.context, time).toTicks();
  }
  _getPartialProperties(props) {
    const options = this.get();
    Object.keys(options).forEach((name) => {
      if (isUndef(props[name])) {
        delete options[name];
      }
    });
    return options;
  }
  get() {
    const defaults = getDefaultsFromInstance(this);
    Object.keys(defaults).forEach((attribute) => {
      if (Reflect.has(this, attribute)) {
        const member = this[attribute];
        if (isDefined(member) && isDefined(member.value) && isDefined(member.setValueAtTime)) {
          defaults[attribute] = member.value;
        } else if (member instanceof ToneWithContext) {
          defaults[attribute] = member._getPartialProperties(defaults[attribute]);
        } else if (isArray(member) || isNumber(member) || isString(member) || isBoolean(member)) {
          defaults[attribute] = member;
        } else {
          delete defaults[attribute];
        }
      }
    });
    return defaults;
  }
  set(props) {
    Object.keys(props).forEach((attribute) => {
      if (Reflect.has(this, attribute) && isDefined(this[attribute])) {
        if (this[attribute] && isDefined(this[attribute].value) && isDefined(this[attribute].setValueAtTime)) {
          if (this[attribute].value !== props[attribute]) {
            this[attribute].value = props[attribute];
          }
        } else if (this[attribute] instanceof ToneWithContext) {
          this[attribute].set(props[attribute]);
        } else {
          this[attribute] = props[attribute];
        }
      }
    });
    return this;
  }
}
class StateTimeline extends Timeline {
  constructor(initial = "stopped") {
    super();
    this.name = "StateTimeline";
    this._initial = initial;
    this.setStateAtTime(this._initial, 0);
  }
  getValueAtTime(time) {
    const event = this.get(time);
    if (event !== null) {
      return event.state;
    } else {
      return this._initial;
    }
  }
  setStateAtTime(state, time, options) {
    assertRange(time, 0);
    this.add(Object.assign({}, options, {
      state,
      time
    }));
    return this;
  }
  getLastState(state, time) {
    const index2 = this._search(time);
    for (let i = index2; i >= 0; i--) {
      const event = this._timeline[i];
      if (event.state === state) {
        return event;
      }
    }
  }
  getNextState(state, time) {
    const index2 = this._search(time);
    if (index2 !== -1) {
      for (let i = index2; i < this._timeline.length; i++) {
        const event = this._timeline[i];
        if (event.state === state) {
          return event;
        }
      }
    }
  }
}
let Param$1 = class Param extends ToneWithContext {
  constructor() {
    super(optionsFromArguments(Param.getDefaults(), arguments, ["param", "units", "convert"]));
    this.name = "Param";
    this.overridden = false;
    this._minOutput = 1e-7;
    const options = optionsFromArguments(Param.getDefaults(), arguments, ["param", "units", "convert"]);
    assert(isDefined(options.param) && (isAudioParam(options.param) || options.param instanceof Param), "param must be an AudioParam");
    while (!isAudioParam(options.param)) {
      options.param = options.param._param;
    }
    this._swappable = isDefined(options.swappable) ? options.swappable : false;
    if (this._swappable) {
      this.input = this.context.createGain();
      this._param = options.param;
      this.input.connect(this._param);
    } else {
      this._param = this.input = options.param;
    }
    this._events = new Timeline(1e3);
    this._initialValue = this._param.defaultValue;
    this.units = options.units;
    this.convert = options.convert;
    this._minValue = options.minValue;
    this._maxValue = options.maxValue;
    if (isDefined(options.value) && options.value !== this._toType(this._initialValue)) {
      this.setValueAtTime(options.value, 0);
    }
  }
  static getDefaults() {
    return Object.assign(ToneWithContext.getDefaults(), {
      convert: true,
      units: "number"
    });
  }
  get value() {
    const now2 = this.now();
    return this.getValueAtTime(now2);
  }
  set value(value) {
    this.cancelScheduledValues(this.now());
    this.setValueAtTime(value, this.now());
  }
  get minValue() {
    if (isDefined(this._minValue)) {
      return this._minValue;
    } else if (this.units === "time" || this.units === "frequency" || this.units === "normalRange" || this.units === "positive" || this.units === "transportTime" || this.units === "ticks" || this.units === "bpm" || this.units === "hertz" || this.units === "samples") {
      return 0;
    } else if (this.units === "audioRange") {
      return -1;
    } else if (this.units === "decibels") {
      return -Infinity;
    } else {
      return this._param.minValue;
    }
  }
  get maxValue() {
    if (isDefined(this._maxValue)) {
      return this._maxValue;
    } else if (this.units === "normalRange" || this.units === "audioRange") {
      return 1;
    } else {
      return this._param.maxValue;
    }
  }
  _is(arg, type) {
    return this.units === type;
  }
  _assertRange(value) {
    if (isDefined(this.maxValue) && isDefined(this.minValue)) {
      assertRange(value, this._fromType(this.minValue), this._fromType(this.maxValue));
    }
    return value;
  }
  _fromType(val) {
    if (this.convert && !this.overridden) {
      if (this._is(val, "time")) {
        return this.toSeconds(val);
      } else if (this._is(val, "decibels")) {
        return dbToGain(val);
      } else if (this._is(val, "frequency")) {
        return this.toFrequency(val);
      } else {
        return val;
      }
    } else if (this.overridden) {
      return 0;
    } else {
      return val;
    }
  }
  _toType(val) {
    if (this.convert && this.units === "decibels") {
      return gainToDb(val);
    } else {
      return val;
    }
  }
  setValueAtTime(value, time) {
    const computedTime = this.toSeconds(time);
    const numericValue = this._fromType(value);
    assert(isFinite(numericValue) && isFinite(computedTime), `Invalid argument(s) to setValueAtTime: ${JSON.stringify(value)}, ${JSON.stringify(time)}`);
    this._assertRange(numericValue);
    this.log(this.units, "setValueAtTime", value, computedTime);
    this._events.add({
      time: computedTime,
      type: "setValueAtTime",
      value: numericValue
    });
    this._param.setValueAtTime(numericValue, computedTime);
    return this;
  }
  getValueAtTime(time) {
    const computedTime = Math.max(this.toSeconds(time), 0);
    const after = this._events.getAfter(computedTime);
    const before = this._events.get(computedTime);
    let value = this._initialValue;
    if (before === null) {
      value = this._initialValue;
    } else if (before.type === "setTargetAtTime" && (after === null || after.type === "setValueAtTime")) {
      const previous = this._events.getBefore(before.time);
      let previousVal;
      if (previous === null) {
        previousVal = this._initialValue;
      } else {
        previousVal = previous.value;
      }
      if (before.type === "setTargetAtTime") {
        value = this._exponentialApproach(before.time, previousVal, before.value, before.constant, computedTime);
      }
    } else if (after === null) {
      value = before.value;
    } else if (after.type === "linearRampToValueAtTime" || after.type === "exponentialRampToValueAtTime") {
      let beforeValue = before.value;
      if (before.type === "setTargetAtTime") {
        const previous = this._events.getBefore(before.time);
        if (previous === null) {
          beforeValue = this._initialValue;
        } else {
          beforeValue = previous.value;
        }
      }
      if (after.type === "linearRampToValueAtTime") {
        value = this._linearInterpolate(before.time, beforeValue, after.time, after.value, computedTime);
      } else {
        value = this._exponentialInterpolate(before.time, beforeValue, after.time, after.value, computedTime);
      }
    } else {
      value = before.value;
    }
    return this._toType(value);
  }
  setRampPoint(time) {
    time = this.toSeconds(time);
    let currentVal = this.getValueAtTime(time);
    this.cancelAndHoldAtTime(time);
    if (this._fromType(currentVal) === 0) {
      currentVal = this._toType(this._minOutput);
    }
    this.setValueAtTime(currentVal, time);
    return this;
  }
  linearRampToValueAtTime(value, endTime) {
    const numericValue = this._fromType(value);
    const computedTime = this.toSeconds(endTime);
    assert(isFinite(numericValue) && isFinite(computedTime), `Invalid argument(s) to linearRampToValueAtTime: ${JSON.stringify(value)}, ${JSON.stringify(endTime)}`);
    this._assertRange(numericValue);
    this._events.add({
      time: computedTime,
      type: "linearRampToValueAtTime",
      value: numericValue
    });
    this.log(this.units, "linearRampToValueAtTime", value, computedTime);
    this._param.linearRampToValueAtTime(numericValue, computedTime);
    return this;
  }
  exponentialRampToValueAtTime(value, endTime) {
    let numericValue = this._fromType(value);
    numericValue = EQ(numericValue, 0) ? this._minOutput : numericValue;
    this._assertRange(numericValue);
    const computedTime = this.toSeconds(endTime);
    assert(isFinite(numericValue) && isFinite(computedTime), `Invalid argument(s) to exponentialRampToValueAtTime: ${JSON.stringify(value)}, ${JSON.stringify(endTime)}`);
    this._events.add({
      time: computedTime,
      type: "exponentialRampToValueAtTime",
      value: numericValue
    });
    this.log(this.units, "exponentialRampToValueAtTime", value, computedTime);
    this._param.exponentialRampToValueAtTime(numericValue, computedTime);
    return this;
  }
  exponentialRampTo(value, rampTime, startTime) {
    startTime = this.toSeconds(startTime);
    this.setRampPoint(startTime);
    this.exponentialRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
    return this;
  }
  linearRampTo(value, rampTime, startTime) {
    startTime = this.toSeconds(startTime);
    this.setRampPoint(startTime);
    this.linearRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
    return this;
  }
  targetRampTo(value, rampTime, startTime) {
    startTime = this.toSeconds(startTime);
    this.setRampPoint(startTime);
    this.exponentialApproachValueAtTime(value, startTime, rampTime);
    return this;
  }
  exponentialApproachValueAtTime(value, time, rampTime) {
    time = this.toSeconds(time);
    rampTime = this.toSeconds(rampTime);
    const timeConstant = Math.log(rampTime + 1) / Math.log(200);
    this.setTargetAtTime(value, time, timeConstant);
    this.cancelAndHoldAtTime(time + rampTime * 0.9);
    this.linearRampToValueAtTime(value, time + rampTime);
    return this;
  }
  setTargetAtTime(value, startTime, timeConstant) {
    const numericValue = this._fromType(value);
    assert(isFinite(timeConstant) && timeConstant > 0, "timeConstant must be a number greater than 0");
    const computedTime = this.toSeconds(startTime);
    this._assertRange(numericValue);
    assert(isFinite(numericValue) && isFinite(computedTime), `Invalid argument(s) to setTargetAtTime: ${JSON.stringify(value)}, ${JSON.stringify(startTime)}`);
    this._events.add({
      constant: timeConstant,
      time: computedTime,
      type: "setTargetAtTime",
      value: numericValue
    });
    this.log(this.units, "setTargetAtTime", value, computedTime, timeConstant);
    this._param.setTargetAtTime(numericValue, computedTime, timeConstant);
    return this;
  }
  setValueCurveAtTime(values, startTime, duration, scaling = 1) {
    duration = this.toSeconds(duration);
    startTime = this.toSeconds(startTime);
    const startingValue = this._fromType(values[0]) * scaling;
    this.setValueAtTime(this._toType(startingValue), startTime);
    const segTime = duration / (values.length - 1);
    for (let i = 1; i < values.length; i++) {
      const numericValue = this._fromType(values[i]) * scaling;
      this.linearRampToValueAtTime(this._toType(numericValue), startTime + i * segTime);
    }
    return this;
  }
  cancelScheduledValues(time) {
    const computedTime = this.toSeconds(time);
    assert(isFinite(computedTime), `Invalid argument to cancelScheduledValues: ${JSON.stringify(time)}`);
    this._events.cancel(computedTime);
    this._param.cancelScheduledValues(computedTime);
    this.log(this.units, "cancelScheduledValues", computedTime);
    return this;
  }
  cancelAndHoldAtTime(time) {
    const computedTime = this.toSeconds(time);
    const valueAtTime = this._fromType(this.getValueAtTime(computedTime));
    assert(isFinite(computedTime), `Invalid argument to cancelAndHoldAtTime: ${JSON.stringify(time)}`);
    this.log(this.units, "cancelAndHoldAtTime", computedTime, "value=" + valueAtTime);
    const before = this._events.get(computedTime);
    const after = this._events.getAfter(computedTime);
    if (before && EQ(before.time, computedTime)) {
      if (after) {
        this._param.cancelScheduledValues(after.time);
        this._events.cancel(after.time);
      } else {
        this._param.cancelAndHoldAtTime(computedTime);
        this._events.cancel(computedTime + this.sampleTime);
      }
    } else if (after) {
      this._param.cancelScheduledValues(after.time);
      this._events.cancel(after.time);
      if (after.type === "linearRampToValueAtTime") {
        this.linearRampToValueAtTime(this._toType(valueAtTime), computedTime);
      } else if (after.type === "exponentialRampToValueAtTime") {
        this.exponentialRampToValueAtTime(this._toType(valueAtTime), computedTime);
      }
    }
    this._events.add({
      time: computedTime,
      type: "setValueAtTime",
      value: valueAtTime
    });
    this._param.setValueAtTime(valueAtTime, computedTime);
    return this;
  }
  rampTo(value, rampTime = 0.1, startTime) {
    if (this.units === "frequency" || this.units === "bpm" || this.units === "decibels") {
      this.exponentialRampTo(value, rampTime, startTime);
    } else {
      this.linearRampTo(value, rampTime, startTime);
    }
    return this;
  }
  apply(param) {
    const now2 = this.context.currentTime;
    param.setValueAtTime(this.getValueAtTime(now2), now2);
    const previousEvent = this._events.get(now2);
    if (previousEvent && previousEvent.type === "setTargetAtTime") {
      const nextEvent = this._events.getAfter(previousEvent.time);
      const endTime = nextEvent ? nextEvent.time : now2 + 2;
      const subdivisions = (endTime - now2) / 10;
      for (let i = now2; i < endTime; i += subdivisions) {
        param.linearRampToValueAtTime(this.getValueAtTime(i), i);
      }
    }
    this._events.forEachAfter(this.context.currentTime, (event) => {
      if (event.type === "cancelScheduledValues") {
        param.cancelScheduledValues(event.time);
      } else if (event.type === "setTargetAtTime") {
        param.setTargetAtTime(event.value, event.time, event.constant);
      } else {
        param[event.type](event.value, event.time);
      }
    });
    return this;
  }
  setParam(param) {
    assert(this._swappable, "The Param must be assigned as 'swappable' in the constructor");
    const input = this.input;
    input.disconnect(this._param);
    this.apply(param);
    this._param = param;
    input.connect(this._param);
    return this;
  }
  dispose() {
    super.dispose();
    this._events.dispose();
    return this;
  }
  get defaultValue() {
    return this._toType(this._param.defaultValue);
  }
  _exponentialApproach(t0, v0, v1, timeConstant, t) {
    return v1 + (v0 - v1) * Math.exp(-(t - t0) / timeConstant);
  }
  _linearInterpolate(t0, v0, t1, v1, t) {
    return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
  }
  _exponentialInterpolate(t0, v0, t1, v1, t) {
    return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0));
  }
};
class ToneAudioNode extends ToneWithContext {
  constructor() {
    super(...arguments);
    this.name = "ToneAudioNode";
    this._internalChannels = [];
  }
  get numberOfInputs() {
    if (isDefined(this.input)) {
      if (isAudioParam(this.input) || this.input instanceof Param$1) {
        return 1;
      } else {
        return this.input.numberOfInputs;
      }
    } else {
      return 0;
    }
  }
  get numberOfOutputs() {
    if (isDefined(this.output)) {
      return this.output.numberOfOutputs;
    } else {
      return 0;
    }
  }
  _isAudioNode(node) {
    return isDefined(node) && (node instanceof ToneAudioNode || isAudioNode(node));
  }
  _getInternalNodes() {
    const nodeList = this._internalChannels.slice(0);
    if (this._isAudioNode(this.input)) {
      nodeList.push(this.input);
    }
    if (this._isAudioNode(this.output)) {
      if (this.input !== this.output) {
        nodeList.push(this.output);
      }
    }
    return nodeList;
  }
  _setChannelProperties(options) {
    const nodeList = this._getInternalNodes();
    nodeList.forEach((node) => {
      node.channelCount = options.channelCount;
      node.channelCountMode = options.channelCountMode;
      node.channelInterpretation = options.channelInterpretation;
    });
  }
  _getChannelProperties() {
    const nodeList = this._getInternalNodes();
    assert(nodeList.length > 0, "ToneAudioNode does not have any internal nodes");
    const node = nodeList[0];
    return {
      channelCount: node.channelCount,
      channelCountMode: node.channelCountMode,
      channelInterpretation: node.channelInterpretation
    };
  }
  get channelCount() {
    return this._getChannelProperties().channelCount;
  }
  set channelCount(channelCount) {
    const props = this._getChannelProperties();
    this._setChannelProperties(Object.assign(props, { channelCount }));
  }
  get channelCountMode() {
    return this._getChannelProperties().channelCountMode;
  }
  set channelCountMode(channelCountMode) {
    const props = this._getChannelProperties();
    this._setChannelProperties(Object.assign(props, { channelCountMode }));
  }
  get channelInterpretation() {
    return this._getChannelProperties().channelInterpretation;
  }
  set channelInterpretation(channelInterpretation) {
    const props = this._getChannelProperties();
    this._setChannelProperties(Object.assign(props, { channelInterpretation }));
  }
  connect(destination, outputNum = 0, inputNum = 0) {
    connect(this, destination, outputNum, inputNum);
    return this;
  }
  toDestination() {
    this.connect(this.context.destination);
    return this;
  }
  toMaster() {
    warn("toMaster() has been renamed toDestination()");
    return this.toDestination();
  }
  disconnect(destination, outputNum = 0, inputNum = 0) {
    disconnect(this, destination, outputNum, inputNum);
    return this;
  }
  chain(...nodes) {
    connectSeries(this, ...nodes);
    return this;
  }
  fan(...nodes) {
    nodes.forEach((node) => this.connect(node));
    return this;
  }
  dispose() {
    super.dispose();
    if (isDefined(this.input)) {
      if (this.input instanceof ToneAudioNode) {
        this.input.dispose();
      } else if (isAudioNode(this.input)) {
        this.input.disconnect();
      }
    }
    if (isDefined(this.output)) {
      if (this.output instanceof ToneAudioNode) {
        this.output.dispose();
      } else if (isAudioNode(this.output)) {
        this.output.disconnect();
      }
    }
    this._internalChannels = [];
    return this;
  }
}
function connectSeries(...nodes) {
  const first = nodes.shift();
  nodes.reduce((prev, current) => {
    if (prev instanceof ToneAudioNode) {
      prev.connect(current);
    } else if (isAudioNode(prev)) {
      connect(prev, current);
    }
    return current;
  }, first);
}
function connect(srcNode, dstNode, outputNumber = 0, inputNumber = 0) {
  assert(isDefined(srcNode), "Cannot connect from undefined node");
  assert(isDefined(dstNode), "Cannot connect to undefined node");
  if (dstNode instanceof ToneAudioNode || isAudioNode(dstNode)) {
    assert(dstNode.numberOfInputs > 0, "Cannot connect to node with no inputs");
  }
  assert(srcNode.numberOfOutputs > 0, "Cannot connect from node with no outputs");
  while (dstNode instanceof ToneAudioNode || dstNode instanceof Param$1) {
    if (isDefined(dstNode.input)) {
      dstNode = dstNode.input;
    }
  }
  while (srcNode instanceof ToneAudioNode) {
    if (isDefined(srcNode.output)) {
      srcNode = srcNode.output;
    }
  }
  if (isAudioParam(dstNode)) {
    srcNode.connect(dstNode, outputNumber);
  } else {
    srcNode.connect(dstNode, outputNumber, inputNumber);
  }
}
function disconnect(srcNode, dstNode, outputNumber = 0, inputNumber = 0) {
  if (isDefined(dstNode)) {
    while (dstNode instanceof ToneAudioNode) {
      dstNode = dstNode.input;
    }
  }
  while (!isAudioNode(srcNode)) {
    if (isDefined(srcNode.output)) {
      srcNode = srcNode.output;
    }
  }
  if (isAudioParam(dstNode)) {
    srcNode.disconnect(dstNode, outputNumber);
  } else if (isAudioNode(dstNode)) {
    srcNode.disconnect(dstNode, outputNumber, inputNumber);
  } else {
    srcNode.disconnect();
  }
}
class Gain extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Gain.getDefaults(), arguments, ["gain", "units"]));
    this.name = "Gain";
    this._gainNode = this.context.createGain();
    this.input = this._gainNode;
    this.output = this._gainNode;
    const options = optionsFromArguments(Gain.getDefaults(), arguments, ["gain", "units"]);
    this.gain = new Param$1({
      context: this.context,
      convert: options.convert,
      param: this._gainNode.gain,
      units: options.units,
      value: options.gain,
      minValue: options.minValue,
      maxValue: options.maxValue
    });
    readOnly(this, "gain");
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      convert: true,
      gain: 1,
      units: "gain"
    });
  }
  dispose() {
    super.dispose();
    this._gainNode.disconnect();
    this.gain.dispose();
    return this;
  }
}
class OneShotSource extends ToneAudioNode {
  constructor(options) {
    super(options);
    this.onended = noOp;
    this._startTime = -1;
    this._stopTime = -1;
    this._timeout = -1;
    this.output = new Gain({
      context: this.context,
      gain: 0
    });
    this._gainNode = this.output;
    this.getStateAtTime = function(time) {
      const computedTime = this.toSeconds(time);
      if (this._startTime !== -1 && computedTime >= this._startTime && (this._stopTime === -1 || computedTime <= this._stopTime)) {
        return "started";
      } else {
        return "stopped";
      }
    };
    this._fadeIn = options.fadeIn;
    this._fadeOut = options.fadeOut;
    this._curve = options.curve;
    this.onended = options.onended;
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      curve: "linear",
      fadeIn: 0,
      fadeOut: 0,
      onended: noOp
    });
  }
  _startGain(time, gain = 1) {
    assert(this._startTime === -1, "Source cannot be started more than once");
    const fadeInTime = this.toSeconds(this._fadeIn);
    this._startTime = time + fadeInTime;
    this._startTime = Math.max(this._startTime, this.context.currentTime);
    if (fadeInTime > 0) {
      this._gainNode.gain.setValueAtTime(0, time);
      if (this._curve === "linear") {
        this._gainNode.gain.linearRampToValueAtTime(gain, time + fadeInTime);
      } else {
        this._gainNode.gain.exponentialApproachValueAtTime(gain, time, fadeInTime);
      }
    } else {
      this._gainNode.gain.setValueAtTime(gain, time);
    }
    return this;
  }
  stop(time) {
    this.log("stop", time);
    this._stopGain(this.toSeconds(time));
    return this;
  }
  _stopGain(time) {
    assert(this._startTime !== -1, "'start' must be called before 'stop'");
    this.cancelStop();
    const fadeOutTime = this.toSeconds(this._fadeOut);
    this._stopTime = this.toSeconds(time) + fadeOutTime;
    this._stopTime = Math.max(this._stopTime, this.context.currentTime);
    if (fadeOutTime > 0) {
      if (this._curve === "linear") {
        this._gainNode.gain.linearRampTo(0, fadeOutTime, time);
      } else {
        this._gainNode.gain.targetRampTo(0, fadeOutTime, time);
      }
    } else {
      this._gainNode.gain.cancelAndHoldAtTime(time);
      this._gainNode.gain.setValueAtTime(0, time);
    }
    this.context.clearTimeout(this._timeout);
    this._timeout = this.context.setTimeout(() => {
      const additionalTail = this._curve === "exponential" ? fadeOutTime * 2 : 0;
      this._stopSource(this.now() + additionalTail);
      this._onended();
    }, this._stopTime - this.context.currentTime);
    return this;
  }
  _onended() {
    if (this.onended !== noOp) {
      this.onended(this);
      this.onended = noOp;
      if (!this.context.isOffline) {
        const disposeCallback = () => this.dispose();
        if (typeof window.requestIdleCallback !== "undefined") {
          window.requestIdleCallback(disposeCallback);
        } else {
          setTimeout(disposeCallback, 1e3);
        }
      }
    }
  }
  get state() {
    return this.getStateAtTime(this.now());
  }
  cancelStop() {
    this.log("cancelStop");
    assert(this._startTime !== -1, "Source is not started");
    this._gainNode.gain.cancelScheduledValues(this._startTime + this.sampleTime);
    this.context.clearTimeout(this._timeout);
    this._stopTime = -1;
    return this;
  }
  dispose() {
    super.dispose();
    this._gainNode.disconnect();
    return this;
  }
}
class ToneConstantSource extends OneShotSource {
  constructor() {
    super(optionsFromArguments(ToneConstantSource.getDefaults(), arguments, ["offset"]));
    this.name = "ToneConstantSource";
    this._source = this.context.createConstantSource();
    const options = optionsFromArguments(ToneConstantSource.getDefaults(), arguments, ["offset"]);
    connect(this._source, this._gainNode);
    this.offset = new Param$1({
      context: this.context,
      convert: options.convert,
      param: this._source.offset,
      units: options.units,
      value: options.offset,
      minValue: options.minValue,
      maxValue: options.maxValue
    });
  }
  static getDefaults() {
    return Object.assign(OneShotSource.getDefaults(), {
      convert: true,
      offset: 1,
      units: "number"
    });
  }
  start(time) {
    const computedTime = this.toSeconds(time);
    this.log("start", computedTime);
    this._startGain(computedTime);
    this._source.start(computedTime);
    return this;
  }
  _stopSource(time) {
    this._source.stop(time);
  }
  dispose() {
    super.dispose();
    if (this.state === "started") {
      this.stop();
    }
    this._source.disconnect();
    this.offset.dispose();
    return this;
  }
}
class Signal extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Signal.getDefaults(), arguments, ["value", "units"]));
    this.name = "Signal";
    this.override = true;
    const options = optionsFromArguments(Signal.getDefaults(), arguments, ["value", "units"]);
    this.output = this._constantSource = new ToneConstantSource({
      context: this.context,
      convert: options.convert,
      offset: options.value,
      units: options.units,
      minValue: options.minValue,
      maxValue: options.maxValue
    });
    this._constantSource.start(0);
    this.input = this._param = this._constantSource.offset;
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      convert: true,
      units: "number",
      value: 0
    });
  }
  connect(destination, outputNum = 0, inputNum = 0) {
    connectSignal(this, destination, outputNum, inputNum);
    return this;
  }
  dispose() {
    super.dispose();
    this._param.dispose();
    this._constantSource.dispose();
    return this;
  }
  setValueAtTime(value, time) {
    this._param.setValueAtTime(value, time);
    return this;
  }
  getValueAtTime(time) {
    return this._param.getValueAtTime(time);
  }
  setRampPoint(time) {
    this._param.setRampPoint(time);
    return this;
  }
  linearRampToValueAtTime(value, time) {
    this._param.linearRampToValueAtTime(value, time);
    return this;
  }
  exponentialRampToValueAtTime(value, time) {
    this._param.exponentialRampToValueAtTime(value, time);
    return this;
  }
  exponentialRampTo(value, rampTime, startTime) {
    this._param.exponentialRampTo(value, rampTime, startTime);
    return this;
  }
  linearRampTo(value, rampTime, startTime) {
    this._param.linearRampTo(value, rampTime, startTime);
    return this;
  }
  targetRampTo(value, rampTime, startTime) {
    this._param.targetRampTo(value, rampTime, startTime);
    return this;
  }
  exponentialApproachValueAtTime(value, time, rampTime) {
    this._param.exponentialApproachValueAtTime(value, time, rampTime);
    return this;
  }
  setTargetAtTime(value, startTime, timeConstant) {
    this._param.setTargetAtTime(value, startTime, timeConstant);
    return this;
  }
  setValueCurveAtTime(values, startTime, duration, scaling) {
    this._param.setValueCurveAtTime(values, startTime, duration, scaling);
    return this;
  }
  cancelScheduledValues(time) {
    this._param.cancelScheduledValues(time);
    return this;
  }
  cancelAndHoldAtTime(time) {
    this._param.cancelAndHoldAtTime(time);
    return this;
  }
  rampTo(value, rampTime, startTime) {
    this._param.rampTo(value, rampTime, startTime);
    return this;
  }
  get value() {
    return this._param.value;
  }
  set value(value) {
    this._param.value = value;
  }
  get convert() {
    return this._param.convert;
  }
  set convert(convert) {
    this._param.convert = convert;
  }
  get units() {
    return this._param.units;
  }
  get overridden() {
    return this._param.overridden;
  }
  set overridden(overridden) {
    this._param.overridden = overridden;
  }
  get maxValue() {
    return this._param.maxValue;
  }
  get minValue() {
    return this._param.minValue;
  }
  apply(param) {
    this._param.apply(param);
    return this;
  }
}
function connectSignal(signal, destination, outputNum, inputNum) {
  if (destination instanceof Param$1 || isAudioParam(destination) || destination instanceof Signal && destination.override) {
    destination.cancelScheduledValues(0);
    destination.setValueAtTime(0, 0);
    if (destination instanceof Signal) {
      destination.overridden = true;
    }
  }
  connect(signal, destination, outputNum, inputNum);
}
class TickParam extends Param$1 {
  constructor() {
    super(optionsFromArguments(TickParam.getDefaults(), arguments, ["value"]));
    this.name = "TickParam";
    this._events = new Timeline(Infinity);
    this._multiplier = 1;
    const options = optionsFromArguments(TickParam.getDefaults(), arguments, ["value"]);
    this._multiplier = options.multiplier;
    this._events.cancel(0);
    this._events.add({
      ticks: 0,
      time: 0,
      type: "setValueAtTime",
      value: this._fromType(options.value)
    });
    this.setValueAtTime(options.value, 0);
  }
  static getDefaults() {
    return Object.assign(Param$1.getDefaults(), {
      multiplier: 1,
      units: "hertz",
      value: 1
    });
  }
  setTargetAtTime(value, time, constant) {
    time = this.toSeconds(time);
    this.setRampPoint(time);
    const computedValue = this._fromType(value);
    const prevEvent = this._events.get(time);
    const segments = Math.round(Math.max(1 / constant, 1));
    for (let i = 0; i <= segments; i++) {
      const segTime = constant * i + time;
      const rampVal = this._exponentialApproach(prevEvent.time, prevEvent.value, computedValue, constant, segTime);
      this.linearRampToValueAtTime(this._toType(rampVal), segTime);
    }
    return this;
  }
  setValueAtTime(value, time) {
    const computedTime = this.toSeconds(time);
    super.setValueAtTime(value, time);
    const event = this._events.get(computedTime);
    const previousEvent = this._events.previousEvent(event);
    const ticksUntilTime = this._getTicksUntilEvent(previousEvent, computedTime);
    event.ticks = Math.max(ticksUntilTime, 0);
    return this;
  }
  linearRampToValueAtTime(value, time) {
    const computedTime = this.toSeconds(time);
    super.linearRampToValueAtTime(value, time);
    const event = this._events.get(computedTime);
    const previousEvent = this._events.previousEvent(event);
    const ticksUntilTime = this._getTicksUntilEvent(previousEvent, computedTime);
    event.ticks = Math.max(ticksUntilTime, 0);
    return this;
  }
  exponentialRampToValueAtTime(value, time) {
    time = this.toSeconds(time);
    const computedVal = this._fromType(value);
    const prevEvent = this._events.get(time);
    const segments = Math.round(Math.max((time - prevEvent.time) * 10, 1));
    const segmentDur = (time - prevEvent.time) / segments;
    for (let i = 0; i <= segments; i++) {
      const segTime = segmentDur * i + prevEvent.time;
      const rampVal = this._exponentialInterpolate(prevEvent.time, prevEvent.value, time, computedVal, segTime);
      this.linearRampToValueAtTime(this._toType(rampVal), segTime);
    }
    return this;
  }
  _getTicksUntilEvent(event, time) {
    if (event === null) {
      event = {
        ticks: 0,
        time: 0,
        type: "setValueAtTime",
        value: 0
      };
    } else if (isUndef(event.ticks)) {
      const previousEvent = this._events.previousEvent(event);
      event.ticks = this._getTicksUntilEvent(previousEvent, event.time);
    }
    const val0 = this._fromType(this.getValueAtTime(event.time));
    let val1 = this._fromType(this.getValueAtTime(time));
    const onTheLineEvent = this._events.get(time);
    if (onTheLineEvent && onTheLineEvent.time === time && onTheLineEvent.type === "setValueAtTime") {
      val1 = this._fromType(this.getValueAtTime(time - this.sampleTime));
    }
    return 0.5 * (time - event.time) * (val0 + val1) + event.ticks;
  }
  getTicksAtTime(time) {
    const computedTime = this.toSeconds(time);
    const event = this._events.get(computedTime);
    return Math.max(this._getTicksUntilEvent(event, computedTime), 0);
  }
  getDurationOfTicks(ticks, time) {
    const computedTime = this.toSeconds(time);
    const currentTick = this.getTicksAtTime(time);
    return this.getTimeOfTick(currentTick + ticks) - computedTime;
  }
  getTimeOfTick(tick) {
    const before = this._events.get(tick, "ticks");
    const after = this._events.getAfter(tick, "ticks");
    if (before && before.ticks === tick) {
      return before.time;
    } else if (before && after && after.type === "linearRampToValueAtTime" && before.value !== after.value) {
      const val0 = this._fromType(this.getValueAtTime(before.time));
      const val1 = this._fromType(this.getValueAtTime(after.time));
      const delta = (val1 - val0) / (after.time - before.time);
      const k = Math.sqrt(Math.pow(val0, 2) - 2 * delta * (before.ticks - tick));
      const sol1 = (-val0 + k) / delta;
      const sol2 = (-val0 - k) / delta;
      return (sol1 > 0 ? sol1 : sol2) + before.time;
    } else if (before) {
      if (before.value === 0) {
        return Infinity;
      } else {
        return before.time + (tick - before.ticks) / before.value;
      }
    } else {
      return tick / this._initialValue;
    }
  }
  ticksToTime(ticks, when) {
    return this.getDurationOfTicks(ticks, when);
  }
  timeToTicks(duration, when) {
    const computedTime = this.toSeconds(when);
    const computedDuration = this.toSeconds(duration);
    const startTicks = this.getTicksAtTime(computedTime);
    const endTicks = this.getTicksAtTime(computedTime + computedDuration);
    return endTicks - startTicks;
  }
  _fromType(val) {
    if (this.units === "bpm" && this.multiplier) {
      return 1 / (60 / val / this.multiplier);
    } else {
      return super._fromType(val);
    }
  }
  _toType(val) {
    if (this.units === "bpm" && this.multiplier) {
      return val / this.multiplier * 60;
    } else {
      return super._toType(val);
    }
  }
  get multiplier() {
    return this._multiplier;
  }
  set multiplier(m) {
    const currentVal = this.value;
    this._multiplier = m;
    this.cancelScheduledValues(0);
    this.setValueAtTime(currentVal, 0);
  }
}
class TickSignal extends Signal {
  constructor() {
    super(optionsFromArguments(TickSignal.getDefaults(), arguments, ["value"]));
    this.name = "TickSignal";
    const options = optionsFromArguments(TickSignal.getDefaults(), arguments, ["value"]);
    this.input = this._param = new TickParam({
      context: this.context,
      convert: options.convert,
      multiplier: options.multiplier,
      param: this._constantSource.offset,
      units: options.units,
      value: options.value
    });
  }
  static getDefaults() {
    return Object.assign(Signal.getDefaults(), {
      multiplier: 1,
      units: "hertz",
      value: 1
    });
  }
  ticksToTime(ticks, when) {
    return this._param.ticksToTime(ticks, when);
  }
  timeToTicks(duration, when) {
    return this._param.timeToTicks(duration, when);
  }
  getTimeOfTick(tick) {
    return this._param.getTimeOfTick(tick);
  }
  getDurationOfTicks(ticks, time) {
    return this._param.getDurationOfTicks(ticks, time);
  }
  getTicksAtTime(time) {
    return this._param.getTicksAtTime(time);
  }
  get multiplier() {
    return this._param.multiplier;
  }
  set multiplier(m) {
    this._param.multiplier = m;
  }
  dispose() {
    super.dispose();
    this._param.dispose();
    return this;
  }
}
class TickSource extends ToneWithContext {
  constructor() {
    super(optionsFromArguments(TickSource.getDefaults(), arguments, ["frequency"]));
    this.name = "TickSource";
    this._state = new StateTimeline();
    this._tickOffset = new Timeline();
    const options = optionsFromArguments(TickSource.getDefaults(), arguments, ["frequency"]);
    this.frequency = new TickSignal({
      context: this.context,
      units: options.units,
      value: options.frequency
    });
    readOnly(this, "frequency");
    this._state.setStateAtTime("stopped", 0);
    this.setTicksAtTime(0, 0);
  }
  static getDefaults() {
    return Object.assign({
      frequency: 1,
      units: "hertz"
    }, ToneWithContext.getDefaults());
  }
  get state() {
    return this.getStateAtTime(this.now());
  }
  start(time, offset) {
    const computedTime = this.toSeconds(time);
    if (this._state.getValueAtTime(computedTime) !== "started") {
      this._state.setStateAtTime("started", computedTime);
      if (isDefined(offset)) {
        this.setTicksAtTime(offset, computedTime);
      }
    }
    return this;
  }
  stop(time) {
    const computedTime = this.toSeconds(time);
    if (this._state.getValueAtTime(computedTime) === "stopped") {
      const event = this._state.get(computedTime);
      if (event && event.time > 0) {
        this._tickOffset.cancel(event.time);
        this._state.cancel(event.time);
      }
    }
    this._state.cancel(computedTime);
    this._state.setStateAtTime("stopped", computedTime);
    this.setTicksAtTime(0, computedTime);
    return this;
  }
  pause(time) {
    const computedTime = this.toSeconds(time);
    if (this._state.getValueAtTime(computedTime) === "started") {
      this._state.setStateAtTime("paused", computedTime);
    }
    return this;
  }
  cancel(time) {
    time = this.toSeconds(time);
    this._state.cancel(time);
    this._tickOffset.cancel(time);
    return this;
  }
  getTicksAtTime(time) {
    const computedTime = this.toSeconds(time);
    const stopEvent = this._state.getLastState("stopped", computedTime);
    const tmpEvent = { state: "paused", time: computedTime };
    this._state.add(tmpEvent);
    let lastState = stopEvent;
    let elapsedTicks = 0;
    this._state.forEachBetween(stopEvent.time, computedTime + this.sampleTime, (e) => {
      let periodStartTime = lastState.time;
      const offsetEvent = this._tickOffset.get(e.time);
      if (offsetEvent && offsetEvent.time >= lastState.time) {
        elapsedTicks = offsetEvent.ticks;
        periodStartTime = offsetEvent.time;
      }
      if (lastState.state === "started" && e.state !== "started") {
        elapsedTicks += this.frequency.getTicksAtTime(e.time) - this.frequency.getTicksAtTime(periodStartTime);
      }
      lastState = e;
    });
    this._state.remove(tmpEvent);
    return elapsedTicks;
  }
  get ticks() {
    return this.getTicksAtTime(this.now());
  }
  set ticks(t) {
    this.setTicksAtTime(t, this.now());
  }
  get seconds() {
    return this.getSecondsAtTime(this.now());
  }
  set seconds(s) {
    const now2 = this.now();
    const ticks = this.frequency.timeToTicks(s, now2);
    this.setTicksAtTime(ticks, now2);
  }
  getSecondsAtTime(time) {
    time = this.toSeconds(time);
    const stopEvent = this._state.getLastState("stopped", time);
    const tmpEvent = { state: "paused", time };
    this._state.add(tmpEvent);
    let lastState = stopEvent;
    let elapsedSeconds = 0;
    this._state.forEachBetween(stopEvent.time, time + this.sampleTime, (e) => {
      let periodStartTime = lastState.time;
      const offsetEvent = this._tickOffset.get(e.time);
      if (offsetEvent && offsetEvent.time >= lastState.time) {
        elapsedSeconds = offsetEvent.seconds;
        periodStartTime = offsetEvent.time;
      }
      if (lastState.state === "started" && e.state !== "started") {
        elapsedSeconds += e.time - periodStartTime;
      }
      lastState = e;
    });
    this._state.remove(tmpEvent);
    return elapsedSeconds;
  }
  setTicksAtTime(ticks, time) {
    time = this.toSeconds(time);
    this._tickOffset.cancel(time);
    this._tickOffset.add({
      seconds: this.frequency.getDurationOfTicks(ticks, time),
      ticks,
      time
    });
    return this;
  }
  getStateAtTime(time) {
    time = this.toSeconds(time);
    return this._state.getValueAtTime(time);
  }
  getTimeOfTick(tick, before = this.now()) {
    const offset = this._tickOffset.get(before);
    const event = this._state.get(before);
    const startTime = Math.max(offset.time, event.time);
    const absoluteTicks = this.frequency.getTicksAtTime(startTime) + tick - offset.ticks;
    return this.frequency.getTimeOfTick(absoluteTicks);
  }
  forEachTickBetween(startTime, endTime, callback) {
    let lastStateEvent = this._state.get(startTime);
    this._state.forEachBetween(startTime, endTime, (event) => {
      if (lastStateEvent && lastStateEvent.state === "started" && event.state !== "started") {
        this.forEachTickBetween(Math.max(lastStateEvent.time, startTime), event.time - this.sampleTime, callback);
      }
      lastStateEvent = event;
    });
    let error = null;
    if (lastStateEvent && lastStateEvent.state === "started") {
      const maxStartTime = Math.max(lastStateEvent.time, startTime);
      const startTicks = this.frequency.getTicksAtTime(maxStartTime);
      const ticksAtStart = this.frequency.getTicksAtTime(lastStateEvent.time);
      const diff = startTicks - ticksAtStart;
      let offset = Math.ceil(diff) - diff;
      offset = EQ(offset, 1) ? 0 : offset;
      let nextTickTime = this.frequency.getTimeOfTick(startTicks + offset);
      while (nextTickTime < endTime) {
        try {
          callback(nextTickTime, Math.round(this.getTicksAtTime(nextTickTime)));
        } catch (e) {
          error = e;
          break;
        }
        nextTickTime += this.frequency.getDurationOfTicks(1, nextTickTime);
      }
    }
    if (error) {
      throw error;
    }
    return this;
  }
  dispose() {
    super.dispose();
    this._state.dispose();
    this._tickOffset.dispose();
    this.frequency.dispose();
    return this;
  }
}
class Clock extends ToneWithContext {
  constructor() {
    super(optionsFromArguments(Clock.getDefaults(), arguments, ["callback", "frequency"]));
    this.name = "Clock";
    this.callback = noOp;
    this._lastUpdate = 0;
    this._state = new StateTimeline("stopped");
    this._boundLoop = this._loop.bind(this);
    const options = optionsFromArguments(Clock.getDefaults(), arguments, ["callback", "frequency"]);
    this.callback = options.callback;
    this._tickSource = new TickSource({
      context: this.context,
      frequency: options.frequency,
      units: options.units
    });
    this._lastUpdate = 0;
    this.frequency = this._tickSource.frequency;
    readOnly(this, "frequency");
    this._state.setStateAtTime("stopped", 0);
    this.context.on("tick", this._boundLoop);
  }
  static getDefaults() {
    return Object.assign(ToneWithContext.getDefaults(), {
      callback: noOp,
      frequency: 1,
      units: "hertz"
    });
  }
  get state() {
    return this._state.getValueAtTime(this.now());
  }
  start(time, offset) {
    assertContextRunning(this.context);
    const computedTime = this.toSeconds(time);
    this.log("start", computedTime);
    if (this._state.getValueAtTime(computedTime) !== "started") {
      this._state.setStateAtTime("started", computedTime);
      this._tickSource.start(computedTime, offset);
      if (computedTime < this._lastUpdate) {
        this.emit("start", computedTime, offset);
      }
    }
    return this;
  }
  stop(time) {
    const computedTime = this.toSeconds(time);
    this.log("stop", computedTime);
    this._state.cancel(computedTime);
    this._state.setStateAtTime("stopped", computedTime);
    this._tickSource.stop(computedTime);
    if (computedTime < this._lastUpdate) {
      this.emit("stop", computedTime);
    }
    return this;
  }
  pause(time) {
    const computedTime = this.toSeconds(time);
    if (this._state.getValueAtTime(computedTime) === "started") {
      this._state.setStateAtTime("paused", computedTime);
      this._tickSource.pause(computedTime);
      if (computedTime < this._lastUpdate) {
        this.emit("pause", computedTime);
      }
    }
    return this;
  }
  get ticks() {
    return Math.ceil(this.getTicksAtTime(this.now()));
  }
  set ticks(t) {
    this._tickSource.ticks = t;
  }
  get seconds() {
    return this._tickSource.seconds;
  }
  set seconds(s) {
    this._tickSource.seconds = s;
  }
  getSecondsAtTime(time) {
    return this._tickSource.getSecondsAtTime(time);
  }
  setTicksAtTime(ticks, time) {
    this._tickSource.setTicksAtTime(ticks, time);
    return this;
  }
  getTimeOfTick(tick, before = this.now()) {
    return this._tickSource.getTimeOfTick(tick, before);
  }
  getTicksAtTime(time) {
    return this._tickSource.getTicksAtTime(time);
  }
  nextTickTime(offset, when) {
    const computedTime = this.toSeconds(when);
    const currentTick = this.getTicksAtTime(computedTime);
    return this._tickSource.getTimeOfTick(currentTick + offset, computedTime);
  }
  _loop() {
    const startTime = this._lastUpdate;
    const endTime = this.now();
    this._lastUpdate = endTime;
    this.log("loop", startTime, endTime);
    if (startTime !== endTime) {
      this._state.forEachBetween(startTime, endTime, (e) => {
        switch (e.state) {
          case "started":
            const offset = this._tickSource.getTicksAtTime(e.time);
            this.emit("start", e.time, offset);
            break;
          case "stopped":
            if (e.time !== 0) {
              this.emit("stop", e.time);
            }
            break;
          case "paused":
            this.emit("pause", e.time);
            break;
        }
      });
      this._tickSource.forEachTickBetween(startTime, endTime, (time, ticks) => {
        this.callback(time, ticks);
      });
    }
  }
  getStateAtTime(time) {
    const computedTime = this.toSeconds(time);
    return this._state.getValueAtTime(computedTime);
  }
  dispose() {
    super.dispose();
    this.context.off("tick", this._boundLoop);
    this._tickSource.dispose();
    this._state.dispose();
    return this;
  }
}
Emitter.mixin(Clock);
class ToneAudioBuffers extends Tone {
  constructor() {
    super();
    this.name = "ToneAudioBuffers";
    this._buffers = /* @__PURE__ */ new Map();
    this._loadingCount = 0;
    const options = optionsFromArguments(ToneAudioBuffers.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls");
    this.baseUrl = options.baseUrl;
    Object.keys(options.urls).forEach((name) => {
      this._loadingCount++;
      const url = options.urls[name];
      this.add(name, url, this._bufferLoaded.bind(this, options.onload), options.onerror);
    });
  }
  static getDefaults() {
    return {
      baseUrl: "",
      onerror: noOp,
      onload: noOp,
      urls: {}
    };
  }
  has(name) {
    return this._buffers.has(name.toString());
  }
  get(name) {
    assert(this.has(name), `ToneAudioBuffers has no buffer named: ${name}`);
    return this._buffers.get(name.toString());
  }
  _bufferLoaded(callback) {
    this._loadingCount--;
    if (this._loadingCount === 0 && callback) {
      callback();
    }
  }
  get loaded() {
    return Array.from(this._buffers).every(([_, buffer]) => buffer.loaded);
  }
  add(name, url, callback = noOp, onerror = noOp) {
    if (isString(url)) {
      this._buffers.set(name.toString(), new ToneAudioBuffer(this.baseUrl + url, callback, onerror));
    } else {
      this._buffers.set(name.toString(), new ToneAudioBuffer(url, callback, onerror));
    }
    return this;
  }
  dispose() {
    super.dispose();
    this._buffers.forEach((buffer) => buffer.dispose());
    this._buffers.clear();
    return this;
  }
}
class TicksClass extends TransportTimeClass {
  constructor() {
    super(...arguments);
    this.name = "Ticks";
    this.defaultUnits = "i";
  }
  _now() {
    return this.context.transport.ticks;
  }
  _beatsToUnits(beats) {
    return this._getPPQ() * beats;
  }
  _secondsToUnits(seconds) {
    return Math.floor(seconds / (60 / this._getBpm()) * this._getPPQ());
  }
  _ticksToUnits(ticks) {
    return ticks;
  }
  toTicks() {
    return this.valueOf();
  }
  toSeconds() {
    return this.valueOf() / this._getPPQ() * (60 / this._getBpm());
  }
}
let Draw$1 = class Draw extends ToneWithContext {
  constructor() {
    super(...arguments);
    this.name = "Draw";
    this.expiration = 0.25;
    this.anticipation = 8e-3;
    this._events = new Timeline();
    this._boundDrawLoop = this._drawLoop.bind(this);
    this._animationFrame = -1;
  }
  schedule(callback, time) {
    this._events.add({
      callback,
      time: this.toSeconds(time)
    });
    if (this._events.length === 1) {
      this._animationFrame = requestAnimationFrame(this._boundDrawLoop);
    }
    return this;
  }
  cancel(after) {
    this._events.cancel(this.toSeconds(after));
    return this;
  }
  _drawLoop() {
    const now2 = this.context.currentTime;
    while (this._events.length && this._events.peek().time - this.anticipation <= now2) {
      const event = this._events.shift();
      if (event && now2 - event.time <= this.expiration) {
        event.callback();
      }
    }
    if (this._events.length > 0) {
      this._animationFrame = requestAnimationFrame(this._boundDrawLoop);
    }
  }
  dispose() {
    super.dispose();
    this._events.dispose();
    cancelAnimationFrame(this._animationFrame);
    return this;
  }
};
onContextInit((context2) => {
  context2.draw = new Draw$1({ context: context2 });
});
onContextClose((context2) => {
  context2.draw.dispose();
});
class Volume extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Volume.getDefaults(), arguments, ["volume"]));
    this.name = "Volume";
    const options = optionsFromArguments(Volume.getDefaults(), arguments, ["volume"]);
    this.input = this.output = new Gain({
      context: this.context,
      gain: options.volume,
      units: "decibels"
    });
    this.volume = this.output.gain;
    readOnly(this, "volume");
    this._unmutedVolume = options.volume;
    this.mute = options.mute;
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      mute: false,
      volume: 0
    });
  }
  get mute() {
    return this.volume.value === -Infinity;
  }
  set mute(mute) {
    if (!this.mute && mute) {
      this._unmutedVolume = this.volume.value;
      this.volume.value = -Infinity;
    } else if (this.mute && !mute) {
      this.volume.value = this._unmutedVolume;
    }
  }
  dispose() {
    super.dispose();
    this.input.dispose();
    this.volume.dispose();
    return this;
  }
}
let Destination$1 = class Destination extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Destination.getDefaults(), arguments));
    this.name = "Destination";
    this.input = new Volume({ context: this.context });
    this.output = new Gain({ context: this.context });
    this.volume = this.input.volume;
    const options = optionsFromArguments(Destination.getDefaults(), arguments);
    connectSeries(this.input, this.output, this.context.rawContext.destination);
    this.mute = options.mute;
    this._internalChannels = [this.input, this.context.rawContext.destination, this.output];
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      mute: false,
      volume: 0
    });
  }
  get mute() {
    return this.input.mute;
  }
  set mute(mute) {
    this.input.mute = mute;
  }
  chain(...args) {
    this.input.disconnect();
    args.unshift(this.input);
    args.push(this.output);
    connectSeries(...args);
    return this;
  }
  get maxChannelCount() {
    return this.context.rawContext.destination.maxChannelCount;
  }
  dispose() {
    super.dispose();
    this.volume.dispose();
    return this;
  }
};
onContextInit((context2) => {
  context2.destination = new Destination$1({ context: context2 });
});
onContextClose((context2) => {
  context2.destination.dispose();
});
class TimelineValue extends Tone {
  constructor(initialValue) {
    super();
    this.name = "TimelineValue";
    this._timeline = new Timeline({ memory: 10 });
    this._initialValue = initialValue;
  }
  set(value, time) {
    this._timeline.add({
      value,
      time
    });
    return this;
  }
  get(time) {
    const event = this._timeline.get(time);
    if (event) {
      return event.value;
    } else {
      return this._initialValue;
    }
  }
}
class IntervalTimeline extends Tone {
  constructor() {
    super(...arguments);
    this.name = "IntervalTimeline";
    this._root = null;
    this._length = 0;
  }
  add(event) {
    assert(isDefined(event.time), "Events must have a time property");
    assert(isDefined(event.duration), "Events must have a duration parameter");
    event.time = event.time.valueOf();
    let node = new IntervalNode(event.time, event.time + event.duration, event);
    if (this._root === null) {
      this._root = node;
    } else {
      this._root.insert(node);
    }
    this._length++;
    while (node !== null) {
      node.updateHeight();
      node.updateMax();
      this._rebalance(node);
      node = node.parent;
    }
    return this;
  }
  remove(event) {
    if (this._root !== null) {
      const results = [];
      this._root.search(event.time, results);
      for (const node of results) {
        if (node.event === event) {
          this._removeNode(node);
          this._length--;
          break;
        }
      }
    }
    return this;
  }
  get length() {
    return this._length;
  }
  cancel(after) {
    this.forEachFrom(after, (event) => this.remove(event));
    return this;
  }
  _setRoot(node) {
    this._root = node;
    if (this._root !== null) {
      this._root.parent = null;
    }
  }
  _replaceNodeInParent(node, replacement) {
    if (node.parent !== null) {
      if (node.isLeftChild()) {
        node.parent.left = replacement;
      } else {
        node.parent.right = replacement;
      }
      this._rebalance(node.parent);
    } else {
      this._setRoot(replacement);
    }
  }
  _removeNode(node) {
    if (node.left === null && node.right === null) {
      this._replaceNodeInParent(node, null);
    } else if (node.right === null) {
      this._replaceNodeInParent(node, node.left);
    } else if (node.left === null) {
      this._replaceNodeInParent(node, node.right);
    } else {
      const balance = node.getBalance();
      let replacement;
      let temp = null;
      if (balance > 0) {
        if (node.left.right === null) {
          replacement = node.left;
          replacement.right = node.right;
          temp = replacement;
        } else {
          replacement = node.left.right;
          while (replacement.right !== null) {
            replacement = replacement.right;
          }
          if (replacement.parent) {
            replacement.parent.right = replacement.left;
            temp = replacement.parent;
            replacement.left = node.left;
            replacement.right = node.right;
          }
        }
      } else if (node.right.left === null) {
        replacement = node.right;
        replacement.left = node.left;
        temp = replacement;
      } else {
        replacement = node.right.left;
        while (replacement.left !== null) {
          replacement = replacement.left;
        }
        if (replacement.parent) {
          replacement.parent.left = replacement.right;
          temp = replacement.parent;
          replacement.left = node.left;
          replacement.right = node.right;
        }
      }
      if (node.parent !== null) {
        if (node.isLeftChild()) {
          node.parent.left = replacement;
        } else {
          node.parent.right = replacement;
        }
      } else {
        this._setRoot(replacement);
      }
      if (temp) {
        this._rebalance(temp);
      }
    }
    node.dispose();
  }
  _rotateLeft(node) {
    const parent = node.parent;
    const isLeftChild = node.isLeftChild();
    const pivotNode = node.right;
    if (pivotNode) {
      node.right = pivotNode.left;
      pivotNode.left = node;
    }
    if (parent !== null) {
      if (isLeftChild) {
        parent.left = pivotNode;
      } else {
        parent.right = pivotNode;
      }
    } else {
      this._setRoot(pivotNode);
    }
  }
  _rotateRight(node) {
    const parent = node.parent;
    const isLeftChild = node.isLeftChild();
    const pivotNode = node.left;
    if (pivotNode) {
      node.left = pivotNode.right;
      pivotNode.right = node;
    }
    if (parent !== null) {
      if (isLeftChild) {
        parent.left = pivotNode;
      } else {
        parent.right = pivotNode;
      }
    } else {
      this._setRoot(pivotNode);
    }
  }
  _rebalance(node) {
    const balance = node.getBalance();
    if (balance > 1 && node.left) {
      if (node.left.getBalance() < 0) {
        this._rotateLeft(node.left);
      } else {
        this._rotateRight(node);
      }
    } else if (balance < -1 && node.right) {
      if (node.right.getBalance() > 0) {
        this._rotateRight(node.right);
      } else {
        this._rotateLeft(node);
      }
    }
  }
  get(time) {
    if (this._root !== null) {
      const results = [];
      this._root.search(time, results);
      if (results.length > 0) {
        let max = results[0];
        for (let i = 1; i < results.length; i++) {
          if (results[i].low > max.low) {
            max = results[i];
          }
        }
        return max.event;
      }
    }
    return null;
  }
  forEach(callback) {
    if (this._root !== null) {
      const allNodes = [];
      this._root.traverse((node) => allNodes.push(node));
      allNodes.forEach((node) => {
        if (node.event) {
          callback(node.event);
        }
      });
    }
    return this;
  }
  forEachAtTime(time, callback) {
    if (this._root !== null) {
      const results = [];
      this._root.search(time, results);
      results.forEach((node) => {
        if (node.event) {
          callback(node.event);
        }
      });
    }
    return this;
  }
  forEachFrom(time, callback) {
    if (this._root !== null) {
      const results = [];
      this._root.searchAfter(time, results);
      results.forEach((node) => {
        if (node.event) {
          callback(node.event);
        }
      });
    }
    return this;
  }
  dispose() {
    super.dispose();
    if (this._root !== null) {
      this._root.traverse((node) => node.dispose());
    }
    this._root = null;
    return this;
  }
}
class IntervalNode {
  constructor(low, high, event) {
    this._left = null;
    this._right = null;
    this.parent = null;
    this.height = 0;
    this.event = event;
    this.low = low;
    this.high = high;
    this.max = this.high;
  }
  insert(node) {
    if (node.low <= this.low) {
      if (this.left === null) {
        this.left = node;
      } else {
        this.left.insert(node);
      }
    } else if (this.right === null) {
      this.right = node;
    } else {
      this.right.insert(node);
    }
  }
  search(point, results) {
    if (point > this.max) {
      return;
    }
    if (this.left !== null) {
      this.left.search(point, results);
    }
    if (this.low <= point && this.high > point) {
      results.push(this);
    }
    if (this.low > point) {
      return;
    }
    if (this.right !== null) {
      this.right.search(point, results);
    }
  }
  searchAfter(point, results) {
    if (this.low >= point) {
      results.push(this);
      if (this.left !== null) {
        this.left.searchAfter(point, results);
      }
    }
    if (this.right !== null) {
      this.right.searchAfter(point, results);
    }
  }
  traverse(callback) {
    callback(this);
    if (this.left !== null) {
      this.left.traverse(callback);
    }
    if (this.right !== null) {
      this.right.traverse(callback);
    }
  }
  updateHeight() {
    if (this.left !== null && this.right !== null) {
      this.height = Math.max(this.left.height, this.right.height) + 1;
    } else if (this.right !== null) {
      this.height = this.right.height + 1;
    } else if (this.left !== null) {
      this.height = this.left.height + 1;
    } else {
      this.height = 0;
    }
  }
  updateMax() {
    this.max = this.high;
    if (this.left !== null) {
      this.max = Math.max(this.max, this.left.max);
    }
    if (this.right !== null) {
      this.max = Math.max(this.max, this.right.max);
    }
  }
  getBalance() {
    let balance = 0;
    if (this.left !== null && this.right !== null) {
      balance = this.left.height - this.right.height;
    } else if (this.left !== null) {
      balance = this.left.height + 1;
    } else if (this.right !== null) {
      balance = -(this.right.height + 1);
    }
    return balance;
  }
  isLeftChild() {
    return this.parent !== null && this.parent.left === this;
  }
  get left() {
    return this._left;
  }
  set left(node) {
    this._left = node;
    if (node !== null) {
      node.parent = this;
    }
    this.updateHeight();
    this.updateMax();
  }
  get right() {
    return this._right;
  }
  set right(node) {
    this._right = node;
    if (node !== null) {
      node.parent = this;
    }
    this.updateHeight();
    this.updateMax();
  }
  dispose() {
    this.parent = null;
    this._left = null;
    this._right = null;
    this.event = null;
  }
}
class TransportEvent {
  constructor(transport, opts) {
    this.id = TransportEvent._eventId++;
    const options = Object.assign(TransportEvent.getDefaults(), opts);
    this.transport = transport;
    this.callback = options.callback;
    this._once = options.once;
    this.time = options.time;
  }
  static getDefaults() {
    return {
      callback: noOp,
      once: false,
      time: 0
    };
  }
  invoke(time) {
    if (this.callback) {
      this.callback(time);
      if (this._once) {
        this.transport.clear(this.id);
      }
    }
  }
  dispose() {
    this.callback = void 0;
    return this;
  }
}
TransportEvent._eventId = 0;
class TransportRepeatEvent extends TransportEvent {
  constructor(transport, opts) {
    super(transport, opts);
    this._currentId = -1;
    this._nextId = -1;
    this._nextTick = this.time;
    this._boundRestart = this._restart.bind(this);
    const options = Object.assign(TransportRepeatEvent.getDefaults(), opts);
    this.duration = new TicksClass(transport.context, options.duration).valueOf();
    this._interval = new TicksClass(transport.context, options.interval).valueOf();
    this._nextTick = options.time;
    this.transport.on("start", this._boundRestart);
    this.transport.on("loopStart", this._boundRestart);
    this.context = this.transport.context;
    this._restart();
  }
  static getDefaults() {
    return Object.assign({}, TransportEvent.getDefaults(), {
      duration: Infinity,
      interval: 1,
      once: false
    });
  }
  invoke(time) {
    this._createEvents(time);
    super.invoke(time);
  }
  _createEvents(time) {
    const ticks = this.transport.getTicksAtTime(time);
    if (ticks >= this.time && ticks >= this._nextTick && this._nextTick + this._interval < this.time + this.duration) {
      this._nextTick += this._interval;
      this._currentId = this._nextId;
      this._nextId = this.transport.scheduleOnce(this.invoke.bind(this), new TicksClass(this.context, this._nextTick).toSeconds());
    }
  }
  _restart(time) {
    this.transport.clear(this._currentId);
    this.transport.clear(this._nextId);
    this._nextTick = this.time;
    const ticks = this.transport.getTicksAtTime(time);
    if (ticks > this.time) {
      this._nextTick = this.time + Math.ceil((ticks - this.time) / this._interval) * this._interval;
    }
    this._currentId = this.transport.scheduleOnce(this.invoke.bind(this), new TicksClass(this.context, this._nextTick).toSeconds());
    this._nextTick += this._interval;
    this._nextId = this.transport.scheduleOnce(this.invoke.bind(this), new TicksClass(this.context, this._nextTick).toSeconds());
  }
  dispose() {
    super.dispose();
    this.transport.clear(this._currentId);
    this.transport.clear(this._nextId);
    this.transport.off("start", this._boundRestart);
    this.transport.off("loopStart", this._boundRestart);
    return this;
  }
}
let Transport$1 = class Transport extends ToneWithContext {
  constructor() {
    super(optionsFromArguments(Transport.getDefaults(), arguments));
    this.name = "Transport";
    this._loop = new TimelineValue(false);
    this._loopStart = 0;
    this._loopEnd = 0;
    this._scheduledEvents = {};
    this._timeline = new Timeline();
    this._repeatedEvents = new IntervalTimeline();
    this._syncedSignals = [];
    this._swingAmount = 0;
    const options = optionsFromArguments(Transport.getDefaults(), arguments);
    this._ppq = options.ppq;
    this._clock = new Clock({
      callback: this._processTick.bind(this),
      context: this.context,
      frequency: 0,
      units: "bpm"
    });
    this._bindClockEvents();
    this.bpm = this._clock.frequency;
    this._clock.frequency.multiplier = options.ppq;
    this.bpm.setValueAtTime(options.bpm, 0);
    readOnly(this, "bpm");
    this._timeSignature = options.timeSignature;
    this._swingTicks = options.ppq / 2;
  }
  static getDefaults() {
    return Object.assign(ToneWithContext.getDefaults(), {
      bpm: 120,
      loopEnd: "4m",
      loopStart: 0,
      ppq: 192,
      swing: 0,
      swingSubdivision: "8n",
      timeSignature: 4
    });
  }
  _processTick(tickTime, ticks) {
    if (this._loop.get(tickTime)) {
      if (ticks >= this._loopEnd) {
        this.emit("loopEnd", tickTime);
        this._clock.setTicksAtTime(this._loopStart, tickTime);
        ticks = this._loopStart;
        this.emit("loopStart", tickTime, this._clock.getSecondsAtTime(tickTime));
        this.emit("loop", tickTime);
      }
    }
    if (this._swingAmount > 0 && ticks % this._ppq !== 0 && ticks % (this._swingTicks * 2) !== 0) {
      const progress = ticks % (this._swingTicks * 2) / (this._swingTicks * 2);
      const amount = Math.sin(progress * Math.PI) * this._swingAmount;
      tickTime += new TicksClass(this.context, this._swingTicks * 2 / 3).toSeconds() * amount;
    }
    this._timeline.forEachAtTime(ticks, (event) => event.invoke(tickTime));
  }
  schedule(callback, time) {
    const event = new TransportEvent(this, {
      callback,
      time: new TransportTimeClass(this.context, time).toTicks()
    });
    return this._addEvent(event, this._timeline);
  }
  scheduleRepeat(callback, interval, startTime, duration = Infinity) {
    const event = new TransportRepeatEvent(this, {
      callback,
      duration: new TimeClass(this.context, duration).toTicks(),
      interval: new TimeClass(this.context, interval).toTicks(),
      time: new TransportTimeClass(this.context, startTime).toTicks()
    });
    return this._addEvent(event, this._repeatedEvents);
  }
  scheduleOnce(callback, time) {
    const event = new TransportEvent(this, {
      callback,
      once: true,
      time: new TransportTimeClass(this.context, time).toTicks()
    });
    return this._addEvent(event, this._timeline);
  }
  clear(eventId) {
    if (this._scheduledEvents.hasOwnProperty(eventId)) {
      const item = this._scheduledEvents[eventId.toString()];
      item.timeline.remove(item.event);
      item.event.dispose();
      delete this._scheduledEvents[eventId.toString()];
    }
    return this;
  }
  _addEvent(event, timeline) {
    this._scheduledEvents[event.id.toString()] = {
      event,
      timeline
    };
    timeline.add(event);
    return event.id;
  }
  cancel(after = 0) {
    const computedAfter = this.toTicks(after);
    this._timeline.forEachFrom(computedAfter, (event) => this.clear(event.id));
    this._repeatedEvents.forEachFrom(computedAfter, (event) => this.clear(event.id));
    return this;
  }
  _bindClockEvents() {
    this._clock.on("start", (time, offset) => {
      offset = new TicksClass(this.context, offset).toSeconds();
      this.emit("start", time, offset);
    });
    this._clock.on("stop", (time) => {
      this.emit("stop", time);
    });
    this._clock.on("pause", (time) => {
      this.emit("pause", time);
    });
  }
  get state() {
    return this._clock.getStateAtTime(this.now());
  }
  start(time, offset) {
    let offsetTicks;
    if (isDefined(offset)) {
      offsetTicks = this.toTicks(offset);
    }
    this._clock.start(time, offsetTicks);
    return this;
  }
  stop(time) {
    this._clock.stop(time);
    return this;
  }
  pause(time) {
    this._clock.pause(time);
    return this;
  }
  toggle(time) {
    time = this.toSeconds(time);
    if (this._clock.getStateAtTime(time) !== "started") {
      this.start(time);
    } else {
      this.stop(time);
    }
    return this;
  }
  get timeSignature() {
    return this._timeSignature;
  }
  set timeSignature(timeSig) {
    if (isArray(timeSig)) {
      timeSig = timeSig[0] / timeSig[1] * 4;
    }
    this._timeSignature = timeSig;
  }
  get loopStart() {
    return new TimeClass(this.context, this._loopStart, "i").toSeconds();
  }
  set loopStart(startPosition) {
    this._loopStart = this.toTicks(startPosition);
  }
  get loopEnd() {
    return new TimeClass(this.context, this._loopEnd, "i").toSeconds();
  }
  set loopEnd(endPosition) {
    this._loopEnd = this.toTicks(endPosition);
  }
  get loop() {
    return this._loop.get(this.now());
  }
  set loop(loop) {
    this._loop.set(loop, this.now());
  }
  setLoopPoints(startPosition, endPosition) {
    this.loopStart = startPosition;
    this.loopEnd = endPosition;
    return this;
  }
  get swing() {
    return this._swingAmount;
  }
  set swing(amount) {
    this._swingAmount = amount;
  }
  get swingSubdivision() {
    return new TicksClass(this.context, this._swingTicks).toNotation();
  }
  set swingSubdivision(subdivision) {
    this._swingTicks = this.toTicks(subdivision);
  }
  get position() {
    const now2 = this.now();
    const ticks = this._clock.getTicksAtTime(now2);
    return new TicksClass(this.context, ticks).toBarsBeatsSixteenths();
  }
  set position(progress) {
    const ticks = this.toTicks(progress);
    this.ticks = ticks;
  }
  get seconds() {
    return this._clock.seconds;
  }
  set seconds(s) {
    const now2 = this.now();
    const ticks = this._clock.frequency.timeToTicks(s, now2);
    this.ticks = ticks;
  }
  get progress() {
    if (this.loop) {
      const now2 = this.now();
      const ticks = this._clock.getTicksAtTime(now2);
      return (ticks - this._loopStart) / (this._loopEnd - this._loopStart);
    } else {
      return 0;
    }
  }
  get ticks() {
    return this._clock.ticks;
  }
  set ticks(t) {
    if (this._clock.ticks !== t) {
      const now2 = this.now();
      if (this.state === "started") {
        const ticks = this._clock.getTicksAtTime(now2);
        const remainingTick = this._clock.frequency.getDurationOfTicks(Math.ceil(ticks) - ticks, now2);
        const time = now2 + remainingTick;
        this.emit("stop", time);
        this._clock.setTicksAtTime(t, time);
        this.emit("start", time, this._clock.getSecondsAtTime(time));
      } else {
        this._clock.setTicksAtTime(t, now2);
      }
    }
  }
  getTicksAtTime(time) {
    return Math.round(this._clock.getTicksAtTime(time));
  }
  getSecondsAtTime(time) {
    return this._clock.getSecondsAtTime(time);
  }
  get PPQ() {
    return this._clock.frequency.multiplier;
  }
  set PPQ(ppq) {
    this._clock.frequency.multiplier = ppq;
  }
  nextSubdivision(subdivision) {
    subdivision = this.toTicks(subdivision);
    if (this.state !== "started") {
      return 0;
    } else {
      const now2 = this.now();
      const transportPos = this.getTicksAtTime(now2);
      const remainingTicks = subdivision - transportPos % subdivision;
      return this._clock.nextTickTime(remainingTicks, now2);
    }
  }
  syncSignal(signal, ratio) {
    if (!ratio) {
      const now2 = this.now();
      if (signal.getValueAtTime(now2) !== 0) {
        const bpm = this.bpm.getValueAtTime(now2);
        const computedFreq = 1 / (60 / bpm / this.PPQ);
        ratio = signal.getValueAtTime(now2) / computedFreq;
      } else {
        ratio = 0;
      }
    }
    const ratioSignal = new Gain(ratio);
    this.bpm.connect(ratioSignal);
    ratioSignal.connect(signal._param);
    this._syncedSignals.push({
      initial: signal.value,
      ratio: ratioSignal,
      signal
    });
    signal.value = 0;
    return this;
  }
  unsyncSignal(signal) {
    for (let i = this._syncedSignals.length - 1; i >= 0; i--) {
      const syncedSignal = this._syncedSignals[i];
      if (syncedSignal.signal === signal) {
        syncedSignal.ratio.dispose();
        syncedSignal.signal.value = syncedSignal.initial;
        this._syncedSignals.splice(i, 1);
      }
    }
    return this;
  }
  dispose() {
    super.dispose();
    this._clock.dispose();
    writable(this, "bpm");
    this._timeline.dispose();
    this._repeatedEvents.dispose();
    return this;
  }
};
Emitter.mixin(Transport$1);
onContextInit((context2) => {
  context2.transport = new Transport$1({ context: context2 });
});
onContextClose((context2) => {
  context2.transport.dispose();
});
class Source extends ToneAudioNode {
  constructor(options) {
    super(options);
    this.input = void 0;
    this._state = new StateTimeline("stopped");
    this._synced = false;
    this._scheduled = [];
    this._syncedStart = noOp;
    this._syncedStop = noOp;
    this._state.memory = 100;
    this._state.increasing = true;
    this._volume = this.output = new Volume({
      context: this.context,
      mute: options.mute,
      volume: options.volume
    });
    this.volume = this._volume.volume;
    readOnly(this, "volume");
    this.onstop = options.onstop;
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      mute: false,
      onstop: noOp,
      volume: 0
    });
  }
  get state() {
    if (this._synced) {
      if (this.context.transport.state === "started") {
        return this._state.getValueAtTime(this.context.transport.seconds);
      } else {
        return "stopped";
      }
    } else {
      return this._state.getValueAtTime(this.now());
    }
  }
  get mute() {
    return this._volume.mute;
  }
  set mute(mute) {
    this._volume.mute = mute;
  }
  _clampToCurrentTime(time) {
    if (this._synced) {
      return time;
    } else {
      return Math.max(time, this.context.currentTime);
    }
  }
  start(time, offset, duration) {
    let computedTime = isUndef(time) && this._synced ? this.context.transport.seconds : this.toSeconds(time);
    computedTime = this._clampToCurrentTime(computedTime);
    if (!this._synced && this._state.getValueAtTime(computedTime) === "started") {
      assert(GT(computedTime, this._state.get(computedTime).time), "Start time must be strictly greater than previous start time");
      this._state.cancel(computedTime);
      this._state.setStateAtTime("started", computedTime);
      this.log("restart", computedTime);
      this.restart(computedTime, offset, duration);
    } else {
      this.log("start", computedTime);
      this._state.setStateAtTime("started", computedTime);
      if (this._synced) {
        const event = this._state.get(computedTime);
        if (event) {
          event.offset = this.toSeconds(defaultArg(offset, 0));
          event.duration = duration ? this.toSeconds(duration) : void 0;
        }
        const sched = this.context.transport.schedule((t) => {
          this._start(t, offset, duration);
        }, computedTime);
        this._scheduled.push(sched);
        if (this.context.transport.state === "started" && this.context.transport.getSecondsAtTime(this.immediate()) > computedTime) {
          this._syncedStart(this.now(), this.context.transport.seconds);
        }
      } else {
        assertContextRunning(this.context);
        this._start(computedTime, offset, duration);
      }
    }
    return this;
  }
  stop(time) {
    let computedTime = isUndef(time) && this._synced ? this.context.transport.seconds : this.toSeconds(time);
    computedTime = this._clampToCurrentTime(computedTime);
    if (this._state.getValueAtTime(computedTime) === "started" || isDefined(this._state.getNextState("started", computedTime))) {
      this.log("stop", computedTime);
      if (!this._synced) {
        this._stop(computedTime);
      } else {
        const sched = this.context.transport.schedule(this._stop.bind(this), computedTime);
        this._scheduled.push(sched);
      }
      this._state.cancel(computedTime);
      this._state.setStateAtTime("stopped", computedTime);
    }
    return this;
  }
  restart(time, offset, duration) {
    time = this.toSeconds(time);
    if (this._state.getValueAtTime(time) === "started") {
      this._state.cancel(time);
      this._restart(time, offset, duration);
    }
    return this;
  }
  sync() {
    if (!this._synced) {
      this._synced = true;
      this._syncedStart = (time, offset) => {
        if (offset > 0) {
          const stateEvent = this._state.get(offset);
          if (stateEvent && stateEvent.state === "started" && stateEvent.time !== offset) {
            const startOffset = offset - this.toSeconds(stateEvent.time);
            let duration;
            if (stateEvent.duration) {
              duration = this.toSeconds(stateEvent.duration) - startOffset;
            }
            this._start(time, this.toSeconds(stateEvent.offset) + startOffset, duration);
          }
        }
      };
      this._syncedStop = (time) => {
        const seconds = this.context.transport.getSecondsAtTime(Math.max(time - this.sampleTime, 0));
        if (this._state.getValueAtTime(seconds) === "started") {
          this._stop(time);
        }
      };
      this.context.transport.on("start", this._syncedStart);
      this.context.transport.on("loopStart", this._syncedStart);
      this.context.transport.on("stop", this._syncedStop);
      this.context.transport.on("pause", this._syncedStop);
      this.context.transport.on("loopEnd", this._syncedStop);
    }
    return this;
  }
  unsync() {
    if (this._synced) {
      this.context.transport.off("stop", this._syncedStop);
      this.context.transport.off("pause", this._syncedStop);
      this.context.transport.off("loopEnd", this._syncedStop);
      this.context.transport.off("start", this._syncedStart);
      this.context.transport.off("loopStart", this._syncedStart);
    }
    this._synced = false;
    this._scheduled.forEach((id) => this.context.transport.clear(id));
    this._scheduled = [];
    this._state.cancel(0);
    this._stop(0);
    return this;
  }
  dispose() {
    super.dispose();
    this.onstop = noOp;
    this.unsync();
    this._volume.dispose();
    this._state.dispose();
    return this;
  }
}
function generateWaveform(instance, length) {
  return __awaiter(this, void 0, void 0, function* () {
    const duration = length / instance.context.sampleRate;
    const context2 = new OfflineContext(1, duration, instance.context.sampleRate);
    const clone = new instance.constructor(Object.assign(instance.get(), {
      frequency: 2 / duration,
      detune: 0,
      context: context2
    })).toDestination();
    clone.start(0);
    const buffer = yield context2.render();
    return buffer.getChannelData(0);
  });
}
class ToneOscillatorNode extends OneShotSource {
  constructor() {
    super(optionsFromArguments(ToneOscillatorNode.getDefaults(), arguments, ["frequency", "type"]));
    this.name = "ToneOscillatorNode";
    this._oscillator = this.context.createOscillator();
    this._internalChannels = [this._oscillator];
    const options = optionsFromArguments(ToneOscillatorNode.getDefaults(), arguments, ["frequency", "type"]);
    connect(this._oscillator, this._gainNode);
    this.type = options.type;
    this.frequency = new Param$1({
      context: this.context,
      param: this._oscillator.frequency,
      units: "frequency",
      value: options.frequency
    });
    this.detune = new Param$1({
      context: this.context,
      param: this._oscillator.detune,
      units: "cents",
      value: options.detune
    });
    readOnly(this, ["frequency", "detune"]);
  }
  static getDefaults() {
    return Object.assign(OneShotSource.getDefaults(), {
      detune: 0,
      frequency: 440,
      type: "sine"
    });
  }
  start(time) {
    const computedTime = this.toSeconds(time);
    this.log("start", computedTime);
    this._startGain(computedTime);
    this._oscillator.start(computedTime);
    return this;
  }
  _stopSource(time) {
    this._oscillator.stop(time);
  }
  setPeriodicWave(periodicWave) {
    this._oscillator.setPeriodicWave(periodicWave);
    return this;
  }
  get type() {
    return this._oscillator.type;
  }
  set type(type) {
    this._oscillator.type = type;
  }
  dispose() {
    super.dispose();
    if (this.state === "started") {
      this.stop();
    }
    this._oscillator.disconnect();
    this.frequency.dispose();
    this.detune.dispose();
    return this;
  }
}
class Oscillator extends Source {
  constructor() {
    super(optionsFromArguments(Oscillator.getDefaults(), arguments, ["frequency", "type"]));
    this.name = "Oscillator";
    this._oscillator = null;
    const options = optionsFromArguments(Oscillator.getDefaults(), arguments, ["frequency", "type"]);
    this.frequency = new Signal({
      context: this.context,
      units: "frequency",
      value: options.frequency
    });
    readOnly(this, "frequency");
    this.detune = new Signal({
      context: this.context,
      units: "cents",
      value: options.detune
    });
    readOnly(this, "detune");
    this._partials = options.partials;
    this._partialCount = options.partialCount;
    this._type = options.type;
    if (options.partialCount && options.type !== "custom") {
      this._type = this.baseType + options.partialCount.toString();
    }
    this.phase = options.phase;
  }
  static getDefaults() {
    return Object.assign(Source.getDefaults(), {
      detune: 0,
      frequency: 440,
      partialCount: 0,
      partials: [],
      phase: 0,
      type: "sine"
    });
  }
  _start(time) {
    const computedTime = this.toSeconds(time);
    const oscillator = new ToneOscillatorNode({
      context: this.context,
      onended: () => this.onstop(this)
    });
    this._oscillator = oscillator;
    if (this._wave) {
      this._oscillator.setPeriodicWave(this._wave);
    } else {
      this._oscillator.type = this._type;
    }
    this._oscillator.connect(this.output);
    this.frequency.connect(this._oscillator.frequency);
    this.detune.connect(this._oscillator.detune);
    this._oscillator.start(computedTime);
  }
  _stop(time) {
    const computedTime = this.toSeconds(time);
    if (this._oscillator) {
      this._oscillator.stop(computedTime);
    }
  }
  _restart(time) {
    const computedTime = this.toSeconds(time);
    this.log("restart", computedTime);
    if (this._oscillator) {
      this._oscillator.cancelStop();
    }
    this._state.cancel(computedTime);
    return this;
  }
  syncFrequency() {
    this.context.transport.syncSignal(this.frequency);
    return this;
  }
  unsyncFrequency() {
    this.context.transport.unsyncSignal(this.frequency);
    return this;
  }
  _getCachedPeriodicWave() {
    if (this._type === "custom") {
      const oscProps = Oscillator._periodicWaveCache.find((description) => {
        return description.phase === this._phase && deepEquals(description.partials, this._partials);
      });
      return oscProps;
    } else {
      const oscProps = Oscillator._periodicWaveCache.find((description) => {
        return description.type === this._type && description.phase === this._phase;
      });
      this._partialCount = oscProps ? oscProps.partialCount : this._partialCount;
      return oscProps;
    }
  }
  get type() {
    return this._type;
  }
  set type(type) {
    this._type = type;
    const isBasicType = ["sine", "square", "sawtooth", "triangle"].indexOf(type) !== -1;
    if (this._phase === 0 && isBasicType) {
      this._wave = void 0;
      this._partialCount = 0;
      if (this._oscillator !== null) {
        this._oscillator.type = type;
      }
    } else {
      const cache = this._getCachedPeriodicWave();
      if (isDefined(cache)) {
        const { partials, wave } = cache;
        this._wave = wave;
        this._partials = partials;
        if (this._oscillator !== null) {
          this._oscillator.setPeriodicWave(this._wave);
        }
      } else {
        const [real, imag] = this._getRealImaginary(type, this._phase);
        const periodicWave = this.context.createPeriodicWave(real, imag);
        this._wave = periodicWave;
        if (this._oscillator !== null) {
          this._oscillator.setPeriodicWave(this._wave);
        }
        Oscillator._periodicWaveCache.push({
          imag,
          partialCount: this._partialCount,
          partials: this._partials,
          phase: this._phase,
          real,
          type: this._type,
          wave: this._wave
        });
        if (Oscillator._periodicWaveCache.length > 100) {
          Oscillator._periodicWaveCache.shift();
        }
      }
    }
  }
  get baseType() {
    return this._type.replace(this.partialCount.toString(), "");
  }
  set baseType(baseType) {
    if (this.partialCount && this._type !== "custom" && baseType !== "custom") {
      this.type = baseType + this.partialCount;
    } else {
      this.type = baseType;
    }
  }
  get partialCount() {
    return this._partialCount;
  }
  set partialCount(p) {
    assertRange(p, 0);
    let type = this._type;
    const partial = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(this._type);
    if (partial) {
      type = partial[1];
    }
    if (this._type !== "custom") {
      if (p === 0) {
        this.type = type;
      } else {
        this.type = type + p.toString();
      }
    } else {
      const fullPartials = new Float32Array(p);
      this._partials.forEach((v, i) => fullPartials[i] = v);
      this._partials = Array.from(fullPartials);
      this.type = this._type;
    }
  }
  _getRealImaginary(type, phase) {
    const fftSize = 4096;
    let periodicWaveSize = fftSize / 2;
    const real = new Float32Array(periodicWaveSize);
    const imag = new Float32Array(periodicWaveSize);
    let partialCount = 1;
    if (type === "custom") {
      partialCount = this._partials.length + 1;
      this._partialCount = this._partials.length;
      periodicWaveSize = partialCount;
      if (this._partials.length === 0) {
        return [real, imag];
      }
    } else {
      const partial = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(type);
      if (partial) {
        partialCount = parseInt(partial[2], 10) + 1;
        this._partialCount = parseInt(partial[2], 10);
        type = partial[1];
        partialCount = Math.max(partialCount, 2);
        periodicWaveSize = partialCount;
      } else {
        this._partialCount = 0;
      }
      this._partials = [];
    }
    for (let n = 1; n < periodicWaveSize; ++n) {
      const piFactor = 2 / (n * Math.PI);
      let b;
      switch (type) {
        case "sine":
          b = n <= partialCount ? 1 : 0;
          this._partials[n - 1] = b;
          break;
        case "square":
          b = n & 1 ? 2 * piFactor : 0;
          this._partials[n - 1] = b;
          break;
        case "sawtooth":
          b = piFactor * (n & 1 ? 1 : -1);
          this._partials[n - 1] = b;
          break;
        case "triangle":
          if (n & 1) {
            b = 2 * (piFactor * piFactor) * (n - 1 >> 1 & 1 ? -1 : 1);
          } else {
            b = 0;
          }
          this._partials[n - 1] = b;
          break;
        case "custom":
          b = this._partials[n - 1];
          break;
        default:
          throw new TypeError("Oscillator: invalid type: " + type);
      }
      if (b !== 0) {
        real[n] = -b * Math.sin(phase * n);
        imag[n] = b * Math.cos(phase * n);
      } else {
        real[n] = 0;
        imag[n] = 0;
      }
    }
    return [real, imag];
  }
  _inverseFFT(real, imag, phase) {
    let sum = 0;
    const len = real.length;
    for (let i = 0; i < len; i++) {
      sum += real[i] * Math.cos(i * phase) + imag[i] * Math.sin(i * phase);
    }
    return sum;
  }
  getInitialValue() {
    const [real, imag] = this._getRealImaginary(this._type, 0);
    let maxValue = 0;
    const twoPi = Math.PI * 2;
    const testPositions = 32;
    for (let i = 0; i < testPositions; i++) {
      maxValue = Math.max(this._inverseFFT(real, imag, i / testPositions * twoPi), maxValue);
    }
    return clamp(-this._inverseFFT(real, imag, this._phase) / maxValue, -1, 1);
  }
  get partials() {
    return this._partials.slice(0, this.partialCount);
  }
  set partials(partials) {
    this._partials = partials;
    this._partialCount = this._partials.length;
    if (partials.length) {
      this.type = "custom";
    }
  }
  get phase() {
    return this._phase * (180 / Math.PI);
  }
  set phase(phase) {
    this._phase = phase * Math.PI / 180;
    this.type = this._type;
  }
  asArray(length = 1024) {
    return __awaiter(this, void 0, void 0, function* () {
      return generateWaveform(this, length);
    });
  }
  dispose() {
    super.dispose();
    if (this._oscillator !== null) {
      this._oscillator.dispose();
    }
    this._wave = void 0;
    this.frequency.dispose();
    this.detune.dispose();
    return this;
  }
}
Oscillator._periodicWaveCache = [];
class SignalOperator extends ToneAudioNode {
  constructor() {
    super(Object.assign(optionsFromArguments(SignalOperator.getDefaults(), arguments, ["context"])));
  }
  connect(destination, outputNum = 0, inputNum = 0) {
    connectSignal(this, destination, outputNum, inputNum);
    return this;
  }
}
class WaveShaper extends SignalOperator {
  constructor() {
    super(Object.assign(optionsFromArguments(WaveShaper.getDefaults(), arguments, ["mapping", "length"])));
    this.name = "WaveShaper";
    this._shaper = this.context.createWaveShaper();
    this.input = this._shaper;
    this.output = this._shaper;
    const options = optionsFromArguments(WaveShaper.getDefaults(), arguments, ["mapping", "length"]);
    if (isArray(options.mapping) || options.mapping instanceof Float32Array) {
      this.curve = Float32Array.from(options.mapping);
    } else if (isFunction(options.mapping)) {
      this.setMap(options.mapping, options.length);
    }
  }
  static getDefaults() {
    return Object.assign(Signal.getDefaults(), {
      length: 1024
    });
  }
  setMap(mapping, length = 1024) {
    const array = new Float32Array(length);
    for (let i = 0, len = length; i < len; i++) {
      const normalized = i / (len - 1) * 2 - 1;
      array[i] = mapping(normalized, i);
    }
    this.curve = array;
    return this;
  }
  get curve() {
    return this._shaper.curve;
  }
  set curve(mapping) {
    this._shaper.curve = mapping;
  }
  get oversample() {
    return this._shaper.oversample;
  }
  set oversample(oversampling) {
    const isOverSampleType = ["none", "2x", "4x"].some((str) => str.includes(oversampling));
    assert(isOverSampleType, "oversampling must be either 'none', '2x', or '4x'");
    this._shaper.oversample = oversampling;
  }
  dispose() {
    super.dispose();
    this._shaper.disconnect();
    return this;
  }
}
class AudioToGain extends SignalOperator {
  constructor() {
    super(...arguments);
    this.name = "AudioToGain";
    this._norm = new WaveShaper({
      context: this.context,
      mapping: (x) => (x + 1) / 2
    });
    this.input = this._norm;
    this.output = this._norm;
  }
  dispose() {
    super.dispose();
    this._norm.dispose();
    return this;
  }
}
class Add extends Signal {
  constructor() {
    super(Object.assign(optionsFromArguments(Add.getDefaults(), arguments, ["value"])));
    this.override = false;
    this.name = "Add";
    this._sum = new Gain({ context: this.context });
    this.input = this._sum;
    this.output = this._sum;
    this.addend = this._param;
    connectSeries(this._constantSource, this._sum);
  }
  static getDefaults() {
    return Object.assign(Signal.getDefaults(), {
      value: 0
    });
  }
  dispose() {
    super.dispose();
    this._sum.dispose();
    return this;
  }
}
class Multiply extends Signal {
  constructor() {
    super(Object.assign(optionsFromArguments(Multiply.getDefaults(), arguments, ["value"])));
    this.name = "Multiply";
    this.override = false;
    const options = optionsFromArguments(Multiply.getDefaults(), arguments, ["value"]);
    this._mult = this.input = this.output = new Gain({
      context: this.context,
      minValue: options.minValue,
      maxValue: options.maxValue
    });
    this.factor = this._param = this._mult.gain;
    this.factor.setValueAtTime(options.value, 0);
  }
  static getDefaults() {
    return Object.assign(Signal.getDefaults(), {
      value: 0
    });
  }
  dispose() {
    super.dispose();
    this._mult.dispose();
    return this;
  }
}
class Scale extends SignalOperator {
  constructor() {
    super(Object.assign(optionsFromArguments(Scale.getDefaults(), arguments, ["min", "max"])));
    this.name = "Scale";
    const options = optionsFromArguments(Scale.getDefaults(), arguments, ["min", "max"]);
    this._mult = this.input = new Multiply({
      context: this.context,
      value: options.max - options.min
    });
    this._add = this.output = new Add({
      context: this.context,
      value: options.min
    });
    this._min = options.min;
    this._max = options.max;
    this.input.connect(this.output);
  }
  static getDefaults() {
    return Object.assign(SignalOperator.getDefaults(), {
      max: 1,
      min: 0
    });
  }
  get min() {
    return this._min;
  }
  set min(min) {
    this._min = min;
    this._setRange();
  }
  get max() {
    return this._max;
  }
  set max(max) {
    this._max = max;
    this._setRange();
  }
  _setRange() {
    this._add.value = this._min;
    this._mult.value = this._max - this._min;
  }
  dispose() {
    super.dispose();
    this._add.dispose();
    this._mult.dispose();
    return this;
  }
}
class Zero extends SignalOperator {
  constructor() {
    super(Object.assign(optionsFromArguments(Zero.getDefaults(), arguments)));
    this.name = "Zero";
    this._gain = new Gain({ context: this.context });
    this.output = this._gain;
    this.input = void 0;
    connect(this.context.getConstant(0), this._gain);
  }
  dispose() {
    super.dispose();
    disconnect(this.context.getConstant(0), this._gain);
    return this;
  }
}
let LFO$1 = class LFO extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(LFO.getDefaults(), arguments, ["frequency", "min", "max"]));
    this.name = "LFO";
    this._stoppedValue = 0;
    this._units = "number";
    this.convert = true;
    this._fromType = Param$1.prototype._fromType;
    this._toType = Param$1.prototype._toType;
    this._is = Param$1.prototype._is;
    this._clampValue = Param$1.prototype._clampValue;
    const options = optionsFromArguments(LFO.getDefaults(), arguments, ["frequency", "min", "max"]);
    this._oscillator = new Oscillator(options);
    this.frequency = this._oscillator.frequency;
    this._amplitudeGain = new Gain({
      context: this.context,
      gain: options.amplitude,
      units: "normalRange"
    });
    this.amplitude = this._amplitudeGain.gain;
    this._stoppedSignal = new Signal({
      context: this.context,
      units: "audioRange",
      value: 0
    });
    this._zeros = new Zero({ context: this.context });
    this._a2g = new AudioToGain({ context: this.context });
    this._scaler = this.output = new Scale({
      context: this.context,
      max: options.max,
      min: options.min
    });
    this.units = options.units;
    this.min = options.min;
    this.max = options.max;
    this._oscillator.chain(this._amplitudeGain, this._a2g, this._scaler);
    this._zeros.connect(this._a2g);
    this._stoppedSignal.connect(this._a2g);
    readOnly(this, ["amplitude", "frequency"]);
    this.phase = options.phase;
  }
  static getDefaults() {
    return Object.assign(Oscillator.getDefaults(), {
      amplitude: 1,
      frequency: "4n",
      max: 1,
      min: 0,
      type: "sine",
      units: "number"
    });
  }
  start(time) {
    time = this.toSeconds(time);
    this._stoppedSignal.setValueAtTime(0, time);
    this._oscillator.start(time);
    return this;
  }
  stop(time) {
    time = this.toSeconds(time);
    this._stoppedSignal.setValueAtTime(this._stoppedValue, time);
    this._oscillator.stop(time);
    return this;
  }
  sync() {
    this._oscillator.sync();
    this._oscillator.syncFrequency();
    return this;
  }
  unsync() {
    this._oscillator.unsync();
    this._oscillator.unsyncFrequency();
    return this;
  }
  _setStoppedValue() {
    this._stoppedValue = this._oscillator.getInitialValue();
    this._stoppedSignal.value = this._stoppedValue;
  }
  get min() {
    return this._toType(this._scaler.min);
  }
  set min(min) {
    min = this._fromType(min);
    this._scaler.min = min;
  }
  get max() {
    return this._toType(this._scaler.max);
  }
  set max(max) {
    max = this._fromType(max);
    this._scaler.max = max;
  }
  get type() {
    return this._oscillator.type;
  }
  set type(type) {
    this._oscillator.type = type;
    this._setStoppedValue();
  }
  get partials() {
    return this._oscillator.partials;
  }
  set partials(partials) {
    this._oscillator.partials = partials;
    this._setStoppedValue();
  }
  get phase() {
    return this._oscillator.phase;
  }
  set phase(phase) {
    this._oscillator.phase = phase;
    this._setStoppedValue();
  }
  get units() {
    return this._units;
  }
  set units(val) {
    const currentMin = this.min;
    const currentMax = this.max;
    this._units = val;
    this.min = currentMin;
    this.max = currentMax;
  }
  get state() {
    return this._oscillator.state;
  }
  connect(node, outputNum, inputNum) {
    if (node instanceof Param$1 || node instanceof Signal) {
      this.convert = node.convert;
      this.units = node.units;
    }
    connectSignal(this, node, outputNum, inputNum);
    return this;
  }
  dispose() {
    super.dispose();
    this._oscillator.dispose();
    this._stoppedSignal.dispose();
    this._zeros.dispose();
    this._scaler.dispose();
    this._a2g.dispose();
    this._amplitudeGain.dispose();
    this.amplitude.dispose();
    return this;
  }
};
class ToneBufferSource extends OneShotSource {
  constructor() {
    super(optionsFromArguments(ToneBufferSource.getDefaults(), arguments, ["url", "onload"]));
    this.name = "ToneBufferSource";
    this._source = this.context.createBufferSource();
    this._internalChannels = [this._source];
    this._sourceStarted = false;
    this._sourceStopped = false;
    const options = optionsFromArguments(ToneBufferSource.getDefaults(), arguments, ["url", "onload"]);
    connect(this._source, this._gainNode);
    this._source.onended = () => this._stopSource();
    this.playbackRate = new Param$1({
      context: this.context,
      param: this._source.playbackRate,
      units: "positive",
      value: options.playbackRate
    });
    this.loop = options.loop;
    this.loopStart = options.loopStart;
    this.loopEnd = options.loopEnd;
    this._buffer = new ToneAudioBuffer(options.url, options.onload, options.onerror);
    this._internalChannels.push(this._source);
  }
  static getDefaults() {
    return Object.assign(OneShotSource.getDefaults(), {
      url: new ToneAudioBuffer(),
      loop: false,
      loopEnd: 0,
      loopStart: 0,
      onload: noOp,
      onerror: noOp,
      playbackRate: 1
    });
  }
  get fadeIn() {
    return this._fadeIn;
  }
  set fadeIn(t) {
    this._fadeIn = t;
  }
  get fadeOut() {
    return this._fadeOut;
  }
  set fadeOut(t) {
    this._fadeOut = t;
  }
  get curve() {
    return this._curve;
  }
  set curve(t) {
    this._curve = t;
  }
  start(time, offset, duration, gain = 1) {
    assert(this.buffer.loaded, "buffer is either not set or not loaded");
    const computedTime = this.toSeconds(time);
    this._startGain(computedTime, gain);
    if (this.loop) {
      offset = defaultArg(offset, this.loopStart);
    } else {
      offset = defaultArg(offset, 0);
    }
    let computedOffset = Math.max(this.toSeconds(offset), 0);
    if (this.loop) {
      const loopEnd = this.toSeconds(this.loopEnd) || this.buffer.duration;
      const loopStart = this.toSeconds(this.loopStart);
      const loopDuration = loopEnd - loopStart;
      if (GTE(computedOffset, loopEnd)) {
        computedOffset = (computedOffset - loopStart) % loopDuration + loopStart;
      }
      if (EQ(computedOffset, this.buffer.duration)) {
        computedOffset = 0;
      }
    }
    this._source.buffer = this.buffer.get();
    this._source.loopEnd = this.toSeconds(this.loopEnd) || this.buffer.duration;
    if (LT(computedOffset, this.buffer.duration)) {
      this._sourceStarted = true;
      this._source.start(computedTime, computedOffset);
    }
    if (isDefined(duration)) {
      let computedDur = this.toSeconds(duration);
      computedDur = Math.max(computedDur, 0);
      this.stop(computedTime + computedDur);
    }
    return this;
  }
  _stopSource(time) {
    if (!this._sourceStopped && this._sourceStarted) {
      this._sourceStopped = true;
      this._source.stop(this.toSeconds(time));
      this._onended();
    }
  }
  get loopStart() {
    return this._source.loopStart;
  }
  set loopStart(loopStart) {
    this._source.loopStart = this.toSeconds(loopStart);
  }
  get loopEnd() {
    return this._source.loopEnd;
  }
  set loopEnd(loopEnd) {
    this._source.loopEnd = this.toSeconds(loopEnd);
  }
  get buffer() {
    return this._buffer;
  }
  set buffer(buffer) {
    this._buffer.set(buffer);
  }
  get loop() {
    return this._source.loop;
  }
  set loop(loop) {
    this._source.loop = loop;
    if (this._sourceStarted) {
      this.cancelStop();
    }
  }
  dispose() {
    super.dispose();
    this._source.onended = null;
    this._source.disconnect();
    this._buffer.dispose();
    this.playbackRate.dispose();
    return this;
  }
}
function range(min, max = Infinity) {
  const valueMap = /* @__PURE__ */ new WeakMap();
  return function(target, propertyKey) {
    Reflect.defineProperty(target, propertyKey, {
      configurable: true,
      enumerable: true,
      get: function() {
        return valueMap.get(this);
      },
      set: function(newValue) {
        assertRange(newValue, min, max);
        valueMap.set(this, newValue);
      }
    });
  };
}
function timeRange(min, max = Infinity) {
  const valueMap = /* @__PURE__ */ new WeakMap();
  return function(target, propertyKey) {
    Reflect.defineProperty(target, propertyKey, {
      configurable: true,
      enumerable: true,
      get: function() {
        return valueMap.get(this);
      },
      set: function(newValue) {
        assertRange(this.toSeconds(newValue), min, max);
        valueMap.set(this, newValue);
      }
    });
  };
}
let Player$1 = class Player extends Source {
  constructor() {
    super(optionsFromArguments(Player.getDefaults(), arguments, ["url", "onload"]));
    this.name = "Player";
    this._activeSources = /* @__PURE__ */ new Set();
    const options = optionsFromArguments(Player.getDefaults(), arguments, ["url", "onload"]);
    this._buffer = new ToneAudioBuffer({
      onload: this._onload.bind(this, options.onload),
      onerror: options.onerror,
      reverse: options.reverse,
      url: options.url
    });
    this.autostart = options.autostart;
    this._loop = options.loop;
    this._loopStart = options.loopStart;
    this._loopEnd = options.loopEnd;
    this._playbackRate = options.playbackRate;
    this.fadeIn = options.fadeIn;
    this.fadeOut = options.fadeOut;
  }
  static getDefaults() {
    return Object.assign(Source.getDefaults(), {
      autostart: false,
      fadeIn: 0,
      fadeOut: 0,
      loop: false,
      loopEnd: 0,
      loopStart: 0,
      onload: noOp,
      onerror: noOp,
      playbackRate: 1,
      reverse: false
    });
  }
  load(url) {
    return __awaiter(this, void 0, void 0, function* () {
      yield this._buffer.load(url);
      this._onload();
      return this;
    });
  }
  _onload(callback = noOp) {
    callback();
    if (this.autostart) {
      this.start();
    }
  }
  _onSourceEnd(source) {
    this.onstop(this);
    this._activeSources.delete(source);
    if (this._activeSources.size === 0 && !this._synced && this._state.getValueAtTime(this.now()) === "started") {
      this._state.cancel(this.now());
      this._state.setStateAtTime("stopped", this.now());
    }
  }
  start(time, offset, duration) {
    super.start(time, offset, duration);
    return this;
  }
  _start(startTime, offset, duration) {
    if (this._loop) {
      offset = defaultArg(offset, this._loopStart);
    } else {
      offset = defaultArg(offset, 0);
    }
    const computedOffset = this.toSeconds(offset);
    const origDuration = duration;
    duration = defaultArg(duration, Math.max(this._buffer.duration - computedOffset, 0));
    let computedDuration = this.toSeconds(duration);
    computedDuration = computedDuration / this._playbackRate;
    startTime = this.toSeconds(startTime);
    const source = new ToneBufferSource({
      url: this._buffer,
      context: this.context,
      fadeIn: this.fadeIn,
      fadeOut: this.fadeOut,
      loop: this._loop,
      loopEnd: this._loopEnd,
      loopStart: this._loopStart,
      onended: this._onSourceEnd.bind(this),
      playbackRate: this._playbackRate
    }).connect(this.output);
    if (!this._loop && !this._synced) {
      this._state.cancel(startTime + computedDuration);
      this._state.setStateAtTime("stopped", startTime + computedDuration, {
        implicitEnd: true
      });
    }
    this._activeSources.add(source);
    if (this._loop && isUndef(origDuration)) {
      source.start(startTime, computedOffset);
    } else {
      source.start(startTime, computedOffset, computedDuration - this.toSeconds(this.fadeOut));
    }
  }
  _stop(time) {
    const computedTime = this.toSeconds(time);
    this._activeSources.forEach((source) => source.stop(computedTime));
  }
  restart(time, offset, duration) {
    super.restart(time, offset, duration);
    return this;
  }
  _restart(time, offset, duration) {
    this._stop(time);
    this._start(time, offset, duration);
  }
  seek(offset, when) {
    const computedTime = this.toSeconds(when);
    if (this._state.getValueAtTime(computedTime) === "started") {
      const computedOffset = this.toSeconds(offset);
      this._stop(computedTime);
      this._start(computedTime, computedOffset);
    }
    return this;
  }
  setLoopPoints(loopStart, loopEnd) {
    this.loopStart = loopStart;
    this.loopEnd = loopEnd;
    return this;
  }
  get loopStart() {
    return this._loopStart;
  }
  set loopStart(loopStart) {
    this._loopStart = loopStart;
    if (this.buffer.loaded) {
      assertRange(this.toSeconds(loopStart), 0, this.buffer.duration);
    }
    this._activeSources.forEach((source) => {
      source.loopStart = loopStart;
    });
  }
  get loopEnd() {
    return this._loopEnd;
  }
  set loopEnd(loopEnd) {
    this._loopEnd = loopEnd;
    if (this.buffer.loaded) {
      assertRange(this.toSeconds(loopEnd), 0, this.buffer.duration);
    }
    this._activeSources.forEach((source) => {
      source.loopEnd = loopEnd;
    });
  }
  get buffer() {
    return this._buffer;
  }
  set buffer(buffer) {
    this._buffer.set(buffer);
  }
  get loop() {
    return this._loop;
  }
  set loop(loop) {
    if (this._loop === loop) {
      return;
    }
    this._loop = loop;
    this._activeSources.forEach((source) => {
      source.loop = loop;
    });
    if (loop) {
      const stopEvent = this._state.getNextState("stopped", this.now());
      if (stopEvent) {
        this._state.cancel(stopEvent.time);
      }
    }
  }
  get playbackRate() {
    return this._playbackRate;
  }
  set playbackRate(rate) {
    this._playbackRate = rate;
    const now2 = this.now();
    const stopEvent = this._state.getNextState("stopped", now2);
    if (stopEvent && stopEvent.implicitEnd) {
      this._state.cancel(stopEvent.time);
      this._activeSources.forEach((source) => source.cancelStop());
    }
    this._activeSources.forEach((source) => {
      source.playbackRate.setValueAtTime(rate, now2);
    });
  }
  get reverse() {
    return this._buffer.reverse;
  }
  set reverse(rev) {
    this._buffer.reverse = rev;
  }
  get loaded() {
    return this._buffer.loaded;
  }
  dispose() {
    super.dispose();
    this._activeSources.forEach((source) => source.dispose());
    this._activeSources.clear();
    this._buffer.dispose();
    return this;
  }
};
__decorate([
  timeRange(0)
], Player$1.prototype, "fadeIn", void 0);
__decorate([
  timeRange(0)
], Player$1.prototype, "fadeOut", void 0);
let Instrument$1 = class Instrument extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Instrument.getDefaults(), arguments));
    this._scheduledEvents = [];
    this._synced = false;
    this._original_triggerAttack = this.triggerAttack;
    this._original_triggerRelease = this.triggerRelease;
    const options = optionsFromArguments(Instrument.getDefaults(), arguments);
    this._volume = this.output = new Volume({
      context: this.context,
      volume: options.volume
    });
    this.volume = this._volume.volume;
    readOnly(this, "volume");
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      volume: 0
    });
  }
  sync() {
    if (this._syncState()) {
      this._syncMethod("triggerAttack", 1);
      this._syncMethod("triggerRelease", 0);
    }
    return this;
  }
  _syncState() {
    let changed = false;
    if (!this._synced) {
      this._synced = true;
      changed = true;
    }
    return changed;
  }
  _syncMethod(method, timePosition) {
    const originalMethod = this["_original_" + method] = this[method];
    this[method] = (...args) => {
      const time = args[timePosition];
      const id = this.context.transport.schedule((t) => {
        args[timePosition] = t;
        originalMethod.apply(this, args);
      }, time);
      this._scheduledEvents.push(id);
    };
  }
  unsync() {
    this._scheduledEvents.forEach((id) => this.context.transport.clear(id));
    this._scheduledEvents = [];
    if (this._synced) {
      this._synced = false;
      this.triggerAttack = this._original_triggerAttack;
      this.triggerRelease = this._original_triggerRelease;
    }
    return this;
  }
  triggerAttackRelease(note, duration, time, velocity) {
    const computedTime = this.toSeconds(time);
    const computedDuration = this.toSeconds(duration);
    this.triggerAttack(note, computedTime, velocity);
    this.triggerRelease(computedTime + computedDuration);
    return this;
  }
  dispose() {
    super.dispose();
    this._volume.dispose();
    this.unsync();
    this._scheduledEvents = [];
    return this;
  }
};
let Sampler$1 = class Sampler extends Instrument$1 {
  constructor() {
    super(optionsFromArguments(Sampler.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls"));
    this.name = "Sampler";
    this._activeSources = /* @__PURE__ */ new Map();
    const options = optionsFromArguments(Sampler.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls");
    const urlMap = {};
    Object.keys(options.urls).forEach((note) => {
      const noteNumber = parseInt(note, 10);
      assert(isNote(note) || isNumber(noteNumber) && isFinite(noteNumber), `url key is neither a note or midi pitch: ${note}`);
      if (isNote(note)) {
        const mid = new FrequencyClass(this.context, note).toMidi();
        urlMap[mid] = options.urls[note];
      } else if (isNumber(noteNumber) && isFinite(noteNumber)) {
        urlMap[noteNumber] = options.urls[noteNumber];
      }
    });
    this._buffers = new ToneAudioBuffers({
      urls: urlMap,
      onload: options.onload,
      baseUrl: options.baseUrl,
      onerror: options.onerror
    });
    this.attack = options.attack;
    this.release = options.release;
    this.curve = options.curve;
    this.loop = options.loop || false;
    this.loopStart = options.loopStart || 0;
    this.loopEnd = options.loopEnd;
    if (this._buffers.loaded) {
      Promise.resolve().then(options.onload);
    }
  }
  static getDefaults() {
    return Object.assign(Instrument$1.getDefaults(), {
      attack: 0,
      baseUrl: "",
      curve: "exponential",
      onload: noOp,
      onerror: noOp,
      release: 0.1,
      urls: {},
      loop: false,
      loopStart: 0,
      loopEnd: void 0
    });
  }
  _findClosest(midi) {
    const MAX_INTERVAL = 96;
    let interval = 0;
    while (interval < MAX_INTERVAL) {
      if (this._buffers.has(midi + interval)) {
        return -interval;
      } else if (this._buffers.has(midi - interval)) {
        return interval;
      }
      interval++;
    }
    throw new Error(`No available buffers for note: ${midi}`);
  }
  triggerAttack(notes, time, velocity = 1) {
    this.log("triggerAttack", notes, time, velocity);
    if (!Array.isArray(notes)) {
      notes = [notes];
    }
    notes.forEach((note) => {
      const midiFloat = ftomf(new FrequencyClass(this.context, note).toFrequency());
      const midi = Math.round(midiFloat);
      const remainder = midiFloat - midi;
      const difference = this._findClosest(midi);
      const closestNote = midi - difference;
      const buffer = this._buffers.get(closestNote);
      const playbackRate = intervalToFrequencyRatio(difference + remainder);
      const source = new ToneBufferSource({
        url: buffer,
        context: this.context,
        curve: this.curve,
        fadeIn: this.attack,
        fadeOut: this.release,
        playbackRate
      }).connect(this.output);
      if (this.loop) {
        source.loop = true;
        source.loopStart = this.loopStart;
        if (this.loopEnd !== void 0) {
          source.loopEnd = this.loopEnd;
        }
      }
      source.start(time, 0, this.loop ? void 0 : buffer.duration / playbackRate, velocity);
      if (!isArray(this._activeSources.get(midi))) {
        this._activeSources.set(midi, []);
      }
      this._activeSources.get(midi).push(source);
      source.onended = () => {
        if (this._activeSources && this._activeSources.has(midi)) {
          const sources = this._activeSources.get(midi);
          const index2 = sources.indexOf(source);
          if (index2 !== -1) {
            sources.splice(index2, 1);
          }
        }
      };
    });
    return this;
  }
  triggerRelease(notes, time) {
    this.log("triggerRelease", notes, time);
    if (!Array.isArray(notes)) {
      notes = [notes];
    }
    notes.forEach((note) => {
      const midi = new FrequencyClass(this.context, note).toMidi();
      if (this._activeSources.has(midi) && this._activeSources.get(midi).length) {
        const sources = this._activeSources.get(midi);
        time = this.toSeconds(time);
        sources.forEach((source) => {
          source.stop(time);
        });
        this._activeSources.set(midi, []);
      }
    });
    return this;
  }
  releaseAll(time) {
    const computedTime = this.toSeconds(time);
    this._activeSources.forEach((sources) => {
      while (sources.length) {
        const source = sources.shift();
        source.stop(computedTime);
      }
    });
    return this;
  }
  sync() {
    if (this._syncState()) {
      this._syncMethod("triggerAttack", 1);
      this._syncMethod("triggerRelease", 1);
    }
    return this;
  }
  triggerAttackRelease(notes, duration, time, velocity = 1) {
    const computedTime = this.toSeconds(time);
    this.triggerAttack(notes, computedTime, velocity);
    if (isArray(duration)) {
      assert(isArray(notes), "notes must be an array when duration is array");
      notes.forEach((note, index2) => {
        const d = duration[Math.min(index2, duration.length - 1)];
        this.triggerRelease(note, computedTime + this.toSeconds(d));
      });
    } else {
      this.triggerRelease(notes, computedTime + this.toSeconds(duration));
    }
    return this;
  }
  add(note, url, callback) {
    assert(isNote(note) || isFinite(note), `note must be a pitch or midi: ${note}`);
    if (isNote(note)) {
      const mid = new FrequencyClass(this.context, note).toMidi();
      this._buffers.add(mid, url, callback);
    } else {
      this._buffers.add(note, url, callback);
    }
    return this;
  }
  get loaded() {
    return this._buffers.loaded;
  }
  dispose() {
    super.dispose();
    this._buffers.dispose();
    this._activeSources.forEach((sources) => {
      sources.forEach((source) => source.dispose());
    });
    this._activeSources.clear();
    return this;
  }
};
__decorate([
  timeRange(0)
], Sampler$1.prototype, "attack", void 0);
__decorate([
  timeRange(0)
], Sampler$1.prototype, "release", void 0);
class GainToAudio extends SignalOperator {
  constructor() {
    super(...arguments);
    this.name = "GainToAudio";
    this._norm = new WaveShaper({
      context: this.context,
      mapping: (x) => Math.abs(x) * 2 - 1
    });
    this.input = this._norm;
    this.output = this._norm;
  }
  dispose() {
    super.dispose();
    this._norm.dispose();
    return this;
  }
}
class CrossFade extends ToneAudioNode {
  constructor() {
    super(Object.assign(optionsFromArguments(CrossFade.getDefaults(), arguments, ["fade"])));
    this.name = "CrossFade";
    this._panner = this.context.createStereoPanner();
    this._split = this.context.createChannelSplitter(2);
    this._g2a = new GainToAudio({ context: this.context });
    this.a = new Gain({
      context: this.context,
      gain: 0
    });
    this.b = new Gain({
      context: this.context,
      gain: 0
    });
    this.output = new Gain({ context: this.context });
    this._internalChannels = [this.a, this.b];
    const options = optionsFromArguments(CrossFade.getDefaults(), arguments, ["fade"]);
    this.fade = new Signal({
      context: this.context,
      units: "normalRange",
      value: options.fade
    });
    readOnly(this, "fade");
    this.context.getConstant(1).connect(this._panner);
    this._panner.connect(this._split);
    this._panner.channelCount = 1;
    this._panner.channelCountMode = "explicit";
    connect(this._split, this.a.gain, 0);
    connect(this._split, this.b.gain, 1);
    this.fade.chain(this._g2a, this._panner.pan);
    this.a.connect(this.output);
    this.b.connect(this.output);
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      fade: 0.5
    });
  }
  dispose() {
    super.dispose();
    this.a.dispose();
    this.b.dispose();
    this.output.dispose();
    this.fade.dispose();
    this._g2a.dispose();
    this._panner.disconnect();
    this._split.disconnect();
    return this;
  }
}
class Split extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Split.getDefaults(), arguments, ["channels"]));
    this.name = "Split";
    const options = optionsFromArguments(Split.getDefaults(), arguments, ["channels"]);
    this._splitter = this.input = this.output = this.context.createChannelSplitter(options.channels);
    this._internalChannels = [this._splitter];
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      channels: 2
    });
  }
  dispose() {
    super.dispose();
    this._splitter.disconnect();
    return this;
  }
}
class Merge extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Merge.getDefaults(), arguments, ["channels"]));
    this.name = "Merge";
    const options = optionsFromArguments(Merge.getDefaults(), arguments, ["channels"]);
    this._merger = this.output = this.input = this.context.createChannelMerger(options.channels);
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      channels: 2
    });
  }
  dispose() {
    super.dispose();
    this._merger.disconnect();
    return this;
  }
}
class StereoEffect extends ToneAudioNode {
  constructor(options) {
    super(options);
    this.name = "StereoEffect";
    this.input = new Gain({ context: this.context });
    this.input.channelCount = 2;
    this.input.channelCountMode = "explicit";
    this._dryWet = this.output = new CrossFade({
      context: this.context,
      fade: options.wet
    });
    this.wet = this._dryWet.fade;
    this._split = new Split({ context: this.context, channels: 2 });
    this._merge = new Merge({ context: this.context, channels: 2 });
    this.input.connect(this._split);
    this.input.connect(this._dryWet.a);
    this._merge.connect(this._dryWet.b);
    readOnly(this, ["wet"]);
  }
  connectEffectLeft(...nodes) {
    this._split.connect(nodes[0], 0, 0);
    connectSeries(...nodes);
    connect(nodes[nodes.length - 1], this._merge, 0, 0);
  }
  connectEffectRight(...nodes) {
    this._split.connect(nodes[0], 1, 0);
    connectSeries(...nodes);
    connect(nodes[nodes.length - 1], this._merge, 0, 1);
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      wet: 1
    });
  }
  dispose() {
    super.dispose();
    this._dryWet.dispose();
    this._split.dispose();
    this._merge.dispose();
    return this;
  }
}
class StereoFeedbackEffect extends StereoEffect {
  constructor(options) {
    super(options);
    this.feedback = new Signal({
      context: this.context,
      value: options.feedback,
      units: "normalRange"
    });
    this._feedbackL = new Gain({ context: this.context });
    this._feedbackR = new Gain({ context: this.context });
    this._feedbackSplit = new Split({ context: this.context, channels: 2 });
    this._feedbackMerge = new Merge({ context: this.context, channels: 2 });
    this._merge.connect(this._feedbackSplit);
    this._feedbackMerge.connect(this._split);
    this._feedbackSplit.connect(this._feedbackL, 0, 0);
    this._feedbackL.connect(this._feedbackMerge, 0, 0);
    this._feedbackSplit.connect(this._feedbackR, 1, 0);
    this._feedbackR.connect(this._feedbackMerge, 0, 1);
    this.feedback.fan(this._feedbackL.gain, this._feedbackR.gain);
    readOnly(this, ["feedback"]);
  }
  static getDefaults() {
    return Object.assign(StereoEffect.getDefaults(), {
      feedback: 0.5
    });
  }
  dispose() {
    super.dispose();
    this.feedback.dispose();
    this._feedbackL.dispose();
    this._feedbackR.dispose();
    this._feedbackSplit.dispose();
    this._feedbackMerge.dispose();
    return this;
  }
}
class StereoXFeedbackEffect extends StereoFeedbackEffect {
  constructor(options) {
    super(options);
    this._feedbackL.disconnect();
    this._feedbackL.connect(this._feedbackMerge, 0, 1);
    this._feedbackR.disconnect();
    this._feedbackR.connect(this._feedbackMerge, 0, 0);
    readOnly(this, ["feedback"]);
  }
}
class Delay extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Delay.getDefaults(), arguments, ["delayTime", "maxDelay"]));
    this.name = "Delay";
    const options = optionsFromArguments(Delay.getDefaults(), arguments, ["delayTime", "maxDelay"]);
    const maxDelayInSeconds = this.toSeconds(options.maxDelay);
    this._maxDelay = Math.max(maxDelayInSeconds, this.toSeconds(options.delayTime));
    this._delayNode = this.input = this.output = this.context.createDelay(maxDelayInSeconds);
    this.delayTime = new Param$1({
      context: this.context,
      param: this._delayNode.delayTime,
      units: "time",
      value: options.delayTime,
      minValue: 0,
      maxValue: this.maxDelay
    });
    readOnly(this, "delayTime");
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      delayTime: 0,
      maxDelay: 1
    });
  }
  get maxDelay() {
    return this._maxDelay;
  }
  dispose() {
    super.dispose();
    this._delayNode.disconnect();
    this.delayTime.dispose();
    return this;
  }
}
class PingPongDelay extends StereoXFeedbackEffect {
  constructor() {
    super(optionsFromArguments(PingPongDelay.getDefaults(), arguments, ["delayTime", "feedback"]));
    this.name = "PingPongDelay";
    const options = optionsFromArguments(PingPongDelay.getDefaults(), arguments, ["delayTime", "feedback"]);
    this._leftDelay = new Delay({
      context: this.context,
      maxDelay: options.maxDelay
    });
    this._rightDelay = new Delay({
      context: this.context,
      maxDelay: options.maxDelay
    });
    this._rightPreDelay = new Delay({
      context: this.context,
      maxDelay: options.maxDelay
    });
    this.delayTime = new Signal({
      context: this.context,
      units: "time",
      value: options.delayTime
    });
    this.connectEffectLeft(this._leftDelay);
    this.connectEffectRight(this._rightPreDelay, this._rightDelay);
    this.delayTime.fan(this._leftDelay.delayTime, this._rightDelay.delayTime, this._rightPreDelay.delayTime);
    this._feedbackL.disconnect();
    this._feedbackL.connect(this._rightDelay);
    readOnly(this, ["delayTime"]);
  }
  static getDefaults() {
    return Object.assign(StereoXFeedbackEffect.getDefaults(), {
      delayTime: 0.25,
      maxDelay: 1
    });
  }
  dispose() {
    super.dispose();
    this._leftDelay.dispose();
    this._rightDelay.dispose();
    this._rightPreDelay.dispose();
    this.delayTime.dispose();
    return this;
  }
}
class Solo extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Solo.getDefaults(), arguments, ["solo"]));
    this.name = "Solo";
    const options = optionsFromArguments(Solo.getDefaults(), arguments, ["solo"]);
    this.input = this.output = new Gain({
      context: this.context
    });
    if (!Solo._allSolos.has(this.context)) {
      Solo._allSolos.set(this.context, /* @__PURE__ */ new Set());
    }
    Solo._allSolos.get(this.context).add(this);
    this.solo = options.solo;
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      solo: false
    });
  }
  get solo() {
    return this._isSoloed();
  }
  set solo(solo) {
    if (solo) {
      this._addSolo();
    } else {
      this._removeSolo();
    }
    Solo._allSolos.get(this.context).forEach((instance) => instance._updateSolo());
  }
  get muted() {
    return this.input.gain.value === 0;
  }
  _addSolo() {
    if (!Solo._soloed.has(this.context)) {
      Solo._soloed.set(this.context, /* @__PURE__ */ new Set());
    }
    Solo._soloed.get(this.context).add(this);
  }
  _removeSolo() {
    if (Solo._soloed.has(this.context)) {
      Solo._soloed.get(this.context).delete(this);
    }
  }
  _isSoloed() {
    return Solo._soloed.has(this.context) && Solo._soloed.get(this.context).has(this);
  }
  _noSolos() {
    return !Solo._soloed.has(this.context) || Solo._soloed.has(this.context) && Solo._soloed.get(this.context).size === 0;
  }
  _updateSolo() {
    if (this._isSoloed()) {
      this.input.gain.value = 1;
    } else if (this._noSolos()) {
      this.input.gain.value = 1;
    } else {
      this.input.gain.value = 0;
    }
  }
  dispose() {
    super.dispose();
    Solo._allSolos.get(this.context).delete(this);
    this._removeSolo();
    return this;
  }
}
Solo._allSolos = /* @__PURE__ */ new Map();
Solo._soloed = /* @__PURE__ */ new Map();
class Panner extends ToneAudioNode {
  constructor() {
    super(Object.assign(optionsFromArguments(Panner.getDefaults(), arguments, ["pan"])));
    this.name = "Panner";
    this._panner = this.context.createStereoPanner();
    this.input = this._panner;
    this.output = this._panner;
    const options = optionsFromArguments(Panner.getDefaults(), arguments, ["pan"]);
    this.pan = new Param$1({
      context: this.context,
      param: this._panner.pan,
      value: options.pan,
      minValue: -1,
      maxValue: 1
    });
    this._panner.channelCount = options.channelCount;
    this._panner.channelCountMode = "explicit";
    readOnly(this, "pan");
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      pan: 0,
      channelCount: 1
    });
  }
  dispose() {
    super.dispose();
    this._panner.disconnect();
    this.pan.dispose();
    return this;
  }
}
class PanVol extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(PanVol.getDefaults(), arguments, ["pan", "volume"]));
    this.name = "PanVol";
    const options = optionsFromArguments(PanVol.getDefaults(), arguments, ["pan", "volume"]);
    this._panner = this.input = new Panner({
      context: this.context,
      pan: options.pan,
      channelCount: options.channelCount
    });
    this.pan = this._panner.pan;
    this._volume = this.output = new Volume({
      context: this.context,
      volume: options.volume
    });
    this.volume = this._volume.volume;
    this._panner.connect(this._volume);
    this.mute = options.mute;
    readOnly(this, ["pan", "volume"]);
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      mute: false,
      pan: 0,
      volume: 0,
      channelCount: 1
    });
  }
  get mute() {
    return this._volume.mute;
  }
  set mute(mute) {
    this._volume.mute = mute;
  }
  dispose() {
    super.dispose();
    this._panner.dispose();
    this.pan.dispose();
    this._volume.dispose();
    this.volume.dispose();
    return this;
  }
}
let Channel$1 = class Channel extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Channel.getDefaults(), arguments, ["volume", "pan"]));
    this.name = "Channel";
    const options = optionsFromArguments(Channel.getDefaults(), arguments, ["volume", "pan"]);
    this._solo = this.input = new Solo({
      solo: options.solo,
      context: this.context
    });
    this._panVol = this.output = new PanVol({
      context: this.context,
      pan: options.pan,
      volume: options.volume,
      mute: options.mute,
      channelCount: options.channelCount
    });
    this.pan = this._panVol.pan;
    this.volume = this._panVol.volume;
    this._solo.connect(this._panVol);
    readOnly(this, ["pan", "volume"]);
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      pan: 0,
      volume: 0,
      mute: false,
      solo: false,
      channelCount: 1
    });
  }
  get solo() {
    return this._solo.solo;
  }
  set solo(solo) {
    this._solo.solo = solo;
  }
  get muted() {
    return this._solo.muted || this.mute;
  }
  get mute() {
    return this._panVol.mute;
  }
  set mute(mute) {
    this._panVol.mute = mute;
  }
  _getBus(name) {
    if (!Channel.buses.has(name)) {
      Channel.buses.set(name, new Gain({ context: this.context }));
    }
    return Channel.buses.get(name);
  }
  send(name, volume = 0) {
    const bus = this._getBus(name);
    const sendKnob = new Gain({
      context: this.context,
      units: "decibels",
      gain: volume
    });
    this.connect(sendKnob);
    sendKnob.connect(bus);
    return sendKnob;
  }
  receive(name) {
    const bus = this._getBus(name);
    bus.connect(this);
    return this;
  }
  dispose() {
    super.dispose();
    this._panVol.dispose();
    this.pan.dispose();
    this.volume.dispose();
    this._solo.dispose();
    return this;
  }
};
Channel$1.buses = /* @__PURE__ */ new Map();
let Listener$2 = class Listener extends ToneAudioNode {
  constructor() {
    super(...arguments);
    this.name = "Listener";
    this.positionX = new Param$1({
      context: this.context,
      param: this.context.rawContext.listener.positionX
    });
    this.positionY = new Param$1({
      context: this.context,
      param: this.context.rawContext.listener.positionY
    });
    this.positionZ = new Param$1({
      context: this.context,
      param: this.context.rawContext.listener.positionZ
    });
    this.forwardX = new Param$1({
      context: this.context,
      param: this.context.rawContext.listener.forwardX
    });
    this.forwardY = new Param$1({
      context: this.context,
      param: this.context.rawContext.listener.forwardY
    });
    this.forwardZ = new Param$1({
      context: this.context,
      param: this.context.rawContext.listener.forwardZ
    });
    this.upX = new Param$1({
      context: this.context,
      param: this.context.rawContext.listener.upX
    });
    this.upY = new Param$1({
      context: this.context,
      param: this.context.rawContext.listener.upY
    });
    this.upZ = new Param$1({
      context: this.context,
      param: this.context.rawContext.listener.upZ
    });
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      forwardX: 0,
      forwardY: 0,
      forwardZ: -1,
      upX: 0,
      upY: 1,
      upZ: 0
    });
  }
  dispose() {
    super.dispose();
    this.positionX.dispose();
    this.positionY.dispose();
    this.positionZ.dispose();
    this.forwardX.dispose();
    this.forwardY.dispose();
    this.forwardZ.dispose();
    this.upX.dispose();
    this.upY.dispose();
    this.upZ.dispose();
    return this;
  }
};
onContextInit((context2) => {
  context2.listener = new Listener$2({ context: context2 });
});
onContextClose((context2) => {
  context2.listener.dispose();
});
class Panner3D extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Panner3D.getDefaults(), arguments, ["positionX", "positionY", "positionZ"]));
    this.name = "Panner3D";
    const options = optionsFromArguments(Panner3D.getDefaults(), arguments, ["positionX", "positionY", "positionZ"]);
    this._panner = this.input = this.output = this.context.createPanner();
    this.panningModel = options.panningModel;
    this.maxDistance = options.maxDistance;
    this.distanceModel = options.distanceModel;
    this.coneOuterGain = options.coneOuterGain;
    this.coneOuterAngle = options.coneOuterAngle;
    this.coneInnerAngle = options.coneInnerAngle;
    this.refDistance = options.refDistance;
    this.rolloffFactor = options.rolloffFactor;
    this.positionX = new Param$1({
      context: this.context,
      param: this._panner.positionX,
      value: options.positionX
    });
    this.positionY = new Param$1({
      context: this.context,
      param: this._panner.positionY,
      value: options.positionY
    });
    this.positionZ = new Param$1({
      context: this.context,
      param: this._panner.positionZ,
      value: options.positionZ
    });
    this.orientationX = new Param$1({
      context: this.context,
      param: this._panner.orientationX,
      value: options.orientationX
    });
    this.orientationY = new Param$1({
      context: this.context,
      param: this._panner.orientationY,
      value: options.orientationY
    });
    this.orientationZ = new Param$1({
      context: this.context,
      param: this._panner.orientationZ,
      value: options.orientationZ
    });
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      coneOuterGain: 0,
      distanceModel: "inverse",
      maxDistance: 1e4,
      orientationX: 0,
      orientationY: 0,
      orientationZ: 0,
      panningModel: "equalpower",
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      refDistance: 1,
      rolloffFactor: 1
    });
  }
  setPosition(x, y, z) {
    this.positionX.value = x;
    this.positionY.value = y;
    this.positionZ.value = z;
    return this;
  }
  setOrientation(x, y, z) {
    this.orientationX.value = x;
    this.orientationY.value = y;
    this.orientationZ.value = z;
    return this;
  }
  get panningModel() {
    return this._panner.panningModel;
  }
  set panningModel(val) {
    this._panner.panningModel = val;
  }
  get refDistance() {
    return this._panner.refDistance;
  }
  set refDistance(val) {
    this._panner.refDistance = val;
  }
  get rolloffFactor() {
    return this._panner.rolloffFactor;
  }
  set rolloffFactor(val) {
    this._panner.rolloffFactor = val;
  }
  get distanceModel() {
    return this._panner.distanceModel;
  }
  set distanceModel(val) {
    this._panner.distanceModel = val;
  }
  get coneInnerAngle() {
    return this._panner.coneInnerAngle;
  }
  set coneInnerAngle(val) {
    this._panner.coneInnerAngle = val;
  }
  get coneOuterAngle() {
    return this._panner.coneOuterAngle;
  }
  set coneOuterAngle(val) {
    this._panner.coneOuterAngle = val;
  }
  get coneOuterGain() {
    return this._panner.coneOuterGain;
  }
  set coneOuterGain(val) {
    this._panner.coneOuterGain = val;
  }
  get maxDistance() {
    return this._panner.maxDistance;
  }
  set maxDistance(val) {
    this._panner.maxDistance = val;
  }
  dispose() {
    super.dispose();
    this._panner.disconnect();
    this.orientationX.dispose();
    this.orientationY.dispose();
    this.orientationZ.dispose();
    this.positionX.dispose();
    this.positionY.dispose();
    this.positionZ.dispose();
    return this;
  }
}
let Envelope$2 = class Envelope extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Envelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]));
    this.name = "Envelope";
    this._sig = new Signal({
      context: this.context,
      value: 0
    });
    this.output = this._sig;
    this.input = void 0;
    const options = optionsFromArguments(Envelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]);
    this.attack = options.attack;
    this.decay = options.decay;
    this.sustain = options.sustain;
    this.release = options.release;
    this.attackCurve = options.attackCurve;
    this.releaseCurve = options.releaseCurve;
    this.decayCurve = options.decayCurve;
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      attack: 0.01,
      attackCurve: "linear",
      decay: 0.1,
      decayCurve: "exponential",
      release: 1,
      releaseCurve: "exponential",
      sustain: 0.5
    });
  }
  get value() {
    return this.getValueAtTime(this.now());
  }
  _getCurve(curve, direction) {
    if (isString(curve)) {
      return curve;
    } else {
      let curveName;
      for (curveName in EnvelopeCurves) {
        if (EnvelopeCurves[curveName][direction] === curve) {
          return curveName;
        }
      }
      return curve;
    }
  }
  _setCurve(name, direction, curve) {
    if (isString(curve) && Reflect.has(EnvelopeCurves, curve)) {
      const curveDef = EnvelopeCurves[curve];
      if (isObject(curveDef)) {
        if (name !== "_decayCurve") {
          this[name] = curveDef[direction];
        }
      } else {
        this[name] = curveDef;
      }
    } else if (isArray(curve) && name !== "_decayCurve") {
      this[name] = curve;
    } else {
      throw new Error("Envelope: invalid curve: " + curve);
    }
  }
  get attackCurve() {
    return this._getCurve(this._attackCurve, "In");
  }
  set attackCurve(curve) {
    this._setCurve("_attackCurve", "In", curve);
  }
  get releaseCurve() {
    return this._getCurve(this._releaseCurve, "Out");
  }
  set releaseCurve(curve) {
    this._setCurve("_releaseCurve", "Out", curve);
  }
  get decayCurve() {
    return this._decayCurve;
  }
  set decayCurve(curve) {
    assert(["linear", "exponential"].some((c) => c === curve), `Invalid envelope curve: ${curve}`);
    this._decayCurve = curve;
  }
  triggerAttack(time, velocity = 1) {
    this.log("triggerAttack", time, velocity);
    time = this.toSeconds(time);
    const originalAttack = this.toSeconds(this.attack);
    let attack = originalAttack;
    const decay = this.toSeconds(this.decay);
    const currentValue = this.getValueAtTime(time);
    if (currentValue > 0) {
      const attackRate = 1 / attack;
      const remainingDistance = 1 - currentValue;
      attack = remainingDistance / attackRate;
    }
    if (attack < this.sampleTime) {
      this._sig.cancelScheduledValues(time);
      this._sig.setValueAtTime(velocity, time);
    } else if (this._attackCurve === "linear") {
      this._sig.linearRampTo(velocity, attack, time);
    } else if (this._attackCurve === "exponential") {
      this._sig.targetRampTo(velocity, attack, time);
    } else {
      this._sig.cancelAndHoldAtTime(time);
      let curve = this._attackCurve;
      for (let i = 1; i < curve.length; i++) {
        if (curve[i - 1] <= currentValue && currentValue <= curve[i]) {
          curve = this._attackCurve.slice(i);
          curve[0] = currentValue;
          break;
        }
      }
      this._sig.setValueCurveAtTime(curve, time, attack, velocity);
    }
    if (decay && this.sustain < 1) {
      const decayValue = velocity * this.sustain;
      const decayStart = time + attack;
      this.log("decay", decayStart);
      if (this._decayCurve === "linear") {
        this._sig.linearRampToValueAtTime(decayValue, decay + decayStart);
      } else {
        this._sig.exponentialApproachValueAtTime(decayValue, decayStart, decay);
      }
    }
    return this;
  }
  triggerRelease(time) {
    this.log("triggerRelease", time);
    time = this.toSeconds(time);
    const currentValue = this.getValueAtTime(time);
    if (currentValue > 0) {
      const release = this.toSeconds(this.release);
      if (release < this.sampleTime) {
        this._sig.setValueAtTime(0, time);
      } else if (this._releaseCurve === "linear") {
        this._sig.linearRampTo(0, release, time);
      } else if (this._releaseCurve === "exponential") {
        this._sig.targetRampTo(0, release, time);
      } else {
        assert(isArray(this._releaseCurve), "releaseCurve must be either 'linear', 'exponential' or an array");
        this._sig.cancelAndHoldAtTime(time);
        this._sig.setValueCurveAtTime(this._releaseCurve, time, release, currentValue);
      }
    }
    return this;
  }
  getValueAtTime(time) {
    return this._sig.getValueAtTime(time);
  }
  triggerAttackRelease(duration, time, velocity = 1) {
    time = this.toSeconds(time);
    this.triggerAttack(time, velocity);
    this.triggerRelease(time + this.toSeconds(duration));
    return this;
  }
  cancel(after) {
    this._sig.cancelScheduledValues(this.toSeconds(after));
    return this;
  }
  connect(destination, outputNumber = 0, inputNumber = 0) {
    connectSignal(this, destination, outputNumber, inputNumber);
    return this;
  }
  asArray(length = 1024) {
    return __awaiter(this, void 0, void 0, function* () {
      const duration = length / this.context.sampleRate;
      const context2 = new OfflineContext(1, duration, this.context.sampleRate);
      const attackPortion = this.toSeconds(this.attack) + this.toSeconds(this.decay);
      const envelopeDuration = attackPortion + this.toSeconds(this.release);
      const sustainTime = envelopeDuration * 0.1;
      const totalDuration = envelopeDuration + sustainTime;
      const clone = new this.constructor(Object.assign(this.get(), {
        attack: duration * this.toSeconds(this.attack) / totalDuration,
        decay: duration * this.toSeconds(this.decay) / totalDuration,
        release: duration * this.toSeconds(this.release) / totalDuration,
        context: context2
      }));
      clone._sig.toDestination();
      clone.triggerAttackRelease(duration * (attackPortion + sustainTime) / totalDuration, 0);
      const buffer = yield context2.render();
      return buffer.getChannelData(0);
    });
  }
  dispose() {
    super.dispose();
    this._sig.dispose();
    return this;
  }
};
__decorate([
  timeRange(0)
], Envelope$2.prototype, "attack", void 0);
__decorate([
  timeRange(0)
], Envelope$2.prototype, "decay", void 0);
__decorate([
  range(0, 1)
], Envelope$2.prototype, "sustain", void 0);
__decorate([
  timeRange(0)
], Envelope$2.prototype, "release", void 0);
const EnvelopeCurves = (() => {
  const curveLen = 128;
  let i;
  let k;
  const cosineCurve = [];
  for (i = 0; i < curveLen; i++) {
    cosineCurve[i] = Math.sin(i / (curveLen - 1) * (Math.PI / 2));
  }
  const rippleCurve = [];
  const rippleCurveFreq = 6.4;
  for (i = 0; i < curveLen - 1; i++) {
    k = i / (curveLen - 1);
    const sineWave = Math.sin(k * (Math.PI * 2) * rippleCurveFreq - Math.PI / 2) + 1;
    rippleCurve[i] = sineWave / 10 + k * 0.83;
  }
  rippleCurve[curveLen - 1] = 1;
  const stairsCurve = [];
  const steps = 5;
  for (i = 0; i < curveLen; i++) {
    stairsCurve[i] = Math.ceil(i / (curveLen - 1) * steps) / steps;
  }
  const sineCurve = [];
  for (i = 0; i < curveLen; i++) {
    k = i / (curveLen - 1);
    sineCurve[i] = 0.5 * (1 - Math.cos(Math.PI * k));
  }
  const bounceCurve = [];
  for (i = 0; i < curveLen; i++) {
    k = i / (curveLen - 1);
    const freq = Math.pow(k, 3) * 4 + 0.2;
    const val = Math.cos(freq * Math.PI * 2 * k);
    bounceCurve[i] = Math.abs(val * (1 - k));
  }
  function invertCurve(curve) {
    const out = new Array(curve.length);
    for (let j = 0; j < curve.length; j++) {
      out[j] = 1 - curve[j];
    }
    return out;
  }
  function reverseCurve(curve) {
    return curve.slice(0).reverse();
  }
  return {
    bounce: {
      In: invertCurve(bounceCurve),
      Out: bounceCurve
    },
    cosine: {
      In: cosineCurve,
      Out: reverseCurve(cosineCurve)
    },
    exponential: "exponential",
    linear: "linear",
    ripple: {
      In: rippleCurve,
      Out: invertCurve(rippleCurve)
    },
    sine: {
      In: sineCurve,
      Out: invertCurve(sineCurve)
    },
    step: {
      In: stairsCurve,
      Out: invertCurve(stairsCurve)
    }
  };
})();
class Pow extends SignalOperator {
  constructor() {
    super(Object.assign(optionsFromArguments(Pow.getDefaults(), arguments, ["value"])));
    this.name = "Pow";
    const options = optionsFromArguments(Pow.getDefaults(), arguments, ["value"]);
    this._exponentScaler = this.input = this.output = new WaveShaper({
      context: this.context,
      mapping: this._expFunc(options.value),
      length: 8192
    });
    this._exponent = options.value;
  }
  static getDefaults() {
    return Object.assign(SignalOperator.getDefaults(), {
      value: 1
    });
  }
  _expFunc(exponent) {
    return (val) => {
      return Math.pow(Math.abs(val), exponent);
    };
  }
  get value() {
    return this._exponent;
  }
  set value(exponent) {
    this._exponent = exponent;
    this._exponentScaler.setMap(this._expFunc(this._exponent));
  }
  dispose() {
    super.dispose();
    this._exponentScaler.dispose();
    return this;
  }
}
class FrequencyEnvelope extends Envelope$2 {
  constructor() {
    super(optionsFromArguments(FrequencyEnvelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]));
    this.name = "FrequencyEnvelope";
    const options = optionsFromArguments(FrequencyEnvelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]);
    this._octaves = options.octaves;
    this._baseFrequency = this.toFrequency(options.baseFrequency);
    this._exponent = this.input = new Pow({
      context: this.context,
      value: options.exponent
    });
    this._scale = this.output = new Scale({
      context: this.context,
      min: this._baseFrequency,
      max: this._baseFrequency * Math.pow(2, this._octaves)
    });
    this._sig.chain(this._exponent, this._scale);
  }
  static getDefaults() {
    return Object.assign(Envelope$2.getDefaults(), {
      baseFrequency: 200,
      exponent: 1,
      octaves: 4
    });
  }
  get baseFrequency() {
    return this._baseFrequency;
  }
  set baseFrequency(min) {
    const freq = this.toFrequency(min);
    assertRange(freq, 0);
    this._baseFrequency = freq;
    this._scale.min = this._baseFrequency;
    this.octaves = this._octaves;
  }
  get octaves() {
    return this._octaves;
  }
  set octaves(octaves) {
    this._octaves = octaves;
    this._scale.max = this._baseFrequency * Math.pow(2, octaves);
  }
  get exponent() {
    return this._exponent.value;
  }
  set exponent(exponent) {
    this._exponent.value = exponent;
  }
  dispose() {
    super.dispose();
    this._exponent.dispose();
    this._scale.dispose();
    return this;
  }
}
class BiquadFilter extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(BiquadFilter.getDefaults(), arguments, ["frequency", "type"]));
    this.name = "BiquadFilter";
    const options = optionsFromArguments(BiquadFilter.getDefaults(), arguments, ["frequency", "type"]);
    this._filter = this.context.createBiquadFilter();
    this.input = this.output = this._filter;
    this.Q = new Param$1({
      context: this.context,
      units: "number",
      value: options.Q,
      param: this._filter.Q
    });
    this.frequency = new Param$1({
      context: this.context,
      units: "frequency",
      value: options.frequency,
      param: this._filter.frequency
    });
    this.detune = new Param$1({
      context: this.context,
      units: "cents",
      value: options.detune,
      param: this._filter.detune
    });
    this.gain = new Param$1({
      context: this.context,
      units: "decibels",
      convert: false,
      value: options.gain,
      param: this._filter.gain
    });
    this.type = options.type;
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      Q: 1,
      type: "lowpass",
      frequency: 350,
      detune: 0,
      gain: 0
    });
  }
  get type() {
    return this._filter.type;
  }
  set type(type) {
    const types = [
      "lowpass",
      "highpass",
      "bandpass",
      "lowshelf",
      "highshelf",
      "notch",
      "allpass",
      "peaking"
    ];
    assert(types.indexOf(type) !== -1, `Invalid filter type: ${type}`);
    this._filter.type = type;
  }
  getFrequencyResponse(len = 128) {
    const freqValues = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      const norm = Math.pow(i / len, 2);
      const freq = norm * (2e4 - 20) + 20;
      freqValues[i] = freq;
    }
    const magValues = new Float32Array(len);
    const phaseValues = new Float32Array(len);
    const filterClone = this.context.createBiquadFilter();
    filterClone.type = this.type;
    filterClone.Q.value = this.Q.value;
    filterClone.frequency.value = this.frequency.value;
    filterClone.gain.value = this.gain.value;
    filterClone.getFrequencyResponse(freqValues, magValues, phaseValues);
    return magValues;
  }
  dispose() {
    super.dispose();
    this._filter.disconnect();
    this.Q.dispose();
    this.frequency.dispose();
    this.gain.dispose();
    this.detune.dispose();
    return this;
  }
}
class Filter extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Filter.getDefaults(), arguments, ["frequency", "type", "rolloff"]));
    this.name = "Filter";
    this.input = new Gain({ context: this.context });
    this.output = new Gain({ context: this.context });
    this._filters = [];
    const options = optionsFromArguments(Filter.getDefaults(), arguments, ["frequency", "type", "rolloff"]);
    this._filters = [];
    this.Q = new Signal({
      context: this.context,
      units: "positive",
      value: options.Q
    });
    this.frequency = new Signal({
      context: this.context,
      units: "frequency",
      value: options.frequency
    });
    this.detune = new Signal({
      context: this.context,
      units: "cents",
      value: options.detune
    });
    this.gain = new Signal({
      context: this.context,
      units: "decibels",
      convert: false,
      value: options.gain
    });
    this._type = options.type;
    this.rolloff = options.rolloff;
    readOnly(this, ["detune", "frequency", "gain", "Q"]);
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      Q: 1,
      detune: 0,
      frequency: 350,
      gain: 0,
      rolloff: -12,
      type: "lowpass"
    });
  }
  get type() {
    return this._type;
  }
  set type(type) {
    const types = [
      "lowpass",
      "highpass",
      "bandpass",
      "lowshelf",
      "highshelf",
      "notch",
      "allpass",
      "peaking"
    ];
    assert(types.indexOf(type) !== -1, `Invalid filter type: ${type}`);
    this._type = type;
    this._filters.forEach((filter) => filter.type = type);
  }
  get rolloff() {
    return this._rolloff;
  }
  set rolloff(rolloff) {
    const rolloffNum = isNumber(rolloff) ? rolloff : parseInt(rolloff, 10);
    const possibilities = [-12, -24, -48, -96];
    let cascadingCount = possibilities.indexOf(rolloffNum);
    assert(cascadingCount !== -1, `rolloff can only be ${possibilities.join(", ")}`);
    cascadingCount += 1;
    this._rolloff = rolloffNum;
    this.input.disconnect();
    this._filters.forEach((filter) => filter.disconnect());
    this._filters = new Array(cascadingCount);
    for (let count = 0; count < cascadingCount; count++) {
      const filter = new BiquadFilter({
        context: this.context
      });
      filter.type = this._type;
      this.frequency.connect(filter.frequency);
      this.detune.connect(filter.detune);
      this.Q.connect(filter.Q);
      this.gain.connect(filter.gain);
      this._filters[count] = filter;
    }
    this._internalChannels = this._filters;
    connectSeries(this.input, ...this._internalChannels, this.output);
  }
  getFrequencyResponse(len = 128) {
    const filterClone = new BiquadFilter({
      frequency: this.frequency.value,
      gain: this.gain.value,
      Q: this.Q.value,
      type: this._type,
      detune: this.detune.value
    });
    const totalResponse = new Float32Array(len).map(() => 1);
    this._filters.forEach(() => {
      const response = filterClone.getFrequencyResponse(len);
      response.forEach((val, i) => totalResponse[i] *= val);
    });
    filterClone.dispose();
    return totalResponse;
  }
  dispose() {
    super.dispose();
    this._filters.forEach((filter) => {
      filter.dispose();
    });
    writable(this, ["detune", "frequency", "gain", "Q"]);
    this.frequency.dispose();
    this.Q.dispose();
    this.detune.dispose();
    this.gain.dispose();
    return this;
  }
}
class MultibandSplit extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(MultibandSplit.getDefaults(), arguments, ["lowFrequency", "highFrequency"]));
    this.name = "MultibandSplit";
    this.input = new Gain({ context: this.context });
    this.output = void 0;
    this.low = new Filter({
      context: this.context,
      frequency: 0,
      type: "lowpass"
    });
    this._lowMidFilter = new Filter({
      context: this.context,
      frequency: 0,
      type: "highpass"
    });
    this.mid = new Filter({
      context: this.context,
      frequency: 0,
      type: "lowpass"
    });
    this.high = new Filter({
      context: this.context,
      frequency: 0,
      type: "highpass"
    });
    this._internalChannels = [this.low, this.mid, this.high];
    const options = optionsFromArguments(MultibandSplit.getDefaults(), arguments, ["lowFrequency", "highFrequency"]);
    this.lowFrequency = new Signal({
      context: this.context,
      units: "frequency",
      value: options.lowFrequency
    });
    this.highFrequency = new Signal({
      context: this.context,
      units: "frequency",
      value: options.highFrequency
    });
    this.Q = new Signal({
      context: this.context,
      units: "positive",
      value: options.Q
    });
    this.input.fan(this.low, this.high);
    this.input.chain(this._lowMidFilter, this.mid);
    this.lowFrequency.fan(this.low.frequency, this._lowMidFilter.frequency);
    this.highFrequency.fan(this.mid.frequency, this.high.frequency);
    this.Q.connect(this.low.Q);
    this.Q.connect(this._lowMidFilter.Q);
    this.Q.connect(this.mid.Q);
    this.Q.connect(this.high.Q);
    readOnly(this, ["high", "mid", "low", "highFrequency", "lowFrequency"]);
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      Q: 1,
      highFrequency: 2500,
      lowFrequency: 400
    });
  }
  dispose() {
    super.dispose();
    writable(this, ["high", "mid", "low", "highFrequency", "lowFrequency"]);
    this.low.dispose();
    this._lowMidFilter.dispose();
    this.mid.dispose();
    this.high.dispose();
    this.lowFrequency.dispose();
    this.highFrequency.dispose();
    this.Q.dispose();
    return this;
  }
}
class EQ3 extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(EQ3.getDefaults(), arguments, ["low", "mid", "high"]));
    this.name = "EQ3";
    this.output = new Gain({ context: this.context });
    this._internalChannels = [];
    const options = optionsFromArguments(EQ3.getDefaults(), arguments, ["low", "mid", "high"]);
    this.input = this._multibandSplit = new MultibandSplit({
      context: this.context,
      highFrequency: options.highFrequency,
      lowFrequency: options.lowFrequency
    });
    this._lowGain = new Gain({
      context: this.context,
      gain: options.low,
      units: "decibels"
    });
    this._midGain = new Gain({
      context: this.context,
      gain: options.mid,
      units: "decibels"
    });
    this._highGain = new Gain({
      context: this.context,
      gain: options.high,
      units: "decibels"
    });
    this.low = this._lowGain.gain;
    this.mid = this._midGain.gain;
    this.high = this._highGain.gain;
    this.Q = this._multibandSplit.Q;
    this.lowFrequency = this._multibandSplit.lowFrequency;
    this.highFrequency = this._multibandSplit.highFrequency;
    this._multibandSplit.low.chain(this._lowGain, this.output);
    this._multibandSplit.mid.chain(this._midGain, this.output);
    this._multibandSplit.high.chain(this._highGain, this.output);
    readOnly(this, ["low", "mid", "high", "lowFrequency", "highFrequency"]);
    this._internalChannels = [this._multibandSplit];
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      high: 0,
      highFrequency: 2500,
      low: 0,
      lowFrequency: 400,
      mid: 0
    });
  }
  dispose() {
    super.dispose();
    writable(this, ["low", "mid", "high", "lowFrequency", "highFrequency"]);
    this._multibandSplit.dispose();
    this.lowFrequency.dispose();
    this.highFrequency.dispose();
    this._lowGain.dispose();
    this._midGain.dispose();
    this._highGain.dispose();
    this.low.dispose();
    this.mid.dispose();
    this.high.dispose();
    this.Q.dispose();
    return this;
  }
}
class Convolver extends ToneAudioNode {
  constructor() {
    super(optionsFromArguments(Convolver.getDefaults(), arguments, ["url", "onload"]));
    this.name = "Convolver";
    this._convolver = this.context.createConvolver();
    const options = optionsFromArguments(Convolver.getDefaults(), arguments, ["url", "onload"]);
    this._buffer = new ToneAudioBuffer(options.url, (buffer) => {
      this.buffer = buffer;
      options.onload();
    });
    this.input = new Gain({ context: this.context });
    this.output = new Gain({ context: this.context });
    if (this._buffer.loaded) {
      this.buffer = this._buffer;
    }
    this.normalize = options.normalize;
    this.input.chain(this._convolver, this.output);
  }
  static getDefaults() {
    return Object.assign(ToneAudioNode.getDefaults(), {
      normalize: true,
      onload: noOp
    });
  }
  load(url) {
    return __awaiter(this, void 0, void 0, function* () {
      this.buffer = yield this._buffer.load(url);
    });
  }
  get buffer() {
    if (this._buffer.length) {
      return this._buffer;
    } else {
      return null;
    }
  }
  set buffer(buffer) {
    if (buffer) {
      this._buffer.set(buffer);
    }
    if (this._convolver.buffer) {
      this.input.disconnect();
      this._convolver.disconnect();
      this._convolver = this.context.createConvolver();
      this.input.chain(this._convolver, this.output);
    }
    const buff = this._buffer.get();
    this._convolver.buffer = buff ? buff : null;
  }
  get normalize() {
    return this._convolver.normalize;
  }
  set normalize(norm) {
    this._convolver.normalize = norm;
  }
  dispose() {
    super.dispose();
    this._buffer.dispose();
    this._convolver.disconnect();
    return this;
  }
}
function now() {
  return getContext$1().now();
}
function immediate() {
  return getContext$1().immediate();
}
getContext$1().transport;
getContext$1().destination;
getContext$1().destination;
function getDestination() {
  return getContext$1().destination;
}
getContext$1().listener;
function getListener() {
  return getContext$1().listener;
}
const Draw2 = getContext$1().draw;
const context = getContext$1();
class InteractiveLayerBase {
  constructor({
    initializingElement,
    onInit,
    sceneManager: sceneManager2,
    appFSM: appFSM2,
    autoEnableAudio = true
  }) {
    this.autoEnableAudio = true;
    if (typeof window !== "undefined") {
      window.TONE_SILENCE_LOGGING = true;
    }
    this.initializingElement = initializingElement || window;
    this.init = this.init.bind(this);
    this.onInit = onInit;
    this.sceneManager = sceneManager2;
    this.appFSM = appFSM2;
    this.autoEnableAudio = autoEnableAudio;
    this.onInitialFadeIn = () => {
    };
  }
  init() {
    return __async(this, null, function* () {
      if (this.sceneManager) {
        try {
          yield this.sceneManager.initializeAudioContext();
          this.initializingElement.removeEventListener("touchend", this.init);
          this.initializingElement.removeEventListener("mousedown", this.init);
          this.sceneManager.setBusVolume("fade", 1, 1);
          this.onInitialFadeIn();
          Utils.setMuteOnBlur("out", 0.3, this.sceneManager);
        } catch (e) {
          console.warn(e, "could not initialize audio");
        }
      }
    });
  }
  initAudio() {
    return __async(this, null, function* () {
      if (!this.sceneManager.audioIsInitialized) {
        if (this.autoEnableAudio) {
          this.sceneManager.initializeAudioContext();
        }
        this.initializingElement.addEventListener("touchend", this.init);
        this.initializingElement.addEventListener("mousedown", this.init);
      }
      Utils.setMuteOnBlur("out", 0.3, this.sceneManager);
      return this.onInit && (yield this.onInit());
    });
  }
  setMute(shouldMute) {
    this.sceneManager.setBusMute("master", shouldMute);
  }
  setBlurMute(shouldMute) {
    this.sceneManager.setBusMute("out", shouldMute);
  }
  disableBlurMute(disabled) {
    this.sceneManager.disableBlur = disabled;
  }
  enableIosHack(enabled) {
    this.sceneManager.iosHack = enabled;
  }
  changeScene(sceneName) {
    var _a;
    (_a = this.appFSM) == null ? void 0 : _a.transition(sceneName);
  }
  trigger(key, options) {
    if (this.sceneManager.audioIsInitialized) {
      this.sceneManager.trigger(key, options);
    }
  }
}
const getFPS = (now2, previous) => 1e3 / (now2 - previous);
const getNormalizedForFPS = (value, fps) => value * (120 / fps);
const getQuantizedToGrid$1 = ({
  x,
  y,
  rows,
  columns,
  totalWidth,
  totalHeight,
  margin = 0
}) => {
  const width = Math.round(totalWidth - margin * 2);
  const height = Math.round(totalHeight - margin * 2);
  margin = Math.round(margin);
  const columnWidth = Math.round(width / columns);
  const rowWidth = Math.round(height / rows);
  const row = Math.floor((y - margin) / rowWidth);
  const column = Math.floor((x - margin) / columnWidth);
  const maxNoteValue = rows - 1;
  const invertedRow = Math.abs(row - maxNoteValue);
  return {
    x: column * columnWidth + margin,
    y: row * rowWidth + margin,
    row: invertedRow,
    column
  };
};
class MouseInteraction {
  constructor({ columns, rows, onTrigger, onFrame, options }) {
    this.state = {
      mouseIsMoving: false,
      mouseEnergy: 0,
      mouseActionEnabled: false,
      mouseCoords: { x: 0, y: 0 },
      lastMouseCoords: { x: 0, y: 0 },
      stopped: true,
      velocity: 0,
      mouseIsDown: false
    };
    this.numColumns = 6;
    this.numRows = 6;
    this.velocityDecay = 0.94;
    this.maxVelocity = 20;
    this.width = 0;
    this.height = 0;
    this.boundingRect = null;
    this.useMouseDown = false;
    this.handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      if (this.useMouseDown && !this.state.mouseIsDown)
        return;
      this.setMouseCoords.bind(this)(clientX, clientY, this.width, this.height);
    };
    this.handleTouchMove = (e) => {
      const { touches } = e;
      if (touches.length > 0) {
        const { clientX, clientY } = touches[0];
        if (this.boundingRect) {
          const left = this.boundingRect.left;
          const right = this.boundingRect.right;
          const top = this.boundingRect.top;
          const bottom = this.boundingRect.bottom;
          if (clientX >= left && clientX <= right && clientY >= top && clientY <= bottom) {
            this.setMouseCoords.bind(this)(
              clientX,
              clientY,
              this.width,
              this.height
            );
          }
        } else {
          this.setMouseCoords.bind(this)(
            clientX,
            clientY,
            this.width,
            this.height
          );
        }
      }
    };
    this.numColumns = columns;
    this.numRows = rows;
    this.onTrigger = onTrigger;
    this.onFrame = onFrame;
    this.energySmoother = new Smoother(5, 0);
    if (options && options.velocityDecay) {
      this.velocityDecay = options.velocityDecay;
    }
    if (options && options.maxVelocity) {
      this.maxVelocity = options.maxVelocity;
    }
    if (options && options.useMouseDown) {
      this.useMouseDown = options.useMouseDown;
    }
  }
  start(containerEl) {
    this.state.stopped = false;
    this.bindMouseMove(containerEl);
  }
  stop() {
    this.state.mouseActionEnabled = false;
    this.state.stopped = true;
  }
  enable() {
    this.state.mouseActionEnabled = true;
  }
  disable() {
    this.state.mouseActionEnabled = false;
  }
  bindMouseMove(containerEl) {
    if (containerEl instanceof HTMLElement) {
      this.width = containerEl.clientWidth;
      this.height = containerEl.clientHeight;
      this.boundingRect = containerEl.getBoundingClientRect();
    } else if (containerEl instanceof Window) {
      this.width = containerEl.innerWidth;
      this.height = containerEl.innerHeight;
    } else if (containerEl instanceof Document) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }
    containerEl.addEventListener("mousemove", this.handleMouseMove);
    containerEl.addEventListener("touchmove", this.handleTouchMove);
    if (this.useMouseDown) {
      containerEl.addEventListener("mousedown", () => {
        this.state.mouseIsDown = true;
      });
      containerEl.addEventListener("mouseup", () => {
        this.state.mouseIsDown = false;
      });
    }
    this.startRequestAnimationFrame();
  }
  setMouseCoords(x, y, containerWidth, containerHeight) {
    if (this.state.mouseActionEnabled) {
      this.triggerGrid(
        this.state.mouseCoords,
        { x, y },
        containerWidth,
        containerHeight
      );
    }
    this.state.lastMouseCoords = this.state.mouseCoords;
    this.state.mouseCoords = { x, y };
  }
  triggerGrid(oldCoords, newCoords, containerWidth, containerHeight) {
    let oldPosition = getQuantizedToGrid$1({
      x: oldCoords.x,
      y: oldCoords.y,
      rows: this.numRows,
      columns: this.numColumns,
      totalWidth: containerWidth,
      totalHeight: containerHeight
    });
    let newPosition = getQuantizedToGrid$1({
      x: newCoords.x,
      y: newCoords.y,
      rows: this.numRows,
      columns: this.numColumns,
      totalWidth: containerWidth,
      totalHeight: containerHeight
    });
    this.setMouseDelta(
      oldPosition.x - newPosition.x,
      oldPosition.y - newPosition.y
    );
    if (oldPosition.x !== newPosition.x || oldPosition.y !== newPosition.y) {
      this.onTrigger && this.onTrigger(newPosition);
    }
  }
  setMouseDelta(x, y) {
    this.state.mouseIsMoving = true;
    if (x <= 1e-3 && y <= 1e-3) {
      this.state.mouseIsMoving = false;
    }
    const magnitude = Math.sqrt(__pow(x, 2) + __pow(y, 2)) / 500;
    const energy = clip(this.state.mouseEnergy + magnitude, 0, 1);
    this.state.mouseEnergy = this.energySmoother.lowpass(energy);
  }
  setVelocity(x, y, time) {
    var velocity = Math.sqrt(__pow(x, 2) + __pow(y, 2)) / time;
    if (velocity !== null && velocity < this.maxVelocity) {
      this.state.velocity = velocity;
    }
  }
  startRequestAnimationFrame() {
    let previousTime = 0;
    let previousMouseCoords = { x: 0, y: 0 };
    const setMouseEnergy = (now2) => {
      const energyDecay = getNormalizedForFPS(0.01, getFPS(now2, previousTime));
      if (this.state.mouseEnergy > 0) {
        this.state.mouseEnergy -= energyDecay;
      }
      if (this.state.mouseCoords.x !== previousMouseCoords.x && this.state.mouseCoords.y !== previousMouseCoords.y && now2 - previousTime < 100) {
        this.setVelocity(
          previousMouseCoords.x - this.state.mouseCoords.x,
          previousMouseCoords.y - this.state.mouseCoords.y,
          now2 - previousTime
        );
      }
      if (this.state.velocity > 0) {
        this.state.velocity = this.state.velocity *= this.velocityDecay;
      }
      previousTime = now2;
      previousMouseCoords = this.state.mouseCoords;
      this.onFrame && this.onFrame(this.state);
      if (!this.state.stopped) {
        requestAnimationFrame(setMouseEnergy);
      }
    };
    setMouseEnergy(0);
  }
  removeListeners(containerEl) {
    this.stop();
    containerEl.removeEventListener("mousemove", this.handleMouseMove);
    containerEl.removeEventListener("touchmove", this.handleTouchMove);
  }
}
function unmute(context2, allowBackgroundPlayback, forceIOSBehavior, autoReEnableContext) {
  if (forceIOSBehavior === void 0) {
    forceIOSBehavior = false;
  }
  if (autoReEnableContext === void 0) {
    autoReEnableContext = true;
  }
  var pageVisibilityAPI;
  if (document.hidden !== void 0)
    pageVisibilityAPI = {
      hidden: "hidden",
      visibilitychange: "visibilitychange"
    };
  else if (document.webkitHidden !== void 0)
    pageVisibilityAPI = {
      hidden: "webkitHidden",
      visibilitychange: "webkitvisibilitychange"
    };
  else if (document.mozHidden !== void 0)
    pageVisibilityAPI = {
      hidden: "mozHidden",
      visibilitychange: "mozvisibilitychange"
    };
  else if (document.msHidden !== void 0)
    pageVisibilityAPI = {
      hidden: "msHidden",
      visibilitychange: "msvisibilitychange"
    };
  function addEventListeners(target, events, handler2, capture, passive) {
    for (var i = 0; i < events.length; ++i)
      target.addEventListener(events[i], handler2, {
        capture,
        passive
      });
  }
  function removeEventListeners(target, events, handler2, capture, passive) {
    for (var i = 0; i < events.length; ++i)
      target.removeEventListener(events[i], handler2, {
        capture,
        passive
      });
  }
  function noop() {
  }
  var ua = navigator.userAgent.toLowerCase();
  var isIOS = forceIOSBehavior || ua.indexOf("iphone") >= 0 && ua.indexOf("like iphone") < 0 || ua.indexOf("ipad") >= 0 && ua.indexOf("like ipad") < 0 || ua.indexOf("ipod") >= 0 && ua.indexOf("like ipod") < 0 || ua.indexOf("mac os x") >= 0 && navigator.maxTouchPoints > 0;
  function doc_visChange() {
  }
  if (pageVisibilityAPI)
    addEventListeners(
      document,
      [pageVisibilityAPI.visibilitychange],
      doc_visChange,
      true,
      true
    );
  function win_focusChange(evt) {
    if (evt && evt.target !== window)
      return;
  }
  if (isIOS)
    addEventListeners(window, ["focus", "blur"], win_focusChange, true, true);
  function updateContextState() {
    var p;
    {
      if (context2.state !== "running" && context2.state !== "closed") {
        if (hasMediaPlaybackEventOccurred) {
          var p = context2.resume();
          if (p)
            p.then(noop, noop).catch(noop);
        }
      }
    }
  }
  function context_statechange(evt) {
    if (!evt || !evt.unmute_handled) {
      evt.unmute_handled = true;
      updateContextState();
    }
  }
  if (autoReEnableContext) {
    addEventListeners(
      context2,
      ["statechange"],
      context_statechange,
      true,
      true
    );
    if (!context2.onstatechange)
      context2.onstatechange = context_statechange;
  }
  var channelTag = null;
  function huffman(count, repeatStr) {
    var e = repeatStr;
    for (; count > 1; count--)
      e += repeatStr;
    return e;
  }
  var silence = "data:audio/mpeg;base64,//uQx" + huffman(23, "A") + "WGluZwAAAA8AAAACAAACcQCA" + huffman(16, "gICA") + huffman(66, "/") + "8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkI" + huffman(320, "A") + "//sQxAADgnABGiAAQBCqgCRMAAgEAH" + huffman(15, "/") + "7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq" + huffman(18, "/") + "9RUi0f2jn/+xDECgPCjAEQAABN4AAANIAAAAQVTEFNRTMuMTAw" + huffman(97, "V") + "Q==";
  let iosUnmutedTagCreated = false;
  let iosChannelTagPlayed = false;
  function updateChannelState(isMediaPlaybackEvent) {
    return __async(this, null, function* () {
      if (isIOS) {
        {
          {
            if (!channelTag) {
              if (iosUnmutedTagCreated) {
                return false;
              }
              var tmp = document.createElement("div");
              tmp.innerHTML = "<audio x-webkit-airplay='deny'></audio>";
              iosUnmutedTagCreated = true;
              channelTag = tmp.children.item(0);
              channelTag.controls = false;
              channelTag.disableRemotePlayback = true;
              channelTag.preload = "auto";
              channelTag.src = silence;
              channelTag.loop = true;
              if (window.LoaderView) {
                yield LoaderView.completed;
              }
              channelTag.load();
            }
            if (channelTag.paused) {
              if (iosChannelTagPlayed) {
                return false;
              }
              var p = channelTag.play();
              iosChannelTagPlayed = true;
              if (p) {
                p.then(noop, destroyChannelTag).catch(destroyChannelTag);
              }
            }
          }
        }
      }
    });
  }
  function destroyChannelTag() {
    if (channelTag) {
      channelTag.src = "about:blank";
      channelTag.load();
      channelTag = null;
    }
  }
  var mediaPlaybackEvents = [
    "click",
    "contextmenu",
    "auxclick",
    "dblclick",
    "mousedown",
    "mouseup",
    "touchend",
    "keydown",
    "keyup"
  ];
  var hasMediaPlaybackEventOccurred = false;
  function win_mediaPlaybackEvent() {
    hasMediaPlaybackEventOccurred = true;
    updateChannelState();
    if (autoReEnableContext) {
      updateContextState();
    }
  }
  addEventListeners(
    window,
    mediaPlaybackEvents,
    win_mediaPlaybackEvent,
    true,
    true
  );
  return {
    dispose: function() {
      destroyChannelTag();
      if (pageVisibilityAPI)
        removeEventListeners(
          document,
          [pageVisibilityAPI.visibilitychange],
          doc_visChange,
          true,
          true
        );
      if (isIOS)
        removeEventListeners(
          window,
          ["focus", "blur"],
          win_focusChange,
          true,
          true
        );
      removeEventListeners(
        window,
        mediaPlaybackEvents,
        win_mediaPlaybackEvent,
        true,
        true
      );
      removeEventListeners(
        context2,
        ["statechange"],
        context_statechange,
        true,
        true
      );
      if (context2.onstatechange === context_statechange)
        context2.onstatechange = null;
    }
  };
}
const unmuteIOS = (forceIOSBehavior = false, autoReEnableContext = true) => unmute(getContext().rawContext, true, forceIOSBehavior, autoReEnableContext);
const normalizePath = (basePath) => `${basePath || ""}/`.split(/\/\//).join("/");
const calculateDistance = (vec1, vec2) => Math.sqrt(__pow(vec1.x - vec2.x, 2) + __pow(vec1.y - vec2.y, 2));
const clip = (value, min, max = 1) => Math.min(Math.max(value, min), max);
const invert = (value) => 1 - value;
const getRangeBasedOnDistance = (settings) => {
  const { maxDistance, refDistance } = settings;
  const listenerPosition = {
    x: settings.listenerPosition.x,
    y: settings.listenerPosition.z
  };
  const position = { x: settings.position.x, y: settings.position.z };
  const distance = calculateDistance(listenerPosition, position);
  if (distance <= refDistance) {
    return 1;
  }
  const clippedDistance = clip(
    Math.abs(distance - refDistance),
    0,
    maxDistance
  );
  const range2 = -(clippedDistance / (maxDistance - refDistance)) + 1;
  return distance > maxDistance ? 0 : range2;
};
class Smoother {
  constructor(windowSize = 10, initialValue = 0) {
    this.oldestVal = 0;
    this.sum = 0;
    this.firstTime = true;
    this.size = windowSize;
    this.buffer = new Array(this.size).fill(initialValue);
  }
  lowpass(val) {
    this.buffer.push(val);
    this.oldestVal = this.buffer.shift();
    if (this.firstTime) {
      this.sum = this.buffer.reduce((acc, v) => acc + v);
      this.firstTime = false;
    } else {
      this.sum = this.sum - this.oldestVal + val;
    }
    const avg = this.sum / this.size;
    return avg;
  }
}
const getContext = () => context;
const setMuteOnBlur = (busToMute, fadeTime = 0.3, engineInstance, onMute) => {
  if (engineInstance.disableBlur) {
    console.log(
      "this.disableBlur",
      engineInstance.disableBlur,
      "will return now"
    );
    return () => {
    };
  }
  const onVisibilityChange = (e) => {
    if (document.hidden) {
      engineInstance.setBusVolume(busToMute, 0, fadeTime);
      onMute && onMute(true);
    } else {
      engineInstance.setBusVolume(busToMute, 1, fadeTime);
      onMute && onMute(false);
    }
  };
  window.addEventListener("visibilitychange", onVisibilityChange);
  return () => {
    window.removeEventListener("visibilitychange", onVisibilityChange);
  };
};
const isWebkit = (UA) => /\b(iPad|iPhone|iPod)\b/.test(UA) && /WebKit/.test(UA) && !/Edge/.test(UA) && !window.MSStream;
const isMobile = (UA) => UA.match(/Mobi/);
const isSafari = (UA) => UA.match(/Safari/) && !UA.match(/Chrome/);
const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (err) => reject(err);
});
const decodeFileToBuffer = (ctx, file) => __async(void 0, null, function* () {
  const arrayBuffer = yield readFile(file);
  const audioBuffer = yield ctx.decodeAudioData(
    arrayBuffer
  );
  return audioBuffer;
});
const convertBufferToWave = (abuffer, len) => {
  const numOfChan = abuffer.numberOfChannels;
  const length = len * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;
  setUint32(1179011410);
  setUint32(length - 8);
  setUint32(1163280727);
  setUint32(544501094);
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(1635017060);
  setUint32(length - pos - 4);
  for (i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));
  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }
  return new Blob([buffer], { type: "audio/wav" });
  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
};
const shuffle = (array) => {
  let counter = array.length;
  let temp;
  let index2 = 0;
  while (counter--) {
    index2 = Math.random() * counter | 0;
    temp = array[counter];
    array[counter] = array[index2];
    array[index2] = temp;
  }
  return array;
};
const makeArray = (item) => {
  if (Array.isArray(item)) {
    return item;
  }
  return [item];
};
const bindAudioStart = (sceneManager2, rootElement) => __async(void 0, null, function* () {
  const initWebAudio = () => __async(void 0, null, function* () {
    try {
      yield sceneManager2.initializeAudioContext();
      rootElement.removeEventListener("touchend", initWebAudio);
      rootElement.removeEventListener("mousedown", initWebAudio);
    } catch (e) {
      console.warn(e, "could not initialize audio");
    }
  });
  if (!sceneManager2.audioIsInitialized) {
    rootElement.addEventListener("touchend", initWebAudio);
    rootElement.addEventListener("mousedown", initWebAudio);
  }
});
const getQuantizedToGrid = ({
  x,
  y,
  rows,
  columns,
  totalWidth,
  totalHeight,
  margin = 0
}) => {
  const width = Math.round(totalWidth - margin * 2);
  const height = Math.round(totalHeight - margin * 2);
  margin = Math.round(margin);
  const columnWidth = Math.round(width / columns);
  const rowWidth = Math.round(height / rows);
  const row = Math.floor((y - margin) / rowWidth);
  const column = Math.floor((x - margin) / columnWidth);
  const maxNoteValue = rows - 1;
  const invertedRow = Math.abs(row - maxNoteValue);
  return {
    x: column * columnWidth + margin,
    y: row * rowWidth + margin,
    row: invertedRow,
    column
  };
};
const Utils = {
  calculateDistance,
  getRangeBasedOnDistance,
  clip,
  invert,
  getContext,
  setMuteOnBlur,
  isWebkit,
  isMobile,
  isSafari,
  decodeFileToBuffer,
  convertBufferToWave,
  Smoother,
  MouseInteraction,
  unmuteIOS,
  makeArray,
  bindAudioStart,
  InteractiveLayerBase,
  getQuantizedToGrid
};
var ConfigAction = /* @__PURE__ */ ((ConfigAction2) => {
  ConfigAction2["UPDATE"] = "update";
  ConfigAction2["MOVE"] = "move";
  ConfigAction2["DELETE"] = "delete";
  ConfigAction2["CREATE"] = "create";
  return ConfigAction2;
})(ConfigAction || {});
class ConfigManager {
  constructor(config2) {
    this.updateListeners = [];
    this.config = config2;
  }
  load(newConfig) {
    this.config = newConfig;
  }
  setName(name) {
    this.config.name = name;
    return this.config.name;
  }
  addSource(source) {
    this.config.sources.push(source);
  }
  addInstrument(sceneName, configSound) {
    this.config.scenes[sceneName].sounds.push(configSound);
  }
  deleteInstrument(name) {
    const sceneName = name.split(":")[0];
    const instrumentName = name.split(":")[1];
    this.config.scenes[sceneName].sounds = this.config.scenes[sceneName].sounds.filter((sound) => sound.name !== instrumentName);
  }
  updateBus({
    bus,
    toUpdate = {},
    action = "update"
  }) {
    const busConfig = this.config.busses.find(
      (configBus) => configBus.name === bus
    );
    let updates = {};
    switch (action) {
      case "create":
        if (toUpdate.name && this.config.busses.filter((bus2) => bus2.name === toUpdate.name).length === 0) {
          this.config.busses.push(toUpdate);
          updates = toUpdate;
        }
        break;
      case "delete":
        const busToDelete = this.config.busses.find((b) => b.name === bus);
        this.config.busses = this.config.busses.filter((b) => b.name !== bus);
        this.config.busses.forEach((configBus) => {
          if (configBus.parent === bus) {
            this.updateBus({
              bus: configBus.name,
              toUpdate: { parent: busToDelete.parent },
              action: "update"
            });
          }
        });
        Object.values(this.config.scenes).forEach((scene) => {
          if (scene.bus === bus) {
            delete scene.bus;
          }
          scene.sounds.forEach((sound) => {
            if (sound.bus === bus) {
              delete sound.bus;
            }
          });
        });
        updates["name"] = bus;
      default:
        if (busConfig) {
          Object.keys(toUpdate).forEach((key) => {
            if (busConfig[key] === toUpdate[key]) {
              return;
            }
            const keyHasColon = key.split(":").length > 1;
            if (keyHasColon) {
              const [rootProperty, property] = key.split(":");
              if (rootProperty === "sendTo") {
                const sendToUpdate = busConfig.sends.find(
                  (send) => send.bus === property
                );
                if (sendToUpdate) {
                  sendToUpdate.gain = toUpdate[key];
                }
              } else {
                const effectToUpdate = busConfig.effects.find(
                  (effect) => effect.effectType.toLowerCase() === rootProperty
                );
                if (effectToUpdate) {
                  effectToUpdate.settings[property] = toUpdate[key];
                }
              }
              updates[key] = toUpdate[key];
            } else {
              busConfig[key] = toUpdate[key];
              updates[key] = busConfig[key];
            }
          });
        }
        if (toUpdate.name) {
          this.config.busses.forEach((configBus) => {
            if (configBus.parent === bus) {
              configBus.parent = toUpdate.name;
            }
          });
          Object.values(this.config.scenes).forEach((scene) => {
            if (scene.bus === bus) {
              scene.bus = toUpdate.name;
            }
            scene.sounds.forEach((sound) => {
              if (sound.bus === bus) {
                sound.bus = toUpdate.name;
              }
            });
          });
        }
        break;
    }
    const locationString = `busses.${bus}`;
    if (Object.keys(updates).length > 0) {
      this.onUpdate({ location: locationString, toUpdate: updates, action });
    }
    return updates;
  }
  updateSource({
    source,
    toUpdate = {},
    action = "update"
  }) {
    const sourceConfig = this.config.sources.find((s) => s.name === source);
    let updates = {};
    switch (action) {
      case "create":
        const _a = toUpdate, { buffer } = _a, sourceSettings = __objRest(_a, ["buffer"]);
        this.addSource(sourceSettings);
        updates = toUpdate;
        break;
      case "delete":
        this.config.sources = this.config.sources.filter(
          (s) => s.name !== source
        );
        updates = toUpdate;
      default:
        if (sourceConfig) {
          Object.keys(toUpdate).forEach((key) => {
            if (sourceConfig[key] === toUpdate[key]) {
              return;
            }
            sourceConfig[key] = toUpdate[key];
            updates[key] = sourceConfig[key];
          });
        }
        break;
    }
    const locationString = `sources.${source}`;
    if (Object.keys(updates).length > 0) {
      this.onUpdate({ location: locationString, toUpdate: updates, action });
    }
    return updates;
  }
  updateInstrument({
    instrument,
    toUpdate = {},
    action = "update"
  }) {
    const sceneName = instrument.split(":")[0];
    const instrumentName = instrument.split(":")[1];
    const instrumentConfig = this.config.scenes[sceneName].sounds.find(
      (sound) => sound.name === instrumentName
    );
    let updates = {};
    switch (action) {
      case "move":
        if (toUpdate.scene) {
          let newSceneName = toUpdate.scene;
          updates["scene"] = newSceneName;
          this.config.scenes[newSceneName].sounds.push(instrumentConfig);
          this.config.scenes[sceneName].sounds.splice(
            this.config.scenes[sceneName].sounds.findIndex(
              (sound) => sound.name === instrumentName
            ),
            1
          );
        }
        break;
      case "delete":
        this.config.scenes[sceneName].sounds = this.config.scenes[sceneName].sounds.filter((sound) => sound.name !== instrumentName);
        updates["name"] = instrumentName;
        break;
      case "create":
        const _a = toUpdate, { buffer } = _a, soundSettings = __objRest(_a, ["buffer"]);
        this.config.scenes[sceneName].sounds.push(
          soundSettings
        );
        const newSource = {
          name: soundSettings.sound
        };
        this.config.sources.push(newSource);
        updates = toUpdate;
        break;
      default:
        if (instrumentConfig) {
          Object.keys(toUpdate).forEach((key) => {
            if (instrumentConfig[key] === toUpdate[key]) {
              return;
            }
            instrumentConfig[key] = toUpdate[key];
            updates[key] = instrumentConfig[key];
          });
        }
        break;
    }
    const locationString = `scenes.${sceneName}.sounds.${instrumentName}`;
    if (Object.keys(updates).length > 0) {
      this.onUpdate({ location: locationString, toUpdate: updates, action });
    }
    return updates;
  }
  updateScene({
    scene,
    toUpdate = {},
    action = "update"
  }) {
    const updates = {};
    const sceneConfig = this.config.scenes[scene];
    switch (action) {
      case "delete":
        delete this.config.scenes[scene].sounds;
        updates["scene"] = scene;
        break;
      case "create":
        if (!sceneConfig) {
          this.config.scenes[scene] = { sounds: [] };
          updates["scene"] = scene;
        }
        break;
      case "update":
        if (sceneConfig) {
          Object.keys(toUpdate).forEach((key) => {
            if (sceneConfig[key] === toUpdate[key]) {
              return;
            }
            sceneConfig[key] = toUpdate[key];
            updates[key] = sceneConfig[key];
          });
        }
        break;
    }
    const locationString = `scenes.${scene}`;
    if (Object.keys(updates).length > 0) {
      this.onUpdate({ location: locationString, toUpdate: updates, action });
    }
    return updates;
  }
  cleanConfig(currentConfig) {
    const config2 = JSON.parse(JSON.stringify(currentConfig));
    config2.sources = config2.sources.map((source) => {
      if (source.file === source.name) {
        delete source.file;
      }
      return source;
    });
    config2.scenes = Object.entries(config2.scenes).reduce(
      (accum, [sceneName, scene]) => {
        const sceneBus = scene.bus;
        if (sceneBus) {
          const sounds = scene.sounds.map((sound) => {
            if (sound.bus === sceneBus) {
              delete sound.bus;
            }
            if (sound.type === "player") {
              delete sound.type;
            }
            return sound;
          });
          scene.sounds = sounds;
          accum[sceneName] = scene;
        } else {
          accum[sceneName] = scene;
        }
        return accum;
      },
      {}
    );
    this.removeUnusedSources(config2);
    return config2;
  }
  removeUnusedSources(config2) {
    const usedSources = /* @__PURE__ */ new Set();
    for (const scene of Object.values(config2.scenes)) {
      const sounds = scene.sounds;
      if (sounds && sounds.length) {
        for (const soundItem of sounds) {
          const soundProperty = soundItem.sound;
          if (typeof soundProperty === "string") {
            usedSources.add(soundProperty);
          } else if (Array.isArray(soundProperty)) {
            soundProperty.forEach((sound) => {
              if (typeof sound === "string") {
                usedSources.add(sound);
              }
            });
          } else if (typeof soundProperty === "object") {
            Object.values(soundProperty).forEach(
              (value) => usedSources.add(value)
            );
          }
        }
      }
    }
    for (const bus of config2.busses) {
      const effects = bus.effects;
      if (Array.isArray(effects)) {
        for (const effect of effects) {
          if (effect.settings && effect.settings.sound) {
            usedSources.add(effect.settings.sound);
          }
        }
      }
    }
    config2.sources = config2.sources.filter(
      (source) => usedSources.has(source.name)
    );
    return config2;
  }
  getCurrentConfig(busses, instrumentManager) {
    this.config.busses.forEach((bus) => {
      const klangBus = busses.get(bus.name);
      if (klangBus.channel.initialGain !== 1 && klangBus.channel.initialGain !== bus.gain) {
        bus.gain = klangBus.channel.initialGain;
      }
    });
    Object.entries(this.config.scenes).forEach(([sceneKey]) => {
      var _a;
      const scene = this.config.scenes[sceneKey];
      (_a = scene.sounds) == null ? void 0 : _a.forEach((sound) => {
        var _a2, _b, _c;
        const instrument = instrumentManager.getInstrument(
          `${sceneKey}:${sound.name}`
        );
        if (!instrument) {
          console.warn(`Could not find instrument ${sound.name}`);
          return;
        }
        if (((_a2 = instrument.channel) == null ? void 0 : _a2.initialGain) !== 1 && ((_b = instrument.channel) == null ? void 0 : _b.initialGain) !== sound.gain) {
          sound.gain = (_c = instrument.channel) == null ? void 0 : _c.initialGain;
        }
        if (instrument.settings.loop) {
          sound.loop = true;
        }
        if (instrument.settings.loopStart !== 0) {
          sound.loopStart = instrument.settings.loopStart;
        }
        if (instrument.settings.loopEnd !== 0) {
          sound.loopEnd = instrument.settings.loopEnd;
        }
        if (sound.type !== instrument.settings.type) {
          sound.type = instrument.settings.type;
        }
        if (sound.sound !== instrument.settings.sound) {
          sound.sound = instrument.settings.sound;
        }
      });
    });
    return this.cleanConfig(this.config);
  }
  setOnUpdate(listener) {
    if (this.updateListeners.indexOf(listener) === -1) {
      this.updateListeners.push(listener);
    }
  }
  onUpdate(update) {
    this.updateListeners.forEach((listener) => {
      listener(update);
    });
  }
}
class BufferManager {
  constructor(sources, baseFilePath = "/") {
    this.supportedLanguages = ["en"];
    this.baseFilePath = baseFilePath;
    this.buffersInProgress = /* @__PURE__ */ new Map();
    this.sources = /* @__PURE__ */ new Map();
    sources.forEach((sound) => {
      this.sources.set(sound.name, sound);
    });
    this.buffers = /* @__PURE__ */ new Map();
  }
  setConfigManager(configManager) {
    this.config = configManager;
    this.config.setOnUpdate(this.onConfigUpdate.bind(this));
  }
  addSources(sources) {
    sources.forEach((source) => {
      this.addSource(source);
    });
  }
  addSource(source, buffer) {
    if (buffer) {
      this.setSoundBuffer(source.name, buffer);
    }
    this.sources.set(source.name, source);
    return source;
  }
  getSource(name) {
    return this.sources.get(name);
  }
  getSoundBuffer(name, localized = false) {
    return __async(this, null, function* () {
      const existingBuffer = this.buffers.get(name);
      if (existingBuffer) {
        return Promise.resolve(existingBuffer);
      }
      if (this.buffersInProgress.get(name)) {
        return this.buffersInProgress.get(name);
      }
      const sound = this.sources.get(name);
      if (sound === void 0) {
        window.AE_DEBUG && console.warn("Sound:", name, "is not defined in the source list.");
      }
      if (!sound.file) {
        sound.file = sound.name;
      }
      let bufferPath;
      if (localized) {
        const language = this.getLocalizedPathName();
        if (language) {
          bufferPath = `${this.baseFilePath}${language}/${sound.file}`;
        } else {
          console.warn(
            "BufferManager: Couldn't resolve localized path for",
            sound.file
          );
          bufferPath = `${this.baseFilePath}${sound.file}`;
        }
      } else {
        bufferPath = `${this.baseFilePath}${sound.file}`;
      }
      const extension = ".[ogg|mp3]";
      const toneBufferPromise = ToneAudioBuffer.load(`${bufferPath}${extension}`);
      this.buffersInProgress.set(name, toneBufferPromise);
      const toneBuffer = yield toneBufferPromise;
      if (toneBuffer) {
        this.buffers.set(name, toneBuffer);
      }
      this.buffersInProgress.delete(name);
      return toneBuffer;
    });
  }
  getLocalizedPathName() {
    const language = this.language || navigator.language;
    let languageToUse = null;
    if (this.supportedLanguages.includes(language)) {
      languageToUse = language;
    } else {
      languageToUse = "en";
    }
    if (!languageToUse) {
      languageToUse = this.defaultLanguage;
    }
    return languageToUse;
  }
  onConfigUpdate(update) {
    const { location, toUpdate, action } = update;
    if (location.match(/^sources\./)) {
      const hierarchy = location.split(".");
      const sourceName = hierarchy[1];
      switch (action) {
        case ConfigAction.CREATE:
          this.addSource(toUpdate, toUpdate.buffer);
          break;
        case ConfigAction.DELETE:
          this.removeSource(sourceName);
          break;
        case ConfigAction.UPDATE:
          this.updateSource(sourceName, toUpdate);
      }
    } else if (location.match(/^scenes\./)) {
      const hierarchy = location.split(".");
      if (hierarchy.length > 3 && hierarchy[2] === "sounds") {
        const soundName = hierarchy[3];
        const sourceName = toUpdate.source || soundName;
        switch (action) {
          case ConfigAction.CREATE:
            if (!this.buffers.has(sourceName)) {
              this.addSource(toUpdate, toUpdate.buffer);
            }
            break;
          case ConfigAction.DELETE:
            break;
        }
      }
    }
  }
  updateSource(name, update) {
  }
  setSoundBuffer(name, buffer) {
    this.buffers.set(name, buffer);
  }
  removeSource(sourceName) {
    this.sources.delete(sourceName);
  }
  deleteSoundBuffer(name) {
    this.buffers.delete(name);
  }
  empty() {
    this.buffers.forEach((_, key) => this.deleteSoundBuffer(key));
  }
  setBaseFilePath(path) {
    this.baseFilePath = path;
  }
  setSupportedLanguages(supportedLanguages) {
    this.supportedLanguages = supportedLanguages;
  }
  setDefaultLanguage(defaultLanguage) {
    this.defaultLanguage = defaultLanguage;
  }
  setLanguage(language) {
    this.language = language;
  }
  exportAllBuffers() {
    return Array.from(this.buffers).map(([name, buffer]) => [
      name,
      convertBufferToWave(buffer, buffer.length)
    ]);
  }
}
const getWarped = (value, warp) => {
  let processFunc = (val) => val;
  if (typeof warp === "string") {
    switch (warp) {
      case "exp":
        processFunc = (val) => __pow(val, 2);
        break;
      case "cubic":
        processFunc = (val) => __pow(val, 3);
        break;
    }
  } else if (typeof warp === "function") {
    processFunc = warp;
  }
  return processFunc(value);
};
const getMapped = (value, min, max) => {
  const range2 = Math.abs(max - min);
  return value * range2 + min;
};
const panSpec = {
  definition: {
    default: 0,
    min: -1,
    max: 1
  },
  process: (value) => value * 2 - 1
};
const booleanSpec = {
  definition: {
    default: false
  },
  process: (value) => !!value
};
const defaultDefinition = {
  default: 0,
  warp: "linear",
  min: 0,
  max: 1
};
const _ControlSpec = class _ControlSpec2 {
  constructor(definition) {
    this.definition = __spreadValues(__spreadValues({}, defaultDefinition), definition);
  }
  process(value) {
    const { warp, min = 0, max = 1 } = this.definition;
    let processedValue = value;
    if (warp) {
      processedValue = getWarped(value, warp);
    }
    if (typeof value === "number") {
      processedValue = getMapped(value, min, max);
    }
    return processedValue;
  }
};
_ControlSpec.PAN = panSpec;
_ControlSpec.BOOLEAN = booleanSpec;
let ControlSpec = _ControlSpec;
class Param2 {
  constructor({
    name,
    set,
    controlSpec
  }) {
    this.controlSpec = controlSpec || new ControlSpec({});
    this.name = name;
    this._rawValue = this.controlSpec.definition.default;
    this.setCallback = set;
  }
  get rawValue() {
    return this._rawValue;
  }
  set(value, options) {
    const mappedValue = this.controlSpec.process(value);
    this._rawValue = mappedValue;
    this.setCallback(mappedValue, options);
    return this;
  }
  setRaw(value, options) {
    if (value === "default" || value == null) {
      value = this.controlSpec.definition.default;
    }
    this._rawValue = value;
    this.setCallback(value, options);
  }
}
const getGainParam = (scope) => new Param2({
  name: "gain",
  set: (value, { fadeTime = 0, startTime } = {}) => scope.channel.setGain(value, fadeTime, startTime)
});
const getRateParam = (scope) => new Param2({
  name: "rate",
  set: (value) => scope.player.playbackRate = value,
  controlSpec: new ControlSpec({
    default: 1,
    min: 0,
    max: 3
  })
});
const getPanParam = (scope) => new Param2({
  name: "pan",
  set: (value) => scope.channel.setPosition(value)
});
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== "undefined" && typeof msCrypto.getRandomValues === "function" && msCrypto.getRandomValues.bind(msCrypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
const REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
function validate(uuid) {
  return typeof uuid === "string" && REGEX.test(uuid);
}
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).substr(1));
}
function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  return stringify(rnds);
}
const createWaveShaper = (shaperFunction, size = 1024 * 4) => {
  const shaper = new WaveShaper(shaperFunction);
  return shaper;
};
const WaveShapers = {
  bottomOut: (bottomBalance = 1) => createWaveShaper(
    (val) => clip(val * 2 - bottomBalance, 0, 1),
    1024 * 4
  )
};
class LFO2 {
  constructor(settings, paramName) {
    this.name = "lfo";
    this.uuid = v4();
    this.params = /* @__PURE__ */ new Map();
    const {
      frequency = 2,
      min = 0,
      max = 1,
      waveshaper = void 0,
      type = void 0,
      phase = 0
    } = settings;
    const lfo = new LFO$1(frequency, min, max);
    if (type) {
      lfo.type = type;
    }
    if (phase) {
      lfo.phase = phase;
    }
    if (waveshaper) {
      const { sparseness } = waveshaper;
      const bottomOutShaper = WaveShapers.bottomOut(sparseness);
      connect(lfo, bottomOutShaper);
      this.modulator = bottomOutShaper;
    } else {
      this.modulator = lfo;
    }
    lfo.start();
    const lfoParamName = `${paramName}-lfo-frequency`;
    this.params.set(
      lfoParamName,
      new Param2({
        name: lfoParamName,
        set: (value) => lfo.set({ frequency: value }),
        controlSpec: new ControlSpec({
          min: 0.05,
          max: 20,
          default: lfo.frequency
        })
      })
    );
    const lfoParamMinName = `${paramName}-lfo-min`;
    this.params.set(
      lfoParamMinName,
      new Param2({
        name: lfoParamMinName,
        set: (value) => lfo.set({ min: value }),
        controlSpec: new ControlSpec({
          min,
          max,
          default: lfo.min
        })
      })
    );
    const lfoParamMaxName = `${paramName}-lfo-max`;
    this.params.set(
      lfoParamMaxName,
      new Param2({
        name: lfoParamMaxName,
        set: (value) => lfo.set({ max: value }),
        controlSpec: new ControlSpec({
          min,
          max,
          default: lfo.max
        })
      })
    );
  }
  setParam(paramName, value, options) {
    this.params.get(paramName).set(value, options);
  }
  play(when, duration) {
    this.modulator.start(when);
  }
  connect(node) {
    this.modulator.connect(node);
  }
  disconnect() {
    this.modulator.disconnect();
  }
  dispose() {
    this.disconnect();
    this.modulator.dispose();
  }
}
let Envelope$1 = class Envelope2 {
  constructor(settings, paramName) {
    this.name = "envelope";
    this.uuid = v4();
    this.params = /* @__PURE__ */ new Map();
    this.modulator = new Envelope$2(settings);
    const attack = `${this.name}-env-attack`;
    this.params.set(
      attack,
      new Param2({
        name: attack,
        set: (value) => this.modulator.attack = value,
        controlSpec: new ControlSpec({
          min: 0,
          max: 20,
          default: this.modulator.attack.value
        })
      })
    );
    const decay = `${this.name}-env-decay`;
    this.params.set(
      decay,
      new Param2({
        name: decay,
        set: (value) => this.modulator.decay = value,
        controlSpec: new ControlSpec({
          min: 0,
          max: 2,
          default: this.modulator.decay.value
        })
      })
    );
    const sustain = `${this.name}-env-sustain`;
    this.params.set(
      sustain,
      new Param2({
        name: sustain,
        set: (value) => this.modulator.sustain = value,
        controlSpec: new ControlSpec({
          min: 0,
          max: 1,
          default: this.modulator.sustain.value
        })
      })
    );
    const release = `${this.name}-env-release`;
    this.params.set(
      release,
      new Param2({
        name: release,
        set: (value) => this.modulator.release = value,
        controlSpec: new ControlSpec({
          min: 0,
          max: 20,
          default: this.modulator.release.value
        })
      })
    );
  }
  setParam(paramName, value, options) {
    this.params.get(paramName).set(value, options);
  }
  play(when, duration) {
    this.modulator.triggerAttackRelease(duration, when);
  }
  connect(node) {
    this.modulator.connect(node);
  }
  disconnect() {
    this.modulator.disconnect();
  }
  dispose() {
    this.disconnect();
    this.modulator.dispose();
  }
};
class Envelope3 {
  constructor(settings, paramName) {
    this.name = "envelope";
    this.uuid = v4();
    this.params = /* @__PURE__ */ new Map();
    this.modulator = new FrequencyEnvelope(settings);
    const attack = `${this.name}-env-attack`;
    this.params.set(
      attack,
      new Param2({
        name: attack,
        set: (value) => this.modulator.attack = value,
        controlSpec: new ControlSpec({
          min: 0,
          max: 20,
          default: this.modulator.attack
        })
      })
    );
    const decay = `${this.name}-env-decay`;
    this.params.set(
      decay,
      new Param2({
        name: decay,
        set: (value) => this.modulator.decay = value,
        controlSpec: new ControlSpec({
          min: 0,
          max: 2,
          default: this.modulator.decay
        })
      })
    );
    const sustain = `${this.name}-env-sustain`;
    this.params.set(
      sustain,
      new Param2({
        name: sustain,
        set: (value) => this.modulator.sustain = value,
        controlSpec: new ControlSpec({
          min: 0,
          max: 1,
          default: this.modulator.sustain
        })
      })
    );
    const release = `${this.name}-env-release`;
    this.params.set(
      release,
      new Param2({
        name: release,
        set: (value) => this.modulator.release = value,
        controlSpec: new ControlSpec({
          min: 0,
          max: 20,
          default: this.modulator.release
        })
      })
    );
    const filterBaseFrequency = `${this.name}-env-base-frequency`;
    this.params.set(
      filterBaseFrequency,
      new Param2({
        name: filterBaseFrequency,
        set: (value) => this.modulator.baseFrequency = value,
        controlSpec: new ControlSpec({
          min: 10,
          max: 4e3,
          default: this.modulator.baseFrequency,
          warp: "exp"
        })
      })
    );
    const filterEnvOctaves = `${this.name}-env-octaves`;
    this.params.set(
      filterEnvOctaves,
      new Param2({
        name: filterEnvOctaves,
        set: (value) => this.modulator.octaves = value,
        controlSpec: new ControlSpec({
          min: 0,
          max: 10,
          default: this.modulator.octaves,
          step: 1
        })
      })
    );
  }
  setParam(paramName, value, options) {
    this.params.get(paramName).set(value, options);
  }
  play(when, duration) {
    this.modulator.cancel(when);
    this.modulator.triggerAttackRelease(duration, when);
  }
  connect(node) {
    this.modulator.connect(node);
  }
  disconnect() {
    this.modulator.disconnect();
  }
  dispose() {
    this.disconnect();
    this.modulator.dispose();
  }
}
const getModulator = (key) => key ? ModulatorTypes[key.toLowerCase()] : LFO2;
const ModulatorTypes = {
  lfo: LFO2,
  envelope: Envelope$1,
  frequencyenvelope: Envelope3
};
let LPF$1 = class LPF {
  constructor(settings) {
    this.name = "lpf";
    this.uuid = v4();
    this.params = /* @__PURE__ */ new Map();
    const { frequency = 17e3, Q = 1 } = settings;
    this.modulators = [];
    const filter = new Filter(frequency, "lowpass");
    if (Q) {
      filter.Q.value = Q;
    }
    this.effectInstance = filter;
    Object.entries(settings).forEach(([settingKey, value]) => {
      if (typeof value === "object") {
        const modulatorSettings = value;
        const { type } = modulatorSettings;
        const modSettings = modulatorSettings.settings;
        const Modulator = getModulator(type);
        const modulator = new Modulator(modSettings, settingKey);
        modulator.connect(this.effectInstance[settingKey]);
        this.modulators.push(modulator);
      }
    });
    this.initParams();
    this.setModulatorParams();
  }
  setModulatorParams() {
    this.modulators.forEach((modulator) => {
      const { params } = modulator;
      params.forEach((param) => {
        this.params.set(`${this.name}:${param.name}`, param);
      });
    });
  }
  initParams() {
    this.params = new Map(
      [
        new Param2({
          name: "frequency",
          set: (value, { fadeTime = 0.01 } = {}) => {
            this.effectInstance.frequency.cancelScheduledValues(0);
            this.effectInstance.frequency.setTargetAtTime(value, 0, fadeTime);
          },
          controlSpec: new ControlSpec({
            min: 0.1,
            max: 2e4,
            warp: "exp",
            default: this.effectInstance.frequency.value
          })
        }),
        new Param2({
          name: "Q",
          set: (value, { fadeTime = 0.01 } = {}) => {
            this.effectInstance.Q.cancelScheduledValues(0);
            this.effectInstance.Q.setTargetAtTime(value, 0, fadeTime);
          },
          controlSpec: new ControlSpec({
            min: 0,
            max: 30,
            default: this.effectInstance.Q.value
          })
        })
      ].map((param) => [param.name, param])
    );
  }
  setParam(paramName, value, options) {
    this.params.get(paramName).set(value, options);
  }
  setRawParam(paramName, value, options) {
    this.params.get(paramName).setRaw(value, options);
  }
  disconnect() {
    this.effectInstance.disconnect();
    this.modulators.forEach((modulator) => {
      modulator.disconnect();
    });
  }
  dispose() {
    this.disconnect();
    this.effectInstance.dispose();
    this.modulators.forEach((modulator) => {
      modulator.dispose();
    });
  }
};
class HPF {
  constructor(settings) {
    this.name = "hpf";
    this.uuid = v4();
    this.params = /* @__PURE__ */ new Map();
    const { frequency = 200, Q = 1 } = settings;
    this.modulators = [];
    const filter = new Filter(frequency, "highpass");
    if (Q) {
      filter.Q.value = Q;
    }
    this.effectInstance = filter;
    Object.entries(settings).forEach(([settingKey, value]) => {
      if (typeof value === "object") {
        const modulatorSettings = value;
        const { type } = modulatorSettings;
        const modSettings = modulatorSettings.settings;
        const Modulator = getModulator(type);
        const modulator = new Modulator(modSettings);
        modulator.connect(this.effectInstance[settingKey]);
        this.modulators.push(modulator);
      }
    });
    this.initParams();
  }
  initParams() {
    this.params = new Map(
      [
        new Param2({
          name: "frequency",
          set: (value, { fadeTime = 0.01 } = {}) => {
            this.effectInstance.frequency.cancelScheduledValues(0);
            this.effectInstance.frequency.setTargetAtTime(value, 0, fadeTime);
          },
          controlSpec: new ControlSpec({
            min: 0.1,
            max: 2e4,
            warp: "exp",
            default: this.effectInstance.frequency.value
          })
        }),
        new Param2({
          name: "Q",
          set: (value, { fadeTime = 0.01 } = {}) => {
            this.effectInstance.Q.cancelScheduledValues(0);
            this.effectInstance.Q.setTargetAtTime(value, 0, fadeTime);
          },
          controlSpec: new ControlSpec({
            min: 0,
            max: 30,
            default: this.effectInstance.Q.value
          })
        })
      ].map((param) => [param.name, param])
    );
  }
  setParam(paramName, value, options) {
    this.params.get(paramName).set(value, options);
  }
  setRawParam(paramName, value, options) {
    this.params.get(paramName).setRaw(value, options);
  }
  disconnect() {
    this.effectInstance.disconnect();
    this.modulators.forEach((modulator) => {
      modulator.disconnect();
    });
  }
  dispose() {
    this.disconnect();
    this.effectInstance.dispose();
    this.modulators.forEach((modulator) => {
      modulator.dispose();
    });
  }
}
class BPF {
  constructor(settings) {
    this.name = "bpf";
    this.uuid = v4();
    this.params = /* @__PURE__ */ new Map();
    const { frequency } = settings;
    this.frequency = frequency || 17e3;
    this.Q = settings && settings.Q || 1;
    this.modulators = [];
    const filter = new Filter(this.frequency, "bandpass");
    if (this.Q) {
      filter.Q.value = this.Q;
    }
    this.effectInstance = filter;
    Object.entries(settings).forEach(([settingKey, value]) => {
      if (typeof value === "object") {
        const modulatorSettings = value;
        const { type } = modulatorSettings;
        const modSettings = modulatorSettings.settings;
        const Modulator = getModulator(type);
        const modulator = new Modulator(modSettings);
        modulator.connect(this.effectInstance[settingKey]);
        this.modulators.push(modulator);
      }
    });
    this.initParams();
  }
  initParams() {
    this.params = new Map(
      [
        new Param2({
          name: "frequency",
          set: (value, { fadeTime = 0.01 } = {}) => {
            this.effectInstance.frequency.cancelScheduledValues(0);
            this.effectInstance.frequency.setTargetAtTime(value, 0, fadeTime);
          },
          controlSpec: new ControlSpec({
            min: 0.1,
            max: 2e4,
            warp: "exp",
            default: this.effectInstance.frequency.value
          })
        }),
        new Param2({
          name: "Q",
          set: (value, { fadeTime = 0.01 } = {}) => {
            this.effectInstance.Q.cancelScheduledValues(0);
            this.effectInstance.Q.setTargetAtTime(value, 0, fadeTime);
          },
          controlSpec: new ControlSpec({
            min: 0,
            max: 30,
            default: this.effectInstance.Q.value
          })
        })
      ].map((param) => [param.name, param])
    );
  }
  setParam(paramName, value, options) {
    this.params.get(paramName).set(value, options);
  }
  setRawParam(paramName, value, options) {
    this.params.get(paramName).setRaw(value, options);
  }
  disconnect() {
    this.effectInstance.disconnect();
    this.modulators.forEach((modulator) => {
      modulator.disconnect();
    });
  }
  dispose() {
    this.disconnect();
    this.effectInstance.dispose();
    this.modulators.forEach((modulator) => {
      modulator.dispose();
    });
  }
}
class Reverb {
  constructor(settings, resolveSources) {
    this.uuid = v4();
    this.modulators = [];
    this.name = "reverb";
    this.params = /* @__PURE__ */ new Map();
    const reverb = new Convolver();
    if (settings && settings.sound) {
      resolveSources && resolveSources().then((buffers) => {
        if (buffers.length) {
          reverb.buffer = buffers[0];
        }
      });
    }
    this.effectInstance = reverb;
    this.initParams();
  }
  initParams() {
    this.params = /* @__PURE__ */ new Map();
  }
  setParam(paramName, value, options) {
    this.params.get(paramName).set(value, options);
  }
  disconnect() {
    this.effectInstance.disconnect();
  }
  dispose() {
    this.disconnect();
    this.effectInstance.dispose();
  }
}
class PingPong {
  constructor(settings) {
    this.uuid = v4();
    this.name = "pingpong";
    this.params = /* @__PURE__ */ new Map();
    const delayTime = settings && settings.delayTime || "8n";
    const feedback = settings && settings.feedback !== void 0 ? settings.feedback : 0.5;
    const pingPong = new PingPongDelay({ delayTime, feedback, maxDelay: 3 });
    this.effectInstance = pingPong;
    this.modulators = [];
    this.initParams();
    Object.entries(settings).forEach(([settingKey, value]) => {
      if (typeof value === "object") {
        const modulatorSettings = value;
        const Modulator = getModulator(modulatorSettings.type);
        const modulator = new Modulator(modulatorSettings);
        modulator.connect(this.effectInstance[settingKey]);
        this.modulators.push(modulator);
      }
    });
  }
  setParam(paramName, value, options) {
    this.params.get(paramName).set(value, options);
  }
  initParams() {
    this.params = new Map(
      [
        new Param2({
          name: "delayTime",
          set: (value) => this.effectInstance.delayTime.setValueAtTime(value),
          controlSpec: new ControlSpec({
            min: 1e-3,
            max: 20,
            default: this.effectInstance.delayTime.value
          })
        }),
        new Param2({
          name: "feedback",
          set: (value) => this.effectInstance.feedback.setValueAtTime(value),
          controlSpec: new ControlSpec({
            min: 0,
            max: 1,
            default: this.effectInstance.feedback.value
          })
        })
      ].map((param) => [param.name, param])
    );
  }
  disconnect() {
    this.effectInstance.disconnect();
    this.modulators.forEach((modulator) => {
      modulator.disconnect();
    });
  }
  dispose() {
    this.disconnect();
    this.effectInstance.dispose();
    this.modulators.forEach((modulator) => {
      modulator.dispose();
    });
  }
}
class LPF2 {
  constructor(settings) {
    this.name = "eq";
    this.uuid = v4();
    this.params = /* @__PURE__ */ new Map();
    const {
      high = 0,
      highFrequency = 5e3,
      low = 0,
      lowFrequency = 100,
      mid = 0
    } = settings;
    this.modulators = [];
    const filter = new EQ3({ high, highFrequency, low, lowFrequency, mid });
    this.effectInstance = filter;
    Object.entries(settings).forEach(([settingKey, value]) => {
      if (typeof value === "object") {
        const modulatorSettings = value;
        const { type } = modulatorSettings;
        const modSettings = modulatorSettings.settings;
        const Modulator = getModulator(type);
        const modulator = new Modulator(modSettings, settingKey);
        modulator.connect(this.effectInstance[settingKey]);
        this.modulators.push(modulator);
      }
    });
    this.initParams();
    this.setModulatorParams();
  }
  setModulatorParams() {
    this.modulators.forEach((modulator) => {
      const { params } = modulator;
      params.forEach((param) => {
        this.params.set(`${this.name}:${param.name}`, param);
      });
    });
  }
  initParams() {
    this.params = new Map(
      [
        new Param2({
          name: "high",
          set: (value, { fadeTime = 0.01 } = {}) => {
            this.effectInstance.high.cancelScheduledValues(0);
            this.effectInstance.high.setTargetAtTime(value, 0, fadeTime);
          },
          controlSpec: new ControlSpec({
            min: -99,
            max: 20,
            warp: "exp",
            default: this.effectInstance.high.value
          })
        }),
        new Param2({
          name: "highFrequency",
          set: (value, { fadeTime = 0.01 } = {}) => {
            this.effectInstance.highFrequency.cancelScheduledValues(0);
            this.effectInstance.highFrequency.setTargetAtTime(
              value,
              0,
              fadeTime
            );
          },
          controlSpec: new ControlSpec({
            min: 1,
            max: 2e4,
            warp: "exp",
            default: this.effectInstance.highFrequency.value
          })
        }),
        new Param2({
          name: "low",
          set: (value, { fadeTime = 0.01 } = {}) => {
            this.effectInstance.low.cancelScheduledValues(0);
            this.effectInstance.low.setTargetAtTime(value, 0, fadeTime);
          },
          controlSpec: new ControlSpec({
            min: -99,
            max: 20,
            warp: "exp",
            default: this.effectInstance.low.value
          })
        }),
        new Param2({
          name: "lowFrequency",
          set: (value, { fadeTime = 0.01 } = {}) => {
            this.effectInstance.lowFrequency.cancelScheduledValues(0);
            this.effectInstance.lowFrequency.setTargetAtTime(
              value,
              0,
              fadeTime
            );
          },
          controlSpec: new ControlSpec({
            min: 1,
            max: 2e4,
            warp: "exp",
            default: this.effectInstance.lowFrequency.value
          })
        }),
        new Param2({
          name: "mid",
          set: (value, { fadeTime = 0.01 } = {}) => {
            this.effectInstance.mid.cancelScheduledValues(0);
            this.effectInstance.mid.setTargetAtTime(value, 0, fadeTime);
          },
          controlSpec: new ControlSpec({
            min: -99,
            max: 20,
            warp: "exp",
            default: this.effectInstance.mid.value
          })
        })
      ].map((param) => [param.name, param])
    );
  }
  setParam(paramName, value, options) {
    this.params.get(paramName).set(value, options);
  }
  setRawParam(paramName, value, options) {
    this.params.get(paramName).setRaw(value, options);
  }
  disconnect() {
    this.effectInstance.disconnect();
    this.modulators.forEach((modulator) => {
      modulator.disconnect();
    });
  }
  dispose() {
    this.disconnect();
    this.effectInstance.dispose();
    this.modulators.forEach((modulator) => {
      modulator.dispose();
    });
  }
}
const getEffect = (key) => key ? EffectTypes[key.toLowerCase()] : LPF$1;
const EffectTypes = {
  lpf: LPF$1,
  bpf: BPF,
  hpf: HPF,
  reverb: Reverb,
  pingpong: PingPong,
  eq: LPF2
};
const PanningModes = {
  STEREO: "stereo",
  MONO: "mono",
  THREED: "3d"
};
const defaultSettings = {
  gain: 1,
  spatial: {
    isPositional: PanningModes.STEREO,
    refDistance: 9,
    rolloffFactor: 5
  }
};
class Channel2 {
  constructor(node, settings, resolveSources) {
    this.params = /* @__PURE__ */ new Map();
    this.isStatic = false;
    this.pannerPosition = null;
    this.sends = {};
    this.maxAudibleDistance = 40;
    this.isPositional = PanningModes.STEREO;
    settings = __spreadValues(__spreadValues({}, defaultSettings), settings);
    settings.spatial = __spreadValues(__spreadValues({}, defaultSettings.spatial), settings.spatial);
    this.resolveSources = resolveSources;
    const { spatial, gain } = settings;
    this.initialGain = gain !== void 0 && typeof gain === "number" ? gain : 1;
    this.effects = [];
    this.modulators = [];
    this.isStatic = (spatial == null ? void 0 : spatial.static) || (spatial == null ? void 0 : spatial.doesNotMove);
    this.isPositional = spatial == null ? void 0 : spatial.mode;
    this.maxAudibleDistance = (spatial == null ? void 0 : spatial.maxAudibleDistance) || 40;
    this.initParams();
    const firstNode = this.setupAudioGraph(this.isPositional, settings);
    this.setupEffects(settings.effects || [], firstNode);
    this.gainSignal = new Signal({
      value: this.initialGain
    }).connect(this.gain.gain);
    if (node) {
      this.add(node);
    }
  }
  initParams() {
    this.params = new Map(
      [
        new Param2({
          name: "gain",
          set: (value, options) => this.setGain(value, options == null ? void 0 : options.fadeTime, options == null ? void 0 : options.when),
          controlSpec: new ControlSpec({
            min: 0,
            max: 3,
            default: this.initialGain
          })
        }),
        new Param2({
          name: "pan",
          set: (value) => this.setPosition(value),
          controlSpec: new ControlSpec({ min: -1, max: 1, default: 0 })
        })
      ].map((param) => [param.name, param])
    );
  }
  setupAudioGraph(isPositional = PanningModes.STEREO, settings) {
    const {
      spatial: { refDistance, rolloffFactor }
    } = settings;
    this.muteGain = new Gain(1);
    this.gain = new Gain(0);
    if (typeof settings.gain === "object") {
      this.modulatorGain = new Gain(1);
      this.createModulator(settings.gain, this.modulatorGain.gain);
      this.modulatorGain.connect(this.gain);
    }
    let panner;
    if (isPositional === PanningModes.THREED) {
      panner = new Panner3D({
        panningModel: "equalpower",
        refDistance,
        rolloffFactor
      });
      this.panner = panner;
    } else if (isPositional === PanningModes.MONO) {
      panner = new Panner();
      this.panner = panner;
    } else {
      this.panner = new Gain(1);
    }
    return this.panner;
  }
  createModulator(modulatorSettings, node) {
    const { type, settings } = modulatorSettings;
    const ModulatorClass = getModulator(type);
    const modulator = new ModulatorClass(settings);
    modulator.connect(node);
    this.modulators.push(modulator);
  }
  setupEffects(effects, node) {
    for (let i = 0; i < effects.length; i++) {
      const fxSettings = effects[i];
      const effect = this.createEffect(fxSettings);
      if (effect) {
        node.connect(effect.effectInstance);
        node = effect.effectInstance;
        this.effects.push(effect);
        this.addEffectParams(effect);
      }
    }
    node.connect(this.muteGain);
    if (this.modulatorGain) {
      this.muteGain.connect(this.modulatorGain);
    } else {
      this.muteGain.connect(this.gain);
    }
  }
  addEffectParams(effect) {
    const { params, name } = effect;
    params.forEach((param) => {
      this.params.set(`${name}:${param.name}`, param);
    });
  }
  createEffect(fxSettings) {
    const { effectType, settings = {} } = fxSettings;
    const EffectClass = getEffect(effectType);
    if (EffectClass === void 0) {
      window.AE_DEBUG && console.warn("can't find effectType:", effectType);
      return null;
    }
    const effect = new EffectClass(settings, this.resolveSources);
    return effect;
  }
  add(node) {
    node.connect(this.panner);
    this.node = node;
  }
  addSend(bus, options) {
    const { gain = 0 } = options;
    const sendGain = new Gain();
    sendGain.gain.value = typeof gain === "number" ? gain : 0;
    if (options.pre) {
      this.node.connect(sendGain);
    } else {
      this.gain.connect(sendGain);
    }
    sendGain.connect(bus.input);
    this.sends[bus.settings.name] = sendGain;
    const sendName = `sendTo:${bus.settings.name}`;
    this.params.set(
      sendName,
      new Param2({
        name: sendName,
        set: (value, options2) => this.setSendGain(
          bus.settings.name,
          value,
          options2 == null ? void 0 : options2.fadeTime,
          options2 == null ? void 0 : options2.when
        ),
        controlSpec: new ControlSpec({
          min: 0,
          max: 1,
          default: sendGain.gain.value
        })
      })
    );
    if (typeof gain === "object") {
      this.createModulator(gain, sendGain.gain);
    }
  }
  connect(destination, outputNumber = 0, inputNumber = 0) {
    this.gain.connect(destination, outputNumber, inputNumber);
  }
  disconnect() {
    this.gain.disconnect();
  }
  updateDestination(newDestination) {
    this.disconnect();
    this.connect(newDestination);
  }
  setMuteState(shouldMute, options) {
    let fadeTime = 0.2;
    if (options && options.fadeTime) {
      ({ fadeTime } = options);
    }
    if (shouldMute) {
      this.muteGain.gain.rampTo(0, fadeTime);
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), fadeTime);
      });
    }
    this.muteGain.gain.rampTo(1, fadeTime);
    return new Promise((resolve) => {
      setTimeout(() => resolve(false), fadeTime);
    });
  }
  setPosition(x, y, z) {
    if (this.isPositional === "3d" && this.isStatic && !this.pannerPosition) {
      this.panner.setPosition(x, y, z);
      this.pannerPosition = [x, y, z];
    } else if (this.isPositional === "3d" && !this.isStatic) {
      this.panner.setPosition(x, y, z);
      this.pannerPosition = [x, y, z];
    } else if (this.isPositional === "mono") {
      this.panner.set({ pan: x });
      this.pannerPosition = [x, 0, 0];
    }
  }
  getPosition() {
    if (this.isPositional) {
      const panner2 = this.panner;
      return {
        x: panner2.positionX.value,
        y: panner2.positionY.value,
        z: panner2.positionZ.value
      };
    }
    const panner = this.panner;
    return { x: panner.pan.value, y: 0, z: 0 };
  }
  resetPosition() {
    this.pannerPosition = null;
  }
  setGain(gain, fadeTime, when) {
    fadeTime = fadeTime || 0;
    when = when || 0;
    this.gainSignal.cancelAndHoldAtTime(now() + when);
    this.gainSignal.rampTo(gain * this.initialGain, fadeTime, now() + when);
  }
  setInitialGain(gain) {
    this.initialGain = gain;
  }
  getGain() {
    return this.gainSignal.value;
  }
  setSendGain(busName, gain, fadeTime, when) {
    fadeTime = fadeTime || 0;
    when = when || 0;
    const bus = this.sends[busName];
    if (bus) {
      bus.gain.cancelAndHoldAtTime(now());
      bus.gain.rampTo(gain, fadeTime, now() + when);
    }
  }
  resetGain(fadeTime) {
    fadeTime = fadeTime || 0;
    this.gainSignal.cancelAndHoldAtTime(now());
    this.gainSignal.rampTo(this.initialGain, fadeTime, now());
  }
  fadeIn(fadeTime, when = 0, gain, options) {
    const newGain = gain == null ? 1 : gain;
    const fadeFromZero = options && options.fadeFromZero || false;
    const exactTime = options && options.exactTime || false;
    when = exactTime ? when : now() + when;
    this.gainSignal.cancelAndHoldAtTime(when);
    if (fadeFromZero) {
      this.gainSignal.setValueAtTime(0, when);
    }
    this.gainSignal.rampTo(newGain * this.initialGain, fadeTime, when);
  }
  fadeOut(fadeTime, when = 0, onComplete, exactTime = false) {
    when = exactTime ? when : now() + when;
    this.gainSignal.cancelAndHoldAtTime(when);
    this.gainSignal.rampTo(0, fadeTime, when);
    Draw2.schedule(() => onComplete && onComplete(), when + fadeTime);
  }
  triggerModulators(options) {
    const when = now() + (options && options.when || 0);
    const duration = options && options.duration !== void 0 ? options.duration : 0.5;
    this.effects.forEach((effect) => {
      if (effect.modulators) {
        effect.modulators.forEach((modulator) => {
          modulator.play(when, duration);
        });
      }
    });
    this.modulators.forEach((modulator) => {
      modulator.play(when, duration);
    });
  }
  setParam(paramName, value, options) {
    this.params.get(paramName).set(value, options);
  }
  setRawParam(paramName, value, options) {
    this.params.get(paramName).setRaw(value, options);
  }
  dispose() {
    var _a, _b;
    (_a = this.panner) == null ? void 0 : _a.disconnect();
    (_b = this.panner) == null ? void 0 : _b.dispose();
    this.gain.disconnect();
    this.gain.dispose();
    this.muteGain.disconnect();
    this.muteGain.dispose();
    this.effects.forEach((effectNode) => {
      effectNode.disconnect();
      try {
        effectNode.dispose();
      } catch (e) {
      }
    });
  }
}
class Instrument2 {
  constructor(options) {
    const { name } = options;
    this.params = /* @__PURE__ */ new Map();
    this.name = name;
    this.settings = options;
    this.uuid = v4();
  }
  connect(destination) {
    this.channel.connect(destination);
  }
  pause(args = {}) {
    console.log("\u{1F3B5} Instrument pause - Timestamp:", (/* @__PURE__ */ new Date()).toISOString());
    if (this.player && typeof this.player.pause === "function") {
      this.player.pause(args);
    }
  }
  resume(args = {}) {
    if (this.player && typeof this.player.resume === "function") {
      this.player.resume(args);
    }
  }
  stop(args = {}) {
    const { retries = 0, exactTime = false } = args;
    let { when = 0 } = args;
    when = exactTime ? when : now() + when;
    if (this.channel.getGain() > 0.1) {
      this.fadeOut(1, 0, () => {
      });
      if (retries < 5) {
        setTimeout(() => this.stop({ retries: retries + 1 }), 1.5 * 1e3);
      } else {
        this.player.stop(when);
      }
    } else {
      this.player.stop(when);
    }
  }
  setGain(value, fadeTime = 0, when = 0) {
    var _a;
    (_a = this.channel) == null ? void 0 : _a.setGain(value, fadeTime, when);
  }
  fadeOut(fadeTime, when, onComplete, exactTime = false) {
    if (this.channel.getGain() !== 0) {
      this.channel.fadeOut(
        fadeTime,
        when,
        () => {
          onComplete && onComplete(this);
        },
        exactTime
      );
    }
  }
  setParam(paramName, value, options) {
    this.params.get(paramName).set(value, options);
  }
  setRawParam(paramName, value, options) {
    this.params.get(paramName).setRaw(value, options);
  }
  update(toUpdate) {
    Object.keys(toUpdate).forEach((key) => {
      const param = this.params.get(key);
      if (param) {
        param.setRaw(toUpdate[key]);
      }
      this.settings[key] = toUpdate[key];
      if (key === "mode" && this.settings.type && this.settings.type === "roundRobin") {
        this.setMode(toUpdate.mode);
      }
    });
  }
  dispose() {
    this.player.dispose();
    this.player.disconnect();
    this.channel.dispose();
  }
}
class Sampler2 extends Instrument2 {
  constructor(buffers, options) {
    super(options);
    const samplerBuffers = buffers;
    this.loop = options.loop || false;
    const { loopStart, loopEnd } = options;
    const player = new Sampler$1(samplerBuffers, {
      loop: this.loop,
      loopStart,
      loopEnd
    });
    const channel = new Channel2(player, options);
    this.player = player;
    this.channel = channel;
    this.metadata = options.metadata || {};
    this.initParams();
    if (this.settings.envelope) {
      Object.entries(this.settings.envelope).forEach(([key, value]) => {
        this.setParam(key, value);
      });
    }
  }
  initParams() {
    const instrument = this.player;
    this.params = new Map(
      [
        getGainParam(this),
        getPanParam(this),
        new Param2({
          name: "attack",
          set: (value) => instrument.attack = value
        }),
        new Param2({
          name: "release",
          set: (value) => instrument.release = value,
          controlSpec: new ControlSpec({ default: 2, min: 0, max: 5 })
        }),
        new Param2({
          name: "curve",
          set: (value) => instrument.curve = value
        }),
        new Param2({
          name: "rate",
          set: this.setPlaybackRate.bind(this),
          controlSpec: new ControlSpec({
            default: 1,
            min: 0,
            max: 3
          })
        })
      ].map((param) => [param.name, param])
    );
  }
  getState() {
    return "started";
  }
  setPlaybackRate(rate, options) {
    const activeSources = this.getActiveSources();
    if (activeSources) {
      activeSources.forEach((mapElement) => {
        const source = mapElement[0];
        if (source) {
          const originalRate = mapElement.originalRate || source.playbackRate.value;
          const diff = rate - 1;
          const rateToSet = originalRate + diff;
          if (options && options.fadeTime) {
            const when = options.startTime ? options.startTime : 0;
            mapElement.originalRate = source.playbackRate.value;
            source.playbackRate.cancelAndHoldAtTime(now() + when);
            source.playbackRate.rampTo(
              rateToSet,
              options.fadeTime,
              now() + when
            );
          } else {
            source.playbackRate.value = rate;
          }
        }
      });
    }
  }
  getActiveSources() {
    return this.player._activeSources;
  }
  getNumberOfActiveSources() {
    let numberOfActiveSources = 0;
    const activeSources = this.getActiveSources();
    if (activeSources) {
      activeSources.forEach((mapElement) => {
        numberOfActiveSources += mapElement.length;
      });
    }
    return numberOfActiveSources;
  }
  stopOldestNote() {
    const notes = [];
    const activeSources = this.getActiveSources();
    if (activeSources) {
      activeSources.forEach((mapElement, key) => {
        mapElement.forEach((note) => {
          notes.push({ key, note });
        });
      });
      const oldest = notes.reduce(
        (prev, curr) => prev.note._stopTime < curr.note._stopTime ? prev : curr
      );
      this.player.triggerRelease(mtof(oldest.key));
    }
  }
  play(args = {}) {
    const { noReset = false, options = {} } = args;
    if (getContext$1().state === "suspended") {
      return false;
    }
    let { when = 0 } = args;
    const {
      note = 60,
      velocity = 1,
      exactTime = false,
      duration = 0
    } = options;
    !noReset && this.channel.resetGain();
    when = exactTime ? when : immediate() + when;
    if (duration && !this.loop) {
      this.player.triggerAttackRelease(
        mtof(note),
        duration,
        when,
        velocity
      );
    } else {
      this.player.triggerAttack(mtof(note), when, velocity);
    }
  }
  stop(args = {}) {
    let { when = 0 } = args;
    const { options = {} } = args;
    const { note, exactTime = false } = options;
    when = exactTime ? when : immediate() + when;
    if (note) {
      this.player.triggerRelease(mtof(note), when);
    } else {
      this.player.releaseAll(when);
    }
  }
  triggerModulators(options) {
    this.channel.triggerModulators(options);
  }
  releaseAll(when = 0) {
    this.player.releaseAll(when);
  }
}
class Player2 extends Instrument2 {
  constructor(buffer, options) {
    var _a;
    super(options);
    this.retrigger = false;
    this.isPaused = false;
    this.totalPlayed = 0;
    this.playStartTime = 0;
    const { loop = false, loopStart, loopEnd, metadata = {} } = options;
    const player = new Player$1(buffer);
    this.retrigger = !loop;
    player.loop = loop;
    const channel = new Channel2(player, options);
    this.player = player;
    this.channel = channel;
    this.metadata = metadata;
    this.duration = options.duration || ((_a = this.player.buffer) == null ? void 0 : _a.duration);
    if (loopStart) {
      player.loopStart = loopStart;
    }
    if (loopEnd) {
      this.setLoopEnd(loopEnd);
    } else if (options.duration) {
      if (options.duration <= player.buffer.duration) {
        player.loopEnd = options.duration;
      }
    }
    this.initParams();
  }
  initParams() {
    const instrument = this.player;
    this.params = new Map(
      [
        getGainParam(this),
        getRateParam(this),
        getPanParam(this),
        new Param2({ name: "loopStart", set: this.setLoopStart.bind(this) }),
        new Param2({ name: "loopEnd", set: this.setLoopEnd.bind(this) }),
        new Param2({
          name: "loop",
          set: this.setLoop.bind(this),
          controlSpec: ControlSpec.BOOLEAN
        }),
        new Param2({
          name: "reverse",
          set: (value) => instrument.reverse = value,
          controlSpec: ControlSpec.BOOLEAN
        }),
        new Param2({ name: "seek", set: (value) => instrument.seek = value }),
        new Param2({ name: "sync", set: (value) => instrument.sync = value })
      ].map((param) => [param.name, param])
    );
  }
  play(args = {}) {
    const {
      noReset = true,
      fadeTime = 0,
      gain = 1,
      exactTime = false,
      offset = 0
    } = args;
    const { when = 0 } = args;
    const startTime = exactTime ? when : now() + when;
    try {
      if (this.isPaused) {
        this.resume(args);
        return;
      }
      if (this.player.state !== "started") {
        if (this.player.state !== "stopped") {
          this.player.stop();
        }
        !noReset && this.channel.resetGain();
        this.channel.fadeIn(fadeTime, when, gain, {
          fadeFromZero: true,
          exactTime
        });
        this.player.start(startTime, offset);
        this.playStartTime = startTime;
        this.totalPlayed = 0;
      } else if (this.retrigger) {
        const fadeOut = 0.01;
        const retriggerFadeIn = 1e-3;
        this.fadeOut(fadeOut, when, null, exactTime);
        this.channel.fadeIn(retriggerFadeIn, when + fadeOut, gain, {
          exactTime
        });
        this.player.restart(startTime + fadeOut, offset);
        this.playStartTime = startTime + fadeOut;
        this.totalPlayed = 0;
      } else {
        this.channel.fadeIn(fadeTime, when, gain, { exactTime });
      }
    } catch (err) {
      window.AE_DEBUG && console.warn(err);
    }
  }
  pause(args = {}) {
    const { fadeTime = 0.1, exactTime = false } = args;
    let { when = 0 } = args;
    if (this.player.state === "started" && !this.isPaused) {
      const currentTime = exactTime ? when : now() + when;
      this.totalPlayed += currentTime - this.playStartTime;
      this.isPaused = true;
      this.player.stop(currentTime + fadeTime);
      this.fadeOut(fadeTime, when, () => {
      }, exactTime);
    }
  }
  resume(args = {}) {
    const {
      noReset = true,
      fadeTime = 0.1,
      gain = 1,
      exactTime = false
    } = args;
    let { when = 0 } = args;
    if (this.isPaused) {
      const startTime = exactTime ? when : now() + when;
      this.isPaused = false;
      !noReset && this.channel.resetGain();
      this.channel.fadeIn(fadeTime, when, gain, {
        fadeFromZero: true,
        exactTime
      });
      this.player.start(startTime, this.totalPlayed);
      this.playStartTime = startTime;
    }
  }
  stop(args = {}) {
    this.isPaused = false;
    this.playStartTime = 0;
    this.totalPlayed = 0;
    super.stop(args);
  }
  setLoopStart(value) {
    if (value <= this.player.buffer.duration) {
      this.settings.loopStart = value;
      this.player.loopStart = value;
    }
  }
  setLoopEnd(value) {
    if (value <= this.player.buffer.duration) {
      this.settings.loopEnd = value;
      this.player.loopEnd = value;
    }
  }
  setLoop(loop) {
    this.settings.loop = loop;
    this.player.loop = loop;
  }
  getState() {
    if (this.isPaused) {
      return "paused";
    }
    return this.player.state;
  }
  getDuration() {
    return this.duration;
  }
  getPausePosition() {
    return this.totalPlayed;
  }
  isPausedState() {
    return this.isPaused;
  }
}
class EventEmitter {
  constructor(eventsSuspended = false) {
    this.eventMap = {};
    this.eventsSuspended = eventsSuspended == true ? true : false;
  }
  addListener(event, callback, options = {}) {
    if (typeof event === "string" && event.length < 1 || event instanceof String && event.length < 1 || typeof event !== "string" && !(event instanceof String) && event !== EventEmitter.ANY_EVENT) {
      throw new TypeError("The 'event' parameter must be a string or EventEmitter.ANY_EVENT.");
    }
    if (typeof callback !== "function")
      throw new TypeError("The callback must be a function.");
    const listener = new Listener2(event, this, callback, options);
    if (!this.eventMap[event])
      this.eventMap[event] = [];
    if (options.prepend) {
      this.eventMap[event].unshift(listener);
    } else {
      this.eventMap[event].push(listener);
    }
    return listener;
  }
  addOneTimeListener(event, callback, options = {}) {
    options.remaining = 1;
    this.addListener(event, callback, options);
  }
  static get ANY_EVENT() {
    return Symbol.for("Any event");
  }
  hasListener(event, callback) {
    if (event === void 0) {
      if (this.eventMap[EventEmitter.ANY_EVENT] && this.eventMap[EventEmitter.ANY_EVENT].length > 0) {
        return true;
      }
      return Object.entries(this.eventMap).some(([, value]) => {
        return value.length > 0;
      });
    } else {
      if (this.eventMap[event] && this.eventMap[event].length > 0) {
        if (callback instanceof Listener2) {
          let result = this.eventMap[event].filter((listener) => listener === callback);
          return result.length > 0;
        } else if (typeof callback === "function") {
          let result = this.eventMap[event].filter((listener) => listener.callback === callback);
          return result.length > 0;
        } else if (callback != void 0) {
          return false;
        }
        return true;
      } else {
        return false;
      }
    }
  }
  get eventNames() {
    return Object.keys(this.eventMap);
  }
  getListeners(event) {
    return this.eventMap[event] || [];
  }
  suspendEvent(event) {
    this.getListeners(event).forEach((listener) => {
      listener.suspended = true;
    });
  }
  unsuspendEvent(event) {
    this.getListeners(event).forEach((listener) => {
      listener.suspended = false;
    });
  }
  getListenerCount(event) {
    return this.getListeners(event).length;
  }
  emit(event, ...args) {
    if (typeof event !== "string" && !(event instanceof String)) {
      throw new TypeError("The 'event' parameter must be a string.");
    }
    if (this.eventsSuspended)
      return;
    let results = [];
    let listeners = this.eventMap[EventEmitter.ANY_EVENT] || [];
    if (this.eventMap[event])
      listeners = listeners.concat(this.eventMap[event]);
    listeners.forEach((listener) => {
      if (listener.suspended)
        return;
      let params = [...args];
      if (Array.isArray(listener.arguments))
        params = params.concat(listener.arguments);
      if (listener.remaining > 0) {
        results.push(listener.callback.apply(listener.context, params));
        listener.count++;
      }
      if (--listener.remaining < 1)
        listener.remove();
    });
    return results;
  }
  removeListener(event, callback, options = {}) {
    if (event === void 0) {
      this.eventMap = {};
      return;
    } else if (!this.eventMap[event]) {
      return;
    }
    let listeners = this.eventMap[event].filter((listener) => {
      return callback && listener.callback !== callback || options.remaining && options.remaining !== listener.remaining || options.context && options.context !== listener.context;
    });
    if (listeners.length) {
      this.eventMap[event] = listeners;
    } else {
      delete this.eventMap[event];
    }
  }
  waitFor(_0) {
    return __async(this, arguments, function* (event, options = {}) {
      options.duration = parseInt(options.duration);
      if (isNaN(options.duration) || options.duration <= 0)
        options.duration = Infinity;
      return new Promise((resolve, reject) => {
        let timeout;
        let listener = this.addListener(event, () => {
          clearTimeout(timeout);
          resolve();
        }, { remaining: 1 });
        if (options.duration !== Infinity) {
          timeout = setTimeout(() => {
            listener.remove();
            reject("The duration expired before the event was emitted.");
          }, options.duration);
        }
      });
    });
  }
  get eventCount() {
    return Object.keys(this.eventMap).length;
  }
}
class Listener2 {
  constructor(event, target, callback, options = {}) {
    if (typeof event !== "string" && !(event instanceof String) && event !== EventEmitter.ANY_EVENT) {
      throw new TypeError("The 'event' parameter must be a string or EventEmitter.ANY_EVENT.");
    }
    if (!target) {
      throw new ReferenceError("The 'target' parameter is mandatory.");
    }
    if (typeof callback !== "function") {
      throw new TypeError("The 'callback' must be a function.");
    }
    if (options.arguments !== void 0 && !Array.isArray(options.arguments)) {
      options.arguments = [options.arguments];
    }
    options = Object.assign({
      context: target,
      remaining: Infinity,
      arguments: void 0,
      duration: Infinity
    }, options);
    if (options.duration !== Infinity) {
      setTimeout(() => this.remove(), options.duration);
    }
    this.arguments = options.arguments;
    this.callback = callback;
    this.context = options.context;
    this.count = 0;
    this.event = event;
    this.remaining = parseInt(options.remaining) >= 1 ? parseInt(options.remaining) : Infinity;
    this.suspended = false;
    this.target = target;
  }
  remove() {
    this.target.removeListener(
      this.event,
      this.callback,
      { context: this.context, remaining: this.remaining }
    );
  }
}
/**
 * The `Enumerations` class contains enumerations and arrays of elements used throughout the
 * library. All its properties are static and should be referenced using the class name. For
 * example: `Enumerations.CHANNEL_MESSAGES`.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */
class Enumerations {
  static get MIDI_CHANNEL_MESSAGES() {
    if (this.validation) {
      console.warn(
        "The MIDI_CHANNEL_MESSAGES enum has been deprecated. Use the Enumerations.CHANNEL_MESSAGES enum instead."
      );
    }
    return Enumerations.CHANNEL_MESSAGES;
  }
  static get CHANNEL_MESSAGES() {
    return {
      noteoff: 8,
      noteon: 9,
      keyaftertouch: 10,
      controlchange: 11,
      programchange: 12,
      channelaftertouch: 13,
      pitchbend: 14
    };
  }
  static get CHANNEL_NUMBERS() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  }
  static get MIDI_CHANNEL_NUMBERS() {
    if (this.validation) {
      console.warn(
        "The MIDI_CHANNEL_NUMBERS array has been deprecated. Use the Enumerations.CHANNEL_NUMBERS array instead."
      );
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  }
  static get CHANNEL_MODE_MESSAGES() {
    return {
      allsoundoff: 120,
      resetallcontrollers: 121,
      localcontrol: 122,
      allnotesoff: 123,
      omnimodeoff: 124,
      omnimodeon: 125,
      monomodeon: 126,
      polymodeon: 127
    };
  }
  static get MIDI_CHANNEL_MODE_MESSAGES() {
    if (this.validation) {
      console.warn(
        "The MIDI_CHANNEL_MODE_MESSAGES enum has been deprecated. Use the Enumerations.CHANNEL_MODE_MESSAGES enum instead."
      );
    }
    return Enumerations.CHANNEL_MODE_MESSAGES;
  }
  static get MIDI_CONTROL_CHANGE_MESSAGES() {
    if (this.validation) {
      console.warn(
        "The MIDI_CONTROL_CHANGE_MESSAGES enum has been deprecated. Use the Enumerations.CONTROL_CHANGE_MESSAGES array instead."
      );
    }
    return {
      bankselectcoarse: 0,
      modulationwheelcoarse: 1,
      breathcontrollercoarse: 2,
      controller3: 3,
      footcontrollercoarse: 4,
      portamentotimecoarse: 5,
      dataentrycoarse: 6,
      volumecoarse: 7,
      balancecoarse: 8,
      controller9: 9,
      pancoarse: 10,
      expressioncoarse: 11,
      effectcontrol1coarse: 12,
      effectcontrol2coarse: 13,
      controller14: 14,
      controller15: 15,
      generalpurposeslider1: 16,
      generalpurposeslider2: 17,
      generalpurposeslider3: 18,
      generalpurposeslider4: 19,
      controller20: 20,
      controller21: 21,
      controller22: 22,
      controller23: 23,
      controller24: 24,
      controller25: 25,
      controller26: 26,
      controller27: 27,
      controller28: 28,
      controller29: 29,
      controller30: 30,
      controller31: 31,
      bankselectfine: 32,
      modulationwheelfine: 33,
      breathcontrollerfine: 34,
      controller35: 35,
      footcontrollerfine: 36,
      portamentotimefine: 37,
      dataentryfine: 38,
      volumefine: 39,
      balancefine: 40,
      controller41: 41,
      panfine: 42,
      expressionfine: 43,
      effectcontrol1fine: 44,
      effectcontrol2fine: 45,
      controller46: 46,
      controller47: 47,
      controller48: 48,
      controller49: 49,
      controller50: 50,
      controller51: 51,
      controller52: 52,
      controller53: 53,
      controller54: 54,
      controller55: 55,
      controller56: 56,
      controller57: 57,
      controller58: 58,
      controller59: 59,
      controller60: 60,
      controller61: 61,
      controller62: 62,
      controller63: 63,
      holdpedal: 64,
      portamento: 65,
      sustenutopedal: 66,
      softpedal: 67,
      legatopedal: 68,
      hold2pedal: 69,
      soundvariation: 70,
      resonance: 71,
      soundreleasetime: 72,
      soundattacktime: 73,
      brightness: 74,
      soundcontrol6: 75,
      soundcontrol7: 76,
      soundcontrol8: 77,
      soundcontrol9: 78,
      soundcontrol10: 79,
      generalpurposebutton1: 80,
      generalpurposebutton2: 81,
      generalpurposebutton3: 82,
      generalpurposebutton4: 83,
      controller84: 84,
      controller85: 85,
      controller86: 86,
      controller87: 87,
      controller88: 88,
      controller89: 89,
      controller90: 90,
      reverblevel: 91,
      tremololevel: 92,
      choruslevel: 93,
      celestelevel: 94,
      phaserlevel: 95,
      databuttonincrement: 96,
      databuttondecrement: 97,
      nonregisteredparametercoarse: 98,
      nonregisteredparameterfine: 99,
      registeredparametercoarse: 100,
      registeredparameterfine: 101,
      controller102: 102,
      controller103: 103,
      controller104: 104,
      controller105: 105,
      controller106: 106,
      controller107: 107,
      controller108: 108,
      controller109: 109,
      controller110: 110,
      controller111: 111,
      controller112: 112,
      controller113: 113,
      controller114: 114,
      controller115: 115,
      controller116: 116,
      controller117: 117,
      controller118: 118,
      controller119: 119,
      allsoundoff: 120,
      resetallcontrollers: 121,
      localcontrol: 122,
      allnotesoff: 123,
      omnimodeoff: 124,
      omnimodeon: 125,
      monomodeon: 126,
      polymodeon: 127
    };
  }
  static get CONTROL_CHANGE_MESSAGES() {
    return [
      {
        number: 0,
        name: "bankselectcoarse",
        description: "Bank Select (Coarse)",
        position: "msb"
      },
      {
        number: 1,
        name: "modulationwheelcoarse",
        description: "Modulation Wheel (Coarse)",
        position: "msb"
      },
      {
        number: 2,
        name: "breathcontrollercoarse",
        description: "Breath Controller (Coarse)",
        position: "msb"
      },
      {
        number: 3,
        name: "controller3",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 4,
        name: "footcontrollercoarse",
        description: "Foot Controller (Coarse)",
        position: "msb"
      },
      {
        number: 5,
        name: "portamentotimecoarse",
        description: "Portamento Time (Coarse)",
        position: "msb"
      },
      {
        number: 6,
        name: "dataentrycoarse",
        description: "Data Entry (Coarse)",
        position: "msb"
      },
      {
        number: 7,
        name: "volumecoarse",
        description: "Channel Volume (Coarse)",
        position: "msb"
      },
      {
        number: 8,
        name: "balancecoarse",
        description: "Balance (Coarse)",
        position: "msb"
      },
      {
        number: 9,
        name: "controller9",
        description: "Controller 9 (Coarse)",
        position: "msb"
      },
      {
        number: 10,
        name: "pancoarse",
        description: "Pan (Coarse)",
        position: "msb"
      },
      {
        number: 11,
        name: "expressioncoarse",
        description: "Expression Controller (Coarse)",
        position: "msb"
      },
      {
        number: 12,
        name: "effectcontrol1coarse",
        description: "Effect Control 1 (Coarse)",
        position: "msb"
      },
      {
        number: 13,
        name: "effectcontrol2coarse",
        description: "Effect Control 2 (Coarse)",
        position: "msb"
      },
      {
        number: 14,
        name: "controller14",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 15,
        name: "controller15",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 16,
        name: "generalpurposecontroller1",
        description: "General Purpose Controller 1 (Coarse)",
        position: "msb"
      },
      {
        number: 17,
        name: "generalpurposecontroller2",
        description: "General Purpose Controller 2 (Coarse)",
        position: "msb"
      },
      {
        number: 18,
        name: "generalpurposecontroller3",
        description: "General Purpose Controller 3 (Coarse)",
        position: "msb"
      },
      {
        number: 19,
        name: "generalpurposecontroller4",
        description: "General Purpose Controller 4 (Coarse)",
        position: "msb"
      },
      {
        number: 20,
        name: "controller20",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 21,
        name: "controller21",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 22,
        name: "controller22",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 23,
        name: "controller23",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 24,
        name: "controller24",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 25,
        name: "controller25",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 26,
        name: "controller26",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 27,
        name: "controller27",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 28,
        name: "controller28",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 29,
        name: "controller29",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 30,
        name: "controller30",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 31,
        name: "controller31",
        description: "Undefined",
        position: "msb"
      },
      {
        number: 32,
        name: "bankselectfine",
        description: "Bank Select (Fine)",
        position: "lsb"
      },
      {
        number: 33,
        name: "modulationwheelfine",
        description: "Modulation Wheel (Fine)",
        position: "lsb"
      },
      {
        number: 34,
        name: "breathcontrollerfine",
        description: "Breath Controller (Fine)",
        position: "lsb"
      },
      {
        number: 35,
        name: "controller35",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 36,
        name: "footcontrollerfine",
        description: "Foot Controller (Fine)",
        position: "lsb"
      },
      {
        number: 37,
        name: "portamentotimefine",
        description: "Portamento Time (Fine)",
        position: "lsb"
      },
      {
        number: 38,
        name: "dataentryfine",
        description: "Data Entry (Fine)",
        position: "lsb"
      },
      {
        number: 39,
        name: "channelvolumefine",
        description: "Channel Volume (Fine)",
        position: "lsb"
      },
      {
        number: 40,
        name: "balancefine",
        description: "Balance (Fine)",
        position: "lsb"
      },
      {
        number: 41,
        name: "controller41",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 42,
        name: "panfine",
        description: "Pan (Fine)",
        position: "lsb"
      },
      {
        number: 43,
        name: "expressionfine",
        description: "Expression Controller (Fine)",
        position: "lsb"
      },
      {
        number: 44,
        name: "effectcontrol1fine",
        description: "Effect control 1 (Fine)",
        position: "lsb"
      },
      {
        number: 45,
        name: "effectcontrol2fine",
        description: "Effect control 2 (Fine)",
        position: "lsb"
      },
      {
        number: 46,
        name: "controller46",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 47,
        name: "controller47",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 48,
        name: "controller48",
        description: "General Purpose Controller 1 (Fine)",
        position: "lsb"
      },
      {
        number: 49,
        name: "controller49",
        description: "General Purpose Controller 2 (Fine)",
        position: "lsb"
      },
      {
        number: 50,
        name: "controller50",
        description: "General Purpose Controller 3 (Fine)",
        position: "lsb"
      },
      {
        number: 51,
        name: "controller51",
        description: "General Purpose Controller 4 (Fine)",
        position: "lsb"
      },
      {
        number: 52,
        name: "controller52",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 53,
        name: "controller53",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 54,
        name: "controller54",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 55,
        name: "controller55",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 56,
        name: "controller56",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 57,
        name: "controller57",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 58,
        name: "controller58",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 59,
        name: "controller59",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 60,
        name: "controller60",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 61,
        name: "controller61",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 62,
        name: "controller62",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 63,
        name: "controller63",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 64,
        name: "damperpedal",
        description: "Damper Pedal On/Off"
      },
      {
        number: 65,
        name: "portamento",
        description: "Portamento On/Off"
      },
      {
        number: 66,
        name: "sostenuto",
        description: "Sostenuto On/Off"
      },
      {
        number: 67,
        name: "softpedal",
        description: "Soft Pedal On/Off"
      },
      {
        number: 68,
        name: "legatopedal",
        description: "Legato Pedal On/Off"
      },
      {
        number: 69,
        name: "hold2",
        description: "Hold 2 On/Off"
      },
      {
        number: 70,
        name: "soundvariation",
        description: "Sound Variation",
        position: "lsb"
      },
      {
        number: 71,
        name: "resonance",
        description: "Resonance",
        position: "lsb"
      },
      {
        number: 72,
        name: "releasetime",
        description: "Release Time",
        position: "lsb"
      },
      {
        number: 73,
        name: "attacktime",
        description: "Attack Time",
        position: "lsb"
      },
      {
        number: 74,
        name: "brightness",
        description: "Brightness",
        position: "lsb"
      },
      {
        number: 75,
        name: "decaytime",
        description: "Decay Time",
        position: "lsb"
      },
      {
        number: 76,
        name: "vibratorate",
        description: "Vibrato Rate",
        position: "lsb"
      },
      {
        number: 77,
        name: "vibratodepth",
        description: "Vibrato Depth",
        position: "lsb"
      },
      {
        number: 78,
        name: "vibratodelay",
        description: "Vibrato Delay",
        position: "lsb"
      },
      {
        number: 79,
        name: "controller79",
        description: "Undefined",
        position: "lsb"
      },
      {
        number: 80,
        name: "generalpurposecontroller5",
        description: "General Purpose Controller 5",
        position: "lsb"
      },
      {
        number: 81,
        name: "generalpurposecontroller6",
        description: "General Purpose Controller 6",
        position: "lsb"
      },
      {
        number: 82,
        name: "generalpurposecontroller7",
        description: "General Purpose Controller 7",
        position: "lsb"
      },
      {
        number: 83,
        name: "generalpurposecontroller8",
        description: "General Purpose Controller 8",
        position: "lsb"
      },
      {
        number: 84,
        name: "portamentocontrol",
        description: "Portamento Control",
        position: "lsb"
      },
      {
        number: 85,
        name: "controller85",
        description: "Undefined"
      },
      {
        number: 86,
        name: "controller86",
        description: "Undefined"
      },
      {
        number: 87,
        name: "controller87",
        description: "Undefined"
      },
      {
        number: 88,
        name: "highresolutionvelocityprefix",
        description: "High Resolution Velocity Prefix",
        position: "lsb"
      },
      {
        number: 89,
        name: "controller89",
        description: "Undefined"
      },
      {
        number: 90,
        name: "controller90",
        description: "Undefined"
      },
      {
        number: 91,
        name: "effect1depth",
        description: "Effects 1 Depth (Reverb Send Level)"
      },
      {
        number: 92,
        name: "effect2depth",
        description: "Effects 2 Depth"
      },
      {
        number: 93,
        name: "effect3depth",
        description: "Effects 3 Depth (Chorus Send Level)"
      },
      {
        number: 94,
        name: "effect4depth",
        description: "Effects 4 Depth"
      },
      {
        number: 95,
        name: "effect5depth",
        description: "Effects 5 Depth"
      },
      {
        number: 96,
        name: "dataincrement",
        description: "Data Increment"
      },
      {
        number: 97,
        name: "datadecrement",
        description: "Data Decrement"
      },
      {
        number: 98,
        name: "nonregisteredparameterfine",
        description: "Non-Registered Parameter Number (Fine)",
        position: "lsb"
      },
      {
        number: 99,
        name: "nonregisteredparametercoarse",
        description: "Non-Registered Parameter Number (Coarse)",
        position: "msb"
      },
      {
        number: 100,
        name: "registeredparameterfine",
        description: "Registered Parameter Number (Fine)",
        position: "lsb"
      },
      {
        number: 101,
        name: "registeredparametercoarse",
        description: "Registered Parameter Number (Coarse)",
        position: "msb"
      },
      {
        number: 102,
        name: "controller102",
        description: "Undefined"
      },
      {
        number: 103,
        name: "controller103",
        description: "Undefined"
      },
      {
        number: 104,
        name: "controller104",
        description: "Undefined"
      },
      {
        number: 105,
        name: "controller105",
        description: "Undefined"
      },
      {
        number: 106,
        name: "controller106",
        description: "Undefined"
      },
      {
        number: 107,
        name: "controller107",
        description: "Undefined"
      },
      {
        number: 108,
        name: "controller108",
        description: "Undefined"
      },
      {
        number: 109,
        name: "controller109",
        description: "Undefined"
      },
      {
        number: 110,
        name: "controller110",
        description: "Undefined"
      },
      {
        number: 111,
        name: "controller111",
        description: "Undefined"
      },
      {
        number: 112,
        name: "controller112",
        description: "Undefined"
      },
      {
        number: 113,
        name: "controller113",
        description: "Undefined"
      },
      {
        number: 114,
        name: "controller114",
        description: "Undefined"
      },
      {
        number: 115,
        name: "controller115",
        description: "Undefined"
      },
      {
        number: 116,
        name: "controller116",
        description: "Undefined"
      },
      {
        number: 117,
        name: "controller117",
        description: "Undefined"
      },
      {
        number: 118,
        name: "controller118",
        description: "Undefined"
      },
      {
        number: 119,
        name: "controller119",
        description: "Undefined"
      },
      {
        number: 120,
        name: "allsoundoff",
        description: "All Sound Off"
      },
      {
        number: 121,
        name: "resetallcontrollers",
        description: "Reset All Controllers"
      },
      {
        number: 122,
        name: "localcontrol",
        description: "Local Control On/Off"
      },
      {
        number: 123,
        name: "allnotesoff",
        description: "All Notes Off"
      },
      {
        number: 124,
        name: "omnimodeoff",
        description: "Omni Mode Off"
      },
      {
        number: 125,
        name: "omnimodeon",
        description: "Omni Mode On"
      },
      {
        number: 126,
        name: "monomodeon",
        description: "Mono Mode On"
      },
      {
        number: 127,
        name: "polymodeon",
        description: "Poly Mode On"
      }
    ];
  }
  static get REGISTERED_PARAMETERS() {
    return {
      pitchbendrange: [0, 0],
      channelfinetuning: [0, 1],
      channelcoarsetuning: [0, 2],
      tuningprogram: [0, 3],
      tuningbank: [0, 4],
      modulationrange: [0, 5],
      azimuthangle: [61, 0],
      elevationangle: [61, 1],
      gain: [61, 2],
      distanceratio: [61, 3],
      maximumdistance: [61, 4],
      maximumdistancegain: [61, 5],
      referencedistanceratio: [61, 6],
      panspreadangle: [61, 7],
      rollangle: [61, 8]
    };
  }
  static get MIDI_REGISTERED_PARAMETERS() {
    if (this.validation) {
      console.warn(
        "The MIDI_REGISTERED_PARAMETERS enum has been deprecated. Use the Enumerations.REGISTERED_PARAMETERS enum instead."
      );
    }
    return Enumerations.MIDI_REGISTERED_PARAMETERS;
  }
  static get SYSTEM_MESSAGES() {
    return {
      sysex: 240,
      timecode: 241,
      songposition: 242,
      songselect: 243,
      tunerequest: 246,
      tuningrequest: 246,
      sysexend: 247,
      clock: 248,
      start: 250,
      continue: 251,
      stop: 252,
      activesensing: 254,
      reset: 255,
      midimessage: 0,
      unknownsystemmessage: -1
    };
  }
  static get MIDI_SYSTEM_MESSAGES() {
    if (this.validation) {
      console.warn(
        "The MIDI_SYSTEM_MESSAGES enum has been deprecated. Use the Enumerations.SYSTEM_MESSAGES enum instead."
      );
    }
    return Enumerations.SYSTEM_MESSAGES;
  }
  static get CHANNEL_EVENTS() {
    return [
      "noteoff",
      "controlchange",
      "noteon",
      "keyaftertouch",
      "programchange",
      "channelaftertouch",
      "pitchbend",
      "allnotesoff",
      "allsoundoff",
      "localcontrol",
      "monomode",
      "omnimode",
      "resetallcontrollers",
      "nrpn",
      "nrpn-dataentrycoarse",
      "nrpn-dataentryfine",
      "nrpn-dataincrement",
      "nrpn-datadecrement",
      "rpn",
      "rpn-dataentrycoarse",
      "rpn-dataentryfine",
      "rpn-dataincrement",
      "rpn-datadecrement",
      "nrpn-databuttonincrement",
      "nrpn-databuttondecrement",
      "rpn-databuttonincrement",
      "rpn-databuttondecrement"
    ];
  }
}
/**
 * The `Note` class represents a single musical note such as `"D3"`, `"G#4"`, `"F-1"`, `"Gb7"`, etc.
 *
 * `Note` objects can be played back on a single channel by calling
 * [`OutputChannel.playNote()`]{@link OutputChannel#playNote} or, on multiple channels of the same
 * output, by calling [`Output.playNote()`]{@link Output#playNote}.
 *
 * The note has [`attack`](#attack) and [`release`](#release) velocities set at `0.5` by default.
 * These can be changed by passing in the appropriate option. It is also possible to set a
 * system-wide default for attack and release velocities by using the
 * [`WebMidi.defaults`](WebMidi#defaults) property.
 *
 * If you prefer to work with raw MIDI values (`0` to `127`), you can use [`rawAttack`](#rawAttack) and
 * [`rawRelease`](#rawRelease) to both get and set the values.
 *
 * The note may have a [`duration`](#duration). If it does, playback will be automatically stopped
 * when the duration has elapsed by sending a `"noteoff"` event. By default, the duration is set to
 * `Infinity`. In this case, it will never stop playing unless explicitly stopped by calling a
 * method such as [`OutputChannel.stopNote()`]{@link OutputChannel#stopNote},
 * [`Output.stopNote()`]{@link Output#stopNote} or similar.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */
class Note {
  constructor(value, options = {}) {
    this.duration = wm.defaults.note.duration;
    this.attack = wm.defaults.note.attack;
    this.release = wm.defaults.note.release;
    if (options.duration != void 0)
      this.duration = options.duration;
    if (options.attack != void 0)
      this.attack = options.attack;
    if (options.rawAttack != void 0)
      this.attack = Utilities.from7bitToFloat(options.rawAttack);
    if (options.release != void 0)
      this.release = options.release;
    if (options.rawRelease != void 0) {
      this.release = Utilities.from7bitToFloat(options.rawRelease);
    }
    if (Number.isInteger(value)) {
      this.identifier = Utilities.toNoteIdentifier(value);
    } else {
      this.identifier = value;
    }
  }
  get identifier() {
    return this._name + (this._accidental || "") + this._octave;
  }
  set identifier(value) {
    const fragments = Utilities.getNoteDetails(value);
    if (wm.validation) {
      if (!value)
        throw new Error("Invalid note identifier");
    }
    this._name = fragments.name;
    this._accidental = fragments.accidental;
    this._octave = fragments.octave;
  }
  get name() {
    return this._name;
  }
  set name(value) {
    if (wm.validation) {
      value = value.toUpperCase();
      if (!["C", "D", "E", "F", "G", "A", "B"].includes(value)) {
        throw new Error("Invalid name value");
      }
    }
    this._name = value;
  }
  get accidental() {
    return this._accidental;
  }
  set accidental(value) {
    if (wm.validation) {
      value = value.toLowerCase();
      if (!["#", "##", "b", "bb"].includes(value))
        throw new Error("Invalid accidental value");
    }
    this._accidental = value;
  }
  get octave() {
    return this._octave;
  }
  set octave(value) {
    if (wm.validation) {
      value = parseInt(value);
      if (isNaN(value))
        throw new Error("Invalid octave value");
    }
    this._octave = value;
  }
  get duration() {
    return this._duration;
  }
  set duration(value) {
    if (wm.validation) {
      value = parseFloat(value);
      if (isNaN(value) || value === null || value < 0) {
        throw new RangeError("Invalid duration value.");
      }
    }
    this._duration = value;
  }
  get attack() {
    return this._attack;
  }
  set attack(value) {
    if (wm.validation) {
      value = parseFloat(value);
      if (isNaN(value) || !(value >= 0 && value <= 1)) {
        throw new RangeError("Invalid attack value.");
      }
    }
    this._attack = value;
  }
  get release() {
    return this._release;
  }
  set release(value) {
    if (wm.validation) {
      value = parseFloat(value);
      if (isNaN(value) || !(value >= 0 && value <= 1)) {
        throw new RangeError("Invalid release value.");
      }
    }
    this._release = value;
  }
  get rawAttack() {
    return Utilities.fromFloatTo7Bit(this._attack);
  }
  set rawAttack(value) {
    this._attack = Utilities.from7bitToFloat(value);
  }
  get rawRelease() {
    return Utilities.fromFloatTo7Bit(this._release);
  }
  set rawRelease(value) {
    this._release = Utilities.from7bitToFloat(value);
  }
  get number() {
    return Utilities.toNoteNumber(this.identifier);
  }
  getOffsetNumber(octaveOffset = 0, semitoneOffset = 0) {
    if (wm.validation) {
      octaveOffset = parseInt(octaveOffset) || 0;
      semitoneOffset = parseInt(semitoneOffset) || 0;
    }
    return Math.min(Math.max(this.number + octaveOffset * 12 + semitoneOffset, 0), 127);
  }
}
/**
 * The `Utilities` class contains general-purpose utility methods. All methods are static and
 * should be called using the class name. For example: `Utilities.getNoteDetails("C4")`.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */
class Utilities {
  static toNoteNumber(identifier, octaveOffset = 0) {
    octaveOffset = octaveOffset == void 0 ? 0 : parseInt(octaveOffset);
    if (isNaN(octaveOffset))
      throw new RangeError("Invalid 'octaveOffset' value");
    if (typeof identifier !== "string")
      identifier = "";
    const fragments = this.getNoteDetails(identifier);
    if (!fragments)
      throw new TypeError("Invalid note identifier");
    const notes = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let result = (fragments.octave + 1 + octaveOffset) * 12;
    result += notes[fragments.name];
    if (fragments.accidental) {
      if (fragments.accidental.startsWith("b")) {
        result -= fragments.accidental.length;
      } else {
        result += fragments.accidental.length;
      }
    }
    if (result < 0 || result > 127)
      throw new RangeError("Invalid octaveOffset value");
    return result;
  }
  static getNoteDetails(value) {
    if (Number.isInteger(value))
      value = this.toNoteIdentifier(value);
    const matches = value.match(/^([CDEFGAB])(#{0,2}|b{0,2})(-?\d+)$/i);
    if (!matches)
      throw new TypeError("Invalid note identifier");
    const name = matches[1].toUpperCase();
    const octave = parseInt(matches[3]);
    let accidental = matches[2].toLowerCase();
    accidental = accidental === "" ? void 0 : accidental;
    const fragments = {
      accidental,
      identifier: name + (accidental || "") + octave,
      name,
      octave
    };
    return fragments;
  }
  static sanitizeChannels(channel) {
    let channels;
    if (wm.validation) {
      if (channel === "all") {
        channels = ["all"];
      } else if (channel === "none") {
        return [];
      }
    }
    if (!Array.isArray(channel)) {
      channels = [channel];
    } else {
      channels = channel;
    }
    if (channels.indexOf("all") > -1) {
      channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    }
    return channels.map(function(ch) {
      return parseInt(ch);
    }).filter(function(ch) {
      return ch >= 1 && ch <= 16;
    });
  }
  static toTimestamp(time) {
    let value = false;
    const parsed = parseFloat(time);
    if (isNaN(parsed))
      return false;
    if (typeof time === "string" && time.substring(0, 1) === "+") {
      if (parsed >= 0)
        value = wm.time + parsed;
    } else {
      if (parsed >= 0)
        value = parsed;
    }
    return value;
  }
  static guessNoteNumber(input, octaveOffset) {
    octaveOffset = parseInt(octaveOffset) || 0;
    let output = false;
    if (Number.isInteger(input) && input >= 0 && input <= 127) {
      output = parseInt(input);
    } else if (parseInt(input) >= 0 && parseInt(input) <= 127) {
      output = parseInt(input);
    } else if (typeof input === "string" || input instanceof String) {
      try {
        output = this.toNoteNumber(input.trim(), octaveOffset);
      } catch (e) {
        return false;
      }
    }
    return output;
  }
  static toNoteIdentifier(number, octaveOffset) {
    number = parseInt(number);
    if (isNaN(number) || number < 0 || number > 127)
      throw new RangeError("Invalid note number");
    octaveOffset = octaveOffset == void 0 ? 0 : parseInt(octaveOffset);
    if (isNaN(octaveOffset))
      throw new RangeError("Invalid octaveOffset value");
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(number / 12 - 1) + octaveOffset;
    return notes[number % 12] + octave.toString();
  }
  static buildNote(input, options = {}) {
    options.octaveOffset = parseInt(options.octaveOffset) || 0;
    if (input instanceof Note)
      return input;
    let number = this.guessNoteNumber(input, options.octaveOffset);
    if (number === false) {
      throw new TypeError(`The input could not be parsed as a note (${input})`);
    }
    options.octaveOffset = void 0;
    return new Note(number, options);
  }
  static buildNoteArray(notes, options = {}) {
    let result = [];
    if (!Array.isArray(notes))
      notes = [notes];
    notes.forEach((note) => {
      result.push(this.buildNote(note, options));
    });
    return result;
  }
  static from7bitToFloat(value) {
    if (value === Infinity)
      value = 127;
    value = parseInt(value) || 0;
    return Math.min(Math.max(value / 127, 0), 1);
  }
  static fromFloatTo7Bit(value) {
    if (value === Infinity)
      value = 1;
    value = parseFloat(value) || 0;
    return Math.min(Math.max(Math.round(value * 127), 0), 127);
  }
  static fromMsbLsbToFloat(msb, lsb = 0) {
    if (wm.validation) {
      msb = Math.min(Math.max(parseInt(msb) || 0, 0), 127);
      lsb = Math.min(Math.max(parseInt(lsb) || 0, 0), 127);
    }
    const value = ((msb << 7) + lsb) / 16383;
    return Math.min(Math.max(value, 0), 1);
  }
  static fromFloatToMsbLsb(value) {
    if (wm.validation) {
      value = Math.min(Math.max(parseFloat(value) || 0, 0), 1);
    }
    const multiplied = Math.round(value * 16383);
    return {
      msb: multiplied >> 7,
      lsb: multiplied & 127
    };
  }
  static offsetNumber(number, octaveOffset = 0, semitoneOffset = 0) {
    if (wm.validation) {
      number = parseInt(number);
      if (isNaN(number))
        throw new Error("Invalid note number");
      octaveOffset = parseInt(octaveOffset) || 0;
      semitoneOffset = parseInt(semitoneOffset) || 0;
    }
    return Math.min(Math.max(number + octaveOffset * 12 + semitoneOffset, 0), 127);
  }
  static getPropertyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
  }
  static getCcNameByNumber(number) {
    if (wm.validation) {
      number = parseInt(number);
      if (!(number >= 0 && number <= 127))
        return void 0;
    }
    return Enumerations.CONTROL_CHANGE_MESSAGES[number].name;
  }
  static getCcNumberByName(name) {
    let message = Enumerations.CONTROL_CHANGE_MESSAGES.find((element) => element.name === name);
    if (message) {
      return message.number;
    } else {
      return Enumerations.MIDI_CONTROL_CHANGE_MESSAGES[name];
    }
  }
  static getChannelModeByNumber(number) {
    if (!(number >= 120 && number <= 127))
      return false;
    for (let cm in Enumerations.CHANNEL_MODE_MESSAGES) {
      if (Enumerations.CHANNEL_MODE_MESSAGES.hasOwnProperty(cm) && number === Enumerations.CHANNEL_MODE_MESSAGES[cm]) {
        return cm;
      }
    }
    return false;
  }
  static get isNode() {
    return typeof process !== "undefined" && process.versions != null && process.versions.node != null;
  }
  static get isBrowser() {
    return typeof window !== "undefined" && typeof window.document !== "undefined";
  }
}
/**
 * The `OutputChannel` class represents a single output MIDI channel. `OutputChannel` objects are
 * provided by an [`Output`](Output) port which, itself, is made available by a device. The
 * `OutputChannel` object is derived from the host's MIDI subsystem and should not be instantiated
 * directly.
 *
 * All 16 `OutputChannel` objects can be found inside the parent output's
 * [`channels`]{@link Output#channels} property.
 *
 * @param {Output} output The [`Output`](Output) this channel belongs to.
 * @param {number} number The MIDI channel number (`1` - `16`).
 *
 * @extends EventEmitter
 * @license Apache-2.0
 * @since 3.0.0
 */
class OutputChannel extends EventEmitter {
  constructor(output, number) {
    super();
    this._output = output;
    this._number = number;
    this._octaveOffset = 0;
  }
  destroy() {
    this._output = null;
    this._number = null;
    this._octaveOffset = 0;
    this.removeListener();
  }
  send(message, options = { time: 0 }) {
    this.output.send(message, options);
    return this;
  }
  sendKeyAftertouch(target, pressure, options = {}) {
    if (wm.validation) {
      if (options.useRawValue)
        options.rawValue = options.useRawValue;
      if (isNaN(parseFloat(pressure))) {
        throw new RangeError("Invalid key aftertouch value.");
      }
      if (options.rawValue) {
        if (!(pressure >= 0 && pressure <= 127 && Number.isInteger(pressure))) {
          throw new RangeError("Key aftertouch raw value must be an integer between 0 and 127.");
        }
      } else {
        if (!(pressure >= 0 && pressure <= 1)) {
          throw new RangeError("Key aftertouch value must be a float between 0 and 1.");
        }
      }
    }
    if (!options.rawValue)
      pressure = Utilities.fromFloatTo7Bit(pressure);
    const offset = wm.octaveOffset + this.output.octaveOffset + this.octaveOffset;
    if (!Array.isArray(target))
      target = [target];
    Utilities.buildNoteArray(target).forEach((n) => {
      this.send(
        [
          (Enumerations.CHANNEL_MESSAGES.keyaftertouch << 4) + (this.number - 1),
          n.getOffsetNumber(offset),
          pressure
        ],
        { time: Utilities.toTimestamp(options.time) }
      );
    });
    return this;
  }
  sendControlChange(controller, value, options = {}) {
    if (typeof controller === "string") {
      controller = Utilities.getCcNumberByName(controller);
    }
    if (!Array.isArray(value))
      value = [value];
    if (wm.validation) {
      if (controller === void 0) {
        throw new TypeError(
          "Control change must be identified with a valid name or an integer between 0 and 127."
        );
      }
      if (!Number.isInteger(controller) || !(controller >= 0 && controller <= 127)) {
        throw new TypeError("Control change number must be an integer between 0 and 127.");
      }
      value = value.map((item) => {
        const output = Math.min(Math.max(parseInt(item), 0), 127);
        if (isNaN(output))
          throw new TypeError("Values must be integers between 0 and 127");
        return output;
      });
      if (value.length === 2 && controller >= 32) {
        throw new TypeError("To use a value array, the controller must be between 0 and 31");
      }
    }
    value.forEach((item, index2) => {
      this.send(
        [
          (Enumerations.CHANNEL_MESSAGES.controlchange << 4) + (this.number - 1),
          controller + index2 * 32,
          value[index2]
        ],
        { time: Utilities.toTimestamp(options.time) }
      );
    });
    return this;
  }
  _selectNonRegisteredParameter(parameter, options = {}) {
    this.sendControlChange(99, parameter[0], options);
    this.sendControlChange(98, parameter[1], options);
    return this;
  }
  _deselectRegisteredParameter(options = {}) {
    this.sendControlChange(101, 127, options);
    this.sendControlChange(100, 127, options);
    return this;
  }
  _deselectNonRegisteredParameter(options = {}) {
    this.sendControlChange(101, 127, options);
    this.sendControlChange(100, 127, options);
    return this;
  }
  _selectRegisteredParameter(parameter, options = {}) {
    this.sendControlChange(101, parameter[0], options);
    this.sendControlChange(100, parameter[1], options);
    return this;
  }
  _setCurrentParameter(data, options = {}) {
    data = [].concat(data);
    this.sendControlChange(6, data[0], options);
    if (data.length < 2)
      return this;
    this.sendControlChange(38, data[1], options);
    return this;
  }
  sendRpnDecrement(parameter, options = {}) {
    if (!Array.isArray(parameter))
      parameter = Enumerations.REGISTERED_PARAMETERS[parameter];
    if (wm.validation) {
      if (parameter === void 0) {
        throw new TypeError("The specified registered parameter is invalid.");
      }
      let valid = false;
      Object.getOwnPropertyNames(Enumerations.REGISTERED_PARAMETERS).forEach((p) => {
        if (Enumerations.REGISTERED_PARAMETERS[p][0] === parameter[0] && Enumerations.REGISTERED_PARAMETERS[p][1] === parameter[1]) {
          valid = true;
        }
      });
      if (!valid)
        throw new TypeError("The specified registered parameter is invalid.");
    }
    this._selectRegisteredParameter(parameter, options);
    this.sendControlChange(97, 0, options);
    this._deselectRegisteredParameter(options);
    return this;
  }
  sendRpnIncrement(parameter, options = {}) {
    if (!Array.isArray(parameter))
      parameter = Enumerations.REGISTERED_PARAMETERS[parameter];
    if (wm.validation) {
      if (parameter === void 0) {
        throw new TypeError("The specified registered parameter is invalid.");
      }
      let valid = false;
      Object.getOwnPropertyNames(Enumerations.REGISTERED_PARAMETERS).forEach((p) => {
        if (Enumerations.REGISTERED_PARAMETERS[p][0] === parameter[0] && Enumerations.REGISTERED_PARAMETERS[p][1] === parameter[1]) {
          valid = true;
        }
      });
      if (!valid)
        throw new TypeError("The specified registered parameter is invalid.");
    }
    this._selectRegisteredParameter(parameter, options);
    this.sendControlChange(96, 0, options);
    this._deselectRegisteredParameter(options);
    return this;
  }
  playNote(note, options = {}) {
    this.sendNoteOn(note, options);
    const notes = Array.isArray(note) ? note : [note];
    for (let note2 of notes) {
      if (parseInt(note2.duration) > 0) {
        const noteOffOptions = {
          time: (Utilities.toTimestamp(options.time) || wm.time) + parseInt(note2.duration),
          release: note2.release,
          rawRelease: note2.rawRelease
        };
        this.sendNoteOff(note2, noteOffOptions);
      } else if (parseInt(options.duration) > 0) {
        const noteOffOptions = {
          time: (Utilities.toTimestamp(options.time) || wm.time) + parseInt(options.duration),
          release: options.release,
          rawRelease: options.rawRelease
        };
        this.sendNoteOff(note2, noteOffOptions);
      }
    }
    return this;
  }
  sendNoteOff(note, options = {}) {
    if (wm.validation) {
      if (options.rawRelease != void 0 && !(options.rawRelease >= 0 && options.rawRelease <= 127)) {
        throw new RangeError("The 'rawRelease' option must be an integer between 0 and 127");
      }
      if (options.release != void 0 && !(options.release >= 0 && options.release <= 1)) {
        throw new RangeError("The 'release' option must be an number between 0 and 1");
      }
      if (options.rawVelocity) {
        options.rawRelease = options.velocity;
        console.warn("The 'rawVelocity' option is deprecated. Use 'rawRelease' instead.");
      }
      if (options.velocity) {
        options.release = options.velocity;
        console.warn("The 'velocity' option is deprecated. Use 'attack' instead.");
      }
    }
    let nVelocity = 64;
    if (options.rawRelease != void 0) {
      nVelocity = options.rawRelease;
    } else {
      if (!isNaN(options.release))
        nVelocity = Math.round(options.release * 127);
    }
    const offset = wm.octaveOffset + this.output.octaveOffset + this.octaveOffset;
    Utilities.buildNoteArray(note, { rawRelease: parseInt(nVelocity) }).forEach((n) => {
      this.send(
        [
          (Enumerations.CHANNEL_MESSAGES.noteoff << 4) + (this.number - 1),
          n.getOffsetNumber(offset),
          n.rawRelease
        ],
        { time: Utilities.toTimestamp(options.time) }
      );
    });
    return this;
  }
  stopNote(note, options = {}) {
    return this.sendNoteOff(note, options);
  }
  sendNoteOn(note, options = {}) {
    if (wm.validation) {
      if (options.rawAttack != void 0 && !(options.rawAttack >= 0 && options.rawAttack <= 127)) {
        throw new RangeError("The 'rawAttack' option must be an integer between 0 and 127");
      }
      if (options.attack != void 0 && !(options.attack >= 0 && options.attack <= 1)) {
        throw new RangeError("The 'attack' option must be an number between 0 and 1");
      }
      if (options.rawVelocity) {
        options.rawAttack = options.velocity;
        options.rawRelease = options.release;
        console.warn("The 'rawVelocity' option is deprecated. Use 'rawAttack' or 'rawRelease'.");
      }
      if (options.velocity) {
        options.attack = options.velocity;
        console.warn("The 'velocity' option is deprecated. Use 'attack' instead.");
      }
    }
    let nVelocity = 64;
    if (options.rawAttack != void 0) {
      nVelocity = options.rawAttack;
    } else {
      if (!isNaN(options.attack))
        nVelocity = Math.round(options.attack * 127);
    }
    const offset = wm.octaveOffset + this.output.octaveOffset + this.octaveOffset;
    Utilities.buildNoteArray(note, { rawAttack: nVelocity }).forEach((n) => {
      this.send(
        [
          (Enumerations.CHANNEL_MESSAGES.noteon << 4) + (this.number - 1),
          n.getOffsetNumber(offset),
          n.rawAttack
        ],
        { time: Utilities.toTimestamp(options.time) }
      );
    });
    return this;
  }
  sendChannelMode(command, value = 0, options = {}) {
    if (typeof command === "string")
      command = Enumerations.CHANNEL_MODE_MESSAGES[command];
    if (wm.validation) {
      if (command === void 0) {
        throw new TypeError("Invalid channel mode message name or number.");
      }
      if (isNaN(command) || !(command >= 120 && command <= 127)) {
        throw new TypeError("Invalid channel mode message number.");
      }
      if (isNaN(parseInt(value)) || value < 0 || value > 127) {
        throw new RangeError("Value must be an integer between 0 and 127.");
      }
    }
    this.send(
      [
        (Enumerations.CHANNEL_MESSAGES.controlchange << 4) + (this.number - 1),
        command,
        value
      ],
      { time: Utilities.toTimestamp(options.time) }
    );
    return this;
  }
  sendOmniMode(state, options = {}) {
    if (state === void 0 || state) {
      this.sendChannelMode("omnimodeon", 0, options);
    } else {
      this.sendChannelMode("omnimodeoff", 0, options);
    }
    return this;
  }
  sendChannelAftertouch(pressure, options = {}) {
    if (wm.validation) {
      if (isNaN(parseFloat(pressure))) {
        throw new RangeError("Invalid channel aftertouch value.");
      }
      if (options.rawValue) {
        if (!(pressure >= 0 && pressure <= 127 && Number.isInteger(pressure))) {
          throw new RangeError(
            "Channel aftertouch raw value must be an integer between 0 and 127."
          );
        }
      } else {
        if (!(pressure >= 0 && pressure <= 1)) {
          throw new RangeError("Channel aftertouch value must be a float between 0 and 1.");
        }
      }
    }
    if (!options.rawValue)
      pressure = Utilities.fromFloatTo7Bit(pressure);
    this.send(
      [
        (Enumerations.CHANNEL_MESSAGES.channelaftertouch << 4) + (this.number - 1),
        Math.round(pressure)
      ],
      { time: Utilities.toTimestamp(options.time) }
    );
    return this;
  }
  sendMasterTuning(value, options = {}) {
    value = parseFloat(value) || 0;
    if (wm.validation) {
      if (!(value > -65 && value < 64)) {
        throw new RangeError(
          "The value must be a decimal number larger than -65 and smaller than 64."
        );
      }
    }
    let coarse = Math.floor(value) + 64;
    let fine = value - Math.floor(value);
    fine = Math.round((fine + 1) / 2 * 16383);
    let msb = fine >> 7 & 127;
    let lsb = fine & 127;
    this.sendRpnValue("channelcoarsetuning", coarse, options);
    this.sendRpnValue("channelfinetuning", [msb, lsb], options);
    return this;
  }
  sendModulationRange(semitones, cents, options = {}) {
    if (wm.validation) {
      if (!Number.isInteger(semitones) || !(semitones >= 0 && semitones <= 127)) {
        throw new RangeError("The semitones value must be an integer between 0 and 127.");
      }
      if (!(cents == void 0) && (!Number.isInteger(cents) || !(cents >= 0 && cents <= 127))) {
        throw new RangeError("If specified, the cents value must be an integer between 0 and 127.");
      }
    }
    if (!(cents >= 0 && cents <= 127))
      cents = 0;
    this.sendRpnValue("modulationrange", [semitones, cents], options);
    return this;
  }
  sendNrpnValue(nrpn, data, options = {}) {
    data = [].concat(data);
    if (wm.validation) {
      if (!Array.isArray(nrpn) || !Number.isInteger(nrpn[0]) || !Number.isInteger(nrpn[1])) {
        throw new TypeError("The specified NRPN is invalid.");
      }
      if (!(nrpn[0] >= 0 && nrpn[0] <= 127)) {
        throw new RangeError("The first byte of the NRPN must be between 0 and 127.");
      }
      if (!(nrpn[1] >= 0 && nrpn[1] <= 127)) {
        throw new RangeError("The second byte of the NRPN must be between 0 and 127.");
      }
      data.forEach((value) => {
        if (!(value >= 0 && value <= 127)) {
          throw new RangeError("The data bytes of the NRPN must be between 0 and 127.");
        }
      });
    }
    this._selectNonRegisteredParameter(nrpn, options);
    this._setCurrentParameter(data, options);
    this._deselectNonRegisteredParameter(options);
    return this;
  }
  sendPitchBend(value, options = {}) {
    if (wm.validation) {
      if (options.rawValue && Array.isArray(value)) {
        if (!(value[0] >= 0 && value[0] <= 127)) {
          throw new RangeError("The pitch bend MSB must be an integer between 0 and 127.");
        }
        if (!(value[1] >= 0 && value[1] <= 127)) {
          throw new RangeError("The pitch bend LSB must be an integer between 0 and 127.");
        }
      } else if (options.rawValue && !Array.isArray(value)) {
        if (!(value >= 0 && value <= 127)) {
          throw new RangeError("The pitch bend MSB must be an integer between 0 and 127.");
        }
      } else {
        if (isNaN(value) || value === null) {
          throw new RangeError("Invalid pitch bend value.");
        }
        if (!(value >= -1 && value <= 1)) {
          throw new RangeError("The pitch bend value must be a float between -1 and 1.");
        }
      }
    }
    let msb = 0;
    let lsb = 0;
    if (options.rawValue && Array.isArray(value)) {
      msb = value[0];
      lsb = value[1];
    } else if (options.rawValue && !Array.isArray(value)) {
      msb = value;
    } else {
      const result = Utilities.fromFloatToMsbLsb((value + 1) / 2);
      msb = result.msb;
      lsb = result.lsb;
    }
    this.send(
      [
        (Enumerations.CHANNEL_MESSAGES.pitchbend << 4) + (this.number - 1),
        lsb,
        msb
      ],
      { time: Utilities.toTimestamp(options.time) }
    );
    return this;
  }
  sendPitchBendRange(semitones, cents, options = {}) {
    if (wm.validation) {
      if (!Number.isInteger(semitones) || !(semitones >= 0 && semitones <= 127)) {
        throw new RangeError("The semitones value must be an integer between 0 and 127.");
      }
      if (!Number.isInteger(cents) || !(cents >= 0 && cents <= 127)) {
        throw new RangeError("The cents value must be an integer between 0 and 127.");
      }
    }
    this.sendRpnValue("pitchbendrange", [semitones, cents], options);
    return this;
  }
  sendProgramChange(program, options = {}) {
    program = parseInt(program) || 0;
    if (wm.validation) {
      if (!(program >= 0 && program <= 127)) {
        throw new RangeError("The program number must be between 0 and 127.");
      }
    }
    this.send(
      [
        (Enumerations.CHANNEL_MESSAGES.programchange << 4) + (this.number - 1),
        program
      ],
      { time: Utilities.toTimestamp(options.time) }
    );
    return this;
  }
  sendRpnValue(rpn, data, options = {}) {
    if (!Array.isArray(rpn))
      rpn = Enumerations.REGISTERED_PARAMETERS[rpn];
    if (wm.validation) {
      if (!Number.isInteger(rpn[0]) || !Number.isInteger(rpn[1])) {
        throw new TypeError("The specified NRPN is invalid.");
      }
      if (!(rpn[0] >= 0 && rpn[0] <= 127)) {
        throw new RangeError("The first byte of the RPN must be between 0 and 127.");
      }
      if (!(rpn[1] >= 0 && rpn[1] <= 127)) {
        throw new RangeError("The second byte of the RPN must be between 0 and 127.");
      }
      [].concat(data).forEach((value) => {
        if (!(value >= 0 && value <= 127)) {
          throw new RangeError("The data bytes of the RPN must be between 0 and 127.");
        }
      });
    }
    this._selectRegisteredParameter(rpn, options);
    this._setCurrentParameter(data, options);
    this._deselectRegisteredParameter(options);
    return this;
  }
  sendTuningBank(value, options = {}) {
    if (wm.validation) {
      if (!Number.isInteger(value) || !(value >= 0 && value <= 127)) {
        throw new RangeError("The tuning bank number must be between 0 and 127.");
      }
    }
    this.sendRpnValue("tuningbank", value, options);
    return this;
  }
  sendTuningProgram(value, options = {}) {
    if (wm.validation) {
      if (!Number.isInteger(value) || !(value >= 0 && value <= 127)) {
        throw new RangeError("The tuning program number must be between 0 and 127.");
      }
    }
    this.sendRpnValue("tuningprogram", value, options);
    return this;
  }
  sendLocalControl(state, options = {}) {
    if (state) {
      return this.sendChannelMode("localcontrol", 127, options);
    } else {
      return this.sendChannelMode("localcontrol", 0, options);
    }
  }
  sendAllNotesOff(options = {}) {
    return this.sendChannelMode("allnotesoff", 0, options);
  }
  sendAllSoundOff(options = {}) {
    return this.sendChannelMode("allsoundoff", 0, options);
  }
  sendResetAllControllers(options = {}) {
    return this.sendChannelMode("resetallcontrollers", 0, options);
  }
  sendPolyphonicMode(mode, options = {}) {
    if (mode === "mono") {
      return this.sendChannelMode("monomodeon", 0, options);
    } else {
      return this.sendChannelMode("polymodeon", 0, options);
    }
  }
  get octaveOffset() {
    return this._octaveOffset;
  }
  set octaveOffset(value) {
    if (this.validation) {
      value = parseInt(value);
      if (isNaN(value))
        throw new TypeError("The 'octaveOffset' property must be an integer.");
    }
    this._octaveOffset = value;
  }
  get output() {
    return this._output;
  }
  get number() {
    return this._number;
  }
}
/**
 * The `Output` class represents a single MIDI output port (not to be confused with a MIDI channel).
 * A port is made available by a MIDI device. A MIDI device can advertise several input and output
 * ports. Each port has 16 MIDI channels which can be accessed via the [`channels`](#channels)
 * property.
 *
 * The `Output` object is automatically instantiated by the library according to the host's MIDI
 * subsystem and should not be directly instantiated.
 *
 * You can access all available `Output` objects by referring to the
 * [`WebMidi.outputs`](WebMidi#outputs) array or by using methods such as
 * [`WebMidi.getOutputByName()`](WebMidi#getOutputByName) or
 * [`WebMidi.getOutputById()`](WebMidi#getOutputById).
 *
 * @fires Output#opened
 * @fires Output#disconnected
 * @fires Output#closed
 *
 * @extends EventEmitter
 * @license Apache-2.0
 */
class Output extends EventEmitter {
  constructor(midiOutput) {
    super();
    this._midiOutput = midiOutput;
    this._octaveOffset = 0;
    this.channels = [];
    for (let i = 1; i <= 16; i++)
      this.channels[i] = new OutputChannel(this, i);
    this._midiOutput.onstatechange = this._onStateChange.bind(this);
  }
  destroy() {
    return __async(this, null, function* () {
      this.removeListener();
      this.channels.forEach((ch) => ch.destroy());
      this.channels = [];
      if (this._midiOutput)
        this._midiOutput.onstatechange = null;
      yield this.close();
      this._midiOutput = null;
    });
  }
  _onStateChange(e) {
    let event = {
      timestamp: wm.time
    };
    if (e.port.connection === "open") {
      event.type = "opened";
      event.target = this;
      event.port = event.target;
      this.emit("opened", event);
    } else if (e.port.connection === "closed" && e.port.state === "connected") {
      event.type = "closed";
      event.target = this;
      event.port = event.target;
      this.emit("closed", event);
    } else if (e.port.connection === "closed" && e.port.state === "disconnected") {
      event.type = "disconnected";
      event.port = {
        connection: e.port.connection,
        id: e.port.id,
        manufacturer: e.port.manufacturer,
        name: e.port.name,
        state: e.port.state,
        type: e.port.type
      };
      this.emit("disconnected", event);
    } else if (e.port.connection === "pending" && e.port.state === "disconnected")
      ;
    else {
      console.warn("This statechange event was not caught:", e.port.connection, e.port.state);
    }
  }
  open() {
    return __async(this, null, function* () {
      try {
        yield this._midiOutput.open();
        return Promise.resolve(this);
      } catch (err) {
        return Promise.reject(err);
      }
    });
  }
  close() {
    return __async(this, null, function* () {
      if (this._midiOutput) {
        yield this._midiOutput.close();
      } else {
        yield Promise.resolve();
      }
    });
  }
  send(message, options = { time: 0 }, legacy = 0) {
    if (message instanceof Message) {
      message = Utilities.isNode ? message.data : message.rawData;
    }
    if (message instanceof Uint8Array && Utilities.isNode) {
      message = Array.from(message);
    }
    if (wm.validation) {
      if (!Array.isArray(message) && !(message instanceof Uint8Array)) {
        message = [message];
        if (Array.isArray(options))
          message = message.concat(options);
        options = isNaN(legacy) ? { time: 0 } : { time: legacy };
      }
      if (!(parseInt(message[0]) >= 128 && parseInt(message[0]) <= 255)) {
        throw new RangeError("The first byte (status) must be an integer between 128 and 255.");
      }
      message.slice(1).forEach((value) => {
        value = parseInt(value);
        if (!(value >= 0 && value <= 255)) {
          throw new RangeError("Data bytes must be integers between 0 and 255.");
        }
      });
      if (!options)
        options = { time: 0 };
    }
    this._midiOutput.send(message, Utilities.toTimestamp(options.time));
    return this;
  }
  sendSysex(identification, data = [], options = {}) {
    identification = [].concat(identification);
    if (data instanceof Uint8Array) {
      const merged = new Uint8Array(1 + identification.length + data.length + 1);
      merged[0] = Enumerations.SYSTEM_MESSAGES.sysex;
      merged.set(Uint8Array.from(identification), 1);
      merged.set(data, 1 + identification.length);
      merged[merged.length - 1] = Enumerations.SYSTEM_MESSAGES.sysexend;
      this.send(merged, { time: options.time });
    } else {
      const merged = identification.concat(data, Enumerations.SYSTEM_MESSAGES.sysexend);
      this.send([Enumerations.SYSTEM_MESSAGES.sysex].concat(merged), { time: options.time });
    }
    return this;
  }
  clear() {
    if (this._midiOutput.clear) {
      this._midiOutput.clear();
    } else {
      if (wm.validation) {
        console.warn(
          "The 'clear()' method has not yet been implemented in your environment."
        );
      }
    }
    return this;
  }
  sendTimecodeQuarterFrame(value, options = {}) {
    if (wm.validation) {
      value = parseInt(value);
      if (isNaN(value) || !(value >= 0 && value <= 127)) {
        throw new RangeError("The value must be an integer between 0 and 127.");
      }
    }
    this.send(
      [
        Enumerations.SYSTEM_MESSAGES.timecode,
        value
      ],
      { time: options.time }
    );
    return this;
  }
  sendSongPosition(value = 0, options = {}) {
    value = Math.floor(value) || 0;
    var msb = value >> 7 & 127;
    var lsb = value & 127;
    this.send(
      [
        Enumerations.SYSTEM_MESSAGES.songposition,
        msb,
        lsb
      ],
      { time: options.time }
    );
    return this;
  }
  sendSongSelect(value = 0, options = {}) {
    if (wm.validation) {
      value = parseInt(value);
      if (isNaN(value) || !(value >= 0 && value <= 127)) {
        throw new RangeError("The program value must be between 0 and 127");
      }
    }
    this.send(
      [
        Enumerations.SYSTEM_MESSAGES.songselect,
        value
      ],
      { time: options.time }
    );
    return this;
  }
  sendTuneRequest(options = {}) {
    this.send(
      [Enumerations.SYSTEM_MESSAGES.tunerequest],
      { time: options.time }
    );
    return this;
  }
  sendClock(options = {}) {
    this.send(
      [Enumerations.SYSTEM_MESSAGES.clock],
      { time: options.time }
    );
    return this;
  }
  sendStart(options = {}) {
    this.send(
      [Enumerations.SYSTEM_MESSAGES.start],
      { time: options.time }
    );
    return this;
  }
  sendContinue(options = {}) {
    this.send(
      [Enumerations.SYSTEM_MESSAGES.continue],
      { time: options.time }
    );
    return this;
  }
  sendStop(options = {}) {
    this.send(
      [Enumerations.SYSTEM_MESSAGES.stop],
      { time: options.time }
    );
    return this;
  }
  sendActiveSensing(options = {}) {
    this.send(
      [Enumerations.SYSTEM_MESSAGES.activesensing],
      { time: options.time }
    );
    return this;
  }
  sendReset(options = {}) {
    this.send(
      [Enumerations.SYSTEM_MESSAGES.reset],
      { time: options.time }
    );
    return this;
  }
  sendTuningRequest(options = {}) {
    if (wm.validation) {
      console.warn(
        "The sendTuningRequest() method has been deprecated. Use sendTuningRequest() instead."
      );
    }
    return this.sendTuneRequest(options);
  }
  sendKeyAftertouch(note, pressure, options = {}) {
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendKeyAftertouch(note, pressure, options);
    });
    return this;
  }
  sendControlChange(controller, value, options = {}, legacy = {}) {
    if (wm.validation) {
      if (Array.isArray(options) || Number.isInteger(options) || options === "all") {
        const channels = options;
        options = legacy;
        options.channels = channels;
        if (options.channels === "all")
          options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      }
    }
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendControlChange(controller, value, options);
    });
    return this;
  }
  sendPitchBendRange(semitones = 0, cents = 0, options = {}) {
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendPitchBendRange(semitones, cents, options);
    });
    return this;
  }
  setPitchBendRange(semitones = 0, cents = 0, channel = "all", options = {}) {
    if (wm.validation) {
      console.warn(
        "The setPitchBendRange() method is deprecated. Use sendPitchBendRange() instead."
      );
      options.channels = channel;
      if (options.channels === "all")
        options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    }
    return this.sendPitchBendRange(semitones, cents, options);
  }
  sendRpnValue(parameter, data, options = {}) {
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendRpnValue(parameter, data, options);
    });
    return this;
  }
  setRegisteredParameter(parameter, data = [], channel = "all", options = {}) {
    if (wm.validation) {
      console.warn(
        "The setRegisteredParameter() method is deprecated. Use sendRpnValue() instead."
      );
      options.channels = channel;
      if (options.channels === "all")
        options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    }
    return this.sendRpnValue(parameter, data, options);
  }
  sendChannelAftertouch(pressure, options = {}, legacy = {}) {
    if (wm.validation) {
      if (Array.isArray(options) || Number.isInteger(options) || options === "all") {
        const channels = options;
        options = legacy;
        options.channels = channels;
        if (options.channels === "all")
          options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      }
    }
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendChannelAftertouch(pressure, options);
    });
    return this;
  }
  sendPitchBend(value, options = {}, legacy = {}) {
    if (wm.validation) {
      if (Array.isArray(options) || Number.isInteger(options) || options === "all") {
        const channels = options;
        options = legacy;
        options.channels = channels;
        if (options.channels === "all")
          options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      }
    }
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendPitchBend(value, options);
    });
    return this;
  }
  sendProgramChange(program = 0, options = {}, legacy = {}) {
    if (wm.validation) {
      if (Array.isArray(options) || Number.isInteger(options) || options === "all") {
        const channels = options;
        options = legacy;
        options.channels = channels;
        if (options.channels === "all")
          options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      }
    }
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendProgramChange(program, options);
    });
    return this;
  }
  sendModulationRange(semitones, cents, options = {}) {
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendModulationRange(semitones, cents, options);
    });
    return this;
  }
  setModulationRange(semitones = 0, cents = 0, channel = "all", options = {}) {
    if (wm.validation) {
      console.warn(
        "The setModulationRange() method is deprecated. Use sendModulationRange() instead."
      );
      options.channels = channel;
      if (options.channels === "all")
        options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    }
    return this.sendModulationRange(semitones, cents, options);
  }
  sendMasterTuning(value, options = {}) {
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendMasterTuning(value, options);
    });
    return this;
  }
  setMasterTuning(value, channel = {}, options = {}) {
    if (wm.validation) {
      console.warn(
        "The setMasterTuning() method is deprecated. Use sendMasterTuning() instead."
      );
      options.channels = channel;
      if (options.channels === "all")
        options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    }
    return this.sendMasterTuning(value, options);
  }
  sendTuningProgram(value, options = {}) {
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendTuningProgram(value, options);
    });
    return this;
  }
  setTuningProgram(value, channel = "all", options = {}) {
    if (wm.validation) {
      console.warn(
        "The setTuningProgram() method is deprecated. Use sendTuningProgram() instead."
      );
      options.channels = channel;
      if (options.channels === "all")
        options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    }
    return this.sendTuningProgram(value, options);
  }
  sendTuningBank(value = 0, options = {}) {
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendTuningBank(value, options);
    });
    return this;
  }
  setTuningBank(parameter, channel = "all", options = {}) {
    if (wm.validation) {
      console.warn(
        "The setTuningBank() method is deprecated. Use sendTuningBank() instead."
      );
      options.channels = channel;
      if (options.channels === "all")
        options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    }
    return this.sendTuningBank(parameter, options);
  }
  sendChannelMode(command, value = 0, options = {}, legacy = {}) {
    if (wm.validation) {
      if (Array.isArray(options) || Number.isInteger(options) || options === "all") {
        const channels = options;
        options = legacy;
        options.channels = channels;
        if (options.channels === "all")
          options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      }
    }
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendChannelMode(command, value, options);
    });
    return this;
  }
  sendAllSoundOff(options = {}) {
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendAllSoundOff(options);
    });
    return this;
  }
  sendAllNotesOff(options = {}) {
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendAllNotesOff(options);
    });
    return this;
  }
  sendResetAllControllers(options = {}, legacy = {}) {
    if (wm.validation) {
      if (Array.isArray(options) || Number.isInteger(options) || options === "all") {
        const channels = options;
        options = legacy;
        options.channels = channels;
        if (options.channels === "all")
          options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      }
    }
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendResetAllControllers(options);
    });
    return this;
  }
  sendPolyphonicMode(mode, options = {}, legacy = {}) {
    if (wm.validation) {
      if (Array.isArray(options) || Number.isInteger(options) || options === "all") {
        const channels = options;
        options = legacy;
        options.channels = channels;
        if (options.channels === "all")
          options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      }
    }
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendPolyphonicMode(mode, options);
    });
    return this;
  }
  sendLocalControl(state, options = {}, legacy = {}) {
    if (wm.validation) {
      if (Array.isArray(options) || Number.isInteger(options) || options === "all") {
        const channels = options;
        options = legacy;
        options.channels = channels;
        if (options.channels === "all")
          options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      }
    }
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendLocalControl(state, options);
    });
    return this;
  }
  sendOmniMode(state, options = {}, legacy = {}) {
    if (wm.validation) {
      if (Array.isArray(options) || Number.isInteger(options) || options === "all") {
        const channels = options;
        options = legacy;
        options.channels = channels;
        if (options.channels === "all")
          options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      }
    }
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendOmniMode(state, options);
    });
    return this;
  }
  sendNrpnValue(parameter, data, options = {}) {
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendNrpnValue(parameter, data, options);
    });
    return this;
  }
  setNonRegisteredParameter(parameter, data = [], channel = "all", options = {}) {
    if (wm.validation) {
      console.warn(
        "The setNonRegisteredParameter() method is deprecated. Use sendNrpnValue() instead."
      );
      options.channels = channel;
      if (options.channels === "all")
        options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    }
    return this.sendNrpnValue(parameter, data, options);
  }
  sendRpnIncrement(parameter, options = {}) {
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendRpnIncrement(parameter, options);
    });
    return this;
  }
  incrementRegisteredParameter(parameter, channel = "all", options = {}) {
    if (wm.validation) {
      console.warn(
        "The incrementRegisteredParameter() method is deprecated. Use sendRpnIncrement() instead."
      );
      options.channels = channel;
      if (options.channels === "all")
        options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    }
    return this.sendRpnIncrement(parameter, options);
  }
  sendRpnDecrement(parameter, options = {}) {
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendRpnDecrement(parameter, options);
    });
    return this;
  }
  decrementRegisteredParameter(parameter, channel = "all", options = {}) {
    if (wm.validation) {
      console.warn(
        "The decrementRegisteredParameter() method is deprecated. Use sendRpnDecrement() instead."
      );
      options.channels = channel;
      if (options.channels === "all")
        options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    }
    return this.sendRpnDecrement(parameter, options);
  }
  sendNoteOff(note, options = {}, legacy = {}) {
    if (wm.validation) {
      if (Array.isArray(options) || Number.isInteger(options) || options === "all") {
        const channels = options;
        options = legacy;
        options.channels = channels;
        if (options.channels === "all")
          options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      }
    }
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendNoteOff(note, options);
    });
    return this;
  }
  stopNote(note, options) {
    return this.sendNoteOff(note, options);
  }
  playNote(note, options = {}, legacy = {}) {
    if (wm.validation) {
      if (options.rawVelocity) {
        console.warn("The 'rawVelocity' option is deprecated. Use 'rawAttack' instead.");
      }
      if (options.velocity) {
        console.warn("The 'velocity' option is deprecated. Use 'velocity' instead.");
      }
      if (Array.isArray(options) || Number.isInteger(options) || options === "all") {
        const channels = options;
        options = legacy;
        options.channels = channels;
        if (options.channels === "all")
          options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      }
    }
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].playNote(note, options);
    });
    return this;
  }
  sendNoteOn(note, options = {}, legacy = {}) {
    if (wm.validation) {
      if (Array.isArray(options) || Number.isInteger(options) || options === "all") {
        const channels = options;
        options = legacy;
        options.channels = channels;
        if (options.channels === "all")
          options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      }
    }
    if (options.channels == void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    Utilities.sanitizeChannels(options.channels).forEach((ch) => {
      this.channels[ch].sendNoteOn(note, options);
    });
    return this;
  }
  get name() {
    return this._midiOutput.name;
  }
  get id() {
    return this._midiOutput.id;
  }
  get connection() {
    return this._midiOutput.connection;
  }
  get manufacturer() {
    return this._midiOutput.manufacturer;
  }
  get state() {
    return this._midiOutput.state;
  }
  get type() {
    return this._midiOutput.type;
  }
  get octaveOffset() {
    return this._octaveOffset;
  }
  set octaveOffset(value) {
    if (this.validation) {
      value = parseInt(value);
      if (isNaN(value))
        throw new TypeError("The 'octaveOffset' property must be an integer.");
    }
    this._octaveOffset = value;
  }
}
/**
 * The `Forwarder` class allows the forwarding of MIDI messages to predetermined outputs. When you
 * call its [`forward()`](#forward) method, it will send the specified [`Message`](Message) object
 * to all the outputs listed in its [`destinations`](#destinations) property.
 *
 * If specific channels or message types have been defined in the [`channels`](#channels) or
 * [`types`](#types) properties, only messages matching the channels/types will be forwarded.
 *
 * While it can be manually instantiated, you are more likely to come across a `Forwarder` object as
 * the return value of the [`Input.addForwarder()`](Input#addForwarder) method.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */
class Forwarder {
  constructor(destinations = [], options = {}) {
    this.destinations = [];
    this.types = [
      ...Object.keys(Enumerations.SYSTEM_MESSAGES),
      ...Object.keys(Enumerations.CHANNEL_MESSAGES)
    ];
    this.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    this.suspended = false;
    if (!Array.isArray(destinations))
      destinations = [destinations];
    if (options.types && !Array.isArray(options.types))
      options.types = [options.types];
    if (options.channels && !Array.isArray(options.channels))
      options.channels = [options.channels];
    if (wm.validation) {
      destinations.forEach((destination) => {
        if (!(destination instanceof Output)) {
          throw new TypeError("Destinations must be of type 'Output'.");
        }
      });
      if (options.types !== void 0) {
        options.types.forEach((type) => {
          if (!Enumerations.SYSTEM_MESSAGES.hasOwnProperty(type) && !Enumerations.CHANNEL_MESSAGES.hasOwnProperty(type)) {
            throw new TypeError("Type must be a valid message type.");
          }
        });
      }
      if (options.channels !== void 0) {
        options.channels.forEach((channel) => {
          if (!Enumerations.MIDI_CHANNEL_NUMBERS.includes(channel)) {
            throw new TypeError("MIDI channel must be between 1 and 16.");
          }
        });
      }
    }
    this.destinations = destinations;
    if (options.types)
      this.types = options.types;
    if (options.channels)
      this.channels = options.channels;
  }
  forward(message) {
    if (this.suspended)
      return;
    if (!this.types.includes(message.type))
      return;
    if (message.channel && !this.channels.includes(message.channel))
      return;
    this.destinations.forEach((destination) => {
      if (wm.validation && !(destination instanceof Output))
        return;
      destination.send(message);
    });
  }
}
/**
 * The `InputChannel` class represents a single MIDI input channel (1-16) from a single input
 * device. This object is derived from the host's MIDI subsystem and should not be instantiated
 * directly.
 *
 * All 16 `InputChannel` objects can be found inside the input's [`channels`](Input#channels)
 * property.
 *
 * @fires InputChannel#midimessage
 * @fires InputChannel#unknownmessage
 *
 * @fires InputChannel#noteoff
 * @fires InputChannel#noteon
 * @fires InputChannel#keyaftertouch
 * @fires InputChannel#programchange
 * @fires InputChannel#channelaftertouch
 * @fires InputChannel#pitchbend
 *
 * @fires InputChannel#allnotesoff
 * @fires InputChannel#allsoundoff
 * @fires InputChannel#localcontrol
 * @fires InputChannel#monomode
 * @fires InputChannel#omnimode
 * @fires InputChannel#resetallcontrollers
 *
 * @fires InputChannel#event:nrpn
 * @fires InputChannel#event:nrpn-dataentrycoarse
 * @fires InputChannel#event:nrpn-dataentryfine
 * @fires InputChannel#event:nrpn-dataincrement
 * @fires InputChannel#event:nrpn-datadecrement
 * @fires InputChannel#event:rpn
 * @fires InputChannel#event:rpn-dataentrycoarse
 * @fires InputChannel#event:rpn-dataentryfine
 * @fires InputChannel#event:rpn-dataincrement
 * @fires InputChannel#event:rpn-datadecrement
 *
 * @fires InputChannel#controlchange
 * @fires InputChannel#event:controlchange-controllerxxx
 * @fires InputChannel#event:controlchange-bankselectcoarse
 * @fires InputChannel#event:controlchange-modulationwheelcoarse
 * @fires InputChannel#event:controlchange-breathcontrollercoarse
 * @fires InputChannel#event:controlchange-footcontrollercoarse
 * @fires InputChannel#event:controlchange-portamentotimecoarse
 * @fires InputChannel#event:controlchange-dataentrycoarse
 * @fires InputChannel#event:controlchange-volumecoarse
 * @fires InputChannel#event:controlchange-balancecoarse
 * @fires InputChannel#event:controlchange-pancoarse
 * @fires InputChannel#event:controlchange-expressioncoarse
 * @fires InputChannel#event:controlchange-effectcontrol1coarse
 * @fires InputChannel#event:controlchange-effectcontrol2coarse
 * @fires InputChannel#event:controlchange-generalpurposecontroller1
 * @fires InputChannel#event:controlchange-generalpurposecontroller2
 * @fires InputChannel#event:controlchange-generalpurposecontroller3
 * @fires InputChannel#event:controlchange-generalpurposecontroller4
 * @fires InputChannel#event:controlchange-bankselectfine
 * @fires InputChannel#event:controlchange-modulationwheelfine
 * @fires InputChannel#event:controlchange-breathcontrollerfine
 * @fires InputChannel#event:controlchange-footcontrollerfine
 * @fires InputChannel#event:controlchange-portamentotimefine
 * @fires InputChannel#event:controlchange-dataentryfine
 * @fires InputChannel#event:controlchange-channelvolumefine
 * @fires InputChannel#event:controlchange-balancefine
 * @fires InputChannel#event:controlchange-panfine
 * @fires InputChannel#event:controlchange-expressionfine
 * @fires InputChannel#event:controlchange-effectcontrol1fine
 * @fires InputChannel#event:controlchange-effectcontrol2fine
 * @fires InputChannel#event:controlchange-damperpedal
 * @fires InputChannel#event:controlchange-portamento
 * @fires InputChannel#event:controlchange-sostenuto
 * @fires InputChannel#event:controlchange-softpedal
 * @fires InputChannel#event:controlchange-legatopedal
 * @fires InputChannel#event:controlchange-hold2
 * @fires InputChannel#event:controlchange-soundvariation
 * @fires InputChannel#event:controlchange-resonance
 * @fires InputChannel#event:controlchange-releasetime
 * @fires InputChannel#event:controlchange-attacktime
 * @fires InputChannel#event:controlchange-brightness
 * @fires InputChannel#event:controlchange-decaytime
 * @fires InputChannel#event:controlchange-vibratorate
 * @fires InputChannel#event:controlchange-vibratodepth
 * @fires InputChannel#event:controlchange-vibratodelay
 * @fires InputChannel#event:controlchange-generalpurposecontroller5
 * @fires InputChannel#event:controlchange-generalpurposecontroller6
 * @fires InputChannel#event:controlchange-generalpurposecontroller7
 * @fires InputChannel#event:controlchange-generalpurposecontroller8
 * @fires InputChannel#event:controlchange-portamentocontrol
 * @fires InputChannel#event:controlchange-highresolutionvelocityprefix
 * @fires InputChannel#event:controlchange-effect1depth
 * @fires InputChannel#event:controlchange-effect2depth
 * @fires InputChannel#event:controlchange-effect3depth
 * @fires InputChannel#event:controlchange-effect4depth
 * @fires InputChannel#event:controlchange-effect5depth
 * @fires InputChannel#event:controlchange-dataincrement
 * @fires InputChannel#event:controlchange-datadecrement
 * @fires InputChannel#event:controlchange-nonregisteredparameterfine
 * @fires InputChannel#event:controlchange-nonregisteredparametercoarse
 * @fires InputChannel#event:controlchange-registeredparameterfine
 * @fires InputChannel#event:controlchange-registeredparametercoarse
 * @fires InputChannel#event:controlchange-allsoundoff
 * @fires InputChannel#event:controlchange-resetallcontrollers
 * @fires InputChannel#event:controlchange-localcontrol
 * @fires InputChannel#event:controlchange-allnotesoff
 * @fires InputChannel#event:controlchange-omnimodeoff
 * @fires InputChannel#event:controlchange-omnimodeon
 * @fires InputChannel#event:controlchange-monomodeon
 * @fires InputChannel#event:controlchange-polymodeon
 * @fires InputChannel#event:
 *
 * @extends EventEmitter
 * @license Apache-2.0
 * @since 3.0.0
 */
class InputChannel extends EventEmitter {
  constructor(input, number) {
    super();
    this._input = input;
    this._number = number;
    this._octaveOffset = 0;
    this._nrpnBuffer = [];
    this._rpnBuffer = [];
    this.parameterNumberEventsEnabled = true;
    this.notesState = new Array(128).fill(false);
  }
  destroy() {
    this._input = null;
    this._number = null;
    this._octaveOffset = 0;
    this._nrpnBuffer = [];
    this.notesState = new Array(128).fill(false);
    this.parameterNumberEventsEnabled = false;
    this.removeListener();
  }
  _processMidiMessageEvent(e) {
    const event = Object.assign({}, e);
    event.port = this.input;
    event.target = this;
    event.type = "midimessage";
    this.emit(event.type, event);
    this._parseEventForStandardMessages(event);
  }
  _parseEventForStandardMessages(e) {
    const event = Object.assign({}, e);
    event.type = event.message.type || "unknownmessage";
    const data1 = e.message.dataBytes[0];
    const data2 = e.message.dataBytes[1];
    if (event.type === "noteoff" || event.type === "noteon" && data2 === 0) {
      this.notesState[data1] = false;
      event.type = "noteoff";
      event.note = new Note(
        Utilities.offsetNumber(
          data1,
          this.octaveOffset + this.input.octaveOffset + wm.octaveOffset
        ),
        {
          rawAttack: 0,
          rawRelease: data2
        }
      );
      event.value = Utilities.from7bitToFloat(data2);
      event.rawValue = data2;
      event.velocity = event.note.release;
      event.rawVelocity = event.note.rawRelease;
    } else if (event.type === "noteon") {
      this.notesState[data1] = true;
      event.note = new Note(
        Utilities.offsetNumber(
          data1,
          this.octaveOffset + this.input.octaveOffset + wm.octaveOffset
        ),
        { rawAttack: data2 }
      );
      event.value = Utilities.from7bitToFloat(data2);
      event.rawValue = data2;
      event.velocity = event.note.attack;
      event.rawVelocity = event.note.rawAttack;
    } else if (event.type === "keyaftertouch") {
      event.note = new Note(
        Utilities.offsetNumber(
          data1,
          this.octaveOffset + this.input.octaveOffset + wm.octaveOffset
        )
      );
      event.value = Utilities.from7bitToFloat(data2);
      event.rawValue = data2;
      event.identifier = event.note.identifier;
      event.key = event.note.number;
      event.rawKey = data1;
    } else if (event.type === "controlchange") {
      event.controller = {
        number: data1,
        name: Enumerations.CONTROL_CHANGE_MESSAGES[data1].name,
        description: Enumerations.CONTROL_CHANGE_MESSAGES[data1].description,
        position: Enumerations.CONTROL_CHANGE_MESSAGES[data1].position
      };
      event.subtype = event.controller.name || "controller" + data1;
      event.value = Utilities.from7bitToFloat(data2);
      event.rawValue = data2;
      const numberedEvent = Object.assign({}, event);
      numberedEvent.type = `${event.type}-controller${data1}`;
      delete numberedEvent.subtype;
      this.emit(numberedEvent.type, numberedEvent);
      const namedEvent = Object.assign({}, event);
      namedEvent.type = `${event.type}-` + Enumerations.CONTROL_CHANGE_MESSAGES[data1].name;
      delete namedEvent.subtype;
      if (namedEvent.type.indexOf("controller") !== 0) {
        this.emit(namedEvent.type, namedEvent);
      }
      if (event.message.dataBytes[0] >= 120)
        this._parseChannelModeMessage(event);
      if (this.parameterNumberEventsEnabled && this._isRpnOrNrpnController(event.message.dataBytes[0])) {
        this._parseEventForParameterNumber(event);
      }
    } else if (event.type === "programchange") {
      event.value = data1;
      event.rawValue = event.value;
    } else if (event.type === "channelaftertouch") {
      event.value = Utilities.from7bitToFloat(data1);
      event.rawValue = data1;
    } else if (event.type === "pitchbend") {
      event.value = ((data2 << 7) + data1 - 8192) / 8192;
      event.rawValue = (data2 << 7) + data1;
    } else {
      event.type = "unknownmessage";
    }
    this.emit(event.type, event);
  }
  _parseChannelModeMessage(e) {
    const event = Object.assign({}, e);
    event.type = event.controller.name;
    if (event.type === "localcontrol") {
      event.value = event.message.data[2] === 127 ? true : false;
      event.rawValue = event.message.data[2];
    }
    if (event.type === "omnimodeon") {
      event.type = "omnimode";
      event.value = true;
      event.rawValue = event.message.data[2];
    } else if (event.type === "omnimodeoff") {
      event.type = "omnimode";
      event.value = false;
      event.rawValue = event.message.data[2];
    }
    if (event.type === "monomodeon") {
      event.type = "monomode";
      event.value = true;
      event.rawValue = event.message.data[2];
    } else if (event.type === "polymodeon") {
      event.type = "monomode";
      event.value = false;
      event.rawValue = event.message.data[2];
    }
    this.emit(event.type, event);
  }
  _parseEventForParameterNumber(event) {
    const controller = event.message.dataBytes[0];
    const value = event.message.dataBytes[1];
    if (controller === 99 || controller === 101) {
      this._nrpnBuffer = [];
      this._rpnBuffer = [];
      if (controller === 99) {
        this._nrpnBuffer = [event.message];
      } else {
        if (value !== 127)
          this._rpnBuffer = [event.message];
      }
    } else if (controller === 98 || controller === 100) {
      if (controller === 98) {
        this._rpnBuffer = [];
        if (this._nrpnBuffer.length === 1) {
          this._nrpnBuffer.push(event.message);
        } else {
          this._nrpnBuffer = [];
        }
      } else {
        this._nrpnBuffer = [];
        if (this._rpnBuffer.length === 1 && value !== 127) {
          this._rpnBuffer.push(event.message);
        } else {
          this._rpnBuffer = [];
        }
      }
    } else if (controller === 6 || controller === 38 || controller === 96 || controller === 97) {
      if (this._rpnBuffer.length === 2) {
        this._dispatchParameterNumberEvent(
          "rpn",
          this._rpnBuffer[0].dataBytes[1],
          this._rpnBuffer[1].dataBytes[1],
          event
        );
      } else if (this._nrpnBuffer.length === 2) {
        this._dispatchParameterNumberEvent(
          "nrpn",
          this._nrpnBuffer[0].dataBytes[1],
          this._nrpnBuffer[1].dataBytes[1],
          event
        );
      } else {
        this._nrpnBuffer = [];
        this._rpnBuffer = [];
      }
    }
  }
  _isRpnOrNrpnController(controller) {
    return controller === 6 || controller === 38 || controller === 96 || controller === 97 || controller === 98 || controller === 99 || controller === 100 || controller === 101;
  }
  _dispatchParameterNumberEvent(type, paramMsb, paramLsb, e) {
    type = type === "nrpn" ? "nrpn" : "rpn";
    const event = {
      target: e.target,
      timestamp: e.timestamp,
      message: e.message,
      parameterMsb: paramMsb,
      parameterLsb: paramLsb,
      value: Utilities.from7bitToFloat(e.message.dataBytes[1]),
      rawValue: e.message.dataBytes[1]
    };
    if (type === "rpn") {
      event.parameter = Object.keys(Enumerations.REGISTERED_PARAMETERS).find((key) => {
        return Enumerations.REGISTERED_PARAMETERS[key][0] === paramMsb && Enumerations.REGISTERED_PARAMETERS[key][1] === paramLsb;
      });
    } else {
      event.parameter = (paramMsb << 7) + paramLsb;
    }
    const subtype = Enumerations.CONTROL_CHANGE_MESSAGES[e.message.dataBytes[0]].name;
    event.type = `${type}-${subtype}`;
    this.emit(event.type, event);
    const legacyEvent = Object.assign({}, event);
    if (legacyEvent.type === "nrpn-dataincrement") {
      legacyEvent.type = "nrpn-databuttonincrement";
    } else if (legacyEvent.type === "nrpn-datadecrement") {
      legacyEvent.type = "nrpn-databuttondecrement";
    } else if (legacyEvent.type === "rpn-dataincrement") {
      legacyEvent.type = "rpn-databuttonincrement";
    } else if (legacyEvent.type === "rpn-datadecrement") {
      legacyEvent.type = "rpn-databuttondecrement";
    }
    this.emit(legacyEvent.type, legacyEvent);
    event.type = type;
    event.subtype = subtype;
    this.emit(event.type, event);
  }
  getChannelModeByNumber(number) {
    if (wm.validation) {
      console.warn(
        "The 'getChannelModeByNumber()' method has been moved to the 'Utilities' class."
      );
      number = Math.floor(number);
    }
    return Utilities.getChannelModeByNumber(number);
  }
  getCcNameByNumber(number) {
    if (wm.validation) {
      console.warn(
        "The 'getCcNameByNumber()' method has been moved to the 'Utilities' class."
      );
      number = parseInt(number);
      if (!(number >= 0 && number <= 127))
        throw new RangeError("Invalid control change number.");
    }
    return Utilities.getCcNameByNumber(number);
  }
  getNoteState(note) {
    if (note instanceof Note)
      note = note.identifier;
    const number = Utilities.guessNoteNumber(
      note,
      wm.octaveOffset + this.input.octaveOffset + this.octaveOffset
    );
    return this.notesState[number];
  }
  get octaveOffset() {
    return this._octaveOffset;
  }
  set octaveOffset(value) {
    if (this.validation) {
      value = parseInt(value);
      if (isNaN(value))
        throw new TypeError("The 'octaveOffset' property must be an integer.");
    }
    this._octaveOffset = value;
  }
  get input() {
    return this._input;
  }
  get number() {
    return this._number;
  }
  get nrpnEventsEnabled() {
    return this.parameterNumberEventsEnabled;
  }
  set nrpnEventsEnabled(value) {
    if (this.validation) {
      value = !!value;
    }
    this.parameterNumberEventsEnabled = value;
  }
}
/**
 * The `Message` class represents a single MIDI message. It has several properties that make it
 * easy to make sense of the binary data it contains.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */
class Message {
  constructor(data) {
    this.rawData = data;
    this.data = Array.from(this.rawData);
    this.statusByte = this.rawData[0];
    this.rawDataBytes = this.rawData.slice(1);
    this.dataBytes = this.data.slice(1);
    this.isChannelMessage = false;
    this.isSystemMessage = false;
    this.command = void 0;
    this.channel = void 0;
    this.manufacturerId = void 0;
    this.type = void 0;
    if (this.statusByte < 240) {
      this.isChannelMessage = true;
      this.command = this.statusByte >> 4;
      this.channel = (this.statusByte & 15) + 1;
    } else {
      this.isSystemMessage = true;
      this.command = this.statusByte;
    }
    if (this.isChannelMessage) {
      this.type = Utilities.getPropertyByValue(Enumerations.CHANNEL_MESSAGES, this.command);
    } else if (this.isSystemMessage) {
      this.type = Utilities.getPropertyByValue(Enumerations.SYSTEM_MESSAGES, this.command);
    }
    if (this.statusByte === Enumerations.SYSTEM_MESSAGES.sysex) {
      if (this.dataBytes[0] === 0) {
        this.manufacturerId = this.dataBytes.slice(0, 3);
        this.dataBytes = this.dataBytes.slice(3, this.rawDataBytes.length - 1);
        this.rawDataBytes = this.rawDataBytes.slice(3, this.rawDataBytes.length - 1);
      } else {
        this.manufacturerId = [this.dataBytes[0]];
        this.dataBytes = this.dataBytes.slice(1, this.dataBytes.length - 1);
        this.rawDataBytes = this.rawDataBytes.slice(1, this.rawDataBytes.length - 1);
      }
    }
  }
}
/**
 * The `Input` class represents a single MIDI input port. This object is automatically instantiated
 * by the library according to the host's MIDI subsystem and does not need to be directly
 * instantiated. Instead, you can access all `Input` objects by referring to the
 * [`WebMidi.inputs`](WebMidi#inputs) array. You can also retrieve inputs by using methods such as
 * [`WebMidi.getInputByName()`](WebMidi#getInputByName) and
 * [`WebMidi.getInputById()`](WebMidi#getInputById).
 *
 * Note that a single MIDI device may expose several inputs and/or outputs.
 *
 * **Important**: the `Input` class does not directly fire channel-specific MIDI messages
 * (such as [`noteon`](InputChannel#event:noteon) or
 * [`controlchange`](InputChannel#event:controlchange), etc.). The [`InputChannel`](InputChannel)
 * object does that. However, you can still use the
 * [`Input.addListener()`](#addListener) method to listen to channel-specific events on multiple
 * [`InputChannel`](InputChannel) objects at once.
 *
 * @fires Input#opened
 * @fires Input#disconnected
 * @fires Input#closed
 * @fires Input#midimessage
 *
 * @fires Input#sysex
 * @fires Input#timecode
 * @fires Input#songposition
 * @fires Input#songselect
 * @fires Input#tunerequest
 * @fires Input#clock
 * @fires Input#start
 * @fires Input#continue
 * @fires Input#stop
 * @fires Input#activesensing
 * @fires Input#reset
 *
 * @fires Input#unknownmidimessage
 *
 * @extends EventEmitter
 * @license Apache-2.0
 */
class Input extends EventEmitter {
  constructor(midiInput) {
    super();
    this._midiInput = midiInput;
    this._octaveOffset = 0;
    this.channels = [];
    for (let i = 1; i <= 16; i++)
      this.channels[i] = new InputChannel(this, i);
    this._forwarders = [];
    this._midiInput.onstatechange = this._onStateChange.bind(this);
    this._midiInput.onmidimessage = this._onMidiMessage.bind(this);
  }
  destroy() {
    return __async(this, null, function* () {
      this.removeListener();
      this.channels.forEach((ch) => ch.destroy());
      this.channels = [];
      this._forwarders = [];
      if (this._midiInput) {
        this._midiInput.onstatechange = null;
        this._midiInput.onmidimessage = null;
      }
      yield this.close();
      this._midiInput = null;
    });
  }
  _onStateChange(e) {
    let event = {
      timestamp: wm.time,
      target: this,
      port: this
    };
    if (e.port.connection === "open") {
      event.type = "opened";
      this.emit("opened", event);
    } else if (e.port.connection === "closed" && e.port.state === "connected") {
      event.type = "closed";
      this.emit("closed", event);
    } else if (e.port.connection === "closed" && e.port.state === "disconnected") {
      event.type = "disconnected";
      event.port = {
        connection: e.port.connection,
        id: e.port.id,
        manufacturer: e.port.manufacturer,
        name: e.port.name,
        state: e.port.state,
        type: e.port.type
      };
      this.emit("disconnected", event);
    } else if (e.port.connection === "pending" && e.port.state === "disconnected")
      ;
    else {
      console.warn("This statechange event was not caught: ", e.port.connection, e.port.state);
    }
  }
  _onMidiMessage(e) {
    const message = new Message(e.data);
    const event = {
      port: this,
      target: this,
      message,
      timestamp: e.timeStamp,
      type: "midimessage",
      data: message.data,
      rawData: message.data,
      statusByte: message.data[0],
      dataBytes: message.dataBytes
    };
    this.emit("midimessage", event);
    if (message.isSystemMessage) {
      this._parseEvent(event);
    } else if (message.isChannelMessage) {
      this.channels[message.channel]._processMidiMessageEvent(event);
    }
    this._forwarders.forEach((forwarder) => forwarder.forward(message));
  }
  _parseEvent(e) {
    const event = Object.assign({}, e);
    event.type = event.message.type || "unknownmidimessage";
    if (event.type === "songselect") {
      event.song = e.data[1] + 1;
      event.value = e.data[1];
      event.rawValue = event.value;
    }
    this.emit(event.type, event);
  }
  open() {
    return __async(this, null, function* () {
      try {
        yield this._midiInput.open();
      } catch (err) {
        return Promise.reject(err);
      }
      return Promise.resolve(this);
    });
  }
  close() {
    return __async(this, null, function* () {
      if (!this._midiInput)
        return Promise.resolve(this);
      try {
        yield this._midiInput.close();
      } catch (err) {
        return Promise.reject(err);
      }
      return Promise.resolve(this);
    });
  }
  getChannelModeByNumber() {
    if (wm.validation) {
      console.warn(
        "The 'getChannelModeByNumber()' method has been moved to the 'Utilities' class."
      );
    }
  }
  addListener(event, listener, options = {}) {
    if (wm.validation) {
      if (typeof options === "function") {
        let channels = listener != void 0 ? [].concat(listener) : void 0;
        listener = options;
        options = { channels };
      }
    }
    if (Enumerations.CHANNEL_EVENTS.includes(event)) {
      if (options.channels === void 0)
        options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      let listeners = [];
      Utilities.sanitizeChannels(options.channels).forEach((ch) => {
        listeners.push(this.channels[ch].addListener(event, listener, options));
      });
      return listeners;
    } else {
      return super.addListener(event, listener, options);
    }
  }
  addOneTimeListener(event, listener, options = {}) {
    options.remaining = 1;
    return this.addListener(event, listener, options);
  }
  on(event, channel, listener, options) {
    return this.addListener(event, channel, listener, options);
  }
  hasListener(event, listener, options = {}) {
    if (wm.validation) {
      if (typeof options === "function") {
        let channels = [].concat(listener);
        listener = options;
        options = { channels };
      }
    }
    if (Enumerations.CHANNEL_EVENTS.includes(event)) {
      if (options.channels === void 0)
        options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
      return Utilities.sanitizeChannels(options.channels).every((ch) => {
        return this.channels[ch].hasListener(event, listener);
      });
    } else {
      return super.hasListener(event, listener);
    }
  }
  removeListener(event, listener, options = {}) {
    if (wm.validation) {
      if (typeof options === "function") {
        let channels = [].concat(listener);
        listener = options;
        options = { channels };
      }
    }
    if (options.channels === void 0)
      options.channels = Enumerations.MIDI_CHANNEL_NUMBERS;
    if (event == void 0) {
      Utilities.sanitizeChannels(options.channels).forEach((ch) => {
        if (this.channels[ch])
          this.channels[ch].removeListener();
      });
      return super.removeListener();
    }
    if (Enumerations.CHANNEL_EVENTS.includes(event)) {
      Utilities.sanitizeChannels(options.channels).forEach((ch) => {
        this.channels[ch].removeListener(event, listener, options);
      });
    } else {
      super.removeListener(event, listener, options);
    }
  }
  addForwarder(output, options = {}) {
    let forwarder;
    if (output instanceof Forwarder) {
      forwarder = output;
    } else {
      forwarder = new Forwarder(output, options);
    }
    this._forwarders.push(forwarder);
    return forwarder;
  }
  removeForwarder(forwarder) {
    this._forwarders = this._forwarders.filter((item) => item !== forwarder);
  }
  hasForwarder(forwarder) {
    return this._forwarders.includes(forwarder);
  }
  get name() {
    return this._midiInput.name;
  }
  get id() {
    return this._midiInput.id;
  }
  get connection() {
    return this._midiInput.connection;
  }
  get manufacturer() {
    return this._midiInput.manufacturer;
  }
  get octaveOffset() {
    return this._octaveOffset;
  }
  set octaveOffset(value) {
    if (this.validation) {
      value = parseInt(value);
      if (isNaN(value))
        throw new TypeError("The 'octaveOffset' property must be an integer.");
    }
    this._octaveOffset = value;
  }
  get state() {
    return this._midiInput.state;
  }
  get type() {
    return this._midiInput.type;
  }
  get nrpnEventsEnabled() {
    if (wm.validation) {
      console.warn("The 'nrpnEventsEnabled' property has been moved to the 'InputChannel' class.");
    }
    return false;
  }
}
/**
 * The `WebMidi` object makes it easier to work with the low-level Web MIDI API. Basically, it
 * simplifies sending outgoing MIDI messages and reacting to incoming MIDI messages.
 *
 * When using the WebMidi.js library, you should know that the `WebMidi` class has already been
 * instantiated. You cannot instantiate it yourself. If you use the **IIFE** version, you should
 * simply use the global object called `WebMidi`. If you use the **CJS** (CommonJS) or **ESM** (ES6
 * module) version, you get an already-instantiated object when you import the module.
 *
 * @fires WebMidi#connected
 * @fires WebMidi#disabled
 * @fires WebMidi#disconnected
 * @fires WebMidi#enabled
 * @fires WebMidi#error
 * @fires WebMidi#midiaccessgranted
 * @fires WebMidi#portschanged
 *
 * @extends EventEmitter
 * @license Apache-2.0
 */
class WebMidi extends EventEmitter {
  constructor() {
    super();
    this.defaults = {
      note: {
        attack: Utilities.from7bitToFloat(64),
        release: Utilities.from7bitToFloat(64),
        duration: Infinity
      }
    };
    this.interface = null;
    this.validation = true;
    this._inputs = [];
    this._disconnectedInputs = [];
    this._outputs = [];
    this._disconnectedOutputs = [];
    this._stateChangeQueue = [];
    this._octaveOffset = 0;
  }
  enable() {
    return __async(this, arguments, function* (options = {}, legacy = false) {
      if (Utilities.isNode) {
        try {
          window.navigator;
        } catch (err) {
          let jzz = yield Object.getPrototypeOf(function() {
            return __async(this, null, function* () {
            });
          }).constructor(`
        let jzz = await import("jzz");
        return jzz.default;
        `)();
          if (!global.navigator)
            global.navigator = {};
          Object.assign(global.navigator, jzz);
        }
        try {
          performance;
        } catch (err) {
          global.performance = yield Object.getPrototypeOf(function() {
            return __async(this, null, function* () {
            });
          }).constructor(`
        let perf_hooks = await import("perf_hooks");
        return perf_hooks.performance;
        `)();
        }
      }
      this.validation = options.validation !== false;
      if (this.validation) {
        if (typeof options === "function")
          options = { callback: options, sysex: legacy };
        if (legacy)
          options.sysex = true;
      }
      if (this.enabled) {
        if (typeof options.callback === "function")
          options.callback();
        return Promise.resolve();
      }
      const errorEvent = {
        timestamp: this.time,
        target: this,
        type: "error",
        error: void 0
      };
      const midiAccessGrantedEvent = {
        timestamp: this.time,
        target: this,
        type: "midiaccessgranted"
      };
      const enabledEvent = {
        timestamp: this.time,
        target: this,
        type: "enabled"
      };
      try {
        if (typeof options.requestMIDIAccessFunction === "function") {
          this.interface = yield options.requestMIDIAccessFunction(
            { sysex: options.sysex, software: options.software }
          );
        } else {
          this.interface = yield navigator.requestMIDIAccess(
            { sysex: options.sysex, software: options.software }
          );
        }
      } catch (err) {
        errorEvent.error = err;
        this.emit("error", errorEvent);
        if (typeof options.callback === "function")
          options.callback(err);
        return Promise.reject(err);
      }
      this.emit("midiaccessgranted", midiAccessGrantedEvent);
      this.interface.onstatechange = this._onInterfaceStateChange.bind(this);
      try {
        yield this._updateInputsAndOutputs();
      } catch (err) {
        errorEvent.error = err;
        this.emit("error", errorEvent);
        if (typeof options.callback === "function")
          options.callback(err);
        return Promise.reject(err);
      }
      this.emit("enabled", enabledEvent);
      if (typeof options.callback === "function")
        options.callback();
      return Promise.resolve(this);
    });
  }
  disable() {
    return __async(this, null, function* () {
      if (this.interface)
        this.interface.onstatechange = void 0;
      return this._destroyInputsAndOutputs().then(() => {
        if (navigator && typeof navigator.close === "function")
          navigator.close();
        this.interface = null;
        let event = {
          timestamp: this.time,
          target: this,
          type: "disabled"
        };
        this.emit("disabled", event);
        this.removeListener();
      });
    });
  }
  getInputById(id, options = { disconnected: false }) {
    if (this.validation) {
      if (!this.enabled)
        throw new Error("WebMidi is not enabled.");
      if (!id)
        return;
    }
    if (options.disconnected) {
      for (let i = 0; i < this._disconnectedInputs.length; i++) {
        if (this._disconnectedInputs[i].id === id.toString())
          return this._disconnectedInputs[i];
      }
    } else {
      for (let i = 0; i < this.inputs.length; i++) {
        if (this.inputs[i].id === id.toString())
          return this.inputs[i];
      }
    }
  }
  getInputByName(name, options = { disconnected: false }) {
    if (this.validation) {
      if (!this.enabled)
        throw new Error("WebMidi is not enabled.");
      if (!name)
        return;
      name = name.toString();
    }
    if (options.disconnected) {
      for (let i = 0; i < this._disconnectedInputs.length; i++) {
        if (~this._disconnectedInputs[i].name.indexOf(name))
          return this._disconnectedInputs[i];
      }
    } else {
      for (let i = 0; i < this.inputs.length; i++) {
        if (~this.inputs[i].name.indexOf(name))
          return this.inputs[i];
      }
    }
  }
  getOutputByName(name, options = { disconnected: false }) {
    if (this.validation) {
      if (!this.enabled)
        throw new Error("WebMidi is not enabled.");
      if (!name)
        return;
      name = name.toString();
    }
    if (options.disconnected) {
      for (let i = 0; i < this._disconnectedOutputs.length; i++) {
        if (~this._disconnectedOutputs[i].name.indexOf(name))
          return this._disconnectedOutputs[i];
      }
    } else {
      for (let i = 0; i < this.outputs.length; i++) {
        if (~this.outputs[i].name.indexOf(name))
          return this.outputs[i];
      }
    }
  }
  getOutputById(id, options = { disconnected: false }) {
    if (this.validation) {
      if (!this.enabled)
        throw new Error("WebMidi is not enabled.");
      if (!id)
        return;
    }
    if (options.disconnected) {
      for (let i = 0; i < this._disconnectedOutputs.length; i++) {
        if (this._disconnectedOutputs[i].id === id.toString())
          return this._disconnectedOutputs[i];
      }
    } else {
      for (let i = 0; i < this.outputs.length; i++) {
        if (this.outputs[i].id === id.toString())
          return this.outputs[i];
      }
    }
  }
  noteNameToNumber(name) {
    if (this.validation) {
      console.warn(
        "The noteNameToNumber() method is deprecated. Use Utilities.toNoteNumber() instead."
      );
    }
    return Utilities.toNoteNumber(name, this.octaveOffset);
  }
  getOctave(number) {
    if (this.validation) {
      console.warn("The getOctave()is deprecated. Use Utilities.getNoteDetails() instead");
      number = parseInt(number);
    }
    if (!isNaN(number) && number >= 0 && number <= 127) {
      return Utilities.getNoteDetails(Utilities.offsetNumber(number, this.octaveOffset)).octave;
    } else {
      return false;
    }
  }
  sanitizeChannels(channel) {
    if (this.validation) {
      console.warn("The sanitizeChannels() method has been moved to the utilities class.");
    }
    return Utilities.sanitizeChannels(channel);
  }
  toMIDIChannels(channel) {
    if (this.validation) {
      console.warn(
        "The toMIDIChannels() method has been deprecated. Use Utilities.sanitizeChannels() instead."
      );
    }
    return Utilities.sanitizeChannels(channel);
  }
  guessNoteNumber(input) {
    if (this.validation) {
      console.warn(
        "The guessNoteNumber() method has been deprecated. Use Utilities.guessNoteNumber() instead."
      );
    }
    return Utilities.guessNoteNumber(input, this.octaveOffset);
  }
  getValidNoteArray(notes, options = {}) {
    if (this.validation) {
      console.warn(
        "The getValidNoteArray() method has been moved to the Utilities.buildNoteArray()"
      );
    }
    return Utilities.buildNoteArray(notes, options);
  }
  convertToTimestamp(time) {
    if (this.validation) {
      console.warn(
        "The convertToTimestamp() method has been moved to Utilities.toTimestamp()."
      );
    }
    return Utilities.toTimestamp(time);
  }
  _destroyInputsAndOutputs() {
    return __async(this, null, function* () {
      let promises = [];
      this.inputs.forEach((input) => promises.push(input.destroy()));
      this.outputs.forEach((output) => promises.push(output.destroy()));
      return Promise.all(promises).then(() => {
        this._inputs = [];
        this._outputs = [];
      });
    });
  }
  _onInterfaceStateChange(e) {
    this._updateInputsAndOutputs();
    let event = {
      timestamp: e.timeStamp,
      type: e.port.state,
      target: this
    };
    if (e.port.state === "connected" && e.port.connection === "open") {
      if (e.port.type === "output") {
        event.port = this.getOutputById(e.port.id);
      } else if (e.port.type === "input") {
        event.port = this.getInputById(e.port.id);
      }
      this.emit(e.port.state, event);
      const portsChangedEvent = Object.assign({}, event);
      portsChangedEvent.type = "portschanged";
      this.emit(portsChangedEvent.type, portsChangedEvent);
    } else if (e.port.state === "disconnected" && e.port.connection === "pending") {
      if (e.port.type === "input") {
        event.port = this.getInputById(e.port.id, { disconnected: true });
      } else if (e.port.type === "output") {
        event.port = this.getOutputById(e.port.id, { disconnected: true });
      }
      this.emit(e.port.state, event);
      const portsChangedEvent = Object.assign({}, event);
      portsChangedEvent.type = "portschanged";
      this.emit(portsChangedEvent.type, portsChangedEvent);
    }
  }
  _updateInputsAndOutputs() {
    return __async(this, null, function* () {
      return Promise.all([
        this._updateInputs(),
        this._updateOutputs()
      ]);
    });
  }
  _updateInputs() {
    return __async(this, null, function* () {
      if (!this.interface)
        return;
      for (let i = this._inputs.length - 1; i >= 0; i--) {
        const current = this._inputs[i];
        const inputs = Array.from(this.interface.inputs.values());
        if (!inputs.find((input) => input === current._midiInput)) {
          this._disconnectedInputs.push(current);
          this._inputs.splice(i, 1);
        }
      }
      let promises = [];
      this.interface.inputs.forEach((nInput) => {
        if (!this._inputs.find((input) => input._midiInput === nInput)) {
          let input = this._disconnectedInputs.find((input2) => input2._midiInput === nInput);
          if (!input)
            input = new Input(nInput);
          this._inputs.push(input);
          promises.push(input.open());
        }
      });
      return Promise.all(promises);
    });
  }
  _updateOutputs() {
    return __async(this, null, function* () {
      if (!this.interface)
        return;
      for (let i = this._outputs.length - 1; i >= 0; i--) {
        const current = this._outputs[i];
        const outputs = Array.from(this.interface.outputs.values());
        if (!outputs.find((output) => output === current._midiOutput)) {
          this._disconnectedOutputs.push(current);
          this._outputs.splice(i, 1);
        }
      }
      let promises = [];
      this.interface.outputs.forEach((nOutput) => {
        if (!this._outputs.find((output) => output._midiOutput === nOutput)) {
          let output = this._disconnectedOutputs.find((output2) => output2._midiOutput === nOutput);
          if (!output)
            output = new Output(nOutput);
          this._outputs.push(output);
          promises.push(output.open());
        }
      });
      return Promise.all(promises);
    });
  }
  get enabled() {
    return this.interface !== null;
  }
  get inputs() {
    return this._inputs;
  }
  get isNode() {
    if (this.validation) {
      console.warn("WebMidi.isNode has been deprecated. Use Utilities.isNode instead.");
    }
    return Utilities.isNode;
  }
  get isBrowser() {
    if (this.validation) {
      console.warn("WebMidi.isBrowser has been deprecated. Use Utilities.isBrowser instead.");
    }
    return Utilities.isBrowser;
  }
  get octaveOffset() {
    return this._octaveOffset;
  }
  set octaveOffset(value) {
    if (this.validation) {
      value = parseInt(value);
      if (isNaN(value))
        throw new TypeError("The 'octaveOffset' property must be an integer.");
    }
    this._octaveOffset = value;
  }
  get outputs() {
    return this._outputs;
  }
  get supported() {
    return typeof navigator !== "undefined" && !!navigator.requestMIDIAccess;
  }
  get sysexEnabled() {
    return !!(this.interface && this.interface.sysexEnabled);
  }
  get time() {
    return performance.now();
  }
  get version() {
    return "3.1.12";
  }
  get flavour() {
    return "esm";
  }
  get CHANNEL_EVENTS() {
    if (this.validation) {
      console.warn(
        "The CHANNEL_EVENTS enum has been moved to Enumerations.CHANNEL_EVENTS."
      );
    }
    return Enumerations.CHANNEL_EVENTS;
  }
  get MIDI_SYSTEM_MESSAGES() {
    if (this.validation) {
      console.warn(
        "The MIDI_SYSTEM_MESSAGES enum has been moved to Enumerations.SYSTEM_MESSAGES."
      );
    }
    return Enumerations.SYSTEM_MESSAGES;
  }
  get MIDI_CHANNEL_MODE_MESSAGES() {
    if (this.validation) {
      console.warn(
        "The MIDI_CHANNEL_MODE_MESSAGES enum has been moved to Enumerations.CHANNEL_MODE_MESSAGES."
      );
    }
    return Enumerations.CHANNEL_MODE_MESSAGES;
  }
  get MIDI_CONTROL_CHANGE_MESSAGES() {
    if (this.validation) {
      console.warn(
        "The MIDI_CONTROL_CHANGE_MESSAGES enum has been replaced by the Enumerations.CONTROL_CHANGE_MESSAGES array."
      );
    }
    return Enumerations.MIDI_CONTROL_CHANGE_MESSAGES;
  }
  get MIDI_REGISTERED_PARAMETER() {
    if (this.validation) {
      console.warn(
        "The MIDI_REGISTERED_PARAMETER enum has been moved to Enumerations.REGISTERED_PARAMETERS."
      );
    }
    return Enumerations.REGISTERED_PARAMETERS;
  }
  get NOTES() {
    if (this.validation) {
      console.warn("The NOTES enum has been deprecated.");
    }
    return ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  }
}
const wm = new WebMidi();
wm.constructor = null;
class Midi extends Instrument2 {
  constructor(_, options) {
    super(options);
    this.onConnected = null;
    this.onDisconnected = null;
    const { outputDevices = "all" } = options;
    this.outputDevices = outputDevices;
    this.outputs = [];
    this.initialize();
  }
  initParams() {
  }
  setGain(value, fadeTime = 0, when = 0) {
  }
  connect(destination) {
  }
  getState() {
    return "started";
  }
  getWebMidiEnabled() {
    return wm.enabled;
  }
  getAvailableOutputs() {
    return this.availableOutputs;
  }
  getOutputs() {
    return this.outputs;
  }
  setConnectedCallback(cb) {
    this.onConnected = cb;
  }
  setDisconnectedCallback(cb) {
    this.onDisconnected = cb;
  }
  setOutputs(outputDevices) {
    this.outputDevices = outputDevices;
    if (wm.enabled) {
      this.outputs = [];
      if (outputDevices === "all") {
        this.outputs = wm.outputs;
      } else {
        const output = wm.outputs.find(
          (output2) => output2.name === outputDevices.trim()
        );
        if (output) {
          this.outputs.push(output);
        }
      }
    }
  }
  play({ noReset = true, when = 0, options }) {
    const { note, velocity } = options;
    this.outputs.forEach((output) => {
      const timeStamp = performance.now() + when * 1e3;
      output.playNote(note, {
        attack: velocity,
        time: timeStamp
      });
    });
  }
  stop({ when = 0, options = { note: null } }) {
    if (options && options.note) {
      this.outputs.forEach((output) => {
        const timeStamp = performance.now() + when * 1e3;
        output.stopNote(options.note, {
          time: timeStamp
        });
      });
    }
  }
  allNotesOff() {
    this.outputs.forEach((output) => {
      output.sendAllNotesOff();
    });
  }
  sendReset() {
    this.outputs.forEach((output) => {
      output.sendReset();
    });
  }
  fadeOut(fadeTime, when, onComplete) {
  }
  setRawParam(paramName, value, options) {
    this.params.get(paramName).setRaw(value, options);
  }
  dispose() {
  }
  isEnabled() {
    return wm.enabled;
  }
  initialize() {
    return __async(this, null, function* () {
      try {
        yield wm.enable();
        this.availableOutputs = wm.outputs;
        this.setOutputs(this.outputDevices);
        wm.addListener("connected", (e) => {
          this.onConnected && this.onConnected(e);
          this.setOutputs(this.outputDevices);
        });
        wm.addListener("disconnected", (e) => {
          this.onDisconnected && this.onDisconnected(e);
          this.setOutputs(this.outputDevices);
        });
      } catch (err) {
        console.error("WebMidi could not be enabled.", err);
      }
    });
  }
}
class RoundRobin extends Instrument2 {
  constructor(buffers, options) {
    super(options);
    this.playIndex = 0;
    const { mode = "random" } = options;
    this.players = [];
    const gain = new Gain(1);
    this.gain = gain;
    Object.values(buffers).forEach((buffer) => {
      this.addPlayer(buffer);
    });
    const channel = new Channel2(gain, options);
    this.channel = channel;
    this.setMode(mode);
    this.initParams();
  }
  initParams() {
    this.params = new Map(
      [getGainParam(this), getPanParam(this)].map((param) => [
        param.name,
        param
      ])
    );
  }
  advancePlayIndex() {
    switch (this.mode) {
      case "random": {
        if (this.players.length > 1) {
          let newIndex = 0;
          newIndex = this.getRandomIndex();
          this.playIndex = newIndex;
        }
        break;
      }
      case "step": {
        this.playIndex = ++this.playIndex % this.players.length;
        break;
      }
      case "backwards": {
        this.playIndex = --this.playIndex % this.players.length;
        if (this.playIndex < 0) {
          this.playIndex = this.players.length - 1;
        }
        break;
      }
      case "shuffle": {
        if (this.playIndex === this.players.length - 1) {
          shuffle(this.players);
        }
        this.playIndex = ++this.playIndex % this.players.length;
        break;
      }
    }
  }
  getRandomIndex() {
    const nonRepeatedIndices = new Array(this.players.length).fill(0).map((_, i) => i).filter((i) => i !== this.playIndex);
    return nonRepeatedIndices[Math.floor(Math.random() * nonRepeatedIndices.length)];
  }
  addPlayer(buffer) {
    const singlePlayer = new Player$1(buffer);
    singlePlayer.connect(this.gain);
    this.players.push(singlePlayer);
  }
  setMode(mode) {
    this.mode = mode;
    if (this.mode === "random") {
      this.advancePlayIndex();
    }
    if (this.mode === "backwards") {
      this.playIndex = this.players.length - 1;
    }
    if (this.mode === "shuffle") {
      shuffle(this.players);
    }
  }
  getState() {
    let isPlaying = false;
    this.players.forEach((player) => {
      if (player.state === "started") {
        isPlaying = true;
      }
    });
    return isPlaying ? "started" : "stopped";
  }
  play(args = {}) {
    var _a;
    const { exactTime = false, offset = 0 } = args;
    if (getContext$1().state === "suspended") {
      return false;
    }
    const { when = 0 } = args;
    const startTime = exactTime ? when : immediate() + when;
    (_a = this.players[this.playIndex]) == null ? void 0 : _a.start(startTime, offset);
    this.advancePlayIndex();
  }
  stop(args = {}) {
    const { exactTime = false } = args;
    let { when = 0 } = args;
    when = exactTime ? when : immediate() + when;
    this.players.forEach((singlePlayer) => {
      singlePlayer.stop(when);
    });
  }
  dispose() {
    this.players.forEach((singlePlayer) => {
      singlePlayer.dispose();
      singlePlayer.disconnect();
    });
    this.channel.dispose();
  }
}
const InstrumentTypeMap = {
  sampler: Sampler2,
  player: Player2,
  midi: Midi,
  roundRobin: RoundRobin
};
const getInstrument = (key) => key ? InstrumentTypeMap[key] : Player2;
class InstrumentManager {
  constructor(params = {}) {
    const { destination, bufferManager, busses } = params;
    this.bufferManager = bufferManager;
    this.busses = busses;
    this.instruments = /* @__PURE__ */ new Map();
    this.masterGain = destination || getDestination();
  }
  trigger(key, options) {
    options = options || {};
    const instrument = this.getInstrument(key);
    instrument && instrument.play(options);
  }
  setConfigManager(configManager) {
    this.config = configManager;
    this.config.setOnUpdate(this.onConfigUpdate.bind(this));
  }
  createInstrument(scene, sound) {
    return __async(this, null, function* () {
      const soundSpatial = sound.spatial;
      const { buffer, soundSource } = yield this.getBufferForInstrument(
        sound.sound,
        scene
      );
      if (soundSource) {
        sound = __spreadValues(__spreadValues({}, soundSource), sound);
        sound.spatial = __spreadValues(__spreadValues({}, soundSource.spatial), soundSpatial);
      }
      if (!sound.type) {
        sound.type = "player";
      }
      const InstrumentClass = getInstrument(sound.type);
      const instrument = new InstrumentClass(buffer, sound);
      if (sound.bus) {
        const bus = this.busses.get(sound.bus);
        if (bus) {
          instrument.connect(bus.input);
        } else {
          console.warn("Could not find bus:", sound.bus);
          instrument.connect(this.masterGain);
        }
      } else {
        sound.bus = "";
        instrument.connect(this.masterGain);
      }
      if (sound.sends && this.busses) {
        sound.sends.forEach((send) => {
          const bus = this.busses.get(send.bus);
          if (bus) {
            instrument.channel.addSend(bus, {
              gain: send.gain,
              pre: send.pre
            });
          }
        });
      }
      this.addInstrumentWithScene({
        sceneName: scene.name,
        soundName: sound.name,
        instrument
      });
    });
  }
  addInstrumentWithScene({
    sceneName,
    soundName,
    instrument
  }) {
    if (sceneName) {
      this.instruments.set(`${sceneName}:${soundName}`, instrument);
    } else {
      this.instruments.set(`${soundName}`, instrument);
    }
  }
  getInstrument(key) {
    return this.instruments.get(key);
  }
  getInstrumentKeysForScene(sceneName) {
    const instrumentKeys = [];
    this.instruments.forEach((_, key) => {
      if (key.match(`${sceneName}:`)) {
        instrumentKeys.push(key);
      }
    });
    return instrumentKeys;
  }
  stop(key, options) {
    options = options || {};
    const { fadeTime = 0, when = 0, exactTime = false } = options;
    const instrument = this.instruments.get(key);
    InstrumentManager.stopInstrument(instrument, {
      fadeTime,
      when,
      onComplete: options == null ? void 0 : options.onComplete,
      exactTime
    });
  }
  pause(key, options) {
    const instrument = this.instruments.get(key);
    if (instrument) {
      instrument.pause(options);
    }
  }
  resume(key, options) {
    const instrument = this.instruments.get(key);
    if (instrument) {
      instrument.resume(options);
    }
  }
  static stopInstrument(instrument, options = {}) {
    const { onComplete } = options;
    options.onComplete = () => {
      instrument.stop();
      onComplete && onComplete();
    };
    InstrumentManager.fadeOutInstrument(instrument, options);
  }
  fadeOut(key, options) {
    const instrument = this.instruments.get(key);
    InstrumentManager.fadeOutInstrument(instrument, options);
  }
  static fadeOutInstrument(instrument, options = {}) {
    const { when, fadeTime, onComplete, exactTime } = options;
    instrument == null ? void 0 : instrument.fadeOut(fadeTime, when, onComplete, exactTime);
  }
  addSound({ sound, sceneName, buffer }) {
    if (buffer) {
      buffer = Array.isArray(buffer) ? buffer : [buffer];
      buffer.forEach((buffer2) => {
        this.bufferManager.setSoundBuffer(buffer2.name, buffer2.buffer);
        const configSource = {
          name: buffer2.name,
          file: buffer2.fileName || buffer2.name
        };
        this.bufferManager.addSource(configSource);
      });
    }
    if (this.getInstrument(`${sceneName}:${sound.name}`)) {
      this.deleteInstrument(`${sceneName}:${sound.name}`);
    }
    return sound;
  }
  addInstrument(_0) {
    return __async(this, arguments, function* ({ sound, sceneName, buffer }) {
      const configSound = this.addSound({ sound, sceneName, buffer });
      return this.createInstrument({ name: sceneName }, configSound);
    });
  }
  deleteInstrument(name) {
    const instrumentName = name.split(":")[1];
    this.bufferManager.removeSource(instrumentName);
    this.disposeInstrument(this.instruments.get(name));
  }
  updateInstrument(name, toUpdate) {
    return __async(this, null, function* () {
      const instrument = this.instruments.get(name);
      const sceneName = name.split(":")[0];
      if (instrument) {
        let instrumentSettings;
        for (let key in toUpdate) {
          switch (key) {
            case "name":
              instrument.name = toUpdate.name;
              this.instruments.set(`${sceneName}:${toUpdate.name}`, instrument);
              this.instruments.delete(name);
              break;
            case "bus":
              instrument.channel.disconnect();
              if (toUpdate.bus === "$OUT") {
                instrument.connect(this.masterGain);
              } else {
                instrument.connect(this.busses.get(toUpdate.bus).input);
              }
              break;
            case "type":
              instrumentSettings = instrument.settings;
              instrumentSettings.type = toUpdate.type;
              instrumentSettings.sound = toUpdate.sound;
              this.instruments.delete(name);
              instrument.dispose();
              yield this.createInstrument(
                { name: sceneName },
                instrumentSettings
              );
              break;
            case "sound":
              instrumentSettings = instrument.settings;
              yield this.updateInstrumentBuffers({
                scene: { name: sceneName },
                key: name,
                sound: toUpdate.sound,
                type: instrumentSettings.type
              });
              break;
            case "gain":
              instrument.channel.setGain(toUpdate.gain);
              instrument.channel.setInitialGain(toUpdate.gain);
              break;
          }
        }
        instrument.update(toUpdate);
      }
    });
  }
  getBufferForInstrument(sound, scene) {
    return __async(this, null, function* () {
      let buffer;
      let soundSource;
      if (typeof sound === "object") {
        const allBufferPromises = [];
        buffer = {};
        Object.keys(sound).forEach((key) => {
          soundSource = this.bufferManager.getSource(sound[key]);
          const bufferPromise = this.bufferManager.getSoundBuffer(sound[key], scene.localized).then((buff) => {
            buffer[key] = buff;
          }).catch((error) => {
            console.error(error, sound[key]);
          });
          allBufferPromises.push(bufferPromise);
        });
        yield Promise.all(allBufferPromises);
      } else if (sound) {
        soundSource = this.bufferManager.getSource(sound);
        buffer = yield this.bufferManager.getSoundBuffer(sound, scene.localized).catch((error) => {
          console.error(error, sound);
        });
      }
      return { buffer, soundSource };
    });
  }
  updateInstrumentBuffers(options) {
    return __async(this, null, function* () {
      const { scene, key, type, sound } = options;
      const instrument = this.getInstrument(key);
      let { buffer } = yield this.getBufferForInstrument(sound, scene);
      switch (type) {
        case "player":
          instrument.player.buffer = buffer;
          break;
        case "sampler":
          instrument.player._buffers.dispose();
          for (const [key2, value] of Object.entries(buffer)) {
            instrument.player.add(key2, value);
          }
          break;
        case "roundRobin":
          instrument.players.forEach((singlePlayer) => {
            singlePlayer.dispose();
            singlePlayer.disconnect();
          });
          instrument.players = [];
          for (const key2 in buffer) {
            instrument.addPlayer(buffer[key2]);
          }
          break;
      }
    });
  }
  moveInstrument(name, toUpdate) {
    const instrument = this.instruments.get(name);
    this.instruments.delete(name);
    const instrumentName = name.split(":")[1];
    this.instruments.set(`${toUpdate.scene}:${instrumentName}`, instrument);
  }
  disposeAll() {
    this.instruments.forEach((instrument) => {
      this.disposeInstrument(instrument);
    });
  }
  disposeInstrument(instrument) {
    instrument.dispose();
    this.instruments.forEach((value, key) => {
      if (value === instrument) {
        this.instruments.delete(key);
      }
    });
  }
  static unloadInstruments(instruments) {
    instruments.forEach((instrument) => instrument.dispose());
  }
  onConfigUpdate(update) {
    const { location, toUpdate, action } = update;
    if (location.match(/^scenes\./)) {
      const hierarchy = location.split(".");
      const sceneName = hierarchy[1];
      if (hierarchy.length > 3 && hierarchy[2] === "sounds") {
        const soundName = hierarchy[3];
        const soundKey = `${sceneName}:${soundName}`;
        switch (action) {
          case ConfigAction.CREATE:
            this.createInstrument(
              { name: sceneName },
              toUpdate
            );
            break;
          case ConfigAction.DELETE:
            this.deleteInstrument(soundKey);
            break;
          case ConfigAction.MOVE:
            this.moveInstrument(soundKey, toUpdate);
            break;
          default:
            this.updateInstrument(soundKey, toUpdate);
            break;
        }
      }
    } else if (location.match(/^sources\./)) {
      const hierarchy = location.split(".");
      const sourceName = hierarchy[1];
      this.instruments.forEach((instrument, key) => {
        if (this.instrumentHasSource(instrument, sourceName)) {
          switch (action) {
            case ConfigAction.DELETE:
              this.updateInstrument(key, { sound: "" });
              break;
            case ConfigAction.UPDATE:
              if (toUpdate.name) {
                this.updateInstrument(key, { sound: toUpdate.name });
              } else if (toUpdate.file)
                ;
              else {
                this.updateInstrument(key, toUpdate);
              }
              break;
          }
        }
      });
    } else if (location.match(/^busses\./)) {
      const hierarchy = location.split(".");
      const busName = hierarchy[1];
      this.instruments.forEach((instrument, key) => {
        var _a, _b;
        if (instrument.settings.bus === busName) {
          switch (action) {
            case ConfigAction.DELETE:
              const sceneName = key.split(":")[0];
              const sceneBus = (_b = (_a = this.config.config) == null ? void 0 : _a.scenes[sceneName]) == null ? void 0 : _b.bus;
              this.updateInstrument(key, { bus: sceneBus || "$OUT" });
              break;
            case ConfigAction.UPDATE:
              if (toUpdate.name) {
                this.updateInstrument(key, { bus: toUpdate.name });
              }
              break;
          }
        }
      });
    }
  }
  instrumentHasSource(instrument, sourceName) {
    if (Array.isArray(instrument.settings.sound)) {
      return instrument.settings.sound.includes(sourceName);
    } else if (typeof instrument.settings.sound === "string") {
      return instrument.settings.sound === sourceName;
    } else if (instrument.settings.type === "sampler") {
      Object.values(instrument.settings.sound).forEach((sound) => {
        if (sound === sourceName) {
          return true;
        }
      });
    }
  }
  checkIfBufferInUseByMultipleInstruments(buffer) {
    if (buffer) {
      const numInstrumentsUsingBuffer = Array.from(this.instruments).map((keyVal) => keyVal[1]).reduce((accum, instrument) => {
        var _a, _b;
        const hasSameBuffer = ((_b = (_a = instrument.player) == null ? void 0 : _a._buffer) == null ? void 0 : _b._buffer) === buffer ? 1 : 0;
        return accum + hasSameBuffer;
      }, 0);
      if (numInstrumentsUsingBuffer > 0) {
        return true;
      }
    }
    return false;
  }
}
class Bus {
  constructor(settings, resolveSources) {
    this.type = "Bus";
    this.settings = __spreadValues({}, settings);
    this.uuid = v4();
    this.name = settings.name;
    const initalGain = this.settings.gain !== void 0 ? this.settings.gain : 1;
    this.settings.gain = initalGain;
    this.channel = new Channel2(null, settings, resolveSources);
    this.setupAudioGraph();
  }
  setupAudioGraph() {
    this.input = new Gain();
    this.channel.add(this.input);
  }
  connect(destination, outputNumber = 0, inputNumber = 0) {
    this.channel.connect(destination, outputNumber, inputNumber);
  }
  setGain(volume, fadeTime = 1, when) {
    this.channel.setGain(volume, fadeTime, when);
  }
  setMuteState(shouldMute, options) {
    this.channel.setMuteState(shouldMute, options);
  }
  triggerModulators(options) {
    this.channel.triggerModulators(options);
  }
  get params() {
    return this.channel.params;
  }
  setParam(paramName, value, options) {
    this.channel.setParam(paramName, value, options);
  }
  setRawParam(paramName, value, options) {
    this.channel.setRawParam(paramName, value, options);
  }
  update(toUpdate) {
    if (toUpdate.name) {
      this.name = toUpdate.name;
    }
    Object.keys(toUpdate).forEach((key) => {
      const param = this.params.get(key);
      if (param) {
        param.setRaw(toUpdate[key]);
      }
      this.settings[key] = toUpdate[key];
    });
  }
  dispose() {
    this.input.dispose();
    this.channel.dispose();
  }
}
class BusManager {
  constructor(busses = [
    {
      name: "master",
      parent: "$OUT"
    }
  ], bufferManager, channels) {
    this.bufferManager = bufferManager;
    this.busses = /* @__PURE__ */ new Map();
    this.setupAudioGraph(busses, channels);
  }
  setupAudioGraph(busses, channels) {
    if (this.busses) {
      this.busses.forEach((bus, key) => {
        bus.dispose();
        this.busses.delete(key);
      });
    }
    this.masterGain = new Gain(1).toDestination();
    if (channels && channels > 2) {
      this.merge = new Merge(channels);
      this.merge.connect(this.masterGain);
    }
    busses.forEach((busSettings) => {
      this.createBus(busSettings);
    });
    this.busses.forEach((bus) => {
      this.connectBus(bus);
    });
  }
  connectBus(bus) {
    var _a;
    if (bus.settings.parent === "$OUT") {
      if (this.merge && ((_a = bus.settings.channels) == null ? void 0 : _a.length)) {
        const split = new Split(2);
        bus.connect(split);
        for (let i = 0; i < bus.settings.channels.length; i++) {
          try {
            split.connect(this.merge, i % 2, bus.settings.channels[i] - 1);
          } catch (e) {
            console.warn(
              `Could not connect bus ${bus.name} to channel`,
              bus.settings.channels[i],
              e
            );
          }
        }
      } else {
        bus.connect(this.masterGain.input);
      }
    } else {
      const destination = this.busses.get(bus.settings.parent).input;
      bus.connect(destination);
    }
    if (bus.settings.sends) {
      bus.settings.sends.forEach((send) => {
        const sendBus = this.busses.get(send.bus);
        if (sendBus) {
          bus.channel.addSend(sendBus, {
            gain: send.gain,
            pre: send.pre
          });
        } else {
          console.warn(`Can't find ${send.bus}.`);
        }
      });
    }
  }
  createBus(busSettings) {
    const sourcesToLoad = [];
    if (busSettings.effects) {
      busSettings.effects.forEach((effect) => {
        var _a;
        if ((_a = effect.settings) == null ? void 0 : _a.sound) {
          sourcesToLoad.push(effect.settings.sound);
        }
      });
    }
    const bus = new Bus(
      busSettings,
      () => new Promise((resolve, reject) => {
        if (sourcesToLoad.length > 0) {
          Promise.all(
            sourcesToLoad.map(
              (source) => this.bufferManager.getSoundBuffer(source)
            )
          ).then((buffers) => {
            resolve(buffers);
          });
        } else {
          resolve(true);
        }
      })
    );
    this.busses.set(busSettings.name, bus);
    return bus;
  }
  setConfigManager(configManager) {
    this.config = configManager;
    this.config.setOnUpdate(this.onConfigUpdate.bind(this));
  }
  addBus(bus) {
    return bus;
  }
  getBus(name) {
    return this.busses.get(name);
  }
  getAll() {
    return this.busses;
  }
  onConfigUpdate(update) {
    const { location, toUpdate, action } = update;
    if (location.match(/^busses\./)) {
      const hierarchy = location.split(".");
      const busName = hierarchy[1];
      const bus = this.busses.get(busName);
      switch (action) {
        case ConfigAction.CREATE:
          const newBus = this.createBus(toUpdate);
          this.connectBus(newBus);
          break;
        case ConfigAction.DELETE:
          bus.dispose();
          this.busses.delete(busName);
          break;
        case ConfigAction.UPDATE:
          if (toUpdate.parent) {
            bus.channel.disconnect();
            const destination = toUpdate.parent === "$OUT" ? this.masterGain : this.busses.get(toUpdate.parent).input;
            bus.connect(destination);
          }
          if (toUpdate.name) {
            const busInstance = this.busses.get(busName);
            this.busses.set(toUpdate.name, busInstance);
            this.busses.delete(busName);
          }
          bus.update(toUpdate);
          break;
      }
    }
  }
  setBusVolume(key, volume, fadeTime = 1, when = 0) {
    const bus = this.busses.get(key);
    if (key === "$OUT") {
      this.masterGain.gain.rampTo(volume, fadeTime, when);
    } else {
      bus == null ? void 0 : bus.setGain(volume, fadeTime, when);
    }
  }
  setBusMute(key, shouldMute) {
    var _a;
    if (key === "$OUT") {
      this.masterGain.gain.value = shouldMute ? 0 : 1;
      return Promise.resolve(true);
    }
    return (_a = this.busses.get(key)) == null ? void 0 : _a.setMuteState(shouldMute);
  }
  connectMediaToBus(busName, element) {
    const context2 = getContext$1();
    const audioNode = context2.createMediaElementSource(element);
    const bus = this.getBus(busName);
    bus && connect(audioNode, bus.input.output);
    element.muted = false;
    return audioNode;
  }
  getDestination() {
    return this.masterGain.input;
  }
  empty() {
    this.busses.forEach((bus) => bus.dispose());
  }
}
class SceneManager {
  constructor(config2) {
    this.audioIsInitialized = false;
    this.utils = Utils;
    this.loadingState = "initializing";
    this.disableBlur = false;
    this.iosHack = false;
    window.KLANG_DEBUG && console.log("Klang Loaded");
    const {
      scenes,
      sources,
      busses = [
        {
          name: "master",
          parent: "$OUT"
        }
      ],
      basePath = ""
    } = config2;
    this.config = new ConfigManager(config2);
    this.config.setOnUpdate(this.onConfigUpdate.bind(this));
    const normalizedPath = normalizePath(basePath);
    this.scenes = /* @__PURE__ */ new Map();
    this.loadSceneConfigs(scenes);
    this.bufferManager = new BufferManager(sources, normalizedPath);
    this.bufferManager.setConfigManager(this.config);
    this.disposeInstruments();
    this.busManager = new BusManager(
      busses,
      this.bufferManager,
      this.config.config.channels
    );
    this.busManager.setConfigManager(this.config);
    this.instrumentManager = new InstrumentManager({
      destination: this.busManager.getDestination(),
      bufferManager: this.bufferManager,
      busses: this.busManager.getAll()
    });
    this.instrumentManager.setConfigManager(this.config);
    this.listener = getListener();
    if (window) {
      window.KLANG_SCENEMANAGER = this;
    }
    if (this.iosHack) {
      console.log("Utils.unmuteIOS(false, true)");
      Utils.unmuteIOS(false, true);
    }
  }
  loadConfig(config2, buffers) {
    this.config.load(config2);
    this.bufferManager.empty();
    buffers.forEach(
      ({ name, buffer }) => this.bufferManager.setSoundBuffer(name, buffer)
    );
    const { scenes, sources, busses } = this.config.config;
    this.scenes = /* @__PURE__ */ new Map();
    this.loadSceneConfigs(scenes);
    this.bufferManager.addSources(sources);
    this.disposeInstruments();
    this.busManager.empty();
    this.busManager = new BusManager(
      busses,
      this.bufferManager,
      this.config.config.channels
    );
  }
  loadSceneConfigs(scenes) {
    Object.entries(scenes).forEach(([sceneName, scene]) => {
      scene.name = sceneName;
      if (scene.bus) {
        scene.sounds = scene.sounds.map((soundSetting) => {
          if (!soundSetting.bus) {
            soundSetting.bus = scene.bus;
          }
          return soundSetting;
        });
      }
      this.scenes.set(scene.name, scene);
    });
  }
  disposeInstruments() {
    if (this.instrumentManager) {
      this.instrumentManager.disposeAll();
    }
  }
  onConfigUpdate(update) {
    const { location, toUpdate, action } = update;
    if (location.match(/^scenes\./)) {
      const hierarchy = location.split(".");
      const sceneName = hierarchy[1];
      if (hierarchy.length === 2) {
        switch (action) {
          case ConfigAction.CREATE:
            this.addScene(sceneName);
            break;
          case ConfigAction.DELETE:
            this.deleteScene(sceneName);
            break;
          case ConfigAction.UPDATE:
            Object.keys(toUpdate).forEach((key) => {
              switch (key) {
                case "name":
                  if (!this.scenes.has(toUpdate.name)) {
                    const scene = this.scenes.get(sceneName);
                    scene.name = toUpdate.name;
                    this.scenes.set(toUpdate.name, scene);
                    this.deleteScene(sceneName);
                  }
                  break;
              }
            });
            break;
        }
      }
    }
  }
  addSource({
    source,
    buffer
  }) {
    this.config.addSource(source);
    this.bufferManager.addSource(source);
    this.bufferManager.setSoundBuffer(source.name, buffer);
  }
  initializeAudioContext() {
    const context2 = getContext$1();
    const initialContextState = context2.state;
    if (this.config.config.channels && this.config.config.channels > 2) {
      context2.destination.channelCountMode = "explicit";
      context2.destination.channelCount = context2.destination.maxChannelCount;
    }
    if (this.busManager.getBus("fade") && initialContextState === "suspended") {
      this.setBusVolume("fade", 0, 0);
    }
    return start().then(() => {
      if (this.busManager.getBus("fade") && initialContextState === "suspended") {
        this.setBusVolume("fade", 1, 1);
      }
      this.audioIsInitialized = true;
      Draw2.expiration = 2;
    });
  }
  destroy() {
    this.instrumentManager.disposeAll();
    this.busManager.empty();
    this.bufferManager.empty();
  }
  loadScene(sceneName, setCurrent = false, onLoaded, loadProgress) {
    return __async(this, null, function* () {
      let scene = this.scenes.get(sceneName);
      if (!scene) {
        scene = this.scenes.get("main");
      }
      const totalSounds = scene.sounds.length;
      let loadedSounds = 0;
      if (setCurrent) {
        this.currentScene = scene;
        this.loadingState = "loading";
      }
      const loadPromises = scene.sounds.map(
        (sound) => this.instrumentManager.createInstrument(scene, sound).then(() => {
          loadedSounds++;
          loadProgress && loadProgress(loadedSounds, totalSounds);
        })
      );
      return Promise.all(loadPromises).then(() => {
        scene.sounds.forEach((sound) => {
          var _a, _b, _c;
          const isPositioned = ((_a = sound.spatial) == null ? void 0 : _a.mode) === "3d" || ((_b = sound.spatial) == null ? void 0 : _b.mode) === "mono";
          if (!isPositioned && ((_c = sound.spatial) == null ? void 0 : _c.doesNotMove)) {
            this.triggerForScene(sound.name, { noReset: true });
          }
        });
        window.AE_DEBUG && console.log("Audio: loaded scene");
        this.loadingState = "loaded";
        onLoaded && onLoaded();
      });
    });
  }
  changeScene(sceneName, settings) {
    var _a, _b;
    if (sceneName === ((_a = this.currentScene) == null ? void 0 : _a.name)) {
      return false;
    }
    const { onLoaded } = settings;
    const fadeOutTime = settings.fadeOutTime !== null ? settings.fadeOutTime : 0;
    const instrumentKeys = this.instrumentManager.getInstrumentKeysForScene(
      (_b = this.currentScene) == null ? void 0 : _b.name
    );
    const allInstrumentsForPreviousScene = instrumentKeys.map(
      (key) => this.instrumentManager.getInstrument(key)
    );
    Promise.all(
      allInstrumentsForPreviousScene.map(
        (instrument) => new Promise(
          (resolve) => this.instrumentManager.stop(instrument.name, {
            fadeTime: fadeOutTime,
            when: 0,
            onComplete: () => resolve(true)
          })
        )
      )
    ).then(() => {
      allInstrumentsForPreviousScene.forEach(
        (instrument) => this.instrumentManager.disposeInstrument(instrument)
      );
    });
    return this.loadScene(sceneName, true, onLoaded);
  }
  unloadScene(sceneName) {
    this.instrumentManager.instruments.forEach(
      (instrument, key) => {
        if (key.match(`${sceneName}:`)) {
          this.instrumentManager.disposeInstrument(instrument);
        }
      }
    );
  }
  addScene(sceneName) {
    if (this.scenes.get(sceneName)) {
      console.warn("scene already exists");
      return;
    }
    const newScene = {
      name: sceneName,
      sounds: []
    };
    this.scenes.set(sceneName, newScene);
  }
  deleteScene(sceneName) {
    this.scenes.delete(sceneName);
  }
  getBusses() {
    return this.busManager.getAll();
  }
  getBus(key) {
    return this.busManager.getBus(key);
  }
  getInstrument(key) {
    return this.instrumentManager.getInstrument(key);
  }
  getInstruments() {
    return this.instrumentManager.instruments;
  }
  getInstrumentById(id) {
    const allInstruments = this.getInstruments();
    const [_, instrument] = Array.from(allInstruments).find(
      ([_2, instrument2]) => instrument2.uuid === id
    );
    return instrument;
  }
  getBusById(id) {
    const allBusses = this.getBusses();
    const [_, bus] = Array.from(allBusses).find(([_2, bus2]) => bus2.uuid === id);
    return bus;
  }
  getCurrentScene() {
    return this.currentScene;
  }
  getScenes() {
    return this.scenes;
  }
  getInstrumentForScene(key) {
    var _a;
    return this.instrumentManager.getInstrument(
      `${(_a = this.currentScene) == null ? void 0 : _a.name}:${key}`
    );
  }
  trigger(key, options) {
    this.instrumentManager.trigger(key, options);
  }
  triggerForScene(key, options) {
    var _a;
    if (!this.currentScene) {
      window.AE_DEBUG && console.warn("Klang: No current scene");
      return false;
    }
    this.trigger(`${(_a = this.currentScene) == null ? void 0 : _a.name}:${key}`, options);
    return true;
  }
  triggerAllForScene(scene, options) {
    const instrumentKeys = this.instrumentManager.getInstrumentKeysForScene(scene);
    instrumentKeys.forEach((key) => {
      this.trigger(key, options);
    });
  }
  stopForScene(key, options) {
    var _a;
    this.stop(`${(_a = this.currentScene) == null ? void 0 : _a.name}:${key}`, options);
  }
  stop(key, options) {
    this.instrumentManager.stop(key, options);
  }
  pause(key, options) {
    const instrument = this.instrumentManager.getInstrument(key);
    if (instrument) {
      instrument.pause(options);
    }
  }
  pauseForScene(key, options) {
    var _a;
    if (!this.currentScene) {
      window.AE_DEBUG && console.warn("Klang: No current scene");
      return false;
    }
    this.pause(`${(_a = this.currentScene) == null ? void 0 : _a.name}:${key}`, options);
    return true;
  }
  resume(key, options) {
    const instrument = this.instrumentManager.getInstrument(key);
    if (instrument) {
      instrument.resume(options);
    }
  }
  resumeForScene(key, options) {
    var _a;
    if (!this.currentScene) {
      window.AE_DEBUG && console.warn("Klang: No current scene");
      return false;
    }
    this.resume(`${(_a = this.currentScene) == null ? void 0 : _a.name}:${key}`, options);
    return true;
  }
  fadeOutForScene(key, options) {
    var _a;
    const keyWithScene = `${(_a = this.currentScene) == null ? void 0 : _a.name}:${key}`;
    this.instrumentManager.fadeOut(keyWithScene, options);
  }
  fadeOut(key, options) {
    this.instrumentManager.fadeOut(key, options);
  }
  setPositionForScene(key, position) {
    if (!position || !this.currentScene) {
      return true;
    }
    this.setPosition(`${this.currentScene.name}:${key}`, position);
  }
  setPosition(key, position) {
    const instrument = this.instrumentManager.getInstrument(key);
    if (typeof position === "number") {
      position = { x: position, y: void 0, z: void 0 };
    }
    if (instrument == null) {
      return false;
    }
    const { channel } = instrument;
    channel.setPosition(position.x, position.y, position.z);
    const distanceToObject = calculateDistance(
      { x: position.x, y: position.z },
      { x: this.listener.positionX.value, y: this.listener.positionZ.value }
    );
    const minimumListeningDistance = channel.maxAudibleDistance;
    if (channel.isPositional) {
      if (instrument.getState() === "stopped" && distanceToObject < minimumListeningDistance) {
        this.trigger(key);
      } else if (instrument.getState() !== "stopped" && distanceToObject > minimumListeningDistance) {
        this.instrumentManager.stop(instrument.name, {
          fadeTime: 0,
          when: 0
        });
      }
    }
  }
  setListenerPosition(playerPosition, playerRotation) {
    if (!playerPosition) {
      return true;
    }
    this.listener.set({
      positionX: playerPosition.x,
      positionY: playerPosition.y,
      positionZ: playerPosition.z,
      forwardX: Math.sin(-playerRotation.y),
      forwardY: 0,
      forwardZ: -Math.cos(-playerRotation.y)
    });
    return this.listener;
  }
  setBusVolume(key, volume, fadeTime = 1, when = 0) {
    this.busManager.setBusVolume(key, volume, fadeTime, when);
  }
  setBusMute(key, shouldMute) {
    return this.busManager.setBusMute(key, shouldMute);
  }
  getMasterGain() {
    return this.busManager.masterGain;
  }
  addInstrument(_0) {
    return __async(this, arguments, function* ({ sound, sceneName, buffer }) {
      const configSound = sound;
      if (!configSound.sound) {
        configSound.sound = sound.name;
      }
      yield this.instrumentManager.addInstrument({
        sound: configSound,
        sceneName,
        buffer
      });
      this.config.addInstrument(sceneName, configSound);
    });
  }
  deleteInstrument(name) {
    this.instrumentManager.deleteInstrument(name);
    this.config.deleteInstrument(name);
  }
  getCurrentConfig() {
    return this.config.getCurrentConfig(
      this.busManager.getAll(),
      this.instrumentManager
    );
  }
  connectMediaToBus(busName, element) {
    this.busManager.connectMediaToBus(busName, element);
  }
  setSupportedLanguages(supportedLanguages) {
    this.bufferManager.setSupportedLanguages(supportedLanguages);
  }
  setDefaultLanguage(defaultLanguage) {
    this.bufferManager.setDefaultLanguage(defaultLanguage);
  }
  setLanguage(language) {
    this.bufferManager.setLanguage(language);
  }
  static now() {
    return now();
  }
  pauseAllCurrentlyPlaying(options) {
    var _a;
    for (const instrument of this.getInstruments().values()) {
      if (((_a = instrument.settings) == null ? void 0 : _a.type) === "player" && instrument.getState && instrument.getState() === "started") {
        instrument.pause(options);
      }
    }
  }
  resumeAllPlaying(options) {
    var _a;
    for (const instrument of this.getInstruments().values()) {
      if (((_a = instrument.settings) == null ? void 0 : _a.type) === "player" && instrument.getState && instrument.getState() === "paused") {
        instrument.resume(options);
      }
    }
  }
}
const createFSM = (stateMachineDefinition) => {
  const machine = {
    value: stateMachineDefinition.initialState,
    stash: {},
    transition(nextState, force = false) {
      var _a, _b;
      if (!force && machine.value === nextState) {
        return machine.value;
      }
      const currentState = machine.value;
      const currentStateDefinition = stateMachineDefinition.states[currentState];
      const destinationStateDefinition = stateMachineDefinition.states[nextState];
      if (destinationStateDefinition) {
        const destinationTransition = (currentStateDefinition == null ? void 0 : currentStateDefinition.transitions) && (currentStateDefinition == null ? void 0 : currentStateDefinition.transitions[nextState]);
        (destinationTransition == null ? void 0 : destinationTransition.action) && destinationTransition.action(machine.value);
        ((_a = currentStateDefinition == null ? void 0 : currentStateDefinition.actions) == null ? void 0 : _a.onExit) && currentStateDefinition.actions.onExit(nextState, machine.stash);
        machine.stash = ((_b = destinationStateDefinition == null ? void 0 : destinationStateDefinition.actions) == null ? void 0 : _b.onEnter) && destinationStateDefinition.actions.onEnter(machine.value);
        machine.value = nextState;
      } else {
        console.warn("no destination state found");
      }
      return machine.value;
    },
    exit() {
      const currentState = machine.value;
      const currentStateDefinition = stateMachineDefinition.states[currentState];
      currentStateDefinition && currentStateDefinition.actions && currentStateDefinition.actions.onExit(null, machine.stash);
    }
  };
  return machine;
};
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var dist = {};
var Pseq$1 = {};
var patternUtils = {};
var __spreadArray$1 = commonjsGlobal && commonjsGlobal.__spreadArray || function(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar)
          ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(patternUtils, "__esModule", { value: true });
patternUtils.resettableGenerator = patternUtils.unwrapValue = void 0;
var unwrapValue = function(value) {
  if (value.hasOwnProperty("next")) {
    return value.next().value;
  }
  if (typeof value === "function") {
    return value();
  }
  return value;
};
patternUtils.unwrapValue = unwrapValue;
var resettableGenerator = function(f) {
  var proxy = new Proxy(f, {
    apply: function(target, thisArg, argumentsList) {
      var base = target.call.apply(target, __spreadArray$1([thisArg], argumentsList, false)), basenext = base.next;
      var generator = base;
      base.next = function next() {
        return generator === base ? basenext.call(base) : generator.next();
      };
      Object.defineProperty(generator, "reset", {
        enumerable: false,
        value: function() {
          return generator = target.call.apply(target, __spreadArray$1([thisArg], argumentsList, false));
        }
      });
      return generator;
    }
  });
  return proxy;
};
patternUtils.resettableGenerator = resettableGenerator;
var __generator$4 = commonjsGlobal && commonjsGlobal.__generator || function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
Object.defineProperty(Pseq$1, "__esModule", { value: true });
Pseq$1.Pseq = void 0;
var pattern_utils_1$2 = patternUtils;
function Pseq(values, repetitions) {
  var index2, result, i, i_1;
  return __generator$4(this, function(_a) {
    switch (_a.label) {
      case 0:
        index2 = 0;
        result = function() {
          var nextElement = values[index2++ % values.length];
          var value;
          value = (0, pattern_utils_1$2.unwrapValue)(nextElement);
          if (value == null && nextElement.next().done) {
            nextElement.reset();
            nextElement = values[index2++ % values.length];
            value = (0, pattern_utils_1$2.unwrapValue)(nextElement);
          } else if (value == null) {
            nextElement = values[index2++ % values.length];
            value = (0, pattern_utils_1$2.unwrapValue)(nextElement);
          }
          return value;
        };
        if (!(repetitions == null))
          return [3, 4];
        _a.label = 1;
      case 1:
        return [4, result()];
      case 2:
        _a.sent();
        return [3, 1];
      case 3:
        return [3, 10];
      case 4:
        i = 0;
        _a.label = 5;
      case 5:
        if (!(i < repetitions))
          return [3, 10];
        i_1 = 0;
        _a.label = 6;
      case 6:
        if (!(i_1 < values.length))
          return [3, 9];
        return [4, result()];
      case 7:
        _a.sent();
        _a.label = 8;
      case 8:
        i_1++;
        return [3, 6];
      case 9:
        i++;
        return [3, 5];
      case 10:
        return [
          2
        ];
    }
  });
}
Pseq$1.Pseq = Pseq;
Pseq$1.default = function(values, repetitions) {
  return (0, pattern_utils_1$2.resettableGenerator)(Pseq)(values, repetitions);
};
var Prand$1 = {};
var __generator$3 = commonjsGlobal && commonjsGlobal.__generator || function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
Object.defineProperty(Prand$1, "__esModule", { value: true });
var pattern_utils_1$1 = patternUtils;
function Prand(values, repetitions) {
  var result, i;
  return __generator$3(this, function(_a) {
    switch (_a.label) {
      case 0:
        result = function() {
          var nextElement = values[Math.floor(Math.random() * values.length)];
          return (0, pattern_utils_1$1.unwrapValue)(nextElement);
        };
        if (!(repetitions == void 0))
          return [3, 4];
        _a.label = 1;
      case 1:
        return [4, result()];
      case 2:
        _a.sent();
        return [3, 1];
      case 3:
        return [3, 8];
      case 4:
        i = 0;
        _a.label = 5;
      case 5:
        if (!(i < repetitions))
          return [3, 8];
        return [4, result()];
      case 6:
        _a.sent();
        _a.label = 7;
      case 7:
        i++;
        return [3, 5];
      case 8:
        return [
          2
        ];
    }
  });
}
Prand$1.default = Prand;
var Pchoose$1 = {};
var utils = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getSequentialRandomIndex = exports.mod = exports.isEquivalent = exports.normalize = exports.windex = exports.makeFunction = exports.flipCoin = exports.mapToDomain = exports.findInCollection = exports.getClosestMember = exports.getRateFromFrequencies = exports.choose = exports.ftom = exports.mtof = void 0;
  var mtof2 = function(note) {
    return Math.pow(2, note / 12) * 440;
  };
  exports.mtof = mtof2;
  var ftom2 = function(note) {
    return Math.sqrt(note / 440) / 12;
  };
  exports.ftom = ftom2;
  var choose = function(array) {
    return array[Math.floor(Math.random() * array.length)];
  };
  exports.choose = choose;
  var getRateFromFrequencies = function(freq, baseFreq) {
    return freq / baseFreq;
  };
  exports.getRateFromFrequencies = getRateFromFrequencies;
  var getClosestMember = function(subject, set) {
    return set.reduce(function(accum, member) {
      var prevDistance = accum - subject;
      var currentDistance = member - subject;
      return Math.abs(currentDistance) < Math.abs(prevDistance) ? member : accum;
    }, set[0]);
  };
  exports.getClosestMember = getClosestMember;
  var findInCollection = function(collection, predicateFunction) {
    return collection.reduce(function(accum, member) {
      return predicateFunction(member) ? member : accum;
    });
  };
  exports.findInCollection = findInCollection;
  var mapToDomain = function(set, domain) {
    var setOffset = Math.min.apply(Math, domain) - Math.min.apply(Math, set);
    var domainRange = Math.max.apply(Math, domain) - Math.min.apply(Math, domain);
    var setRange = Math.max.apply(Math, set) - Math.min.apply(Math, set);
    return set.map(function(member) {
      return (0, exports.getClosestMember)((member - Math.min.apply(Math, set)) / setRange * domainRange + setOffset, domain);
    });
  };
  exports.mapToDomain = mapToDomain;
  var flipCoin = function(probability) {
    if (probability === void 0) {
      probability = 0.5;
    }
    return Math.random() < probability ? true : false;
  };
  exports.flipCoin = flipCoin;
  var makeFunction = function(value) {
    if (typeof value === "function") {
      return value;
    } else {
      return function() {
        return value;
      };
    }
  };
  exports.makeFunction = makeFunction;
  var windex = function(weights) {
    var sumOfWeights = weights.reduce(function(prev, curr) {
      return prev + curr;
    });
    var randNum = Math.random() * sumOfWeights;
    var weightSum = 0;
    for (var i = 0; i < weights.length; i++) {
      weightSum += weights[i];
      weightSum = +weightSum.toFixed(2);
      if (randNum <= weightSum) {
        return i;
      }
    }
    return 0;
  };
  exports.windex = windex;
  var normalize = function(coll) {
    var collSum = coll.reduce(function(a, b) {
      return a + b;
    });
    return collSum > 0 ? coll.map(function(weight) {
      return weight / collSum;
    }) : coll.map(function() {
      return 0;
    });
  };
  exports.normalize = normalize;
  var isEquivalent = function(a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
      return false;
    }
    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];
      if (a[propName] !== b[propName]) {
        return false;
      }
    }
    return true;
  };
  exports.isEquivalent = isEquivalent;
  var mod = function(num, modulo) {
    return (num % modulo + modulo) % modulo;
  };
  exports.mod = mod;
  var getSequentialRandomIndex = function(lastIndex, length) {
    var possibleIndexes = Array(length).fill(0).map(function(item, i) {
      return i;
    }).filter(function(item) {
      return item !== lastIndex;
    });
    return (0, exports.choose)(possibleIndexes);
  };
  exports.getSequentialRandomIndex = getSequentialRandomIndex;
  exports.default = {
    mtof: exports.mtof,
    ftom: exports.ftom,
    choose: exports.choose,
    getRateFromFrequencies: exports.getRateFromFrequencies,
    getClosestMember: exports.getClosestMember,
    findInCollection: exports.findInCollection,
    mapToDomain: exports.mapToDomain,
    flipCoin: exports.flipCoin,
    makeFunction: exports.makeFunction,
    windex: exports.windex,
    normalize: exports.normalize,
    isEquivalent: exports.isEquivalent,
    mod: exports.mod,
    getSequentialRandomIndex: exports.getSequentialRandomIndex
  };
})(utils);
var __generator$2 = commonjsGlobal && commonjsGlobal.__generator || function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
Object.defineProperty(Pchoose$1, "__esModule", { value: true });
var pattern_utils_1 = patternUtils;
var utils_1$1 = utils;
function Pchoose(values, repetitions) {
  var lastIndex, result, i;
  return __generator$2(this, function(_a) {
    switch (_a.label) {
      case 0:
        lastIndex = 0;
        result = function() {
          var nextIndex = (0, utils_1$1.getSequentialRandomIndex)(lastIndex, values.length);
          var nextElement = values[nextIndex];
          lastIndex = nextIndex;
          return (0, pattern_utils_1.unwrapValue)(nextElement);
        };
        if (!(repetitions == void 0))
          return [3, 4];
        _a.label = 1;
      case 1:
        return [4, result()];
      case 2:
        _a.sent();
        return [3, 1];
      case 3:
        return [3, 8];
      case 4:
        i = 0;
        _a.label = 5;
      case 5:
        if (!(i < repetitions))
          return [3, 8];
        return [4, result()];
      case 6:
        _a.sent();
        _a.label = 7;
      case 7:
        i++;
        return [3, 5];
      case 8:
        return [
          2
        ];
    }
  });
}
Pchoose$1.default = Pchoose;
var Pmarkov$1 = {};
var build = { exports: {} };
(function(module, exports) {
  !function(t, e) {
    module.exports = e();
  }("undefined" != typeof self ? self : commonjsGlobal, function() {
    return (() => {
      var t = { d: (e2, r2) => {
        for (var n2 in r2)
          t.o(r2, n2) && !t.o(e2, n2) && Object.defineProperty(e2, n2, { enumerable: true, get: r2[n2] });
      }, o: (t2, e2) => Object.prototype.hasOwnProperty.call(t2, e2), r: (t2) => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(t2, "__esModule", { value: true });
      } }, e = {};
      t.r(e), t.d(e, { MarkovN: () => h, utils: () => n });
      const r = { mtof: (t2) => 440 * Math.pow(2, t2 / 12), ftom: (t2) => Math.sqrt(t2 / 440) / 12, choose: (t2) => t2[Math.floor(Math.random() * t2.length)], getRateFromFrequencies: (t2, e2) => t2 / e2, getClosestMember: (t2, e2) => e2.reduce((e3, r2) => {
        const n2 = e3 - t2, o2 = r2 - t2;
        return Math.abs(o2) < Math.abs(n2) ? r2 : e3;
      }, e2[0]), findInCollection: (t2, e2) => t2.reduce((t3, r2) => e2(r2) ? r2 : t3), mapToDomain: (t2, e2) => {
        const n2 = Math.min(...e2) - Math.min(...t2), o2 = Math.max(...e2) - Math.min(...e2), i2 = Math.max(...t2) - Math.min(...t2);
        return t2.map((a2) => r.getClosestMember((a2 - Math.min(...t2)) / i2 * o2 + n2, e2));
      }, flipCoin: (t2 = 0.5) => !(Math.random() < t2), makeFunction: (t2) => "function" == typeof t2 ? t2 : () => t2 }, n = r, o = (t2) => {
        let e2 = t2.reduce((t3, e3) => t3 + e3);
        return e2 > 0 ? t2.map((t3) => t3 / e2) : t2.map(() => 0);
      }, i = (t2, e2) => {
        if (Array.isArray(t2) && Array.isArray(e2)) {
          let r2 = 0;
          return t2.forEach((t3, n2) => {
            a(t3, e2[n2]) && (r2 += 1);
          }), r2 === t2.length;
        }
        return !(Array.isArray(t2) && !Array.isArray(e2) || !Array.isArray(t2) && Array.isArray(e2)) && a(t2, e2);
      }, a = (t2, e2) => {
        if (t2 === e2)
          return true;
        if ("object" != typeof t2 || "object" != typeof e2 || null == t2 || null == e2)
          return false;
        let r2 = Object.keys(t2), n2 = Object.keys(e2);
        if (r2.length != n2.length)
          return false;
        for (let o2 of r2) {
          if (!n2.includes(o2))
            return false;
          if ("function" == typeof t2[o2] || "function" == typeof e2[o2]) {
            if (t2[o2].toString() != e2[o2].toString())
              return false;
          } else if (!a(t2[o2], e2[o2]))
            return false;
        }
        return true;
      }, s = (t2, e2) => (t2 % e2 + e2) % e2, l = (t2, e2) => {
        const r2 = [...t2];
        return r2.shift(), r2.push(e2), r2;
      }, h = class {
        constructor(t2, e2) {
          this.dictionary = [], this.combinations = [], this.lastState = [];
          for (let r2 = 0; r2 < e2; r2++)
            this.lastState.push(t2[r2]);
          this.transitionMatrix = this.createTransitionMatrix(t2, e2);
        }
        createTransitionMatrix(t2, e2) {
          this.dictionary = t2.reduce((t3, e3) => {
            let r3 = false;
            return t3.forEach((t4) => {
              i(t4, e3) && (r3 = true);
            }), r3 || t3.push(e3), t3;
          }, []), this.combinations = ((t3, e3) => t3.reduce((r3, n2, o2) => {
            const i2 = [];
            for (let r4 = e3; r4 >= 0; r4--)
              i2.push(t3[s(o2 - r4, t3.length)]);
            return r3.push(i2), r3;
          }, []))(t2, e2);
          let r2 = [];
          for (let t3 = 0; t3 < this.combinations.length; t3++) {
            let t4 = [];
            for (let e3 = 0; e3 < this.dictionary.length; e3++)
              t4.push(0);
            r2.push(t4);
          }
          for (let n2 = 0; n2 < t2.length; n2++) {
            let o2 = [];
            for (let r3 = e2; r3 >= 0; r3--)
              o2.push(t2[s(n2 - r3, t2.length)]);
            let a2 = this.combinations.findIndex((t3) => i(o2, t3)), l2 = t2[(n2 + 1) % t2.length], h2 = this.dictionary.findIndex((t3) => i(l2, t3));
            r2[a2][h2]++;
          }
          return r2 = r2.map(o), r2;
        }
        getNextState(t2) {
          const e2 = ((t3) => {
            let e3 = t3.reduce((t4, e4) => t4 + e4), r2 = Math.random() * e3, n2 = 0;
            for (let e4 = 0; e4 < t3.length; e4++)
              if (n2 += t3[e4], n2 = +n2.toFixed(2), r2 <= n2)
                return e4;
          })(this.transitionMatrix[this.combinations.findIndex((e3) => i(t2, e3))]);
          return this.dictionary[e2];
        }
        *asPattern(t2) {
          for (this.lastState = t2; ; ) {
            let t3 = this.getNextState(this.lastState);
            this.lastState = l(this.lastState, t3), yield t3;
          }
        }
      };
      return e;
    })();
  });
})(build);
var buildExports = build.exports;
Object.defineProperty(Pmarkov$1, "__esModule", { value: true });
var markovn_1 = buildExports;
function Pmarkov(seed, order, initialState) {
  var markovChain = new markovn_1.MarkovN(seed, order);
  return markovChain.asPattern(initialState);
}
Pmarkov$1.default = Pmarkov;
var Pgenetic$1 = {};
var Genetic$1 = {};
var __generator$1 = commonjsGlobal && commonjsGlobal.__generator || function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
var __spreadArray = commonjsGlobal && commonjsGlobal.__spreadArray || function(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar)
          ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(Genetic$1, "__esModule", { value: true });
Genetic$1.Genetic = void 0;
var utils_1 = utils;
var Genetic = function() {
  function Genetic2(inputPopulation, goal) {
    this.population = inputPopulation;
    this.scores = Array(inputPopulation.length).fill(0);
    this.goal = goal;
    this.lastState = inputPopulation[Math.floor(Math.random() * (inputPopulation.length - 1))];
  }
  Genetic2.prototype.getTotalFitnessRating = function(collection, goal) {
    var score = 0;
    var normalizedCollection = collection.map(function(num) {
      return num - Math.min.apply(null, collection);
    });
    for (var i = normalizedCollection.length - 1; i >= 0; i--) {
      score += this.getDistance(normalizedCollection[i], goal[i]);
    }
    return score;
  };
  Genetic2.prototype.getTopTwoGenerations = function(scores, population) {
    var indexOfHighestScore = 0;
    for (var i = scores.length - 1; i >= 0; i--) {
      if (scores[indexOfHighestScore] < scores[i]) {
        indexOfHighestScore = i;
      }
      if (scores[indexOfHighestScore] === scores[i]) {
        var coinFlip = (0, utils_1.flipCoin)(0.5);
        indexOfHighestScore = coinFlip ? indexOfHighestScore : i;
      }
    }
    var indexOfNextHighestScore = 0;
    var topGenerationScore = scores[indexOfHighestScore];
    var coinFlipForMutate = (0, utils_1.flipCoin)(0.75);
    if (coinFlipForMutate) {
      indexOfNextHighestScore = Math.floor(Math.random() * scores.length);
    } else {
      for (var i = scores.length - 1; i >= 0; i--) {
        if (scores[i] !== topGenerationScore) {
          if (scores[indexOfNextHighestScore] < scores[i]) {
            indexOfNextHighestScore = i;
          }
          if (scores[indexOfNextHighestScore] === scores[i]) {
            var coinFlip = Math.random();
            indexOfNextHighestScore = coinFlip > 0.5 ? indexOfNextHighestScore : i;
          }
        }
      }
    }
    return [population[indexOfHighestScore], population[indexOfNextHighestScore]];
  };
  Genetic2.prototype.mateGenerations = function(parents) {
    var splicedOffspring = this.getSplicedOffspring(parents[0], parents[1]);
    var interlacedOffspring = this.getInterlacedOffspring(parents[0], parents[1]);
    return [splicedOffspring, interlacedOffspring];
  };
  Genetic2.prototype.getInterlacedOffspring = function(parentOne, parentTwo) {
    var interlacedOffspring = Array(parentOne.length);
    for (var i = interlacedOffspring.length - 1; i >= 0; i--) {
      interlacedOffspring[i] = i % 2 === 0 ? parentOne[i] : parentTwo[i];
    }
    return interlacedOffspring;
  };
  Genetic2.prototype.getSplicedOffspring = function(parentOne, parentTwo) {
    var coinFlip = Math.random() > 0.5 ? 1 : 0;
    var parents = coinFlip == 0 ? [parentOne, parentTwo] : [parentTwo, parentOne];
    var splitPoint = Math.floor(parentOne.length / 2);
    var splicedOffspring = __spreadArray(__spreadArray([], parents[0].slice(0, splitPoint), true), parents[1].slice(splitPoint - 1, parents[1].length - 1), true);
    return splicedOffspring;
  };
  Genetic2.prototype.getDistance = function(input, goal) {
    var rating = goal - input;
    return rating;
  };
  Genetic2.prototype.getPopulationScores = function(population, goal) {
    var scores = Array(population.length).fill(0);
    for (var i = population.length - 1; i >= 0; i--) {
      scores[i] = this.getTotalFitnessRating(population[i], goal);
    }
    return scores;
  };
  Genetic2.prototype.getNextGeneration = function(population, goal) {
    var populationScores = this.getPopulationScores(population, goal);
    var topTwoGenerations = this.getTopTwoGenerations(populationScores, population);
    var newGenerations = this.mateGenerations(topTwoGenerations);
    for (var i = 0; i < newGenerations.length - 1; i++) {
      this.population.splice(Math.floor(Math.random() * (this.population.length - 1)), 1);
    }
    this.population = __spreadArray(__spreadArray([], this.population, true), newGenerations, true);
    var bestFitGeneration = newGenerations[Math.floor(Math.random() * (newGenerations.length * 0.999))];
    return bestFitGeneration;
  };
  Genetic2.prototype.getNextState = function(state) {
    var nextState = this.getNextGeneration(this.population, this.goal);
    return nextState;
  };
  Genetic2.prototype.asPattern = function() {
    var self2 = this;
    return function asPattern(initialState) {
      var nextState;
      return __generator$1(this, function(_a) {
        switch (_a.label) {
          case 0:
            self2.lastState = initialState;
            _a.label = 1;
          case 1:
            nextState = self2.getNextState(self2.lastState);
            self2.lastState = nextState;
            return [4, nextState];
          case 2:
            _a.sent();
            return [3, 1];
          case 3:
            return [
              2
            ];
        }
      });
    };
  };
  return Genetic2;
}();
Genetic$1.Genetic = Genetic;
var __generator = commonjsGlobal && commonjsGlobal.__generator || function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
Object.defineProperty(Pgenetic$1, "__esModule", { value: true });
var Genetic_1 = Genetic$1;
function Pgenetic(inputPopulation, goal) {
  var genetic, lastState, nextState;
  return __generator(this, function(_a) {
    switch (_a.label) {
      case 0:
        genetic = new Genetic_1.Genetic(inputPopulation, goal);
        lastState = goal;
        _a.label = 1;
      case 1:
        nextState = genetic.getNextState(lastState);
        lastState = [lastState[lastState.length - 1], nextState];
        return [4, nextState];
      case 2:
        _a.sent();
        return [3, 1];
      case 3:
        return [
          2
        ];
    }
  });
}
Pgenetic$1.default = Pgenetic;
(function(exports) {
  var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.utils = exports.Pgenetic = exports.Pmarkov = exports.Pchoose = exports.Prand = exports.Pseq = exports.Pattern = void 0;
  var Pattern = function(pattern) {
    return [function() {
      return pattern.next().value;
    }];
  };
  exports.Pattern = Pattern;
  var Pseq_1 = Pseq$1;
  Object.defineProperty(exports, "Pseq", { enumerable: true, get: function() {
    return __importDefault(Pseq_1).default;
  } });
  var Prand_1 = Prand$1;
  Object.defineProperty(exports, "Prand", { enumerable: true, get: function() {
    return __importDefault(Prand_1).default;
  } });
  var Pchoose_1 = Pchoose$1;
  Object.defineProperty(exports, "Pchoose", { enumerable: true, get: function() {
    return __importDefault(Pchoose_1).default;
  } });
  var Pmarkov_1 = Pmarkov$1;
  Object.defineProperty(exports, "Pmarkov", { enumerable: true, get: function() {
    return __importDefault(Pmarkov_1).default;
  } });
  var Pgenetic_1 = Pgenetic$1;
  Object.defineProperty(exports, "Pgenetic", { enumerable: true, get: function() {
    return __importDefault(Pgenetic_1).default;
  } });
  var utils_12 = utils;
  Object.defineProperty(exports, "utils", { enumerable: true, get: function() {
    return __importDefault(utils_12).default;
  } });
})(dist);
window.TONE_SILENCE_LOGGING = true;
dist.Pchoose;
dist.Pmarkov;
dist.Prand;
dist.Pseq;
const config = {
  scenes: {
    generic: {
      name: "generic",
      sounds: [
        { name: "typing", sound: ["typing", "typing", "typing"], bus: "ui", type: "roundRobin" },
        { name: "typingDelete", sound: "typingDelete", bus: "ui" },
        { name: "hoverGeneric", sound: "hoverGeneric", bus: "ui" },
        { name: "hoverExpand", sound: "hoverExpand", bus: "ui" },
        { name: "clickGeneric", sound: "clickGeneric", bus: "ui", gain: 0.7 },
        { name: "clickEnter", sound: "clickEnter", bus: "ui" },
        { name: "textAppear1", sound: "textAppear", bus: "textBus" },
        { name: "textAppear2", sound: "textAppear", bus: "textBus" },
        { name: "textAppear3", sound: "textAppear", bus: "textBus" },
        { name: "textAppear4", sound: "textAppear", bus: "textBus" },
        {
          name: "textRolling",
          sound: "textRolling",
          bus: "launchScene",
          loop: true
        },
        { name: "musicMenu", sound: "musicMenu", bus: "master", loop: true, loopEnd: 35.624 },
        { name: "ambMenu", sound: "ambMenu", bus: "master", loop: true },
        { name: "rocketOneshot", sound: "rocketOneshot", gain: 0.3, bus: "master" },
        { name: "satelliteOneshot", sound: "satelliteOneshot", bus: "master" },
        { name: "spacejunkOneshot", sound: "spacejunkOneshot", bus: "master" },
        { name: "transmissionOneshot", sound: "transmissionOneshot", bus: "master" },
        {
          name: "hotspotHover",
          sound: ["hotspotHover", "hotspotHover", "hotspotHover"],
          type: "roundRobin",
          gain: 1.4,
          bus: "ui"
        }
      ]
    },
    main: {
      name: "main",
      sounds: [
        { name: "clickMap", sound: "clickMap", bus: "ui" },
        {
          name: "ambLaunchPad1",
          sound: "ambLaunchPad1",
          bus: "mainBus",
          loop: true,
          loopEnd: 4.714
        },
        {
          name: "rocketDeploy",
          sound: "rocketDeploy",
          bus: "mainBus",
          gain: 0.4221
        },
        {
          name: "rocketFlight",
          sound: "rocketFlight",
          gain: 0.35,
          bus: "mainBus",
          loop: true
        },
        { name: "ambSpace", sound: "ambSpace", bus: "mainBus", loop: true },
        {
          name: "rocketLaunch",
          sound: "rocketLaunch",
          bus: "mainBus",
          gain: 0.4221
        },
        {
          name: "ambLaunchPad2",
          sound: "ambLaunchPad2",
          bus: "mainBus",
          loop: true
        },
        { name: "ambMap", sound: "ambMap", bus: "map", loop: true },
        { name: "terminalOut", sound: "terminalOut", bus: "ui" },
        { name: "terminalIn", sound: "terminalIn", bus: "ui" },
        {
          name: "guardianNotification",
          sound: "guardianNotification",
          bus: "ui"
        },
        { name: "zoomIn", sound: "zoomIn", bus: "ui", gain: 1.3 },
        { name: "zoomOut", sound: "zoomOut", bus: "ui", gain: 1.3 },
        { name: "ctaClick", sound: "ctaClick", bus: "ui" }
      ],
      bus: "master"
    },
    vo: {
      name: "vo",
      sounds: [
        { name: "launchPadIdle2", sound: "launchPadIdle2" },
        { name: "launchPadIdle8", sound: "launchPadIdle8" },
        { name: "launchPadIdle10", sound: "launchPadIdle10" },
        { name: "launchPadIdle9", sound: "launchPadIdle9" },
        { name: "launchPadIdle6", sound: "launchPadIdle6" },
        { name: "launchPadIdle7", sound: "launchPadIdle7" },
        { name: "launchPad4", sound: "launchPad4" },
        { name: "launchPad5", sound: "launchPad5" },
        { name: "launchPadIdleExtra5", sound: "launchPadIdleExtra5" },
        { name: "launchPadIdleExtra4", sound: "launchPadIdleExtra4" },
        { name: "launchPadIdleExtra3", sound: "launchPadIdleExtra3" },
        { name: "launchPadIdleExtra6", sound: "launchPadIdleExtra6" },
        { name: "launchPad2", sound: "launchPad2" },
        { name: "launchPadIdleExtra10", sound: "launchPadIdleExtra10" },
        { name: "launchPadIdleExtra8", sound: "launchPadIdleExtra8" },
        { name: "launchPadIdleExtra2", sound: "launchPadIdleExtra2" },
        { name: "launchPad1", sound: "launchPad1" },
        { name: "launchPadIdle3", sound: "launchPadIdle3" },
        { name: "launchPadIdle4", sound: "launchPadIdle4" },
        { name: "launchPadIdleExtra7", sound: "launchPadIdleExtra7" },
        { name: "launchSequence7", sound: "launchSequence7" },
        { name: "launchPad3", sound: "launchPad3" },
        { name: "satelliteDeployed4", sound: "satelliteDeployed4" },
        { name: "launchSequence4", sound: "launchSequence4" },
        { name: "launchPadIdle1", sound: "launchPadIdle1" },
        { name: "satelliteDeployed2", sound: "satelliteDeployed2" },
        { name: "launchSequence6", sound: "launchSequence6" },
        { name: "satelliteDeployed1", sound: "satelliteDeployed1" },
        { name: "launchSequence5", sound: "launchSequence5" },
        { name: "launchPadIdleExtra1", sound: "launchPadIdleExtra1" },
        { name: "satelliteDeployed5", sound: "satelliteDeployed5" },
        { name: "satelliteDeployed3", sound: "satelliteDeployed3" },
        { name: "satelliteDeployed6", sound: "satelliteDeployed6" },
        { name: "launchSequence2", sound: "launchSequence2" },
        { name: "launchSequence3", sound: "launchSequence3" },
        { name: "launchPadIdle5", sound: "launchPadIdle5" },
        { name: "launchPadIdleExtra9", sound: "launchPadIdleExtra9" },
        { name: "launchSequence1", sound: "launchSequence1" },
        { name: "clearToLaunchPoll6", sound: "clearToLaunchPoll6" },
        { name: "clearToLaunchPoll4", sound: "clearToLaunchPoll4" },
        { name: "clearToLaunchPoll5", sound: "clearToLaunchPoll5" },
        { name: "clearToLaunchPoll13", sound: "clearToLaunchPoll13" },
        { name: "clearToLaunchPoll7", sound: "clearToLaunchPoll7" },
        { name: "clearToLaunchPoll19", sound: "clearToLaunchPoll19" },
        { name: "clearToLaunchPoll15", sound: "clearToLaunchPoll15" },
        { name: "clearToLaunchPoll9", sound: "clearToLaunchPoll9" },
        { name: "clearToLaunchPoll23", sound: "clearToLaunchPoll23" },
        { name: "clearToLaunchPoll17", sound: "clearToLaunchPoll17" },
        { name: "clearToLaunchPoll21", sound: "clearToLaunchPoll21" },
        { name: "clearToLaunchPoll33", sound: "clearToLaunchPoll33" },
        { name: "clearToLaunchPoll27", sound: "clearToLaunchPoll27" },
        { name: "clearToLaunchPoll31", sound: "clearToLaunchPoll31" },
        { name: "clearToLaunchPoll25", sound: "clearToLaunchPoll25" },
        { name: "clearToLaunchPoll11", sound: "clearToLaunchPoll11" },
        { name: "clearToLaunchPoll2", sound: "clearToLaunchPoll2" },
        { name: "clearToLaunchPoll29", sound: "clearToLaunchPoll29" },
        { name: "clearToLaunchPoll3", sound: "clearToLaunchPoll3" },
        { name: "clearToLaunchPoll1", sound: "clearToLaunchPoll1" }
      ],
      bus: "vo"
    }
  },
  sources: [
    { name: "typingDelete" },
    { name: "typing" },
    { name: "hoverGeneric" },
    { name: "hoverExpand" },
    { name: "clickGeneric" },
    { name: "clickEnter" },
    { name: "clickCard" },
    { name: "clickMap" },
    { name: "textAppear" },
    { name: "textRolling" },
    { name: "ambLaunchPad1" },
    { name: "ambMenu" },
    { name: "rocketDeploy" },
    { name: "rocketFlight" },
    { name: "ambSpace" },
    { name: "musicMenu" },
    { name: "rocketLaunch" },
    { name: "ambLaunchPad2" },
    { name: "ambMap" },
    { name: "terminalOut" },
    { name: "terminalIn" },
    { name: "hotspotHover" },
    { name: "guardianNotification" },
    { name: "zoomIn" },
    { name: "zoomOut" },
    { name: "ctaClick" },
    { name: "launchPadIdle2" },
    { name: "launchPadIdle8" },
    { name: "launchPadIdle10" },
    { name: "launchPadIdle9" },
    { name: "launchPadIdle6" },
    { name: "launchPadIdle7" },
    { name: "launchPad4" },
    { name: "launchPad5" },
    { name: "launchPadIdleExtra5" },
    { name: "launchPadIdleExtra4" },
    { name: "launchPadIdleExtra3" },
    { name: "launchPadIdleExtra6" },
    { name: "launchPad2" },
    { name: "launchPadIdleExtra10" },
    { name: "launchPadIdleExtra8" },
    { name: "launchPadIdleExtra2" },
    { name: "launchPad1" },
    { name: "launchPadIdle3" },
    { name: "launchPadIdle4" },
    { name: "launchPadIdleExtra7" },
    { name: "launchSequence7" },
    { name: "launchPad3" },
    { name: "satelliteDeployed4" },
    { name: "launchSequence4" },
    { name: "launchPadIdle1" },
    { name: "satelliteDeployed2" },
    { name: "launchSequence6" },
    { name: "satelliteDeployed1" },
    { name: "launchSequence5" },
    { name: "launchPadIdleExtra1" },
    { name: "satelliteDeployed5" },
    { name: "satelliteDeployed3" },
    { name: "satelliteDeployed6" },
    { name: "launchSequence2" },
    { name: "launchSequence3" },
    { name: "launchPadIdle5" },
    { name: "launchPadIdleExtra9" },
    { name: "launchSequence1" },
    { name: "mapInRed" },
    { name: "mapInSattelite" },
    { name: "clearToLaunchPoll6" },
    { name: "clearToLaunchPoll4" },
    { name: "clearToLaunchPoll5" },
    { name: "clearToLaunchPoll13" },
    { name: "clearToLaunchPoll7" },
    { name: "clearToLaunchPoll19" },
    { name: "clearToLaunchPoll15" },
    { name: "clearToLaunchPoll9" },
    { name: "clearToLaunchPoll23" },
    { name: "clearToLaunchPoll17" },
    { name: "clearToLaunchPoll21" },
    { name: "clearToLaunchPoll33" },
    { name: "clearToLaunchPoll27" },
    { name: "clearToLaunchPoll31" },
    { name: "clearToLaunchPoll25" },
    { name: "clearToLaunchPoll11" },
    { name: "clearToLaunchPoll2" },
    { name: "clearToLaunchPoll29" },
    { name: "clearToLaunchPoll3" },
    { name: "clearToLaunchPoll1" },
    { name: "mapInSatellite" },
    { name: "rocketOneshot" },
    { name: "satelliteOneshot" },
    { name: "spacejunkOneshot" },
    { name: "transmissionOneshot" }
  ],
  busses: [
    { name: "out", parent: "$OUT", gain: 1 },
    { name: "video", parent: "out", gain: 1 },
    { name: "master", parent: "video", gain: 1 },
    { name: "ui", parent: "master", gain: 0.7879 },
    { name: "launchScene", parent: "master", gain: 1 },
    { name: "map", parent: "launchScene", gain: 1 },
    { name: "vo", parent: "launchScene", gain: 1 },
    { name: "mainBus", parent: "launchScene", gain: 1 },
    { name: "textBus", parent: "ui", gain: 0.5 }
  ],
  basePath: "/audio/"
};
const voConfig = {
  parts: [
    {
      name: "launchPad",
      events: [
        {
          key: "launchPad1",
          timeout: 3
        },
        {
          key: "launchPad2",
          timeout: 0
        },
        {
          key: "launchPad3",
          timeout: 0
        },
        {
          key: "launchPad4",
          timeout: 0
        },
        {
          key: "launchPad5",
          timeout: 0
        },
        {
          key: "launchPadIdle1",
          timeout: 10
        },
        {
          key: "launchPadIdle2",
          timeout: 0
        },
        {
          key: "launchPadIdle3",
          timeout: 0
        },
        {
          key: "launchPadIdle4",
          timeout: 0
        },
        {
          key: "launchPadIdle5",
          timeout: 0
        },
        {
          key: "launchPadIdle6",
          timeout: 0
        },
        {
          key: "launchPadIdle7",
          timeout: 0
        },
        {
          key: "launchPadIdle8",
          timeout: 0
        },
        {
          key: "launchPadIdle9",
          timeout: 0
        },
        {
          key: "launchPadIdle10",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra1",
          timeout: 10
        },
        {
          key: "launchPadIdleExtra2",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra3",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra4",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra5",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra6",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra7",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra8",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra9",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra10",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll1",
          timeout: 10
        },
        {
          key: "clearToLaunchPoll2",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll3",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll4",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll5",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll6",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll7",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll4",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll9",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll6",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll11",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll4",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll13",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll6",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll15",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll4",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll17",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll6",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll19",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll4",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll21",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll6",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll23",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll4",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll25",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll6",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll27",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll4",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll29",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll6",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll31",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll4",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll33",
          timeout: 0
        },
        {
          key: "clearToLaunchPoll6",
          timeout: 0
        }
      ]
    },
    {
      name: "launchSequence",
      events: [
        {
          key: "launchSequence1",
          timeout: 0
        },
        {
          key: "launchSequence2",
          timeout: 0
        },
        {
          key: "launchSequence3",
          timeout: 0
        },
        {
          key: "launchSequence4",
          timeout: 0
        },
        {
          key: "launchSequence5",
          timeout: 0
        },
        {
          key: "launchSequence6",
          timeout: 0
        },
        {
          key: "launchSequence7",
          timeout: 0
        }
      ]
    },
    {
      name: "satelliteDeployed",
      events: [
        {
          key: "satelliteDeployed1",
          timeout: 0
        },
        {
          key: "satelliteDeployed2",
          timeout: 0
        },
        {
          key: "satelliteDeployed3",
          timeout: 0
        },
        {
          key: "satelliteDeployed4",
          timeout: 0
        },
        {
          key: "satelliteDeployed5",
          timeout: 0
        },
        {
          key: "satelliteDeployed6",
          timeout: 0
        }
      ]
    },
    {
      name: "launchPadIdle",
      events: [
        {
          key: "launchPadIdle1",
          timeout: 0
        },
        {
          key: "launchPadIdle2",
          timeout: 0
        },
        {
          key: "launchPadIdle3",
          timeout: 0
        },
        {
          key: "launchPadIdle4",
          timeout: 0
        },
        {
          key: "launchPadIdle5",
          timeout: 0
        },
        {
          key: "launchPadIdle6",
          timeout: 0
        },
        {
          key: "launchPadIdle7",
          timeout: 0
        },
        {
          key: "launchPadIdle8",
          timeout: 0
        },
        {
          key: "launchPadIdle9",
          timeout: 0
        },
        {
          key: "launchPadIdle10",
          timeout: 0
        }
      ]
    },
    {
      name: "launchPadIdleExtra",
      events: [
        {
          key: "launchPadIdleExtra1",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra2",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra3",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra4",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra5",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra6",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra7",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra8",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra9",
          timeout: 0
        },
        {
          key: "launchPadIdleExtra10",
          timeout: 0
        }
      ]
    }
  ]
};
class VOPart {
  constructor(config2, sceneManager2, callback) {
    __publicField(this, "config");
    __publicField(this, "timeoutId", 0);
    __publicField(this, "endTimeoutId", 0);
    __publicField(this, "sceneManager");
    __publicField(this, "currentIndex", 0);
    __publicField(this, "callback");
    __publicField(this, "currentKey");
    __publicField(this, "timerPausedAt", null);
    __publicField(this, "timerRemaining", null);
    __publicField(this, "timeoutTargetTime", null);
    this.config = config2;
    this.sceneManager = sceneManager2;
    this.callback = callback;
  }
  start() {
    this.triggerKey(this.currentIndex);
  }
  getCurrentIndex() {
    return this.currentIndex;
  }
  stop(options = { setCompleted: false, stopImmediately: true }) {
    clearTimeout(this.timeoutId);
    clearTimeout(this.endTimeoutId);
    if (options.stopImmediately) {
      this.config.events.forEach((event) => {
        const instrument = this.sceneManager.getInstrument(`vo:${event.key}`);
        if (instrument && instrument.player.state !== "stopped") {
          this.sceneManager.stop(`vo:${event.key}`);
        }
      });
    }
    if (this.currentKey) {
      this.callback && this.callback({ key: this.currentKey, action: "stop" });
    }
    if (options.setCompleted) {
      this.currentIndex = this.config.events.length;
    }
  }
  reset() {
    this.currentIndex = 0;
  }
  pauseCurrent() {
    var _a;
    const event = this.config.events[this.currentIndex - 1];
    if (event && event.key)
      ;
    if (this.timeoutId) {
      this.timerPausedAt = Date.now();
      this.timerRemaining = ((_a = this.timeoutTargetTime) != null ? _a : 0) - this.timerPausedAt;
      clearTimeout(this.timeoutId);
      this.timeoutId = 0;
    }
  }
  resumeCurrent() {
    this.config.events[this.currentIndex - 1];
    if (this.timerRemaining && this.timerRemaining > 0) {
      this.timeoutId = setTimeout(() => {
        this.triggerKey(this.currentIndex, 0);
      }, this.timerRemaining);
      this.timeoutTargetTime = Date.now() + this.timerRemaining;
      this.timerRemaining = null;
    }
  }
  triggerKey(index, delay = 0) {
    if (index < this.config.events.length) {
      const event = this.config.events[index];
      const instrument = this.sceneManager.getInstrument(`vo:${event.key}`);
      const duration = (instrument == null ? void 0 : instrument.getDuration()) || 0;
      this.timeoutId = setTimeout(() => {
        this.sceneManager.trigger(`vo:${event.key}`);
        this.currentKey = event.key;
        this.callback && this.callback({ key: event.key, action: "start" });
        this.endTimeoutId = setTimeout(() => {
          this.currentKey = "";
          this.callback && this.callback({ key: event.key, action: "stop" });
        }, duration * 1e3 - 50);
        this.currentIndex = this.currentIndex + 1;
        this.triggerKey(this.currentIndex, duration);
      }, (event.timeout + delay) * 1e3);
      this.timeoutTargetTime = Date.now() + (event.timeout + delay) * 1e3;
    }
  }
}
window.TONE_SILENCE_LOGGING = true;
const sceneManager = new SceneManager(config);
const scrambleVoices = [];
const excludeTexts = ["Incoming signal...", "close"];
const transitionFadeTime = 0.5;
const voParts = [];
const rocketLaunchScenes = [
  "loader",
  "launchComplex",
  "launchSequence",
  "deploySatellite",
  "deploySatelliteSequence",
  "exploreSatellite"
];
let isPreloaderDone = true;
let voCallback;
let currentCapabilitiesStage = 0;
const oneshotsHasPlayed = {
  "generic:rocketOneshot": false,
  "generic:satelliteOneshot": false,
  "generic:spacejunkOneshot": false,
  "generic:transmissionOneshot": false
};
const onVOPlay = (key) => {
  voCallback && voCallback(key);
};
voConfig.parts.forEach((config2) => {
  const voPart = new VOPart(config2, sceneManager, onVOPlay);
  voParts[config2.name] = voPart;
});
const appFSM = createFSM({
  initialState: "loading",
  states: {
    loader: {
      actions: {
        onEnter: () => {
        },
        onExit: () => {
        }
      }
    },
    launchComplex: {
      actions: {
        onEnter: () => {
          sceneManager.trigger("main:ambMap", { fadeIn: transitionFadeTime });
          sceneManager.trigger("main:ambLaunchPad1", {
            fadeIn: transitionFadeTime
          });
          sceneManager.trigger("main:ambLaunchPad2", {
            fadeIn: transitionFadeTime
          });
          voParts["launchPadIdle"].stop();
          voParts["launchPadIdleExtra"].stop();
          voParts["launchPad"].start();
        },
        onExit: () => {
          sceneManager.fadeOut("main:ambLaunchPad1", {
            fadeTime: transitionFadeTime
          });
          sceneManager.fadeOut("main:ambLaunchPad2", {
            fadeTime: transitionFadeTime
          });
          voParts["launchPad"].stop();
          sceneManager.stop("generic:textRolling");
        }
      }
    },
    launchSequence: {
      actions: {
        onEnter: () => {
          sceneManager.trigger("main:rocketLaunch");
          voParts["launchPadIdle"].stop();
          voParts["launchPadIdleExtra"].stop();
          voParts["launchSequence"].reset();
          voParts["launchSequence"].start();
          voParts["satelliteDeployed"].reset();
          sceneManager.setBusVolume("vo", 1.5, 0.5);
        },
        onExit: (nextState) => {
          sceneManager.fadeOut("main:rocketLaunch", {
            fadeTime: transitionFadeTime
          });
          const stopImmediately = nextState !== "deploySatellite";
          voParts["launchSequence"].stop({ stopImmediately });
          sceneManager.setBusVolume("vo", 1, 0.1);
          sceneManager.stop("generic:textRolling");
        }
      }
    },
    deploySatellite: {
      actions: {
        onEnter: (previousState) => {
          let stopImmediately = false;
          if (previousState === "launchSequence") {
            if (voParts["launchSequence"].getCurrentIndex() < 5) {
              stopImmediately = true;
            }
          }
          voParts["launchSequence"].stop({ stopImmediately });
          voParts["launchSequence"].reset();
          sceneManager.trigger("main:rocketFlight", {
            fadeIn: transitionFadeTime
          });
        },
        onExit: () => {
          sceneManager.fadeOut("main:rocketFlight", {
            fadeTime: transitionFadeTime
          });
        }
      }
    },
    deploySatelliteSequence: {
      actions: {
        onEnter: () => {
          sceneManager.trigger("main:rocketDeploy");
          sceneManager.trigger("main:ambSpace", {
            fadeIn: transitionFadeTime
          });
          voParts["launchSequence"].stop();
          voParts["satelliteDeployed"].start();
        },
        onExit: (nextState) => {
          sceneManager.fadeOut("main:rocketDeploy", {
            fadeTime: transitionFadeTime
          });
          sceneManager.fadeOut("main:ambSpace", {
            fadeTime: transitionFadeTime
          });
          const stopImmediately = nextState !== "exploreSatellite";
          voParts["satelliteDeployed"].stop({ stopImmediately });
        }
      }
    },
    exploreSatellite: {
      actions: {
        onEnter: () => {
          sceneManager.trigger("main:ambSpace", { fadeIn: transitionFadeTime });
        },
        onExit: () => {
          sceneManager.fadeOut("main:ambSpace", {
            fadeTime: transitionFadeTime
          });
        }
      }
    },
    becomeAGuardian: {
      actions: {
        onEnter: (previousState) => {
          sceneManager.trigger("generic:musicMenu", {
            fadeIn: transitionFadeTime
          });
          sceneManager.trigger("generic:ambMenu", {
            fadeIn: transitionFadeTime
          });
          if (previousState === "launchComplex" || previousState === "launchSequence") {
            sceneManager.fadeOut("main:ambLaunchPad1", {
              fadeTime: transitionFadeTime
            });
            sceneManager.fadeOut("main:ambLaunchPad2", {
              fadeTime: transitionFadeTime
            });
          }
          if (previousState === "deploySatelliteSequence" || previousState === "exploreSatellite") {
            sceneManager.fadeOut("main:ambSpace", {
              fadeTime: transitionFadeTime
            });
            sceneManager.fadeOut("main:rocketFlight", {
              fadeTime: transitionFadeTime
            });
          }
        },
        onExit: () => {
          sceneManager.fadeOut("generic:musicMenu", {
            fadeTime: transitionFadeTime
          });
          sceneManager.fadeOut("generic:ambMenu", {
            fadeTime: transitionFadeTime
          });
        }
      }
    },
    menu: {
      actions: {
        onEnter: (previousState) => {
          sceneManager.trigger("generic:musicMenu", {
            fadeIn: transitionFadeTime
          });
          sceneManager.trigger("generic:ambMenu", {
            fadeIn: transitionFadeTime
          });
          if (previousState === "launchComplex" || previousState === "launchSequence") {
            sceneManager.fadeOut("main:ambLaunchPad1", {
              fadeTime: transitionFadeTime
            });
            sceneManager.fadeOut("main:ambLaunchPad2", {
              fadeTime: transitionFadeTime
            });
          }
          if (previousState === "deploySatelliteSequence" || previousState === "exploreSatellite") {
            sceneManager.fadeOut("main:ambSpace", {
              fadeTime: transitionFadeTime
            });
            sceneManager.fadeOut("main:rocketFlight", {
              fadeTime: transitionFadeTime
            });
          }
        },
        onExit: () => {
          sceneManager.fadeOut("generic:musicMenu", {
            fadeTime: transitionFadeTime
          });
          sceneManager.fadeOut("generic:ambMenu", {
            fadeTime: transitionFadeTime
          });
        }
      }
    },
    silent: {
      actions: {
        onEnter: () => {
        },
        onExit: () => {
        }
      }
    }
  }
});
class SpaceForceKlang extends InteractiveLayerBase {
  constructor() {
    super({
      initializingElement: window,
      onInit: () => {
        this.disableBlurMute(false);
        const promises = [sceneManager.loadScene("generic")];
        return Promise.all(promises).then(() => {
          this.setupTextScramble();
        });
      },
      appFSM,
      sceneManager
    });
  }
  initHomePage() {
    const promises = [
      sceneManager.loadScene("main", true),
      sceneManager.loadScene("vo")
    ];
    sceneManager.getBus("map").setGain(0, 1);
    return Promise.all(promises);
  }
  setupTextScramble() {
    return __async(this, null, function* () {
      scrambleVoices.push(
        {
          text: "",
          time: 0,
          instrument: sceneManager.getInstrument("generic:textAppear1")
        },
        {
          text: "",
          time: 0,
          instrument: sceneManager.getInstrument("generic:textAppear2")
        }
      );
    });
  }
  getVoice(text, mostRecent = false) {
    let returnVoice = scrambleVoices.find(
      (voice) => voice.text === text
    );
    if (!returnVoice) {
      let accumulator = scrambleVoices[0];
      scrambleVoices.reduce(function(prev, curr) {
        let voice = prev.time < curr.time ? prev : curr;
        if (mostRecent) {
          voice = prev.time > curr.time ? prev : curr;
        }
        return voice;
      }, accumulator);
      returnVoice = accumulator;
    }
    return returnVoice;
  }
  changeScene(sceneName) {
    var _a;
    (_a = this.appFSM) == null ? void 0 : _a.transition(sceneName);
    return this.appFSM.stash || Promise.resolve();
  }
  setIsMapOpen(isOpen) {
    sceneManager.getBus("map").setGain(isOpen ? 1 : 0, 1);
    sceneManager.getBus("mainBus").setGain(isOpen ? 0 : 1, 1);
    this.trigger(isOpen ? "mapIn" : "mapOut");
  }
  textScramble(text, delay) {
    text = text || "";
    if (!excludeTexts.includes(text) && this.sceneManager.audioIsInitialized) {
      const voice = this.getVoice(text);
      if (voice) {
        voice.text = text;
        voice.time = SceneManager.now() + (delay || 0);
        this.stopText(voice);
        if (isPreloaderDone) {
          voice.instrument.play({ options: { when: delay || 0 } });
        }
      }
    }
  }
  pauseAllCurrentlyPlaying() {
    sceneManager.pauseAllCurrentlyPlaying({ fadeTime: 0.5 });
    voParts["launchSequence"].pauseCurrent();
  }
  resumeAllCurrentlyPlaying() {
    sceneManager.resumeAllPlaying({ fadeTime: 0.5 });
    voParts["launchSequence"].resumeCurrent();
  }
  stopText(voice) {
    if (voice) {
      voice.instrument.fadeOut(0, 0, () => {
        voice.instrument.stop({});
      });
    }
  }
  stopTextScramble(text) {
    text = text || "";
    if (!excludeTexts.includes(text) && this.sceneManager.audioIsInitialized) {
      let voice;
      if (text) {
        voice = scrambleVoices.find((voice2) => voice2.text === text);
      } else {
        voice = this.getVoice("", true);
      }
      this.stopText(voice);
    }
  }
  handleVoice(guardian, index) {
    const key = `vo:${guardian.name}_${index}`.replace(/\s+/g, "_").replace(/\.+/g, "").toLowerCase();
    this.trigger(key);
  }
  setVOCallback(callback) {
    voCallback = callback;
  }
  setVideoPlaying(shouldMute) {
    this.sceneManager.setBusMute("video", shouldMute);
  }
  startTextRolling() {
    var _a;
    if (rocketLaunchScenes.includes((_a = this.appFSM) == null ? void 0 : _a.value)) {
      this.trigger("generic:textRolling");
    }
  }
  stop(key, options) {
    if (this.sceneManager.audioIsInitialized) {
      this.sceneManager.stop(key, options);
    }
  }
  stopTextRolling() {
    this.stop("generic:textRolling");
  }
  setCapabilitiesScrollValue(scrollValue) {
    var _a, _b, _c, _d;
    switch (currentCapabilitiesStage) {
      case 0:
        if (scrollValue > 800 && scrollValue < 1700) {
          const key = "generic:spacejunkOneshot";
          const instrument = this.sceneManager.getInstrument(key);
          if (((_a = instrument == null ? void 0 : instrument.player) == null ? void 0 : _a.state) === "stopped" && !oneshotsHasPlayed[key]) {
            this.trigger(key);
            oneshotsHasPlayed[key] = true;
          }
        } else if (scrollValue > 1700) {
          const key = "generic:satelliteOneshot";
          const instrument = this.sceneManager.getInstrument(key);
          if (((_b = instrument == null ? void 0 : instrument.player) == null ? void 0 : _b.state) === "stopped" && !oneshotsHasPlayed[key]) {
            this.trigger(key);
            oneshotsHasPlayed[key] = true;
          }
        }
        break;
      case 1:
        if (scrollValue > 500) {
          const key = "generic:transmissionOneshot";
          const instrument = this.sceneManager.getInstrument(key);
          if (((_c = instrument == null ? void 0 : instrument.player) == null ? void 0 : _c.state) === "stopped" && !oneshotsHasPlayed[key]) {
            this.trigger(key);
            oneshotsHasPlayed[key] = true;
          }
        }
        break;
      case 2:
        if (scrollValue > 500) {
          const key = "generic:rocketOneshot";
          const instrument = this.sceneManager.getInstrument(key);
          if (((_d = instrument == null ? void 0 : instrument.player) == null ? void 0 : _d.state) === "stopped" && !oneshotsHasPlayed[key]) {
            this.trigger(key);
            oneshotsHasPlayed[key] = true;
          }
        }
        break;
    }
  }
  setCapabilitiesStage(value) {
    currentCapabilitiesStage = value;
  }
  onPreloaderChange(done) {
    isPreloaderDone = done;
    if (done) {
      for (const [key, value] of Object.entries(oneshotsHasPlayed)) {
        oneshotsHasPlayed[key] = false;
      }
    }
  }
  showGuardians() {
    sceneManager.setBusVolume("launchScene", 0.1, 0.5);
  }
  hideGuardians() {
    sceneManager.setBusVolume("launchScene", 1, 0.5);
  }
}
export { SpaceForceKlang as default };
