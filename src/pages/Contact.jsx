import { Mail, Phone, Clock, MapPin, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <h1 className="text-2xl mb-6 font-semibold tracking-[0.1em] text-emerald-600 flex items-center gap-2">
        Contact Us
      </h1>

      <div className="space-y-5">
        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="font-semibold">Email Support</h3>
              <a
                href="mailto:alttoamal@gmail.com"
                className="font-medium text-primary hover:underline"
              >
                alttoamal@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-semibold">Phone Support</h3>
              <a
                href="tel:+919361249705"
                className="font-medium text-primary hover:underline"
              >
                +91 9361249705
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="font-semibold">Support Hours</h3>
              <p className="text-sm text-primary ">
                Monday - Saturday, 9:00 AM - 6:00 PM IST
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="font-semibold">Business Address</h3>
              <p className="text-sm text-primary ">Tamil Nadu, India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
