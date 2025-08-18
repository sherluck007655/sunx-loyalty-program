import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SunIcon, 
  BoltIcon, 
  GiftIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const features = [
    {
      icon: BoltIcon,
      title: 'Track Installations',
      description: 'Submit inverter serial numbers and track your installation progress in real-time.'
    },
    {
      icon: GiftIcon,
      title: 'Earn Rewards',
      description: 'Get points for every installation and unlock exclusive promotions and bonuses.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Get Paid',
      description: 'Receive payments for reaching milestones and completing promotional targets.'
    },
    {
      icon: ChartBarIcon,
      title: 'Monitor Progress',
      description: 'View detailed analytics and progress tracking for all your installations.'
    }
  ];



  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary flex-shrink-0">
                <SunIcon className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                <span className="hidden sm:inline">SunX Loyalty Program</span>
                <span className="sm:hidden">SunX</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Toggle theme"
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-gray-800" />
                )}
              </button>
              <Link
                to="/login"
                className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Join</span>
              </Link>
              <Link
                to="/admin/login"
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Admin Login"
              >
                <span className="hidden sm:inline">Admin</span>
                <span className="sm:hidden">👤</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              Rewarding Solar
              <span className="text-gradient-primary block sm:inline"> Installers</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Join the SunX Loyalty Program and earn rewards for every solar inverter installation.
              Track your progress, unlock bonuses, and get paid for your hard work.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto px-4">
              <Link
                to="/register"
                className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto text-center touch-manipulation"
              >
                Join Now
              </Link>
              <Link
                to="/login"
                className="btn-outline text-base sm:text-lg px-6 sm:px-8 py-3 w-full sm:w-auto text-center touch-manipulation"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and incentives you need 
              to maximize your earnings as a solar installer.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg gradient-primary mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get started in just a few simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-500 text-white font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Sign Up
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create your account and get your unique loyalty card ID
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-500 text-white font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Install & Submit
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Submit inverter serial numbers after each installation
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-500 text-white font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Earn Rewards
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Reach milestones and get paid for your achievements
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of installers who are already earning rewards with SunX
          </p>
          <Link
            to="/register"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-6 sm:px-8 rounded-lg transition-colors duration-200 text-base sm:text-lg w-full sm:w-auto max-w-xs sm:max-w-none mx-auto touch-manipulation inline-flex items-center justify-center"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-dark-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <SunIcon className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold">SunX</span>
            </div>
            <div className="text-gray-400">
              © 2025 SunX. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
