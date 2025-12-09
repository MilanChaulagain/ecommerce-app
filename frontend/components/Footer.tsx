'use client';

import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="ml-2 text-2xl font-bold text-white">Heramba</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted destination for quality products at amazing prices. Shop with confidence and style.
            </p>
            <div className="flex space-x-3 pt-2">
              <a
                href="#"
                className="p-2.5 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2.5 bg-gray-800 hover:bg-pink-600 rounded-lg transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2.5 bg-gray-800 hover:bg-blue-400 rounded-lg transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2.5 bg-gray-800 hover:bg-red-600 rounded-lg transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {['About Us', 'Shop', 'Blog', 'Contact Us', 'FAQ', 'Careers'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-blue-600 mr-0 group-hover:mr-2 transition-all"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-3">
              {[
                'Track Order',
                'Returns & Exchanges',
                'Shipping Info',
                'Privacy Policy',
                'Terms & Conditions',
                'Size Guide'
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-purple-600 mr-0 group-hover:mr-2 transition-all"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  123 Commerce Street<br />
                  New York, NY 10001<br />
                  United States
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-gray-400 hover:text-white transition-colors text-sm">
                  +1 (234) 567-8900
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                <a href="mailto:support@heramba.com" className="text-gray-400 hover:text-white transition-colors text-sm">
                  support@heramba.com
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-white font-semibold text-sm mb-3">Newsletter</h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-sm text-white placeholder-gray-500"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all text-sm whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Heramba eCommerce. All rights reserved.
            </p>
            
            {/* Payment Methods */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 text-xs">We Accept:</span>
              <div className="flex space-x-2">
                {['💳', '💰', '💵', '🏧'].map((icon, index) => (
                  <div
                    key={index}
                    className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-sm hover:bg-gray-700 transition-colors"
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
