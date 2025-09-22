import receiptScanIcon from "@/assets/receipt-scan-icon.jpg";
import bankAnalysisIcon from "@/assets/bank-analysis-icon.jpg";
import aiCategorizeIcon from "@/assets/ai-categorize-icon.jpg";
import { CheckCircle, Zap, Shield, BarChart3 } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: receiptScanIcon,
      title: "AI Receipt Scanning",
      description: "Upload receipt images and let our AI extract merchant, amount, date, and items automatically.",
      benefits: ["99% accuracy rate", "Supports all receipt types", "Instant processing"]
    },
    {
      icon: bankAnalysisIcon,
      title: "Bank Statement Analysis",
      description: "Import CSV/PDF bank statements and get intelligent transaction parsing and categorization.",
      benefits: ["All major banks supported", "Automatic categorization", "Smart transaction matching"]
    },
    {
      icon: aiCategorizeIcon,
      title: "Smart Categorization",
      description: "Our AI learns your spending patterns and automatically categorizes expenses accurately.",
      benefits: ["Custom categories", "Machine learning", "85%+ accuracy"]
    }
  ];

  const stats = [
    { icon: Zap, value: "10s", label: "Average processing time" },
    { icon: CheckCircle, value: "99%", label: "Receipt extraction accuracy" },
    { icon: Shield, value: "100%", label: "Data security & privacy" },
    { icon: BarChart3, value: "85%", label: "Auto-categorization accuracy" }
  ];

  return (
    <section id="features" className="py-24 bg-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="section-title text-secondary">
            Everything you need for smart expense tracking
          </h2>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
            From receipt scanning to bank statement analysis, SmartSpend automates the entire expense tracking process.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="feature-card text-center group hover:scale-105 transition-transform">
              <div className="mb-6">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="w-16 h-16 mx-auto rounded-xl shadow-sm"
                />
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-4">{feature.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center justify-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-background rounded-2xl p-8 lg:p-12 shadow-soft">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold text-secondary mb-4">
              Built for accuracy and speed
            </h3>
            <p className="text-muted-foreground">
              Our AI-powered platform delivers exceptional performance across all key metrics.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-light rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-secondary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;