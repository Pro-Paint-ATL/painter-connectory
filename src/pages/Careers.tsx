
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Users, Code, Paintbrush, HeartHandshake } from "lucide-react";

const jobOpenings = [
  {
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Remote (US)",
    description: "Join our engineering team to build and maintain our platform connecting painters with customers.",
    icon: <Code className="h-8 w-8 text-primary" />
  },
  {
    title: "Painter Relations Manager",
    department: "Operations",
    location: "New York, NY",
    description: "Manage relationships with our painter network, ensuring quality service delivery.",
    icon: <Paintbrush className="h-8 w-8 text-primary" />
  },
  {
    title: "Customer Success Specialist",
    department: "Customer Service",
    location: "Miami, FL",
    description: "Help customers navigate our platform and ensure successful project completion.",
    icon: <HeartHandshake className="h-8 w-8 text-primary" />
  },
  {
    title: "Regional Sales Manager",
    department: "Sales",
    location: "Chicago, IL",
    description: "Grow our painter network in the Midwest region through outreach and partnerships.",
    icon: <Building className="h-8 w-8 text-primary" />
  },
  {
    title: "HR Coordinator",
    department: "Human Resources",
    location: "Atlanta, GA",
    description: "Support our growing team with recruitment, onboarding, and employee experience.",
    icon: <Users className="h-8 w-8 text-primary" />
  }
];

const Careers = () => {
  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          At Pro Paint, we're building the future of home improvement services. 
          Join our team and help connect quality painters with customers across the country.
        </p>
      </div>
      
      <h2 className="text-2xl font-semibold mb-6">Current Openings</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {jobOpenings.map((job, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start space-y-0 gap-4 pb-2">
              {job.icon}
              <div>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription className="pt-1">
                  {job.department} • {job.location}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{job.description}</p>
              <Button variant="outline" size="sm">View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Why Work With Us</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Competitive salary and benefits</li>
            <li>Flexible work arrangements</li>
            <li>Professional development opportunities</li>
            <li>Collaborative and inclusive work environment</li>
            <li>Make a real impact in the home improvement industry</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Careers;
