"use client";

import * as React from "react";
import {
  Bell,
  FileSignature,
  Headphones,
  Landmark,
  Lock,
  Palette,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { IconTile } from "@/components/ui/surface";
import { ListGroup, ListRow } from "@/components/ui/list";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useBank } from "@/lib/store";

const THEME_LABEL = { light: "Light", dark: "Dark", system: "System" } as const;

interface LegalDoc {
  id: string;
  title: string;
  updated: string;
  body: string[];
}

const LEGAL: LegalDoc[] = [
  {
    id: "terms",
    title: "Terms of service",
    updated: "Updated 1 January 2026",
    body: [
      "These terms govern your use of the Auremont Bank app and the deposit accounts, cards and payment services you access through it. By keeping an account open with us you agree to them, along with the fee schedule and rate sheet published for your account type.",
      "You are responsible for keeping your passcode and device secure and for the accuracy of the payment instructions you give us. We may decline, delay or reverse an instruction where we reasonably suspect fraud, where it would breach applicable law, or where the funding account has insufficient available funds.",
      "We may change these terms on thirty days' written notice, or immediately where a change is required by law or is in your favour. Continuing to use your account after a change takes effect means you accept it.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy notice",
    updated: "Updated 1 January 2026",
    body: [
      "Auremont Bank collects the information you give us when you open and use an account, together with transaction records, device and location signals used to detect fraud. We use it to run your accounts, to meet our legal obligations and to keep your money safe.",
      "We do not sell your personal information. We share it with service providers who process payments and print cards on our behalf, with credit reference and fraud prevention agencies, and with regulators and law enforcement where the law requires it.",
      "You can limit optional analytics and marketing at any time under Settings → Privacy. Limiting them never affects your account, your rates or the service you receive from us.",
    ],
  },
  {
    id: "deposit",
    title: "Deposit account agreement",
    updated: "Updated 1 January 2026",
    body: [
      "Deposits are held at Auremont Bank, Member FDIC, and are insured to the maximum permitted by law — currently $250,000 per depositor, per ownership category. Interest on savings accounts accrues daily on the closing balance and is credited on the last business day of each month.",
      "Funds from electronic deposits are generally available on the business day we receive them. Check deposits are subject to our funds availability policy, and we tell you the expected availability date when a hold applies.",
      "Either of us may close an account with reasonable notice. On closure we return the remaining balance, less any amounts you owe us, to an account in your name.",
    ],
  },
];

export default function SettingsPage() {
  const theme = useBank((s) => s.preferences.theme);
  const twoFactor = useBank((s) => s.preferences.twoFactor);
  const pushMarketing = useBank((s) => s.preferences.pushMarketing);
  const [doc, setDoc] = React.useState<LegalDoc | null>(null);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title="Settings" subtitle="How the app looks, alerts you and protects you" back="/profile" />

      <div className="space-y-6">
        <ListGroup label="General">
          <ListRow
            icon={
              <IconTile tone="neutral">
                <Palette />
              </IconTile>
            }
            title="Appearance"
            detail="Light, dark or match your device"
            value={<span className="text-sm font-medium text-ink-400">{THEME_LABEL[theme]}</span>}
            href="/settings/appearance"
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <Bell />
              </IconTile>
            }
            title="Notifications"
            detail="Choose what we alert you about"
            href="/settings/notifications"
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <Lock />
              </IconTile>
            }
            title="Privacy"
            detail={pushMarketing ? "Offers on · balance controls" : "Offers off · balance controls"}
            href="/settings/privacy"
          />
        </ListGroup>

        <ListGroup label="Protection">
          <ListRow
            icon={
              <IconTile tone="neutral">
                <ShieldCheck />
              </IconTile>
            }
            title="Security centre"
            detail={twoFactor ? "Two-step verification on" : "Two-step verification off"}
            href="/security"
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <Landmark />
              </IconTile>
            }
            title="Statements & documents"
            detail="Monthly statements and tax forms"
            href="/documents"
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <Headphones />
              </IconTile>
            }
            title="Support"
            detail="Help centre and conversations"
            href="/support"
          />
        </ListGroup>

        <ListGroup label="Legal">
          {LEGAL.map((d) => (
            <ListRow
              key={d.id}
              icon={
                <IconTile tone="neutral">
                  {d.id === "terms" ? (
                    <ScrollText />
                  ) : d.id === "privacy" ? (
                    <Lock />
                  ) : (
                    <FileSignature />
                  )}
                </IconTile>
              }
              title={d.title}
              detail={d.updated}
              onClick={() => setDoc(d)}
            />
          ))}
        </ListGroup>
      </div>

      <p className="mt-6 px-1 text-center text-2xs leading-relaxed text-ink-300">
        Auremont Bank · Member FDIC · Equal Housing Lender
        <br />
        Deposits insured to $250,000 per depositor, per ownership category.
      </p>

      <Sheet
        open={doc !== null}
        onClose={() => setDoc(null)}
        title={doc?.title ?? ""}
        description={doc?.updated}
      >
        <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
          {doc?.body.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-ink-500">
              {p}
            </p>
          ))}
        </div>
        <Button variant="secondary" block className="mt-4" onClick={() => setDoc(null)}>
          Close
        </Button>
      </Sheet>
    </div>
  );
}
