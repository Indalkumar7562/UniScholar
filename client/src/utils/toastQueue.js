import toast from 'react-hot-toast';

class ToastQueueManager {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.currentToastId = null;
    this.lastMessage = '';
    this.lastTime = 0;
  }

  show(message, type = 'success', options = {}) {
    if (!message || typeof message !== 'string') return;

    const trimmedMsg = message.trim();
    const now = Date.now();

    // Deduplicate exact same message if triggered within 3.5 seconds
    if (this.lastMessage === trimmedMsg && now - this.lastTime < 3500) {
      return;
    }
    this.lastMessage = trimmedMsg;
    this.lastTime = now;

    this.queue.push({ message: trimmedMsg, type, options });
    this.processQueue();
  }

  success(message, options = {}) {
    this.show(message, 'success', options);
  }

  error(message, options = {}) {
    this.show(message, 'error', options);
  }

  warning(message, options = {}) {
    this.show(message, 'warning', options);
  }

  info(message, options = {}) {
    this.show(message, 'info', options);
  }

  dismiss(id) {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const item = this.queue.shift();

    // Ensure MAX 1 toast is visible on screen by dismissing any active toast
    toast.dismiss();

    const duration = item.options.duration || 3500;

    let iconTheme = { primary: '#059669', secondary: '#ffffff' };
    if (item.type === 'error') iconTheme = { primary: '#dc2626', secondary: '#ffffff' };
    if (item.type === 'warning') iconTheme = { primary: '#d97706', secondary: '#ffffff' };
    if (item.type === 'info') iconTheme = { primary: '#2563eb', secondary: '#ffffff' };

    let toastFn = toast.success;
    if (item.type === 'error') toastFn = toast.error;
    else if (item.type === 'warning') toastFn = (msg, opts) => toast(msg, { icon: '⚠️', ...opts });
    else if (item.type === 'info') toastFn = (msg, opts) => toast(msg, { icon: 'ℹ️', ...opts });

    this.currentToastId = toastFn(item.message, {
      duration,
      id: item.options.id,
      style: {
        fontFamily: 'Poppins, sans-serif',
        fontSize: '13px',
        fontWeight: '600',
        borderRadius: '14px',
        padding: '12px 18px',
        background: '#0F172A',
        color: '#F8FAFC',
        border: '1px solid #1E293B',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        ...item.options.style
      },
      iconTheme
    });

    // Wait for display duration before allowing the next queued toast to process
    await new Promise(resolve => setTimeout(resolve, duration + 200));

    this.currentToastId = null;
    this.isProcessing = false;

    // Process next item in queue if available
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }
}

export const toastQueue = new ToastQueueManager();
export const showToast = (msg, type = 'success', options = {}) => toastQueue.show(msg, type, options);
export default toastQueue;
