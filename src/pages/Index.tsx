
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  PaintBucket,
  Calculator,
  Search,
  Star,
  Shield,
  Clock,
  DollarSign,
  CalendarDays,
} from "lucide-react";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center text-center p-6 rounded-lg glass hover:shadow-xl transition-all duration-300"
  >
    <div className="p-3 rounded-full bg-primary/10 mb-4">{icon}</div>
    <h3 className="text-xl font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

const TestimonialCard = ({ quote, author, role }: { quote: string; author: string; role: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="p-6 rounded-lg glass flex flex-col"
  >
    <div className="mb-4 flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className="h-4 w-4 fill-primary text-primary" />
      ))}
    </div>
    <p className="italic mb-6 text-muted-foreground">"{quote}"</p>
    <div className="mt-auto">
      <p className="font-medium">{author}</p>
      <p className="text-sm text-muted-foreground">{role}</p>
    </div>
  </motion.div>
);

const Index = () => {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState("/lovable-uploads/c5bc4b6f-5600-448b-bd75-e1cb336175db.png");

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const addLetterShadow = (text: string) => {
    return text.split(/(\s+)/).map((part, partIndex) => {
      if (/^\s+$/.test(part)) {
        return <span key={`space-${partIndex}`}>{part}</span>;
      }
      
      return (
        <React.Fragment key={`word-${partIndex}`}>
          {part.split('').map((letter, letterIndex) => (
            <span 
              key={`letter-${partIndex}-${letterIndex}`} 
              className="inline-block" 
              style={{ textShadow: '1px 1px 1px #0EA5E9' }}
            >
              {letter}
            </span>
          ))}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/70 mix-blend-overlay -z-10" />
        <div className="absolute inset-0 -z-20">
          <img 
            src="/lovable-uploads/f4b62cc6-109b-4647-b004-0ebc8236d06d.png" 
            alt="Professional painters in white uniforms working" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white"
            >
              Find the Perfect Painter for Your Project
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl text-white/90 mb-8 max-w-2xl mx-auto whitespace-pre-line"
            >
              {addLetterShadow("Connect with skilled painters in your area and get accurate \nestimates for your painting projects.")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                className="w-full sm:w-auto gap-2"
                onClick={() => handleNavigate("/find-painters")}
              >
                <Search className="h-4 w-4" />
                Find Painters
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto gap-2 bg-white/20 hover:bg-white/30 border-white/40 text-black"
                onClick={() => handleNavigate("/calculator")}
              >
                <Calculator className="h-4 w-4" />
                Calculate Estimate
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How ProPaint Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple process to connect you with the best local painters
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calculator className="h-6 w-6 text-primary" />}
              title="Get an Estimate"
              description="Use our calculator to get a preliminary estimate for your painting project."
            />
            <FeatureCard
              icon={<Search className="h-6 w-6 text-primary" />}
              title="Find Local Painters"
              description="Browse painters near you and compare ratings, experience, and services."
            />
            <FeatureCard
              icon={<CalendarDays className="h-6 w-6 text-primary" />}
              title="Book and Confirm"
              description="Schedule your project and connect directly through our platform."
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/20">
        <div className="container px-4 mx-auto">
          <div className="mb-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col items-center md:items-center">
                <img 
                  src={logoUrl}
                  alt="Pro Paint Logo"
                  className="w-[240px] h-[240px] mb-8 object-contain"
                />
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Quality Results From Expert Painters</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our network of professional painters delivers outstanding results for every project. From residential touch-ups to commercial overhauls, we connect you with skilled professionals.
                </p>
                <Button 
                  size="lg"
                  onClick={() => handleNavigate("/find-painters")}
                >
                  Find Your Painter
                </Button>
              </div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="rounded-xl overflow-hidden shadow-xl"
              >
                <img 
                  src="/lovable-uploads/bdd722ac-9f89-47c1-b465-bc989b51d903.png" 
                  alt="Painting preparation with ladder and purple trim" 
                  className="w-full h-auto"
                />
              </motion.div>
            </div>
          </div>

          <div className="text-center mb-16 mt-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Pro Paint</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Benefits for both customers and professional painters
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-primary" />}
              title="Verified Professionals"
              description="All painters are verified and must provide proof of insurance and credentials."
            />
            <FeatureCard
              icon={<Star className="h-6 w-6 text-primary" />}
              title="Honest Reviews"
              description="Real ratings and reviews from customers who've used the services."
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6 text-primary" />}
              title="Save Time"
              description="Quickly find available painters that match your schedule and needs."
            />
            <FeatureCard
              icon={<DollarSign className="h-6 w-6 text-primary" />}
              title="Transparent Pricing"
              description="Clear estimates based on your specific project requirements."
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background relative">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
          <img 
            src="/lovable-uploads/bdd722ac-9f89-47c1-b465-bc989b51d903.png" 
            alt="Painting preparation with ladder" 
            className="h-full object-cover"
          />
        </div>
        <div className="container px-4 mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Read testimonials from satisfied customers and painters
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="I found an amazing painter within a day. The estimate calculator was spot on with the final price."
              author="Michael Johnson"
              role="Homeowner"
            />
            <TestimonialCard
              quote="As a professional painter, this platform has helped me grow my business and connect with clients I wouldn't have found otherwise."
              author="Sarah Williams"
              role="Professional Painter"
            />
            <TestimonialCard
              quote="The booking process was seamless and I appreciated being able to see the painter's previous work and reviews."
              author="David Thompson"
              role="Office Manager"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/80 -z-10" />
        <div className="absolute inset-0 -z-20">
          <img 
            src="/lovable-uploads/f4b62cc6-109b-4647-b004-0ebc8236d06d.png" 
            alt="Professional painters in white uniforms discussing project" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Transform Your Space?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Start by finding the perfect painter for your project today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="w-full sm:w-auto"
              onClick={() => handleNavigate("/find-painters")}
            >
              Find Painters Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-black hover:bg-white/10 w-full sm:w-auto"
              onClick={() => handleNavigate("/calculator")}
            >
              Get an Estimate
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
