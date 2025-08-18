import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/installer_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? data;
  String? error;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      data = await InstallerService().getDashboard();
    } catch (e) {
      error = e.toString();
    } finally {
      if (mounted)
        setState(() {
          loading = false;
        });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (error != null) {
      return Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text(error!,
            style: TextStyle(color: Theme.of(context).colorScheme.error)),
        const SizedBox(height: 8),
        FilledButton(onPressed: _load, child: const Text('Retry'))
      ]));
    }

    final installer = data!['installer'] ?? {};
    final stats = data!['stats'] ?? {};
    final payments =
        (data!['payments'] ?? data!['recentPayments'] ?? []) as List;
    final serials = (data!['recentSerials'] ?? []) as List;

    final milestones = (stats['milestones'] ?? {}) as Map<String, dynamic>;
    final progressPct = ((milestones['progressPercentage'] ??
            installer['progressPercentage'] ??
            0) as num)
        .toDouble();
    final nextMilestoneAt = milestones['nextMilestoneAt'] ?? 0;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Welcome banner
          Card(
            color: Theme.of(context).colorScheme.primary,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Welcome back, ${installer['name'] ?? ''}!',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: Theme.of(context).colorScheme.onPrimary,
                            fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text('Loyalty Card: ${installer['loyaltyCardId'] ?? ''}',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(context).colorScheme.onPrimary)),
                    const SizedBox(height: 12),
                    LinearProgressIndicator(
                        value: (progressPct / 100).clamp(0, 1),
                        backgroundColor: Theme.of(context)
                            .colorScheme
                            .onPrimary
                            .withOpacity(0.2),
                        color: Theme.of(context).colorScheme.onPrimary),
                    const SizedBox(height: 6),
                    Text(
                        'Milestone progress: ${progressPct.toStringAsFixed(0)}%  ${nextMilestoneAt == 0 ? "(milestone)" : "($nextMilestoneAt to next)"}',
                        style: Theme.of(context)
                            .textTheme
                            .labelMedium
                            ?.copyWith(
                                color:
                                    Theme.of(context).colorScheme.onPrimary)),
                    const SizedBox(height: 12),
                    Wrap(spacing: 8, children: [
                      FilledButton.tonal(
                          onPressed: () => context.push('/serials/add'),
                          child: const Text('Add Serial')),
                      FilledButton.tonal(
                          onPressed: () => context.push('/payments'),
                          child: const Text('Request Payment')),
                      FilledButton.tonal(
                          onPressed: () => context.push('/promotions'),
                          child: const Text('Promotions')),
                    ])
                  ]),
            ),
          ),
          const SizedBox(height: 12),
          _StatGrid(stats: stats),
          const SizedBox(height: 16),
          _Section(
              title: 'Recent Installations',
              items: serials
                  .map((e) => _ListTileData(
                      title: e['serialNumber']?.toString() ?? 'Serial',
                      subtitle:
                          (e['location']?['address'] ?? e['location'] ?? '')
                              .toString(),
                      trailing: e['status']?.toString() ?? ''))
                  .toList()),
          const SizedBox(height: 16),
          _Section(
              title: 'Recent Payments',
              items: payments
                  .map((p) => _ListTileData(
                      title: 'Rs ${p['amount']}',
                      subtitle: p['status']?.toString() ?? '',
                      trailing: p['paymentType']?.toString() ?? ''))
                  .toList()),
        ],
      ),
    );
  }
}

class _StatGrid extends StatelessWidget {
  final Map<String, dynamic> stats;
  const _StatGrid({required this.stats});

  @override
  Widget build(BuildContext context) {
    final totalInverters = stats['totalInverters'] ?? 0;
    final totalPoints = stats['totalPoints'] ?? 0;
    final pendingPayments = stats['pendingPayments'] ?? 0;
    final completedPayments = stats['completedPayments'] ?? 0;

    return GridView.count(
      crossAxisCount: 2,
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _MetricCard(
            icon: Icons.bolt,
            label: 'Products Installed',
            value: '$totalInverters'),
        _MetricCard(
            icon: Icons.star, label: 'Total Points', value: '$totalPoints'),
        _MetricCard(
            icon: Icons.schedule,
            label: 'Pending Payments',
            value: '$pendingPayments'),
        _MetricCard(
            icon: Icons.check_circle,
            label: 'Completed Payments',
            value: '$completedPayments'),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _MetricCard(
      {required this.icon, required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Row(children: [
          Icon(icon, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 12),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(label, style: Theme.of(context).textTheme.labelMedium),
                Text(value,
                    style: Theme.of(context)
                        .textTheme
                        .titleLarge
                        ?.copyWith(fontWeight: FontWeight.bold))
              ]))
        ]),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final List<_ListTileData> items;
  const _Section({required this.title, required this.items});
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(
                child: Text(title,
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.bold))),
            TextButton(onPressed: () {}, child: const Text('View all'))
          ]),
          const SizedBox(height: 8),
          ...items
              .map((e) => ListTile(
                  title: Text(e.title),
                  subtitle: Text(e.subtitle),
                  trailing: Text(e.trailing)))
              .toList(),
        ]),
      ),
    );
  }
}

class _ListTileData {
  final String title;
  final String subtitle;
  final String trailing;
  const _ListTileData(
      {required this.title, required this.subtitle, required this.trailing});
}
