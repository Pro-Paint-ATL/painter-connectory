
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

const pressReleases = [
  {
    title: "Pro Paint Expands to Ten New Markets",
    date: "June 15, 2023",
    excerpt: "Pro Paint announces expansion to ten new metropolitan areas, bringing its painter marketplace to a total of 30 markets nationwide.",
    link: "#"
  },
  {
    title: "Pro Paint Raises $12M Series A Funding",
    date: "February 8, 2023",
    excerpt: "Pro Paint secures $12 million in Series A funding to enhance platform features and accelerate market expansion.",
    link: "#"
  },
  {
    title: "Pro Paint Launches Mobile App for Painters",
    date: "November 22, 2022",
    excerpt: "New mobile application helps painting professionals manage jobs, schedules, and client communications from anywhere.",
    link: "#"
  },
  {
    title: "Pro Paint Partners with National Paint Supplier",
    date: "September 5, 2022",
    excerpt: "Strategic partnership with leading paint manufacturer offers exclusive discounts to Pro Paint network members.",
    link: "#"
  }
];

const mediaFeatures = [
  {
    outlet: "TechCrunch",
    title: "How Pro Paint is Disrupting the Home Service Industry",
    date: "April 2023",
    link: "#"
  },
  {
    outlet: "Forbes",
    title: "Pro Paint Named in Top 50 Startups to Watch",
    date: "March 2023",
    link: "#"
  },
  {
    outlet: "Home Improvement Weekly",
    title: "Digital Transformation in Painting Services",
    date: "January 2023",
    link: "#"
  }
];

const Press = () => {
  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Press Center</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find the latest news, press releases, and media resources about Pro Paint.
        </p>
      </div>
      
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Press Releases</h2>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Press Kit
          </Button>
        </div>
        
        <div className="space-y-6">
          {pressReleases.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{item.title}</CardTitle>
                  <span className="text-sm text-muted-foreground">{item.date}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.excerpt}</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="p-0" asChild>
                  <a href={item.link}>
                    Read Full Release <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-6">Media Coverage</h2>
        <Card>
          <CardContent className="p-6">
            <ul className="divide-y">
              {mediaFeatures.map((item, index) => (
                <li key={index} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.outlet} • {item.date}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-4" asChild>
                      <a href={item.link}>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Media Inquiries</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-4">
              For press inquiries, interview requests, or additional information, please contact our media relations team:
            </p>
            <p className="font-medium">press@propaint.com</p>
            <p className="text-muted-foreground">+1 (800) 555-0123</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Press;
