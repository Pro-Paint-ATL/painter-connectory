
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AboutUs = () => {
  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">About Pro Paint</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Pro Paint connects quality painters with customers looking for beautiful results in homes and businesses across the country. 
            Our platform makes it easy to find qualified painters, get accurate estimates, and ensure your painting project is completed to the highest standards.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Story</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Founded in 2021, Pro Paint began with a simple observation: finding quality painters was unnecessarily complicated. 
            Our founders, experienced in both construction and technology, created a platform to streamline the connection between painting professionals and customers.
          </p>
          <p className="text-muted-foreground">
            Today, we operate in over 20 major metropolitan areas, connecting thousands of painters with customers who need their services. 
            We're committed to quality, transparency, and customer satisfaction in every project.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Our Values</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Quality:</strong> We only partner with painters who meet our rigorous standards</li>
            <li><strong>Transparency:</strong> Clear pricing, no hidden fees</li>
            <li><strong>Reliability:</strong> Projects completed on time and within budget</li>
            <li><strong>Community:</strong> Supporting local painters and businesses</li>
            <li><strong>Innovation:</strong> Continuously improving our platform and services</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutUs;
