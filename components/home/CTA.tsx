"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";

export default function CTA() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({ name: "", email: "", company: "", message: "" });
    alert("Thank you for your interest! We'll get back to you soon.");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section
      id="cta"
      className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Join thousands of organizations already using our AUDC platform to
            collect, analyze, and act on their data with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Request a Demo
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-white/10 border-white/20 text-white placeholder-white/70 focus:border-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-white/10 border-white/20 text-white placeholder-white/70 focus:border-blue-400"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Input
                    name="company"
                    placeholder="Company Name"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/20 text-white placeholder-white/70 focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <Textarea
                    name="message"
                    placeholder="Tell us about your data collection needs..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/20 text-white placeholder-white/70 focus:border-blue-400 min-h-[120px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Send Message
                  <Send className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Get in Touch
              </h3>
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                Our team of experts is ready to help you implement the perfect
                data collection solution for your organization. Contact us today
                to learn more about our multi-tenant AUDC platform.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Email Us</div>
                  <div className="text-blue-200">contact@audc-platform.com</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Call Us</div>
                  <div className="text-blue-200">+1 (555) 123-AUDC</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Visit Us</div>
                  <div className="text-blue-200">San Francisco, CA</div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Button className="w-full cursor-pointer bg-white text-blue-900 hover:bg-gray-100 font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                Schedule a Call
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">
              Start Your Free Trial Today
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Experience the power of our multi-tenant AUDC platform with a
              30-day free trial. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 cursor-pointer to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 font-semibold rounded-lg"
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                className="border-white/30 text-white cursor-pointer px-8 py-3 font-semibold rounded-lg"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
