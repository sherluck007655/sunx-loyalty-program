import 'package:flutter/material.dart';
import '../../services/installer_service.dart';

class EditPaymentProfileScreen extends StatefulWidget {
  const EditPaymentProfileScreen({super.key});

  @override
  State<EditPaymentProfileScreen> createState() => _EditPaymentProfileScreenState();
}

class _EditPaymentProfileScreenState extends State<EditPaymentProfileScreen> {
  final _form = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _number = TextEditingController();
  final _bank = TextEditingController();
  final _branch = TextEditingController();
  bool _loading = true; String? _error; bool _saving=false;

  @override
  void initState(){ super.initState(); _load(); }

  Future<void> _load() async {
    setState(()=>_loading=true);
    try { final res = await InstallerService().getProfile(); final b = (res['installer'] ?? res)['bankDetails'] ?? {}; _title.text = (b['accountTitle'] ?? '').toString(); _number.text = (b['accountNumber'] ?? '').toString(); _bank.text = (b['bankName'] ?? '').toString(); _branch.text = (b['branchCode'] ?? '').toString(); }
    catch(e){ _error = e.toString(); }
    finally { if(mounted) setState(()=>_loading=false); }
  }

  Future<void> _save() async {
    if(!_form.currentState!.validate()) return; setState(()=>_saving=true);
    try { await InstallerService().updatePaymentProfile({'accountTitle': _title.text.trim(), 'accountNumber': _number.text.trim(), 'bankName': _bank.text.trim(), 'branchCode': _branch.text.trim()}); if(mounted) Navigator.pop(context, true); }
    catch(e){ if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: $e'))); }
    finally { if(mounted) setState(()=>_saving=false); }
  }

  @override
  void dispose(){ _title.dispose(); _number.dispose(); _bank.dispose(); _branch.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment Profile')),
      body: _loading? const Center(child: CircularProgressIndicator()) : (_error!=null? Center(child: Text(_error!)) : Padding(
        padding: const EdgeInsets.all(16),
        child: Form(key: _form, child: Column(children:[
          TextFormField(controller: _title, decoration: const InputDecoration(labelText: 'Account Title'), validator: (v)=> v==null||v.trim().isEmpty?'Required':null),
          const SizedBox(height: 12),
          TextFormField(controller: _number, decoration: const InputDecoration(labelText: 'Account Number/IBAN'), validator: (v)=> v==null||v.trim().isEmpty?'Required':null),
          const SizedBox(height: 12),
          TextFormField(controller: _bank, decoration: const InputDecoration(labelText: 'Bank Name'), validator: (v)=> v==null||v.trim().isEmpty?'Required':null),
          const SizedBox(height: 12),
          TextFormField(controller: _branch, decoration: const InputDecoration(labelText: 'Branch Code'), validator: (v)=> v==null||v.trim().isEmpty?'Required':null),
          const Spacer(),
          FilledButton(onPressed: _saving? null : _save, child: _saving? const SizedBox(height:18,width:18,child:CircularProgressIndicator(strokeWidth:2,color:Colors.white)) : const Text('Save')),
        ])),
      )),
    );
  }
}

