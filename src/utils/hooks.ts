import { useEffect } from "react";
import ChangeNotifier, { ChangeCallback } from "./change_notifier";

function useChangeNotification(
	notifier: ChangeNotifier,
	channel: string,
	callback: ChangeCallback
) {
	useEffect(() => {
		const id = notifier.onChange(channel, callback);
		return () => notifier.unregisterCallback(id);
	}, [callback, channel, notifier]);
}

export { useChangeNotification };
