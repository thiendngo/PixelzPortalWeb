// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { AdminComponent } from './layout/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './layout/layouts/guest-layout/guest-layout.component';
import { authGuard } from './guards/auth-guard';
import { OrderTitleResolver } from './layout/shared/components/breadcrumb/order-title.resolver';

const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard/default',
        pathMatch: 'full'
      },
      {
        path: 'dashboard/default',
        loadComponent: () => import('../app/components/dashboard/default/default.component').then((c) => c.DefaultComponent)
      },
      {
        path: 'default',
        loadComponent: () => import('../app/components/dashboard/default/default.component').then((c) => c.DefaultComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('../app/components/orders/orders.component').then((c) => c.OrdersComponent)
      },
      {
        path: 'orders/:id',
        resolve: { breadcrumb: OrderTitleResolver  },
        loadComponent: () => import('../app/components/order-detail/order-detail.component').then((c) => c.OrderDetailComponent)
      }

    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
