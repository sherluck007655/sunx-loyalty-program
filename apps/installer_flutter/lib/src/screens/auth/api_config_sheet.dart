import 'package:flutter/material.dart';
import '../../core/api_client.dart';

class ApiConfigSheet extends StatefulWidget {
  const ApiConfigSheet({super.key});

  @override
  State<ApiConfigSheet> createState() => _ApiConfigSheetState();
}

class _ApiConfigSheetState extends State<ApiConfigSheet> {
  final _controller = TextEditingController();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    ApiClient.I.getBaseUrl().then((v) { if(mounted) _controller.text = v; });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('API Base URL', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          TextField(
            controller: _controller,
            decoration: const InputDecoration(hintText: 'http://10.0.2.2:5000/api'),
            keyboardType: TextInputType.url,
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: _saving? null : () async {
              setState(()=>_saving=true);
              await ApiClient.I.setBaseUrl(_controller.text.trim());
              if (context.mounted) Navigator.pop(context, true);
            },
            child: _saving ? const SizedBox(height:20,width:20,child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Save'),
          )
        ],
      ),
    );
  }
}

