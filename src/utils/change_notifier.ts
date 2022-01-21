class ChangeNotifier extends EventTarget {
	public onChange(callback: () => void) {
		this.addEventListener("change", () => callback());
	}

	protected notify() {
		this.dispatchEvent(new Event("change"));
	}
}

export default ChangeNotifier;
