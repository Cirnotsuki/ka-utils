// 键值对应
import { KeyMap } from "../config/KeyMap";

const RepeatDelay = 60;

export interface BindKeyCallBack {
	(...args: any[]): any;
}
export interface BindKeyOpt {
	shortcut: string;
	repeat?: boolean;
	callback: BindKeyCallBack;
}

export interface BindKeyEvent extends BindKeyOpt {
	name: string;
	disabled: boolean;
	repeat: boolean;
	before?: () => boolean;
}

export class BindKey {
	event: Map<string, BindKeyEvent>;
	watch: Map<any, any>;
	stop: boolean;
	active: boolean;

	keyEvent: BindKeyEvent = {
		name: "event name",
		shortcut: "event shortcut",
		repeat: false,
		disabled: false,
		before: () => true,
		callback: () => {},
	};

	constructor(ManualBind = false) {
		this.event = new Map();
		this.watch = new Map();
		this.stop = false;
		this.active = false;

		if (!ManualBind) this.init();
	}

	init() {
		// 创建事件抛发器
		window.addEventListener("keydown", (e) => this.dispatcher(e));
	}

	getCode(_key: string): number {
		let key = _key.toLowerCase();

		const combinedKey = key.split("+").pop();

		if (combinedKey) {
			key = combinedKey;
		}

		let code: number;
		let keyName: string;

		if (/^[a-z]$/.test(key)) {
			keyName = `key${key}`;
		} else if (/^\d$/.test(key)) {
			keyName = `digit${key}`;
		} else if (/^(left|right|up|down)$/.test(key)) {
			keyName = `arrow${key}`;
		} else {
			keyName = key;
		}

		code = KeyMap[keyName as keyof typeof KeyMap] || +key;

		return code;
	}

	// 检测事件是否存在
	has(_name: string) {
		// 格式化事件名
		const name = `${_name}`;
		// 防错
		if (!this.event.has(name)) {
			console.warn(`Name Error: no such name of "${name}" in BindKey Events, need of registry before using.`);
			return false;
		}
		return true;
	}

	/**
	 * 注册事件
	 * @param {string} name 事件名，必须，用于映射事件的回调函数。
	 * @param {callback} opt 事件对象或回调函数，为对象时应包含参数 shortcut 和 callback。
	 */
	register(name: string, opt: BindKeyOpt): void;
	register(name: string, callback: BindKeyCallBack): void;
	register(name: string, arg: BindKeyOpt | BindKeyCallBack) {
		const callback = typeof arg === "function" ? arg : function () {};
		const opt: BindKeyOpt = { shortcut: "default", repeat: false, callback };

		if (typeof arg === "object") {
			opt.shortcut = arg.shortcut || "default";
			opt.repeat = arg.repeat || false;
			opt.callback = arg.callback || callback;
		}

		// 获取快捷键分组
		const WatchKey = typeof arg === "function" ? "default" : this.getCode(opt.shortcut);

		// 建立监测属性
		!this.watch.has(WatchKey) && this.watch.set(WatchKey, []);
		// 写入监测属性
		this.watch.get(WatchKey).push(name);
		// 删除同名快捷键
		this.remove(name);
		// 注册快捷键
		this.event.set(name, {
			name,
			disabled: false,

			...opt,
		} as BindKeyEvent);
	}

	/**
	 * 删除事件
	 * @param {string} name 事件名。
	 */
	remove(name: string) {
		// 防错
		if (!this.has(name)) return;

		// 获取分组
		const WatchKey = this.getCode(this.event.get(name)!.shortcut);
		// 获取列表
		const WatchList = this.watch.get(WatchKey);
		// 删除数组中的对应监测项
		for (let i = 0, len = WatchList.length; i < len; i++) {
			if (WatchList[i] === name) {
				WatchList.splice(i, 1);
				break;
			}
		}
		// 删除事件对象
		this.event.delete(name);
	}

	/**
	 * 执行事件
	 * @param {string} name 事件名。
	 */
	on(name: string) {
		// 防错
		if (!this.has(name)) return;
		// 回调事件
		this.event.get(name)!.callback();
	}

	// eslint-disable-next-line consistent-return
	dispatcher(event: KeyboardEvent) {
		if (this.stop) return false;
		if (!event.isTrusted) return false;

		// 获取属性值
		const { ctrlKey, shiftKey, altKey, metaKey, code, repeat } = event;
		const keyCode = this.getCode(code);

		// 验证快捷键激活状态
		const isActive = (shortcut: string, repeatAvailable: boolean) => {
			const KeyList = shortcut.toLowerCase().split("+");
			const eventKey = KeyList.pop() || "";

			const ctrl = KeyList.includes("ctrl") ? ctrlKey : !ctrlKey;
			const shift = KeyList.includes("shift") ? shiftKey : !shiftKey;
			const alt = KeyList.includes("alt") ? altKey : !altKey;
			const meta = KeyList.includes("meta") ? metaKey : !metaKey;

			let eventKeyCode: number = +eventKey;
			if (Number.isNaN(eventKeyCode)) {
				eventKeyCode = this.getCode(eventKey);
			}

			if (keyCode !== eventKeyCode) return false;
			if (repeat && !repeatAvailable) return false;
			if (!ctrl) return false;
			if (!shift) return false;
			if (!alt) return false;
			if (!meta) return false;
			return true;
		};
		// 执行流程
		const execute = (ev: BindKeyEvent, e: KeyboardEvent): boolean => {
			// 快捷键节流
			if (!this.active) {
				this.active = true;
				// 20 毫秒后触发下一次快捷键事件
				setTimeout(() => {
					this.active = false;
				}, RepeatDelay);
				// 调用快捷键事件
				return !!ev.callback(e, ev);
			}
			return true;
		};
		// 根据输入的按键获取事件列表
		const keyList = [...(this.watch.get(keyCode) || [])];
		// 执行快捷键对应的事件
		while (keyList.length > 0) {
			// 获取事件对象
			const keyEventName = keyList.pop();
			const keyEvent = this.event.get(keyEventName);

			if (!keyEvent) continue;
			// 检测事件是否满足自定义启动条件，如果禁用则跳过该事件抛发
			if (typeof keyEvent.before === "function" && keyEvent.before()) continue;
			// 符合快捷键组合时调用快捷键事件
			if (isActive(keyEvent.shortcut, keyEvent.repeat)) {
				// 执行回调任务
				const result = execute(keyEvent, event);
				// 回调中可以单独控制事件是否可用
				if (result === false || !keyEvent.disabled) {
					// 阻止默认事件
					event.preventDefault();
					// 跳出流程
					return false;
				}
				// 关闭一次性开关
				keyEvent.disabled = false;
			}
		}
	}
}
