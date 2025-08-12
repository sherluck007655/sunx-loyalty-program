import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../services/installer_service.dart';

class AddSerialScreen extends StatefulWidget {
  const AddSerialScreen({super.key});

  @override
  State<AddSerialScreen> createState() => _AddSerialScreenState();
}

class _AddSerialScreenState extends State<AddSerialScreen> {
  final _formKey = GlobalKey<FormState>();
  final _serial = TextEditingController();
  final _date = TextEditingController();
  final _address = TextEditingController();
  final _city = TextEditingController();
  final _model = TextEditingController(text: 'SunX-5000');
  final _capacity = TextEditingController(text: '5000');
  final _notes = TextEditingController();

  bool _submitting = false;
  String? _error;
  String? _validateHint;

  @override
  void initState() {
    super.initState();
    _date.text = DateTime.now().toString().substring(0,10);
  }

  @override
  void dispose() {
    _serial.dispose(); _date.dispose(); _address.dispose(); _city.dispose(); _model.dispose(); _capacity.dispose(); _notes.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(context: context, firstDate: DateTime(now.year-1), lastDate: now, initialDate: now);
    if (picked != null) _date.text = picked.toIso8601String().substring(0,10);
    setState((){});
  }

  Future<void> _scan() async {
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
      _serial.text = code!.trim();
      await _validateSerial(code!);
      setState((){});
    }
  }

  Future<void> _validateSerial(String serial) async {
    try {
      final res = await InstallerService().validateSerial(serial);
      final isValid = (res['isValid'] ?? res['valid']) == true;
      final exists = (res['exists'] ?? false) == true;
      _validateHint = isValid ? (exists ? 'Already exists' : 'Valid') : 'Invalid format';
    } catch (e) {
      _validateHint = 'Could not validate';
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState((){ _submitting = true; _error = null; });
    try {
      final payload = {
        'serialNumber': _serial.text.trim().toUpperCase(),
        'installationDate': _date.text.trim(),
        'location': {'address': _address.text.trim().isEmpty ? 'Not specified' : _address.text.trim(), 'city': _city.text.trim().isEmpty ? 'Not specified' : _city.text.trim()},
        'inverterModel': _model.text.trim().isEmpty ? 'SunX-5000' : _model.text.trim(),
        'capacity': int.tryParse(_capacity.text.trim()) ?? 5000,
        'notes': _notes.text.trim(),
      };
      await InstallerService().addSerial(payload);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Serial added successfully')));
      Navigator.pop(context, true);
    } catch (e) {
      setState((){ _error = e.toString(); });
    } finally {
      if (mounted) setState((){ _submitting = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Add Serial Number')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Row(children:[
              Expanded(child: TextFormField(controller: _serial, decoration: InputDecoration(labelText: 'Serial Number', suffixIcon: _validateHint==null?null:Icon(_validateHint=='Valid'?Icons.check_circle:Icons.error, color: _validateHint=='Valid'?Colors.green:null)), onChanged: (v){ _validateHint=null; }, validator: (v)=> (v==null || v.trim().isEmpty)?'Required':null)),
              const SizedBox(width: 8),
              IconButton.filled(onPressed: _scan, icon: const Icon(Icons.qr_code_scanner))
            ]),
            if (_validateHint!=null) Padding(padding: const EdgeInsets.only(top:8), child: Text(_validateHint!, style: TextStyle(color: _validateHint=='Valid'?Colors.green:Theme.of(context).colorScheme.error)) ),
            const SizedBox(height: 12),
            Row(children:[
              Expanded(child: TextFormField(controller: _date, decoration: const InputDecoration(labelText: 'Installation Date'), readOnly: true, onTap: _pickDate)),
              const SizedBox(width: 8),
              Expanded(child: TextFormField(controller: _capacity, decoration: const InputDecoration(labelText: 'Capacity (W)'), keyboardType: TextInputType.number))
            ]),
            const SizedBox(height: 12),
            TextFormField(controller: _model, decoration: const InputDecoration(labelText: 'Inverter Model')),
            const SizedBox(height: 12),
            TextFormField(controller: _address, decoration: const InputDecoration(labelText: 'Address')),
            const SizedBox(height: 12),
            TextFormField(controller: _city, decoration: const InputDecoration(labelText: 'City')),
            const SizedBox(height: 12),
            TextFormField(controller: _notes, decoration: const InputDecoration(labelText: 'Notes'), maxLines: 3),
            const SizedBox(height: 20),
            if (_error!=null) Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            const SizedBox(height: 8),
            FilledButton.icon(onPressed: _submitting? null : () async { if (_serial.text.isNotEmpty) await _validateSerial(_serial.text); await _submit(); }, icon: _submitting? const SizedBox(height:18,width:18,child:CircularProgressIndicator(strokeWidth:2,color:Colors.white)) : const Icon(Icons.save), label: const Text('Add Serial')),
          ]),
        ),
      ),
    );
  }
}

