import { v4 as uuid } from "uuid";

type ChangeCallback = () => void;
type ChangeCallbackID = string;

interface ChangeListener {
	channel?: string;
	callback: ChangeCallback;
}

class ChangeNotifier extends EventTarget {
	private listeners: Map<ChangeCallbackID, ChangeListener> = new Map();

	public onChange(callback: ChangeCallback): ChangeCallbackID;
	public onChange(channel: string, callback: () => void): ChangeCallbackID;
	public onChange(
		a1: string | (() => void),
		a2?: () => void
	): ChangeCallbackID {
		let channel: string | undefined;
		let callback: () => void = () => null;
		if (typeof a1 === "string") {
			if (!a2) throw new TypeError("Disrespected function overloads");
			channel = a1;
			callback = a2;
		} else callback = a1;

		if (channel) this.addEventListener(this.getEventName(channel), callback);
		else this.addEventListener(this.getEventName(), callback);

		const listener: ChangeListener = { channel, callback };
		const id = uuid();
		this.listeners.set(id, listener);
		return id;
	}

	public unregisterCallback(callbackId: ChangeCallbackID): void {
		const listener = this.listeners.get(callbackId);
		if (!listener) return;
		this.removeEventListener(
			this.getEventName(listener.channel),
			listener.callback
		);
		this.listeners.delete(callbackId);
	}

	protected notify(channel?: string) {
		this.dispatchEvent(new Event(this.getEventName()));
		if (channel) this.dispatchEvent(new Event(this.getEventName(channel)));
	}

	private getEventName(channel?: string) {
		return channel ? "change" : `change@${channel}`;
	}
}

export default ChangeNotifier;

export type { ChangeCallback, ChangeCallbackID };
