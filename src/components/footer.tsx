import Link from "next/link";
import { GraduationCap, ExternalLink, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card text-muted-foreground mt-auto text-xs">
      {/* College Info Section */}
      <div className="container px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-amber-300" />
              </div>
              <span className="font-bold text-base text-foreground">
                Pravara Rural Engineering College (PREC), Loni
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-md">
              Established in 1983 by Pravara Rural Education Society under the visionary leadership of Padmashri Dr. Vitthalrao Vikhe Patil. Approved by AICTE New Delhi, Affiliated to Savitribai Phule Pune University (SPPU), and Accredited by NAAC &lsquo;A&rsquo; Grade.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-primary">
              <a
                href="https://www.pravaraengg.org.in/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold hover:underline inline-flex items-center gap-1"
              >
                Visit Official College Website (pravaraengg.org.in)
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Engineering Departments
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Computer Engineering (CESA)</li>
              <li>Information Technology (ITSA)</li>
              <li>AI & Data Science (AI&DS)</li>
              <li>Automation & Robotics</li>
              <li>Electronics & Telecommunication</li>
              <li>Mechanical & Civil Engineering</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Campus Contact & Venue
            </h4>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>A/P Loni, Tal: Rahata, Dist: Ahilyanagar (Ahmednagar), Maharashtra - 413736</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>02422-273539 / 273459</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>principal@pravaraengg.org.in</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t bg-muted/30 py-4">
        <div className="container px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>
            &copy; {new Date().getFullYear()} Pravara Rural Engineering College, Loni. Internal & State Hackathon Platform.
          </p>
          <p className="text-muted-foreground">
            Empowering Rural & Technical Innovation Since 1983
          </p>
        </div>
      </div>
    </footer>
  );
}
