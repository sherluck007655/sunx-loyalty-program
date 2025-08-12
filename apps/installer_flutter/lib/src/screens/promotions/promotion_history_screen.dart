import 'package:flutter/material.dart';
import '../../services/installer_service.dart';

class PromotionHistoryScreen extends StatefulWidget {
  const PromotionHistoryScreen({super.key});

  @override
  State<PromotionHistoryScreen> createState() => _PromotionHistoryScreenState();
}

class _PromotionHistoryScreenState extends State<PromotionHistoryScreen> {
  bool loading=true; String? error; List items = [];
  @override
  void initState(){ super.initState(); _load(); }

  Future<void> _load() async {
    setState(()=>loading=true);
    try { final res = await InstallerService().getPromotionHistory(); items = res['promotions'] ?? res['data']?['promotions'] ?? []; }
    catch(e){ error = e.toString(); }
    finally { if(mounted) setState(()=>loading=false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Promotion History')),
      body: loading? const Center(child: CircularProgressIndicator()) : (error!=null? Center(child: Text(error!)) : RefreshIndicator(
        onRefresh: _load,
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          itemBuilder: (c,i){ final m = items[i] as Map<String,dynamic>; return Card(child: ListTile(
            leading: const Icon(Icons.emoji_events_outlined),
            title: Text(m['title']?.toString() ?? 'Promotion'),
            subtitle: Text(m['description']?.toString() ?? ''),
          )); },
        ),
      )),
    );
  }
}

