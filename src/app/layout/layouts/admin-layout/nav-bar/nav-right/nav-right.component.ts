import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  input,
  output,
  OnDestroy
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';


// UI
import { IconService, IconDirective } from '@ant-design/icons-angular';
import {
  BellOutline, SettingOutline, GiftOutline, MessageOutline, PhoneOutline,
  CheckCircleOutline, LogoutOutline, EditOutline, UserOutline, ProfileOutline,
  WalletOutline, QuestionCircleOutline, LockOutline, CommentOutline,
  UnorderedListOutline, ArrowRightOutline, GithubOutline
} from '@ant-design/icons-angular/icons';

import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';

// Services
import { AuthenticationService } from '../../../../../services/auth';
import { OrderService, ProductionQueueItem } from '../../../../../services/order';
import { DatePipe, NgForOf } from '@angular/common';
import { NotificationService } from '../../../../../services/notification-service';

@Component({
  selector: 'app-nav-right',
  imports: [IconDirective, RouterModule, NgScrollbarModule, NgbNavModule, NgbDropdownModule, DatePipe, NgForOf],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit, OnDestroy {
  private iconService = inject(IconService);
  private orderService = inject(OrderService);

  userEmail = '';
  userRole = '';
  productionQueue: ProductionQueueItem[] = [];
  private refreshSub!: Subscription;

  styleSelectorToggle = input<boolean>();
  Customize = output();
  windowWidth: number;
  screenFull: boolean = true;

  constructor(
    private auth: AuthenticationService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {
    this.windowWidth = window.innerWidth;
    this.iconService.addIcon(
      CheckCircleOutline,
      GiftOutline,
      MessageOutline,
      SettingOutline,
      PhoneOutline,
      LogoutOutline,
      UserOutline,
      EditOutline,
      ProfileOutline,
      QuestionCircleOutline,
      LockOutline,
      CommentOutline,
      UnorderedListOutline,
      ArrowRightOutline,
      BellOutline,
      GithubOutline,
      WalletOutline
    );
  }

  reloadProductionQueue(): void {
    this.orderService.getProductionQueue().subscribe({
      next: (queue) => {
        this.productionQueue = queue;
      },
      error: (err) => {
        console.error(' Failed to load production queue', err);
      }
    });
  }
  ngOnInit(): void {
    const user = this.auth.getUserInfo();
    if (user) {
      this.userEmail = user.email;
      this.userRole = user.role;
      this.cd.detectChanges();
    }
    this.notificationService.connect();

    this.notificationService.notifications$.subscribe((data) => {
      let parsed: any;

      if (typeof data === 'string') {
        try {
          parsed = JSON.parse(data);
        } catch {
          return; // not valid JSON, skip
        }
      } else {
        parsed = data;
      }

      if (parsed?.orderId) {
        this.reloadProductionQueue();
      }
    });

    this.reloadProductionQueue();

  }

  ngOnDestroy(): void {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }

  goToOrder(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  profile = [
    { icon: 'edit', title: 'Edit Profile' },
    { icon: 'user', title: 'View Profile' },
    { icon: 'profile', title: 'Social Profile' },
    { icon: 'wallet', title: 'Billing' },
    { icon: 'logout', title: 'Logout' }
  ];

  setting = [
    { icon: 'question-circle', title: 'Support' },
    { icon: 'user', title: 'Account Settings' },
    { icon: 'lock', title: 'Privacy Center' },
    { icon: 'comment', title: 'Feedback' },
    { icon: 'unordered-list', title: 'History' }
  ];
}
