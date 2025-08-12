import 'package:flutter/material.dart';
import '../../services/installer_service.dart';

class PromotionsScreen extends StatefulWidget {
  const PromotionsScreen({super.key});

  @override
  State<PromotionsScreen> createState() => _PromotionsScreenState();
}

class _PromotionsScreenState extends State<PromotionsScreen> {
  bool loading = true; String? error; List items = []; Map<String,dynamic> stats = const {};

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState((){loading=true; error=null;});
    try {
      final res = await InstallerService().getActivePromotions(); items = res['promotions'] ?? res['data']?['promotions'] ?? res['data'] ?? [];
      final st = await InstallerService().getPromotionStats(); stats = st;
    }
    catch(e){ error = e.toString(); }
    finally { if(mounted) setState((){loading=false;}); }
  }

  Future<void> _join(String id) async {
    setState((){loading=true;});
    try { await InstallerService().joinPromotion(id); if(mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Joined promotion'))); }
    catch(e){ if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'))); }
    finally { await _load(); }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (error != null) return Center(child: Text(error!));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (stats.isNotEmpty) GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, mainAxisSpacing: 8, crossAxisSpacing: 8, children: [
            _Tile(label: 'Active', value: '${stats['activePromotions'] ?? 0}', icon: Icons.local_activity),
            _Tile(label: 'Participating', value: '${stats['participatingPromotions'] ?? 0}', icon: Icons.group),
            _Tile(label: 'Completed', value: '${stats['completedPromotions'] ?? 0}', icon: Icons.emoji_events),
            _Tile(label: 'Available', value: '${stats['availablePromotions'] ?? 0}', icon: Icons.add_task),
          ]),
          const SizedBox(height: 12),
          ...items.map((p){ final m = p as Map<String,dynamic>; final canJoin = (m['canJoin'] ?? true) == true; final progress = ((m['progressPercentage'] ?? 0) as num).toDouble(); return Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
            Row(children:[
              Expanded(child: Text(m['title']?.toString() ?? 'Promotion', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold))),
              Chip(label: Text('${m['participantCount'] ?? 0} joined')),
            ]),
            const SizedBox(height: 6),
            Text(m['description']?.toString() ?? ''),
            const SizedBox(height: 8),
            LinearProgressIndicator(value: (progress/100).clamp(0,1)),
            const SizedBox(height: 6),
            Row(children:[
              Expanded(child: Text('Target: ${m['targetInverters'] ?? '-'}  Bonus: Rs ${m['bonusAmount'] ?? '-'}')),
              FilledButton.tonal(onPressed: canJoin? ()=>_join((m['id'] ?? m['_id']).toString()) : null, child: Text(canJoin? 'Join' : 'Joined')),
            ])
          ])));}).toList()
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget { final String label; final String value; final IconData icon; const _Tile({required this.label, required this.value, required this.icon}); @override Widget build(BuildContext context){ return Card(child: Padding(padding: const EdgeInsets.all(12), child: Row(children:[Icon(icon, color: Theme.of(context).colorScheme.primary), const SizedBox(width: 12), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[Text(label, style: Theme.of(context).textTheme.labelMedium), Text(value, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold))]))]))); }}

