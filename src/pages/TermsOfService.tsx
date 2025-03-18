
import React from "react";
import { Separator } from "@/components/ui/separator";

const TermsOfService = () => {
  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">Terms of Service</h1>
      <p className="text-muted-foreground text-center mb-8">Last Updated: June 1, 2023</p>
      
      <div className="prose prose-sm max-w-none text-muted-foreground">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">1. Agreement to Terms</h2>
          <p>
            By accessing or using the Pro Paint platform, including our website, mobile applications, and services
            (collectively, the "Services"), you agree to be bound by these Terms of Service. If you do not agree to these
            terms, you may not access or use the Services.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">2. Description of Services</h2>
          <p className="mb-4">
            Pro Paint provides a platform connecting customers with painting professionals. Our Services include but are not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Enabling customers to search for and communicate with painting professionals</li>
            <li>Providing tools for estimating project costs</li>
            <li>Facilitating booking and payment for painting services</li>
            <li>Offering a platform for painters to market their services</li>
          </ul>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
          <p className="mb-4">
            To access certain features of the Services, you must register for an account. When registering, you agree to provide accurate
            and complete information. You are responsible for maintaining the confidentiality of your account credentials and
            for all activities that occur under your account.
          </p>
          <p>
            Pro Paint reserves the right to suspend or terminate accounts that violate these Terms, provide false information,
            or engage in unauthorized activities.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">4. Painter Listings and Reviews</h2>
          <p className="mb-4">
            Painters who register on our platform may create profiles and receive reviews from customers. Pro Paint does not guarantee
            the accuracy of information provided by painters or the quality of their services.
          </p>
          <p>
            Reviews must be honest and based on actual experiences. Pro Paint reserves the right to remove reviews that are fraudulent,
            abusive, or violate these Terms.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">5. Bookings and Payments</h2>
          <p className="mb-4">
            Pro Paint facilitates bookings between customers and painters. When you book a service through our platform, you enter
            into an agreement directly with the painter, not with Pro Paint. We are not responsible for the quality, safety, or
            legality of services provided.
          </p>
          <p>
            Payments processed through our platform are subject to our Payment Terms, which are incorporated into these Terms of Service.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">6. Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by applicable law, Pro Paint and its officers, directors, employees, and agents shall not
            be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss
            of profits, data, or goodwill, arising from or in connection with these Terms or the use of the Services.
          </p>
          <p>
            In no event shall our total liability to you for all claims exceed the amount paid by you to Pro Paint in the twelve (12)
            months preceding the event giving rise to the liability.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">7. Modifications to Terms</h2>
          <p>
            Pro Paint may modify these Terms at any time by posting the revised terms on our website. Your continued use of the Services
            after such changes constitutes your acceptance of the modified Terms.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Contact Information</h2>
          <p>
            If you have questions about these Terms, please contact us at legal@propaint.com or by mail at Pro Paint Legal Department,
            123 Main Street, Suite 456, Miami, FL 33101.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
