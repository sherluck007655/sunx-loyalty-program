import 'package:flutter/material.dart';
import '../../services/installer_service.dart';

class PaymentDetailScreen extends StatefulWidget {
  final String id;
  const PaymentDetailScreen({super.key, required this.id});

  @override
  State<PaymentDetailScreen> createState() => _PaymentDetailScreenState();
}

class _PaymentDetailScreenState extends State<PaymentDetailScreen> {
  Map<String,dynamic>? payment; bool loading=true; String? error;
  final _commentCtrl = TextEditingController(); bool _sending=false;

  @override
  void initState(){ super.initState(); _load(); }

  Future<void> _load() async {
    setState((){loading=true; error=null;});
    try { final res = await InstallerService().getPayment(widget.id); payment = res['payment'] ?? res; }
    catch(e){ error = e.toString(); }
    finally { if(mounted) setState(()=>loading=false); }
  }

  Future<void> _sendComment() async {
    final msg = _commentCtrl.text.trim(); if (msg.isEmpty) return;
    setState(()=>_sending=true);
    try { await InstallerService().addPaymentComment(widget.id, msg); _commentCtrl.clear(); await _load(); }
    catch(e){ if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'))); }
    finally { if(mounted) setState(()=>_sending=false); }
  }

  @override
  void dispose(){ _commentCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment Details')),
      body: loading? const Center(child: CircularProgressIndicator()) : (error!=null? Center(child: Text(error!)) : RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
              Row(children:[Expanded(child: Text('Amount', style: Theme.of(context).textTheme.labelMedium)), Text('Rs ${payment!['amount']}')]),
              const SizedBox(height: 6),
              Row(children:[Expanded(child: Text('Status', style: Theme.of(context).textTheme.labelMedium)), Chip(label: Text((payment!['status'] ?? '').toString()))]),
              const SizedBox(height: 6),
              if ((payment!['description'] ?? '').toString().isNotEmpty) Text(payment!['description'], style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 6),
              Text('Type: ${(payment!['paymentType'] ?? '-').toString()}  Method: ${(payment!['paymentMethod'] ?? '-').toString()}', style: Theme.of(context).textTheme.bodySmall),
            ]))),
            const SizedBox(height: 12),
            Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
              Text('Comments', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              ...((payment!['comments'] ?? []) as List).map((c){ final m = c as Map<String,dynamic>; return ListTile(
                leading: const Icon(Icons.comment_outlined),
                title: Text(m['message']?.toString() ?? ''),
                subtitle: Text(((m['userName'] ?? 'Installer')).toString()),
                trailing: Text(((m['createdAt'] ?? '') as String).toString().replaceFirst('T',' ').split('.').first),
              );}).toList(),
              const Divider(),
              Row(children:[
                Expanded(child: TextField(controller: _commentCtrl, decoration: const InputDecoration(hintText: 'Add a comment'))),
                const SizedBox(width: 8),
                IconButton.filled(onPressed: _sending? null : _sendComment, icon: _sending? const SizedBox(height:16,width:16,child:CircularProgressIndicator(strokeWidth:2,color:Colors.white)) : const Icon(Icons.send))
              ])
            ]))),
          ],
        ),
      )),
    );
  }
}

