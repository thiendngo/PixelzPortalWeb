import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Order {
  id: string;
  name: string;
  status: string | number;
  totalAmount: number;
  createdAt: string;
  userId: string;
}

export interface Attachment {
  attachmentId: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  orderId: string;
}
export interface ProductionQueueItem {
  orderId: string;
  name: string;
  createdAt: string;
}
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersUrl = `${environment.apiBaseUrl}/api/orders`;
  private attachmentsUrl = `${environment.apiBaseUrl}/api/attachments`;
  private productionQueueUrl = `${environment.apiBaseUrl}/api/production-queue`;
  constructor(private http: HttpClient) {}

  // Orders
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.ordersUrl}/my`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.ordersUrl}/all`);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.ordersUrl}/${id}`);
  }

  createOrder(formData: FormData): Observable<any> {
    return this.http.post(this.ordersUrl, formData);
  }

  checkOut(orderId: string): Observable<void> {
    const headers = new HttpHeaders({
      'Idempotency-Key': this.generateIdempotencyKey()
    });

    return this.http.post<void>(`${this.ordersUrl}/${orderId}/checkout`,
    {},
    { headers });
  }

  updateOrder(id: string, update: { totalAmount: number }): Observable<void> {
    return this.http.put<void>(`${this.ordersUrl}/${id}`, update);
  }
  pushToProduction(orderId: string): Observable<void> {
    return this.http.post<void>(`${this.ordersUrl}/${orderId}/production`, {});
  }


  // Attachments (List & Upload by Order)
  getAttachments(orderId: string): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.ordersUrl}/${orderId}/attachments`);
  }

  addAttachments(orderId: string, formData: FormData): Observable<void> {
    return this.http.post<void>(`${this.ordersUrl}/${orderId}/attachments`, formData);
  }

  // Attachments (Delete & Download by Attachment ID)
  deleteAttachment(attachmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.attachmentsUrl}/${attachmentId}`);
  }

  downloadAttachment(attachmentId: string): Observable<Blob> {
    return this.http.get(`${this.attachmentsUrl}/${attachmentId}/download`, {
      responseType: 'blob'
    });
  }

  private generateIdempotencyKey(): string {
    return crypto.randomUUID(); // works in Angular 15+ if polyfilled
  }

  getProductionQueue(): Observable<ProductionQueueItem[]> {
    return this.http.get<ProductionQueueItem[]>(`${this.productionQueueUrl}`);
  }



}


