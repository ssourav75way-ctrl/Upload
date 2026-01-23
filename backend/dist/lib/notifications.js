import webPush from "web-push";
import { prisma } from "./PrismaClient.js";
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
webPush.setVapidDetails(`mailto:${EMAIL_ADDRESS}`, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
export async function sendNotificationToUser(userId, title, body) {
    try {
        const subscriptions = await prisma.subscription.findMany({
            where: { userId },
        });
        console.log(`Sending notifications to user ${userId} (${subscriptions.length} subscriptions found)`);
        const notifications = subscriptions.map((sub) => {
            console.log(`Pushing to endpoint: ${sub.endpoint.substring(0, 30)}...`);
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.auth,
                    p256dh: sub.p256dh,
                },
            };
            return webPush
                .sendNotification(pushConfig, JSON.stringify({ title, body }))
                .catch(async (err) => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Subscription has expired or is no longer valid
                    await prisma.subscription.delete({ where: { id: sub.id } });
                }
                console.error("Error sending push notification:", err);
            });
        });
        await Promise.all(notifications);
    }
    catch (error) {
        console.error("Error in sendNotificationToUser:", error);
    }
}
//# sourceMappingURL=notifications.js.map