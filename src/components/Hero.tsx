import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroDashboard from "@/assets/hero-dashboard.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-light to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="hero-text text-secondary">
                AI-powered expense tracking 
                <span className="text-primary block">for modern businesses</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Automatically extract expense data from receipts and bank statements. 
                Get intelligent categorization and insights into your spending patterns.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="btn-primary text-lg px-8 py-4 group" asChild>
                <Link to="/auth">
                  Start free trial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" className="btn-secondary text-lg px-8 py-4 group">
                <Play className="mr-2 h-5 w-5" />
                Watch demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="pt-8">
              <p className="text-sm text-muted-foreground mb-4">Trusted by over 10,000+ businesses</p>
              <div className="flex items-center space-x-8 opacity-60">
                <div className="text-sm font-semibold">Freelancers</div>
                <div className="text-sm font-semibold">Small Business</div>
                <div className="text-sm font-semibold">Consultants</div>
                <div className="text-sm font-semibold">Agencies</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative lg:ml-8 animate-scale-in">
            <div className="relative">
              <img
                src={heroDashboard}
                alt="SmartSpend Dashboard"
                className="w-full h-auto rounded-2xl shadow-large"
              />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary rounded-full opacity-10 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;