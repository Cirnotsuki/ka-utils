class SafeGlobal {
	static global = (() => {
		if (typeof window !== "undefined") {
			return window;
		}

		if (typeof self !== "undefined") {
			return self;
		}

		if (typeof globalThis !== "undefined") {
			return globalThis;
		}

		return {};
	})();
	static document = (() => {
		if (typeof document !== "undefined") {
			return document;
		}
		return {};
	})();

	static defineProperty(name: string, attributies: PropertyDescriptor & ThisType<any>) {
		return Object.defineProperty(this.global, name, attributies);
	}

	static defineProperties(properties: PropertyDescriptorMap & ThisType<any>) {
		return Object.defineProperties(this.global, properties);
	}

	static getProperty(key: string) {
		return Object.getOwnPropertyDescriptor(this.global, key);
	}
}
