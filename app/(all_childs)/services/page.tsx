"use client"
import React from 'react';
import { Card, CardBody, CardHeader, Image } from "@heroui/react";
import { Icon } from '@iconify/react';

const services = [
  {
    icon: "lucide:code",
    title: "Web Development",
    description: "We create responsive, user-friendly web applications using the latest technologies and frameworks.",
    image: "https://img.heroui.chat/image/ai?w=800&h=400&u=web-dev"
  },
  {
    icon: "lucide:smartphone",
    title: "Mobile Development",
    description: "Our team builds native and cross-platform mobile apps for iOS and Android devices.",
    image: "https://img.heroui.chat/image/ai?w=800&h=400&u=mobile-dev"
  },
  {
    icon: "lucide:database",
    title: "Backend Development",
    description: "We design and implement robust, scalable backend systems to power your applications.",
    image: "https://img.heroui.chat/image/ai?w=800&h=400&u=backend-dev"
  },
  {
    icon: "lucide:cloud",
    title: "Cloud Services",
    description: "Our cloud experts help you leverage the full potential of cloud platforms for your business.",
    image: "https://img.heroui.chat/image/ai?w=800&h=400&u=cloud-services"
  }
];

export default function Services() {
  return (
    <div className="space-y-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4">Our Services</h1>
        <p className="text-large text-default-600 max-w-2xl mx-auto">
          Discover how our comprehensive range of services can elevate your digital presence and drive your business forward.
        </p>
      </section>

      {services.map((service, index) => (
        <Card key={index} className="p-4">
          <CardHeader className="flex gap-3 pb-4">
            <Icon icon={service.icon} className="text-primary text-3xl" />
            <h2 className="text-2xl font-semibold">{service.title}</h2>
          </CardHeader>
          <CardBody className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <p className="text-default-600 mb-4">{service.description}</p>
            </div>
            <div className="md:w-1/2">
              <Image
                src={service.image}
                alt={service.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}