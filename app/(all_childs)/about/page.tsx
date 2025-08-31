"use client"
import React from 'react';
import { Card, CardBody, Image } from "@heroui/react";

export default function About() {
  return (
    <div className="space-y-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4">About TechCraft Solutions</h1>
        <p className="text-large text-default-600 max-w-2xl mx-auto">
          We are a team of passionate engineers and developers dedicated to crafting innovative digital solutions.
        </p>
      </section>

      <Card className="p-6">
        <CardBody className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-default-600 mb-4">
              At TechCraft Solutions, we strive to empower businesses through cutting-edge technology. Our mission is to deliver high-quality, scalable, and innovative software solutions that drive growth and efficiency for our clients.
            </p>
            <p className="text-default-600">
              With a team of experienced professionals and a commitment to staying at the forefront of technological advancements, we're dedicated to turning your digital visions into reality.
            </p>
          </div>
          <div className="md:w-1/2">
            <Image
              src="https://img.heroui.chat/image/ai?w=800&h=600&u=tech-team"
              alt="TechCraft Solutions Team"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        </CardBody>
      </Card>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-center">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Innovation", description: "We constantly explore new technologies and methodologies to provide cutting-edge solutions." },
            { title: "Quality", description: "We are committed to delivering high-quality, robust, and scalable software products." },
            { title: "Client-Centric", description: "Our clients' success is our priority. We work closely with them to understand and meet their unique needs." }
          ].map((value, index) => (
            <Card key={index} className="p-4">
              <CardBody>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-default-600">{value.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}