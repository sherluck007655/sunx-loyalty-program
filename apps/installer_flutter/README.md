SunX Installer Android App (Flutter)

Overview
- Modern Flutter Material 3 app for the Installer dashboard
- Uses the existing real backend API (Node/Express at http://localhost:5000/api)
- Mirrors the web features: Dashboard, Promotions, Payments, Serials (with scanner), Profile
- SunX branding with primary seed color #FF6B00

Run locally
1) Start backend API: npm run dev (port 5000)
2) From this folder: flutter pub get
3) Run on Android emulator/device: 
   - By default the API base is http://10.0.2.2:5000/api (Android emulator loopback)
   - Override at build time: flutter run --dart-define=API_BASE_URL=http://192.168.1.100:5000/api

Structure
- lib/src/core/api_client.dart: Dio client with token
- lib/src/services: calls to installer/profile/payments/serials/promotions endpoints
- lib/src/screens: pages using Material 3 and responsive cards

Notes
- Camera permission is required for QR scanning (mobile_scanner)
- Token is stored in SharedPreferences (auth_token)
- Add more screens easily via GoRouter branches

