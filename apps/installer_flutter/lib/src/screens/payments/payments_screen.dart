import 'package:flutter/material.dart';
import '../../services/installer_service.dart';
import 'package:go_router/go_router.dart';

class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key});

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  bool loading = true; String? error; List items = []; String filter = '';
  Map<String,dynamic> summary = const {};

  @override
  void initState(){ super.initState(); _load(); }

  Future<void> _load() async {
    setState((){loading=true; error=null;});
    try {
      final res = await InstallerService().getPaymentHistory(status: filter);
      items = res['payments'] ?? res['data']?['payments'] ?? [];
      summary = res['summary'] ?? res['data']?['summary'] ?? {};
    } catch(e){ error = e.toString(); }
    finally { if(mounted) setState((){loading=false;}); }
  }

  Future<void> _requestPayment() async {
    final form = GlobalKey<FormState>();
    final _amount = TextEditingController();
    final _desc = TextEditingController(text: 'Manual request via app');
    final _method = ValueNotifier('bank_transfer');
    final _bankTitle = TextEditingController();
    final _bankName = TextEditingController();
    final _branch = TextEditingController();
    final _iban = TextEditingController();

    final ok = await showDialog<bool>(context: context, builder: (c){
      return AlertDialog(
        title: const Text('Request Payment'),
        content: Form(key: form, child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children:[
          TextFormField(controller: _amount, decoration: const InputDecoration(labelText: 'Amount (optional)'), keyboardType: TextInputType.number),
          const SizedBox(height: 8),
          TextFormField(controller: _desc, decoration: const InputDecoration(labelText: 'Description')),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(value: _method.value, items: const [
            DropdownMenuItem(value: 'bank_transfer', child: Text('Bank Transfer')),
            DropdownMenuItem(value: 'cash', child: Text('Cash')),
          ], onChanged: (v){ _method.value = v ?? 'bank_transfer'; }),
          const SizedBox(height: 8),
          ValueListenableBuilder<String>(valueListenable: _method, builder: (context, v, _) {
            if (v!='bank_transfer') return const SizedBox.shrink();
            return Column(children:[
              TextFormField(controller: _bankTitle, decoration: const InputDecoration(labelText: 'Account Title')),
              const SizedBox(height: 8),
              TextFormField(controller: _bankName, decoration: const InputDecoration(labelText: 'Bank Name')),
              const SizedBox(height: 8),
              TextFormField(controller: _branch, decoration: const InputDecoration(labelText: 'Branch Code')),
              const SizedBox(height: 8),
              TextFormField(controller: _iban, decoration: const InputDecoration(labelText: 'IBAN Number')),
            ]);
          })
        ]))),
        actions: [
          TextButton(onPressed: ()=>Navigator.pop(c,false), child: const Text('Cancel')),
          FilledButton(onPressed: ()=>Navigator.pop(c,true), child: const Text('Submit')),
        ],
      );
    });
    if (ok==true) {
      final payload = {
        if (_amount.text.trim().isNotEmpty) 'amount': int.tryParse(_amount.text.trim()) ?? 0,
        'description': _desc.text.trim(),
        'paymentMethod': _method.value,
        if (_method.value=='bank_transfer') ...{
          'bankTitle': _bankTitle.text.trim(),
          'bankName': _bankName.text.trim(),
          'branchCode': _branch.text.trim(),
          'ibanNumber': _iban.text.trim(),
        }
      };
      await InstallerService().requestPayment(payload);
      if(mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment requested')));
      await _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(onPressed: _requestPayment, child: const Icon(Icons.request_page_outlined)),
      body: loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Summary tiles
            if (summary.isNotEmpty) GridView.count(crossAxisCount: 2, mainAxisSpacing: 8, crossAxisSpacing: 8, shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), children: [
              _SumCard(icon: Icons.task_alt, label: 'Total Payments', value: '${summary['totalPayments'] ?? 0}'),
              _SumCard(icon: Icons.wallet, label: 'Total Earned', value: 'Rs ${summary['totalEarned'] ?? 0}'),
              _SumCard(icon: Icons.pending_actions, label: 'Pending', value: 'Rs ${summary['totalPending'] ?? 0}'),
              FutureBuilder<Map<String,dynamic>>(
                future: InstallerService().getPaymentStats(),
                builder: (c,s){ final d = s.data ?? {}; return _SumCard(icon: Icons.leaderboard, label: 'Eligible for Payment', value: (d['eligibleForPayment']==true)?'Yes':'No');},
              ),
            ]),
            const SizedBox(height: 12),
            Row(children:[
              Expanded(child: DropdownButtonFormField<String>(value: filter.isEmpty?null:filter, decoration: const InputDecoration(labelText: 'Filter by Status'), items: const [
                DropdownMenuItem(value: 'pending', child: Text('Pending')),
                DropdownMenuItem(value: 'approved', child: Text('Approved')),
                DropdownMenuItem(value: 'paid', child: Text('Paid')),
              ], onChanged: (v){ filter = v ?? ''; _load(); })),
            ]),
            const SizedBox(height: 12),
            ...items.map((p){ final m = p as Map<String,dynamic>; return Card(child: ListTile(
              leading: const Icon(Icons.payments_outlined),
              title: Text('Rs ${m['amount']}'),
              subtitle: Text(m['description'] ?? ''),
              trailing: Chip(label: Text((m['status'] ?? 'pending').toString())),
            ));}),
          ],
        ),
      ),
    );
  }
}

class _SumCard extends StatelessWidget { final IconData icon; final String label; final String value; const _SumCard({required this.icon, required this.label, required this.value}); @override Widget build(BuildContext context){ return Card(child: Padding(padding: const EdgeInsets.all(12), child: Row(children:[Icon(icon, color: Theme.of(context).colorScheme.primary), const SizedBox(width: 12), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[Text(label, style: Theme.of(context).textTheme.labelMedium), Text(value, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold))]))]))); }}

