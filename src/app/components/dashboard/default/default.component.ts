import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// charts + components
import { MonthlyBarChartComponent } from 'src/app/layout/shared/apexchart/monthly-bar-chart/monthly-bar-chart.component';
import { IncomeOverviewChartComponent } from 'src/app/layout/shared/apexchart/income-overview-chart/income-overview-chart.component';
import { AnalyticsChartComponent } from 'src/app/layout/shared/apexchart/analytics-chart/analytics-chart.component';
import { SalesReportChartComponent } from 'src/app/layout/shared/apexchart/sales-report-chart/sales-report-chart.component';
import { CardComponent } from 'src/app/layout/shared/components/card/card.component';
import { OrdersComponent } from '../../orders/orders.component';

// icons
import { IconService, IconDirective } from '@ant-design/icons-angular';
import {
  FallOutline, GiftOutline, MessageOutline, RiseOutline, SettingOutline
} from '@ant-design/icons-angular/icons';

import { Order, OrderService } from '../../../services/order';
import { UserService } from '../../../services/user-service';
import { AuthenticationService } from '../../../services/auth';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    IconDirective,
    MonthlyBarChartComponent,
    IncomeOverviewChartComponent,
    AnalyticsChartComponent,
    SalesReportChartComponent,
    OrdersComponent
  ],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  private iconService = inject(IconService);
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private authService = inject(AuthenticationService);

  userRole: string = '';
  totalOrders = 0;
  totalSales = 0;
  totalUsers = 0;
  totalOrdersLastYear = 0;
  orders: Order[] = [];
  AnalyticEcommerce: any[] = [];

  recentOrders: Order[] = [];

  statusLabel: { [key: number]: string } = {
    0: 'Created',
    1: 'Processing',
    2: 'Paid',
    3: 'Failed'
  };

  constructor() {
    this.iconService.addIcon(...[
      RiseOutline, FallOutline, SettingOutline, GiftOutline, MessageOutline
    ]);
  }

  ngOnInit(): void {
    this.userRole = this.authService.getUserInfo().role;

    if (this.userRole === 'ItSupport' || this.userRole === 'Manager') {
      this.loadAllOrders();
      this.loadAllUsers();
    } else {
      this.loadUserOrders();
    }

    this.loadRecentOrders();
  }

  private loadAllOrders(): void {
    this.orderService.getAllOrders().subscribe(orders => {
      this.orders = orders;
      this.computeOrderStats();
      this.buildAnalyticCards();
    });
  }

  private loadUserOrders(): void {
    this.orderService.getMyOrders().subscribe(orders => {
      this.orders = orders;
      this.computeOrderStats();
      this.buildAnalyticCards();
    });
  }

  private loadAllUsers(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.totalUsers = users.length;
      this.buildAnalyticCards();
    });
  }

  private computeOrderStats(): void {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    this.totalOrders = this.orders.filter(o => new Date(o.createdAt).getFullYear() === currentYear).length;
    this.totalOrdersLastYear = this.orders.filter(o => new Date(o.createdAt).getFullYear() === lastYear).length;

    this.totalSales = this.orders
      .filter(o => new Date(o.createdAt).getFullYear() === currentYear)
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }

  private buildAnalyticCards(): void {
    const orderGrowth =
      this.totalOrdersLastYear > 0
        ? ((this.totalOrders - this.totalOrdersLastYear) / this.totalOrdersLastYear) * 100
        : 100;

    const orderIcon = orderGrowth >= 0 ? 'rise' : 'fall';
    const orderColor = orderGrowth >= 0 ? 'text-success' : 'text-danger';
    const orderBg = orderGrowth >= 0 ? 'bg-light-success' : 'bg-light-danger';
    const orderBorder = orderGrowth >= 0 ? 'border-success' : 'border-danger';

    if (this.userRole === 'ItSupport' || this.userRole === 'Manager') {
      this.AnalyticEcommerce = [
        {
          title: 'Total Users',
          amount: this.totalUsers,
          background: 'bg-light-primary',
          border: 'border-primary',
          icon: 'message',
          percentage: '',
          color: 'text-primary',
          number: this.totalUsers
        },
        {
          title: 'Total Orders',
          amount: this.totalOrders,
          background: orderBg,
          border: orderBorder,
          icon: orderIcon,
          percentage: `${orderGrowth.toFixed(1)}%`,
          color: orderColor,
          number: this.totalOrders
        },
        {
          title: 'Total Sales',
          amount: `$${this.totalSales.toLocaleString()}`,
          background: 'bg-light-warning',
          border: 'border-warning',
          icon: 'gift',
          percentage: '',
          color: 'text-warning',
          number: `$${this.totalSales.toFixed(2)}`
        }
      ];
    } else {
      this.AnalyticEcommerce = [
        {
          title: 'Total Orders',
          amount: this.totalOrders,
          background: orderBg,
          border: orderBorder,
          icon: orderIcon,
          percentage: `${orderGrowth.toFixed(1)}%`,
          color: orderColor,
          number: this.totalOrders
        },
        {
          title: 'Total Purchase',
          amount: `$${this.totalSales.toLocaleString()}`,
          background: 'bg-light-success',
          border: 'border-success',
          icon: 'gift',
          percentage: '',
          color: 'text-success',
          number: `$${this.totalSales.toFixed(2)}`
        }
      ];
    }
  }

  getOrderStatusBadge(status: string | number): string {
    const s = +status;
    switch (s) {
      case 2: return 'bg-light-success text-success';
      case 1: return 'bg-light-warning text-warning';
      case 3: return 'bg-light-danger text-danger';
      default: return 'bg-light-secondary text-muted';
    }
  }

  getOrderStatusIcon(status: string | number): string {
    const s = +status;
    switch (s) {
      case 2: return 'rise';
      case 1: return 'setting';
      case 3: return 'fall';
      default: return 'message';
    }
  }

  loadRecentOrders(): void {
    const obs = this.userRole === 'ItSupport' || this.userRole === 'Manager'
      ? this.orderService.getAllOrders()
      : this.orderService.getMyOrders();

    obs.subscribe(orders => {
      this.recentOrders = orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    });
  }
}
