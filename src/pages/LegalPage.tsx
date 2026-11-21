import { SeoHead } from '../components/SeoHead';

export function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen py-14">
      <SeoHead
        title="Privacy Policy"
        description="StudentExchange privacy policy explaining open browsing and inquiry data handling."
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h1 className="font-display text-3xl font-bold text-slate-950">Privacy Policy</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          StudentExchange is an open public educational and community platform. Visitors can browse learning resources, student projects, hardware exchange listings, competitions, and community events without creating an account or providing personal credentials.
        </p>
        <h2 className="font-display text-lg font-bold text-slate-900">Information You Voluntarily Submit</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          When you voluntarily submit a contact form, hardware seller inquiry, community interest note, or project submission, we store only the fields you enter (name, email, institution, and message/project details) solely to facilitate community coordination or review.
        </p>
        <h2 className="font-display text-lg font-bold text-slate-900">No Automated Tracking Walls</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Public visitors are never tracked behind mandatory registration gates, and payment processing is kept separate from public hardware browsing.
        </p>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="bg-white min-h-screen py-14">
      <SeoHead
        title="Terms and Conditions"
        description="StudentExchange terms of use for community listings, project showcases, and peer hardware exchange."
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h1 className="font-display text-3xl font-bold text-slate-950">Terms and Conditions</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          StudentExchange connects students with learning materials, peer-built projects, hardware listings, and community activities.
        </p>
        <h2 className="font-display text-lg font-bold text-slate-900">Hardware Exchange</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Hardware Exchange facilitates direct peer-to-peer communication between students regarding unused components. StudentExchange does not process payments or intermediate physical shipping or condition guarantees.
        </p>
        <h2 className="font-display text-lg font-bold text-slate-900">Community Attribution</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          AWS Student Builder activities listed on StudentExchange are independent, student-led community initiatives unless explicit organizational endorsement is stated.
        </p>
      </div>
    </div>
  );
}
