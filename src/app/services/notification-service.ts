import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private ws!: WebSocket;
  private readonly subject = new Subject<any>();

  public notifications$ = this.subject.asObservable();

  constructor(private zone: NgZone) {}

  connect(): void {
    if (this.ws) return;

    this.ws = new WebSocket('ws://localhost:8080'); // adjust if needed

    this.ws.onmessage = (event) => {
      this.zone.run(() => {
        try {
          const data = JSON.parse(event.data);
          this.subject.next(data);
        } catch {
          this.subject.next({ raw: event.data }); // fallback
        }
      });
    };

    this.ws.onclose = () => {
      console.warn(' WebSocket disconnected');
      this.ws = undefined!;
    };

    this.ws.onerror = (err) => {
      console.error(' WebSocket error:', err);
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined!;
    }
  }
}
