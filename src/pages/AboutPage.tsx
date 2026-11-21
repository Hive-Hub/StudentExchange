import { Link } from 'react-router-dom';
import { SeoHead } from '../components/SeoHead';

export function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      <SeoHead
        title="About StudentExchange"
        description="Learn about StudentExchange's mission to make technical learning, hardware exchange, and project discovery open to every student."
      />

      <section className="border-b border-slate-200 py-14 lg:py-20 bg-slate-50">
        <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14">
          <p className="text-sm font-semibold text-blue-700">About StudentExchange</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-950 tracking-tight mt-3">
            Learn. Build. Exchange. Grow.
          </h1>
          <p className="text-lg text-slate-600 mt-5 leading-relaxed">
            StudentExchange is an open public student technology platform designed around one simple observation: students learn fastest when quality educational resources, real project examples, spare hardware components, and welcoming builder communities are accessible without paywalls or mandatory accounts.
          </p>
        </div>
      </section>

      <section className="py-14 lg:py-16">
        <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-xl border border-slate-200 p-6">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Public Access Without Friction
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Every course directory, student project, hardware listing, and competition deadline on StudentExchange is immediately browsable without signup walls or login popups. Students can contact hardware sellers or submit projects directly.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-6">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Circular Campus Hardware
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Millions of Arduino boards, ESP32 kits, sensors, and Raspberry Pi modules sit idle in dorm drawers after semester labs end. Hardware Exchange lets students buy, sell, swap, or donate components directly with peers.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-6">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Student-Led Cloud Literacy
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Through the AWS Student Builder Community, student organizers run beginner-friendly workshops, architecture walkthroughs, and hands-on cloud labs as independent student-led community initiatives.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-6">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Transparent Demonstration Data
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Sample catalog listings and platform statistics are clearly labeled as demonstration data and are fully editable through the protected Content Admin console without modifying source code.
              </p>
            </div>
          </div>

          {/* Campus Leadership & AWS Student Builder Group */}
          <div className="rounded-2xl bg-slate-950 text-white border border-slate-800 p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-xs font-semibold text-orange-400">
                Campus Leadership · AWS Student Builder Group
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white mt-2">
                AWS Student Builder Group Leader — QIS College of Engineering and Technology
              </h2>
              <p className="text-sm text-slate-300 mt-2.5 leading-relaxed">
                Led by Sekhar Thirupathi, our student-led AWS Student Builder Group initiative connects learners through cloud workshops, AI sessions, peer collaboration, and community impact.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
              <img
                src="/assets/aistudio/Screenshot_2026-10-31_080355_0512b844.png"
                alt="Sekhar Thirupathi selected as an AWS Student Builder Group Leader at QIS College of Engineering and Technology — Learn, Build, Collaborate, Create Impact."
                referrerPolicy="no-referrer"
                className="w-full h-auto block"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Want to collaborate or list a campus chapter?
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Reach out to our coordinators or explore active opportunities across the platform.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                to="/contact"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/explore"
                className="px-5 py-2.5 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg"
              >
                Explore Platform
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
