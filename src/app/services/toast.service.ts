import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private containerId = 'toast-container';

  constructor() {
    this.ensureContainer();
  }

  private ensureContainer() {
    if (!document.getElementById(this.containerId)) {
      const container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  }

  show(message: string, type: 'success' | 'error' = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-modal ${type}`;
    toast.innerHTML = `
      <div class="toast-message">${message}</div>
      <button class="toast-close">&times;</button>
    `;

    toast.querySelector('.toast-close')!.addEventListener('click', () => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove());
    });

    document.getElementById(this.containerId)!.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));

    // Auto-remove
    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove());
    }, 3500);
  }

  success(msg: string) {
    this.show(msg, 'success');
  }

  error(msg: string) {
    this.show(msg, 'error');
  }
}
