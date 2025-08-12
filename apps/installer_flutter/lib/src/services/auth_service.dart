import 'package:shared_preferences/shared_preferences.dart';
import '../core/api_client.dart';

class AuthService {
  Future<Map<String, dynamic>> login(String emailOrPhone, String password) async {
    final dio = await ApiClient.I.dio();
    try {
      final res = await dio.post('/auth/installer/login', data: {
        'emailOrPhone': emailOrPhone,
        'password': password,
      });
      final body = (res.data is Map<String, dynamic>)
          ? Map<String, dynamic>.from(res.data)
          : <String, dynamic>{};
      final data = (body['data'] is Map<String, dynamic>)
          ? Map<String, dynamic>.from(body['data'])
          : <String, dynamic>{};
      final token = (data['token'] ?? body['token'])?.toString();
      final installer = data['installer'];

      final prefs = await SharedPreferences.getInstance();
      if (token != null && token.isNotEmpty) {
        await prefs.setString('auth_token', token);
      }
      if (installer != null) {
        await prefs.setString('user', installer.toString());
      }
      return body;
    } on Exception catch (e) {
      // Rethrow with cleaner message so UI shows a nice error rather than a red error widget
      throw Exception('Login failed: ${e.toString()}');
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user');
  }
}

