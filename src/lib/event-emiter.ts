import * as Helper from "./helper/helper";

export interface EventCallback {
	(...args: any[]): any;
}

export class EventEmitter {
	eventEmiters: Map<string, EventCallback> = new Map();
	excuteEmiters: Map<string, EventCallback> = new Map();

	emiters: Map<string, Set<EventCallback>> = new Map();
	onceCallback: Set<EventCallback> = new Set(); // 用于存储once回调函数的Map

	// 构造函数，用于绑定this
	constructor(bindThis: any) {
		// 如果bindThis中有onExcute属性，则将其绑定到this.onExcute
		if ("onExcute" in bindThis) bindThis.onExcute = this.onExcute.bind(this);
		// 如果bindThis中有emitExcute属性，则将其绑定到this.emitExcute
		if ("emitExcute" in bindThis) bindThis.emitExcute = this.emitExcute.bind(this);

		// 如果bindThis中有onEvent属性，则将其绑定到this.onEvent
		if ("onEvent" in bindThis) bindThis.onEvent = this.onEvent.bind(this);
		// 如果bindThis中有emitEvent属性，则将其绑定到this.emitEvent
		if ("emitEvent" in bindThis) bindThis.emitEvent = this.emitEvent.bind(this);

		// 如果bindThis中有on属性，则将其绑定到this.on
		if ("on" in bindThis) bindThis.on = this.on.bind(this);
		if ("once" in bindThis) bindThis.once = this.once.bind(this);
		// 如果bindThis中有emit属性，则将其绑定到this.emit
		if ("emit" in bindThis) bindThis.emit = this.emit.bind(this);
		// 如果bindThis中有removeListener属性，则将其绑定到this.removeListener
		if ("removeListener" in bindThis) bindThis.on = this.removeListener.bind(this);
		// 如果bindThis中有removeAllListener属性，则将其绑定到this.removeAllListener
		if ("removeAllListener" in bindThis) bindThis.emit = this.removeAllListener.bind(this);
	}

	// 执行函数，接收两个参数：excute和callback
	onExcute(_excuteName: string, callback: EventCallback) {
		const excuteName = Helper.toCamelCase(_excuteName);
		// 将excute和callback存入excuteEmiters中
		this.excuteEmiters.set(Helper.toCamelCase(excuteName), callback);
	}

	emitExcute(_excuteName: string, ...args: any[]) {
		const excuteName = Helper.toCamelCase(_excuteName);

		console.log(excuteName, this.excuteEmiters.keys(), this.excuteEmiters.get(excuteName));

		if (!this.excuteEmiters.has(excuteName)) return console.warn(`Excute [${excuteName}] not found`);

		const callback = this.excuteEmiters.get(excuteName) as EventCallback;

		if (typeof callback === "function") {
			callback(...args);
		}
	}

	onEvent(eventName: string, callback: EventCallback) {
		this.eventEmiters.set(eventName, callback);
	}

	// 发射事件
	emitEvent(eventName: string, event: Event, ...args: any[]) {
		// 如果没有注册该事件，则返回
		if (!this.eventEmiters.has(eventName)) return console.warn(`Event [${eventName}] not found`);

		// 获取该事件的回调函数
		const callback = this.eventEmiters.get(eventName) as EventCallback;

		// 如果回调函数是函数类型，则执行回调函数
		if (typeof callback === "function") {
			callback(event, ...args);
		}
	}

	// 监听事件
	on(name: string, callback: EventCallback) {
		// 将事件名和回调函数存入 emiters emiters的数组中
		if (!this.emiters.has(name)) {
			// 如果 emiters 中没有该事件名，则创建一个新的 Set 并将其存入 emiters 中
			this.emiters.set(name, new Set());
		}

		// 将回调函数存入 emiters 中对应事件名的 Set 中
		this.emiters.get(name)?.add(callback);
	}

	once(name: string, callback: EventCallback) {
		this.on(name, callback);
		console.log(name, this.onceCallback);

		this.onceCallback.add(callback);
	}

	// 发射事件
	emit(name: string, ...args: any[]) {
		// 如果没有注册该事件，则返回
		if (!this.emiters.has(name)) return console.warn(`Event [${name}] not found`);

		this.emiters.get(name)?.forEach((callback: EventCallback) => {
			// 如果回调函数是函数类型，则执行回调函数，并传入参数
			if (typeof callback === "function") {
				callback(...args);
				/* 移除once回调函数 */
				if (this.onceCallback.has(callback)) {
					this.onceCallback.delete(callback);
					this.removeListener(name, callback);
				}
			}
		});
	}

	removeListener(name: string, callback: EventCallback) {
		if (!this.emiters.has(name)) return;

		this.emiters.get(name)?.delete(callback);

		if (this.emiters.get(name)?.size === 0) this.emiters.delete(name);
	}

	removeAllListener(name: string) {
		if (!this.emiters.has(name)) return;

		this.emiters.delete(name);
	}
}
