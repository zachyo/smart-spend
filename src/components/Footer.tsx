import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "API", href: "#api" },
        { name: "Integrations", href: "#integrations" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#about" },
        { name: "Blog", href: "#blog" },
        { name: "Careers", href: "#careers" },
        { name: "Contact", href: "#contact" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#docs" },
        { name: "Help Center", href: "#help" },
        { name: "Status", href: "#status" },
        { name: "Changelog", href: "#changelog" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy", href: "#privacy" },
        { name: "Terms", href: "#terms" },
        { name: "Security", href: "#security" },
        { name: "Compliance", href: "#compliance" }
      ]
    }
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-primary">SmartSpend</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                AI-powered expense tracking for modern businesses. 
                Automate your receipt processing and bank statement analysis.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary-light transition-colors cursor-pointer">
                  <span className="text-xs font-semibold">tw</span>
                </div>
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary-light transition-colors cursor-pointer">
                  <span className="text-xs font-semibold">li</span>
                </div>
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary-light transition-colors cursor-pointer">
                  <span className="text-xs font-semibold">gh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h4 className="font-semibold text-secondary">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 SmartSpend. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span>Made with ❤️ for businesses everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;