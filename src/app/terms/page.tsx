import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { TerminalCard } from "@/components/ui/terminal-card";

export const metadata: Metadata = {
  title: "Terms of Service | Mikoshi",
  description: "Terms of Service for Mikoshi.",
};

const termSections = [
  {
    title: "1. Application",
    body: [
      "These Terms of Service govern your use of Mikoshi and all related functions provided through the website, APIs, and connected tooling.",
      "If Mikoshi publishes separate rules, policies, operational notices, or feature-specific conditions, those materials form part of these Terms to the extent they apply.",
    ],
  },
  {
    title: "2. Eligibility and Registration",
    body: [
      "You must provide accurate and current information when using Mikoshi. Mikoshi currently uses Google sign-in for authentication and may rely on information received through that authentication flow.",
      "If you are a minor under applicable law, you may use Mikoshi only with the consent of a parent, guardian, or other legal representative.",
      "If your registration or account information is false, outdated, incomplete, or misleading, Mikoshi may restrict or terminate your access.",
    ],
  },
  {
    title: "3. Account Management",
    body: [
      "You are responsible for managing your account, API keys, and any connected access credentials. Any action performed through your authenticated account will be treated as your action unless Mikoshi determines otherwise.",
      "If you suspect unauthorized use, leaked credentials, or compromise of an API key, revoke or rotate access immediately and take any other reasonable security measures.",
    ],
  },
  {
    title: "4. Service Scope",
    body: [
      "Mikoshi is a cloud service for storing, syncing, and sharing AI Engrams. In the current product, persona files such as SOUL.md and IDENTITY.md may be stored in plaintext, while memory data is expected to be encrypted client-side before upload.",
      "Mikoshi may add, remove, suspend, or change features, storage rules, visibility options, limits, or technical specifications when reasonably necessary for product improvement, maintenance, or security.",
    ],
  },
  {
    title: "5. User Content",
    body: [
      "You retain your rights in the Engrams, metadata, and other content you upload to Mikoshi.",
      "By uploading or submitting content, you grant Mikoshi the rights necessary to host, store, process, back up, transmit, display, and otherwise handle that content for the operation, maintenance, and improvement of the service.",
      "You represent and warrant that you have the lawful right to upload, process, share, and make available that content, and that the content does not infringe the rights of any third party.",
    ],
  },
  {
    title: "6. Privacy, Visibility, and Encryption",
    body: [
      "You are responsible for choosing the correct visibility setting for each Engram and for verifying what information is included before you upload. If you mark an Engram as Public or Unlisted, you understand that other users may access or clone it according to the product behavior in effect at that time.",
      "Memory bundles are treated as opaque encrypted payloads. Mikoshi stores and serves those payloads, but does not guarantee that your encryption design, key management, passphrase handling, or recovery process is sufficient for your use case.",
      "Handling of personal information through Mikoshi is also subject to the Privacy Policy and applicable Japanese law, including the Act on the Protection of Personal Information.",
    ],
  },
  {
    title: "7. API Keys and Automation",
    body: [
      "You may create API keys for automation. API keys are issued only for your own lawful use of Mikoshi and must be handled as confidential credentials.",
      "You must not use Mikoshi APIs to abuse the service, bypass rate limits or access controls, scrape data you are not allowed to access, or interfere with other users or system stability.",
    ],
  },
  {
    title: "8. Prohibited Conduct",
    body: [
      "You must not use Mikoshi to upload, store, share, or distribute unlawful content, malicious code, stolen data, personal information you have no right to process, or content that infringes another party's rights.",
      "You must not probe, attack, reverse engineer in an unlawful or abusive manner, overload, disrupt, or otherwise interfere with the service, its infrastructure, or other users' use of Mikoshi.",
      "You must not impersonate others, misrepresent ownership or authority, or use Mikoshi in a way that could create legal, security, or operational risk for the operator or third parties.",
    ],
  },
  {
    title: "9. Suspension, Restrictions, and Termination",
    body: [
      "Mikoshi may suspend, restrict, delete, or terminate access to all or part of the service without prior notice where reasonably necessary for maintenance, security, abuse prevention, legal compliance, or investigation of suspected violations of these Terms.",
      "Mikoshi may also remove or make inaccessible content that is unlawful, infringing, harmful, technically dangerous, or otherwise inappropriate for operation of the service.",
    ],
  },
  {
    title: "10. Availability, Backups, and Service Changes",
    body: [
      "Mikoshi is provided on an as-is and as-available basis. Uptime, continuity, accuracy, and permanent availability are not guaranteed.",
      "You are responsible for maintaining your own local backups. Mikoshi is not your only copy. If you treat it like one, that is on you.",
      "Mikoshi may suspend or discontinue all or part of the service when reasonably necessary for system maintenance, updates, security, force majeure, legal compliance, or operational reasons.",
    ],
  },
  {
    title: "11. Intellectual Property",
    body: [
      "The Mikoshi service, software, design, branding, and related materials remain the property of their respective owners or licensors.",
      "These Terms do not grant you any ownership rights in Mikoshi itself, except for the limited, non-exclusive right to use the service in accordance with these Terms.",
    ],
  },
  {
    title: "12. Disclaimer of Warranties",
    body: [
      "Mikoshi does not guarantee that the service will fit your specific purpose, remain continuously available, operate without interruption, be free of defects, or prevent loss, corruption, or leakage of data.",
      "Mikoshi also does not guarantee the legality, accuracy, completeness, safety, or usefulness of user-generated content, public Engrams, or cloned data made available through the service.",
    ],
  },
  {
    title: "13. Limitation of Liability",
    body: [
      "To the maximum extent permitted by applicable law, Mikoshi is not liable for indirect, incidental, special, consequential, or lost-profit damages arising from your use of the service.",
      "If Mikoshi is liable to you for damages in connection with the service, and that liability arises from ordinary negligence, Mikoshi's liability will be limited to direct and ordinary damages actually suffered by you, up to the greater of JPY 10,000 or the total amount of fees paid by you to Mikoshi for the relevant service during the 12 months immediately preceding the event giving rise to the claim.",
      "The limitations in this section do not apply to damages caused by Mikoshi's willful misconduct or gross negligence, or where such limitations are prohibited under applicable law, including mandatory provisions of Japanese consumer protection law.",
    ],
  },
  {
    title: "14. Anti-Social Forces",
    body: [
      "You represent that you are not, and are not involved with, organized crime groups, members of organized crime groups, quasi-members, affiliated companies, corporate racketeers, or other anti-social forces under Japanese practice and law.",
      "If Mikoshi reasonably determines that you have violated this representation, Mikoshi may terminate your use of the service immediately without liability, except where liability cannot be excluded under applicable law.",
    ],
  },
  {
    title: "15. Governing Law and Jurisdiction",
    body: [
      "These Terms are governed by the laws of Japan.",
      "Any dispute arising out of or in connection with Mikoshi or these Terms shall be subject to the exclusive jurisdiction of the Tokyo District Court as the court of first instance, unless otherwise required by applicable law.",
    ],
  },
  {
    title: "16. Changes to These Terms",
    body: [
      "Mikoshi may amend these Terms when reasonably necessary in light of changes to law, business conditions, service content, security requirements, or operational needs.",
      "If Mikoshi updates these Terms, it may provide notice by posting the revised version on the website or by another reasonable method. Continued use of Mikoshi after the revised Terms become effective means you accept the updated Terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <span className="text-brand">&gt;</span>
          <h1 className="text-xl font-bold">Terms of Service</h1>
        </div>

        <div className="mb-6">
          <TerminalCard title="Overview" variant="brand">
            <div className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>
                Effective date: <span className="text-foreground">April 5, 2026</span>
              </p>
              <p>
                These Terms of Service govern your use of Mikoshi, an Engram
                storage and sharing service. If you use Mikoshi, upload content,
                create API keys, or access owner-only features, these Terms
                apply to you.
              </p>
            </div>
          </TerminalCard>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {termSections.map((section) => (
            <TerminalCard key={section.title} title={section.title}>
              <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </TerminalCard>
          ))}
        </div>
      </main>
    </div>
  );
}
