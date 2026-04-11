import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { TerminalCard } from "@/components/ui/terminal-card";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Mikoshi",
  description: "Privacy Policy for Mikoshi.",
};

const privacySections = [
  {
    title: "1. Scope",
    body: [
      "This Privacy Policy describes how Mikoshi handles personal information and related data in connection with the Mikoshi website, application features, APIs, and connected tooling.",
      "This Privacy Policy is intended to reflect the current product. It covers account registration, third-party sign-in (currently Google and GitHub), Engram storage and sharing, API key usage, and related operational processing.",
    ],
  },
  {
    title: "2. Information We Collect",
    body: [
      "Mikoshi may collect account and profile information such as your name, username, email address, avatar image URL, account identifiers, and timestamps related to account creation or updates.",
      "When you sign in through a supported third-party provider (currently Google or GitHub), Mikoshi may receive information made available by that provider through OAuth, such as a provider-specific account identifier, email address, display name, profile image, and certain authentication-related metadata or tokens required to operate sign-in securely.",
      "Mikoshi also stores Engram-related information that you upload or create, including Engram names, descriptions, visibility settings, tags, plaintext persona files such as SOUL.md and IDENTITY.md, optional avatar URLs, encrypted memory bundle data, API key metadata, and API key last-used timestamps.",
      "In addition, Mikoshi may collect technical and operational information such as session records, request metadata, security logs, and information necessary to prevent abuse, diagnose failures, and maintain the service.",
    ],
  },
  {
    title: "3. How We Use Information",
    body: [
      "Mikoshi uses collected information to provide authentication, maintain accounts, operate Engram storage and sharing features, process encrypted memory uploads, manage API keys, and deliver the service you request.",
      "Mikoshi also uses information for security, fraud prevention, abuse detection, debugging, service improvement, customer or operational communications, and compliance with applicable law.",
      "If Mikoshi needs to use personal information for a purpose beyond what is reasonably related to these functions, it will do so only where permitted by applicable law or with any additional notice or consent required.",
    ],
  },
  {
    title: "4. Third-Party Sign-In Providers",
    body: [
      "Mikoshi currently supports Google sign-in and GitHub sign-in for account authentication. When you choose either of these providers, your use of that sign-in flow is also subject to that provider's own terms and privacy policy.",
      "Mikoshi uses information received from these providers to identify your account, help protect login security, and populate account data needed to operate the service. Mikoshi does not claim ownership of your provider accounts or data held by those providers outside the scope of the sign-in integration.",
      "If you revoke Mikoshi's access through a provider's account settings, authentication-related functions associated with that provider may stop working until you sign in again with that provider or with another linked provider.",
      "Mikoshi automatically links sign-in providers when they share the same verified email address, so signing in through Google and GitHub with the same email keeps a single Mikoshi account. If the email addresses differ, the providers are treated as separate Mikoshi accounts and their data is not shared. Mikoshi does not currently offer an automated way to merge two existing accounts.",
    ],
  },
  {
    title: "5. Engram Content and Visibility",
    body: [
      "Engram content may include personal or persona-related text that you choose to upload. You are responsible for deciding what to upload and for selecting the appropriate visibility setting.",
      "In Mikoshi's current model, certain persona files, including SOUL.md and IDENTITY.md, may be stored in plaintext and may be visible to other users depending on Engram visibility and access rules.",
      "Encrypted memory bundles are stored as opaque encrypted payloads. Mikoshi stores and transfers those payloads, but does not treat your own passphrase, encryption design, or decryption environment as something it controls.",
    ],
  },
  {
    title: "6. Sharing and Disclosure",
    body: [
      "Mikoshi may share information with service providers and infrastructure partners to the extent necessary to operate the service, including providers used for authentication, cloud hosting, database operation, storage, and security.",
      "This may include, for example, Google and GitHub for sign-in and identity-related processing and cloud storage providers used for user-uploaded assets such as avatars.",
      "Mikoshi may also disclose information where required by law, regulation, court order, governmental request, or where reasonably necessary to protect rights, security, or the integrity of the service.",
      "If Engram visibility is set to Public or Unlisted, information included in the accessible parts of that Engram may be viewed or cloned by other users according to the product behavior in effect at that time.",
    ],
  },
  {
    title: "7. Data Retention",
    body: [
      "Mikoshi retains personal information and related data for as long as reasonably necessary to operate the service, maintain security, resolve disputes, enforce terms, comply with legal obligations, or provide requested features.",
      "Retention periods may differ depending on the type of data, including account records, session records, API key metadata, Engram content, and security or operational logs.",
      "Even after deletion requests or account closure, certain data may be retained where continued retention is reasonably necessary for legal compliance, dispute handling, fraud prevention, or backup and recovery processes.",
    ],
  },
  {
    title: "8. Security",
    body: [
      "Mikoshi takes reasonable technical and organizational measures to protect personal information and service data from unauthorized access, loss, alteration, or disclosure.",
      "That said, no internet service is perfectly secure. Mikoshi cannot guarantee absolute security of data in transit, at rest, or in every operational environment.",
      "You are responsible for safeguarding your own account access, API keys, local backups, passphrases, and any plaintext data you choose to upload.",
    ],
  },
  {
    title: "9. International Transfers and Third-Party Services",
    body: [
      "Depending on the infrastructure and service providers used to operate Mikoshi, your information may be processed or stored outside Japan.",
      "When Mikoshi relies on third-party services, those providers may process information under their own legal and technical frameworks. Your use of linked or third-party services is also subject to those providers' own terms and privacy policies.",
    ],
  },
  {
    title: "10. Your Rights",
    body: [
      "Subject to applicable law, you may have rights to request access to, correction of, deletion of, suspension of use of, or other handling of your personal information.",
      "Where Mikoshi provides account settings or deletion tools, you may use those tools directly. In other cases, requests regarding disclosure, correction, deletion, suspension of use, or other handling of personal information may be submitted to support@ectplsm.com.",
    ],
  },
  {
    title: "11. Children's Information",
    body: [
      "If you are a minor under applicable law, use Mikoshi only with the consent of a parent, guardian, or other legal representative.",
      "If the operator becomes aware that personal information has been collected in a manner that violates applicable law regarding minors, Mikoshi may take reasonable steps to restrict access or delete the relevant information.",
    ],
  },
  {
    title: "12. Changes to This Privacy Policy",
    body: [
      "Mikoshi may update this Privacy Policy when reasonably necessary due to changes in law, business operations, security requirements, or service design.",
      "If material changes are made, Mikoshi may provide notice by posting the updated policy on the website or through another reasonable method. The updated version will apply from its stated effective date.",
    ],
  },
  {
    title: "13. Contact",
    body: [
      "For questions, complaints, or requests regarding this Privacy Policy or the handling of personal information, contact the Mikoshi operator at support@ectplsm.com.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <span className="text-brand">&gt;</span>
          <h1 className="text-xl font-bold">Privacy Policy</h1>
        </div>

        <div className="mb-6">
          <TerminalCard title="Overview" variant="brand">
            <div className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>
                Effective date:{" "}
                <span className="text-foreground">April 11, 2026</span>
              </p>
              <p>
                This Privacy Policy explains what information Mikoshi collects,
                how it uses that information, how it may be shared, and how
                long it may be retained.
              </p>
              <p>
                Mikoshi is an Engram storage and sharing service. The policy
                below is based on the product as currently implemented, not on
                imaginary future features.
              </p>
            </div>
          </TerminalCard>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {privacySections.map((section) => (
            <TerminalCard key={section.title} title={section.title}>
              <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>
                    {paragraph ===
                    "Mikoshi currently supports Google sign-in and GitHub sign-in for account authentication. When you choose either of these providers, your use of that sign-in flow is also subject to that provider's own terms and privacy policy." ? (
                      <>
                        Mikoshi currently supports Google sign-in and GitHub
                        sign-in for account authentication. When you choose
                        either of these providers, your use of that sign-in
                        flow is also subject to{" "}
                        <Link
                          href="https://policies.google.com/terms"
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand hover:underline"
                        >
                          Google&apos;s Terms of Service
                        </Link>
                        ,{" "}
                        <Link
                          href="https://policies.google.com/privacy"
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand hover:underline"
                        >
                          Google&apos;s Privacy Policy
                        </Link>
                        ,{" "}
                        <Link
                          href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand hover:underline"
                        >
                          GitHub&apos;s Terms of Service
                        </Link>
                        , and{" "}
                        <Link
                          href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand hover:underline"
                        >
                          GitHub&apos;s Privacy Statement
                        </Link>
                        .
                      </>
                    ) : paragraph ===
                      "For questions, complaints, or requests regarding this Privacy Policy or the handling of personal information, contact the Mikoshi operator at support@ectplsm.com." ? (
                      <>
                        For questions, complaints, or requests regarding this
                        Privacy Policy or the handling of personal information,
                        contact the Mikoshi operator at{" "}
                        <a
                          href="mailto:support@ectplsm.com"
                          className="rounded-sm border border-brand/40 bg-secondary/60 px-2 py-0.5 font-mono text-brand hover:underline"
                        >
                          support@ectplsm.com
                        </a>
                        .
                      </>
                    ) : (
                      paragraph
                    )}
                  </p>
                ))}
              </div>
            </TerminalCard>
          ))}
        </div>
      </main>
    </div>
  );
}
