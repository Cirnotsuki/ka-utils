import { EventManagerName } from "../config/constants";
import { FrequencyEvent } from "./frequency-event";

type EventElement = HTMLElement | Document;
const isDevMode = !(import.meta as any)?.env?.PROD;

declare global {
	interface Window {
		__CirnoGlobalEventMap__?: { [key: string]: Function[] };
	}
}

if (typeof window !== "undefined" && typeof window.__CirnoGlobalEventMap__ === "object") {
	for (const [type, listeners] of Object.entries(window.__CirnoGlobalEventMap__)) {
		for (const listener of listeners) {
			document.removeEventListener(type, listener as EventListener);
		}
		delete window.__CirnoGlobalEventMap__[type];
	}

	delete window.__CirnoGlobalEventMap__;
}

export interface EventConfig {
	throttle?: number;
	debounce?: number;
}

export class EventManager {
	// 静态属性，用于存储事件名称
	static name = EventManagerName + "EventManager";
	// 静态属性，用于存储事件映射
	static eventMap: WeakMap<EventElement, { [key: string]: Array<FrequencyEvent | Function> }> = new WeakMap();
	// 静态属性，用于存储全局事件映射
	static globalEventMap: { [key: string]: Array<FrequencyEvent | Function> } = {};

	// 静态方法，用于初始化事件管理器
	static {
		// 调试模式由于热重载的原因，会导致 window 上的事件重复被绑定，因此需要利用 window 变量去清空事件。
		if (isDevMode && typeof window !== "undefined") {
			if (!window.__CirnoGlobalEventMap__) {
				window.__CirnoGlobalEventMap__ = {};
			}
			this.globalEventMap = window.__CirnoGlobalEventMap__;
		}
	}

	// 静态方法，用于添加事件监听器
	static addEvent(_elem: EventElement, type: keyof HTMLElementEventMap, listener: Function, _config?: EventConfig) {
		const elem = _elem as EventElement;

		const config = {
			throttle: 0,
			debounce: 0,

			...(_config || {}),
		};

		// 调试模式中，如果是 document 的情况，在 window 中也存一份 function 地址用以热重载后的删除
		if (isDevMode && elem.nodeType === Node.DOCUMENT_NODE) {
			if (!(type in this.globalEventMap)) {
				this.globalEventMap[type] = [];
			}
			this.globalEventMap[type].push(listener);
		}

		// 事件记录器中不存在元素地址时，开辟新的储存空间
		if (!this.eventMap.has(elem)) {
			this.eventMap.set(elem, {});
		}

		// 获取事件储存器
		const eventListenerObj = this.eventMap.get(elem) as { [key: string]: Array<FrequencyEvent | Function> };

		// 当事件储存器中不存在这个类型的事件时，创建一个新的事件列表用来记录事件
		if (!(type in eventListenerObj)) {
			eventListenerObj[type] = [];
		}

		// 如果设置了节流时间，则使用节流函数
		if (config.throttle || config.debounce) {
			for (const evt of eventListenerObj[type]) {
				if (evt instanceof FrequencyEvent && evt.callback === listener) return;
			}

			const fqEvt = new FrequencyEvent(listener, config.throttle, config.debounce);
			eventListenerObj[type].push(fqEvt);

			elem.addEventListener(type, fqEvt.listener as EventListener);
			return;
		}
		// 不重复添加监听事件
		if (eventListenerObj[type].includes(listener)) return;
		eventListenerObj[type].push(listener);
		elem.addEventListener(type, listener as EventListener);
	}

	// 静态方法，用于删除事件监听器
	static delEvent(_elem: EventElement, type: keyof HTMLElementEventMap, eventListener?: Function) {
		const elem = _elem as EventElement;

		if (!this.eventMap.has(elem)) return;

		const eventListenerObj = this.eventMap.get(elem)!;

		if (!(type in eventListenerObj)) return;

		const eventList = eventListenerObj[type];

		for (const evt of eventList) {
			if (evt instanceof FrequencyEvent) {
				if (typeof eventListener === "function" && evt.callback !== eventListener) continue;
				elem.removeEventListener(type, evt.listener as EventListener);
			} else {
				if (typeof eventListener === "function" && evt !== eventListener) continue;
				elem.removeEventListener(type, evt as EventListener);
			}
		}

		// 删除事件类型
		delete eventListenerObj[type];

		// 当该元素没有记录事件时，清除储存空间
		if (Object.keys(eventListenerObj).length === 0) {
			this.eventMap.delete(elem);
		}
	}
}
