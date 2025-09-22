import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-24 bg-hero-gradient">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            Start your free trial today
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to automate your expenses?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Join thousands of businesses that trust SmartSpend to handle their expense tracking. 
              No credit card required.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4 group" asChild>
              <Link to="/auth">
                Start free trial
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4">
              Contact sales
            </Button>
          </div>

          {/* Features List */}
          <div className="pt-8">
            <p className="text-white/80 text-sm mb-4">Everything you need to get started:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/90">
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-2"></div>
                14-day free trial
              </div>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-2"></div>
                No setup fees
              </div>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-2"></div>
                Cancel anytime
              </div>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-2"></div>
                24/7 support
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;