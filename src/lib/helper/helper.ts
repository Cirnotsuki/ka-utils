// 数据操作相关

export function rgbToNum(rgbStr: string): number[] {
	return rgbStr.split(",").map((str) => +str.replace(/\D/g, ""));
}

export function toHex(num: number): string {
	if (num < 0) {
		num = 0xffffffff + num + 1; // 处理负数情况
	}
	return num.toString(16).toUpperCase();
}

export function rgbFadeOut(rgbStr: string, steps: number): string;
export function rgbFadeOut(rgbArray: number[], steps: number): number[];
export function rgbFadeOut(rgb: number[] | string, steps: number): number[] | string {
	const rgbArray = typeof rgb === "string" ? rgbToNum(rgb) : rgb;

	// 确保步骤数是有效的正整数
	if (steps <= 0 || !Number.isInteger(steps)) {
		throw new Error("Invalid number of steps");
	}

	// 计算每次褪色的量
	const stepFactor = 1 / steps;

	// 初始化褪色后的颜色
	let fadedColor = [...rgbArray];

	// 进行褪色
	for (let i = 0; i < steps; i++) {
		// 每次褪色RGB值乘以stepFactor
		fadedColor = [
			Math.max(0, fadedColor[0] * (1 - stepFactor)),
			Math.max(0, fadedColor[1] * (1 - stepFactor)),
			Math.max(0, fadedColor[2] * (1 - stepFactor)),
		];
	}

	if (typeof rgb === "string") {
		return `rgb(${fadedColor.join(", ")})`;
	} else {
		return fadedColor;
	}
}

// 降低饱和度
export function hslDeS(hslStr: string, rate: number): string;
export function hslDeS(hslArray: number[], rate: number): number[];
export function hslDeS(hsl: number[] | string, rate: number): number[] | string {
	const hslArray = typeof hsl === "string" ? rgbToNum(hsl) : hsl;

	const [h, s, l] = hslArray;

	if (typeof hsl === "string") {
		return `hsl(${h}, ${s * rate}%, ${l}%)`;
	} else {
		return [h, (s * rate) / 100, l / 100];
	}
}

// 色值转换
export function rgbToHsl(rgbStr: string): string;
export function rgbToHsl(rgbArray: number[]): number[];
export function rgbToHsl(rgb: number[] | string): number[] | string {
	const rgbArray = typeof rgb === "string" ? rgbToNum(rgb) : rgb;
	const [R, G, B] = rgbArray;

	const backCycle = (num: number, cycle: number) => {
		let index = num % cycle;
		if (index < 0) {
			index += cycle;
		}
		return index;
	};
	const numberFixed = (num = 0, count = 3) => Math.floor(num * 10 ** count) / 10 ** count;
	const [_R, _G, _B] = [R / 255, G / 255, B / 255];
	const [Cmax, Cmin] = [Math.max(_R, _G, _B), Math.min(_R, _G, _B)];
	const V = Cmax - Cmin;

	let H = 0;
	if (V === 0) {
		H = 0;
	} else if (Cmax === _R) {
		H = 60 * (((_G - _B) / V) % 6);
	} else if (Cmax === _G) {
		H = 60 * ((_B - _R) / V + 2);
	} else if (Cmax === _B) {
		H = 60 * ((_R - _G) / V + 4);
	}

	H = Math.floor(backCycle(H, 360));
	const L = numberFixed((Cmax + Cmin) / 2);
	const S = V === 0 ? 0 : numberFixed(V / (1 - Math.abs(2 * L - 1)));

	const RoundH = Math.round(H);
	const RoundS = Math.round(S * 100) / 100;
	const RoundL = Math.round(L * 100) / 100;

	if (typeof rgb === "string") {
		return `hsl(${RoundH}, ${RoundS * 100}%, ${RoundL * 100}%)`;
	} else {
		return [RoundH, RoundS, RoundL];
	}
}

