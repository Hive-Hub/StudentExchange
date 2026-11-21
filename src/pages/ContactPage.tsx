import { useState, type FormEvent } from 'react';
import { CheckCircle2, Mail, MapPin, MessageSquare } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';

export function ContactPage() {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_type: 'general',
          sender_name: senderName,
          sender_email: senderEmail,
          institution,
          subject,
          message,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error || 'Could not send message.');
      } else {
        setSuccess(data.message || 'Message received.');
        setSenderName('');
        setSenderEmail('');
        setInstitution('');
        setSubject('');
        setMessage('');
      }
    } catch {
      setError('Network error while sending message.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 lg:py-16">
      <SeoHead
        title="Contact Us"
        description="Get in touch with StudentExchange coordinators for partnerships, campus clubs, or platform feedback."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight">
              Contact StudentExchange
            </h1>
            <p className="text-base text-slate-600 mt-3 leading-relaxed">
              Questions about listing campus hardware swap meets, partnering on student hackathons, or sharing open learning tracks? Send us a message directly.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-display text-sm font-bold text-slate-900">Community Desk</h2>
                <p className="text-sm text-slate-600 mt-0.5">hello@studentexchange.community</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-display text-sm font-bold text-slate-900">
                  AWS Student Builder Inquiries
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  Propose a student-led cloud study jam or technical workshop.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-display text-sm font-bold text-slate-900">Campus Network</h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  Open online directory with partner engineering chapters worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-9">
            {success ? (
              <div className="py-10 text-center space-y-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h2 className="font-display text-xl font-bold text-slate-900">Message Sent</h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">{success}</p>
                <button
                  type="button"
                  onClick={() => setSuccess('')}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-display text-xl font-bold text-slate-900">Send a Message</h2>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="you@university.edu"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      University / Organization
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Campus chapter / Resource suggestion"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your inquiry or proposal here..."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  {submitting ? 'Sending...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
