import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../services/installer_service.dart';

class SerialsScreen extends StatefulWidget {
  const SerialsScreen({super.key});

  @override
  State<SerialsScreen> createState() => _SerialsScreenState();
}

class _SerialsScreenState extends State<SerialsScreen> {
  bool loading = true; String? error; List items = []; String search=''; int page=1; int pages=1;
  final _searchCtrl = TextEditingController();

  @override
  void initState(){ super.initState(); _load(); }

  Future<void> _load() async {
    setState((){loading=true; error=null;});
    try {
      final res = await InstallerService().getSerials(page: page, limit: 10, search: search);
      items = res['serials'] ?? res['data'] ?? [];
      final p = res['pagination'] ?? {}; pages = p['pages'] ?? pages; page = p['page'] ?? page;
    } catch(e){ error = e.toString(); }
    finally { if(mounted) setState((){loading=false;}); }
  }

  Future<void> _scanAndAdd() async {
    String? code;
    await showDialog(context: context, builder: (c){
      return Dialog(
        child: SizedBox(height: 420, child: Stack(children:[
          MobileScanner(onDetect: (capture){
            if (code!=null) return; final barcodes = capture.barcodes; if (barcodes.isNotEmpty) { code = barcodes.first.rawValue; Navigator.pop(c); }
          }),
          Positioned(top: 8, right: 8, child: IconButton(onPressed: ()=>Navigator.pop(c), icon: const Icon(Icons.close)))
        ])),
      );
    });
    if (code!=null) {
      try {
        await InstallerService().addSerial({
          'serialNumber': code!.toUpperCase(),
          'installationDate': DateTime.now().toIso8601String().substring(0,10),
          'location': {'address': 'Scanned via app', 'city': 'Unknown'},
          'inverterModel': 'SunX-5000',
          'capacity': 5000,
        });
        if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Serial added: $code')));
        await _load();
      } catch(e) {
        if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(onPressed: () => context.push('/serials/add'), icon: const Icon(Icons.add), label: const Text('Add Serial')),
      body: loading ? const Center(child: CircularProgressIndicator()) : RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(children:[
              Expanded(child: TextField(controller: _searchCtrl, decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search serials'), onSubmitted: (v){ search=v; _load(); })),
              const SizedBox(width: 8),
              IconButton.filledTonal(onPressed: (){ search=_searchCtrl.text; _load(); }, icon: const Icon(Icons.tune)),
              const SizedBox(width: 8),
              IconButton.filled(onPressed: _scanAndAdd, icon: const Icon(Icons.qr_code_scanner))
            ]),
            const SizedBox(height: 12),
            if (items.isEmpty) Card(child: Padding(padding: const EdgeInsets.all(24), child: Column(children:[
              const Icon(Icons.qr_code_2_outlined, size: 48), const SizedBox(height: 8), const Text('No serials yet'),
              const SizedBox(height: 8), FilledButton(onPressed: () => context.push('/serials/add'), child: const Text('Add Your First Serial'))
            ]))),
            ...items.map((s){ final m = s as Map<String,dynamic>; return Card(child: ListTile(
              leading: CircleAvatar(child: const Icon(Icons.qr_code_2_outlined)),
              title: Text(m['serialNumber']?.toString() ?? ''),
              subtitle: Text((m['location']?['address'] ?? m['location'] ?? '').toString()),
              trailing: Chip(label: Text((m['status'] ?? 'active').toString())),
            ));}).toList(),
            const SizedBox(height: 8),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children:[
              Text('Page $page of $pages', style: theme.textTheme.labelMedium),
              Row(children:[
                OutlinedButton(onPressed: page>1?(){ page--; _load(); }:null, child: const Text('Prev')),
                const SizedBox(width: 8),
                OutlinedButton(onPressed: page<pages?(){ page++; _load(); }:null, child: const Text('Next')),
              ])
            ])
          ],
        ),
      ),
    );
  }
}

