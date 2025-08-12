import '../core/api_client.dart';

class InstallerService {
  Future<Map<String, dynamic>> getDashboard() async {
    final dio = await ApiClient.I.dio();
    final res = await dio.get('/installer/dashboard');
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }

  // Profile
  Future<Map<String, dynamic>> getProfile() async {
    final dio = await ApiClient.I.dio();
    final res = await dio.get('/installer/profile');
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }
  Future<Map<String, dynamic>> updateProfile(Map<String,dynamic> body) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.put('/installer/profile', data: body);
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }
  Future<Map<String, dynamic>> updatePaymentProfile(Map<String,dynamic> body) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.put('/installer/payment-profile', data: body);
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }
  Future<Map<String, dynamic>> changePassword({required String currentPassword, required String newPassword}) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.put('/installer/password', data: { 'currentPassword': currentPassword, 'newPassword': newPassword });
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }

  // Payments
  Future<Map<String, dynamic>> getPaymentHistory({int page = 1, int limit = 10, String status = ''}) async {
    final dio = await ApiClient.I.dio();
    final params = {
      'page': page,
      'limit': limit,
      if (status.isNotEmpty) 'status': status,
    };
    final res = await dio.get('/payment/history', queryParameters: params);
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }

  Future<Map<String, dynamic>> getInstallerPayments({int page = 1, int limit = 10}) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.get('/installer/payments', queryParameters: {
      'page': page,
      'limit': limit,
    });
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }

  Future<Map<String, dynamic>> getPaymentStats() async {
    final dio = await ApiClient.I.dio();
    final res = await dio.get('/installer/payment/stats');
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }

  Future<Map<String, dynamic>> requestPayment(Map<String, dynamic> data) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.post('/payment/request', data: data);
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }
  Future<Map<String, dynamic>> getPayment(String id) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.get('/payment/$id');
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }
  Future<Map<String, dynamic>> addPaymentComment(String id, String message) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.post('/payment/$id/comments', data: {'message': message});
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }

  // Serials
  Future<Map<String, dynamic>> addSerial(Map<String, dynamic> serial) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.post('/serial/add', data: serial);
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }

  Future<Map<String, dynamic>> getSerials({int page = 1, int limit = 10, String search = ''}) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.get('/installer/serials', queryParameters: {
      'page': page,
      'limit': limit,
      if (search.isNotEmpty) 'search': search,
    });
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }

  Future<Map<String, dynamic>> checkSerial(String serialNumber) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.get('/serial/check/$serialNumber');
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }

  Future<Map<String, dynamic>> validateSerial(String serialNumber) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.get('/serial/validate/$serialNumber');
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }

  // Promotions
  Future<Map<String, dynamic>> getActivePromotions() async {
    final dio = await ApiClient.I.dio();
    final res = await dio.get('/installer/promotions/active');
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }
  Future<Map<String, dynamic>> getPromotionStats() async {
    final dio = await ApiClient.I.dio();
    final res = await dio.get('/installer/promotions/stats');
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }
  Future<Map<String, dynamic>> getPromotion(String id) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.get('/installer/promotions/$id');
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }
  Future<Map<String, dynamic>> getPromotionHistory() async {
    final dio = await ApiClient.I.dio();
    final res = await dio.get('/installer/promotions/history');
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }
  Future<Map<String, dynamic>> joinPromotion(String id) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.post('/installer/promotions/$id/join');
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }

  // Notifications
  Future<Map<String, dynamic>> getNotifications({int page = 1, int limit = 20}) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.get('/installer/notifications', queryParameters: {'page': page, 'limit': limit});
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }
  Future<Map<String, dynamic>> markNotificationRead(String id) async {
    final dio = await ApiClient.I.dio();
    final res = await dio.put('/installer/notifications/$id/read');
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }
  Future<Map<String, dynamic>> markAllNotificationsRead() async {
    final dio = await ApiClient.I.dio();
    final res = await dio.put('/installer/notifications/read-all');
    return Map<String, dynamic>.from(res.data['data'] ?? res.data);
  }
}
