import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  ApiClient._();
  static final ApiClient I = ApiClient._();

  static const String _defaultBase = 'http://10.0.2.2:5000/api';
  static const String _prefKeyBase = 'api_base_url';

  final Dio _dio = Dio(BaseOptions(
    baseUrl: const String.fromEnvironment('API_BASE_URL', defaultValue: _defaultBase),
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Content-Type': 'application/json'},
  ));

  Future<void> _loadBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_prefKeyBase);
    if (saved != null && saved.isNotEmpty && _dio.options.baseUrl != saved) {
      _dio.options.baseUrl = saved;
    }
  }

  Future<void> setBaseUrl(String baseUrl) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefKeyBase, baseUrl);
    _dio.options.baseUrl = baseUrl;
  }

  Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_prefKeyBase) ?? _dio.options.baseUrl;
  }

  Future<Dio> dio() async {
    await _loadBaseUrl();
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    _dio.interceptors.clear();
    _dio.interceptors.add(InterceptorsWrapper(onRequest: (opt, handler) {
      if (token != null && token.isNotEmpty) {
        opt.headers['Authorization'] = 'Bearer $token';
      }
      handler.next(opt);
    }));
    return _dio;
  }
}
