import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'routing.dart';

class SunXApp extends StatelessWidget {
  const SunXApp({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme =
        ColorScheme.fromSeed(seedColor: const Color(0xFFFF831F));
    final theme = ThemeData(
      colorScheme: colorScheme,
      useMaterial3: true,
      textTheme: GoogleFonts.interTextTheme(),
      appBarTheme: const AppBarTheme(centerTitle: true),
      inputDecorationTheme: const InputDecorationTheme(
        border: OutlineInputBorder(),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        shape: StadiumBorder(),
      ),
    );

    return MaterialApp.router(
      title: 'SunX Installer',
      debugShowCheckedModeBanner: false,
      theme: theme,
      routerConfig: router,
    );
  }
}
