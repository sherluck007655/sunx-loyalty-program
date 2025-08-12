import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../services/installer_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? data; bool loading = true; String? error;
  @override
  void initState(){ super.initState(); _load(); }

  Future<void> _load() async {
    setState((){loading=true; error=null;});
    try { final res = await InstallerService().getProfile(); data = res['installer'] ?? res; }
    catch(e){ error = e.toString(); }
    finally { if(mounted) setState((){loading=false;}); }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (error != null) return Center(child: Text(error!));

    final user = data ?? {};

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(child: ListTile(
            leading: CircleAvatar(backgroundColor: Theme.of(context).colorScheme.primary, child: const Text('S')),
            title: Text(user['name'] ?? ''),
            subtitle: Text('Loyalty Card: ${user['loyaltyCardId'] ?? ''}'),
            trailing: IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
          )),
          const SizedBox(height: 8),
          Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children:[Expanded(child: Text('Profile Information', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold))),
              TextButton.icon(onPressed: ()=> context.push('/profile/edit'), icon: const Icon(Icons.edit), label: const Text('Edit'))]),
            const SizedBox(height: 12),
            _Info(label: 'Full Name', value: user['name'] ?? ''),
            _Info(label: 'Email Address', value: user['email'] ?? ''),
            _Info(label: 'Phone Number', value: user['phone'] ?? ''),
            _Info(label: 'CNIC', value: user['cnic'] ?? ''),
            _Info(label: 'Address', value: user['address'] ?? ''),
          ]))),
          const SizedBox(height: 8),
          Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children:[Expanded(child: Text('Payment Profile', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold))),
              TextButton.icon(onPressed: ()=> context.push('/profile/payment'), icon: const Icon(Icons.account_balance), label: const Text('Update'))]),
            const SizedBox(height: 12),
            _Info(label: 'Account Title', value: (user['bankDetails']?['accountTitle'] ?? '').toString()),
            _Info(label: 'Account Number', value: (user['bankDetails']?['accountNumber'] ?? '').toString()),
            _Info(label: 'Bank Name', value: (user['bankDetails']?['bankName'] ?? '').toString()),
            _Info(label: 'Branch Code', value: (user['bankDetails']?['branchCode'] ?? '').toString()),
          ]))),
          const SizedBox(height: 8),
          Card(child: ListTile(
            leading: const Icon(Icons.lock_outline),
            title: const Text('Change Password'),
            trailing: const Icon(Icons.chevron_right),
            onTap: ()=> context.push('/profile/password'),
          )),
        ],
      ),
    );
  }
}

class _Info extends StatelessWidget {
  final String label; final String value;
  const _Info({required this.label, required this.value});
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.symmetric(vertical: 6), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
      Text(label, style: Theme.of(context).textTheme.labelMedium),
      const SizedBox(height: 4),
      Text(value.isEmpty?'-':value, style: Theme.of(context).textTheme.bodyLarge),
    ]));
  }
}
