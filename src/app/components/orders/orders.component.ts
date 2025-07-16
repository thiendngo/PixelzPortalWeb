import { Component, Input, OnInit } from '@angular/core';
import { Order, OrderService } from '../../services/order';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { AppUser, UserService } from '../../services/user-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  imports: [FormsModule, NgForOf, NgIf],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  @Input() showCreateButton: boolean = true;
  allUsers: AppUser[] = [];
  userEmails: string[];
  filteredUsers: AppUser[] = [];
  userRole: string;
  page = 1;
  pageSize = 10;

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.pageSize);
  }

  get paginatedOrders() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  newOrder = {
    name: '',
    charge: 0,
    assignedUserId: '',
    files: [] as File[]
  };

  userSearchInput = '';

  canCreate(): boolean {
    return ['User', 'ItSupport', 'Manager'].includes(this.userRole);
  }

  filters = {
    name: '',
    status: '',
    totalAmount: '',
    userEmail: ''
  };

  recentOrder: Order[] = [];
  filteredOrders: Order[] = [];

  loading = true;
  error = '';
  statusOptions: number[] = [0, 1, 2, 3, 4]; // Matches enum values

  statusLabel: { [key: number]: string } = {
    0: 'Created',
    1: 'Processing',
    2: 'Paid',
    3: 'Failed',
    4: 'InProduction'
  };

  statusBadgeClass: { [key: number]: string } = {
    0: 'bg-secondary', // Created
    1: 'bg-warning', // Processing
    2: 'bg-success', // Paid
    3: 'bg-danger', // Failed
    4: 'bg-success', // Paid
  };
  userIdToEmail: { [id: string]: string } = {};
  emailToUserId: { [email: string]: string } = {};
  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private modalService: NgbModal,
    private authService: AuthenticationService,
    private router: Router
  ) {

    this.userRole = this.authService.getUserInfo().role;

  }

  ngOnInit(): void {

    if (this.userRole === 'ItSupport' || this.userRole === 'Manager') {
      this.loadAllUsers();
      this.loadAllOrders();
    } else this.loadOrders();

  }
  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;

        // Create mapping
        this.userIdToEmail = {};
        this.emailToUserId = {};

        users.forEach(user => {
          this.userIdToEmail[user.id] = user.email;
          this.emailToUserId[user.email] = user.id;
        });

        // Populate dropdown
        this.userEmails = users.map(u => u.email);
        },
      error: () => console.error('Failed to load users')
    });
  }
  viewOrder(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }
  loadOrders(): void {
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.recentOrder = orders;
        this.filteredOrders = [...orders];
      },
      error: () => {
        console.error('Failed to load orders');
      }
    });
  }

  loadAllOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        const sorted = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.recentOrder = sorted;
        this.filteredOrders = [...sorted];
      },
      error: () => {
        console.error('Failed to load orders');
      }
    });
  }



  searchUsers(): void {
    const search = this.userSearchInput.toLowerCase();
    this.filteredUsers = this.allUsers.filter((u) => u.email.toLowerCase().includes(search));
  }
  applyFilters(): void {

    this.page = 1;
    const name = this.filters.name.toLowerCase();
    const amount = this.filters.totalAmount.toLowerCase();
    const status = this.filters.status;
    const selectedEmail = this.filters.userEmail?.toLowerCase() || '';
    const selectedUserId = this.emailToUserId[selectedEmail];

    this.filteredOrders = this.recentOrder.filter((order) => {
      const matchesName = order.name?.toLowerCase().includes(name);
      const matchesAmount = order.totalAmount?.toString().toLowerCase().includes(amount);
      const matchesStatus = status === '' || order.status.toString() === status;
      const matchesUser =
        !this.filters.userEmail || order.userId === selectedUserId;

      return matchesName && matchesAmount && matchesStatus && matchesUser;
    });
  }

  openCreateModal(templateRef: any): void {
    this.newOrder = { name: '', charge: 0, assignedUserId: '', files: [] };
    this.userSearchInput = '';
    this.filteredUsers = [];

    this.modalService.open(templateRef, { centered: true });
  }

  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.newOrder.files = Array.from(input.files);
    }
  }

  selectUser(user: any): void {
    this.newOrder.assignedUserId = user.id;
    this.userSearchInput = user.email;
    this.filteredUsers = [];
  }

  submitOrder(modalRef: any): void {
    const formData = new FormData();

    formData.append('Name', this.newOrder.name);
    formData.append('TotalAmount', this.newOrder.charge.toString());

    const userId = (this.userRole === 'ItSupport' || this.userRole === 'Manager')
      ? this.newOrder.assignedUserId
      : this.authService.getCurrentUserId();

    if (!userId) {
      alert('User ID is missing.');
      return;
    }

    formData.append('UserId', userId);

    for (const file of this.newOrder.files) {
      formData.append('Attachments', file); // also match C# prop: 'Attachments'
    }


    this.orderService.createOrder(formData).subscribe({
      next: () => {
        modalRef.close();
        if (this.userRole === 'ItSupport' || this.userRole === 'Manager') {
          this.loadAllOrders();
        }
        else this.loadOrders();
      },
      error: err => {
        console.error('Order creation failed:', err);
      }
    });
  }


  protected readonly Math = Math;
}
