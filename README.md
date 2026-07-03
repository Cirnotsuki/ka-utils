# KAUtil

A lightweight TypeScript utility library for frontend development, providing keyboard shortcuts, event management, DOM utilities, color conversion, and general\-purpose helpers\.

---

## ✨ Features

- ⌨️ Keyboard shortcut manager \(`BindKey`\)

- ⚡ Throttle \& debounce event system

- 🌐 DOM \& HTML utilities

- 🎨 RGB / HSL / HEX color conversion

- 🧠 Deep clone, deep merge, object utilities

- 📏 Unit conversion \(px / pt / mm\)

- 🧩 Class \& DOM manipulation helpers

- 🧵 String utilities

- 🖥 Canvas \& rendering helpers

- 📦 Fully TypeScript supported

---

## 📦 Installation

```bash
npm install ka-util

# or
yarn add ka-util
```

---

## 🚀 Usage

```typescript
import KAUtil from "ka-util";

const { BindKey, EventManager, Helper, RenderHTMLHelper } = KAUtil;
```

### ⌨️ BindKey

Keyboard shortcut manager\.

#### Example

```typescript
const keyboard = new BindKey();

keyboard.register("save", {
  shortcut: "ctrl+s",
  callback: () => {
    console.log("save triggered");
  }
});
```

#### API

```typescript
register(name: string, opt: BindKeyOpt): void;
register(name: string, callback: Function): void;
remove(name: string): void;
on(name: string): void;
has(name: string): boolean;
```

### ⚡ FrequencyEvent

Throttle \& debounce utility\.

#### Example

```typescript
const handler = new FrequencyEvent(() => {
  console.log("resize");
}).throttle(200);

const inputHandler = new FrequencyEvent(() => {
  console.log("input");
}).debounce(300);
```

### 🌐 EventManager

Unified DOM event system with throttle/debounce support\.

#### Example

```typescript
EventManager.addEvent(window, "resize", () => {
  console.log("resize");
}, {
  debounce: 200
});
```

#### API

```typescript
addEvent(element, type, listener, config?)
delEvent(element, type, listener?)
```

### 🧰 Helper Utilities

#### Object

```typescript
deepClone(obj);
deepMerge(target, source);
cleanObject(obj);
```

#### String

```typescript
toCamelCase(str);
toKebabCase(str);
numToString(num);
formatNumber(num);
```

#### Array

```typescript
arrayCounter(arr, start?, end?);
isMatched(item, arr);
```

#### Math / Number

```typescript
NumberToUpperCase(num);
NumberToLowerCase(str);
segmentIntersection(seg1, seg2);
```

### 🎨 Color Utilities

```typescript
rgbToNum("rgb(255,255,255)");
rgbToHex([255, 255, 255]);
rgbToHsl([255, 255, 255]);
hslToRgb([0, 0, 100]);
rgbFadeOut([255, 0, 0], 5);
toHex(255);
```

### 📏 Unit Conversion

```typescript
pt2px(12);
px2pt(16);
px2mm(10);
mm2px(10);
getDPI();
```

### 🧩 DOM Utilities

```typescript
addClass(el, "active");
delClass(el, "hidden");
hasClass(el, "box");
removeNode(el);
posInRect(x, y, rect);
```

### 🌐 HTML / Render Helper

```typescript
initCanvas();

getCss(el, "width");
getCssText(style);
getStyleFromCssText(cssText);

measureText("hello", "16px", "Arial");
moveCursorToEnd(input);
```

### 🧠 Global Helper Namespace

```typescript
KAUtil.Helper.deepClone({});
KAUtil.Helper.deepMerge({}, {});
KAUtil.RenderHTMLHelper.getCss(el, "width");
KAUtil.EventManager.addEvent(window, "click", () => {});
```

## 📦 Export

```typescript
export {
  BindKey,
  EventManager,
  helper,
  htmlHelper,
  KAUtil as default
};
```

## 🧪 TypeScript Support

Fully typed with:

- Strong DOM typings

- Overloaded APIs

- Event config support \(throttle / debounce\)

- Namespace exports

## 📄 License

MIT

> （注：部分内容可能由 AI 生成）
