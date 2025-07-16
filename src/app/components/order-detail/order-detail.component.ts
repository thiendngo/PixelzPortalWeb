import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order, Attachment, OrderService } from '../../services/order';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../services/auth';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [DatePipe, NgClass, NgForOf, NgIf, FormsModule],
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent implements OnInit {
  orderId!: string;
  userRole: string;
  order: Order = {
    id: '',
    createdAt: '',
    status: 0,
    name: '',
    totalAmount: 0,
    userId: ''
  };
  orderStatus = {
    Created: 0,
    Processing: 1,
    Paid: 2,
    Failed: 3,
    InProduction: 4
  };

  existingAttachments: Attachment[] = [];
  pendingAttachments: File[] = [];

  statusLabel: { [key: number]: string } = {
    0: 'Created',
    1: 'Processing',
    2: 'Paid',
    3: 'Failed',
    4: 'In Production'
  };

  statusBadgeClass: { [key: number]: string } = {
    0: 'bg-secondary',
    1: 'bg-warning',
    2: 'bg-success',
    3: 'bg-danger',
    4: 'bg-success'
  };

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id')!;
    this.loadOrder();
    this.userRole = this.authService.getUserInfo().role;
  }

  loadOrder(): void {
    this.orderService.getOrderById(this.orderId).subscribe((order) => {
      this.order = order;
    });

    this.orderService.getAttachments(this.orderId).subscribe((attachments) => {
      this.existingAttachments = attachments;
    });
  }

  handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.pendingAttachments.push(...files);
    }
  }

  deleteAttachment(id: string, isPending: boolean = false): void {
    if (isPending) {
      this.pendingAttachments = this.pendingAttachments.filter((f) => f.name !== id);
    } else {
      if (confirm('Are you sure you want to delete this attachment?')) {
        this.orderService.deleteAttachment(id).subscribe(() => {
          this.loadOrder();
        });
      }
    }
  }

  saveOrder(): void {
    const tasks: Observable<any>[] = [];

    // 1. Save amount (if applicable)
    if (this.userRole === 'ItSupport' || this.userRole === 'Manager') {
      tasks.push(this.orderService.updateOrder(this.orderId, {
        totalAmount: this.order.totalAmount
      }));
    }

    // 2. Save attachments (if any)
    if (this.pendingAttachments.length > 0) {
      const formData = new FormData();
      this.pendingAttachments.forEach((file) => {
        formData.append('attachments', file);
      });

      tasks.push(this.orderService.addAttachments(this.orderId, formData));
    }

    // Run all tasks in parallel
    forkJoin(tasks).subscribe({
      next: () => {
        this.pendingAttachments = [];
        this.loadOrder();
      },
      error: (err) => {
        console.error('Failed to save order', err);
      }
    });
  }

  checkOutOrder(): void {
    this.orderService.checkOut(this.orderId).subscribe({
      next: () => {
        this.loadOrder();
        // optionally refresh order data
      },
      error: (err) => {
        this.loadOrder();
        console.error('Checkout failed', err);
        // optionally show toast or error message
      }
    });
  }

  pushToProduction(): void {
    this.orderService.pushToProduction(this.orderId).subscribe({
      next: () => {
        alert('Order successfully pushed to production.');
        this.loadOrder();
      },
      error: (err) => {
        console.error('Push failed:', err);
        alert('Failed to push order to production.');
      }
    });
  }

  markAsPaid() {

  }
}