export function hslToRgb(hslStr: string): string;
export function hslToRgb(hslArray: number[]): number[];
export function hslToRgb(hsl: number[] | string): number[] | string {
	const hslArray = typeof hsl === "string" ? rgbToNum(hsl) : hsl;

	let [H, S, L] = hslArray;

	if (S > 1) S /= 100;
	if (L > 1) L /= 100;

	const C = (1 - Math.abs(2 * L - 1)) * S;
	const X = C * (1 - Math.abs(((H / 60) % 2) - 1));
	const m = L - C / 2;
	const vRGB: number[] = [];

	if (H >= 360) H = 0;

	if (H >= 0 && H < 60) {
		vRGB.push(C, X, 0);
	} else if (H >= 60 && H < 120) {
		vRGB.push(X, C, 0);
	} else if (H >= 120 && H < 180) {
		vRGB.push(0, C, X);
	} else if (H >= 180 && H < 240) {
		vRGB.push(0, X, C);
	} else if (H >= 240 && H < 300) {
		vRGB.push(X, 0, C);
	} else if (H >= 300 && H < 360) {
		vRGB.push(C, 0, X);
	}
	const [vR, vG, vB] = vRGB;

	const r = Math.round(Math.abs(255 * (vR + m))) || 0;
	const g = Math.round(Math.abs(255 * (vG + m))) || 0;
	const b = Math.round(Math.abs(255 * (vB + m))) || 0;

	// 文字模式返回
	if (typeof hsl === "string") {
		return `rgb(${r}, ${g}, ${b})`;
	} else {
		return [r, g, b];
	}
}

// 色值转换
export function rgbToHex(rgbStr: string): string;
export function rgbToHex(rgbArray: number[]): string;
export function rgbToHex(rgb: number[] | string): string {
	const rgbArray = typeof rgb === "string" ? rgbToNum(rgb) : rgb;
	const [R, G, B] = rgbArray;
	return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
}

export function hasClass(el: any, name: string): boolean {
	if (!el) return false;
	const className = toKebabCase(name);
	const ElClassName = el.className || "";

	const set = new Set(ElClassName.split(" ").filter((v: string) => !!v));
	return set.has(className);
}

export function addClass(el: any, name: string): void {
	if (!el) return;
	const className = toKebabCase(name);
	const ElClassName = el.className || "";

	const set = new Set(ElClassName.split(" ").filter((v: string) => !!v));

	set.add(className);
	el.className = Array.from(set).join(" ");
}

export function delClass(el: any, name: string): void {
	if (!el) return;
	const className = toKebabCase(name);
	const ElClassName = el.className || "";

	const set = new Set(ElClassName.split(" ").filter((v: string) => !!v));
	set.delete(className);
	el.className = Array.from(set).join(" ");
}

// 驼峰转连字符
export function toKebabCase(name: string) {
	return name
		.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
		.replace(/^-/, "")
		.replace(/[-]{1,}/, "-")
		.toLowerCase();
}

// 连字符转驼峰
export function toCamelCase(name: string) {
	return name.replace(/-([a-z])/g, (c) => c.slice(1, 2).toUpperCase());
}

export function isMatched(item: any, optArr: any[]): boolean {
	let matched = true;
	for (const [key, val] of optArr) {
		if (key in item) {
			const nodeVal = item[key];
			matched = nodeVal === val;
		} else {
			matched = false;
		}
		if (!matched) break;
	}
	return matched;
}

/** Object 处理 */
// 深度合并
export function deepMerge(target: any, source: any): any {
	const result = Array.isArray(target) ? [...target] : { ...target };
	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			if (typeof source[key] === "object" && source[key] !== null) {
				if (Array.isArray(source[key])) {
					result[key] = deepMerge(result[key] || [], source[key]);
				} else {
					result[key] = deepMerge(result[key] || {}, source[key]);
				}
			} else {
				result[key] = source[key];
			}
		}
	}
	return result;
}

export function deepClone(source: any): any {
	if (Array.isArray(source)) {
		return deepMerge([], source);
	}
	return deepMerge({}, source);
}

export function cleanObject(source: any) {
	const result: any = {};
	for (const [key, value] of Object.entries(source)) {
		if (typeof value !== "string" && typeof value !== "number") continue;
		if (typeof value === "string" && value.trim() === "") continue;
		result[key] = value;
	}
	return result;
}

/** 事件处理 */
// 节流
export function throttle(_this: any, func: any, wait: number) {
	let timer: ReturnType<typeof setTimeout> | null = null;
	return function (...args: any) {
		if (!timer) {
			timer = setTimeout(() => {
				func.apply(_this, args);
				timer = null;
			}, wait);
		}
	};
}

