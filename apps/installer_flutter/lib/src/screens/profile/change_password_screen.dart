import 'package:flutter/material.dart';
import '../../services/installer_service.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _form = GlobalKey<FormState>();
  final _current = TextEditingController();
  final _new = TextEditingController();
  bool _saving=false;

  Future<void> _save() async {
    if(!_form.currentState!.validate()) return; setState(()=>_saving=true);
    try { await InstallerService().changePassword(currentPassword: _current.text, newPassword: _new.text); if(mounted) Navigator.pop(context, true); }
    catch(e){ if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'))); }
    finally { if(mounted) setState(()=>_saving=false); }
  }

  @override
  void dispose(){ _current.dispose(); _new.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Change Password')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(key: _form, child: Column(children:[
          TextFormField(controller: _current, decoration: const InputDecoration(labelText: 'Current Password'), obscureText: true, validator: (v)=> v==null||v.isEmpty? 'Required' : null),
          const SizedBox(height: 12),
          TextFormField(controller: _new, decoration: const InputDecoration(labelText: 'New Password (min 6 chars)'), obscureText: true, validator: (v)=> (v??'').length<6? 'Min 6 characters' : null),
          const Spacer(),
          FilledButton(onPressed: _saving? null : _save, child: _saving? const SizedBox(height:18,width:18,child:CircularProgressIndicator(strokeWidth:2,color:Colors.white)) : const Text('Save')),
        ])),
      ),
    );
  }
}

