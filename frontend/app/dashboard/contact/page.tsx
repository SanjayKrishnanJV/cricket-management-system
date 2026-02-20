'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { contactAPI } from '@/lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contactAPI.submitForm(formData);
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl">📧</span>
          Contact Us
        </h1>
        <p className="text-gray-600 mt-2">
          Get in touch with us for support or inquiries
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Contact Form */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl">📝 Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Your message..."
                />
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="text-2xl">💬 Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📧</div>
                <div>
                  <h3 className="font-bold">Email</h3>
                  <p className="text-gray-600">support@cricketmanager.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">🌐</div>
                <div>
                  <h3 className="font-bold">Website</h3>
                  <p className="text-gray-600">www.cricketmanager.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">🐙</div>
                <div>
                  <h3 className="font-bold">GitHub</h3>
                  <p className="text-gray-600">github.com/cricket-manager</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-2xl">💬</div>
                <div>
                  <h3 className="font-bold">Discord</h3>
                  <p className="text-gray-600">Join our community</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-2xl">❓ Frequently Asked</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-bold">How do I start a live match?</h3>
                <p className="text-sm text-gray-600">
                  Go to Live Match section and select a scheduled match to begin
                </p>
              </div>
              <div>
                <h3 className="font-bold">How to create a tournament?</h3>
                <p className="text-sm text-gray-600">
                  Navigate to Tournaments and click "Create Tournament"
                </p>
              </div>
              <div>
                <h3 className="font-bold">How does the auction work?</h3>
                <p className="text-sm text-gray-600">
                  Create an auction, set budgets, and invite bidders to participate
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">⏰ Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We typically respond within <span className="font-bold text-blue-600">24 hours</span> on business days.
                For urgent matters, please mention "URGENT" in your subject line.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
