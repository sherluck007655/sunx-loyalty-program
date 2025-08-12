import 'package:flutter/material.dart';
import '../../services/installer_service.dart';

class PromotionDetailScreen extends StatefulWidget {
  final String id;
  const PromotionDetailScreen({super.key, required this.id});

  @override
  State<PromotionDetailScreen> createState() => _PromotionDetailScreenState();
}

class _PromotionDetailScreenState extends State<PromotionDetailScreen> {
  Map<String,dynamic>? promo; bool loading=true; String? error;

  @override
  void initState(){ super.initState(); _load(); }

  Future<void> _load() async {
    setState(()=>loading=true);
    try { final res = await InstallerService().getPromotion(widget.id); promo = res['promotion'] ?? res; }
    catch(e){ error = e.toString(); }
    finally { if(mounted) setState(()=>loading=false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Promotion')),
      body: loading? const Center(child: CircularProgressIndicator()) : (error!=null? Center(child: Text(error!)) : RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
              Text(promo!['title']?.toString() ?? '', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(promo!['description']?.toString() ?? ''),
              const SizedBox(height: 12),
              LinearProgressIndicator(value: ((promo!['progressPercentage']??0) as num).toDouble()/100),
              const SizedBox(height: 6),
              Text('Target: ${promo!['targetInverters']}  Bonus: Rs ${promo!['bonusAmount']}  Days left: ${promo!['daysRemaining']}'),
            ]))),
          ],
        ),
      )),
    );
  }
}

