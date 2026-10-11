import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Feedlyst",
  description: "Read the terms that apply when you access or use Feedlyst.",
  robots: { index: true, follow: true },
};

const sections = [
  {
    title: "1. Acceptance of these terms",
    paragraphs: [
      "These Terms of Service (“Terms”) govern your access to and use of Feedlyst (“Feedlyst,” “we,” “us,” or “our”). By creating an account or using the service, you agree to these Terms. If you do not agree, do not use Feedlyst."
    ],
  },
  {
    title: "2. The service",
    paragraphs: [
      "Feedlyst provides tools to connect supported sources, organize customer reviews and related content, and create website widgets. Features may change, be added, or be discontinued as the service evolves."
    ],
  },
  {
    title: "3. Your account",
    paragraphs: [
      "You must provide accurate information and keep your account credentials secure. You are responsible for activity under your account and for promptly notifying us if you believe your account has been accessed without authorization.",
      "If you connect a business or third-party account, you confirm that you have authority to access it and grant the permissions requested by Feedlyst."
    ],
  },
  {
    title: "4. Third-party services",
    paragraphs: [
      "Feedlyst may integrate with services operated by third parties, including Google. Those services are governed by their own terms, policies, availability, and technical limitations. We do not control third-party services and cannot guarantee their continued availability or the accuracy of data they provide.",
      "Your use of Google services through Feedlyst must comply with Google's applicable terms and policies. You can revoke Google access through your Google Account settings."
    ],
  },
  {
    title: "5. Acceptable use",
    paragraphs: [
      "You agree not to use Feedlyst for unlawful, deceptive, or fraudulent activity; attempt to access accounts, systems, or data without authorization; disrupt or compromise the service; upload content that infringes another person's rights; or use the service in a way that violates applicable laws or third-party terms.",
      "You are responsible for ensuring you have the rights and permissions needed for content you upload, display, or publish."
    ],
  },
  {
    title: "6. Your content and published widgets",
    paragraphs: [
      "As between you and Feedlyst, you remain responsible for content and business information you submit or choose to publish. You grant Feedlyst permission to host, process, and display that content only as reasonably necessary to operate the features you use.",
      "You are responsible for reviewing the content, permissions, and placement of widgets you publish on your websites, and for ensuring that your use complies with applicable laws and third-party platform policies."
    ],
  },
  {
    title: "7. Privacy",
    paragraphs: [
      "Our Privacy Policy explains how we handle information, including information from connected services. By using Feedlyst, you acknowledge that your information will be handled as described in that policy."
    ],
  },
  {
    title: "8. Availability and changes",
    paragraphs: [
      "We aim to keep Feedlyst available and reliable but do not guarantee uninterrupted or error-free operation. Maintenance, security issues, third-party outages, or other circumstances may affect availability. We may modify features when reasonably necessary."
    ],
  },
  {
    title: "9. Suspension and termination",
    paragraphs: [
      "You may stop using Feedlyst at any time. We may suspend or restrict access when reasonably necessary to protect the service or users, address suspected misuse, comply with law, or respond to a material violation of these Terms."
    ],
  },
  {
    title: "10. Disclaimers",
    paragraphs: [
      "To the extent permitted by applicable law, Feedlyst is provided on an “as is” and “as available” basis, without warranties of any kind, whether express or implied. We do not warrant that the service will always be available, error-free, or suitable for every purpose."
    ],
  },
  {
    title: "11. Limitation of liability",
    paragraphs: [
      "To the extent permitted by applicable law, Feedlyst will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of profits, revenue, data, or goodwill arising from use of the service. Nothing in these Terms limits liability that cannot legally be excluded."
    ],
  },
  {
    title: "12. Changes to these Terms",
    paragraphs: [
      "We may update these Terms from time to time. We will publish the current version on this page and update the date below. Where required by law, we will provide additional notice of material changes."
    ],
  },
  {
    title: "13. Contact",
    paragraphs: [
      "For questions about these Terms, contact the Feedlyst team using the support/contact details published on the official Feedlyst website."
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f6f8fc] px-4 py-10 text-[#10233f] sm:px-6 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#3867f4] transition hover:text-blue-800">
          <span aria-hidden="true">←</span> Back to Feedlyst
        </Link>
        <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:mt-8">
          <header className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white px-6 py-10 sm:px-10 sm:py-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3867f4]">Legal</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
            <p className="mt-3 text-sm text-slate-500">Last updated: October 11, 2026</p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Please read these terms carefully before creating a workspace or connecting an account to Feedlyst.
            </p>
          </header>
          <div className="space-y-9 px-6 py-8 sm:px-10 sm:py-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold tracking-tight text-[#10233f]">{section.title}</h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-slate-600 sm:text-base">{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <footer className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <span className="text-slate-500">© {new Date().getFullYear()} Feedlyst</span>
            <Link href="/privacy" className="font-semibold text-[#3867f4] hover:text-blue-800">Read Privacy Policy <span aria-hidden="true">→</span></Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
