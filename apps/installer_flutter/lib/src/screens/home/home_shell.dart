import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeShell extends StatelessWidget {
  final StatefulNavigationShell shell;
  const HomeShell({super.key, required this.shell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(child: shell),
      bottomNavigationBar: NavigationBar(
        selectedIndex: shell.currentIndex,
        onDestinationSelected: (index) => shell.goBranch(index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.card_giftcard_outlined), label: 'Promos'),
          NavigationDestination(icon: Icon(Icons.payments_outlined), label: 'Payments'),
          NavigationDestination(icon: Icon(Icons.qr_code_scanner_outlined), label: 'Serials'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
      floatingActionButton: shell.currentIndex==3 ? FloatingActionButton.extended(onPressed: ()=> context.push('/serials/add'), icon: const Icon(Icons.add), label: const Text('Add Serial')) : null,
    );
  }
}

