import React from "react";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy = () => {
  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground text-center mb-8">Last Updated: June 1, 2023</p>
      
      <div className="prose prose-sm max-w-none text-muted-foreground">
        <section className="mb-8">
          <p className="mb-4">
            At Pro Paint, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you use our website, mobile application, and services (collectively, the "Services").
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using our Services, you acknowledge that you have read, 
            understood, and agreed to be bound by this Privacy Policy.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="mb-4">We may collect the following types of information:</p>
          
          <h3 className="text-xl font-medium mt-4 mb-2">Personal Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name, email address, phone number, and mailing address</li>
            <li>Billing information and payment details</li>
            <li>User preferences and account settings</li>
            <li>For painters: professional credentials, business information, and portfolio</li>
          </ul>
          
          <h3 className="text-xl font-medium mt-4 mb-2">Usage Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Log data (IP address, browser type, pages visited, time spent)</li>
            <li>Device information (operating system, unique device identifiers)</li>
            <li>Location information (with your consent)</li>
            <li>Communication data between users and painters</li>
          </ul>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="mb-4">We use your information for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our Services</li>
            <li>Process transactions and send related information</li>
            <li>Match customers with appropriate painters</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Send notifications, updates, and promotional messages</li>
            <li>Monitor and analyze usage patterns and trends</li>
            <li>Detect, investigate, and prevent fraudulent or unauthorized activities</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">3. Information Sharing and Disclosure</h2>
          <p className="mb-4">We may share your information in the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>With painters or customers when you use our Services to connect with them</li>
            <li>With service providers who perform services on our behalf</li>
            <li>In response to legal process or when required by law</li>
            <li>In connection with a merger, sale, or acquisition of our business</li>
            <li>With your consent or at your direction</li>
          </ul>
          <p className="mt-4">
            We do not sell your personal information to third parties for marketing purposes.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
          <p>
            We implement reasonable security measures to protect your information from unauthorized access, 
            alteration, disclosure, or destruction. However, no data transmission over the Internet or 
            electronic storage system can be guaranteed to be 100% secure. We cannot ensure or warrant the 
            security of any information you transmit to us.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">5. Your Rights and Choices</h2>
          <p className="mb-4">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Accessing, correcting, or deleting your personal information</li>
            <li>Withdrawing consent where processing is based on consent</li>
            <li>Requesting restriction of processing or objecting to processing</li>
            <li>Data portability</li>
            <li>Opting out of marketing communications</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us using the information provided in the "Contact Us" section.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy or our privacy practices, 
            please contact us at support@propaintatl.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
