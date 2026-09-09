"use client";

import { BarChart3, Eye, EyeOff, Megaphone, ScanEye } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { IconTile } from "@/components/ui/surface";
import { ListGroup, ListRow, Toggle } from "@/components/ui/list";
import { useBank } from "@/lib/store";

export default function PrivacySettingsPage() {
  const preferences = useBank((s) => s.preferences);
  const setPreference = useBank((s) => s.setPreference);
  const balanceHidden = useBank((s) => s.balanceHidden);
  const toggleBalanceHidden = useBank((s) => s.toggleBalanceHidden);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="Privacy"
        subtitle="Control what's visible and what we do with your data"
        back="/settings"
      />

      <div className="space-y-6">
        <ListGroup label="On screen">
          <ListRow
            icon={
              <IconTile tone="neutral">{balanceHidden ? <EyeOff /> : <Eye />}</IconTile>
            }
            title="Hide balances now"
            detail={
              balanceHidden
                ? "Amounts are masked across the app."
                : "Amounts are visible across the app."
            }
            value={
              <Toggle
                checked={balanceHidden}
                onChange={toggleBalanceHidden}
                label="Hide balances now"
              />
            }
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <EyeOff />
              </IconTile>
            }
            title="Hide balances on open"
            detail="Start every session with amounts masked until you reveal them."
            value={
              <Toggle
                checked={preferences.hideBalancesOnOpen}
                onChange={(v) => setPreference("hideBalancesOnOpen", v)}
                label="Hide balances on open"
              />
            }
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <ScanEye />
              </IconTile>
            }
            title="Private activity"
            detail="Keep merchant names out of notification previews on your lock screen."
            value={
              <Toggle
                checked={preferences.privateActivity}
                onChange={(v) => setPreference("privateActivity", v)}
                label="Private activity"
              />
            }
          />
        </ListGroup>

        <ListGroup label="Data">
          <ListRow
            icon={
              <IconTile tone="neutral">
                <BarChart3 />
              </IconTile>
            }
            title="Share app analytics"
            detail="Anonymous usage data that helps us fix problems faster. Never shared with advertisers."
            value={
              <Toggle
                checked={preferences.shareAnalytics}
                onChange={(v) => setPreference("shareAnalytics", v)}
                label="Share app analytics"
              />
            }
          />
          <ListRow
            icon={
              <IconTile tone="neutral">
                <Megaphone />
              </IconTile>
            }
            title="Offers & marketing"
            detail="Let us tell you about rates and products that suit how you bank."
            value={
              <Toggle
                checked={preferences.pushMarketing}
                onChange={(v) => setPreference("pushMarketing", v)}
                label="Offers and marketing"
              />
            }
          />
        </ListGroup>
      </div>

      <p className="mt-5 px-1 text-sm leading-relaxed text-ink-400">
        We never sell your personal information. Turning these off has no effect on your
        accounts, your rates or the service you receive. Full detail is in the privacy notice
        under Settings → Legal.
      </p>
    </div>
  );
}
