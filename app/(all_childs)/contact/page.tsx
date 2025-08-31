"use client"
import React from 'react';
import { Card, CardBody, Input, Textarea, Button } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useState, ChangeEvent, FormEvent } from 'react';

// Add interface for form data
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Add interface for form errors
interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    let newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="space-y-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-large text-default-600 max-w-2xl mx-auto">
          Have a question or want to discuss a project? We're here to help. Reach out to us using the form below or through our contact information.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <CardBody>
            <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input 
                label="Name" 
                name="name"
                placeholder="Your name" 
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
              />
              <Input 
                label="Email" 
                name="email"
                placeholder="your.email@example.com" 
                type="email" 
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
              />
              <Input 
                label="Subject" 
                name="subject"
                placeholder="What's this about?" 
                value={formData.subject}
                onChange={handleChange}
                isInvalid={!!errors.subject}
                errorMessage={errors.subject}
              />
              <Textarea 
                label="Message" 
                name="message"
                placeholder="Tell us more about your project or inquiry" 
                minRows={4}
                value={formData.message}
                onChange={handleChange}
                isInvalid={!!errors.message}
                errorMessage={errors.message}
              />
              <Button color="primary" type="submit">Send Message</Button>
            </form>
          </CardBody>
        </Card>

        <Card className="p-6">
          <CardBody>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:map-pin" className="text-primary text-xl" />
                <p>Pakistan, Shahdera, Begum kot Lahore, Software House</p>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:phone" className="text-primary text-xl" />
                <p>+923083974789</p>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:mail" className="text-primary text-xl" />
                <p>workergulfam@gmail.com</p>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-2">Follow Us</h3>
              <div className="flex gap-4">
                <Icon icon="logos:facebook" className="text-2xl" />
                <Icon icon="logos:twitter" className="text-2xl" />
                <Icon icon="logos:linkedin-icon" className="text-2xl" />
                <Icon icon="logos:github-icon" className="text-2xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}