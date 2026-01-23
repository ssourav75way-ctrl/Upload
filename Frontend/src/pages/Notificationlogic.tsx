const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const API_URL = import.meta.env.VITE_API_URL;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function handleNotificationAfterLogin() {
  console.log("Checking notifications...");

  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
    return;
  }

  const alreadyAsked = localStorage.getItem("notiAsk");
  if (alreadyAsked && Notification.permission !== "default") {
    console.log("Already asked for notification permission.");
    return;
  }

  console.log("Requesting permission...");
  const permission = await Notification.requestPermission();
  localStorage.setItem("notiAsk", "true");

  if (permission !== "granted") {
    console.log("Permission not granted:", permission);
    return;
  }

  if (!("serviceWorker" in navigator)) {
    console.log("Service workers not supported.");
    return;
  }

  try {
    console.log("Waiting for service worker...");
    const registration = await navigator.serviceWorker.ready;

    // Check if we already have a subscription
    const existingSubscription =
      await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log("Unsubscribing from old stale connection...");
      await existingSubscription.unsubscribe();
    }

    console.log("Subscribing to push manager with fresh connection...");
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log("Subscription successful:", subscription);

    await fetch(`${API_URL}/v1/user/save-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(subscription),
    });
    console.log("Subscription saved to server.");
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
  }
}
