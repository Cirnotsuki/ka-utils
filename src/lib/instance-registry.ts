export class InstanceRegistry<T> {
	// id -> WeakRef(instance)
	map: Map<string, WeakRef<any>> = new Map();
	registry: FinalizationRegistry<string>;

	constructor() {
		this.map = new Map();

		// GC 回收后回调
		this.registry = new FinalizationRegistry((id: string) => {
			this.map.delete(id);
		});
	}

	/**
	 * 注册实例
	 */
	add(id: string, instance: T) {
		if (!id || !instance) return;

		this.map.set(id, new WeakRef(instance));

		// 绑定 GC 回收监听
		this.registry.register(instance, id);
	}

	/**
	 * 删除实例（手动）
	 */
	remove(id: string) {
		this.map.delete(id);
	}

	/**
	 * 获取单个实例（可能已被回收）
	 */
	get(id: string) {
		const ref = this.map.get(id);
		if (!ref) return null;

		const obj = ref.deref();

		if (!obj) {
			// 已被 GC，清理残留
			this.map.delete(id);
			return null;
		}

		return obj;
	}

	/**
	 * 遍历所有存活实例
	 */
	values() {
		const result = [];

		for (const [id, ref] of this.map) {
			const obj = ref.deref();

			if (obj) {
				result.push(obj);
			} else {
				// 懒清理
				this.map.delete(id);
			}
		}

		return result;
	}

	/**
	 * 遍历 key-value
	 */
	entries() {
		const result = [];

		for (const [id, ref] of this.map) {
			const obj = ref.deref();

			if (obj) {
				result.push([id, obj]);
			} else {
				this.map.delete(id);
			}
		}

		return result;
	}

	/**
	 * 当前“活着”的数量（非精确，GC延迟）
	 */
	size() {
		this.cleanup();
		return this.map.size;
	}

	/**
	 * 主动清理已GC对象（推荐定期调用）
	 */
	cleanup() {
		for (const [id, ref] of this.map) {
			if (!ref.deref()) {
				this.map.delete(id);
			}
		}
	}
}
