import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_shell.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'screens/promotions/promotions_screen.dart';
import 'screens/promotions/promotion_detail_screen.dart';
import 'screens/promotions/promotion_history_screen.dart';
import 'screens/payments/payments_screen.dart';
import 'screens/payments/payment_detail_screen.dart';
import 'screens/serials/serials_screen.dart';
import 'screens/serials/add_serial_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/profile/edit_profile_screen.dart';
import 'screens/profile/edit_payment_profile_screen.dart';
import 'screens/profile/change_password_screen.dart';
import 'screens/notifications/notifications_screen.dart';

final router = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(path: '/login', builder: (c, s) => const LoginScreen()),
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) => HomeShell(shell: navigationShell),
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(path: '/dashboard', builder: (c, s) => const DashboardScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/promotions', builder: (c, s) => const PromotionsScreen()),
          GoRoute(path: '/promotions/:id', builder: (c, s) => PromotionDetailScreen(id: s.pathParameters['id']!)),
          GoRoute(path: '/promotions-history', builder: (c, s) => const PromotionHistoryScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/payments', builder: (c, s) => const PaymentsScreen()),
          GoRoute(path: '/payments/:id', builder: (c, s) => PaymentDetailScreen(id: s.pathParameters['id']!)),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/serials', builder: (c, s) => const SerialsScreen()),
          GoRoute(path: '/serials/add', builder: (c, s) => const AddSerialScreen()),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: '/profile', builder: (c, s) => const ProfileScreen()),
          GoRoute(path: '/profile/edit', builder: (c, s) => const EditProfileScreen()),
          GoRoute(path: '/profile/payment', builder: (c, s) => const EditPaymentProfileScreen()),
          GoRoute(path: '/profile/password', builder: (c, s) => const ChangePasswordScreen()),
          GoRoute(path: '/notifications', builder: (c, s) => const NotificationsScreen()),
        ]),
      ],
    ),
  ],
);

