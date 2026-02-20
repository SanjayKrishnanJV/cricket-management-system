/**
 * PWA Utilities
 * Register service worker, handle install prompts, and manage offline state
 */

let deferredPrompt: any = null;

/**
 * Register service worker for PWA functionality
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  console.log('🔄 New version available! Refresh to update.');
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });

    // Listen for install prompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('💾 Install prompt available');
    });

    // Track if app was installed
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed successfully');
      deferredPrompt = null;
    });
  }
}

/**
 * Show install prompt to user
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('No install prompt available');
    return false;
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Install prompt outcome: ${outcome}`);

    if (outcome === 'accepted') {
      deferredPrompt = null;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Install prompt error:', error);
    return false;
  }
}

/**
 * Check if app is installed
 */
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  // Check if running as standalone PWA
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isIOSStandalone = (window.navigator as any).standalone === true;

  return isStandalone || (isIOS && isIOSStandalone);
}

/**
 * Check if install prompt is available
 */
export function isInstallPromptAvailable(): boolean {
  return deferredPrompt !== null;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
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
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
      ),
    });

    console.log('Push subscription created:', subscription);
    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
}

/**
 * Show update notification when new version is available
 */
function showUpdateNotification() {
  if (typeof window === 'undefined') return;

  // Create a simple notification banner
  const banner = document.createElement('div');
  banner.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; right: 0; background: #3b82f6; color: white; padding: 12px; text-align: center; z-index: 9999; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
      <p style="margin: 0; font-weight: 600;">🔄 New version available!</p>
      <button onclick="window.location.reload()" style="margin-top: 8px; background: white; color: #3b82f6; border: none; padding: 6px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;">
        Update Now
      </button>
    </div>
  `;
  document.body.appendChild(banner);
}

/**
 * Helper to convert VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return typeof window !== 'undefined' ? navigator.onLine : true;
}

/**
 * Listen for online/offline events
 */
export function setupOnlineOfflineListeners(
  onOnline?: () => void,
  onOffline?: () => void
) {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => {
    console.log('✅ Back online');
    onOnline?.();
  });

  window.addEventListener('offline', () => {
    console.log('❌ Gone offline');
    onOffline?.();
  });
}
