class ChangeNotifier extends EventTarget {
	public onChange(callback: () => void): void;
	public onChange(channel: string, callback: () => void): void;
	public onChange(a1: string | (() => void), a2?: () => void) {
		let channel: string | null = null;
		let callback: () => void = () => null;
		if (typeof a1 === "string") {
			if (!a2) throw new TypeError("Disrespected function overloads");
			channel = a1;
			callback = a2;
		} else callback = a1;

		if (channel) this.addEventListener(`change@${channel}`, () => callback());
		else this.addEventListener("change", () => callback());
	}

	protected notify(channel?: string) {
		this.dispatchEvent(new Event("change"));
		if (channel) this.dispatchEvent(new Event(`change@${channel}`));
	}
}

export default ChangeNotifier;
