import type { TimeoutID } from "../types";
/**
 * FrequencyEvent 类 - 用于实现节流和防抖功能的工具类
 * 可以对函数执行频率进行控制，支持节流(throttle)和防抖(debounce)两种模式
 */
export class FrequencyEvent {
	/**
	 * 原始回调函数
	 */
	public callback: Function;
	/**
	 * 包装后的监听器函数，将根据节流或防抖配置执行原始回调
	 */
	public listener!: (...args: any[]) => void;

	/**
	 * 节流时间限制，单位为毫秒
	 * 0表示不进行节流限制
	 */
	private limit: number = 0;
	/**
	 * 防抖延迟时间，单位为毫秒
	 * 0表示不进行防抖处理
	 */
	private delay: number = 0;

	/**
	 * 构造函数 - 创建 FrequencyEvent 实例
	 * @param callback - 需要执行频率控制的原始回调函数
	 */
	constructor(callback: Function);
	/**
	 * 构造函数 - 创建 FrequencyEvent 实例并设置节流
	 * @param callback - 需要执行频率控制的原始回调函数
	 * @param throttleLimit - 节流时间限制，单位为毫秒
	 */
	constructor(callback: Function, throttleLimit: number);
	constructor(callback: Function, throttleLimit: number, debounceDelay: number);

	constructor(callback: Function, throttleLimit?: number, debounceDelay?: number) {
		this.callback = callback;
		this.limit = throttleLimit || 0;
		this.delay = debounceDelay || 0;

		this.init();
	}

	public throttle(limit: number) {
		this.limit = limit;
		this.init();
		return this;
	}

	/**
	 * 防抖函数设置方法
	 * @param delay - 防抖延迟时间，单位为毫秒
	 * 设置防抖的延迟时间并重新初始化，支持链式调用
	 */
	public debounce(delay: number) {
		// 定义防抖方法，接收延迟时间参数
		this.delay = delay;
		this.init();
		return this;
	}

	/**
	 * 初始化函数，用于设置事件监听器
	 * 根据limit和delay的值决定如何处理回调函数的执行
	 */
	private init() {
		const { limit, delay, callback } = this;

		// 如果没有设置limit和delay，则直接使用原始回调函数
		if (!limit && !delay) {
			this.listener = (...args: any[]) => callback(...args);
			return;
		}

		let timeoutId: TimeoutID = null; // 用于存储setTimeout的ID
		let lastTime = 0; // 用于记录上次执行回调的时间戳

		// 设置事件监听器，实现节流和防抖的组合效果
		this.listener = function (...args: any[]) {
			const now = Date.now();

			// 如果距离上次执行的时间超过了limit，则立即执行回调
			if (now - lastTime >= limit) {
				callback(...args);
				lastTime = now;
			}

			// 如果没有设置delay，则直接返回
			if (!delay) return;

			// 清除之前的定时器，实现防抖效果
			timeoutId && clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				// 确保在防抖延迟后，函数会再执行一次
				callback(...args);

				lastTime = Date.now();
			}, delay);
		};
	}
}