// 判断点是否在矩阵中
export function posInRect(x: number, y: number, rect: { left: number; right: number; top: number; bottom: number }) {
	return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export function removeNode(elem: Element) {
	elem.parentNode?.removeChild(elem);
}

export function numToString(num: number) {
	const ordA = "A".charCodeAt(0);
	const ordZ = "Z".charCodeAt(0);
	const len = ordZ - ordA + 1;
	let str = "";
	while (num >= 0) {
		str = String.fromCharCode((num % len) + ordA) + str;
		num = Math.floor(num / len) - 1;
	}
	return str;
}

// 将阿拉伯数字转化为中文数字
export function NumberToUpperCase(num: number): string {
	if (num === 0) return "零";

	// 支持更大数字的单位扩展
	const units = ["", "万", "亿", "万亿"];
	const numChars = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
	const sectionUnits = ["千", "百", "十", ""];

	// 处理数字分节（4位一节）
	const str = num.toString();
	const sections: string[] = [];
	for (let i = str.length; i > 0; i -= 4) {
		sections.push(str.substring(Math.max(0, i - 4), i));
	}
	sections.reverse(); // 反转使高位节在前

	if (sections.length > units.length) {
		throw new Error("数字太大，超过万亿级别");
	}

	let result = "";
	let needZero = false; // 标记是否需要添加零分隔

	// 处理每个分节的转换
	for (let i = 0; i < sections.length; i++) {
		const sec = sections[i].padStart(4, "0");
		let sectionStr = "";
		let sectionStarted = false;
		let sectionNeedZero = false;

		for (let j = 0; j < 4; j++) {
			const digit = parseInt(sec[j], 10);
			if (digit !== 0) {
				// 遇到非零数字的处理
				if (sectionStarted && sectionNeedZero) {
					sectionStr += "零";
					sectionNeedZero = false;
				}
				sectionStr += numChars[digit] + sectionUnits[j];
				sectionStarted = true;
			} else if (sectionStarted) {
				// 仅当已经开始处理才标记需要零
				sectionNeedZero = true;
			}
		}

		if (sectionStr) {
			// 节间零处理
			if (needZero) {
				result += "零";
			}
			result += sectionStr + units[sections.length - 1 - i];
			needZero = true; // 后续可能需要节间零
		}
	}

	// 特殊处理"一十"开头的情况
	if (result.startsWith("一十")) {
		result = "十" + result.substring(2);
	}

	return result;
}

// 将中文数字转换为阿拉伯数字
export function NumberToLowerCase(chnStr: string): number {
	const chnNumChar: Record<string, number> = {
		零: 0,
		一: 1,
		二: 2,
		三: 3,
		四: 4,
		五: 5,
		六: 6,
		七: 7,
		八: 8,
		九: 9,
	};

	const chnUnit: Record<string, number> = {
		十: 10,
		百: 100,
		千: 1000,
		万: 10000,
		亿: 100000000,
	};

	let total = 0; // 总结果
	let section = 0; // 当前小节（万以下的单位）
	let number = 0; // 当前数字（十百千前面的系数）
	let hangingUnit = 0; // 挂起的节单位（万/亿）

	for (let i = 0; i < chnStr.length; i++) {
		const char = chnStr[i];

		if (char in chnNumChar) {
			// 处理数字字符
			number = chnNumChar[char];

			// 如果是最后一个字符（数字结尾）
			if (i === chnStr.length - 1) {
				section += number;
			}
		} else if (char in chnUnit) {
			const unit = chnUnit[char];
			const isSectionUnit = unit >= 10000; // 万/亿

			if (isSectionUnit) {
				// 处理节单位（万/亿）
				// 1. 先将当前数字加到小节
				section += number;
				number = 0;

				// 2. 小节乘以节单位得到有效值
				const value = section * unit;

				// 3. 处理连续节单位（如"亿万"）
				if (hangingUnit > unit) {
					// 后一个节单位小于前一个时（亿万）
					total += value;
				} else {
					// 正常节单位
					total = (total + section) * unit;
				}

				// 4. 重置当前小节
				section = 0;
				hangingUnit = unit; // 记录当前的节单位
			} else {
				// 处理基本单位（十/百/千）
				if (number === 0) {
					// 处理省略的"一"（如"十"）
					number = 1;
				}
				section += number * unit;
				number = 0;
			}
		}
	}

	// 加上剩余部分（最后的小节）
	return total + section;
}

export function removeAllRanges() {
	window.getSelection()?.removeAllRanges();
}

export function getGlobalLocation() {
	return window.location;
}

const arrDPI: number[] = [];
export function getDPI() {
	if (arrDPI.length > 0) return arrDPI;
	if ("deviceXDPI" in window.screen && "deviceYDPI" in window.screen) {
		arrDPI.push(window.screen.deviceXDPI as number);
		arrDPI.push(window.screen.deviceYDPI as number);
	} else {
		const tmpNode = document.createElement("DIV");
		tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
		document.body.appendChild(tmpNode);
		arrDPI.push(tmpNode.offsetWidth);
		arrDPI.push(tmpNode.offsetHeight);
		tmpNode.parentNode?.removeChild(tmpNode);
	}

	return arrDPI;
}

export function pt2px(value: number, demi = 0) {
	if (typeof value !== "number") {
		const number = +`${value}`.replace("pt", "");
		value = number;
	}

	return Math.floor(value * (getDPI()[0] / 72) * 10 ** demi) / 10 ** demi;
}

export function px2pt(value: number, decimalSize: number = 2) {
	value = (value / getDPI()[0]) * 25.4;
	value /= 0.367;
	return Math.round(value * 10 ** decimalSize) / 10 ** decimalSize;
}

export function px2mm(value: number, decimalSize: number = 2) {
	value = (value / getDPI()[0]) * 25.4;
	return Math.round(value * 10 ** decimalSize) / 10 ** decimalSize;
}

export function mm2px(value: number, origin: boolean = false) {
	const val = (value / 25.4) * getDPI()[0];
	if (origin) return val;
	return Math.floor(val);
}

export function formatDecimal(decimalText: string, decimalSize: number) {
	if (!decimalText) return "";

	let isDecimal = false;
	let decimalCount = 0;
	let resText = "";

	for (const text of decimalText) {
		if (text === ".") {
			isDecimal = true;
			if (decimalSize > 0) {
				resText += text;
			}
			continue;
		}
		if (isDecimal) {
			decimalCount += 1;
		} else {
			resText += text;
		}
		if (isDecimal && decimalCount <= decimalSize) {
			resText += text;
		}
	}

	if (!isDecimal && decimalSize > 0) {
		resText += ".";
	}
	for (let i = decimalCount; i < decimalSize; i += 1) {
		resText += "0";
	}
	return resText;
}

// 静态方法，用于将数字格式化为指定长度的字符串
export function formatNumber(number: number, _size: number = 3) {
	// 将数字向下取整并转换为字符串
	const numText = Math.floor(number).toString();
	// 创建一个长度为指定大小的数组，并填充为'0'
	const size = Math.max(_size, numText.length);
	const numArr = Array.from({ length: size - numText.length }).map(() => "0");
	// 将数组中的元素连接成字符串并返回
	return numArr.join("") + numText;
}

/**
 * 计算两条线段的交集
 * @param {Array} seg1 - 第一条线段 [startX, endX]
 * @param {Array} seg2 - 第二条线段 [startX, endX]
 * @returns {[number, number] | null} 交集的线段 [startX, endX]，如果没有交集则返回null
 */
export function segmentIntersection(seg1: [number, number], seg2: [number, number]): [number, number] | null {
	// 确保seg1和seg2是有效的线段（start <= end）
	const [a1, a2] = seg1[0] <= seg1[1] ? seg1 : [seg1[1], seg1[0]];
	const [b1, b2] = seg2[0] <= seg2[1] ? seg2 : [seg2[1], seg2[0]];

	// 计算交集的起点和终点
	const start = Math.max(a1, b1);
	const end = Math.min(a2, b2);

	// 如果起点大于终点，说明没有交集
	if (start > end) {
		return null;
	}

	return [start, end];
}

// 数组计算
export function arrayCounter(arr: number[], start: number = 0, end?: number) {
	if (arr.length === 0) return 0;

	if (typeof end === "undefined") {
		end = arr.length;
	}

	if (start === end) return 0;
	if (arr.length === 1) return arr[0];

	return arr.slice(start, end).reduce((o, n) => o + n);
}

export function isSameDomain(url: string) {
	console.log({ url });

	try {
		const urlObj = new URL(url);
		const location = getGlobalLocation();

		if (urlObj.protocol === "data:") return true;
		if (urlObj.protocol === "blob:") return true;
		return urlObj.protocol === location.protocol && urlObj.hostname === location.hostname;
	} catch (error) {
		console.error(error);
		return false;
	}
}

export function isSameDomainBlob(url: string) {
	const urlObj = new URL(url);

	if (urlObj.protocol !== "blob:") return false;

	const location = getGlobalLocation();

	return urlObj.origin === location.origin;
}

export function formatDateString(date: Date, format: string) {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	return format
		.replace("yyyy", year.toString())
		.replace("mm", month.toString().padStart(2, "0"))
		.replace("dd", day.toString().padStart(2, "0"));
}
