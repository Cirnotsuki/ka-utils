export * from "./helper";
import { toKebabCase, toCamelCase } from "./helper";

// 用于 HTML 中的渲染操作相关
let canvas: HTMLCanvasElement | undefined;
let ctx: CanvasRenderingContext2D | null | undefined;

const dirs = ["top", "right", "bottom", "left"];

// 创建用来计算的Canvas
export function initCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
	if (!canvas || !ctx) {
		canvas = document.createElement("canvas");
		ctx = canvas.getContext("2d");
	}
	return { canvas: canvas!, ctx: ctx! };
}

export function getElementsByClassName(el: HTMLElement | null, className: string): HTMLElement[] {
	if (!el) return [];
	return Array.from(el.querySelectorAll("." + toKebabCase(className))) as HTMLElement[];
}

export function getElementByClassName(el: HTMLElement | null, className: string): HTMLElement {
	return getElementsByClassName(el, className)[0] as HTMLElement;
}

export function getCss(dom: Element, attr: string) {
	return window.getComputedStyle(dom, null).getPropertyValue(attr);
}

export function getCssText(style: { [key: string]: string }): string {
	return Object.entries(style)
		.map(([key, value]) => `${toKebabCase(key)}: ${value}`)
		.join(";");
}

export function getStyleFromCssText(cssText: string) {
	const styleObj: { [key: string]: string } = {};
	cssText.split(";").forEach((str) => {
		const [key, value] = str.split(":").map((v) => v.trim());
		if (!value) return;
		styleObj[toCamelCase(key)] = value;
	});
	return styleObj;
}

// 获取元素边距，Margin 或 Padding
export function getGap(elem: Element, attr: string) {
	const arr = [0, 0, 0, 0];
	arr.forEach((v, i) => {
		const num = +getCss(elem, `${attr}-${dirs[i]}`).replace(/([0-9-.]+)/g, "$1");
		const val = Number.isNaN(num) ? 0 : num;
		arr[i] = val;
	});
	return arr;
}

// 通过Canvas测量字体
export function measureText(str: string, fontSize: string, fontFamily: string) {
	const { ctx } = initCanvas();
	ctx.font = `${fontSize} ${fontFamily}`;
	return Math.round(ctx.measureText(str).width);
}

// 将任意可以输入元素的光标移动到最后
export function moveCursorToEnd(elem: HTMLElement | HTMLInputElement | HTMLTextAreaElement): void {
	const range = document.createRange();
	range.selectNodeContents(elem);
	range.collapse(false);
	const sel = window.getSelection();
	if (sel) {
		sel.removeAllRanges();
		sel.addRange(range);
	}
}
