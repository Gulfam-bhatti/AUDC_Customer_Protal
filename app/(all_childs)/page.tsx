"use client"
import React from 'react';
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import CustomNavbar from '@/components/custom-navbar';

const services = [
  { icon: "lucide:code", title: "Web Development", description: "Custom web applications tailored to your needs." },
  { icon: "lucide:smartphone", title: "Mobile Development", description: "iOS and Android apps to reach your mobile audience." },
  { icon: "lucide:database", title: "Backend Development", description: "Scalable and secure server-side solutions." },
  { icon: "lucide:cloud", title: "Cloud Services", description: "Cloud-native applications and infrastructure management." },
];

export default function App() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-6 py-16">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Engineering Excellence in Web & Software Development</h1>
          <p className="text-large text-default-600 max-w-2xl mx-auto">
            We craft cutting-edge digital solutions to empower your business in the modern world.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="p-4">
              <CardHeader className="flex gap-3">
                <Icon icon={service.icon} className="text-primary text-2xl" />
                <p className="text-md font-semibold">{service.title}</p>
              </CardHeader>
              <CardBody>
                <p className="text-default-600">{service.description}</p>
              </CardBody>
            </Card>
          ))}
        </section>

        <Divider className="my-8" />

        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Transform Your Digital Presence?</h2>
          <Button color="primary" size="lg" onClick={() => router.push("/contact")}>
            Contact Us Today
          </Button>
        </section>
      </main>
    </div>
  );
}