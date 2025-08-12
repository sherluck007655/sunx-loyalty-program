import 'package:flutter/material.dart';
import '../../services/installer_service.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _address = TextEditingController();
  bool _loading = true; String? _error; bool _saving=false;

  @override
  void initState(){ super.initState(); _load(); }

  Future<void> _load() async {
    setState(()=>_loading=true);
    try { final res = await InstallerService().getProfile(); final u = res['installer'] ?? res; _name.text = (u['name'] ?? '').toString(); _phone.text = (u['phone'] ?? '').toString(); _address.text = (u['address'] ?? '').toString(); }
    catch(e){ _error = e.toString(); }
    finally { if(mounted) setState(()=>_loading=false); }
  }

  Future<void> _save() async {
    if(!_form.currentState!.validate()) return; setState(()=>_saving=true);
    try { await InstallerService().updateProfile({'name': _name.text.trim(), 'phone': _phone.text.trim(), 'address': _address.text.trim()}); if(mounted) Navigator.pop(context, true); }
    catch(e){ if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'))); }
    finally { if(mounted) setState(()=>_saving=false); }
  }

  @override
  void dispose(){ _name.dispose(); _phone.dispose(); _address.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Profile')),
      body: _loading? const Center(child: CircularProgressIndicator()) : (_error!=null? Center(child: Text(_error!)) : Padding(
        padding: const EdgeInsets.all(16),
        child: Form(key: _form, child: Column(children:[
          TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'Full Name'), validator: (v)=> v==null||v.trim().isEmpty?'Required':null),
          const SizedBox(height: 12),
          TextFormField(controller: _phone, decoration: const InputDecoration(labelText: 'Phone')), // user wants simple text-based validation
          const SizedBox(height: 12),
          TextFormField(controller: _address, decoration: const InputDecoration(labelText: 'Address')),
          const Spacer(),
          FilledButton(onPressed: _saving? null : _save, child: _saving? const SizedBox(height:18,width:18,child:CircularProgressIndicator(strokeWidth:2,color:Colors.white)) : const Text('Save')),
        ])),
      )),
    );
  }
}

