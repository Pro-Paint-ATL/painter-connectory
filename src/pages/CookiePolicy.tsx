
import React from "react";
import { Separator } from "@/components/ui/separator";

const CookiePolicy = () => {
  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">Cookie Policy</h1>
      <p className="text-muted-foreground text-center mb-8">Last Updated: June 1, 2023</p>
      
      <div className="prose prose-sm max-w-none text-muted-foreground">
        <section className="mb-8">
          <p className="mb-4">
            This Cookie Policy explains how Pro Paint ("we", "us", or "our") uses cookies and similar technologies 
            on our website and mobile applications (collectively, the "Services"). This policy is part of our 
            Privacy Policy and explains what cookies are, how we use them, and what choices you have regarding their use.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">1. What Are Cookies?</h2>
          <p className="mb-4">
            Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit 
            websites. They are widely used to make websites work more efficiently, provide a better user experience, 
            and provide information to the owners of the site. Cookies may be "persistent" cookies that remain on your 
            device until they expire or are deleted, or "session" cookies that are deleted when you close your browser.
          </p>
          <p>
            In addition to cookies, we may use web beacons, pixels, and other similar technologies. These technologies 
            collect information similar to cookies and are used for similar purposes.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">2. Types of Cookies We Use</h2>
          <p className="mb-4">We use the following types of cookies:</p>
          
          <h3 className="text-xl font-medium mt-4 mb-2">Essential Cookies</h3>
          <p className="mb-4">
            These cookies are necessary for the Services to function properly. They enable basic functions like page 
            navigation, secure areas, and remember your preferences. These cookies do not collect personal information 
            and cannot be disabled.
          </p>
          
          <h3 className="text-xl font-medium mt-4 mb-2">Performance Cookies</h3>
          <p className="mb-4">
            These cookies collect information about how visitors use our Services, such as which pages they visit most 
            often and if they receive error messages. These cookies don't collect information that identifies a visitor; 
            they are used to improve how the Services work.
          </p>
          
          <h3 className="text-xl font-medium mt-4 mb-2">Functionality Cookies</h3>
          <p className="mb-4">
            These cookies allow the Services to remember choices you make and provide enhanced, personalized features. 
            They may be set by us or by third-party providers whose services we have added to our pages.
          </p>
          
          <h3 className="text-xl font-medium mt-4 mb-2">Targeting/Advertising Cookies</h3>
          <p>
            These cookies are used to deliver advertisements more relevant to you and your interests. They are also used 
            to limit the number of times you see an advertisement and help measure the effectiveness of advertising campaigns. 
            They are usually placed by advertising networks with our permission.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">3. Third-Party Cookies</h2>
          <p className="mb-4">
            Some cookies are placed by third parties on our Services. These third parties may include analytics providers, 
            advertising networks, and social media platforms. These third parties may use cookies, web beacons, and similar 
            technologies to collect information about your use of our Services and other websites.
          </p>
          <p>
            We do not control these third parties or their use of cookies. Please consult the privacy policies of these 
            third parties for information about their cookies and how they use your information.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">4. Your Cookie Choices</h2>
          <p className="mb-4">
            You can control and manage cookies in various ways. Most web browsers allow you to manage your cookie preferences. 
            You can:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Delete cookies from your device</li>
            <li>Block cookies by activating the setting on your browser that allows you to refuse all or some cookies</li>
            <li>Set your browser to notify you when you receive a cookie</li>
          </ul>
          <p className="mt-4">
            Please note that if you choose to disable cookies, some features of our Services may not function properly.
          </p>
        </section>
        
        <Separator className="my-6" />
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Changes to This Cookie Policy</h2>
          <p className="mb-4">
            We may update this Cookie Policy from time to time. When we do, we will post the revised policy on this page 
            and update the "Last Updated" date at the top of this page.
          </p>
          <p>
            If you have questions about this Cookie Policy, please contact us at privacy@propaint.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicy;
