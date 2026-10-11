import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Feedlyst",
  description: "Learn how Feedlyst collects, uses, stores, and protects information, including data accessed through connected Google services.",
  robots: { index: true, follow: true },
};

const sections = [
  {
    title: "1. About this policy",
    paragraphs: [
      "This Privacy Policy explains how Feedlyst (“Feedlyst,” “we,” “us,” or “our”) handles information when you visit our website or use our services for organizing customer reviews and publishing review widgets.",
      "By using Feedlyst, you acknowledge that you have read this policy. If you do not agree with it, please discontinue use of the service."
    ],
  },
  {
    title: "2. Information we handle",
    paragraphs: [
      "Depending on the features you use, we may handle account details such as your name and email address, workspace and business details, content you choose to add, reviews and related business information retrieved from services you connect, and technical information needed to operate and secure the service.",
      "If you connect a Google account, Feedlyst may receive Google Business Profile information that you authorize us to access. The information available depends on the permissions you grant and the Google accounts and business profiles you can access."
    ],
  },
  {
    title: "3. How we use Google data",
    paragraphs: [
      "Feedlyst requests Google permissions to provide features you choose to use, such as connecting a business profile and displaying or organizing reviews within your workspace. We use Google data only in ways consistent with your authorization, this policy, and applicable Google API policies.",
      "We do not sell Google user data or use it for targeted advertising. We do not use Google user data to train generalized AI or machine-learning models. We do not share Google user data except as necessary to provide the requested service, for security or legal reasons, or as otherwise permitted by Google's applicable policies and your consent."
    ],
  },
  {
    title: "4. Other uses of information",
    paragraphs: [
      "We use information to provide and maintain Feedlyst, operate features you request, authenticate users, protect accounts and systems, troubleshoot issues, provide support, and meet legal obligations. We do not use information for purposes incompatible with the context in which it was collected."
    ],
  },
  {
    title: "5. Storage and security",
    paragraphs: [
      "We use reasonable technical and organizational measures designed to protect information from unauthorized access, loss, misuse, alteration, or disclosure. Sensitive credentials and tokens are intended to be protected with security controls.",
      "No method of transmission or electronic storage is completely secure, and we cannot guarantee absolute security."
    ],
  },
  {
    title: "6. Service providers and disclosures",
    paragraphs: [
      "We may use service providers to host, secure, and operate Feedlyst. They may process information on our behalf only as needed to provide their services. We may also disclose information when required by law, to protect rights and safety, or to respond to valid legal process.",
      "We do not sell personal information. Google user data is not shared except as described in this policy and as allowed by applicable Google policies."
    ],
  },
  {
    title: "7. Retention and deletion",
    paragraphs: [
      "We retain information for as long as needed to provide the service, maintain account records, resolve disputes, enforce agreements, and meet legal obligations. Retention periods depend on the type of information and the reason it was collected.",
      "You can disconnect a Google account through the available connection controls and can request deletion of your account and associated data. Disconnecting a provider does not automatically mean that data already stored in Feedlyst has been deleted. Deletion requests should be made using the support/contact channel provided by Feedlyst."
    ],
  },
  {
    title: "8. Your choices and third-party services",
    paragraphs: [
      "You choose whether to connect third-party accounts and which permissions to grant. You can also review or revoke Feedlyst's access from your Google Account security settings. Your use of Google and other third-party services is also subject to their own terms and privacy policies."
    ],
  },
  {
    title: "9. Children's privacy",
    paragraphs: [
      "Feedlyst is intended for business use and is not directed to children under 13. We do not knowingly collect personal information from children under 13."
    ],
  },
  {
    title: "10. Changes to this policy",
    paragraphs: [
      "We may update this policy from time to time. The updated version will be published on this page with a revised “Last updated” date. Your continued use of Feedlyst after an update takes effect is subject to the updated policy, as permitted by law."
    ],
  },
  {
    title: "11. Contact us",
    paragraphs: [
      "For questions about this policy or to request access to or deletion of your information, contact the Feedlyst team using the support/contact details published on the official Feedlyst website."
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f6f8fc] px-4 py-10 text-[#10233f] sm:px-6 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#3867f4] transition hover:text-blue-800">
          <span aria-hidden="true">←</span> Back to Feedlyst
        </Link>
        <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sm:mt-8">
          <header className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white px-6 py-10 sm:px-10 sm:py-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3867f4]">Legal</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
            <p className="mt-3 text-sm text-slate-500">Last updated: October 11, 2026</p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Your trust matters. This page explains how information is handled when you use Feedlyst and connect third-party services.
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
            <Link href="/terms" className="font-semibold text-[#3867f4] hover:text-blue-800">Read Terms of Service <span aria-hidden="true">→</span></Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
