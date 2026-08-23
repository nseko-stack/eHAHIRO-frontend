// Push notification service for PWA
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title, options = {}) => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        ...options
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (e) {
      console.warn('Could not display system notification:', e);
      return null;
    }
  }
  return null;
};

export const showPriceAlert = (cropName, marketName, price) => {
  showNotification(`Price Update: ${cropName}`, {
    body: `${marketName}: RWF ${price}/kg`,
    tag: 'price-alert',
    requireInteraction: false,
    silent: false
  });
};

export const showBulkUploadResult = (processed, errors) => {
  const title = errors > 0 ? 'Bulk Upload Completed with Errors' : 'Bulk Upload Successful';
  const body = `Processed ${processed} prices${errors > 0 ? ` with ${errors} errors` : ''}`;

  showNotification(title, {
    body,
    tag: 'bulk-upload',
    requireInteraction: true
  });
};

// Register service worker for push notifications (if needed in future)
export const registerPushNotifications = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if push is supported
      if (!registration.pushManager) {
        console.log('Push messaging is not supported');
        return;
      }

      // You can add push subscription logic here in the future
      // const subscription = await registration.pushManager.subscribe({...});

      console.log('Push notifications ready');
    } catch (error) {
      console.error('Error registering push notifications:', error);
    }
  }
};