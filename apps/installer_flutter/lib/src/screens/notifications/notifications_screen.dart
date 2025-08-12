import 'package:flutter/material.dart';
import '../../services/installer_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool loading = true; String? error; List items = []; int unread=0;

  @override
  void initState(){ super.initState(); _load(); }

  Future<void> _load() async {
    setState((){loading=true; error=null;});
    try { final res = await InstallerService().getNotifications(); items = res['notifications'] ?? res['data']?['notifications'] ?? []; unread = res['unreadCount'] ?? res['data']?['unreadCount'] ?? 0; }
    catch(e){ error = e.toString(); }
    finally { if (mounted) setState(()=>loading=false); }
  }

  Future<void> _markAll() async { await InstallerService().markAllNotificationsRead(); await _load(); }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (error!=null) return Center(child: Text(error!));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(children:[Expanded(child: Text('Notifications ($unread unread)', style: Theme.of(context).textTheme.titleLarge)), TextButton(onPressed: _markAll, child: const Text('Mark all as read'))]),
          const SizedBox(height: 8),
          ...items.map((n){ final m = n as Map<String,dynamic>; final read = (m['read'] ?? false) as bool; return Card(color: read? null : Theme.of(context).colorScheme.primaryContainer, child: ListTile(
            leading: Icon(read? Icons.notifications_none : Icons.notifications_active_outlined),
            title: Text(m['title']?.toString() ?? ''),
            subtitle: Text(m['message']?.toString() ?? ''),
            trailing: Text(((m['createdAt'] ?? '') as String).toString().replaceFirst('T',' ').split('.').first),
            onTap: () async { if (!read) { await InstallerService().markNotificationRead((m['_id'] ?? m['id']).toString()); await _load(); } },
          )); }).toList(),
        ],
      ),
    );
  }
}

